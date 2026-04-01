using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Runtime.InteropServices;
using System.Linq;
using NetOpenX50; // Versiyonunuza göre NetOpenX90 vb. olabilir

namespace FlexWms.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StocksController : ControllerBase
    {
        private readonly string _connectionString = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public IActionResult GetAllStocks([FromQuery] bool includeYM = true)
        {
            List<object> stocks = new List<object>();
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    // KDV_ORANI ve SATIS_FIAT1 alanları eklendi, dbo.TRK kullanılmadı
                    string sql = "SELECT STOK_KODU, STOK_ADI, OLCU_BR1, GRUP_KODU, KDV_ORANI, SATIS_FIAT1 FROM TBLSTSABIT WITH(NOLOCK) ORDER BY STOK_KODU ASC";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    conn.Open();

                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            stocks.Add(new
                            {
                                Code = rdr["STOK_KODU"].ToString().Trim(),
                                Name = rdr["STOK_ADI"].ToString().Trim(),
                                Unit = rdr["OLCU_BR1"].ToString().Trim(),
                                GroupCode = rdr["GRUP_KODU"]?.ToString().Trim() ?? "",
                                KdvOrani = rdr["KDV_ORANI"] != DBNull.Value ? Convert.ToDouble(rdr["KDV_ORANI"]) : (double?)null,
                                SatisFiat1 = rdr["SATIS_FIAT1"] != DBNull.Value ? Convert.ToDouble(rdr["SATIS_FIAT1"]) : 0
                            });
                        }
                    }
                }
                return Ok(stocks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"SQL Hatası: {ex.Message}");
            }
        }

        [HttpGet("{code}")]
        public IActionResult GetStockByCode(string code)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(_connectionString))
                {
                    string sql = "SELECT STOK_KODU, STOK_ADI, OLCU_BR1, GRUP_KODU, KDV_ORANI, SATIS_FIAT1 FROM TBLSTSABIT WITH(NOLOCK) WHERE STOK_KODU = @code";

                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@code", code);
                    conn.Open();

                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        if (rdr.Read())
                        {
                            return Ok(new
                            {
                                Code = rdr["STOK_KODU"].ToString().Trim(),
                                Name = rdr["STOK_ADI"].ToString().Trim(),
                                Unit = rdr["OLCU_BR1"].ToString().Trim(),
                                GroupCode = rdr["GRUP_KODU"]?.ToString().Trim() ?? "",
                                KdvOrani = rdr["KDV_ORANI"] != DBNull.Value ? Convert.ToDouble(rdr["KDV_ORANI"]) : (double?)null,
                                SatisFiat1 = rdr["SATIS_FIAT1"] != DBNull.Value ? Convert.ToDouble(rdr["SATIS_FIAT1"]) : 0
                            });
                        }
                    }
                }
                return NotFound(new { message = "Stok bulunamadı." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"SQL Hatası: {ex.Message}");
            }
        }

        [HttpPost]
        public IActionResult CreateStock([FromBody] StockCreateDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Code))
                return BadRequest("Stok kodu boş olamaz.");

            dynamic kernel = new Kernel();
            dynamic sirket = null;
            dynamic stok = null;

            try
            {
                sirket = kernel.yeniSirket(TVTTipi.vtMSSQL, "MERACK26", "TEMELSET_USER", "TEMELSET_PASS", "NET_USER", "NET_PASS", 0);
                stok = kernel.yeniStok(sirket);

                try { stok.STOK_KODU = dto.Code; } catch { stok.StokKodu = dto.Code; }
                try { stok.STOK_ADI = dto.Name; } catch { stok.StokAdi = dto.Name; }
                try { stok.GRUP_KODU = dto.GroupCode; } catch { stok.GrupKodu = dto.GroupCode; }
                try { stok.KOD_1 = "FLEXWMS"; } catch { stok.Kod1 = "FLEXWMS"; }
                try { stok.OLCU_BR1 = "ADET"; } catch { stok.OlcuBr1 = "ADET"; }
                try { stok.KDV_ORANI = 20; } catch { stok.KdvOrani = 20; }

                stok.kayitYeni();

                return Ok(new { success = true, message = $"{dto.Code} kodlu stok Netsis'e başarıyla kaydedildi." });
            }
            catch (Exception ex)
            {
                return BadRequest("Netsis Kayıt Hatası: " + ex.Message);
            }
            finally
            {
                if (stok != null) Marshal.ReleaseComObject(stok);
                if (sirket != null) Marshal.ReleaseComObject(sirket);
                if (kernel != null)
                {
                    try { kernel.serbestBirak(); } catch { }
                    Marshal.ReleaseComObject(kernel);
                }
                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }
    }
    }

    public class StockCreateDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string GroupCode { get; set; }
    }
}
