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

        [HttpGet("tables")]
        public async Task<IActionResult> GetTables()
        {
            try {
                using var conn = new SqlConnection(_connectionString);
                var tables = await conn.QueryAsync("SELECT name FROM sys.tables WHERE name LIKE '%TALEP%'");
                return Ok(tables);
            } catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("columns/{tableName}")]
        public async Task<IActionResult> GetColumns(string tableName)
        {
            try {
                using var conn = new SqlConnection(_connectionString);
                var tables = await conn.QueryAsync("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = @tableName", new { tableName });
                return Ok(tables);
            } catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                // Kullanıcının belirttiği TBLTALEP tablosu üzerinden sorgu
                // Not: Eğer kalem verileri ayrı ise buraya JOIN eklenebilir.
                // Şimdilik sadece başlığı getiriyoruz veya TBLSTALEP bulunamadığı için TBLTALEP içinde arıyoruz.
                string sql = @"
                    SELECT 
                        RTRIM(T.TALEP_NO) as RequestNo,
                        '' as StockCode, -- Detay tablosu netleşince güncellenecek
                        '' as StockName,
                        0 as RequestedQty,
                        T.TARIH as Date,
                        ISNULL(dbo.TRK(T.ACIKLAMA), '') as BranchName,
                        ISNULL(T.DURUM, 'Pozitif') as Status
                    FROM TBLTALEP T WITH(NOLOCK)
                    ORDER BY T.TARIH DESC, T.TALEP_NO DESC";

                var requests = await conn.QueryAsync(sql);
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
                
                string lastNo = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 TALEP_NO FROM TBLTALEP WHERE TALEP_NO LIKE 'T%' ORDER BY TALEP_NO DESC");
                string nextNo = "T00000000000001";
                if (!string.IsNullOrEmpty(lastNo))
                {
                    string numeric = lastNo.Substring(1);
                    if (long.TryParse(numeric, out long val))
                    {
                        nextNo = "T" + (val + 1).ToString().PadLeft(14, '0');
                    }
                }

                // TBLTALEP tablosuna kayıt (Kullanıcının kolon listesine göre)
                string sql = @"
                    INSERT INTO TBLTALEP (
                        TALEP_NO, TARIH, ACIKLAMA, DURUM, KAYIT_YAPAN
                    ) VALUES (
                        @RequestNo, @Date, @Branch, 'A', 'FLEX_API'
                    )";

                await conn.ExecuteAsync(sql, new {
                    RequestNo = nextNo,
                    Date = DateTime.Now,
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
                        string lastNo = await conn.QueryFirstOrDefaultAsync<string>(
                            "SELECT TOP 1 TALEP_NO FROM TBLTALEP WHERE TALEP_NO LIKE 'T%' ORDER BY TALEP_NO DESC", 
                            null, trans);
                        
                        string nextNo = "T00000000000001";
                        if (!string.IsNullOrEmpty(lastNo)) {
                            string numeric = lastNo.Substring(1);
                            if (long.TryParse(numeric, out long val)) {
                                nextNo = "T" + (val + 1).ToString().PadLeft(14, '0');
                            }
                        }

                        // Detay tablosu (Stok kodu ve miktar için)
                        // TBLSTALEP bulunamadığına göre TBLTALEP'e başlık olarak ekliyoruz.
                        string sql = @"
                            INSERT INTO TBLTALEP (
                                TALEP_NO, TARIH, ACIKLAMA, DURUM, KAYIT_YAPAN
                            ) VALUES (
                                @RequestNo, @Date, @Branch, 'A', 'FLEX_API'
                            )";

                        await conn.ExecuteAsync(sql, new {
                            RequestNo = nextNo,
                            Date = DateTime.Now,
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
