
import React, { useState, useEffect } from 'react';
import { 
  Warehouse as WarehouseIcon, Plus, Save, Trash2, RotateCcw, FileSpreadsheet, XCircle, Search, Filter,
  ChevronLeft, ChevronRight, MoreHorizontal, Lock, Unlock, MapPin, AlertCircle, Database, CheckCircle2,
  XSquare, Settings2, Loader2
} from 'lucide-react';
import { Warehouse } from '../types';
import { apiService } from '../api';

const WarehouseList: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadWarehouses = async () => {
    setLoading(true);
    const data = await apiService.warehouses.getAll();
    setWarehouses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const filteredWarehouses = warehouses.filter(w => 
    (w.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (w.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <WarehouseIcon size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Depo Tanımlama</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-xs">Netsis Depo Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={loadWarehouses} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-md">
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> Listele
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Depo kodu veya ismi ile filtrele..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Depo Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Lokasyon Takibi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Son Hareket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarehouses.map((warehouse, index) => (
                  <tr key={warehouse.code || warehouse.id || index} className="hover:bg-emerald-50/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                          <Database size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{warehouse.name || 'İSİMSİZ DEPO'}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">KOD: {warehouse.code || 'KODSUZ'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${warehouse.isLocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {warehouse.isLocked ? 'KİLİTLİ' : 'AÇIK'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {warehouse.isLocationTracking ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XSquare size={18} className="text-slate-300" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-xs text-slate-500">{warehouse.lastActivity || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredWarehouses.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Depo Verisi Yok</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseList;
