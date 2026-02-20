
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  Box, 
  Database, 
  ChevronLeft, 
  ChevronRight, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  LayoutList, 
  User, 
  Hash, 
  Clock, 
  MoreHorizontal,
  ArrowRightCircle,
  ShieldCheck,
  TrendingUp,
  FileText,
  Warehouse as WarehouseIcon,
  BadgeAlert,
  Info,
  FileDown,
  FileUp,
  LogIn,
  LogOut,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StockListItem, StockMovementReportItem, StockWarehouseBalance } from '../types';

const mockStocks: StockListItem[] = [
  { id: '1', code: 'AL-2020', name: 'Alüminyum Profil 20x20', groupCode: 'HAM', unit: 'ADET' },
  { id: '2', code: 'SMN-M8', name: 'Çelik Somun M8', groupCode: 'BGL', unit: 'ADET' },
  { id: '3', code: 'PL-3030', name: 'Plastik Kapak 30x30', groupCode: 'MML', unit: 'ADET' },
  { id: '4', code: 'BND-45', name: 'Koli Bandı 45mm', groupCode: 'SRF', unit: 'RULO' },
];

const mockMovements: (StockMovementReportItem & { recordedBy: string; orderNo?: string; isReturn: boolean })[] = [
  { id: 'm1', year: '2024', date: '2024-03-01', slipNo: 'FIS-001', type: 'Alış', price: 12.50, inQty: 1000, outQty: 0, balance: 1000, description: 'Satınalma Girişi', warehouseCode: '01', customerName: 'Aksoy Metal', recordedBy: 'Mustafa A.', orderNo: 'SİP-101', isReturn: false },
  { id: 'm2', year: '2024', date: '2024-03-05', slipNo: 'FIS-005', type: 'Sevkiyat', price: 18.00, inQty: 0, outQty: 200, balance: 800, description: 'Müşteri Sevkiyat', warehouseCode: '01', customerName: 'Yılmaz Ltd.', recordedBy: 'Ahmet Y.', orderNo: 'SİP-205', isReturn: false },
  { id: 'm3', year: '2024', date: '2024-03-10', slipNo: 'FIS-012', type: 'Üretim', price: 0, inQty: 500, outQty: 0, balance: 1300, description: 'Bant Üretim Giriş', warehouseCode: '01', customerName: 'Dahili', recordedBy: 'Zeynep K.', orderNo: 'İE-99', isReturn: false },
  { id: 'm4', year: '2024', date: '2024-03-15', slipNo: 'FIS-015', type: 'İade', price: 12.50, inQty: 0, outQty: 50, balance: 1250, description: 'Hasarlı Ürün İadesi', warehouseCode: '01', customerName: 'Aksoy Metal', recordedBy: 'Mustafa A.', orderNo: 'SİP-101', isReturn: true },
];

const mockBalances: StockWarehouseBalance[] = [
  { id: 'b1', warehouseCode: '01', warehouseName: 'Merkez Depo', balance: 1200 },
  { id: 'b2', warehouseCode: '02', warehouseName: 'Hammadde Depo', balance: 50 },
];

type MovementCategory = 'Alış İrsaliyesi' | 'Satış İrsaliyesi' | 'Ambar Giriş' | 'Ambar Çıkış';

