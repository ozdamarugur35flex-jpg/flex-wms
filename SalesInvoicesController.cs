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
                        dbo.TRK(F.ACIKLAMA) as Description
                    FROM TBLFATUIRS F
                    LEFT JOIN TBLCASABIT C ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FTIRSIP = '3'
                    ORDER BY F.TARIH DESC";

                var invoices = await conn.QueryAsync(sql);
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        [HttpGet("{invoiceNo}")]
        public async Task<IActionResult> GetDetail(string invoiceNo)
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                var headerSql = @"
                    SELECT 
                        F.FATIRS_NO as InvoiceNo, F.TARIH as Date, F.CARI_KODU as CustomerCode,
                        dbo.TRK(C.CARI_ISIM) as CustomerName, F.PROJE_KODU as ProjectCode, 
                        dbo.TRK(F.ACIKLAMA) as Description, C.VERGI_DAIRESI as TaxOffice,
                        C.VERGI_NUMARASI as TaxNumber, dbo.TRK(C.ADRES) as Address
                    FROM TBLFATUIRS F
                    LEFT JOIN TBLCASABIT C ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FATIRS_NO = @invoiceNo AND F.FTIRSIP = '3'";

                var header = await conn.QueryFirstOrDefaultAsync<dynamic>(headerSql, new { invoiceNo });
                if (header == null) return NotFound(new { message = "İrsaliye bulunamadı." });

                var linesSql = @"
                    SELECT 
                        S.STOK_KODU as StockCode, 
                        dbo.TRK(SB.STOK_ADI) as StockName,
                        S.STHAR_GCMIK as Quantity, S.STHAR_NF as Price, S.STHAR_KDV as Vat,
                        (S.STHAR_GCMIK * S.STHAR_NF) as Total,
                        S.DEPO_KODU as WarehouseCode
                    FROM TBLSTHAR S
                    LEFT JOIN TBLSTSABIT SB ON SB.STOK_KODU = S.STOK_KODU
                    WHERE S.FISNO = @invoiceNo AND S.STHAR_FTIRSIP = '3'
                    ORDER BY S.SIRA";

                var items = await conn.QueryAsync(linesSql, new { invoiceNo });
                header.Items = items;

                return Ok(header);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Detay getirme hatası: " + ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SalesInvoiceRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
                return BadRequest(new { message = "Geçersiz istek verisi veya boş kalem listesi." });

            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                // 1. Proje Koduna göre KOD1 belirleme
                string stharKod1 = "";
                if (!string.IsNullOrEmpty(request.ProjectCode))
                {
                    if (request.ProjectCode.StartsWith("3")) stharKod1 = "F";
                    else if (request.ProjectCode.StartsWith("2")) stharKod1 = "S";
                    else if (request.ProjectCode.StartsWith("1")) stharKod1 = "M";
                }

                DateTime docDate = string.IsNullOrEmpty(request.Date) ? DateTime.Now : DateTime.Parse(request.Date);
                string cleanNo = new string((request.InvoiceNo ?? "").Replace("EIR", "").Where(char.IsDigit).ToArray());
                string finalInvoiceNo = "EIR" + cleanNo.PadLeft(12, '0');
                if (finalInvoiceNo.Length > 15) finalInvoiceNo = finalInvoiceNo.Substring(0, 15);

                string gibNo = "EIR" + docDate.Year.ToString() + finalInvoiceNo.Substring(finalInvoiceNo.Length - 9);

                decimal calculatedBrut = 0;
                decimal calculatedKdv = 0;
                var processedItems = new List<dynamic>();

                foreach (var item in request.Items)
                {
                    string stockInfoSql = "SELECT SATIS_FIAT1, KDV_ORANI FROM TBLSTSABIT WHERE STOK_KODU = @StockCode";
                    var stockInfo = await conn.QueryFirstOrDefaultAsync(stockInfoSql, new { item.StockCode }, transaction);

                    decimal realPrice = (stockInfo != null && Convert.ToDecimal(stockInfo.SATIS_FIAT1) > 0)
                                        ? Convert.ToDecimal(stockInfo.SATIS_FIAT1) : (item.Price > 0 ? item.Price : 0);
                    decimal realVatRate = stockInfo != null ? Convert.ToDecimal(stockInfo.KDV_ORANI) : (item.Vat > 0 ? item.Vat : 20);

                    decimal lineBrut = item.Quantity * realPrice;
                    decimal lineVat = lineBrut * (realVatRate / 100);

                    calculatedBrut += lineBrut;
                    calculatedKdv += lineVat;

                    processedItems.Add(new { item.StockCode, item.Quantity, Price = realPrice, VatRate = realVatRate });
                }

                decimal calculatedGenelToplam = calculatedBrut + calculatedKdv;

                // A. TBLFATUIRS (BAŞLIK)
                string sqlHeader = @"
                    INSERT INTO TBLFATUIRS (
                        SUBE_KODU, FTIRSIP, FATIRS_NO, CARI_KODU, TARIH, TIPI, 
                        BRUTTUTAR, GENELTOPLAM, KDV, ACIKLAMA, 
                        KOD1, KDV_DAHILMI, KAPATILMIS, C_YEDEK6, EBELGE,
                        ISLETME_KODU, KAYITTARIHI, KAYITYAPANKUL, GIB_FATIRS_NO, PROJE_KODU,
                        FATKALEM_ADEDI, ONAYTIPI, ONAYNUM, VADEBAZT,
                        ODEMETARIHI, SIPARIS_TEST, KS_KODU, HALFAT, UPDATE_KODU
                    ) VALUES (
                        0, '3', @InvoiceNo, @CustomerCode, @Date, 2, 
                        @BrutTutar, @GenelToplam, @KdvTutar, @Description, 
                        @Kod1, 'H', 'S', 'X', 1,
                        1, GETDATE(), 'FLEX_WMS', @GibInvoiceNo, @ProjectCode,
                        @ItemCount, 'A', 0, @Date,
                        @Date, @Date, '001', 0, 'F'
                    )";

                await conn.ExecuteAsync(sqlHeader, new
                {
                    InvoiceNo = finalInvoiceNo,
                    request.CustomerCode,
                    Date = docDate,
                    BrutTutar = calculatedBrut,
                    GenelToplam = calculatedGenelToplam,
                    KdvTutar = calculatedKdv,
                    Description = request.Description ?? "",
                    GibInvoiceNo = gibNo,
                    ProjectCode = request.ProjectCode,
                    ItemCount = processedItems.Count,
                    Kod1 = stharKod1
                }, transaction);

                // B. TBLFATUEK (EK BİLGİ)
                string sqlExtra = @"
                    INSERT INTO TBLFATUEK (
                        SUBE_KODU, FKOD, FATIRSNO, CKOD, SIRALAMATURU, LIMITALTITEVKIFAT
                    ) VALUES (
                        0, 3, @InvoiceNo, @CustomerCode, 'G', 0
                    )";
                await conn.ExecuteAsync(sqlExtra, new { InvoiceNo = finalInvoiceNo, request.CustomerCode }, transaction);

                // C. TBLSTHAR (KALEMLER)
                short sira = 1;
                foreach (var item in processedItems)
                {
                    string sqlItem = @"
                        INSERT INTO TBLSTHAR (
                            FISNO, STOK_KODU, STHAR_GCMIK, STHAR_GCKOD, 
                            STHAR_FTIRSIP, STHAR_HTUR, STHAR_TARIH, STHAR_NF, STHAR_BF,
                            DEPO_KODU, OLCUBR, SUBE_KODU, SIRA,
                            STHAR_BGTIP, STHAR_KOD1, STHAR_CARIKOD, CEVRIM, 
                            STHAR_KDV, LISTE_FIAT, STHAR_DOVTIP, STHAR_DOVFIAT, 
                            STHAR_ACIKLAMA, UPDATE_KODU, STHAR_TESTAR,
                            IRSALIYE_NO, IRSALIYE_TARIH
                        ) VALUES (
                            @InvoiceNo, @StockCode, @Quantity, 'C',
                            '3', 'H', @Date, @Price, @Price,
                            100, 1, 0, @Sira,
                            'I', @StharKod1, @CustomerCode, 0,
                            @VatRate, @Price, 0, 0, 
                            @CustomerCode, 'F', @Date,
                            @InvoiceNo, @Date
                        )";

                    await conn.ExecuteAsync(sqlItem, new
                    {
                        InvoiceNo = finalInvoiceNo,
                        item.StockCode,
                        item.Quantity,
                        Date = docDate,
                        item.Price,
                        Sira = sira++,
                        request.CustomerCode,
                        item.VatRate,
                        StharKod1 = stharKod1
                    }, transaction);
                }

                // D. TBLCAHAR (CARİ HAREKET)
                string sqlCari = @"
                    INSERT INTO TBLCAHAR (
                        SUBE_KODU, CARI_KOD, TARIH, VADE_TARIHI, BELGE_NO, ACIKLAMA, 
                        HKA, BORC, ALACAK, HAREKET_TURU, DOVIZ_TURU, DOVIZ_TUTAR, PROJE_KODU, UPDATE_KODU
                    ) VALUES (
                        0, @CustomerCode, @Date, @Date, @InvoiceNo, 'Satış İrsaliyesi', 
                        'A', @TotalAmount, 0, 'B', 0, 0, @ProjectCode, 'F'
                    )";

                await conn.ExecuteAsync(sqlCari, new
                {
                    request.CustomerCode,
                    Date = docDate,
                    InvoiceNo = finalInvoiceNo,
                    TotalAmount = calculatedGenelToplam,
                    ProjectCode = request.ProjectCode
                }, transaction);

                transaction.Commit();
                return Ok(new { success = true, message = "İrsaliye kaydedildi.", invoiceNo = finalInvoiceNo });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest(new { message = "Kayıt hatası: " + ex.Message });
            }
        }

        [HttpDelete("{invoiceNo}")]
        public async Task<IActionResult> Delete(string invoiceNo)
        {
            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();
            try
            {
                await conn.ExecuteAsync("DELETE FROM TBLSTHAR WHERE FISNO = @invoiceNo AND STHAR_FTIRSIP = '3'", new { invoiceNo }, transaction);
                await conn.ExecuteAsync("DELETE FROM TBLCAHAR WHERE BELGE_NO = @invoiceNo AND HAREKET_TURU = 'B'", new { invoiceNo }, transaction);
                await conn.ExecuteAsync("DELETE FROM TBLFATUEK WHERE FATIRSNO = @invoiceNo", new { invoiceNo }, transaction);
                await conn.ExecuteAsync("DELETE FROM TBLFATUIRS WHERE FATIRS_NO = @invoiceNo AND FTIRSIP = '3'", new { invoiceNo }, transaction);

                transaction.Commit();
                return Ok(new { success = true, message = "Kayıtlar silindi." });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest(new { message = "Silme hatası: " + ex.Message });
            }
        }

        [HttpGet("next-no")]
        public async Task<IActionResult> GetNextInvoiceNo()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"SELECT TOP 1 FATIRS_NO FROM TBLFATUIRS WHERE FTIRSIP = '3' AND FATIRS_NO LIKE 'EIR%' ORDER BY FATIRS_NO DESC";
                var lastNo = await conn.QueryFirstOrDefaultAsync<string>(sql);
                string prefix = "EIR";

                if (string.IsNullOrEmpty(lastNo)) return Ok(new { nextNo = prefix + "000000000001" });

                string numberPart = lastNo.Replace(prefix, "");
                if (long.TryParse(numberPart, out long currentNum))
                {
                    string nextNo = prefix + (currentNum + 1).ToString().PadLeft(12, '0');
                    return Ok(new { nextNo });
                }
                return Ok(new { nextNo = "" });
            }
            catch
            {
                return Ok(new { nextNo = "" });
            }
        }
    }

    public class SalesInvoiceRequest
    {
        public string? InvoiceNo { get; set; }
        public string? CustomerCode { get; set; }
        public string? Date { get; set; }
        public string? Description { get; set; }
        public string? ProjectCode { get; set; }
        public List<SalesInvoiceItemRequest>? Items { get; set; }
    }

    public class SalesInvoiceItemRequest
    {
        public string? StockCode { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Vat { get; set; }
    }
}
