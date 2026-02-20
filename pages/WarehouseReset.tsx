
import React, { useState, useMemo } from 'react';
import { 
  RefreshCcw, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Database, 
  Grid3X3, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  History,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Layers,
  Box,
  BadgeAlert,
  ArrowRightCircle,
  Hash,
  Info
} from 'lucide-react';
import { WarehouseResetItem, WarehouseCell } from '../types';

const mockCells: WarehouseCell[] = [
  { id: '1', code: 'A-01-01', warehouseCode: '01', isSelected: false },
  { id: '2', code: 'A-01-02', warehouseCode: '01', isSelected: false },
  { id: '3', code: 'B-05-12', warehouseCode: '02', isSelected: false },
  { id: '4', code: 'A-02-05', warehouseCode: '01', isSelected: false },
  { id: '5', code: 'C-10-10', warehouseCode: '01', isSelected: false },
];

const mockStockData: WarehouseResetItem[] = [
  { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', groupCode: 'HAMMADDE', unit: 'ADET', warehouseCode: '01', cellCode: 'A-01-01', serialNo: 'SR-2024-X01', balance: 450, lastUpdated: '2024-03-21' },
  { id: '2', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', groupCode: 'YARI MAMUL', unit: 'ADET', warehouseCode: '01', cellCode: 'A-01-01', serialNo: 'SR-2024-S55', balance: 5000, lastUpdated: '2024-03-20' },
  { id: '3', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', groupCode: 'HAMMADDE', unit: 'ADET', warehouseCode: '01', cellCode: 'A-01-02', serialNo: 'SR-2024-X02', balance: 120, lastUpdated: '2024-03-19' },
  { id: '4', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', groupCode: 'MAMUL', unit: 'ADET', warehouseCode: '02', cellCode: 'B-05-12', serialNo: 'SR-2024-P99', balance: 250, lastUpdated: '2024-03-21' },
];

const WarehouseReset: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unit' | 'serial'>('unit');
  const [cells, setCells] = useState<WarehouseCell[]>(mockCells);
  const [excludeSemiFinished, setExcludeSemiFinished] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedCellCodes = useMemo(() => cells.filter(c => c.isSelected).map(c => c.code), [cells]);

  const filteredStock = useMemo(() => {
    return mockStockData.filter(item => {
      const matchCell = selectedCellCodes.length === 0 || selectedCellCodes.includes(item.cellCode);
      const matchYM = excludeSemiFinished ? item.groupCode !== 'YARI MAMUL' : true;
      const matchSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.stockCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCell && matchYM && matchSearch;
    });
  }, [selectedCellCodes, excludeSemiFinished, searchTerm]);

  const toggleCellSelection = (id: string) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, isSelected: !c.isSelected } : c));
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* SIDEBAR: CELL LIST (GroupControl1 & grdHucreListesi) */}
      <aside className="w-80 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Grid3X3 size={18} />
               </div>
               <span className="text-xs font-black uppercase tracking-widest text-slate-800">Depan Alan Listesi</span>
            </div>
            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all active:scale-95 border border-transparent hover:border-slate-200">
               <RotateCcw size={16} />
            </button>
         </div>
         
         <div className="p-4 border-b border-slate-100">
            <div className="relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
               <input 
                  type="text" 
                  placeholder="Alan ara..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all"
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {cells.map(cell => (
               <div 
                  key={cell.id}
                  onClick={() => toggleCellSelection(cell.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${cell.isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${cell.isSelected ? 'bg-white/20' : 'bg-slate-50 text-slate-400'}`}>
                        <Hash size={14} />
                     </div>
                     <span className="text-xs font-black font-mono tracking-tight uppercase">{cell.code}</span>
                  </div>
                  {cell.isSelected ? <CheckCircle2 size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-100" />}
               </div>
            ))}
         </div>
         
         <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seçili Alan</span>
               <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{selectedCellCodes.length} ADET</span>
            </div>
            <button 
               onClick={() => setCells(cells.map(c => ({...c, isSelected: false})))}
               className="w-full py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95"
            >Seçimi Temizle</button>
         </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* TOOLBAR (BarManager1) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
              <RefreshCcw size={24} />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setActiveTab('unit')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'unit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >BİRİM BAZINDA</button>
              <button 
                onClick={() => setActiveTab('serial')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'serial' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >SERİ BAZINDA</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Yarı Mamulleri Gizle</span>
               <div 
                  onClick={() => setExcludeSemiFinished(!excludeSemiFinished)}
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${excludeSemiFinished ? 'bg-indigo-600' : 'bg-slate-300'}`}
               >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${excludeSemiFinished ? 'left-5.5 shadow-md' : 'left-0.5'}`} />
               </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
              <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
            </button>
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <button 
               onClick={() => setShowConfirmModal(true)}
               className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
            >
               <BadgeAlert size={16} /> STOK SIFIRLA
            </button>
          </div>
        </div>

        {/* DATA GRID AREA (GroupControl2 & grdDepoBakiye) */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           
           <div className="p-4 border-b border-slate-100 bg-slate-50/30">
              <div className="relative max-w-md">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                    type="text" 
                    placeholder="Ürün adı, kod veya seri no ile grid içinde ara..." 
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                 <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                       <th className="px-8 py-5 border-r border-white/5">Stok / Ürün Bilgisi</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Grup</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Depo / Hücre</th>
                       {activeTab === 'serial' && <th className="px-8 py-5 border-r border-white/5">Seri Numarası</th>}
                       <th className="px-8 py-5 border-r border-white/5 text-center">Bakiye</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Tarih</th>
                       <th className="px-8 py-5 text-right">İşlem</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredStock.map(item => (
                       <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                                   <Box size={20} />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{item.stockName}</p>
                                   <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">{item.stockCode}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${item.groupCode === 'HAMMADDE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : item.groupCode === 'MAMUL' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {item.groupCode}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className="flex items-center justify-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase border border-slate-200">{item.warehouseCode}</span>
                                <span className="text-[10px] text-slate-400 font-black font-mono">{item.cellCode}</span>
                             </div>
                          </td>
                          {activeTab === 'serial' && (
                             <td className="px-8 py-5">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 font-mono tracking-tighter uppercase">
                                   {item.serialNo || 'SERİSİZ'}
                                </span>
                             </td>
                          )}
                          <td className="px-8 py-5 text-center">
                             <p className="text-sm font-black text-slate-800">{item.balance.toLocaleString()}</p>
                             <p className="text-[9px] text-slate-400 font-bold uppercase">{item.unit}</p>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                <History size={12} className="text-slate-300" /> {item.lastUpdated}
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><XCircle size={18} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>

              {filteredStock.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 py-20">
                    <Database size={64} className="opacity-20" />
                    <div className="text-center">
                       <p className="text-sm font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                       <p className="text-xs font-medium mt-1">Lütfen sol taraftan depo alanı seçiniz.</p>
                    </div>
                 </div>
              )}
           </div>

           {/* GRAND TOTAL SUMMARY (GridView Footer) */}
           <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
              <div className="flex items-center gap-12">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Listelenen Kalem</p>
                    <p className="text-2xl font-black tracking-tight text-indigo-400">{filteredStock.length}</p>
                 </div>
                 <div className="w-[1px] h-10 bg-white/10" />
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Bakiye Miktarı</p>
                    <p className="text-2xl font-black tracking-tight text-emerald-400">
                       {filteredStock.reduce((a, b) => a + b.balance, 0).toLocaleString()} <span className="text-xs font-bold text-slate-500 ml-1">BR</span>
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Sistem İşlem Veritabanı: AKTİF</p>
                    <p className="text-[11px] text-rose-500 font-black uppercase tracking-widest">Sıfırlanacak Kayıt: {filteredStock.length}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="p-10 text-center space-y-6">
                  <div className="w-24 h-24 bg-rose-100 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50 animate-bounce">
                     <AlertTriangle size={48} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-2xl font-black text-slate-800 tracking-tight">Emin misiniz?</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">
                        Seçilen <span className="font-black text-slate-800">{selectedCellCodes.length}</span> hücredeki toplam <span className="font-black text-rose-600">{filteredStock.length}</span> stok hareketini sıfırlamak üzeresiniz. 
                        Bu işlem <span className="underline decoration-rose-500 underline-offset-4 decoration-2">geri döndürülemez</span> ve tüm bakiyeler 0 olarak güncellenecektir.
                     </p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4">
                     <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Sıfırlanacak Depo</p>
                        <p className="text-xs font-bold text-slate-700">MERKEZ DEPO (01)</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Sıfırlanacak Miktar</p>
                        <p className="text-xs font-black text-rose-600">{filteredStock.reduce((a, b) => a + b.balance, 0).toLocaleString()} BR</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                     <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all"
                     >İPTAL</button>
                     <button 
                        className="flex-1 py-4 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 shadow-xl shadow-rose-200 active:scale-95 transition-all"
                     >ONAYLA VE SIFIRLA</button>
                  </div>
               </div>
               <div className="p-4 bg-slate-900 text-center">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">FLEX WMS SECURITY PROTOCOL ACTIVE</p>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default WarehouseReset;
