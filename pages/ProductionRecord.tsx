
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Factory, 
  Plus, 
  Save, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  User, 
  Box, 
  Layers, 
  Warehouse as WarehouseIcon, 
  Settings, 
  Info, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle,
  History,
  LayoutGrid,
  Cpu,
  Search,
  BadgeAlert,
  ArrowDownCircle,
  Hash,
  Tag,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { ProductionRecord, DepotMaterialStatus } from '../types';
import { apiService } from '../api';

const ProductionRecordPage: React.FC = () => {
  const [productions, setProductions] = useState<ProductionRecord[]>([]);
  const [materialStatus, setMaterialStatus] = useState<DepotMaterialStatus[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'materials'>('list');
  const [labelQty, setLabelQty] = useState<number>(0);
  const [labelCount, setLabelCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState('');
  
  const totalQty = useMemo(() => labelQty * labelCount, [labelQty, labelCount]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await apiService.production.getAll();
      setProductions(data);
    } catch (error) {
      console.error("Üretim kayıtları yüklenemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadMaterialStatus = async (jobOrder: string) => {
    if (!jobOrder) return;
    try {
      const data = await apiService.production.getMaterialStatus(jobOrder);
      setMaterialStatus(data);
    } catch (error) {
      console.error("Malzeme durumu yüklenemedi", error);
    }
  };

  useEffect(() => {
    if (selectedJobOrder) {
      loadMaterialStatus(selectedJobOrder);
    }
  }, [selectedJobOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Factory size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Depo Üretim Kaydı</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Üretimden Giriş & Etiketleme</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-indigo-600" /> Yeni Üretim
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
            <Save size={16} /> Üretim Kaydet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Trash2 size={16} className="text-rose-600" /> Kaydı İptal Et
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all active:scale-95">
             <Tag size={16} className="text-amber-400" /> Tekrar Etiket Bas
          </button>
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* MAIN PRODUCTION FORM (GroupControl1) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
            <Factory size={240} />
         </div>
         
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
            {/* Left: General Info */}
            <div className="xl:col-span-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <WarehouseIcon size={12} className="text-indigo-500" /> Üretim Depo (grdLueUretimDepo)
                     </label>
                     <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 appearance-none">
                        <option>01 - MERKEZ DEPO</option>
                        <option>02 - ÜRETİM</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <LayoutGrid size={12} className="text-indigo-500" /> Hedef Hücre (grdLueHedefHucre)
                     </label>
                     <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500">
                        <option>A-01-01</option>
                        <option>A-02-05</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Cpu size={12} className="text-indigo-500" /> Makine (grdLueMakine)
                     </label>
                     <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500">
                        <option>CNC-01</option>
                        <option>CNC-02</option>
                        <option>PRES-05</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Hash size={12} className="text-indigo-500" /> İş Emri No (grdLueIsemriNo)
                     </label>
                     <div className="relative group">
                        <select 
                           className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 appearance-none transition-all"
                           value={selectedJobOrder}
                           onChange={(e) => setSelectedJobOrder(e.target.value)}
                        >
                           <option value="">İş Emri Seçiniz...</option>
                           {productions.map(p => (
                              <option key={p.id} value={p.jobOrderNo}>{p.jobOrderNo} | {p.stockCode}</option>
                           ))}
                        </select>
                        <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <User size={12} className="text-indigo-500" /> Operatör (txtOperatör)
                     </label>
                     <input type="text" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="İsim giriniz..." />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Box size={12} className="text-indigo-500" /> Üretilen Stok (grdLueStok)
                  </label>
                  <select className="w-full px-5 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl text-sm font-black text-indigo-900 outline-none">
                     <option value="">Stok Seçiniz...</option>
                     {productions.map(p => (
                        <option key={p.id} value={p.stockCode}>{p.stockCode} | {p.stockName}</option>
                     ))}
                  </select>
               </div>
            </div>

            {/* Right: Quantities & Labeling (txtEtiketMiktari, txtEtiketAdedi, txtToplamMiktar) */}
            <div className="xl:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl">
               <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Etiket & Miktar Girişi</h4>
                  <BadgeAlert size={18} className="text-rose-500 animate-pulse" />
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Etiket Miktarı</label>
                     <input 
                        type="number" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg font-black text-center outline-none focus:bg-white/10 focus:border-indigo-500 transition-all"
                        value={labelQty}
                        onChange={(e) => setLabelQty(parseFloat(e.target.value) || 0)}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Etiket Adedi</label>
                     <input 
                        type="number" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-lg font-black text-center outline-none focus:bg-white/10 focus:border-indigo-500 transition-all"
                        value={labelCount}
                        onChange={(e) => setLabelCount(parseInt(e.target.value) || 0)}
                     />
                  </div>
               </div>

               <div className="pt-6 border-t border-white/10 text-center">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">TOPLAM ÜRETİM MİKTARI</p>
                  <div className="flex items-center justify-center gap-4">
                     <h2 className="text-6xl font-black tracking-tighter text-emerald-400 animate-in zoom-in duration-500">{totalQty.toLocaleString()}</h2>
                     <div className="flex flex-col items-start">
                        <span className="text-xs font-black text-slate-400 tracking-widest">ADET</span>
                        <ArrowDownCircle size={20} className="text-emerald-500 mt-1" />
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <input type="checkbox" id="buyukEtiket" className="w-4 h-4 text-indigo-600 rounded bg-transparent border-white/20" />
                  <label htmlFor="buyukEtiket" className="text-[10px] font-black uppercase tracking-widest text-slate-400 cursor-pointer">BÜYÜK BOY ETİKET BASILSIN</label>
               </div>
            </div>
         </div>
      </div>

      {/* TABS FOR LISTS (XtraTabControl1) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
         <div className="flex bg-slate-50/50 p-1.5 border-b border-slate-100">
            <button 
               onClick={() => setActiveTab('list')}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <History size={16} /> ÜRETİM LİSTESİ (GridView1)
            </button>
            <button 
               onClick={() => setActiveTab('materials')}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'materials' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <ArrowRightLeft size={16} /> MALZEME DEPO DURUM (GridView2)
            </button>
         </div>

         {loading ? (
            <div className="flex-1 flex items-center justify-center py-20">
               <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
               </div>
            </div>
         ) : activeTab === 'list' ? (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/30 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fiş / Tarih</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Bilgisi</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seri No</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Üretim Miktarı</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operasyon Kaynağı</th>
                        <th className="px-8 py-5 text-right w-16"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {productions.map(p => (
                        <tr key={p.id} className="hover:bg-indigo-50/10 transition-colors group">
                           <td className="px-8 py-5">
                              <p className="text-xs font-black text-slate-800 font-mono tracking-tight">{p.slipNo}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{p.date}</p>
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-xs font-bold text-slate-700">{p.stockName}</p>
                              <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{p.stockCode}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black font-mono border border-slate-200">
                                 {p.serialNo}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <p className="text-sm font-black text-emerald-600">{p.quantity.toLocaleString()}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase">{p.unit}</p>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black border border-slate-200">
                                    {p.operator?.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{p.operator}</p>
                                    <p className="text-[9px] text-slate-400 font-bold">{p.machine} <span className="mx-1">•</span> {p.jobOrderNo}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={18} /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="p-8 animate-in slide-in-from-right-4 duration-500">
               <div className="bg-slate-900 p-8 rounded-[2.5rem] mb-8 text-white flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-6">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                        <BadgeAlert size={28} />
                     </div>
                     <div>
                        <h4 className="text-lg font-black tracking-tight uppercase">Hammadde Gereksinim Analizi</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Üretim Öncesi Depo Kontrolü</p>
                     </div>
                  </div>
                  <div className="px-6 py-3 bg-rose-500/20 rounded-2xl border border-rose-500/20">
                     <span className="text-xs font-black text-rose-400 uppercase tracking-widest animate-pulse">EKSİK MALZEME TESPİT EDİLDİ</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {materialStatus.map(ms => (
                     <div key={ms.id} className={`p-6 rounded-[2rem] border transition-all hover:shadow-xl ${ms.difference < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{ms.stockCode}</p>
                              <h5 className="text-sm font-black text-slate-800">{ms.stockName}</h5>
                           </div>
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ms.difference < 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              {ms.difference < 0 ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                           <div className="text-center">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Gerekli</p>
                              <p className="text-xs font-black text-slate-700">{ms.requiredQty} {ms.unit}</p>
                           </div>
                           <div className="text-center border-x border-slate-100 px-4">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Depoda</p>
                              <p className="text-xs font-black text-slate-700">{ms.depotQty} {ms.unit}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Fark</p>
                              <p className={`text-xs font-black ${ms.difference < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{ms.difference > 0 ? '+' : ''}{ms.difference} {ms.unit}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* FOOTER INFO */}
         <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-6">
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">FLEX Production Module v2.4</p>
               <div className="h-4 w-[1px] bg-slate-200" />
               <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">İş Emri Veritabanı Aktif</span>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 hover:text-indigo-600 transition-colors"><Search size={18} /></button>
               <button className="p-2 hover:text-indigo-600 transition-colors"><Settings size={18} /></button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProductionRecordPage;
