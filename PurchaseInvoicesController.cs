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
                        F.GENELTOPLAM as TotalAmount,
                        ISNULL(F.GIB_FATIRS_NO, '') as GibInvoiceNo,
                        ISNULL(dbo.TRK(F.ACIKLAMA), '') as Description
                    FROM TBLFATUIRS F WITH (NOLOCK)
                    LEFT JOIN TBLCASABIT C WITH (NOLOCK) ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FTIRSIP = '4' 
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
                string sql = "SELECT TOP 1 FATIRS_NO FROM TBLFATUIRS WHERE FTIRSIP = '4' AND FATIRS_NO LIKE 'FLX%' ORDER BY FATIRS_NO DESC";
                var lastNo = await conn.QueryFirstOrDefaultAsync<string>(sql);

                string nextNo = "FLX000000000001";

                if (!string.IsNullOrEmpty(lastNo))
                {
                    string numericPart = lastNo.Replace("FLX", "");
                    if (long.TryParse(numericPart, out long currentNum))
                    {
                        nextNo = "FLX" + (currentNum + 1).ToString().PadLeft(12, '0');
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
                        F.GENELTOPLAM as TotalAmount,
                        ISNULL(F.GIB_FATIRS_NO, '') as GibInvoiceNo,
                        ISNULL(dbo.TRK(F.ACIKLAMA), '') as Description,
                        F.TIPI as Type,
                        RTRIM(F.PROJE_KODU) as ProjectCode
                    FROM TBLFATUIRS F WITH (NOLOCK)
                    LEFT JOIN TBLCASABIT C WITH (NOLOCK) ON C.CARI_KOD = F.CARI_KODU
                    WHERE F.FTIRSIP = '4' AND F.FATIRS_NO = @invoiceNo";

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
                    FROM TBLSTHAR H WITH (NOLOCK)
                    LEFT JOIN TBLSTSABIT S WITH (NOLOCK) ON S.STOK_KODU = H.STOK_KODU
                    WHERE H.STHAR_FTIRSIP = '4' AND H.FISNO = @invoiceNo";

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
                    "SELECT COUNT(1) FROM TBLFATUIRS WHERE FATIRS_NO = @InvoiceNo AND FTIRSIP = '4'",
                    new { request.InvoiceNo }, transaction);

                if (existing > 0)
                {
                    return BadRequest(new { message = $"Hata: {request.InvoiceNo} numaralı irsaliye zaten mevcut!" });
                }

                DateTime docDate = string.IsNullOrEmpty(request.Date) ? DateTime.Now : DateTime.Parse(request.Date);

                // Sıradaki Ambar Kabul No'yu al (Netsis standartlarına uygun otomatik artan numara)
                string maxAmbarNoStr = await conn.QueryFirstOrDefaultAsync<string>(
                    "SELECT MAX(AMBAR_KABULNO) FROM TBLSTHAR WHERE AMBAR_KABULNO LIKE '000000000000%'",
                    null, transaction);
                long nextAmbarNoVal = 1;
                if (!string.IsNullOrEmpty(maxAmbarNoStr) && long.TryParse(maxAmbarNoStr, out long currentMax))
                {
                    nextAmbarNoVal = currentMax + 1;
                }
                string nextAmbarNo = nextAmbarNoVal.ToString().PadLeft(15, '0');

                // Kalem bazlı KDV oranlarını çek ve toplamları hesapla
                decimal totalBrut = 0;
                decimal totalKdv = 0;
                var itemDetails = new List<(PurchaseInvoiceItemRequest item, decimal kdvRate)>();

                foreach (var item in request.Items)
                {
                    var kdvRate = await conn.QueryFirstOrDefaultAsync<decimal>(
                        "SELECT ISNULL(KDV_ORANI, 0) FROM TBLSTSABIT WHERE STOK_KODU = @StockCode",
                        new { item.StockCode }, transaction);

                    totalBrut += item.Quantity * item.Price;
                    totalKdv += Math.Round((item.Quantity * item.Price * kdvRate) / 100, 2);
                    itemDetails.Add((item, kdvRate));
                }
                decimal totalGenel = totalBrut + totalKdv;

                // A. TBLFATUIRS (BAŞLIK)
                string sqlHeader = @"
                    INSERT INTO TBLFATUIRS (
                        SUBE_KODU, FTIRSIP, FATIRS_NO, CARI_KODU, TARIH, TIPI, 
                        BRUTTUTAR, GENELTOPLAM, KDV, ACIKLAMA, 
                        KOD1, KDV_DAHILMI, KAPATILMIS, C_YEDEK6, EBELGE,
                        ISLETME_KODU, KAYITTARIHI, KAYITYAPANKUL, GIB_FATIRS_NO, PROJE_KODU,
                        FATKALEM_ADEDI, ONAYTIPI, ONAYNUM, VADEBAZT,
                        ODEMETARIHI, SIPARIS_TEST, KS_KODU, HALFAT, UPDATE_KODU, FATURALASMAYACAK,
                        AMBAR_KBLNO, D_YEDEK10, GELSUBE_KODU, GITSUBE_KODU
                    ) VALUES (
                        0, '4', @InvoiceNo, @CustomerCode, @Date, 2, 
                        @BrutTutar, @GenelToplam, @KdvTutar, @Description, 
                        @Kod1, 'H', NULL, 'X', 0,
                        1, GETDATE(), 'FLEX_API', '', '100',
                        @ItemCount, 'A', 0, NULL,
                        @Date, @Date, '001', 0, NULL, 'H',
                        @AmbarKblNo, @Date, 0, 0
                    )";

                await conn.ExecuteAsync(sqlHeader, new
                {
                    InvoiceNo = request.InvoiceNo,
                    CustomerCode = request.CustomerCode,
                    Date = docDate,
                    BrutTutar = totalBrut,
                    GenelToplam = totalGenel,
                    KdvTutar = totalKdv,
                    Description = (string)null, // Üst bilgide açıklama NULL istendi
                    Kod1 = "M",
                    ItemCount = request.Items.Count,
                    AmbarKblNo = nextAmbarNo
                }, transaction);

                // A2. TBLFATUEK (Ek Bilgi)
                string sqlExtra = @"
                    INSERT INTO TBLFATUEK (
                        SUBE_KODU, FKOD, FATIRSNO, CKOD, SIRALAMATURU, LIMITALTITEVKIFAT
                    ) VALUES (
                        0, '4', @InvoiceNo, @CustomerCode, '', 'H'
                    )";
                await conn.ExecuteAsync(sqlExtra, new { request.InvoiceNo, request.CustomerCode }, transaction);

                // B. TBLSTHAR (Kalem Bilgileri)
                short sira = 1;
                foreach (var detail in itemDetails)
                {
                    var item = detail.item;
                    var kdvRate = detail.kdvRate;

                    string sqlItem = @"
                        INSERT INTO TBLSTHAR (
                            SUBE_KODU, FISNO, STOK_KODU, STHAR_GCMIK, STHAR_GCMIK2,
                            STHAR_GCKOD, STHAR_HTUR, STHAR_FTIRSIP,
                            STHAR_TARIH, STHAR_NF, STHAR_BF, DEPO_KODU, OLCUBR,
                            SIRA, STHAR_BGTIP, STHAR_KOD1, STHAR_CARIKOD, CEVRIM,
                            STHAR_KDV, LISTE_FIAT, STHAR_DOVTIP, STHAR_DOVFIAT,
                            STHAR_ACIKLAMA, STHAR_TESTAR, IRSALIYE_NO, IRSALIYE_TARIH, PROJE_KODU, UPDATE_KODU,
                            AMBAR_KABULNO
                        ) VALUES (
                            0, @InvoiceNo, @StockCode, @Quantity, @Quantity,
                            'G', 'H', '4',
                            @Date, @Price, @Price, 100, 1,
                            @Sira, 'I', 'M', @CustomerCode, 1,
                            @KdvRate, 1, 0, 0,
                            @ItemDescription, @Date, @InvoiceNo, @Date, '100', NULL,
                            @AmbarKabulNo
                        )";

                    var itemParams = new
                    {
                        InvoiceNo = request.InvoiceNo,
                        StockCode = item.StockCode,
                        Quantity = item.Quantity,
                        Date = docDate,
                        Price = item.Price,
                        Sira = sira++,
                        CustomerCode = request.CustomerCode,
                        KdvRate = kdvRate,
                        AmbarKabulNo = nextAmbarNo,
                        ItemDescription = request.CustomerCode // Kalem açıklamasına cari kod yazılması istendi
                    };

                    await conn.ExecuteAsync(sqlItem, itemParams, transaction);
                }

                // TBLSTOKURS ve TBLCAHAR kayıtları kullanıcı isteği üzerine iptal edildi.

                transaction.Commit();
                return Ok(new { success = true, message = "Kayıt başarılı (Netsis Standartlarına Uygun)." });
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
    }
}
