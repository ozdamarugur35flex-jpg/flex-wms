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
    [Route("customers")]
    public class CustomersController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        // 1. LİSTELEME
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);

                // CARI_KOD, CARI_ISIM, CARI_ADRES, CARI_IL, CARI_ILCE, VERGI_NUMARASI, VERGI_DAIRESI, CARI_TEL, EMAIL
                string sql = @"
                    SELECT 
                        RTRIM(S.CARI_KOD) as Code, 
                        RTRIM(S.CARI_ISIM) as Name, 
                        CASE WHEN S.CARI_TIP = 'A' THEN 'Alıcı' ELSE 'Satıcı' END as Type,
                        CASE WHEN S.ULKE_KODU = '001' THEN 'Yurt İçi' ELSE 'Yurt Dışı' END as LocationType,
                        RTRIM(S.VERGI_NUMARASI) as TaxNumber,
                        RTRIM(S.VERGI_DAIRESI) as TaxOffice,
                        RTRIM(S.CARI_TEL) as Phone,
                        RTRIM(S.EMAIL) as Email,
                        RTRIM(S.CARI_ADRES) as Address,
                        RTRIM(S.CARI_IL) as City,
                        RTRIM(S.CARI_ILCE) as District,
                        E.KULL1S as ProjectCode,
                        RTRIM(P.PROJE_ACIKLAMA) as ProjectName
                    FROM TBLCASABIT S WITH(NOLOCK)
                    LEFT JOIN TBLCASABITEK E WITH(NOLOCK) ON S.CARI_KOD = E.CARI_KOD
                    LEFT JOIN TBLPROJE P WITH(NOLOCK) ON E.KULL1S = P.PROJE_KODU
                    ORDER BY S.CARI_KOD";

                var list = await conn.QueryAsync<dynamic>(sql);
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Listeleme hatası: " + ex.Message });
            }
        }

        // 2. Yeni Kod Üretme
        [HttpGet("next-code/{prefix}")]
        public async Task<IActionResult> GetNextCode(string prefix)
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"
                    SELECT TOP 1 CARI_KOD 
                    FROM TBLCASABIT WITH(NOLOCK)
                    WHERE CARI_KOD LIKE @Prefix + '%' 
                    ORDER BY CARI_KOD DESC";

                var lastCode = await conn.QueryFirstOrDefaultAsync<string>(sql, new { Prefix = prefix });

                if (string.IsNullOrEmpty(lastCode))
                {
                    return Ok(new { code = prefix + "0001" });
                }

                string numberPart = lastCode.Substring(prefix.Length);
                if (int.TryParse(numberPart, out int number))
                {
                    string newCode = prefix + (number + 1).ToString(new string('0', numberPart.Length));
                    return Ok(new { code = newCode });
                }

                return Ok(new { code = prefix + "0001" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kod üretme hatası: " + ex.Message });
            }
        }

        // 3. Kaydetme / Güncelleme
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CustomerRequest req)
        {
            if (req == null || string.IsNullOrEmpty(req.Code) || string.IsNullOrEmpty(req.Name))
                return BadRequest("Cari Kodu ve Cari Adı zorunludur.");

            try
            {
                using var conn = new SqlConnection(_connStr);

                string checkSql = "SELECT COUNT(*) FROM TBLCASABIT WHERE CARI_KOD = @Code";
                int exists = await conn.ExecuteScalarAsync<int>(checkSql, new { Code = req.Code });

                string cariTip = req.Type == "Alıcı" ? "A" : "S";
                string ulkeKodu = req.LocationType == "Yurt İçi" ? "001" : "000";

                if (exists > 0)
                {
                    string updateSql = @"
                        UPDATE TBLCASABIT SET 
                            CARI_ISIM = @Name,
                            CARI_TIP = @CariTip,
                            ULKE_KODU = @UlkeKodu,
                            VERGI_NUMARASI = @TaxNumber,
                            VERGI_DAIRESI = @TaxOffice,
                            CARI_TEL = @Phone,
                            EMAIL = @Email,
                            CARI_ADRES = @Address,
                            CARI_IL = @City,
                            CARI_ILCE = @District
                        WHERE CARI_KOD = @Code";

                    await conn.ExecuteAsync(updateSql, new
                    {
                        Code = req.Code,
                        Name = req.Name,
                        CariTip = cariTip,
                        UlkeKodu = ulkeKodu,
                        TaxNumber = req.TaxNumber ?? "",
                        TaxOffice = req.TaxOffice ?? "",
                        Phone = req.Phone ?? "",
                        Email = req.Email ?? "",
                        Address = req.Address ?? "",
                        City = req.City ?? "",
                        District = req.District ?? ""
                    });
                }
                else
                {
                    string insertSql = @"
                        INSERT INTO TBLCASABIT (
                            CARI_KOD, CARI_ISIM, CARI_TIP, ULKE_KODU, 
                            VERGI_NUMARASI, VERGI_DAIRESI, CARI_TEL, EMAIL,
                            CARI_ADRES, CARI_IL, CARI_ILCE,
                            SUBE_KODU, ISLETME_KODU, KAYITTARIHI
                        ) VALUES (
                            @Code, @Name, @CariTip, @UlkeKodu, 
                            @TaxNumber, @TaxOffice, @Phone, @Email,
                            @Address, @City, @District,
                            0, 0, GETDATE()
                        )";

                    await conn.ExecuteAsync(insertSql, new
                    {
                        Code = req.Code,
                        Name = req.Name,
                        CariTip = cariTip,
                        UlkeKodu = ulkeKodu,
                        TaxNumber = req.TaxNumber ?? "",
                        TaxOffice = req.TaxOffice ?? "",
                        Phone = req.Phone ?? "",
                        Email = req.Email ?? "",
                        Address = req.Address ?? "",
                        City = req.City ?? "",
                        District = req.District ?? ""
                    });
                }

                return Ok(new { message = "Cari başarıyla kaydedildi.", code = req.Code });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kayıt hatası: " + ex.Message });
            }
        }
    }

    public class CustomerRequest
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? LocationType { get; set; }
        public string? TaxNumber { get; set; }
        public string? TaxOffice { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
    }
}
