
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, PackageCheck, Save, XCircle, Camera, Info,
  FileSpreadsheet, Edit2, RotateCcw, Database, MoreHorizontal, Loader2,
  Lock, Unlock, Ruler, ArrowRight, X
} from 'lucide-react';
import { StockCard } from '../types';
import { apiService } from '../api';

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showYM, setShowYM] = useState(false); // chkYMListelenmesin

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await apiService.stocks.getAll(!showYM);
      setStocks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, [showYM]);

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <PackageCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Netsis Stok Yönetimi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">STSABIT / STSABITEK Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
              checked={showYM}
              onChange={(e) => setShowYM(e.target.checked)}
            />
            <span className="text-[10px] font-black text-slate-600 uppercase">YMA Grubu Hariç</span>
          </label>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
            <Plus size={18} /> Yeni Stok
          </button>
          <button onClick={loadStocks} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50">
            <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Stok adı, kod veya üretici kodu ile ara..." 
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
               <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Ürün Tanımı</th>
                  <th className="px-8 py-5 text-center">Birim</th>
                  <th className="px-8 py-5 text-center">Kilit</th>
                  <th className="px-8 py-5 text-right">Mevcut Bakiye</th>
                  <th className="px-8 py-5 text-right">Son Alış</th>
                  <th className="px-8 py-5 text-right w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-indigo-50/20 transition-all group cursor-pointer">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                          <Database size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 uppercase">{stock.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{stock.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded border border-slate-200">{stock.unit1}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {stock.isLocked ? <Lock size={16} className="text-rose-500 mx-auto" /> : <Unlock size={16} className="text-emerald-500 mx-auto" />}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`text-lg font-black tracking-tighter ${stock.quantity < stock.minStockLevel ? 'text-rose-600' : 'text-slate-800'}`}>
                        {stock.quantity?.toLocaleString()}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-emerald-600">₺{stock.lastPurchasePrice?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockList;
