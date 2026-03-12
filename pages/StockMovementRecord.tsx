import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  Plus, 
  Save, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  Box, 
  Layers, 
  Warehouse as WarehouseIcon, 
  LayoutGrid, 
  Hash, 
  ArrowRightLeft, 
  Info, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Database,
  Search,
  Settings2,
  Maximize2,
  // Added missing LayoutList and MoreHorizontal imports from lucide-react
  LayoutList,
  MoreHorizontal
} from 'lucide-react';
import { StockMovementLine, StockCard } from '../types';
import { apiService } from '../api';
import SearchableSelect from '../components/SearchableSelect';

const mockMovements: StockMovementLine[] = [
  { id: '1', date: '2024-03-21', slipNo: 'FIS-000123', waybillNo: 'IRS-998', type: 'Giriş', inQty: 100, outQty: 0, balance: 450, description: 'Satınalma Stok Girişi', warehouseCode: '01', cellCode: 'A-01-05', serialNo: 'SR-2024-X' },
  { id: '2', date: '2024-03-21', slipNo: 'FIS-000124', waybillNo: 'IRS-999', type: 'Çıkış', inQty: 0, outQty: 50, balance: 400, description: 'Üretim Bandı Çıkış', warehouseCode: '01', cellCode: 'A-01-05', serialNo: 'SR-2024-X' },
  { id: '3', date: '2024-03-20', slipNo: 'FIS-000121', waybillNo: '', type: 'Giriş', inQty: 350, outQty: 0, balance: 350, description: 'Yıl Sonu Sayım Devri', warehouseCode: '01', cellCode: 'A-01-01', serialNo: 'SR-2023-B' },
];

