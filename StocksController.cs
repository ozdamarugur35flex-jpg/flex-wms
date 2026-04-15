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
                    // Tüm alanlar Netsis standartlarına göre çekiliyor
                    string sql = @"SELECT S.STOK_KODU, S.STOK_ADI, S.OLCU_BR1, S.OLCU_BR2, S.OLCU_BR3, S.PAY_1, S.PAYDA_1, 
                                   S.GRUP_KODU, S.KDV_ORANI, S.SATIS_FIAT1, S.ALIS_FIAT1, S.BARKOD1, S.BARKOD2, S.BARKOD3,
                                   S.KOD_1, S.KOD_2, S.KOD_3, S.KOD_4, S.KOD_5, S.MUH_DETAYKODU, S.SATICI_KODU, S.DEPO_KODU,
                                   S.EN, S.BOY, S.GENISLIK, S.GUMRUKTARIFEKODU, S.URETICI_KODU, S.ASGARI_STOK, S.TEMIN_SURESI, S.KILIT, S.SAFKOD,
                                   EK.KULL1N as CEVRIM_SAYISI,
                                   (SELECT TOP 1 STHAR_NF FROM TBLSTHAR WITH(NOLOCK) 
                                    WHERE STOK_KODU = S.STOK_KODU 
                                    AND GCKOD = 'G' AND STHAR_HTUR = 'A' 
                                    ORDER BY STHAR_TARIH DESC, STHAR_TESTAR DESC) as SON_ALIS_FIYATI
                                   FROM TBLSTSABIT S WITH(NOLOCK) 
                                   LEFT JOIN TBLSTSABITEK EK WITH(NOLOCK) ON S.STOK_KODU = EK.STOK_KODU
                                   WHERE S.KOD_2 = 'MERKEZ'";

                    if (!includeYM)
                    {
                        sql = sql.Replace("WHERE S.KOD_2 = 'MERKEZ'", "WHERE S.KOD_2 = 'MERKEZ' AND S.GRUP_KODU <> 'YMA'");
                    }

                    sql += " ORDER BY S.STOK_KODU ASC";

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
                                Unit2 = rdr["OLCU_BR2"]?.ToString().Trim(),
                                Unit3 = rdr["OLCU_BR3"]?.ToString().Trim(),
                                Pay1 = rdr["PAY_1"] != DBNull.Value ? Convert.ToDouble(rdr["PAY_1"]) : 0,
                                Payda1 = rdr["PAYDA_1"] != DBNull.Value ? Convert.ToDouble(rdr["PAYDA_1"]) : 0,
                                GroupCode = rdr["GRUP_KODU"]?.ToString().Trim() ?? "",
                                KdvOrani = rdr["KDV_ORANI"] != DBNull.Value ? Convert.ToDouble(rdr["KDV_ORANI"]) : (double?)null,
                                SatisFiat1 = rdr["SATIS_FIAT1"] != DBNull.Value ? Convert.ToDouble(rdr["SATIS_FIAT1"]) : 0,
                                AlisFiat1 = rdr["ALIS_FIAT1"] != DBNull.Value ? Convert.ToDouble(rdr["ALIS_FIAT1"]) : 0,
                                LastPurchasePrice = rdr["SON_ALIS_FIYATI"] != DBNull.Value ? Convert.ToDouble(rdr["SON_ALIS_FIYATI"]) : 0,
                                CevrimSayisi = rdr["CEVRIM_SAYISI"] != DBNull.Value ? Convert.ToDouble(rdr["CEVRIM_SAYISI"]) : 0,
                                Barcode1 = rdr["BARKOD1"]?.ToString().Trim() ?? "",
                                Barcode2 = rdr["BARKOD2"]?.ToString().Trim() ?? "",
                                Barcode3 = rdr["BARKOD3"]?.ToString().Trim() ?? "",
                                Kod1 = rdr["KOD_1"]?.ToString().Trim(),
                                Kod2 = rdr["KOD_2"]?.ToString().Trim(),
                                Kod3 = rdr["KOD_3"]?.ToString().Trim(),
                                Kod4 = rdr["KOD_4"]?.ToString().Trim(),
                                Kod5 = rdr["KOD_5"]?.ToString().Trim(),
                                MuhDetayKodu = rdr["MUH_DETAYKODU"]?.ToString().Trim(),
                                SaticiKodu = rdr["SATICI_KODU"]?.ToString().Trim(),
                                DepoKodu = rdr["DEPO_KODU"] != DBNull.Value ? Convert.ToInt32(rdr["DEPO_KODU"]) : 0,
                                En = rdr["EN"] != DBNull.Value ? Convert.ToDouble(rdr["EN"]) : 0,
                                Boy = rdr["BOY"] != DBNull.Value ? Convert.ToDouble(rdr["BOY"]) : 0,
                                Genislik = rdr["GENISLIK"] != DBNull.Value ? Convert.ToDouble(rdr["GENISLIK"]) : 0,
                                GumrukTarifeKodu = rdr["GUMRUKTARIFEKODU"]?.ToString().Trim(),
                                UreticiKodu = rdr["URETICI_KODU"]?.ToString().Trim(),
                                MinStockLevel = rdr["ASGARI_STOK"] != DBNull.Value ? Convert.ToDouble(rdr["ASGARI_STOK"]) : 0,
                                LeadTime = rdr["TEMIN_SURESI"] != DBNull.Value ? Convert.ToInt32(rdr["TEMIN_SURESI"]) : 0,
                                IsLocked = rdr["KILIT"]?.ToString().Trim() == "E",
                                IsAutoConsumption = rdr["SAFKOD"]?.ToString().Trim() == "E"
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
                    string sql = @"SELECT S.STOK_KODU, S.STOK_ADI, S.OLCU_BR1, S.OLCU_BR2, S.OLCU_BR3, S.PAY_1, S.PAYDA_1, 
                                   S.GRUP_KODU, S.KDV_ORANI, S.SATIS_FIAT1, S.ALIS_FIAT1, S.BARKOD1, S.BARKOD2, S.BARKOD3,
                                   S.KOD_1, S.KOD_2, S.KOD_3, S.KOD_4, S.KOD_5, S.MUH_DETAYKODU, S.SATICI_KODU, S.DEPO_KODU,
                                   S.EN, S.BOY, S.GENISLIK, S.GUMRUKTARIFEKODU, S.URETICI_KODU, S.ASGARI_STOK, S.TEMIN_SURESI, S.KILIT, S.SAFKOD,
                                   EK.KULL1N as CEVRIM_SAYISI,
                                   (SELECT TOP 1 STHAR_NF FROM TBLSTHAR WITH(NOLOCK) 
                                    WHERE STOK_KODU = S.STOK_KODU 
                                    AND GCKOD = 'G' AND STHAR_HTUR = 'A' 
                                    ORDER BY STHAR_TARIH DESC, STHAR_TESTAR DESC) as SON_ALIS_FIYATI
                                   FROM TBLSTSABIT S WITH(NOLOCK) 
                                   LEFT JOIN TBLSTSABITEK EK WITH(NOLOCK) ON S.STOK_KODU = EK.STOK_KODU
                                   WHERE S.STOK_KODU = @code";

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
                                Unit2 = rdr["OLCU_BR2"]?.ToString().Trim(),
                                Unit3 = rdr["OLCU_BR3"]?.ToString().Trim(),
                                Pay1 = rdr["PAY_1"] != DBNull.Value ? Convert.ToDouble(rdr["PAY_1"]) : 0,
                                Payda1 = rdr["PAYDA_1"] != DBNull.Value ? Convert.ToDouble(rdr["PAYDA_1"]) : 0,
                                GroupCode = rdr["GRUP_KODU"]?.ToString().Trim() ?? "",
                                KdvOrani = rdr["KDV_ORANI"] != DBNull.Value ? Convert.ToDouble(rdr["KDV_ORANI"]) : (double?)null,
                                SatisFiat1 = rdr["SATIS_FIAT1"] != DBNull.Value ? Convert.ToDouble(rdr["SATIS_FIAT1"]) : 0,
                                AlisFiat1 = rdr["ALIS_FIAT1"] != DBNull.Value ? Convert.ToDouble(rdr["ALIS_FIAT1"]) : 0,
                                LastPurchasePrice = rdr["SON_ALIS_FIYATI"] != DBNull.Value ? Convert.ToDouble(rdr["SON_ALIS_FIYATI"]) : 0,
                                CevrimSayisi = rdr["CEVRIM_SAYISI"] != DBNull.Value ? Convert.ToDouble(rdr["CEVRIM_SAYISI"]) : 0,
                                Barcode1 = rdr["BARKOD1"]?.ToString().Trim() ?? "",
                                Barcode2 = rdr["BARKOD2"]?.ToString().Trim() ?? "",
                                Barcode3 = rdr["BARKOD3"]?.ToString().Trim() ?? "",
                                Kod1 = rdr["KOD_1"]?.ToString().Trim(),
                                Kod2 = rdr["KOD_2"]?.ToString().Trim(),
                                Kod3 = rdr["KOD_3"]?.ToString().Trim(),
                                Kod4 = rdr["KOD_4"]?.ToString().Trim(),
                                Kod5 = rdr["KOD_5"]?.ToString().Trim(),
                                MuhDetayKodu = rdr["MUH_DETAYKODU"]?.ToString().Trim(),
                                SaticiKodu = rdr["SATICI_KODU"]?.ToString().Trim(),
                                DepoKodu = rdr["DEPO_KODU"] != DBNull.Value ? Convert.ToInt32(rdr["DEPO_KODU"]) : 0,
                                En = rdr["EN"] != DBNull.Value ? Convert.ToDouble(rdr["EN"]) : 0,
                                Boy = rdr["BOY"] != DBNull.Value ? Convert.ToDouble(rdr["BOY"]) : 0,
                                Genislik = rdr["GENISLIK"] != DBNull.Value ? Convert.ToDouble(rdr["GENISLIK"]) : 0,
                                GumrukTarifeKodu = rdr["GUMRUKTARIFEKODU"]?.ToString().Trim(),
                                UreticiKodu = rdr["URETICI_KODU"]?.ToString().Trim(),
                                MinStockLevel = rdr["ASGARI_STOK"] != DBNull.Value ? Convert.ToDouble(rdr["ASGARI_STOK"]) : 0,
                                LeadTime = rdr["TEMIN_SURESI"] != DBNull.Value ? Convert.ToInt32(rdr["TEMIN_SURESI"]) : 0,
                                IsLocked = rdr["KILIT"]?.ToString().Trim() == "E",
                                IsAutoConsumption = rdr["SAFKOD"]?.ToString().Trim() == "E"
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
