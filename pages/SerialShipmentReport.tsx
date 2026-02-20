
import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  Search, 
  Filter, 
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
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ShipmentRecord {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  stockCode: string;
  stockName: string;
  serialNo: string;
  quantity: number;
  unit: string;
}

const mockShipments: ShipmentRecord[] = [
  { id: '1', invoiceNo: 'IRS202400012', date: '2024-03-21', customerName: 'Aksoy Metal Sanayi', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', serialNo: 'SR-2024-X01', quantity: 450, unit: 'ADET' },
  { id: '2', invoiceNo: 'IRS202400012', date: '2024-03-21', customerName: 'Aksoy Metal Sanayi', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', serialNo: 'SR-2024-X02', quantity: 120, unit: 'ADET' },
  { id: '3', invoiceNo: 'IRS202400015', date: '2024-03-20', customerName: 'Global Export GmbH', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', serialNo: 'SR-2024-S55', quantity: 5000, unit: 'ADET' },
  { id: '4', invoiceNo: 'IRS202400018', date: '2024-03-19', customerName: 'Yılmaz Ltd. Şti.', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', serialNo: 'SR-2024-P99', quantity: 250, unit: 'ADET' },
];

const SerialShipmentReport: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dates, setDates] = useState({ start: '2024-03-01', end: '2024-03-31' });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return mockShipments.filter(s => 
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.serialNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seri Sevkiyatlar");
    XLSX.writeFile(workbook, "Seri_Sevkiyat_Raporu.xlsx");
  };

  const totals = useMemo(() => ({
    count: filteredData.length,
    qty: filteredData.reduce((a, b) => a + b.quantity, 0)
  }), [filteredData]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Filter size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Rapor Kriter</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all active:scale-95 border border-transparent hover:border-slate-200">
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Calendar size={12} className="text-indigo-500" /> Başlangıç Tarihi
                  </label>
                  <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={dates.start} onChange={(e) => setDates({...dates, start: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Calendar size={12} className="text-rose-500" /> Bitiş Tarihi
                  </label>
                  <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={dates.end} onChange={(e) => setDates({...dates, end: e.target.value})} />
               </div>
            </div>
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">LİSTELE</button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Truck size={24} />
            </div>
            <div>
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Seri Sevkiyat İzleme</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Çıkış & Lojistik Analizi</p>
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
            <div className="w-[1px] h-6 bg-slate-200 mx-1" />
            <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                 type="text" 
                 placeholder="İrsaliye no, firma, stok veya seri no ile akıllı filtreleme..." 
                 className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
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
                       <th className="px-8 py-5 border-r border-white/5">Tarih</th>
                       <th className="px-8 py-5 border-r border-white/5">İrsaliye No</th>
                       <th className="px-8 py-5 border-r border-white/5">Müşteri / Firma</th>
                       <th className="px-8 py-5 border-r border-white/5">Ürün / Stok Bilgisi</th>
                       <th className="px-8 py-5 border-r border-white/5">Seri Numarası</th>
                       <th className="px-8 py-5 border-r border-white/5 text-right">Miktar</th>
                       <th className="px-8 py-5 text-right w-16"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {filteredData.map((s) => (
                       <tr key={s.id} className="hover:bg-indigo-50/10 transition-all group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <Calendar size={14} className="text-slate-300" /> {s.date}
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black font-mono border border-slate-200 uppercase tracking-tighter">
                                {s.invoiceNo}
                             </span>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-tighter line-clamp-1">{s.customerName}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div>
                                <p className="text-xs font-bold text-slate-700 leading-none mb-1 uppercase">{s.stockName}</p>
                                <p className="text-[10px] text-slate-400 font-mono font-bold">{s.stockCode}</p>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                <span className="text-[11px] font-black text-indigo-600 font-mono tracking-tighter uppercase px-2 py-0.5 bg-indigo-50 rounded-md border border-indigo-100">
                                   {s.serialNo}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <span className="text-sm font-black text-slate-800">{s.quantity.toLocaleString()}</span>
                             <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{s.unit}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={18} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
              <div className="flex items-center gap-12">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Kalem</p>
                    <p className="text-xl font-black tracking-tight text-indigo-400">{totals.count}</p>
                 </div>
                 <div className="w-[1px] h-10 bg-white/10" />
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Miktar</p>
                    <p className="text-xl font-black tracking-tight text-emerald-400">
                       {totals.qty.toLocaleString()} <span className="text-xs font-bold text-slate-500 ml-1">ADET</span>
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SerialShipmentReport;
