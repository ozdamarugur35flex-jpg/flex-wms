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
    [Route("purchaserequests")]
    public class PurchaseRequestsController : ControllerBase
    {
        private readonly string _connectionString = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                // Netsis TBLSTALEP tablosundan verileri çekiyoruz.
                // Not: TBLSTALEP standart yapısında STOK_KODU, MIKTAR, TARIH, DURUM vb. alanlar bulunur.
                string sql = @"
                    SELECT 
                        RTRIM(S.TALEP_NO) as RequestNo,
                        S.STOK_KODU as StockCode,
                        ISNULL(dbo.TRK(ST.STOK_ADI), '') as StockName,
                        S.MIKTAR as RequestedQty,
                        S.TARIH as Date,
                        ISNULL(dbo.TRK(S.ACIKLAMA), '') as BranchName,
                        CASE 
                            WHEN S.ONAYTIPI = 'A' THEN 'Onaylandı'
                            WHEN S.ONAYTIPI = 'R' THEN 'Reddedildi'
                            ELSE 'Beklemede'
                        END as Status
                    FROM TBLSTALEP S WITH(NOLOCK)
                    LEFT JOIN TBLSTSABIT ST WITH(NOLOCK) ON ST.STOK_KODU = S.STOK_KODU AND ST.DEPO_KODU = 100
                    ORDER BY S.TARIH DESC, S.TALEP_NO DESC";

                var requests = await conn.QueryAsync(sql);
                
                // Frontend'in beklediği yapıya dönüştürelim (Düz liste olarak gösteriliyor şu an UI'da)
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Save([FromBody] PurchaseRequestDto dto)
        {
            if (dto == null) return BadRequest("Veri bulunamadı.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();
                
                // Sıradaki Talep No alalım
                string lastNo = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 TALEP_NO FROM TBLSTALEP WHERE TALEP_NO LIKE 'T%' ORDER BY TALEP_NO DESC");
                string nextNo = "T00000000000001";
                if (!string.IsNullOrEmpty(lastNo))
                {
                    string numeric = lastNo.Substring(1);
                    if (long.TryParse(numeric, out long val))
                    {
                        nextNo = "T" + (val + 1).ToString().PadLeft(14, '0');
                    }
                }

                string sql = @"
                    INSERT INTO TBLSTALEP (
                        TALEP_NO, STOK_KODU, TARIH, MIKTAR, ACIKLAMA, ONAYTIPI, 
                        KAYITTARIHI, KAYITYAPANKUL
                    ) VALUES (
                        @RequestNo, @StockCode, @Date, @Qty, @Branch, 'B',
                        GETDATE(), 'FLEX_API'
                    )";

                await conn.ExecuteAsync(sql, new {
                    RequestNo = nextNo,
                    StockCode = dto.StockCode,
                    Date = DateTime.Now,
                    Qty = dto.RequestedQty,
                    Branch = dto.BranchName
                });

                return Ok(new { success = true, requestNo = nextNo });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("bulk")]
        public async Task<IActionResult> BulkSave([FromBody] List<PurchaseRequestDto> items)
        {
            if (items == null || items.Count == 0) return BadRequest("Veri bulunamadı.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();
                using var trans = conn.BeginTransaction();

                try {
                    foreach(var item in items) {
                        // Her kalem için yeni bir talep no üretmek yerine aynı talep no'nun kalemleri de olabilir 
                        // ama Netsis'te TBLSTALEP genellikle tekil satırlardır.
                        string lastNo = await conn.QueryFirstOrDefaultAsync<string>(
                            "SELECT TOP 1 TALEP_NO FROM TBLSTALEP WHERE TALEP_NO LIKE 'T%' ORDER BY TALEP_NO DESC", 
                            null, trans);
                        
                        string nextNo = "T00000000000001";
                        if (!string.IsNullOrEmpty(lastNo)) {
                            string numeric = lastNo.Substring(1);
                            if (long.TryParse(numeric, out long val)) {
                                nextNo = "T" + (val + 1).ToString().PadLeft(14, '0');
                            }
                        }

                        string sql = @"
                            INSERT INTO TBLSTALEP (
                                TALEP_NO, STOK_KODU, TARIH, MIKTAR, ACIKLAMA, ONAYTIPI, 
                                KAYITTARIHI, KAYITYAPANKUL
                            ) VALUES (
                                @RequestNo, @StockCode, @Date, @Qty, @Branch, 'B',
                                GETDATE(), 'FLEX_API'
                            )";

                        await conn.ExecuteAsync(sql, new {
                            RequestNo = nextNo,
                            StockCode = item.StockCode,
                            Date = DateTime.Now,
                            Qty = item.RequestedQty,
                            Branch = item.BranchName
                        }, trans);
                    }

                    trans.Commit();
                    return Ok(new { success = true });
                }
                catch(Exception) {
                    trans.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class PurchaseRequestDto
    {
        public string StockCode { get; set; }
        public string StockName { get; set; }
        public string BranchName { get; set; }
        public decimal RequestedQty { get; set; }
        public string Date { get; set; }
    }
}
