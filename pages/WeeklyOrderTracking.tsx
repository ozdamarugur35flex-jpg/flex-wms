
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  Warehouse as WarehouseIcon, 
  Users, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  LayoutList,
  Database,
  ArrowUpRight,
  ArrowRightCircle,
  MoreHorizontal,
  Info,
  History,
  TrendingUp,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { WeeklyOrderTrackingRow, WarehouseBalanceRow } from '../types';

const mockWeeklyData: WeeklyOrderTrackingRow[] = [
  { 
    id: '1', 
    customerName: 'Aksoy Metal Sanayi ve Tic. Ltd.', 
    weeks: [
      { weekNo: 1, startDate: '2024-03-25', stockCode: 'AL-2020', quantity: 2500, unit: 'ADET' },
      { weekNo: 2, startDate: '2024-04-01', stockCode: 'AL-2020', quantity: 1800, unit: 'ADET' },
      { weekNo: 3, startDate: '2024-04-08', stockCode: 'AL-4040', quantity: 500, unit: 'ADET' },
      { weekNo: 4, startDate: '2024-04-15', stockCode: '', quantity: 0, unit: '' },
      { weekNo: 5, startDate: '2024-04-22', stockCode: 'AL-2020', quantity: 3000, unit: 'ADET' },
      { weekNo: 6, startDate: '2024-04-29', stockCode: '', quantity: 0, unit: '' },
      { weekNo: 7, startDate: '2024-05-06', stockCode: 'AL-1010', quantity: 1200, unit: 'ADET' },
    ]
  },
];

const WeeklyOrderTracking: React.FC = () => {
  // Completed the component implementation and added default export to resolve "no default export" error in App.tsx.
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return mockWeeklyData.filter(row => 
      row.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Haftalik Rapor");
    XLSX.writeFile(workbook, "Haftalik_Siparis_Durum.xlsx");
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
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Filtreleme</span>
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
          <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Search size={12} className="text-indigo-500" /> Müşteri Ara
               </label>
               <input 
                  type="text" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" 
                  placeholder="Ünvan giriniz..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">SORGULA</button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <LayoutList size={24} />
            </div>
            <div>
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Haftalık Müşteri Sipariş Durum</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Sevkiyat & Termin Analizi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95">
              <RotateCcw size={16} /> Yenile
            </button>
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                 <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                       <th className="px-8 py-5 border-r border-white/5 sticky left-0 z-20 bg-slate-950 w-[350px]">Müşteri / Firma Ünvanı</th>
                       {mockWeeklyData[0].weeks.map(w => (
                          <th key={w.weekNo} className="px-6 py-5 border-r border-white/5 text-center min-w-[150px]">
                             <div className="flex flex-col items-center">
                                <span className="text-indigo-400 mb-1">{w.weekNo}. HAFTA</span>
                                <span className="text-[8px] opacity-40 font-mono tracking-tighter">{w.startDate}</span>
                             </div>
                          </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredData.map(row => (
                       <tr key={row.id} className="hover:bg-indigo-50/10 transition-all group">
                          <td className="px-8 py-5 sticky left-0 z-10 bg-white group-hover:bg-indigo-50 transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                             <p className="text-xs font-black text-slate-800 uppercase tracking-tighter line-clamp-2 leading-tight">{row.customerName}</p>
                          </td>
                          {row.weeks.map((w, idx) => (
                             <td key={idx} className={`px-6 py-5 text-center transition-all ${w.quantity > 0 ? 'bg-indigo-50/20' : ''}`}>
                                {w.quantity > 0 ? (
                                   <div className="flex flex-col items-center gap-1 animate-in zoom-in duration-300">
                                      <span className="text-xs font-black text-indigo-600">{w.quantity.toLocaleString()}</span>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-white/50 px-1.5 py-0.5 rounded border border-indigo-100">{w.stockCode}</span>
                                   </div>
                                ) : (
                                   <span className="text-slate-200">---</span>
                                )}
                             </td>
                          ))}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
              <div className="flex items-center gap-12">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Analiz Edilen Müşteri</p>
                    <p className="text-xl font-black tracking-tight text-indigo-400">{filteredData.length}</p>
                 </div>
                 <div className="w-[1px] h-10 bg-white/10" />
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sistem Durumu</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Veriler Güncel</span>
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">FLEX WMS Reporting Engine v4.2</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyOrderTracking;
