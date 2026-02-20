
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Tag, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Hash, 
  User, 
  Box, 
  ArrowRightLeft, 
  MoreHorizontal,
  CheckCircle2,
  FileText,
  Clock,
  LayoutList,
  Database,
  ArrowUpRight,
  Info,
  Maximize2,
  Minimize2,
  RefreshCcw,
  BadgeAlert,
  Printer,
  History,
  Ruler,
  Truck,
  QrCode,
  X
} from 'lucide-react';

interface LabelRecord {
  id: string;
  stockCode: string;
  stockName: string;
  unit: string;
  warehouseCode: string;
  cellCode: string;
  serialNo: string;
  quantity: number;
  recordedBy: string;
  recordedAt: string;
  shelfLife?: string;
  groupCode: string;
  refreshDate: string;
  conversion: number;
  supplier: string;
  grammage?: string;
  width?: number;
  height?: number;
}

const mockLabelData: LabelRecord[] = [
  { id: 'L1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', unit: 'ADET', warehouseCode: '100', cellCode: 'A-01-01', serialNo: 'SR-2024-X01', quantity: 450, recordedBy: 'Mustafa A.', recordedAt: '2024-03-21 14:30', shelfLife: '2025-12-31', groupCode: 'HAM', refreshDate: '2024-03-21', conversion: 1, supplier: 'Aksoy Metal', grammage: '2.5mm', width: 20, height: 6000 },
  { id: 'L2', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', unit: 'ADET', warehouseCode: '100', cellCode: 'B-10-12', serialNo: 'SR-2024-S99', quantity: 5000, recordedBy: 'Ahmet Y.', recordedAt: '2024-03-20 09:15', shelfLife: '2027-01-01', groupCode: 'BGL', refreshDate: '2024-03-20', conversion: 1000, supplier: 'Civata Dünyası', grammage: '8.8 Kalite', width: 8, height: 0 },
  { id: 'L3', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', unit: 'ADET', warehouseCode: '02', cellCode: 'D-01-01', serialNo: 'SR-2024-P11', quantity: 1000, recordedBy: 'Mustafa A.', recordedAt: '2024-03-19 11:00', shelfLife: '2026-06-30', groupCode: 'MML', refreshDate: '2024-03-19', conversion: 1, supplier: 'Global Plastik', grammage: 'ABS', width: 30, height: 30 },
];

const LabelPrintReport: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'serial'>('stock');
  const [dates, setDates] = useState({ start: '2024-03-01', end: '2024-03-31' });
  const [searchTerm, setSearchTerm] = useState('');
  const [hideSemiFinished, setHideSemiFinished] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reprint Modal State
  const [reprintModal, setReprintModal] = useState({ isOpen: false, item: null as LabelRecord | null, qty: 1, count: 1 });

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const filteredData = useMemo(() => {
    return mockLabelData.filter(item => {
      const isNotYM = hideSemiFinished ? item.groupCode !== 'YARI MAMUL' : true;
      const matchesSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.serialNo.toLowerCase().includes(searchTerm.toLowerCase());
      return isNotYM && matchesSearch;
    });
  }, [searchTerm, hideSemiFinished]);

  const stockSummary = useMemo(() => {
    const groups: Record<string, any> = {};
    filteredData.forEach(item => {
      if (!groups[item.stockCode]) {
        groups[item.stockCode] = { ...item, totalQty: 0, labelCount: 0 };
      }
      groups[item.stockCode].totalQty += item.quantity;
      groups[item.stockCode].labelCount += 1;
    });
    return Object.values(groups);
  }, [filteredData]);

  const openReprint = (item: LabelRecord) => {
    setReprintModal({ isOpen: true, item, qty: item.quantity, count: 1 });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Filter size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Arşiv Kriter</span>
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
          <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Calendar size={12} className="text-indigo-500" /> Başlangıç
                  </label>
                  <input 
                     type="date" 
                     className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                     value={dates.start}
                     onChange={(e) => setDates({...dates, start: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Calendar size={12} className="text-rose-500" /> Bitiş
                  </label>
                  <input 
                     type="date" 
                     className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                     value={dates.end}
                     onChange={(e) => setDates({...dates, end: e.target.value})}
                  />
               </div>
            </div>

            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
              SORGULA
            </button>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <History size={24} />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setActiveTab('stock')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'stock' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >STOK BAZLI ARŞİV</button>
              <button 
                onClick={() => setActiveTab('serial')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'serial' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >SERİ BAZLI ARŞİV</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleFullScreen}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-50 transition-all active:scale-95"
            >
              {isFullscreen ? <Minimize2 size={16} className="text-indigo-600" /> : <Maximize2 size={16} className="text-indigo-600" />}
              {isFullscreen ? 'KÜÇÜLT' : 'TAM EKRAN'}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                 type="text" 
                 placeholder="Arşivde ara (İsim, kod, seri no)..." 
                 className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                 <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                       <th className="px-8 py-5 border-r border-white/5">Stok / Ürün</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Seri Numarası</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Miktar</th>
                       <th className="px-8 py-5 border-r border-white/5">Kayıt Tarihi</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">İşlem</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group">
                        <td className="px-8 py-5">
                           <p className="text-xs font-black text-slate-800 uppercase">{item.stockName}</p>
                           <p className="text-[10px] text-slate-400 font-mono font-bold">{item.stockCode}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black font-mono border border-slate-200">{item.serialNo}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className="text-sm font-black text-indigo-600">{item.quantity.toLocaleString()}</span>
                           <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase">{item.unit}</span>
                        </td>
                        <td className="px-8 py-5">
                           <p className="text-[10px] font-black text-slate-700 uppercase">{item.recordedBy}</p>
                           <p className="text-[9px] text-slate-400 font-medium">{item.recordedAt}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <button 
                             onClick={() => openReprint(item)}
                             className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-all active:scale-90"
                             title="Tekrar Yazdır"
                           >
                             <Printer size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>

      {/* REPRINT MODAL (30x100mm) */}
      {reprintModal.isOpen && reprintModal.item && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in duration-300">
               
               <div className="flex-1 p-10 space-y-8 border-r border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                           <Printer size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Tekrar Basım</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Arşivden Yazdırma</p>
                        </div>
                     </div>
                     <button onClick={() => setReprintModal({ ...reprintModal, isOpen: false, item: null })} className="p-2.5 bg-white rounded-2xl text-slate-400 hover:text-rose-500 border border-slate-200 transition-all">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Arşiv Kaydı</p>
                        <h4 className="text-sm font-black text-slate-800 uppercase">{reprintModal.item.stockName}</h4>
                        <p className="text-[10px] font-black text-indigo-600 font-mono">{reprintModal.item.stockCode}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Miktar</label>
                           <input 
                              type="number" 
                              className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-center text-slate-800 outline-none shadow-inner"
                              value={reprintModal.qty}
                              onChange={(e) => setReprintModal({ ...reprintModal, qty: parseFloat(e.target.value) || 0 })}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Adet</label>
                           <input 
                              type="number" 
                              className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-center text-slate-800 outline-none shadow-inner"
                              value={reprintModal.count}
                              onChange={(e) => setReprintModal({ ...reprintModal, count: parseInt(e.target.value) || 0 })}
                           />
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-4 mt-4">
                     <Printer size={20} /> YAZICIYA GÖNDER
                  </button>
               </div>

               <div className="w-full lg:w-[350px] bg-slate-900 p-10 flex flex-col items-center justify-center gap-8">
                  <div className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ width: '120px', height: '320px', padding: '12px' }}>
                     <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-slate-900 border-dashed rounded-md p-2">
                        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-sm">
                           <QrCode size={48} className="text-white" />
                        </div>
                        
                        <div className="text-center space-y-2">
                           <p className="text-slate-900 uppercase font-black break-words px-1 text-[7px] leading-tight">
                              {reprintModal.item.stockName}
                           </p>
                           <div className="h-[1px] bg-slate-900 w-full" />
                           <p className="text-slate-900 font-mono font-black text-[9px]">
                              {reprintModal.item.stockCode}
                           </p>
                        </div>

                        <div className="mt-auto w-full text-center">
                           <p className="text-[12px] font-black text-slate-900 leading-none">
                              {reprintModal.qty.toLocaleString()}
                           </p>
                           <p className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">MİKTAR / {reprintModal.item.unit}</p>
                        </div>

                        <div className="w-full h-4 bg-slate-100 flex items-center justify-center rounded">
                           <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em]">FLEX ARŞİV</p>
                        </div>
                     </div>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">QR: {reprintModal.item.stockCode}</p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LabelPrintReport;
