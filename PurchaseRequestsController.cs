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
                
                // Detay tablosunu bulalım (Öncelik Detay Tablosu)
                string tableFinderSql = @"
                    SELECT TOP 1 T.name 
                    FROM sys.tables T 
                    JOIN sys.columns C1 ON T.object_id = C1.object_id AND C1.name = 'STOK_KODU'
                    WHERE T.name LIKE '%TALEP%' AND T.name != 'TBLTALEP'
                    ORDER BY (SELECT COUNT(*) FROM sys.columns WHERE object_id = T.object_id AND name IN ('TALEP_NO', 'FISNO', 'MIKTAR')) DESC";
                
                string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql);
                
                // TBLTALEP'te STOK_KODU var mı kontrol edelim
                bool headerHasStock = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'STOK_KODU' AND object_id = OBJECT_ID('TBLTALEP')") > 0;

                string sql;
                if (!string.IsNullOrEmpty(itemTable))
                {
                    // Miktar ve Link kolonlarını bulalım
                    string qtyCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('MIKTAR', 'STHAR_GCMIK', 'Miktar')", new { table = itemTable }) ?? "MIKTAR";
                    string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }) ?? "TALEP_NO";

                    sql = $@"
                        SELECT 
                            RTRIM(T.TALEP_NO) as RequestNo,
                            RTRIM(ISNULL(D.STOK_KODU, {(headerHasStock ? "T.STOK_KODU" : "''")})) as StockCode,
                            ISNULL(S.STOK_ADI, '') as StockName,
                            ISNULL(D.{qtyCol}, {(headerHasStock ? "ISNULL(T.MIKTAR, 0)" : "0")}) as RequestedQty,
                            T.TARIH as Date,
                            ISNULL(T.ACIKLAMA, '') as BranchName,
                            ISNULL(T.ACIKLAMA, '') as Description,
                            ISNULL(T.DURUM, 'A') as Status,
                            ISNULL((SELECT SUM(H.STHAR_GCMIK * (CASE WHEN H.STHAR_GCKOD = 'G' THEN 1 ELSE -1 END)) FROM TBLSTHAR H WITH(NOLOCK) WHERE RTRIM(H.STOK_KODU) = RTRIM(ISNULL(D.STOK_KODU, {(headerHasStock ? "T.STOK_KODU" : "''")})) AND H.DEPO_KODU = 100), 0) as CurrentStock
                        FROM TBLTALEP T WITH(NOLOCK)
                        LEFT JOIN {itemTable} D WITH(NOLOCK) ON RTRIM(D.{linkCol}) = RTRIM(T.TALEP_NO)
                        LEFT JOIN TBLSTSABIT S WITH(NOLOCK) ON RTRIM(S.STOK_KODU) = RTRIM(ISNULL(D.STOK_KODU, {(headerHasStock ? "T.STOK_KODU" : "''")}))
                        ORDER BY T.TARIH DESC, T.TALEP_NO DESC";
                }
                else
                {
                    // Eğer detay tablosu yoksa TBLTALEP'e bakalım
                    sql = $@"
                        SELECT 
                            RTRIM(T.TALEP_NO) as RequestNo,
                            RTRIM(ISNULL({(headerHasStock ? "T.STOK_KODU" : "''")}, '')) as StockCode,
                            ISNULL(S.STOK_ADI, '') as StockName,
                            ISNULL({(headerHasStock ? "T.MIKTAR" : "0")}, 0) as RequestedQty,
                            T.TARIH as Date,
                            ISNULL(T.ACIKLAMA, '') as BranchName,
                            ISNULL(T.ACIKLAMA, '') as Description,
                            ISNULL(T.DURUM, 'A') as Status,
                            ISNULL((SELECT SUM(H.STHAR_GCMIK * (CASE WHEN H.STHAR_GCKOD = 'G' THEN 1 ELSE -1 END)) FROM TBLSTHAR H WITH(NOLOCK) WHERE RTRIM(H.STOK_KODU) = RTRIM({(headerHasStock ? "T.STOK_KODU" : "''")}) AND H.DEPO_KODU = 100), 0) as CurrentStock
                        FROM TBLTALEP T WITH(NOLOCK)
                        LEFT JOIN TBLSTSABIT S WITH(NOLOCK) ON RTRIM(S.STOK_KODU) = RTRIM({(headerHasStock ? "T.STOK_KODU" : "''")})
                        ORDER BY T.TARIH DESC, T.TALEP_NO DESC";
                }

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

                // TBLTALEP (Başlık)
                var talepCols = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLTALEP'")).ToList();
                if (talepCols.Count == 0) talepCols = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLTALEP')")).ToList();

                string kayitYapanCol = talepCols.FirstOrDefault(c => new[] { "KAYIT_YAPAN", "KAYITYAPANKUL" }.Contains(c)) ?? "KAYIT_YAPAN";
                
                string sqlHeader = $@"
                    INSERT INTO TBLTALEP (TALEP_NO, TARIH, ACIKLAMA, DEPO_KODU, DURUM, {kayitYapanCol}) 
                    VALUES (@RequestNo, @Date, @Branch, 100, 'A', 'FLX')";

                await conn.ExecuteAsync(sqlHeader, new {
                    RequestNo = nextNo,
                    Date = DateTime.Now,
                    Branch = dto.BranchName
                });

                // Detay Tablosu (Ürün ve Miktar Bilgisi)
                string tableFinderSql = "SELECT TOP 1 name FROM sys.tables WHERE name LIKE '%TALEP%' AND name != 'TBLTALEP' AND name IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'STOK_KODU')";
                string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql) ?? "TBLSTALEP";
                
                // Kolon varlıklarını kontrol et
                string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }) ?? "TALEP_NO";
                bool hasDateCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'TARIH' AND object_id = OBJECT_ID(@table)", new { table = itemTable }) > 0;
                bool hasFisNoCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'FISNO' AND object_id = OBJECT_ID(@table)", new { table = itemTable }) > 0;
                bool hasKayitCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'KAYIT_YAPAN' AND object_id = OBJECT_ID(@table)", new { table = itemTable }) > 0;
                bool hasStockCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'MEVCUT_STOK' AND object_id = OBJECT_ID(@table)", new { table = itemTable }) > 0;

                // Mevcut stoğu tekrar çekelim (TBLSTHAR üzerinden)
                decimal currentStock = await conn.QueryFirstOrDefaultAsync<decimal>(@"
                    SELECT ISNULL(SUM(STHAR_GCMIK * (CASE WHEN STHAR_GCKOD = 'G' THEN 1 ELSE -1 END)), 0) 
                    FROM TBLSTHAR WITH(NOLOCK) 
                    WHERE STOK_KODU = @StockCode AND DEPO_KODU = 100", new { dto.StockCode });

                var cols = new List<string> { linkCol, "STOK_KODU", "MIKTAR" };
                var vals = new List<string> { "@RequestNo", "@StockCode", "@Qty" };
                
                if (hasStockCol) { cols.Add("MEVCUT_STOK"); vals.Add("@CurrentStock"); }
                if (hasDateCol) { cols.Add("TARIH"); vals.Add("@Date"); }
                if (linkCol != "FISNO" && hasFisNoCol) { cols.Add("FISNO"); vals.Add("@RequestNo"); }
                if (hasKayitCol) { cols.Add("KAYIT_YAPAN"); vals.Add("'FLX'"); }

                // Eğer header'da STOK_KODU varsa orayı da güncelleyelim? (Bazı sistemlerde header'da miktar/stok alanı vardır)
                bool headerHasStock = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'STOK_KODU' AND object_id = OBJECT_ID('TBLTALEP')") > 0;
                if (headerHasStock) {
                    await conn.ExecuteAsync("UPDATE TBLTALEP SET STOK_KODU = @StockCode, MIKTAR = @Qty WHERE TALEP_NO = @RequestNo", new { StockCode = dto.StockCode, Qty = dto.RequestedQty, RequestNo = nextNo });
                }

                string sqlItem = $"INSERT INTO {itemTable} ({string.Join(", ", cols)}) VALUES ({string.Join(", ", vals)})";

                await conn.ExecuteAsync(sqlItem, new {
                    RequestNo = nextNo,
                    StockCode = dto.StockCode,
                    Qty = dto.RequestedQty,
                    CurrentStock = currentStock,
                    Date = DateTime.Now
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
                
                // Detay Tablosu Tesbiti
                string tableFinderSql = "SELECT TOP 1 name FROM sys.tables WHERE name LIKE '%TALEP%' AND name != 'TBLTALEP' AND name IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'STOK_KODU')";
                string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql) ?? "TBLSTALEP";

                using var trans = conn.BeginTransaction();
                try {
                    foreach(var item in items) {
                        string lastNo = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 TALEP_NO FROM TBLTALEP WHERE TALEP_NO LIKE 'T%' ORDER BY TALEP_NO DESC", transaction: trans);
                        string nextNo = "T00000000000001";
                        if (!string.IsNullOrEmpty(lastNo)) {
                            string numeric = lastNo.Substring(1);
                            if (long.TryParse(numeric, out long val)) {
                                nextNo = "T" + (val + 1).ToString().PadLeft(14, '0');
                            }
                        }

                        // Başlık
                        var talepCols = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLTALEP'", transaction: trans)).ToList();
                        if (talepCols.Count == 0) talepCols = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLTALEP')", transaction: trans)).ToList();
                        string kayitYapanCol = talepCols.FirstOrDefault(c => new[] { "KAYIT_YAPAN", "KAYITYAPANKUL" }.Contains(c)) ?? "KAYIT_YAPAN";

                        await conn.ExecuteAsync($@"
                            INSERT INTO TBLTALEP (TALEP_NO, TARIH, ACIKLAMA, DEPO_KODU, DURUM, {kayitYapanCol}) 
                            VALUES (@RequestNo, @Date, @Branch, 100, 'A', 'FLX')", 
                            new { RequestNo = nextNo, Date = DateTime.Now, Branch = item.BranchName }, transaction: trans);

                        // Detay
                        // Mevcut stoğu çekelim (TBLSTHAR üzerinden)
                        decimal currentStock = await conn.QueryFirstOrDefaultAsync<decimal>(@"
                            SELECT ISNULL(SUM(STHAR_GCMIK * (CASE WHEN STHAR_GCKOD = 'G' THEN 1 ELSE -1 END)), 0) 
                            FROM TBLSTHAR WITH(NOLOCK) 
                            WHERE STOK_KODU = @StockCode AND DEPO_KODU = 100", new { StockCode = item.StockCode }, transaction: trans);

                        string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }, transaction: trans) ?? "TALEP_NO";
                        bool hasStockCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'MEVCUT_STOK' AND object_id = OBJECT_ID(@table)", new { table = itemTable }, transaction: trans) > 0;
                        bool hasDateCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'TARIH' AND object_id = OBJECT_ID(@table)", new { table = itemTable }, transaction: trans) > 0;
                        bool hasFisNoCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'FISNO' AND object_id = OBJECT_ID(@table)", new { table = itemTable }, transaction: trans) > 0;
                        bool hasKayitCol = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'KAYIT_YAPAN' AND object_id = OBJECT_ID(@table)", new { table = itemTable }, transaction: trans) > 0;

                        var cols = new List<string> { linkCol, "STOK_KODU", "MIKTAR" };
                        var vals = new List<string> { "@RequestNo", "@StockCode", "@Qty" };
                        
                        if (hasStockCol) { cols.Add("MEVCUT_STOK"); vals.Add("@CurrentStock"); }
                        if (hasDateCol) { cols.Add("TARIH"); vals.Add("@Date"); }
                        if (linkCol != "FISNO" && hasFisNoCol) { cols.Add("FISNO"); vals.Add("@RequestNo"); }
                        if (hasKayitCol) { cols.Add("KAYIT_YAPAN"); vals.Add("'FLX'"); }

                        // Eğer header'da STOK_KODU varsa orayı da güncelleyelim
                        bool headerHasStock = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'STOK_KODU' AND object_id = OBJECT_ID('TBLTALEP')", transaction: trans) > 0;
                        if (headerHasStock) {
                            await conn.ExecuteAsync("UPDATE TBLTALEP SET STOK_KODU = @StockCode, MIKTAR = @Qty WHERE TALEP_NO = @RequestNo", new { StockCode = item.StockCode, Qty = item.RequestedQty, RequestNo = nextNo }, transaction: trans);
                        }

                        string sqlItem = $"INSERT INTO {itemTable} ({string.Join(", ", cols)}) VALUES ({string.Join(", ", vals)})";

                        await conn.ExecuteAsync(sqlItem, new {
                            RequestNo = nextNo,
                            StockCode = item.StockCode,
                            Qty = item.RequestedQty,
                            CurrentStock = currentStock,
                            Date = DateTime.Now
                        }, transaction: trans);
                    }
                    trans.Commit();
                    return Ok(new { success = true });
                }
                catch {
                    trans.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] StatusUpdateDto dto)
        {
            if (dto == null || dto.RequestNos == null || dto.RequestNos.Count == 0) 
                return BadRequest("Geçersiz veri.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                // Not/Red Nedeni için ACIKLAMA2 veya benzeri bir kolon var mı kontrol edelim, yoksa ACIKLAMA'ya ekleyelim
                string sql = "UPDATE TBLTALEP SET DURUM = @Status WHERE TALEP_NO IN @RequestNos";
                
                // Safety check for ACIKLAMA length (Netsis typical limit 100)
                if (!string.IsNullOrEmpty(dto.Reason)) {
                    string reason = dto.Reason;
                    if (reason.Length > 50) reason = reason.Substring(0, 47) + "...";
                    sql = "UPDATE TBLTALEP SET DURUM = @Status, ACIKLAMA = LEFT(ISNULL(ACIKLAMA, '') + ' [NOT: ' + @Reason + ']', 100) WHERE TALEP_NO IN @RequestNos";
                    await conn.ExecuteAsync(sql, new { Status = dto.NewStatus, RequestNos = dto.RequestNos, Reason = reason });
                }
                else {
                    await conn.ExecuteAsync(sql, new { Status = dto.NewStatus, RequestNos = dto.RequestNos });
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("update-item-qty")]
        public async Task<IActionResult> UpdateItemQty([FromBody] QtyUpdateDto dto)
        {
            if (dto == null) return BadRequest("Geçersiz veri.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                string tableFinderSql = "SELECT TOP 1 name FROM sys.tables WHERE name LIKE '%TALEP%' AND name != 'TBLTALEP' AND name IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'STOK_KODU')";
                string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql) ?? "TBLSTALEP";
                
                string qtyCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('MIKTAR', 'STHAR_GCMIK', 'Miktar')", new { table = itemTable }) ?? "MIKTAR";
                string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }) ?? "TALEP_NO";

                string sql = $@"UPDATE {itemTable} SET {qtyCol} = @NewQty WHERE RTRIM({linkCol}) = RTRIM(@RequestNo) AND RTRIM(STOK_KODU) = RTRIM(@StockCode)";
                await conn.ExecuteAsync(sql, new { dto.NewQty, dto.RequestNo, dto.StockCode });

                // TBLTALEP'te de miktar varsa orayı da güncelleyelim
                bool headerHasStock = await conn.QueryFirstOrDefaultAsync<int>("SELECT COUNT(*) FROM sys.columns WHERE name = 'STOK_KODU' AND object_id = OBJECT_ID('TBLTALEP')") > 0;
                if (headerHasStock) {
                    await conn.ExecuteAsync("UPDATE TBLTALEP SET MIKTAR = @NewQty WHERE TALEP_NO = @RequestNo AND STOK_KODU = @StockCode", new { dto.NewQty, dto.RequestNo, dto.StockCode });
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{requestNo}")]
        public async Task<IActionResult> Delete(string requestNo)
        {
            if (string.IsNullOrEmpty(requestNo)) return BadRequest("Geçersiz talep no.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                using var trans = conn.BeginTransaction();
                try 
                {
                    // Detay Tablosu Tesbiti
                    string tableFinderSql = "SELECT TOP 1 name FROM sys.tables WHERE name LIKE '%TALEP%' AND name != 'TBLTALEP' AND name IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'STOK_KODU')";
                    string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql, null, trans) ?? "TBLSTALEP";
                    string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }, trans) ?? "TALEP_NO";

                    // Önce detayları sil
                    await conn.ExecuteAsync($"DELETE FROM {itemTable} WHERE RTRIM({linkCol}) = RTRIM(@RequestNo)", new { RequestNo = requestNo }, trans);

                    // Sonra başlığı sil
                    await conn.ExecuteAsync("DELETE FROM TBLTALEP WHERE RTRIM(TALEP_NO) = RTRIM(@RequestNo)", new { RequestNo = requestNo }, trans);

                    trans.Commit();
                    return Ok(new { success = true });
                }
                catch
                {
                    trans.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{requestNo}/convert-to-order")]
        public async Task<IActionResult> ConvertToOrder(string requestNo, [FromBody] OrderConvertDto dto)
        {
            if (string.IsNullOrEmpty(requestNo) || dto == null || string.IsNullOrEmpty(dto.CustomerCode))
                return BadRequest("Geçersiz veri.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                using var trans = conn.BeginTransaction();
                try
                {
                    // 1. Talebi Bul
                    string tableFinderSql = "SELECT TOP 1 name FROM sys.tables WHERE name LIKE '%TALEP%' AND name != 'TBLTALEP' AND name IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'STOK_KODU')";
                    string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql, transaction: trans) ?? "TBLSTALEP";
                    string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }, transaction: trans) ?? "TALEP_NO";
                    string qtyCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('MIKTAR', 'STHAR_GCMIK', 'Miktar')", new { table = itemTable }, transaction: trans) ?? "MIKTAR";

                    var items = (await conn.QueryAsync($@"
                        SELECT RTRIM(STOK_KODU) as StockCode, {qtyCol} as Qty 
                        FROM {itemTable} 
                        WHERE RTRIM({linkCol}) = RTRIM(@requestNo)", new { requestNo }, transaction: trans)).ToList();

                    if (items.Count == 0) return BadRequest("Talep içeriği boş.");

                    // 2. Tablo Kolonlarını Tespit Et
                    var masColsAll = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLSIPAMAS'", transaction: trans)).ToList();
                    var traColsAll = (await conn.QueryAsync<string>("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'TBLSIPATRA'", transaction: trans)).ToList();

                    if (masColsAll.Count == 0) masColsAll = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS')", transaction: trans)).ToList();
                    if (traColsAll.Count == 0) traColsAll = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA')", transaction: trans)).ToList();

                    string headerNoCol = masColsAll.FirstOrDefault(c => new[] { "FATIRS_NO", "SIPARIS_NO", "FISNO" }.Contains(c)) ?? "FISNO";
                    string itemLinkCol = traColsAll.FirstOrDefault(c => new[] { "FATIRS_NO", "SIPARIS_NO", "FISNO" }.Contains(c)) ?? "FISNO";

                    string lastOrderNo = await conn.QueryFirstOrDefaultAsync<string>($@"SELECT TOP 1 {headerNoCol} FROM TBLSIPAMAS WHERE FTIRSIP = '7' AND {headerNoCol} LIKE 'T%' ORDER BY {headerNoCol} DESC", transaction: trans);
                    string nextOrderNo = "T00000000000001";
                    if (!string.IsNullOrEmpty(lastOrderNo))
                    {
                        string numericPart = new string(lastOrderNo.Where(char.IsDigit).ToArray());
                        if (long.TryParse(numericPart, out long val))
                            nextOrderNo = "T" + (val + 1).ToString().PadLeft(14, '0');
                    }

                    // 3. Sipariş Başlığını Kaydet (TBLSIPAMAS)
                    bool hasKayitKul = masColsAll.Contains("KAYITYAPANKUL");
                    bool hasKayitTarihi = masColsAll.Contains("KAYITTARIHI");
                    bool hasSubeKodu = masColsAll.Contains("SUBE_KODU");
                    bool hasIsletmeKodu = masColsAll.Contains("ISLETME_KODU");

                    var masCols = new List<string> { headerNoCol, "CARI_KODU", "TARIH", "FTIRSIP", "TIPI", "ACIKLAMA" };
                    var masVals = new List<string> { "@FisNo", "@CustomerCode", "@Date", "'7'", "2", "@Description" };

                    if (hasKayitKul) { masCols.Add("KAYITYAPANKUL"); masVals.Add("'FLX'"); }
                    if (hasKayitTarihi) { masCols.Add("KAYITTARIHI"); masVals.Add("@RegDate"); }
                    if (hasSubeKodu) { masCols.Add("SUBE_KODU"); masVals.Add("0"); }
                    if (hasIsletmeKodu) { masCols.Add("ISLETME_KODU"); masVals.Add("0"); }

                    string sqlMas = $"INSERT INTO TBLSIPAMAS ({string.Join(", ", masCols)}) VALUES ({string.Join(", ", masVals)})";

                    var masParams = new { 
                        FisNo = nextOrderNo.Length > 15 ? nextOrderNo.Substring(0, 15) : nextOrderNo, 
                        CustomerCode = dto.CustomerCode.Length > 15 ? dto.CustomerCode.Substring(0, 15) : dto.CustomerCode, 
                        Date = DateTime.Now, 
                        Description = requestNo.Length > 20 ? requestNo.Substring(0, 20) : requestNo, 
                        RegDate = DateTime.Now 
                    };

                    try {
                        await conn.ExecuteAsync(sqlMas, masParams, transaction: trans);
                    } catch (Exception ex) {
                        return BadRequest(new { 
                            message = "Sipariş Başlık Kayıt Hatası (TBLSIPAMAS)", 
                            sql = sqlMas, 
                            data = masParams,
                            detectedColumns = masColsAll,
                            error = ex.Message 
                        });
                    }

                    // 4. Sipariş Satırlarını Kaydet (TBLSIPATRA)
                    int sira = 1;
                    bool hasTraitKayitKul = traColsAll.Contains("KAYITYAPANKUL");
                    bool hasTraSubeKodu = traColsAll.Contains("SUBE_KODU");
                    bool hasTraIsletmeKodu = traColsAll.Contains("ISLETME_KODU");
                    
                    foreach (var item in items)
                    {
                        // Detect unit column in TBLSTSABIT
                        var sCols = (await conn.QueryAsync<string>("SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSTSABIT')", transaction: trans)).ToList();
                        string sUnitCol = sCols.FirstOrDefault(c => new[] { "OLCUBR1", "OLCU1", "UNIT1", "OLCUBR" }.Contains(c));
                        
                        string unitName = "ADET";
                        if (!string.IsNullOrEmpty(sUnitCol)) {
                            unitName = await conn.QueryFirstOrDefaultAsync<string>($@"SELECT RTRIM({sUnitCol}) FROM TBLSTSABIT WHERE STOK_KODU = @StockCode", new { StockCode = item.StockCode }, transaction: trans) ?? "ADET";
                        }
                        
                        // OLCUBR is tinyint (numeric index) in TBLSIPATRA for this DB version
                        int unit = 1; 

                        var traCols = new List<string> { itemLinkCol, "STOK_KODU", "STHAR_GCMIK", "STHAR_TARIH", "STHAR_FTIRSIP", "STHAR_GCKOD", "STHAR_HTUR", "SIRA", "OLCUBR", "STHAR_KDV" };
                        var traVals = new List<string> { "@FisNo", "@StockCode", "@Qty", "@Date", "'7'", "'G'", "'H'", "@Sira", "@Unit", "20" };

                        if (hasTraitKayitKul) { traCols.Add("KAYITYAPANKUL"); traVals.Add("'FLX'"); }
                        if (hasTraSubeKodu) { traCols.Add("SUBE_KODU"); traVals.Add("0"); }
                        if (hasTraIsletmeKodu) { traCols.Add("ISLETME_KODU"); traVals.Add("0"); }

                        string sqlTra = $"INSERT INTO TBLSIPATRA ({string.Join(", ", traCols)}) VALUES ({string.Join(", ", traVals)})";

                        var traParams = new { 
                            FisNo = nextOrderNo.Length > 15 ? nextOrderNo.Substring(0, 15) : nextOrderNo, 
                            StockCode = item.StockCode.Length > 35 ? item.StockCode.Substring(0, 35) : item.StockCode, 
                            Qty = item.Qty, 
                            Date = DateTime.Now, 
                            Sira = sira++, 
                            Unit = unit 
                        };

                        try {
                            await conn.ExecuteAsync(sqlTra, traParams, transaction: trans);
                        } catch (Exception ex) {
                            return BadRequest(new { 
                                message = "Sipariş Satır Kayıt Hatası (TBLSIPATRA)", 
                                sql = sqlTra, 
                                data = traParams,
                                detectedColumns = traColsAll,
                                error = ex.Message 
                            });
                        }
                    }

                    // 5. Talep Durumunu Güncelle
                    await conn.ExecuteAsync("UPDATE TBLTALEP SET DURUM = 'S' WHERE RTRIM(TALEP_NO) = RTRIM(@requestNo)", new { requestNo }, transaction: trans);

                    trans.Commit();
                    return Ok(new { success = true, orderNo = nextOrderNo });
                }
                catch
                {
                    trans.Rollback();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{requestNo}/previous-suppliers")]
        public async Task<IActionResult> GetPreviousSuppliers(string requestNo)
        {
            try
            {
                using var conn = new SqlConnection(_connectionString);
                string tableFinderSql = "SELECT TOP 1 name FROM sys.tables WHERE name LIKE '%TALEP%' AND name != 'TBLTALEP' AND name IN (SELECT TABLE_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE COLUMN_NAME = 'STOK_KODU')";
                string itemTable = await conn.QueryFirstOrDefaultAsync<string>(tableFinderSql) ?? "TBLSTALEP";
                string linkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID(@table) AND name IN ('TALEP_NO', 'FISNO', 'TALEPNO')", new { table = itemTable }) ?? "TALEP_NO";

                string headerNoCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')") ?? "FISNO";
                string itemNoLinkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')") ?? "FISNO";

                string sql = $@"
                    SELECT DISTINCT RTRIM(M.CARI_KODU) 
                    FROM TBLSIPATRA T WITH(NOLOCK)
                    JOIN TBLSIPAMAS M WITH(NOLOCK) ON T.{itemNoLinkCol} = M.{headerNoCol}
                    WHERE RTRIM(T.STOK_KODU) IN (SELECT RTRIM(STOK_KODU) FROM {itemTable} WHERE RTRIM({linkCol}) = RTRIM(@requestNo))";
                
                var supplierCodes = await conn.QueryAsync<string>(sql, new { requestNo });
                return Ok(supplierCodes);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{requestNo}/cancel-conversion")]
        public async Task<IActionResult> CancelConversion(string requestNo)
        {
            if (string.IsNullOrEmpty(requestNo)) return BadRequest("Geçersiz talep no.");

            try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                using var trans = conn.BeginTransaction();
                try
                {
                    // 1. Talebe Atanmış Siparişleri Sil
                    string headerNoCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPAMAS') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')", transaction: trans) ?? "FISNO";
                    string itemNoLinkCol = await conn.QueryFirstOrDefaultAsync<string>("SELECT TOP 1 name FROM sys.columns WHERE object_id = OBJECT_ID('TBLSIPATRA') AND name IN ('FISNO', 'FATIRS_NO', 'SIPARIS_NO')", transaction: trans) ?? "FISNO";

                    string orderNo = await conn.QueryFirstOrDefaultAsync<string>($@"SELECT TOP 1 {headerNoCol} FROM TBLSIPAMAS WHERE ACIKLAMA LIKE @desc", new { desc = "%Talep No: " + requestNo + "%" }, transaction: trans);
                    
                    if (!string.IsNullOrEmpty(orderNo))
                    {
                        await conn.ExecuteAsync($"DELETE FROM TBLSIPATRA WHERE {itemNoLinkCol} = @orderNo AND STHAR_FTIRSIP = '2'", new { orderNo }, transaction: trans);
                        await conn.ExecuteAsync($"DELETE FROM TBLSIPAMAS WHERE {headerNoCol} = @orderNo AND FTIRSIP = '2'", new { orderNo }, transaction: trans);
                    }

                    // 2. Talep Durumunu İptal Olarak Güncelle
                    await conn.ExecuteAsync("UPDATE TBLTALEP SET DURUM = 'I' WHERE RTRIM(TALEP_NO) = RTRIM(@requestNo)", new { requestNo }, transaction: trans);

                    trans.Commit();
                    return Ok(new { success = true });
                }
                catch
                {
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

    public class OrderConvertDto
    {
        public string CustomerCode { get; set; }
    }

    public class StatusUpdateDto
    {
        public List<string> RequestNos { get; set; }
        public string NewStatus { get; set; }
        public string? Reason { get; set; }
    }

    public class QtyUpdateDto
    {
        public string RequestNo { get; set; }
        public string StockCode { get; set; }
        public decimal NewQty { get; set; }
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
