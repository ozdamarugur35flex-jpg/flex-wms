using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Threading.Tasks;

namespace tuckapi.Controllers
{
    [ApiController]
    [Route("[controller]")] // IIS 'api' altında olduğu için sadece [controller] olmalı
    public class DashboardController : ControllerBase
    {
        private readonly string _connStr = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);

                // 1. Toplam Stok Değeri
                var totalValue = await conn.ExecuteScalarAsync<decimal>(@"
                    SELECT ISNULL(SUM(MIKTAR * ALIS_FIAT1), 0) FROM TBLSTSABIT WITH(NOLOCK) WHERE DEPO_KODU = 100");

                // 2. Bekleyen Sevk Emri Sayısı
                var pendingShipments = await conn.ExecuteScalarAsync<int>(@"
                    SELECT COUNT(*) FROM TBLFATUIRS WITH(NOLOCK) WHERE FTIRSIP IN ('1', '3') AND (GIB_FATIRS_NO IS NULL OR GIB_FATIRS_NO = '')");

                // 3. Bugünün Satışları
                var todaySales = await conn.ExecuteScalarAsync<decimal>(@"
                    SELECT ISNULL(SUM(GENELTOPLAM), 0) FROM TBLFATUIRS WITH(NOLOCK) 
                    WHERE FTIRSIP IN ('1', '3') AND CONVERT(DATE, TARIH) = CONVERT(DATE, GETDATE())");

                return Ok(new
                {
                    totalStockValue = totalValue,
                    pendingShipments = pendingShipments,
                    todaySales = todaySales
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("charts")]
        public async Task<IActionResult> GetCharts()
        {
            try
            {
                using var conn = new SqlConnection(_connStr);
                var chartData = await conn.QueryAsync(@"
                    SELECT TOP 7 
                        FORMAT(TARIH, 'dd.MM') as label,
                        SUM(GENELTOPLAM) as value
                    FROM TBLFATUIRS WITH(NOLOCK)
                    WHERE FTIRSIP IN ('1', '3')
                    GROUP BY TARIH
                    ORDER BY TARIH DESC");

                return Ok(chartData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("logs")]
        public IActionResult GetLogs()
        {
            return Ok(new List<object>());
        }
    }
}
