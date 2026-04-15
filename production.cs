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
    public class WarehouseController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

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
                    LEFT JOIN TBLSTSABIT ST WITH (NOLOCK) ON ST.STOK_KODU = S.STOK_KODU
                    WHERE S.STHAR_FTIRSIP = '1' AND S.STHAR_HTUR IN ('A', 'U')
                    ORDER BY S.STHAR_TARIH DESC";

                var movements = await conn.QueryAsync(sql);
                return Ok(movements);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Hata: " + ex.Message });
            }
        }

        // 2. HAREKET KAYDET (Save)
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
                string fisNo = (request.Type == "Giriş" ? "AG" : "AC") + DateTime.Now.ToString("yyyyMMddHHmm");

                string sql = @"
                    INSERT INTO TBLSTHAR (
                        SUBE_KODU, FISNO, STOK_KODU, STHAR_TARIH, STHAR_GCMIK, 
                        STHAR_GCMIK2, STHAR_GCKOD, STHAR_HTUR, STHAR_FTIRSIP,
                        DEPO_KODU, STHAR_ACIKLAMA, STHAR_KOD2,
                        KAYITTARIHI, KAYITYAPANKUL
                    ) VALUES (
                        0, @SlipNo, @StockCode, GETDATE(), @Quantity,
                        @Quantity, @GCKod, 'A', '1',
                        @WarehouseCode, @Notes, @DocumentPath,
                        GETDATE(), 'FLEX_API'
                    )";

                await conn.ExecuteAsync(sql, new {
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
        public string StockCode { get; set; }
        public decimal Quantity { get; set; }
        public int WarehouseCode { get; set; }
        public string Type { get; set; } // Giriş / Çıkış
        public string Notes { get; set; }
        public string DocumentPath { get; set; } // İmzalı form yolu
    }
}
}
