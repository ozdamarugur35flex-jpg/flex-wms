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
    public class ShipmentOrdersController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        // 1. Bekleyen ve Tamamlanan Sevk Emirlerini Getir (El terminali için oluşturulanlar)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                // FLEX_WMS_SEVK_EMRI tablosu olduğunu varsayıyoruz. 
                // Eğer yoksa, uygulama ilk çalıştığında oluşturulması için basit bir try-catch eklenebilir veya manuel oluşturulabilir.
                string createTableSql = @"
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FLEX_WMS_SEVK_EMRI' and xtype='U')
                    CREATE TABLE FLEX_WMS_SEVK_EMRI (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        SevkEmriNo VARCHAR(50),
                        SipInckeyNo INT,
                        SiparisNo VARCHAR(50),
                        CariKodu VARCHAR(50),
                        StokKodu VARCHAR(50),
                        Miktar DECIMAL(18,4),
                        Depo INT,
                        Durum VARCHAR(1) DEFAULT 'B', -- B: Bekliyor, T: Tamamlandı, I: İptal
                        KayitTarihi DATETIME DEFAULT GETDATE()
                    )";
                await conn.ExecuteAsync(createTableSql);

                string sql = @"
                    SELECT 
                        S.Id,
                        S.Durum,
                        S.SevkEmriNo,
                        S.SipInckeyNo,
                        S.Miktar,
                        S.Depo,
                        S.StokKodu,
                        ISNULL(ST.STOK_ADI, '') as StokAdi,
                        ISNULL(C.CARI_ISIM, '') as CariIsim
                    FROM FLEX_WMS_SEVK_EMRI S
                    LEFT JOIN TBLSTSABIT ST ON ST.STOK_KODU = S.StokKodu
                    LEFT JOIN TBLCASABIT C ON C.CARI_KOD = S.CariKodu
                    ORDER BY S.KayitTarihi DESC";

                var result = await conn.QueryAsync(sql);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 2. Açık Müşteri Siparişlerini Getir (Sevk Emri oluşturmak için)
        [HttpGet("open-orders")]
        public async Task<IActionResult> GetOpenOrders()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"
                    SELECT DISTINCT
                        RTRIM(M.FATIRS_NO) as OrderNo,
                        M.CARI_KODU as CustomerCode,
                        ISNULL(C.CARI_ISIM, '') as CustomerName,
                        M.TARIH as Date
                    FROM TBLSIPAMAS M
                    LEFT JOIN TBLCASABIT C ON C.CARI_KOD = M.CARI_KODU
                    INNER JOIN TBLSIPATRA T ON T.FISNO = M.FATIRS_NO AND T.STHAR_FTIRSIP = '6'
                    WHERE M.FTIRSIP = '6' 
                    AND (T.STHAR_GCMIK - ISNULL(T.FIRMA_DOVTUT, 0)) > 0";

                var result = await conn.QueryAsync(sql);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 3. Seçilen Siparişin Bekleyen Kalemlerini Getir
        [HttpGet("open-orders/{orderNo}/lines")]
        public async Task<IActionResult> GetOrderLines(string orderNo)
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"
                    SELECT 
                        T.INCKEYNO as Id,
                        T.STOK_KODU as StockCode,
                        ISNULL(ST.STOK_ADI, '') as StockName,
                        T.STHAR_GCMIK as OrderedQty,
                        ISNULL(T.FIRMA_DOVTUT, 0) as ShippedQty,
                        (T.STHAR_GCMIK - ISNULL(T.FIRMA_DOVTUT, 0)) as RemainingQty,
                        ISNULL(ST.OLCU_BR1, 'ADET') as Unit,
                        T.DEPO_KODU as WarehouseCode
                    FROM TBLSIPATRA T
                    LEFT JOIN TBLSTSABIT ST ON ST.STOK_KODU = T.STOK_KODU
                    WHERE RTRIM(T.FISNO) = RTRIM(@orderNo) 
                    AND T.STHAR_FTIRSIP = '6' 
                    AND (T.STHAR_GCMIK - ISNULL(T.FIRMA_DOVTUT, 0)) > 0";

                var result = await conn.QueryAsync(sql, new { orderNo });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 4. Sevk Emri Kaydet
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ShipmentOrderRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Geçersiz istek verisi." });

            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // Yeni Sevk Emri Numarası Üret
                string sevkEmriNo = "SEVK" + DateTime.Now.ToString("yyyyMMddHHmmss");

                foreach (var item in request.Items)
                {
                    string sql = @"
                        INSERT INTO FLEX_WMS_SEVK_EMRI 
                        (SevkEmriNo, SipInckeyNo, SiparisNo, CariKodu, StokKodu, Miktar, Depo, Durum)
                        VALUES 
                        (@SevkEmriNo, @SipInckeyNo, @SiparisNo, @CustomerCode, @StockCode, @Quantity, @WarehouseCode, 'B')";

                    await conn.ExecuteAsync(sql, new
                    {
                        SevkEmriNo = sevkEmriNo,
                        SipInckeyNo = item.Id, // TBLSIPATRA INCKEYNO
                        SiparisNo = request.OrderNo,
                        CustomerCode = request.CustomerCode,
                        StockCode = item.StockCode,
                        Quantity = item.ShipQty,
                        WarehouseCode = item.WarehouseCode ?? 0
                    }, transaction);
                }

                transaction.Commit();
                return Ok(new { success = true, message = "Sevk emri oluşturuldu.", sevkEmriNo = sevkEmriNo });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest(new { message = "Kayıt hatası: " + ex.Message });
            }
        }
    }

    public class ShipmentOrderRequest
    {
        public string? OrderNo { get; set; }
        public string? CustomerCode { get; set; }
        public List<ShipmentOrderItemRequest>? Items { get; set; }
    }

    public class ShipmentOrderItemRequest
    {
        public int Id { get; set; } // TBLSIPATRA INCKEYNO
        public string? StockCode { get; set; }
        public decimal ShipQty { get; set; }
        public int? WarehouseCode { get; set; }
    }
}
