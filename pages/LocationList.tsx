
import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, Plus, Save, Trash2, RotateCcw, FileSpreadsheet, Printer, XCircle, Search, 
  ChevronLeft, ChevronRight, MoreHorizontal, LayoutGrid, Warehouse as WarehouseIcon, 
  Zap, CheckCircle2, Box, Layers, ArrowRightCircle, Loader2
} from 'lucide-react';
import { StorageLocation } from '../types';
import { apiService } from '../api';

const LocationList: React.FC = () => {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    warehouse: '01',
    cellCode: '',
  });

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await apiService.warehouses.getLocations();
      setLocations(data);
    } catch (err) {
      console.error("Hücreler yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const toggleSelectAll = () => {
    if (selectedRows.length === locations.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(locations.map(l => l.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const filteredLocations = locations.filter(l => 
    (l.cellCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (l.warehouseCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <Grid3X3 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Depo Hücre Tanım</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Raf ve Lokasyon Yönetimi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-sky-600" /> Yeni
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Save size={16} className="text-emerald-600" /> Kaydet
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button onClick={loadLocations} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} /> Yenile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <WarehouseIcon size={12} className="text-sky-500" /> Depo Kod
          </label>
          <select 
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20"
            value={formData.warehouse}
            onChange={(e) => setFormData({...formData, warehouse: e.target.value})}
          >
            <option value="01">01 - MERKEZ DEPO</option>
            <option value="02">02 - HAMMADDE</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            <LayoutGrid size={12} className="text-sky-500" /> Hücre Kod
          </label>
          <input 
            type="text" 
            placeholder="Örn: A-01-01"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-sky-500/20"
            value={formData.cellCode}
            onChange={(e) => setFormData({...formData, cellCode: e.target.value})}
          />
        </div>
        <button className="bg-sky-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-sky-700 transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95">
          <ArrowRightCircle size={16} /> Ekle
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hücre Bilgileri Alınıyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" 
                      checked={selectedRows.length === locations.length && locations.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hücre Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Doluluk Durumu</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLocations.map((location, index) => (
                  <tr key={location.cellCode || location.id || index} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => toggleSelectRow(location.id)}>
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={selectedRows.includes(location.id)} readOnly />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                          <Grid3X3 size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 font-mono tracking-tight">{location.cellCode || 'KODSUZ'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DEPO: {location.warehouseCode || '---'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[240px] space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black">
                          <span className={(Number(location.fillRate) || 0) >= 90 ? 'text-rose-600' : 'text-emerald-600'}>{(location.status || 'Boş').toUpperCase()}</span>
                          <span className="text-slate-400">%{Number(location.fillRate) || 0}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-emerald-500 ${(Number(location.fillRate) || 0) >= 90 ? 'bg-rose-500' : ''}`} style={{ width: `${Number(location.fillRate) || 0}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-sky-600 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredLocations.length === 0 && (
              <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Kayıt Bulunamadı</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationList;
