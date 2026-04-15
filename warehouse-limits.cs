using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System;

namespace FlexWms.Api.Controllers
{
    [ApiController]
    [Route("stocks/warehouse-limits")]
    public class WarehouseLimitsController : ControllerBase
    {
        private readonly string _connectionString = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public IActionResult GetWarehouseLimits()
        {
            List<object> limits = new List<object>();
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    string sql = @"SELECT A.STOK_KODU, S.STOK_ADI, A.AMBAR_KODU, A.ASGARI_SEVIYE, A.AZAMI_SEVIYE, A.SIPARIS_NOKTASI
                                   FROM TBLSTOKAMBAR A WITH(NOLOCK)
                                   LEFT JOIN TBLSTSABIT S WITH(NOLOCK) ON A.STOK_KODU = S.STOK_KODU
                                   ORDER BY A.STOK_KODU, A.AMBAR_KODU";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    conn.Open();

                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            limits.Add(new
                            {
                                StockCode = rdr["STOK_KODU"].ToString().Trim(),
                                StockName = rdr["STOK_ADI"]?.ToString().Trim() ?? "",
                                WarehouseCode = Convert.ToInt32(rdr["AMBAR_KODU"]),
                                MinLevel = Convert.ToDouble(rdr["ASGARI_SEVIYE"]),
                                MaxLevel = Convert.ToDouble(rdr["AZAMI_SEVIYE"]),
                                ReorderPoint = Convert.ToDouble(rdr["SIPARIS_NOKTASI"])
                            });
                        }
                    }
                }
                return Ok(limits);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
