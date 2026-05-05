using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace tuckapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WarehouseController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";
        private readonly string _uploadPath = @"C:\DEPOTESLUMTESELLUM";

        // 1. HAREKET LİSTESİ (GetAll)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                string sql = @"
                    SELECT TOP 100
                        RTRIM(S.FISNO) as Id,
                        RTRIM(S.FISNO) as SlipNo,
                        S.STHAR_TARIH as Date,
                        RTRIM(S.STOK_KODU) as StockCode,
                        ISNULL(dbo.TRK(ST.STOK_ADI), '') as StockName,
                        S.STHAR_GCMIK as Quantity,
                        RTRIM(S.OLCUBR) as Unit,
                        ISNULL(dbo.TRK(S.STHAR_ACIKLAMA), '') as Notes,
                        (CASE WHEN S.STHAR_GCKOD = 'G' THEN 'Giriş' ELSE 'Çıkış' END) as Type,
                        RTRIM(S.STHAR_KOD2) as DocumentPath
                    FROM TBLSTHAR S WITH (NOLOCK)
                    LEFT JOIN TBLSTSABIT ST WITH (NOLOCK) ON ST.STOK_KODU = S.STOK_KODU AND ST.DEPO_KODU = 100
                    WHERE S.STHAR_FTIRSIP = '5' AND S.STHAR_HTUR IN ('A', 'U')
                    AND (ST.DEPO_KODU = 100 OR ST.STOK_KODU IS NOT NULL)
                    ORDER BY S.STHAR_TARIH DESC";

                var movements = await conn.QueryAsync(sql);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 2. DOSYA YÜKLEME (Upload)
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Dosya seçilmedi." });

            try
            {
                if (!Directory.Exists(_uploadPath))
                {
                    Directory.CreateDirectory(_uploadPath);
                }

                string fileName = $"WH_{DateTime.Now:yyyyMMddHHmmss}_{file.FileName}";
                string fullPath = Path.Combine(_uploadPath, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new { success = true, filePath = fullPath, fileName = fileName });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Dosya yükleme hatası: " + ex.Message });
            }
        }

        // 3. HAREKET KAYDET (Save)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WarehouseSaveRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Notes)) 
                return BadRequest(new { message = "Geçersiz veri veya eksik not alanı." });

            using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            using var transaction = conn.BeginTransaction();

            try
            {
                string gckod = request.Type == "Giriş" ? "G" : "C";
                // Netsis standartlarına uygun Ambar Fişi numarası
                string fisNo = (request.Type == "Giriş" ? "AG" : "AC") + DateTime.Now.ToString("yyyyMMddHHmm");

                // 1. TBLFATUIRS (BAŞLIK) KAYDI
                // Önce başlık var mı kontrol edelim (aynı dakikada birden fazla kayıt gelirse)
                var headerExists = await conn.QueryFirstOrDefaultAsync<int>(
                    "SELECT COUNT(1) FROM TBLFATUIRS WHERE FATIRS_NO = @SlipNo AND FTIRSIP = '5'",
                    new { SlipNo = fisNo }, transaction);

                if (headerExists == 0)
                {
                    string sqlHeader = @"
                        INSERT INTO TBLFATUIRS (
                            SUBE_KODU, FTIRSIP, FATIRS_NO, CARI_KODU, TARIH, TIPI, 
                            ISLETME_KODU, KAYITTARIHI, KAYITYAPANKUL, C_YEDEK6, YEDEK,
                            KDV_DAHILMI, SIPARIS_TEST, FIYATTARIHI, ODEMEGUNU, FATKALEM_ADEDI
                        ) VALUES (
                            0, '5', @SlipNo, '000000000000000', GETDATE(), 0,
                            1, GETDATE(), 'FLEX_API', 'M', 'D',
                            'E', GETDATE(), GETDATE(), 0, 1
                        )";
                    await conn.ExecuteAsync(sqlHeader, new { SlipNo = fisNo }, transaction);
                }
                else
                {
                    // Başlık varsa kalem adedini artır
                    await conn.ExecuteAsync(
                        "UPDATE TBLFATUIRS SET FATKALEM_ADEDI = FATKALEM_ADEDI + 1 WHERE FATIRS_NO = @SlipNo AND FTIRSIP = '5'",
                        new { SlipNo = fisNo }, transaction);
                }

                // 2. TBLSTHAR (KALEM) KAYDI
                string sqlLine = @"
                    INSERT INTO TBLSTHAR (
                        SUBE_KODU, FISNO, STOK_KODU, STHAR_TARIH, STHAR_GCMIK, 
                        STHAR_GCMIK2, STHAR_GCKOD, STHAR_HTUR, STHAR_FTIRSIP,
                        DEPO_KODU, STHAR_ACIKLAMA, STHAR_KOD2, STHAR_BGTIP,
                        SIRA, STHAR_KOD1, DUZELTMETARIHI
                    ) VALUES (
                        0, @SlipNo, @StockCode, GETDATE(), @Quantity,
                        @Quantity, @GCKod, 'A', '5',
                        @WarehouseCode, @Notes, @DocumentPath, 'I',
                        1, 'M', GETDATE()
                    )";

                await conn.ExecuteAsync(sqlLine, new {
                    SlipNo = fisNo,
                    request.StockCode,
                    request.Quantity,
                    GCKod = gckod,
                    request.WarehouseCode,
                    request.Notes,
                    request.DocumentPath
                }, transaction);

                transaction.Commit();
                return Ok(new { success = true, message = "Ambar hareketi başarıyla resmileştirildi." });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }
    }

    public class WarehouseSaveRequest
    {
        public string? StockCode { get; set; }
        public decimal Quantity { get; set; }
        public int WarehouseCode { get; set; }
        public string? Type { get; set; } // Giriş / Çıkış
        public string? Notes { get; set; }
        public string? DocumentPath { get; set; } // İmzalı form yolu
    }
}
