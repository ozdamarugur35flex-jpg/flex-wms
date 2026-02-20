
import React, { useState, useEffect } from 'react';
import { 
  Gauge, Plus, Save, RotateCcw, FileSpreadsheet, XCircle, Search, AlertTriangle,
  Warehouse as WarehouseIcon, CheckCircle2, Info, MoreHorizontal, Loader2
} from 'lucide-react';
import { WarehouseCapacity } from '../types';
import { apiService } from '../api';

const WarehouseCapacityList: React.FC = () => {
  const [capacities, setCapacities] = useState<WarehouseCapacity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<WarehouseCapacity>>({
    warehouseCode: '01',
    stockGroupCode: '',
    maxCapacity: 0,
    unit: 'ADET',
    warningThreshold: 80
  });

  const loadCapacities = async () => {
    try {
      setLoading(true);
      const data = await apiService.warehouses.getCapacities();
      setCapacities(data);
    } catch (err) {
      console.error("Kapasite verileri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCapacities();
  }, []);

  const getBarColor = (usage: number, threshold: number) => {
    if (usage >= 100) return 'bg-rose-500';
    if (usage >= threshold) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Gauge size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Depo Kapasite Tanım</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Kapasite & Limit Yönetimi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-amber-600" /> Yeni Tanım
          </button>
          <button onClick={loadCapacities} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={`text-sky-600 ${loading ? 'animate-spin' : ''}`} /> Yenile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="animate-spin text-amber-600" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analitik Veriler Okunuyor...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capacities.map((cap) => {
              const usagePercent = Math.round((cap.currentQuantity / cap.maxCapacity) * 100) || 0;
              return (
                <div key={cap.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                        <WarehouseIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{cap.warehouseCode}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{cap.stockGroupCode}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-black uppercase text-amber-500">%{usagePercent} DOLU</div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${getBarColor(usagePercent, cap.warningThreshold)}`} style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            {capacities.length === 0 && <div className="md:col-span-3 py-12 text-center text-slate-300 font-bold uppercase tracking-widest">Kayıt Bulunmamaktadır</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default WarehouseCapacityList;
