using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlexWms.Api.Controllers
{
    [ApiController]
    [Route("purchaseorders")]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                
                // Detect order number column
                string headerNoCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')") ?? "FISNO";
                string itemNoCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')") ?? "FISNO";
                bool hasSubeKodu = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'SUBE_KODU' AND (object_id = OBJECT_ID('TBLSIPAMAS') OR object_id = OBJECT_ID('TBLSIPATRA'))") > 0;

                // FTIRSIP detection: Try '2', then check what exists if nothing found
                string ftirsipFilter = "RTRIM(D.STHAR_FTIRSIP) = '2'";
                var checkCount = await conn.QueryFirstOrDefaultAsync<int>($"SELECT COUNT(*) FROM TBLSIPATRA WITH(NOLOCK) WHERE RTRIM(STHAR_FTIRSIP) = '2' AND RTRIM(STHAR_GCKOD) = 'G'");
                if (checkCount == 0) {
                    // If no '2' found, check if there are ANY records and what their FTIRSIP is
                    var altFtirsip = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 STHAR_FTIRSIP FROM TBLSIPATRA WITH(NOLOCK) WHERE RTRIM(STHAR_GCKOD) = 'G' ORDER BY STHAR_TARIH DESC");
                    if (!string.IsNullOrEmpty(altFtirsip)) {
                        ftirsipFilter = $"RTRIM(D.STHAR_FTIRSIP) = '{altFtirsip}'";
                    }
                }

                string sql = $@"
                    SELECT 
                        RTRIM(D.{itemNoCol}) + '-' + CAST(D.SIRA as varchar) as Id,
                        RTRIM(D.{itemNoCol}) as OrderNo,
                        RTRIM(D.STOK_KODU) as StockCode,
                        ISNULL(S.STOK_ADI, '') as StockName,
                        ISNULL(C.CARI_ISIM, '') as SupplierName,
                        ISNULL(C.CARI_ISIM, '') as CustomerName,
                        RTRIM(H.CARI_KODU) as CustomerCode,
                        H.TARIH as [Date],
                        ISNULL(H.ACIKLAMA, 'MERKEZ') as BranchName,
                        D.STHAR_GCMIK as OrderedQty,
                        ISNULL(D.STHAR_GCMIK2, 0) as ReceivedQty,
                        (D.STHAR_GCMIK - ISNULL(D.STHAR_GCMIK2, 0)) as Balance,
                        ISNULL(D.STHAR_NF, 0) as LastPurchasePrice,
                        ISNULL(C.CARI_ISIM, '') as LastSupplier,
                        RTRIM(D.OLCUBR) as Unit,
                        (D.STHAR_GCMIK * ISNULL(D.STHAR_NF, 0)) as TotalAmount,
                        CASE 
                            WHEN ISNULL(D.STHAR_GCMIK2, 0) = 0 THEN 'Açık'
                            WHEN ISNULL(D.STHAR_GCMIK2, 0) < D.STHAR_GCMIK THEN 'Kısmi Teslim'
                            ELSE 'Kapalı'
                        END as Status,
                        0 as IsRevised
                    FROM TBLSIPATRA D WITH(NOLOCK)
                    JOIN TBLSIPAMAS H WITH(NOLOCK) ON RTRIM(H.{headerNoCol}) = RTRIM(D.{itemNoCol}) 
                        AND RTRIM(H.FTIRSIP) = RTRIM(D.STHAR_FTIRSIP)
                        {(hasSubeKodu ? "AND H.SUBE_KODU = D.SUBE_KODU" : "")}
                    LEFT JOIN TBLSTSABIT S WITH(NOLOCK) ON S.STOK_KODU = D.STOK_KODU
                    LEFT JOIN TBLCASABIT C WITH(NOLOCK) ON C.CARI_KOD = H.CARI_KODU
                    WHERE {ftirsipFilter} AND RTRIM(D.STHAR_GCKOD) = 'G'
                    ORDER BY H.TARIH DESC, D.{itemNoCol} DESC";

                var orders = await conn.QueryAsync(sql);
                
                // Her sipariş için boş bir teslimat geçmişi dönelim (veya varsa tablodan çekelim)
                var result = orders.Select(o => new {
                    o.Id,
                    o.OrderNo,
                    o.StockCode,
                    o.StockName,
                    o.SupplierName,
                    o.CustomerName,
                    o.CustomerCode,
                    o.Date,
                    o.BranchName,
                    o.OrderedQty,
                    o.ReceivedQty,
                    o.Balance,
                    o.LastPurchasePrice,
                    o.LastSupplier,
                    o.Unit,
                    o.TotalAmount,
                    o.Status,
                    o.IsRevised,
                    Deliveries = new List<object>() 
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] OrderReceiveDto dto)
        {
            if (dto == null) return BadRequest("Veri bulunamadı.");

            try
            {
                using var conn = new SqlConnection(_connStr);
                await conn.OpenAsync();

                // Id formatımız: OrderNo-Sira
                var parts = dto.OrderNo.Split('-');
                if (parts.Length < 2) return BadRequest("Geçersiz Sipariş ID");

                string fisNo = parts[0];
                string sira = parts[1];

                // Detect order number column
                string headerNoCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')") ?? "FISNO";
                string itemNoCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')") ?? "FISNO";

                // 1. Sipariş detaylarını alalım
                var orderLine = await conn.QueryFirstOrDefaultAsync($@"
                    SELECT D.*, H.CARI_KODU, H.DEPO_KODU 
                    FROM TBLSIPATRA D WITH(NOLOCK)
                    JOIN TBLSIPAMAS H WITH(NOLOCK) ON RTRIM(H.{headerNoCol}) = RTRIM(D.{itemNoCol}) AND H.FTIRSIP = D.STHAR_FTIRSIP
                    WHERE D.{itemNoCol} = @FisNo AND D.SIRA = @Sira AND D.STHAR_FTIRSIP = '2'", new { FisNo = fisNo, Sira = sira });

                if (orderLine == null) return BadRequest("Sipariş satırı bulunamadı.");

                using var trans = conn.BeginTransaction();
                try {
                    // 2. Yeni İrsaliye Numarası Üret (I ile başlayan)
                    string lastIrsNo = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 FISNO FROM TBLSTHAR WHERE STHAR_FTIRSIP = '1' AND STHAR_GCKOD = 'G' AND FISNO LIKE 'IRS%' ORDER BY FISNO DESC", null, trans);
                    string nextIrsNo = "IRS000000000001";
                    if (!string.IsNullOrEmpty(lastIrsNo)) {
                        if (long.TryParse(lastIrsNo.Substring(3), out long val))
                            nextIrsNo = "IRS" + (val + 1).ToString().PadLeft(12, '0');
                    }

                    // 3. TBLSTHAR'a İrsaliye Kaydı At (Alış İrsaliyesi)
                    string sqlIrs = @"
                        INSERT INTO TBLSTHAR (STOK_KODU, STHAR_TARIH, STHAR_NF, STHAR_GCMIK, STHAR_GCTIP, STHAR_GCKOD, FISNO, STHAR_FTIRSIP, STHAR_KDV, CARI_KODU, DEPO_KODU, KAYIT_YAPAN, KAYIT_TARIHI)
                        VALUES (@StockCode, @Date, @Price, @Qty, 'A', 'G', @FisNo, '1', @Kdv, @CustomerCode, @Depo, 'FLEX_IRS', @RegDate)";

                    await conn.ExecuteAsync(sqlIrs, new {
                        StockCode = orderLine.STOK_KODU,
                        Date = DateTime.Now,
                        Price = orderLine.STHAR_NF,
                        Qty = dto.ReceivedQuantity,
                        FisNo = nextIrsNo,
                        Kdv = orderLine.STHAR_KDV,
                        CustomerCode = orderLine.CARI_KODU,
                        Depo = orderLine.DEPO_KODU ?? 100,
                        RegDate = DateTime.Now
                    }, trans);

                    // 4. Sipariş satırını güncelle (Gelen miktar kümülatif artar)
                    string sqlUpdate = $@"
                        UPDATE TBLSIPATRA 
                        SET STHAR_GCMIK2 = ISNULL(STHAR_GCMIK2, 0) + @ReceivedQty 
                        WHERE {itemNoCol} = @FisNo AND SIRA = @Sira AND STHAR_FTIRSIP = '2'";

                    await conn.ExecuteAsync(sqlUpdate, new { 
                        ReceivedQty = dto.ReceivedQuantity,
                        FisNo = fisNo,
                        Sira = sira
                    }, trans);

                    trans.Commit();
                    return Ok(new { success = true, irsNo = nextIrsNo });
                }
                catch (Exception ex) {
                    trans.Rollback();
                    return BadRequest(new { message = "İrsaliye oluşturma hatası: " + ex.Message });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class OrderReceiveDto
    {
        public string OrderNo { get; set; }
        public decimal ReceivedQuantity { get; set; }
        public string Date { get; set; }
        public string ReceivedBy { get; set; }
    }
}