const StockMovementRecord: React.FC = () => {
  const [movements, setMovements] = useState<StockMovementLine[]>(mockMovements);
  const [movementType, setMovementType] = useState<'Giriş' | 'Çıkış'>('Giriş');
  const [isHeaderOpen, setHeaderOpen] = useState(false);
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [selectedStockCode, setSelectedStockCode] = useState('AL-2020');
  const [isLoading, setIsLoading] = useState(false);

  const selectedStock = useMemo(() => {
    return stocks.find(s => s.code === selectedStockCode) || { code: 'AL-2020', name: 'Alüminyum Profil 20x20', unit: 'ADET', currentStock: 450 };
  }, [stocks, selectedStockCode]);

  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.stocks.getAll();
        setStocks(data);
      } catch (error) {
        console.error('Stock fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const totalIn = useMemo(() => movements.reduce((a, b) => a + b.inQty, 0), [movements]);
  const totalOut = useMemo(() => movements.reduce((a, b) => a + b.outQty, 0), [movements]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-sky-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <History size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Stok Hareket Kaydı</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Giriş / Çıkış Operasyonları</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-sky-600" /> Yeni
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-100 hover:bg-sky-700 transition-all active:scale-95">
            <Save size={16} /> Kaydet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Trash2 size={16} className="text-rose-600" /> Sil
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* LIVE STOCK SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-sky-200 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-all">
                  <Database size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mevcut Depo Bakiyesi</p>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight">{selectedStock.currentStock.toLocaleString()} <span className="text-xs text-slate-400">{selectedStock.unit}</span></h4>
               </div>
            </div>
            <Maximize2 size={18} className="text-slate-100 group-hover:text-sky-200 transition-colors" />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ArrowDownCircle size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dönem İçi Toplam Giriş</p>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight">{totalIn.toLocaleString()} <span className="text-xs text-slate-400">BR</span></h4>
               </div>
            </div>
            <ArrowDownCircle size={18} className="text-slate-100 group-hover:text-emerald-200 transition-colors" />
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-200 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <ArrowUpCircle size={24} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dönem İçi Toplam Çıkış</p>
                  <h4 className="text-2xl font-black text-slate-800 tracking-tight">{totalOut.toLocaleString()} <span className="text-xs text-slate-400">BR</span></h4>
               </div>
            </div>
            <ArrowUpCircle size={18} className="text-slate-100 group-hover:text-rose-200 transition-colors" />
         </div>
      </div>

      {/* ADVANCED HEADER (GroupControl1 - Masraf Merkezi vs.) */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all">
         <button 
            onClick={() => setHeaderOpen(!isHeaderOpen)}
            className="w-full px-8 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
         >
            <div className="flex items-center gap-4">
               <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <Settings2 size={18} />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-slate-600">Gelişmiş Başlık Bilgileri (Masraf Merkezi / Fiş No)</span>
            </div>
            {isHeaderOpen ? <ArrowRightLeft size={18} className="text-slate-300 rotate-90" /> : <ArrowRightLeft size={18} className="text-slate-300" />}
         </button>
         {isHeaderOpen && (
            <div className="p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Masraf Merkezi (cmbMasrafMerkezi)</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-sky-500">
                     <option>--- SEÇİNİZ ---</option>
                     <option>ÜRETİM BANDI</option>
                     <option>AR-GE LABORATUVAR</option>
                     <option>LOJİSTİK DEPO</option>
                     <option>GENEL YÖNETİM</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sistem Fiş No (txtFisNo)</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-200 border border-slate-300 rounded-xl text-xs font-black text-slate-500 cursor-not-allowed" value="AUTO-2024-0321" readOnly />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tedarikçi Ref (grdLueTedarikci)</label>
                  <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-sky-500">
                     <option>--- BAĞIMSIZ ---</option>
                     <option>AKSOY METAL</option>
                  </select>
               </div>
            </div>
         )}
      </div>

      {/* MAIN MOVEMENT FORM (GroupControl2) */}
      <div className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-2xl transition-all duration-500 ${movementType === 'Giriş' ? 'border-emerald-100 ring-4 ring-emerald-50/30' : 'border-rose-100 ring-4 ring-rose-50/30'}`}>
         <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Stock & Transaction Logic */}
            <div className="lg:w-2/3 space-y-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                     <Layers size={18} className="text-sky-500" /> Hareket Detayı Girişi
                  </h3>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                     <button 
                        onClick={() => setMovementType('Giriş')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${movementType === 'Giriş' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-emerald-600'}`}
                     >
                        <ArrowDownCircle size={14} /> GİRİŞ
                     </button>
                     <button 
                        onClick={() => setMovementType('Çıkış')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${movementType === 'Çıkış' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-400 hover:text-rose-600'}`}
                     >
                        <ArrowUpCircle size={14} /> ÇIKIŞ
                     </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                     <SearchableSelect 
                        label="Stok Seçimi (grdLueStokKod)"
                        placeholder="Stok Seçiniz..."
                        value={selectedStockCode}
                        onChange={setSelectedStockCode}
                        options={stocks.map(s => ({
                          value: s.code,
                          label: s.name
                        }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <WarehouseIcon size={14} className="text-sky-500" /> Depo Kod (grdLueDepo)
                     </label>
                     <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-500">
                        <option>01 - MERKEZ DEPO</option>
                        <option>02 - ÜRETİM</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <LayoutGrid size={14} className="text-sky-500" /> Hücre Kod (grdLueHucreKodu)
                     </label>
                     <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-500">
                        <option>A-01-01</option>
                        <option>B-05-12</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Hash size={14} className="text-sky-500" /> Seri No (grdLueSeriList)
                     </label>
                     <input type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-black placeholder:text-slate-300 focus:border-sky-500 outline-none" placeholder="Seri no giriniz..." />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar size={14} className="text-sky-500" /> Hareket Tarihi
                     </label>
                     <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-sky-500" defaultValue="2024-03-21" />
                  </div>
               </div>
            </div>

            {/* Right: Quantity & Action */}
            <div className="lg:w-1/3 flex flex-col justify-between space-y-8">
               <div className="space-y-6">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Miktar Girişi (spMiktar)</span>
                        <div className="px-2 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase text-emerald-400">{selectedStock.unit}</div>
                     </div>
                     <input 
                        type="number" 
                        className={`w-full bg-transparent border-none text-5xl font-black text-center outline-none focus:ring-0 ${movementType === 'Giriş' ? 'text-emerald-400' : 'text-rose-400'}`} 
                        placeholder="0.00" 
                     />
                     <div className="h-[1px] bg-white/10 w-full" />
                     <p className="text-[10px] text-center font-bold text-slate-400">Lütfen miktar değerini kontrol ediniz.</p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İrsaliye / Belge No (txtIrsaliyeNo)</label>
                     <input type="text" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-sky-500" placeholder="Belge no..." />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operasyon Açıklaması (txtAciklama)</label>
                     <textarea rows={2} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-sky-500 transition-all" placeholder="İşlem notu..." />
                  </div>
               </div>

               <button className={`w-full py-5 rounded-[2rem] text-white text-xs font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${movementType === 'Giriş' ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-rose-600 shadow-rose-200 hover:bg-rose-700'}`}>
                  {movementType === 'Giriş' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                  HAREKETİ KAYDET
               </button>
            </div>
         </div>
      </div>

      {/* MOVEMENT HISTORY GRID (GroupControl3 / grdFisDetay) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600">
                  <LayoutList size={20} />
               </div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Geçmiş Stok Hareketleri (GridView2)</h3>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kayıtlı Hareket: {movements.length}</span>
               <button className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-sky-600 transition-all"><Search size={18} /></button>
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Belge / Fiş</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Depo / Hücre</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">İşlem</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giriş (+)</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Çıkış (-)</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Bakiye</th>
                     <th className="px-6 py-5 text-right w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {movements.map((move) => (
                     <tr key={move.id} className="hover:bg-sky-50/20 transition-all group">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <Calendar size={14} className="text-slate-300" /> {move.date}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-xs font-black text-slate-800 font-mono">{move.slipNo}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{move.waybillNo || 'Dahili Fiş'}</p>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase border border-slate-200">{move.warehouseCode}</span>
                              <span className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">{move.cellCode}</span>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${move.type === 'Giriş' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {move.type}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <span className={`text-sm font-black ${move.inQty > 0 ? 'text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg' : 'text-slate-200'}`}>
                              {move.inQty > 0 ? `+${move.inQty.toLocaleString()}` : '-'}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <span className={`text-sm font-black ${move.outQty > 0 ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-lg' : 'text-slate-200'}`}>
                              {move.outQty > 0 ? `-${move.outQty.toLocaleString()}` : '-'}
                           </span>
                        </td>
                        <td className="px-6 py-5 text-right bg-slate-50/30">
                           <span className="text-sm font-black text-slate-800 tracking-tight">{move.balance.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={18} /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
               {/* GRID FOOTER SUMMARY */}
               <tfoot className="bg-slate-900 text-white font-black text-[10px]">
                  <tr>
                     <td colSpan={4} className="px-6 py-4 uppercase tracking-[0.2em]">Toplam İşlem Hacmi</td>
                     <td className="px-6 py-4 text-right text-emerald-400 text-xs">+{totalIn.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right text-rose-400 text-xs">-{totalOut.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right text-indigo-400 text-sm">NET: {(totalIn - totalOut).toLocaleString()}</td>
                     <td></td>
                  </tr>
               </tfoot>
            </table>
         </div>
      </div>

      {/* INFO BAR */}
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 flex items-start gap-4">
         <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <Info size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest leading-none">İşlem Rehberi</h4>
            <p className="text-xs text-indigo-600/80 leading-relaxed font-medium">Stok hareket kayıtları, sistemdeki gerçek zamanlı envanter değerlerini doğrudan etkiler. Seri numarası takibi yapılan ürünlerde Seri No alanı zorunludur. Yapılan her hareket loglanarak kullanıcı bazlı takip edilmektedir.</p>
         </div>
      </div>
    </div>
  );
};

export default StockMovementRecord;