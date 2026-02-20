
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  RotateCcw, 
  FileSpreadsheet, 
  Printer, 
  XCircle, 
  Calendar, 
  Hash, 
  Warehouse as WarehouseIcon, 
  Layers, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  RefreshCcw, 
  BadgeAlert, 
  CheckCircle2, 
  Info, 
  MoreHorizontal,
  LayoutGrid,
  Database,
  ArrowRightCircle,
  FileText,
  AlertTriangle,
  Grid3X3,
  ChevronDown,
  Tag,
  QrCode,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface CountItem {
  id: string;
  stockCode: string;
  stockName: string;
  unit: string;
  warehouseCode: string;
  warehouseName: string;
  cellCode?: string;
  serialNo?: string;
  systemQuantity: number;
  countedQuantity: number;
  isCounted: boolean;
  stockCode2?: string;
  variants: string[];
}

const mockCountData: CountItem[] = [
  { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', unit: 'ADET', warehouseCode: '01', warehouseName: 'Merkez Depo', cellCode: 'A-01-01', serialNo: 'SR-2024-X01', systemQuantity: 500, countedQuantity: 450, isCounted: true, stockCode2: 'P-001', variants: ['Eloksal', '6063'] },
  { id: '2', stockCode: 'AL-4040', stockName: 'Alüminyum Profil 40x40', unit: 'ADET', warehouseCode: '01', warehouseName: 'Merkez Depo', cellCode: 'A-01-05', serialNo: 'SR-2024-X02', systemQuantity: 120, countedQuantity: 0, isCounted: false, stockCode2: 'P-002', variants: ['Siyah'] },
  { id: '3', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', unit: 'ADET', warehouseCode: '01', warehouseName: 'Merkez Depo', cellCode: 'B-10-12', serialNo: 'SR-2024-S99', systemQuantity: 5000, countedQuantity: 5000, isCounted: true, stockCode2: 'C-88', variants: ['Galvaniz'] },
  { id: '4', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', unit: 'ADET', warehouseCode: '02', warehouseName: 'Hammadde Depo', cellCode: 'D-01-01', serialNo: 'SR-P-11', systemQuantity: 1000, countedQuantity: 0, isCounted: false, stockCode2: 'K-30', variants: ['PVC', 'Siyah'] },
];

const InventoryCountList: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [countDate, setCountDate] = useState('2024-03-21');
  const [showUncountedOnly, setShowUncountedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [labelModal, setLabelModal] = useState({ isOpen: false, item: null as CountItem | null, qtyPerLabel: 1, labelCount: 1 });

  const filteredData = useMemo(() => {
    return mockCountData.filter(item => {
      const matchSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.serialNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchUncounted = showUncountedOnly ? !item.isCounted : true;
      return matchSearch && matchUncounted;
    });
  }, [searchTerm, showUncountedOnly]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sayim Listesi");
    XLSX.writeFile(workbook, "Envanter_Sayim_Mutabakat.xlsx");
  };

  const handleProcessCount = () => {
    setIsProcessing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setProgress(0);
        }, 500);
      }
    }, 100);
  };

  const openLabelModal = (item: CountItem) => {
    setLabelModal({ isOpen: true, item, qtyPerLabel: item.countedQuantity || 1, labelCount: 1 });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden text-slate-900">
      
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Filter size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Sayım Kriterleri</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-200"><ChevronLeft size={20} /></button>
        </div>

        {isSidebarOpen && (
          <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar size={12} className="text-indigo-500" /> Sayım Tarihi</label>
                  <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={countDate} onChange={(e) => setCountDate(e.target.value)} />
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer" onClick={() => setShowUncountedOnly(!showUncountedOnly)}>
                  <p className="text-xs font-black text-indigo-600">Sadece Sayılmayanlar</p>
                  <div className={`w-10 h-5 rounded-full relative transition-all ${showUncountedOnly ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                     <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${showUncountedOnly ? 'left-[22px] shadow-md' : 'left-0.5'}`} />
                  </div>
               </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><ClipboardList size={24} /></div>
            <div>
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Sayım Mutabakat Listesi</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95"><RotateCcw size={16} /> Yenile</button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              <FileSpreadsheet size={16} className="text-emerald-700" /> Excel
            </button>
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <button onClick={handleProcessCount} disabled={isProcessing} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50"><PlayCircle size={16} /> Sayım İşle</button>
          </div>
        </div>

        {isProcessing && (
           <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-3 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
                 <span>Sayım Verileri İşleniyor...</span>
                 <span>%{progress} TAMAMLANDI</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
           </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
           <Search size={18} className="text-slate-400 absolute left-8 mt-2.5" />
           <input type="text" placeholder="Stok adı, kod, seri veya depo bazında filtreleme..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1400px]">
                 <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                       <th className="px-8 py-5 border-r border-white/5">Depo / Hücre</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Stok Kodu</th>
                       <th className="px-8 py-5 border-r border-white/5">Stok Adı</th>
                       <th className="px-8 py-5 border-r border-white/5">Seri Numarası</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Birim</th>
                       <th className="px-8 py-5 border-r border-white/5 text-right bg-slate-800">Depo Miktarı</th>
                       <th className="px-8 py-5 border-r border-white/5 text-right bg-indigo-900">Sayım Miktarı</th>
                       <th className="px-8 py-5 text-right w-16"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredData.map((item) => (
                      <tr key={item.id} className={`hover:bg-indigo-50/10 transition-all group ${!item.isCounted ? 'bg-rose-50/10' : ''}`}>
                         <td className="px-8 py-5">
                            <p className="text-xs font-black text-slate-800 uppercase">{item.warehouseName}</p>
                            <p className="text-[10px] text-indigo-500 font-mono font-bold">{item.cellCode || 'ALANSIZ'}</p>
                         </td>
                         <td className="px-8 py-5 text-center font-mono text-[10px] text-slate-600">{item.stockCode}</td>
                         <td className="px-8 py-5 font-black text-slate-700 uppercase">{item.stockName}</td>
                         <td className="px-8 py-5 font-mono text-[10px] text-indigo-600">{item.serialNo || 'SERİSİZ'}</td>
                         <td className="px-8 py-5 text-center font-black text-slate-400">{item.unit}</td>
                         <td className="px-8 py-5 text-right font-black text-slate-500">{item.systemQuantity.toLocaleString()}</td>
                         <td className="px-8 py-5 text-right font-black text-indigo-600">{item.isCounted ? item.countedQuantity.toLocaleString() : 'BEKLİYOR'}</td>
                         <td className="px-8 py-5 text-right"><MoreHorizontal size={18} className="text-slate-300" /></td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryCountList;
