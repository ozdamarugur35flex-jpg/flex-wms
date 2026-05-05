
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
            {/* Fix: Added missing RotateCcw import */}
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
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Stok Tanımı</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Mevcut</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Min. Seviye</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Max. Seviye</th>
                <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredStocks.map((stock, index) => (
                  <tr key={stock.code || stock.id || index} className="hover:bg-rose-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 uppercase">{stock.name || 'İSİMSİZ'}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{stock.code || 'KODSUZ'}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-rose-600">{(Number(stock.quantity) || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-black text-slate-400">{(Number(stock.minStockLevel) || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center font-black text-slate-300">{(Number(stock.maxStockLevel) || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right"><MoreHorizontal size={18} className="text-slate-300" /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
        {!loading && filteredStocks.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Kritik Stok Bulunmamaktadır</div>}
      </div>
    </div>
  );
};

export default MinStockList;
