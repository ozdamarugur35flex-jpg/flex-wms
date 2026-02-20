
import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Save, 
  Trash2, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Box, 
  Truck, 
  Maximize2, 
  Ruler, 
  ArrowRightLeft, 
  Printer,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Users
} from 'lucide-react';
import { StockVariant } from '../types';

const mockVariants: StockVariant[] = [
  { id: '1', stockCode: 'AL-001', stockName: 'Alüminyum Profil 20x20', unit: 'ADET', supplier: 'Aksoy Metal Ltd.', width: '20', height: '2000', conversion2: 10, conversion3: 100, lastUpdated: '2024-03-21' },
  { id: '2', stockCode: 'AL-001', stockName: 'Alüminyum Profil 20x20', unit: 'ADET', supplier: 'Yılmaz Sanayi', width: '20', height: '3000', conversion2: 12, conversion3: 120, lastUpdated: '2024-03-20' },
  { id: '3', stockCode: 'SMN-08', stockName: 'Çelik Somun M8', unit: 'ADET', supplier: 'Civata Dünyası', width: '8', height: '0', conversion2: 1000, conversion3: 10000, lastUpdated: '2024-03-21' },
];

const VariantDefinitionList: React.FC = () => {
  const [variants, setVariants] = useState<StockVariant[]>(mockVariants);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    stockCode: '',
    stockName: '---',
    unit: '---',
    supplier: '',
    width: '',
    height: '',
    conversion2: 0,
    conversion3: 0
  });

  const toggleSelectAll = () => {
    if (selectedRows.length === variants.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(variants.map(v => v.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const filteredVariants = variants.filter(v => 
    v.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Stok Varyant Tanım</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Çoklu Birim & Varyant Yönetimi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-indigo-600" /> Yeni
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Save size={16} className="text-emerald-600" /> Kaydet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Trash2 size={16} className="text-rose-600" /> Sil
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className="text-sky-600" /> Listele
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      {/* VARIANT QUICK DEFINITION PANEL (GroupControl1) */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
        
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 items-end">
          {/* Stok Seçimi (grdLueStok) */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Box size={12} className="text-indigo-500" /> Stok Bilgisi (Seçiniz)
            </label>
            <div className="relative group">
              <select 
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none transition-all"
                onChange={(e) => setFormData({...formData, stockCode: e.target.value, stockName: 'Örnek Stok Tanımı', unit: 'ADET'})}
              >
                <option value="">Stok Seçiniz...</option>
                <option value="AL-001">AL-001 | Alüminyum Profil</option>
                <option value="SMN-08">SMN-08 | Çelik Somun M8</option>
              </select>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={18} />
            </div>
          </div>

          {/* Çevrim 1-2 (spPayda2-3) */}
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
              <div className="flex items-center gap-2"><ArrowRightLeft size={12} className="text-indigo-500" /> Çevrim 1</div>
              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">{formData.unit}</span>
            </label>
            <input 
              type="number" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-indigo-500 transition-all"
              placeholder="0"
              value={formData.conversion2}
              onChange={(e) => setFormData({...formData, conversion2: parseFloat(e.target.value) || 0})}
            />
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
              <div className="flex items-center gap-2"><ArrowRightLeft size={12} className="text-indigo-500" /> Çevrim 2</div>
              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">{formData.unit}</span>
            </label>
            <input 
              type="number" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-700 outline-none focus:border-indigo-500 transition-all"
              placeholder="0"
              value={formData.conversion3}
              onChange={(e) => setFormData({...formData, conversion3: parseFloat(e.target.value) || 0})}
            />
          </div>

          {/* Tedarikçi (grdlueTedarikci) */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Truck size={12} className="text-indigo-500" /> Tedarikçi
            </label>
            <div className="flex gap-2">
              <select className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none">
                <option>Seçiniz...</option>
                <option>Aksoy Metal Ltd.</option>
                <option>Yılmaz Sanayi</option>
              </select>
              <button className="px-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Plus size={18} /></button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Boy / Genişlik (grdlueBoy/Genislik) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Maximize2 size={12} className="text-indigo-500" /> Genişlik
            </label>
            <div className="flex gap-2">
              <select className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none">
                <option>Ölçü Seç...</option>
                <option>20 mm</option>
                <option>40 mm</option>
              </select>
              <button className="px-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Ruler size={18} /></button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Ruler size={12} className="text-indigo-500" /> Boy
            </label>
            <div className="flex gap-2">
              <select className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none">
                <option>Ölçü Seç...</option>
                <option>2000 mm</option>
                <option>3000 mm</option>
                <option>6000 mm</option>
              </select>
              <button className="px-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Ruler size={18} /></button>
            </div>
          </div>

          <div className="flex items-end">
             <button className="w-full bg-slate-900 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3">
               <Plus size={18} /> Varyant Ekle / Güncelle
             </button>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tanımlı varyantlar içinde ara (Stok adı, kod, tedarikçi)..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* BATCH ACTIONS (Custom BarButtonItem3-4) */}
      {selectedRows.length > 0 && (
        <div className="bg-indigo-600 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between text-white animate-in slide-in-from-top-4 duration-300 shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-4 mb-3 md:mb-0">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
               <ShieldCheck size={20} />
            </div>
            <span className="text-xs font-black tracking-widest uppercase">{selectedRows.length} Varyant Seçildi</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-white/20">
               <RotateCcw size={14} /> SIRIUS HÜCRE TANIMLA
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-white/20">
               <Users size={14} /> MÜŞTERİ HÜCRE TANIMLA
            </button>
            <div className="w-[1px] h-6 bg-white/20 mx-2" />
            <button className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2">
               <Trash2 size={14} /> SEÇİLENLERİ SİL
            </button>
            <button onClick={() => setSelectedRows([])} className="p-2 hover:bg-white/10 rounded-xl transition-all"><XCircle size={18} /></button>
          </div>
        </div>
      )}

      {/* DATA GRID (grdVaryant) */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                    checked={selectedRows.length === variants.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Varyant Bilgisi</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tedarikçi</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Teknik Ölçüler</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Çevrim Katsayıları</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVariants.map((variant) => {
                const isSelected = selectedRows.includes(variant.id);
                return (
                  <tr 
                    key={variant.id} 
                    className={`hover:bg-indigo-50/30 transition-all group cursor-pointer ${isSelected ? 'bg-indigo-50' : ''}`}
                    onClick={() => toggleSelectRow(variant.id)}
                  >
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSelectRow(variant.id);
                        }}
                      />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:border-indigo-100'}`}>
                           <Box size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight">{variant.stockName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KOD: {variant.stockCode} <span className="mx-1">•</span> BİRİM: {variant.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-tighter border border-slate-200">
                          <Truck size={12} className="text-slate-400" /> {variant.supplier}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-black text-slate-700">{variant.width}x{variant.height}</span>
                             <span className="text-[9px] text-slate-400 font-bold">MM</span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Teknik Boyut</p>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                             <p className="text-xs font-black text-indigo-600">{variant.conversion2}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ÇEVRİM-1</p>
                          </div>
                          <div className="w-[1px] h-6 bg-slate-200" />
                          <div className="text-center">
                             <p className="text-xs font-black text-indigo-600">{variant.conversion3}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ÇEVRİM-2</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-indigo-100 shadow-sm">
                          <MoreHorizontal size={20} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER PAGINATION */}
      <div className="px-8 py-6 bg-white rounded-[2rem] border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Toplam Varyant</p>
             <p className="text-lg font-black text-slate-800 leading-none">{filteredVariants.length}</p>
          </div>
          <div className="w-[1px] h-8 bg-slate-100" />
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-100">
                <Printer size={14} className="text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter cursor-pointer hover:underline">Etiket Yazdır</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-3 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors" disabled>
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-1">
             <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 ring-2 ring-indigo-50">1</button>
          </div>
          <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariantDefinitionList;
