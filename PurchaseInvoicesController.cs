using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace tuckapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PurchaseInvoicesController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        // 1. LİSTELEME
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"
                    SELECT 
                        RTRIM(F.FATIRS_NO) as InvoiceNo,
                        RTRIM(F.CARI_KODU) as CustomerCode,
                        ISNULL(dbo.TRK(C.CARI_ISIM), '') as CustomerName,
                        F.TARIH as Date,
                        ISNULL(F.BRUTTUTAR, 0) + ISNULL(F.KDV, 0) as TotalAmount,
                        ISNULL(F.FATIRS_NO, '') as GibInvoiceNo,
                        ISNULL(dbo.TRK(F.ACIKLAMA), '') as Description
                    FROM TBLSIPAMAS F WITH (NOLOCK)
                    LEFT JOIN TBLCASABIT C WITH (NOLOCK) ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FTIRSIP = '7' 
                    ORDER BY F.TARIH DESC";

                var invoices = await conn.QueryAsync(sql);
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 2. SIRADAKİ NUMARAYI GETİR
        [HttpGet("next-no")]
        public async Task<IActionResult> GetNextNo()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = "SELECT TOP 1 FATIRS_NO FROM TBLSIPAMAS WHERE FTIRSIP = '7' AND FATIRS_NO LIKE 'T%' ORDER BY FATIRS_NO DESC";
                var lastNo = await conn.QueryFirstOrDefaultAsync<string>(sql);

                string nextNo = "T00000000000001";

                if (!string.IsNullOrEmpty(lastNo))
                {
                    string numericPart = new string(lastNo.Where(char.IsDigit).ToArray());
                    if (long.TryParse(numericPart, out long currentNum))
                    {
                        nextNo = "T" + (currentNum + 1).ToString().PadLeft(14, '0');
                    }
                }

                return Ok(new { nextNo });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 2.5 DETAY GETİR (Listeden Seçince Ekranı Dolduran Kısım)
        [HttpGet("{invoiceNo}")]
        public async Task<IActionResult> GetDetail(string invoiceNo)
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                
                // Başlık Bilgisi
                string sqlHeader = @"
                    SELECT 
                        RTRIM(F.FATIRS_NO) as InvoiceNo,
                        RTRIM(F.CARI_KODU) as CustomerCode,
                        ISNULL(dbo.TRK(C.CARI_ISIM), '') as CustomerName,
                        F.TARIH as Date,
                        ISNULL(F.BRUTTUTAR, 0) + ISNULL(F.KDV, 0) as TotalAmount,
                        ISNULL(F.FATIRS_NO, '') as GibInvoiceNo,
                        ISNULL(dbo.TRK(F.ACIKLAMA), '') as Description,
                        F.TIPI as Type,
                        F.TARIH as DeliveryDate
                    FROM TBLSIPAMAS F WITH (NOLOCK)
                    LEFT JOIN TBLCASABIT C WITH (NOLOCK) ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FTIRSIP = '7' AND F.FATIRS_NO = @invoiceNo";

                var header = await conn.QueryFirstOrDefaultAsync<dynamic>(sqlHeader, new { invoiceNo });
                if (header == null) return NotFound(new { message = "İrsaliye bulunamadı." });

                // Satır Bilgileri
                string sqlItems = @"
                    SELECT 
                        RTRIM(H.STOK_KODU) as StockCode,
                        ISNULL(dbo.TRK(S.STOK_ADI), '') as StockName,
                        H.STHAR_GCMIK as Quantity,
                        H.STHAR_NF as Price,
                        H.STHAR_KDV as Vat,
                        RTRIM(H.DEPO_KODU) as WarehouseCode,
                        RTRIM(H.OLCUBR) as Unit
                    FROM TBLSIPATRA H WITH (NOLOCK)
                    LEFT JOIN TBLSTSABIT S WITH (NOLOCK) ON S.STOK_KODU = H.STOK_KODU
                    WHERE H.STHAR_FTIRSIP = '7' AND H.FATIRS_NO = @invoiceNo";

                var items = await conn.QueryAsync<dynamic>(sqlItems, new { invoiceNo });

                return Ok(new
                {
                    header.InvoiceNo,
                    header.CustomerCode,
                    header.CustomerName,
                    header.Date,
                    header.TotalAmount,
                    header.GibInvoiceNo,
                    header.Description,
                    header.ProjectCode,
                    header.DeliveryDate,
                    Type = header.Type == 2 ? "YURT İÇİ" : "YURT DIŞI",
                    Items = items
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 3. KAYDETME
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PurchaseInvoiceRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Geçersiz istek verisi." });

            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                var existing = await conn.QueryFirstOrDefaultAsync<int>(
                    "SELECT COUNT(1) FROM TBLSIPAMAS WHERE FATIRS_NO = @InvoiceNo AND FTIRSIP = '7'",
                    new { request.InvoiceNo }, transaction);

                if (existing > 0)
                {
                    return BadRequest(new { message = $"Hata: {request.InvoiceNo} numaralı sipariş zaten mevcut!" });
                }

                DateTime docDate = string.IsNullOrEmpty(request.Date) ? DateTime.Now : DateTime.Parse(request.Date);

                // Kalem bazlı KDV oranlarını çek ve toplamları hesapla
                decimal totalBrut = 0;
                decimal totalKdv = 0;
                var itemDetails = new List<(PurchaseInvoiceItemRequest item, decimal kdvRate)>();

                foreach (var item in request.Items)
                {
                    var kdvRate = await conn.QueryFirstOrDefaultAsync<decimal>(
                        "SELECT TOP 1 ISNULL(KDV_ORANI, 0) FROM TBLSTSABIT WHERE STOK_KODU = @StockCode",
                        new { item.StockCode }, transaction);

                    totalBrut += item.Quantity * item.Price;
                    totalKdv += Math.Round((item.Quantity * item.Price * kdvRate) / 100, 2);
                    itemDetails.Add((item, kdvRate));
                }

                // Detect MAS columns
                var masColsAll = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS')", transaction: transaction)).ToList();
                string masKayitKulCol = masColsAll.FirstOrDefault(c => new[] { "KAYITYAPANKUL", "KAYIT_YAPAN" }.Contains(c)) ?? "KAYIT_YAPAN";

                // A. TBLSIPAMAS (BAŞLIK)
                string sqlHeader = $@"
                    INSERT INTO TBLSIPAMAS (
                        SUBE_KODU, FTIRSIP, FATIRS_NO, CARI_KODU, TARIH, TIPI, 
                        BRUTTUTAR, KDV, ACIKLAMA, 
                        KDV_DAHILMI, ISLETME_KODU, KAYITTARIHI, {masKayitKulCol}
                    ) VALUES (
                        0, '7', @InvoiceNo, @CustomerCode, @Date, 2, 
                        @BrutTutar, @KdvTutar, @Description, 
                        'H', 0, GETDATE(), 'FLX'
                    )";

                await conn.ExecuteAsync(sqlHeader, new
                {
                    InvoiceNo = request.InvoiceNo,
                    CustomerCode = request.CustomerCode,
                    Date = docDate,
                    BrutTutar = totalBrut,
                    KdvTutar = totalKdv,
                    Description = request.Description
                }, transaction);

                // B. TBLSIPATRA (Kalem Bilgileri)
                short sira = 1;
                var traColsAll = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA')", transaction: transaction)).ToList();
                string traKayitKulCol = traColsAll.FirstOrDefault(c => new[] { "KAYITYAPANKUL", "KAYIT_YAPAN" }.Contains(c)) ?? "KAYIT_YAPAN";

                foreach (var detail in itemDetails)
                {
                    var item = detail.item;
                    var kdvRate = detail.kdvRate;

                    string sqlItem = $@"
                        INSERT INTO TBLSIPATRA (
                            SUBE_KODU, FATIRS_NO, STOK_KODU, STHAR_GCMIK, STHAR_GCMIK2,
                            STHAR_GCKOD, STHAR_HTUR, STHAR_FTIRSIP,
                            STHAR_TARIH, STHAR_NF, STHAR_BF, DEPO_KODU, OLCUBR,
                            SIRA, STHAR_KDV, {traKayitKulCol}
                        ) VALUES (
                            0, @InvoiceNo, @StockCode, @Quantity, @Quantity,
                            'G', 'H', '7',
                            @Date, @Price, @Price, 100, 1,
                            @Sira, @KdvRate, 'FLX'
                        )";

                    await conn.ExecuteAsync(sqlItem, new
                    {
                        InvoiceNo = request.InvoiceNo,
                        StockCode = item.StockCode,
                        Quantity = item.Quantity,
                        Date = docDate,
                        Price = item.Price,
                        Sira = sira++,
                        KdvRate = kdvRate
                    }, transaction);

                    // Eğer bir siparişe istinaden giriliyorsa, o siparişin gerçekleşen miktarını (GCMIK2) güncelle
                    if (!string.IsNullOrEmpty(item.OrderNo))
                    {
                        string updateOrderSql = @"
                            UPDATE TBLSIPATRA 
                            SET STHAR_GCMIK2 = ISNULL(STHAR_GCMIK2, 0) + @Quantity 
                            WHERE FATIRS_NO = @OrderNo AND STOK_KODU = @StockCode AND STHAR_FTIRSIP = '7'";

                        if (item.OrderLineNo > 0)
                        {
                            updateOrderSql += " AND SIRA = @OrderLineNo";
                        }
                        
                        await conn.ExecuteAsync(updateOrderSql, new { 
                            Quantity = item.Quantity, 
                            OrderNo = item.OrderNo, 
                            item.StockCode,
                            OrderLineNo = item.OrderLineNo
                        }, transaction);
                    }
                }

                transaction.Commit();
                return Ok(new { success = true, message = "Kayıt başarılı (Sipariş Bazlı İrsaliye)." });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }
    }

    public class PurchaseInvoiceRequest
    {
        public string InvoiceNo { get; set; }
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public string Date { get; set; }
        public string DeliveryDate { get; set; }
        public string? Description { get; set; }
        public string? ProjectCode { get; set; }
        public string? Type { get; set; }
        public decimal TotalAmount { get; set; }
        public List<PurchaseInvoiceItemRequest> Items { get; set; }
    }

    public class PurchaseInvoiceItemRequest
    {
        public string Id { get; set; }
        public string StockCode { get; set; }
        public string StockName { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; }
        public string WarehouseCode { get; set; }
        public string? OrderNo { get; set; }
        public int OrderLineNo { get; set; }
    }
}
