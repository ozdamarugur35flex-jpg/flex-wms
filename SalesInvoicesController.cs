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
    public class SalesInvoicesController : ControllerBase
    {
        // Veritabanı bağlantı dizesi - Kendi sunucu bilgilerinize göre güncelleyin
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"
                    SELECT 
                        F.FATIRS_NO as InvoiceNo,
                        F.CARI_KODU as CustomerCode,
                        dbo.TRK(C.CARI_ISIM) as CustomerName,
                        F.TARIH as Date,
                        F.GENELTOPLAM as TotalAmount,
                        F.GIB_FATIRS_NO as GibInvoiceNo,
                        F.ACIKLAMA as Description,
                        F.PROJE_KODU as ProjectCode
                    FROM TBLFATUIRS F
                    LEFT JOIN TBLCASABIT C ON F.CARI_KODU = C.CARI_KODU
                    WHERE F.FTIRSIP = '2' -- Satış İrsaliyesi
                    ORDER BY F.TARIH DESC, F.FATIRS_NO DESC";
                
                var result = await conn.QueryAsync<dynamic>(sql);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("next-no")]
        public async Task<IActionResult> GetNextInvoiceNo()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                // EIR ile başlayan en son numarayı bul (Netsis standart formatı: EIR + 12 hane)
                string sql = "SELECT TOP 1 FATIRS_NO FROM TBLFATUIRS WHERE FATIRS_NO LIKE 'EIR%' ORDER BY FATIRS_NO DESC";
                var lastNo = await conn.QueryFirstOrDefaultAsync<string>(sql);

                if (string.IsNullOrEmpty(lastNo))
                {
                    return Ok(new { nextNo = "EIR000000000001" });
                }

                // EIR kısmını ayır ve sayısal kısmı artır
                string prefix = "EIR";
                string numericPart = lastNo.Substring(3);
                if (long.TryParse(numericPart, out long currentNumber))
                {
                    string nextNo = prefix + (currentNumber + 1).ToString().PadLeft(12, '0');
                    return Ok(new { nextNo = nextNo });
                }

                return Ok(new { nextNo = "EIR000000000001" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalesInvoiceRequest request)
        {
            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var trans = conn.BeginTransaction();

            try
            {
                // 1. Proje Koduna göre STHAR_KOD1 belirleme (Netsis mantığı)
                string stharKod1 = "";
                if (!string.IsNullOrEmpty(request.ProjectCode))
                {
                    if (request.ProjectCode.StartsWith("3")) stharKod1 = "F";
                    else if (request.ProjectCode.StartsWith("2")) stharKod1 = "S";
                    else if (request.ProjectCode.StartsWith("1")) stharKod1 = "M";
                }

                // 2. TBLFATUIRS (Başlık) Kaydı
                string sqlHeader = @"
                    INSERT INTO TBLFATUIRS (
                        FTIRSIP, FATIRS_NO, CARI_KODU, TARIH, GENELTOPLAM, 
                        GIB_FATIRS_NO, ACIKLAMA, PROJE_KODU, UPDATE_KODU
                    ) VALUES (
                        '2', @InvoiceNo, @CustomerCode, @Date, @TotalAmount,
                        @GibInvoiceNo, @Description, @ProjectCode, 'F'
                    )";
                
                await conn.ExecuteAsync(sqlHeader, request, trans);

                // 3. TBLSTHAR (Kalemler) Kaydı
                // NOT: STHAR_GCTUT kolonu 'Invalid column name' hatası verdiği için kaldırıldı.
                // Netsis bu tutarı genellikle STHAR_GCMIK * STHAR_NF üzerinden kendisi hesaplar veya farklı bir kolonda tutar.
                string sqlItem = @"
                    INSERT INTO TBLSTHAR (
                        STHAR_ACIKLAMA, STHAR_GCMIK, STHAR_NF, STHAR_KDV, 
                        STHAR_TARIH, STHAR_CARIKOD, STHAR_STOKKODU, FISNO, 
                        STHAR_FTIRSIP, STHAR_GCMIK2, STHAR_GCKOD, 
                        STHAR_BGTIP, STHAR_KOD1, DEPO_KODU, STHAR_HTUR, UPDATE_KODU
                    ) VALUES (
                        @Description, @Quantity, @Price, @Vat,
                        @Date, @CustomerCode, @StockCode, @InvoiceNo,
                        '2', 0, 'C',
                        'I', @StharKod1, 100, 'J', 'F'
                    )";

                foreach (var item in request.Items)
                {
                    var itemParams = new {
                        Description = request.Description ?? "",
                        Quantity = item.Quantity,
                        Price = item.Price,
                        Vat = item.Vat,
                        Date = request.Date,
                        CustomerCode = request.CustomerCode,
                        StockCode = item.StockCode,
                        InvoiceNo = request.InvoiceNo,
                        StharKod1 = stharKod1
                    };
                    await conn.ExecuteAsync(sqlItem, itemParams, trans);
                }

                // 4. TBLCAHAR (Cari Hareket) Kaydı (Opsiyonel ama Netsis bütünlüğü için önerilir)
                string sqlCahar = @"
                    INSERT INTO TBLCAHAR (
                        CARI_KOD, TARIH, SERI_NO, BELGE_NO, VADE_TARIHI,
                        BORC, ALACAK, ACIKLAMA, CARI_MODUL, CARI_TIPI, UPDATE_KODU
                    ) VALUES (
                        @CustomerCode, @Date, 'EIR', @InvoiceNo, @Date,
                        @TotalAmount, 0, @Description, '7', 'I', 'F'
                    )";
                await conn.ExecuteAsync(sqlCahar, request, trans);

                trans.Commit();
                return Ok(new { success = true, invoiceNo = request.InvoiceNo });
            }
            catch (Exception ex)
            {
                if (trans.Connection != null) trans.Rollback();
                return BadRequest(new { message = "Kayıt hatası: " + ex.Message });
            }
        }

        [HttpDelete("{invoiceNo}")]
        public async Task<IActionResult> Delete(string invoiceNo)
        {
            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var trans = conn.BeginTransaction();

            try
            {
                // Netsis'te bir irsaliyeyi silmek için ilgili tüm tablolardan temizlemek gerekir
                await conn.ExecuteAsync("DELETE FROM TBLFATUIRS WHERE FATIRS_NO = @invoiceNo AND FTIRSIP = '2'", new { invoiceNo }, trans);
                await conn.ExecuteAsync("DELETE FROM TBLSTHAR WHERE FISNO = @invoiceNo AND STHAR_FTIRSIP = '2'", new { invoiceNo }, trans);
                await conn.ExecuteAsync("DELETE FROM TBLCAHAR WHERE BELGE_NO = @invoiceNo AND CARI_MODUL = '7'", new { invoiceNo }, trans);
                
                trans.Commit();
                return Ok(new { success = true, message = "İrsaliye silindi." });
            }
            catch (Exception ex)
            {
                if (trans.Connection != null) trans.Rollback();
                return BadRequest(new { message = "Silme hatası: " + ex.Message });
            }
        }
    }

    public class SalesInvoiceRequest
    {
        public string InvoiceNo { get; set; }
        public string CustomerCode { get; set; }
        public DateTime Date { get; set; }
        public decimal TotalAmount { get; set; }
        public string GibInvoiceNo { get; set; }
        public string Description { get; set; }
        public string ProjectCode { get; set; }
        public List<InvoiceItemRequest> Items { get; set; }
    }

    public class InvoiceItemRequest
    {
        public string StockCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Vat { get; set; }
    }
}
