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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                // Netsis Cari Kartlar: TBLCASABIT
                // CARI_KOD, CARI_ISIM
                string sql = "SELECT RTRIM(CARI_KOD) as Code, RTRIM(CARI_ISIM) as Name FROM TBLCASABIT WITH(NOLOCK) ORDER BY CARI_KOD";
                var result = await conn.QueryAsync(sql);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
