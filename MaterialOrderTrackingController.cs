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
    [Route("material-order-tracking")]
    public class MaterialOrderTrackingController : ControllerBase
    {
        private readonly string _connectionString = "Server=.\\TUCKDB;Database=MERACK26;User Id=sa;Password=Pn123@;TrustServerCertificate=True;";

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                
                // Detect column names common in Netsis versions
                var masCols = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLSIPAMAS'")).ToList();
                var traCols = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLSIPATRA'")).ToList();
                
                if (masCols.Count == 0) masCols = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS')")).ToList();
                if (traCols.Count == 0) traCols = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA')")).ToList();

                string headerNoCol = masCols.FirstOrDefault(c => new[] { "FATIRS_NO", "SIPARIS_NO", "FISNO" }.Contains(c)) ?? "FISNO";
                string itemNoCol = traCols.FirstOrDefault(c => new[] { "FATIRS_NO", "SIPARIS_NO", "FISNO" }.Contains(c)) ?? "FISNO";
                
                // STHAR tablosunda sipariş numarasının tutulduğu kolonu daha geniş bir listeyle arayalım
                var stharCols = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLSTHAR'")).ToList();
                if (stharCols.Count == 0) stharCols = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSTHAR')")).ToList();
                
                string stharOrderCol = stharCols.FirstOrDefault(c => new[] { "STHAR_SIPNUM", "SIPARIS_NO", "FATIRS_NO", "FISNO" }.Contains(c)) ?? "FISNO";
                
                bool hasSubeKodu = masCols.Contains("SUBE_KODU") && traCols.Contains("SUBE_KODU");

                // FTIRSIP detection: Try '7' first (New preference), then '2', then check what exists
                string ftirsipFilter = "RTRIM(D.STHAR_FTIRSIP) = '7'";
                var check7 = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM TBLSIPATRA WITH(NOLOCK) WHERE RTRIM(STHAR_FTIRSIP) = '7' AND RTRIM(STHAR_GCKOD) = 'G'");
                if (check7 == 0) {
                    var check2 = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM TBLSIPATRA WITH(NOLOCK) WHERE RTRIM(STHAR_FTIRSIP) = '2' AND RTRIM(STHAR_GCKOD) = 'G'");
                    if (check2 > 0) {
                        ftirsipFilter = "RTRIM(D.STHAR_FTIRSIP) = '2'";
                    } else {
                        var altFtirsip = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 STHAR_FTIRSIP FROM TBLSIPATRA WITH(NOLOCK) WHERE RTRIM(STHAR_GCKOD) = 'G' ORDER BY STHAR_TARIH DESC");
                        if (!string.IsNullOrEmpty(altFtirsip)) {
                            ftirsipFilter = $"RTRIM(D.STHAR_FTIRSIP) = '{altFtirsip}'";
                        }
                    }
                }

                string sql = $@"
                    SELECT 
                        RTRIM(D.{itemNoCol}) + '-' + CAST(D.SIRA as varchar) as Id,
                        RTRIM(D.{itemNoCol}) as OrderNo,
                        RTRIM(D.STOK_KODU) as StockCode,
                        ISNULL(S.STOK_ADI, '') as StockName,
                        RTRIM(H.CARI_KODU) as SupplierCode,
                        ISNULL(C.CARI_ISIM, '') as SupplierName,
                        H.TARIH as OrderDate,
                        D.STHAR_GCMIK as OrderedQuantity,
                        ISNULL(D.STHAR_GCMIK2, 0) as ReceivedQuantity,
                        (D.STHAR_GCMIK - ISNULL(D.STHAR_GCMIK2, 0)) as RemainingQuantity,
                        RTRIM(D.OLCUBR) as Unit,
                        CASE 
                            WHEN ISNULL(D.STHAR_GCMIK2, 0) = 0 THEN 'Açık'
                            WHEN ISNULL(D.STHAR_GCMIK2, 0) < D.STHAR_GCMIK THEN 'Kısmi'
                            ELSE 'Kapalı'
                        END as Status,
                        (SELECT TOP 1 CONVERT(varchar, STHAR_TARIH, 104) FROM TBLSTHAR WITH(NOLOCK) WHERE {stharOrderCol} = D.{itemNoCol} AND STOK_KODU = D.STOK_KODU AND STHAR_FTIRSIP = '1' ORDER BY STHAR_TARIH DESC) as LastDeliveryDate,
                        (SELECT TOP 1 RTRIM(FISNO) FROM TBLSTHAR WITH(NOLOCK) WHERE {stharOrderCol} = D.{itemNoCol} AND STOK_KODU = D.STOK_KODU AND STHAR_FTIRSIP = '1' ORDER BY STHAR_TARIH DESC) as LastWaybillNo
                    FROM TBLSIPATRA D WITH(NOLOCK)
                    JOIN TBLSIPAMAS H WITH(NOLOCK) ON RTRIM(H.{headerNoCol}) = RTRIM(D.{itemNoCol}) 
                        AND RTRIM(H.FTIRSIP) = RTRIM(D.STHAR_FTIRSIP)
                        {(hasSubeKodu ? "AND H.SUBE_KODU = D.SUBE_KODU" : "")}
                    LEFT JOIN TBLSTSABIT S WITH(NOLOCK) ON S.STOK_KODU = D.STOK_KODU
                    LEFT JOIN TBLCASABIT C WITH(NOLOCK) ON C.CARI_KOD = H.CARI_KODU
                    WHERE {ftirsipFilter} AND RTRIM(D.STHAR_GCKOD) = 'G'
                    ORDER BY H.TARIH DESC, D.{itemNoCol} DESC";

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
