
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  RotateCcw, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Truck, 
  Box, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  ArrowUpRight,
  Info,
  BadgeAlert,
  Smartphone,
  Eye,
  ArrowRightCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ShipmentOrderItem } from '../types';

const mockShipmentOrders: ShipmentOrderItem[] = [
  { id: '1', orderNo: 'SİP-9001', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', customerName: 'Aksoy Metal Sanayi', branchName: 'Merkez', orderedQty: 1000, shippedQty: 1000, unit: 'ADET', status: 'Tamamlandı', terminalStatus: 'Aktarıldı', date: '2024-03-20' },
  { id: '2', orderNo: 'SİP-9002', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', customerName: 'Yılmaz Lojistik A.Ş.', branchName: 'Fabrika-1', orderedQty: 5000, shippedQty: 3200, unit: 'ADET', status: 'Kısmi Sevk', terminalStatus: 'Aktarıldı', date: '2024-03-21' },
  { id: '3', orderNo: 'SİP-9003', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', customerName: 'Global Export Ltd.', branchName: 'Fabrika-1', orderedQty: 250, shippedQty: 0, unit: 'ADET', status: 'Beklemede', terminalStatus: 'Aktarıldı', date: '2024-03-21' },
  { id: '4', orderNo: 'SİP-9004', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', customerName: 'Global Export Ltd.', branchName: 'Lojistik Depo', orderedQty: 800, shippedQty: 0, unit: 'ADET', status: 'Beklemede', terminalStatus: 'Bekliyor', date: '2024-03-21' },
];

const ShipmentOrderList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredData = useMemo(() => {
    return mockShipmentOrders.filter(item => {
      const matchSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCompleted = showCompleted ? true : item.status !== 'Tamamlandı';
      return matchSearch && matchCompleted;
    });
  }, [searchTerm, showCompleted]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sevk Emirleri");
    XLSX.writeFile(workbook, "Sevk_Emri_Listesi.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Sevk Emri İzleme Listesi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Depo Fiili Yükleme Takibi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all active:scale-95">
            <RotateCcw size={16} /> Yenile
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
         <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
               <Truck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bekleyen Sevk</p>
               <h4 className="text-xl font-black text-slate-800">{mockShipmentOrders.filter(o => o.status !== 'Tamamlandı').length} EMİR</h4>
            </div>
         </div>
         <div className="bg-slate-900 p-5 rounded-[2rem] text-white flex items-center justify-between group cursor-pointer" onClick={() => setShowCompleted(!showCompleted)}>
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Görünüm Filtresi</p>
               <h4 className="text-sm font-black">{showCompleted ? 'TÜMÜNÜ GİZLE' : 'TAMAMLANANLARI GÖSTER'}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showCompleted ? 'bg-rose-500' : 'bg-emerald-500'}`}>
               <Eye size={20} />
            </div>
         </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Müşteri adı, stok kodu veya emir no ile hızlı arama..." 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
         <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1400px]">
               <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                     <th className="px-8 py-5 border-r border-white/5">Şube / Tarih</th>
                     <th className="px-8 py-5 border-r border-white/5">Sevk Emri / Müşteri</th>
                     <th className="px-8 py-5 border-r border-white/5">Stok Bilgisi</th>
                     <th className="px-8 py-5 border-r border-white/5 text-center">Planlanan</th>
                     <th className="px-8 py-5 border-r border-white/5 text-center">Sevk Edilen</th>
                     <th className="px-8 py-5 border-r border-white/5 text-center">Durum</th>
                     <th className="px-8 py-5 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className={`hover:bg-indigo-50/10 transition-all group ${item.status === 'Tamamlandı' ? 'bg-emerald-50/30' : ''}`}>
                        <td className="px-8 py-5">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.branchName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">{item.date}</p>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                                <p className="text-xs font-black text-indigo-600 font-mono tracking-widest">{item.orderNo}</p>
                                <p className="text-[10px] font-black text-slate-600 uppercase leading-tight line-clamp-1">{item.customerName}</p>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <p className="text-xs font-bold text-slate-700 uppercase">{item.stockName}</p>
                        </td>
                        <td className="px-8 py-5 text-center font-black text-slate-800">{item.orderedQty.toLocaleString()}</td>
                        <td className="px-8 py-5 text-center font-black text-emerald-600">{item.shippedQty.toLocaleString()}</td>
                        <td className="px-8 py-5 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${item.status === 'Tamamlandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {item.status}
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
      </div>
    </div>
  );
};

export default ShipmentOrderList;
