using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System;

namespace FlexWms.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CapacitiesController : ControllerBase
    {
        private readonly string _connectionString = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public IActionResult GetCapacities()
        {
            List<object> capacities = new List<object>();
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    // Netsis'te hücre kapasiteleri genellikle TBLHUCRAYER veya benzeri tablolarda tutulur.
                    string sql = @"SELECT AMBAR_KODU, HUCRA_KODU, KAPASITE_ADET, KAPASITE_AGIRLIK, KAPASITE_HACIM, HUCRA_TIPI
                                   FROM TBLHUCRAYER WITH(NOLOCK)
                                   ORDER BY AMBAR_KODU, HUCRA_KODU";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    conn.Open();

                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            capacities.Add(new
                            {
                                WarehouseCode = rdr["AMBAR_KODU"].ToString().Trim(),
                                CellCode = rdr["HUCRA_KODU"].ToString().Trim(),
                                CapacityQty = Convert.ToDouble(rdr["KAPASITE_ADET"]),
                                CapacityWeight = Convert.ToDouble(rdr["KAPASITE_AGIRLIK"]),
                                CapacityVolume = Convert.ToDouble(rdr["KAPASITE_HACIM"]),
                                CellType = rdr["HUCRA_TIPI"]?.ToString().Trim() ?? ""
                            });
                        }
                    }
                }
                return Ok(capacities);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