const DateRangeStockMovement: React.FC = () => {
  const [dates, setDates] = useState({ start: '2024-03-01', end: '2024-03-31' });
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([mockStocks[0].id]);
  const [activeTab, setActiveTab] = useState<'movements' | 'balances'>('movements');
  const [selectedCategory, setSelectedCategory] = useState<MovementCategory>('Alış İrsaliyesi');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const getCategory = (type: string): MovementCategory => {
    if (type === 'Alış') return 'Alış İrsaliyesi';
    if (type === 'Sevkiyat') return 'Satış İrsaliyesi';
    if (type === 'Üretim') return 'Ambar Giriş';
    if (type === 'İade') return 'Ambar Çıkış';
    return 'Ambar Giriş';
  };

  const filteredStocks = useMemo(() => {
    return mockStocks.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredMovements = useMemo(() => {
    return mockMovements.filter(m => getCategory(m.type) === selectedCategory);
  }, [selectedCategory]);

  const handleExportExcel = () => {
    const dataToExport = activeTab === 'movements' ? filteredMovements : mockBalances;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tarihli Stok Hareket");
    XLSX.writeFile(workbook, `Tarih_Aralikli_Stok_${activeTab}.xlsx`);
  };

  const toggleStockSelection = (id: string) => {
    setSelectedStockIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStockIds(filteredStocks.map(s => s.id));
  };

  const handleClearSelection = () => {
    setSelectedStockIds([]);
  };

  const selectedStocksDisplay = useMemo(() => {
    const selected = mockStocks.filter(s => selectedStockIds.includes(s.id));
    if (selected.length === 0) return "Stok Seçilmedi";
    if (selected.length === 1) return selected[0].name;
    return `${selected.length} Adet Stok Seçili`;
  }, [selectedStockIds]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all duration-500 shrink-0 ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {isSidebarOpen && (
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                     <Filter size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800">Analiz Kriteri</span>
               </div>
            )}
            <button 
               onClick={() => setSidebarOpen(!isSidebarOpen)}
               className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-200"
            >
               {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
         </div>

         {isSidebarOpen && (
            <div className="flex-1 flex flex-col overflow-hidden">
               <div className="p-6 space-y-6 border-b border-slate-100 bg-slate-50/30">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar size={12} className="text-indigo-500" /> Başlangıç Tarihi
                     </label>
                     <input 
                        type="date" 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        value={dates.start}
                        onChange={(e) => setDates({...dates, start: e.target.value})}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Calendar size={12} className="text-rose-500" /> Bitiş Tarihi
                     </label>
                     <input 
                        type="date" 
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        value={dates.end}
                        onChange={(e) => setDates({...dates, end: e.target.value})}
                     />
                  </div>
                  <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-200 active:scale-95 transition-all">LİSTELE</button>
               </div>

               <div className="p-4 border-b border-slate-100 space-y-3">
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                     <input 
                        type="text" 
                        placeholder="Stok kodu/adı ara..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSelectAll}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                    >Tümünü Seç</button>
                    <button 
                      onClick={handleClearSelection}
                      className="flex-1 py-2 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                    >Temizle</button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-slate-50/20">
                  {filteredStocks.map(stock => {
                     const isSelected = selectedStockIds.includes(stock.id);
                     return (
                        <div 
                           key={stock.id}
                           onClick={() => toggleStockSelection(stock.id)}
                           className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 group ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                        >
                           <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{stock.code}</span>
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-100'}`}>
                                 {isSelected && <Check size={12} className="text-white" />}
                              </div>
                           </div>
                           <p className="text-xs font-black tracking-tight leading-tight uppercase line-clamp-1">{stock.name}</p>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <History size={24} />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                 <button 
                    onClick={() => setActiveTab('movements')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'movements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >HAREKET LİSTESİ</button>
                 <button 
                    onClick={() => setActiveTab('balances')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'balances' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >DEPO BAKİYELERİ</button>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                 <RotateCcw size={16} /> YENİLE
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                 <FileSpreadsheet size={16} /> EXCEL AKTAR
              </button>
              <div className="w-[1px] h-6 bg-slate-200 mx-1" />
              <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                 <XCircle size={20} />
              </button>
           </div>
        </div>

        <div className="bg-slate-900 px-8 py-4 rounded-3xl text-white flex items-center justify-between relative overflow-hidden shadow-2xl shrink-0">
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 backdrop-blur-md border border-white/5">
                 <History size={32} />
              </div>
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Zaman Aralıklı Analiz</span>
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ÇOKLU SEÇİM</span>
                 </div>
                 <div className="flex items-baseline gap-4">
                    <h2 className="text-xl font-black tracking-tight uppercase">{selectedStocksDisplay}</h2>
                 </div>
              </div>
           </div>
           <div className="text-right relative z-10">
              <div className="flex items-center justify-end gap-2 text-slate-500 font-bold mb-1">
                 <Clock size={12} />
                 <span className="text-[9px] uppercase tracking-widest">{dates.start} — {dates.end}</span>
              </div>
              <div className="flex items-end gap-2 justify-end">
                 <h3 className="text-3xl font-black tracking-tighter text-emerald-400">{mockMovements[mockMovements.length-1].balance.toLocaleString()}</h3>
                 <span className="text-xs font-black text-slate-400 mb-1.5">BİRİM</span>
              </div>
           </div>
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <TrendingUp size={160} />
           </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           {activeTab === 'movements' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between px-8 gap-4">
                    <div className="flex items-center gap-4">
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest shrink-0">Hareket Grupları</h3>
                       <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                          {(['Alış İrsaliyesi', 'Satış İrsaliyesi', 'Ambar Giriş', 'Ambar Çıkış'] as MovementCategory[]).map(cat => (
                             <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}
                             >
                                {cat.toUpperCase()}
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1500px]">
                       <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                          <tr>
                             <th className="px-6 py-5 border-r border-white/5">Tarih</th>
                             <th className="px-6 py-5 border-r border-white/5">Fiş No</th>
                             <th className="px-6 py-5 border-r border-white/5 text-center">İşlem Tipi</th>
                             <th className="px-6 py-5 border-r border-white/5 text-right">Giriş (+)</th>
                             <th className="px-6 py-5 border-r border-white/5 text-right">Çıkış (-)</th>
                             <th className="px-6 py-5 border-r border-white/5 text-right bg-slate-950">Net Bakiye</th>
                             <th className="px-6 py-5 border-r border-white/5">Cari / Müşteri</th>
                             <th className="px-6 py-5 border-r border-white/5">Açıklama</th>
                             <th className="px-6 py-5 border-r border-white/5 text-center">Depo</th>
                             <th className="px-6 py-5 text-right">Kayıt Detay</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {filteredMovements.map(m => (
                             <tr key={m.id} className="hover:bg-indigo-50/10 transition-all group animate-in fade-in duration-300">
                                <td className="px-6 py-5">
                                   <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                      <Calendar size={14} className="text-slate-300" /> {m.date}
                                   </div>
                                </td>
                                <td className="px-6 py-5">
                                   <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black font-mono border border-slate-200">{m.slipNo}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <div className="flex flex-col items-center gap-1">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${m.inQty > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                         {m.type}
                                      </span>
                                   </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                   <span className={`text-sm font-black ${m.inQty > 0 ? 'text-emerald-600' : 'text-slate-200'}`}>
                                      {m.inQty > 0 ? `+${m.inQty.toLocaleString()}` : '-'}
                                   </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                   <span className={`text-sm font-black ${m.outQty > 0 ? 'text-rose-600' : 'text-slate-200'}`}>
                                      {m.outQty > 0 ? `-${m.outQty.toLocaleString()}` : '-'}
                                   </span>
                                </td>
                                <td className="px-6 py-5 text-right bg-slate-50/50">
                                   <span className="text-sm font-black text-indigo-600 tracking-tight">{m.balance.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-5">
                                   <p className="text-xs font-bold text-slate-800 leading-none uppercase">{m.customerName}</p>
                                </td>
                                <td className="px-6 py-5">
                                   <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[200px]">{m.description}</p>
                                </td>
                                <td className="px-6 py-5 text-center font-black text-xs text-slate-500">{m.warehouseCode}</td>
                                <td className="px-6 py-5 text-right">
                                   <div className="flex items-center justify-end gap-3">
                                      <div className="text-right">
                                         <p className="text-[10px] font-black text-slate-800 leading-none mb-1">{m.recordedBy}</p>
                                         <p className="text-[8px] font-bold text-slate-400 uppercase">SİSTEM KAYDI</p>
                                      </div>
                                      <button className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={18} /></button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>

                 <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-12">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gruptaki Girişler</p>
                          <p className="text-xl font-black tracking-tight text-emerald-400">+{filteredMovements.reduce((a,b)=>a+b.inQty, 0).toLocaleString()}</p>
                       </div>
                       <div className="w-[1px] h-10 bg-white/10" />
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Gruptaki Çıkışlar</p>
                          <p className="text-xl font-black tracking-tight text-rose-400">-{filteredMovements.reduce((a,b)=>a+b.outQty, 0).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex-1 p-12 animate-in slide-in-from-right-4 duration-500">
                 <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                       <div className="flex items-center gap-6 relative z-10">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 backdrop-blur-md">
                             <WarehouseIcon size={32} />
                          </div>
                          <div>
                             <h4 className="text-xl font-black tracking-tight uppercase tracking-widest">Dönem Sonu Depo Durumu</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tarih Aralığı Bitiş İtibariyle Bakiyeler</p>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {mockBalances.map(wb => (
                          <div key={wb.id} className={`p-6 rounded-[2.5rem] border-2 transition-all group hover:shadow-xl ${wb.balance > 0 ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300' : 'bg-slate-50 border-slate-100'}`}>
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${wb.balance > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                      <Box size={20} />
                                   </div>
                                   <h5 className="text-sm font-black text-slate-800 uppercase">{wb.warehouseName}</h5>
                                </div>
                                <span className="text-[10px] font-black text-slate-400 font-mono">{wb.warehouseCode}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeStockMovement;
