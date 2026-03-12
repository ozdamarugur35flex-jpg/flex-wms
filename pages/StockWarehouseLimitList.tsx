
import React, { useState, useEffect } from 'react';
import { 
  Gauge, RotateCcw, FileSpreadsheet, Search, 
  Package, Warehouse as WarehouseIcon, ArrowDownCircle, ArrowUpCircle, Target, Loader2
} from 'lucide-react';
import { StockAmbarLimit } from '../types';
import { apiService } from '../api';

const StockWarehouseLimitList: React.FC = () => {
  const [limits, setLimits] = useState<StockAmbarLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadLimits = async () => {
    try {
      setLoading(true);
      const data = await apiService.warehouses.getStockAmbarLimits();
      setLimits(data);
    } catch (err) {
      console.error("Stok depo limitleri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLimits();
  }, []);

  const filteredLimits = limits.filter(l => 
    (l.stockCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (l.stockName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    l.warehouseCode.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Gauge size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Stok Depo Limitleri</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TBLSTOKAMBAR Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={loadLimits} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} /> Yenile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Stok kodu, ismi veya depo kodu ile filtrele..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limit Verileri Alınıyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Stok Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Depo</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Min Seviye</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Max Seviye</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Sipariş Noktası</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLimits.map((limit, index) => (
                  <tr key={limit.id || index} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{limit.stockName || 'İSİMSİZ STOK'}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">{limit.stockCode || 'KODSUZ'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <WarehouseIcon size={14} className="text-slate-400 mb-1" />
                        <span className="text-sm font-black text-slate-700">{limit.warehouseCode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <ArrowDownCircle size={14} className="text-rose-500 mb-1" />
                        <span className="text-sm font-black text-slate-700">{Number(limit.minLevel || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <ArrowUpCircle size={14} className="text-emerald-500 mb-1" />
                        <span className="text-sm font-black text-slate-700">{Number(limit.maxLevel || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <Target size={14} className="text-amber-500 mb-1" />
                        <span className="text-sm font-black text-slate-700">{Number(limit.reorderPoint || 0).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLimits.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Limit Tanımı Bulunamadı</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockWarehouseLimitList;
