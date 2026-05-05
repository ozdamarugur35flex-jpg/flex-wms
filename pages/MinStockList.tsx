
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MinusCircle, Search, Save, XCircle, AlertTriangle, Package, Calendar, Clock, 
  TrendingDown, Info, MoreHorizontal, FileSpreadsheet, Printer, Loader2,
  // Added missing RotateCcw import
  RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StockCard } from '../types';
import { apiService } from '../api';

const MinStockList: React.FC = () => {
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingCode, setSavingCode] = useState<string | null>(null);

  const loadMinStocks = async () => {
    try {
      setLoading(true);
      const data = await apiService.stocks.getMinLevels();
      console.log("Min Stock Data Received:", data);
      setStocks(data);
    } catch (err) {
      console.error("Kritik stoklar yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMinStocks();
  }, []);

  const handleLevelChange = (code: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStocks(prev => prev.map(s => s.code === code ? { ...s, minStockLevel: numValue } : s));
  };

  const handleSave = async (code: string, minLevel: number) => {
    try {
      setSavingCode(code);
      const result = await (apiService.stocks as any).updateMinLevel(code, minLevel);
      if (result.success) {
        // Optional: show a success toast or icon
      }
    } catch (err) {
      console.error("Güncelleme hatası", err);
      alert("Hata oluştu");
    } finally {
      setSavingCode(null);
    }
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
      (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (s.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStocks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kritik Stoklar");
    XLSX.writeFile(workbook, "Kritik_Stok_Listesi.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <MinusCircle size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Minimum Stok Yönetimi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kritik Stok Seviyeleri</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={loadMinStocks} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Stok ara..." className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-rose-600" size={32} />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">Stok Tanımı</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Mevcut Stok</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Yıllık Satış (Çıkış)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Hedef Min. Seviye</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">İhtiyaç / Fark</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Grup (Kod-1)</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredStocks.map((stock, index) => {
                  const qty = Number(stock.quantity) || 0;
                  const min = Number(stock.minStockLevel) || 0;
                  const gap = Math.max(0, min - qty);
                  
                  // Boyama mantığı
                  let rowBg = "hover:bg-slate-50";
                  if (min > 0) {
                    if (qty < min) {
                      rowBg = "bg-rose-50/50 hover:bg-rose-50";
                    } else if (qty <= min * 1.1) {
                      rowBg = "bg-amber-50/50 hover:bg-amber-50";
                    }
                  }
                  
                  return (
                    <tr key={stock.code || stock.id || index} className={`${rowBg} transition-colors group border-b border-slate-100`}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800 uppercase">{stock.name || 'İSİMSİZ'}</p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{stock.code || 'KODSUZ'}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-blue-600">
                        {qty.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center font-black text-amber-600">
                        {(Number(stock.yearlySales) || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="number" 
                          className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-black text-center outline-none focus:border-rose-400 transition-colors shadow-sm"
                          value={stock.minStockLevel || 0}
                          onChange={(e) => handleLevelChange(stock.code, e.target.value)}
                        />
                      </td>
                      <td className={`px-6 py-4 text-center font-black ${gap > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {gap > 0 ? (
                          <div className="flex flex-col items-center">
                            <span>{gap.toLocaleString()}</span>
                            <span className="text-[9px] font-bold uppercase opacity-60">Eksik</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span>0</span>
                            <span className="text-[9px] font-bold uppercase opacity-60">Tamam</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">
                           {stock.code1 || '-'}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleSave(stock.code, stock.minStockLevel || 0)}
                          disabled={savingCode === stock.code}
                          className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                          title="Kaydet"
                        >
                          {savingCode === stock.code ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
        {!loading && filteredStocks.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Stok Tanımı Bulunamadı</div>}
      </div>
    </div>
  );
};

export default MinStockList;
