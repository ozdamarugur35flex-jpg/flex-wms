
import React, { useState, useEffect } from 'react';
import { 
  Gauge, Plus, RotateCcw, FileSpreadsheet, Search, 
  Warehouse as WarehouseIcon, LayoutGrid, Weight, Box, Loader2
} from 'lucide-react';
import { CellCapacity } from '../types';
import { apiService } from '../api';

const CellCapacityList: React.FC = () => {
  const [capacities, setCapacities] = useState<CellCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCapacities = async () => {
    try {
      setLoading(true);
      const data = await apiService.warehouses.getCellCapacities();
      setCapacities(data);
    } catch (err) {
      console.error("Hücre kapasite verileri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapacities();
  }, []);

  const filteredCapacities = capacities.filter(c => 
    (c.cellCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (c.warehouseCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Gauge size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Hücre Kapasite Tanım</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">TBLHUCRE Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={loadCapacities} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={`text-sky-600 ${loading ? 'animate-spin' : ''}`} /> Yenile
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
            placeholder="Depo veya hücre kodu ile filtrele..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-amber-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasite Verileri Alınıyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hücre Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tip</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar Kapasite</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Ağırlık Kapasite</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hacim Kapasite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCapacities.map((cap, index) => (
                  <tr key={cap.id || index} className="hover:bg-amber-50/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                          <LayoutGrid size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 font-mono">{cap.cellCode || 'KODSUZ'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DEPO: {cap.warehouseCode || '---'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {cap.cellType || 'RAF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <Box size={14} className="text-sky-500 mb-1" />
                        <span className="text-sm font-black text-slate-700">{Number(cap.capacityQty || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">ADET</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <Weight size={14} className="text-emerald-500 mb-1" />
                        <span className="text-sm font-black text-slate-700">{Number(cap.capacityWeight || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">KG</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-400 rounded-sm mb-1" />
                        <span className="text-sm font-black text-slate-700">{Number(cap.capacityVolume || 0).toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">M³</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCapacities.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Kapasite Tanımı Bulunamadı</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CellCapacityList;
