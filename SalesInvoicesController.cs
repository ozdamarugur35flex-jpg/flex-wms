using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Dynamic;
using System.Runtime.InteropServices;
using NetOpenX50;
using System.IO;

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
                        RTRIM(F.FATIRS_NO) as InvoiceNo,
                        F.CARI_KODU as CustomerCode,
                        ISNULL(C.CARI_ISIM, '') as CustomerName,
                        F.TARIH as Date,
                        F.GENELTOPLAM as TotalAmount,
                        F.GIB_FATIRS_NO as GibInvoiceNo,
                        ISNULL(F.ACIKLAMA, '') as Description
                    FROM TBLFATUIRS F
                    LEFT JOIN TBLCASABIT C ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FTIRSIP IN ('1', '3')
                    ORDER BY F.TARIH DESC";

                var invoices = await conn.QueryAsync(sql);
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        [HttpGet("debug-columns")]
        public async Task<IActionResult> DebugColumns()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sqlC = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLCASABIT'";
                var columnsC = await conn.QueryAsync<string>(sqlC);
                
                string sqlF = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLFATUIRS'";
                var columnsF = await conn.QueryAsync<string>(sqlF);
                
                return Ok(new { TBLCASABIT = columnsC, TBLFATUIRS = columnsF });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{invoiceNo}/generate-ewaybill-draft")]
        public IActionResult GenerateEWaybillDraft(string invoiceNo)
        {
            dynamic kernel = new Kernel();
            dynamic sirket = null;
            dynamic eBelge = null;

            try
            {
                sirket = kernel.yeniSirket(TVTTipi.vtMSSQL, "MERACK26", "TEMELSET_USER", "TEMELSET_PASS", "NET_USER", "NET_PASS", 0);
                eBelge = kernel.yeniEBelge(sirket, TEBelgeTip.ebtEIrs);

                // 1. E-İrsaliye Kaydı Oluştur (Taslak olarak Netsis'e kaydeder)
                try 
                { 
                    eBelge.EIrsaliyeOlustur(invoiceNo); 
                } 
                catch (Exception ex) 
                {
                    Console.WriteLine("E-İrsaliye oluşturma uyarısı/hatası: " + ex.Message);
                }

                // 2. E-İrsaliye Görüntüleme (HTML dosyasını oluşturur)
                string tempPath = Path.Combine(Path.GetTempPath(), "NetsisEWaybill");
                if (!Directory.Exists(tempPath)) Directory.CreateDirectory(tempPath);

                string gibNo = "";
                using (var conn = new SqlConnection(_connStr))
                {
                    gibNo = conn.QueryFirstOrDefault<string>("SELECT GIB_FATIRS_NO FROM TBLFATUIRS WHERE FATIRS_NO = @invoiceNo AND FTIRSIP = '3'", new { invoiceNo });
                }

                if (string.IsNullOrEmpty(gibNo)) gibNo = invoiceNo;

                string htmlFilePath = eBelge.EBelgeGoruntuleme(gibNo, tempPath, TEBelgeBoxType.ebOutbox, "");

                if (System.IO.File.Exists(htmlFilePath))
                {
                    string htmlContent = System.IO.File.ReadAllText(htmlFilePath);
                    return Ok(new { success = true, html = htmlContent, gibNo = gibNo });
                }

                return BadRequest(new { success = false, message = "Görüntüleme dosyası oluşturulamadı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "NetOpenX Hatası: " + ex.Message });
            }
            finally
            {
                if (eBelge != null) Marshal.ReleaseComObject(eBelge);
                if (sirket != null) Marshal.ReleaseComObject(sirket);
                if (kernel != null)
                {
                    try { kernel.serbestBirak(); } catch { }
                    Marshal.ReleaseComObject(kernel);
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
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
                        RTRIM(F.FATIRS_NO) as InvoiceNo, F.TARIH as Date, F.CARI_KODU as CustomerCode,
                        ISNULL(C.CARI_ISIM, '') as CustomerName, F.PROJE_KODU as ProjectCode, 
                        ISNULL(F.ACIKLAMA, '') as Description,
                        F.GIB_FATIRS_NO as GibInvoiceNo,
                        C.*
                    FROM TBLFATUIRS F
                    LEFT JOIN TBLCASABIT C ON C.CARI_KOD = F.CARI_KODU
                    WHERE RTRIM(F.FATIRS_NO) = RTRIM(@invoiceNo) AND F.FTIRSIP IN ('1', '3')";

                var header = await conn.QueryFirstOrDefaultAsync<dynamic>(headerSql, new { invoiceNo });
                if (header == null) return NotFound(new { message = "İrsaliye bulunamadı." });

                // Convert to ExpandoObject to add properties and safely extract fields
                var headerDict = (IDictionary<string, object>)new ExpandoObject();
                var rawHeader = (IDictionary<string, object>)header;
                
                foreach (var prop in rawHeader)
                {
                    headerDict[prop.Key] = prop.Value;
                }

                // Safely map address and tax info
                headerDict["TaxOffice"] = rawHeader.ContainsKey("VERGI_DAIRESI") ? rawHeader["VERGI_DAIRESI"] : "";
                headerDict["TaxNumber"] = rawHeader.ContainsKey("VERGI_NUMARASI") ? rawHeader["VERGI_NUMARASI"] : 
                                         (rawHeader.ContainsKey("VERGI_NUMARA") ? rawHeader["VERGI_NUMARA"] : "");
                headerDict["Address"] = rawHeader.ContainsKey("ADRES") ? rawHeader["ADRES"] : 
                                       (rawHeader.ContainsKey("ADRES1") ? rawHeader["ADRES1"] : 
                                       (rawHeader.ContainsKey("CARI_ADRES") ? rawHeader["CARI_ADRES"] : ""));

                var linesSql = @"
                    SELECT 
                        S.STOK_KODU as StockCode, 
                        ISNULL(SB.STOK_ADI, '') as StockName,
                        S.STHAR_GCMIK as Quantity, S.STHAR_NF as Price, S.STHAR_KDV as Vat,
                        (S.STHAR_GCMIK * S.STHAR_NF) as Total,
                        S.DEPO_KODU as WarehouseCode
                    FROM TBLSTHAR S
                    LEFT JOIN TBLSTSABIT SB ON SB.STOK_KODU = S.STOK_KODU
                    WHERE RTRIM(S.FISNO) = RTRIM(@invoiceNo) AND S.STHAR_FTIRSIP IN ('1', '3')
                    ORDER BY S.SIRA";

                var items = await conn.QueryAsync(linesSql, new { invoiceNo });
                headerDict["Items"] = items;

                return Ok(headerDict);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Detay getirme hatası: " + ex.Message });
            }
        }

        [HttpGet("{invoiceNo}/ewaybill")]
        public async Task<IActionResult> GetEWaybillDetails(string invoiceNo)
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                var sql = @"
                    SELECT 
                        F.GIB_FATIRS_NO as GibInvoiceNo,
                        'Flex Lojistik' as CarrierName,
                        '1234567890' as CarrierVkn,
                        'İSTANBUL' as CarrierCity,
                        'TUZLA' as CarrierSubCity
                    FROM TBLFATUIRS F
                    WHERE RTRIM(F.FATIRS_NO) = RTRIM(@invoiceNo) AND F.FTIRSIP IN ('1', '3')";

                var details = await conn.QueryFirstOrDefaultAsync<dynamic>(sql, new { invoiceNo });
                if (details == null)
                {
                    return Ok(new { 
                        gibInvoiceNo = "TASLAK",
                        carrierName = "Flex Lojistik",
                        carrierVkn = "1234567890",
                        carrierCity = "İSTANBUL",
                        carrierSubCity = "TUZLA"
                    });
                }
                return Ok(details);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "E-İrsaliye detay hatası: " + ex.Message });
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

                DateTime docDate;
                if (string.IsNullOrEmpty(request.Date))
                {
                    docDate = DateTime.Now;
                }
                else if (!DateTime.TryParse(request.Date, out docDate))
                {
                    docDate = DateTime.Now;
                }
                string cleanNo = new string((request.InvoiceNo ?? "").Replace("EIR", "").Where(char.IsDigit).ToArray());
                string finalInvoiceNo = "EIR" + cleanNo.PadLeft(12, '0'); // 3 + 12 = 15
                if (finalInvoiceNo.Length > 15) finalInvoiceNo = finalInvoiceNo.Substring(0, 15);

                // GIB Numarası oluşturma: EIR + YIL + (kalan 9 hane)
                string currentYear = docDate.Year.ToString();
                string gibInvoiceNo = "EIR" + currentYear + cleanNo.PadLeft(9, '0');
                if (gibInvoiceNo.Length > 16) gibInvoiceNo = gibInvoiceNo.Substring(0, 16);

                decimal calculatedBrut = 0;
                decimal calculatedKdv = 0;
                var processedItems = new List<dynamic>();

                foreach (var item in request.Items)
                {
                    // TBLSTSABIT sorgusuna WITH(NOLOCK) eklendi
                    string stockInfoSql = "SELECT SATIS_FIAT1, KDV_ORANI FROM TBLSTSABIT WITH(NOLOCK) WHERE STOK_KODU = @StockCode";
                    var stockInfo = await conn.QueryFirstOrDefaultAsync(stockInfoSql, new { item.StockCode }, transaction);

                    // KDV ve Fiyat SADECE stok kartından (TBLSTSABIT) gelecek
                    decimal realPrice = stockInfo != null ? Convert.ToDecimal(stockInfo.SATIS_FIAT1) : 0;
                    decimal realVatRate = stockInfo != null ? Convert.ToDecimal(stockInfo.KDV_ORANI) : 20;

                    decimal lineBrut = item.Quantity * realPrice;
                    decimal lineVat = lineBrut * (realVatRate / 100);

                    calculatedBrut += lineBrut;
                    calculatedKdv += lineVat;

                    processedItems.Add(new { item.StockCode, item.Quantity, Price = realPrice, VatRate = realVatRate });
                }

                decimal calculatedGenelToplam = calculatedBrut + calculatedKdv;

                // A. TBLFATUIRS (BAŞLIK) - FTIRSIP = '3' (tırnak içinde) yapıldı
                string sqlHeader = @"
                    INSERT INTO TBLFATUIRS (
                        SUBE_KODU, FTIRSIP, FATIRS_NO, CARI_KODU, TARIH, TIPI, 
                        BRUTTUTAR, GENELTOPLAM, KDV, ACIKLAMA, 
                        KOD1, KDV_DAHILMI, KAPATILMIS, C_YEDEK6, EBELGE,
                        ISLETME_KODU, KAYITTARIHI, KAYITYAPANKUL, GIB_FATIRS_NO, PROJE_KODU,
                        FATKALEM_ADEDI, ONAYTIPI, ONAYNUM, VADEBAZT,
                        ODEMETARIHI, SIPARIS_TEST, KS_KODU, HALFAT, UPDATE_KODU, FATURALASMAYACAK
                    ) VALUES (
                        0, '3', @InvoiceNo, @CustomerCode, @Date, 2, 
                        @BrutTutar, @GenelToplam, @KdvTutar, @Description, 
                        @Kod1, 'H', NULL, 'X', 1,
                        1, GETDATE(), 'FLEX_WMS', @GibInvoiceNo, @ProjectCode,
                        @ItemCount, 'A', 0, NULL,
                        NULL, @Date, '001', 0, NULL, 'H'
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
                    GibInvoiceNo = gibInvoiceNo, // GIB_FATIRS_NO alanına EIR + YIL + 9 hane formatı yazılıyor
                    ProjectCode = request.ProjectCode,
                    ItemCount = processedItems.Count,
                    Kod1 = stharKod1
                }, transaction);

                // B. TBLFATUEK (EK BİLGİ) - FKOD = '3' (tırnak içinde) yapıldı
                string sqlExtra = @"
                    INSERT INTO TBLFATUEK (
                        SUBE_KODU, FKOD, FATIRSNO, CKOD, SIRALAMATURU, LIMITALTITEVKIFAT
                    ) VALUES (
                        0, '3', @InvoiceNo, @CustomerCode, 'G', 0
                    )";
                await conn.ExecuteAsync(sqlExtra, new { InvoiceNo = finalInvoiceNo, request.CustomerCode }, transaction);

                // C. TBLSTHAR (KALEMLER) - STHAR_FTIRSIP = '3' (tırnak içinde) yapıldı
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
                            IRSALIYE_NO, IRSALIYE_TARIH, STHAR_SIP_TURU, PROJE_KODU
                        ) VALUES (
                            @InvoiceNo, @StockCode, @Quantity, 'C',
                            '3', 'H', @Date, @Price, @Price,
                            100, 1, 0, @Sira,
                            'I', @StharKod1, @CustomerCode, 0,
                            @VatRate, 0, 0, 0, 
                            @CustomerCode, NULL, @Date,
                            @InvoiceNo, @Date, 0, @ProjectCode
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
                        VatRate = item.VatRate,
                        StharKod1 = stharKod1,
                        ProjectCode = request.ProjectCode
                    }, transaction);
                }

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
                await conn.ExecuteAsync("DELETE FROM TBLSTHAR WHERE RTRIM(FISNO) = RTRIM(@invoiceNo) AND STHAR_FTIRSIP IN ('1', '3')", new { invoiceNo }, transaction);
                await conn.ExecuteAsync("DELETE FROM TBLFATUEK WHERE RTRIM(FATIRSNO) = RTRIM(@invoiceNo) AND FKOD IN ('1', '3')", new { invoiceNo }, transaction);
                await conn.ExecuteAsync("DELETE FROM TBLFATUIRS WHERE RTRIM(FATIRS_NO) = RTRIM(@invoiceNo) AND FTIRSIP IN ('1', '3')", new { invoiceNo }, transaction);

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
                string prefix = "EIR"; // Sadece EIR, yıl yok
                
                string sql = @"SELECT TOP 1 RTRIM(FATIRS_NO) FROM TBLFATUIRS WITH(NOLOCK) WHERE FTIRSIP IN ('1', '3') AND FATIRS_NO LIKE @prefix + '%' ORDER BY FATIRS_NO DESC";
                var lastNo = await conn.QueryFirstOrDefaultAsync<string>(sql, new { prefix });

                if (string.IsNullOrEmpty(lastNo)) return Ok(new { nextNo = prefix + "000000000001" });

                string numberPart = lastNo.Replace(prefix, "");
                if (long.TryParse(numberPart, out long currentNum))
                {
                    // 12 hane padding (EIR + 12 = 15)
                    string nextNo = prefix + (currentNum + 1).ToString().PadLeft(12, '0');
                    return Ok(new { nextNo });
                }
                return Ok(new { nextNo = prefix + "000000000001" });
            }
            catch
            {
                return Ok(new { nextNo = "EIR000000000001" });
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
