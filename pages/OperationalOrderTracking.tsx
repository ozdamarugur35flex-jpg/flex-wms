
import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  RotateCcw, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Box, 
  CheckCircle2, 
  Clock, 
  Building, 
  Info,
  LayoutList,
  Database,
  Hash,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { OperationalOrderItem } from '../types';

const mockOperationalOrders: OperationalOrderItem[] = [
  { id: '1', date: '2024-03-21', branchName: 'Merkez Şube', customerName: 'Aksoy Metal Ltd.', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', orderedQty: 1000, shippedQty: 1000, balance: 0, unit: 'ADET', status: 'Sevk Edildi' },
  { id: '2', date: '2024-03-21', branchName: 'Fabrika-1', customerName: 'Yılmaz Lojistik', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', orderedQty: 5000, shippedQty: 2500, balance: 2500, unit: 'ADET', status: 'Kısmi Sevk' },
  { id: '3', date: '2024-03-22', branchName: 'Merkez Şube', customerName: 'Aksoy Metal Ltd.', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', orderedQty: 200, shippedQty: 0, balance: 200, unit: 'ADET', status: 'Sevk Edilecek' },
  { id: '4', date: '2024-03-22', branchName: 'Fabrika-2', customerName: 'Global Export', stockCode: 'AL-4040', stockName: 'Alüminyum Profil 40x40', orderedQty: 150, shippedQty: 150, balance: 0, unit: 'ADET', status: 'Sevk Edildi' },
  { id: '5', date: '2024-03-23', branchName: 'Fabrika-1', customerName: 'Yılmaz Lojistik', stockCode: 'BND-45', stockName: 'Koli Bandı 45mm', orderedQty: 50, shippedQty: 0, balance: 50, unit: 'RULO', status: 'Sevk Edilecek' },
];

const OperationalOrderTracking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'daily'>('list');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dates, setDates] = useState({ start: '2024-03-01', end: '2024-03-31' });
  const [selectedBranch, setSelectedBranch] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');

  const branches = ['Tümü', 'Merkez Şube', 'Fabrika-1', 'Fabrika-2', 'Lojistik Depo'];

  const filteredData = useMemo(() => {
    return mockOperationalOrders.filter(item => {
      const matchBranch = selectedBranch === 'Tümü' || item.branchName === selectedBranch;
      const matchSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.stockCode.toLowerCase().includes(searchTerm.toLowerCase());
      const itemDate = new Date(item.date);
      const start = new Date(dates.start);
      const end = new Date(dates.end);
      const matchDate = itemDate >= start && itemDate <= end;
      
      return matchBranch && matchSearch && matchDate;
    });
  }, [selectedBranch, searchTerm, dates]);

  const handleExportExcel = () => {
    const exportData = filteredData.map(item => ({
      'Tarih': item.date,
      'Şube': item.branchName,
      'Müşteri Ünvanı': item.customerName,
      'Stok Kodu': item.stockCode,
      'Stok Adı': item.stockName,
      'Sipariş Miktarı': item.orderedQty,
      'Sevk Miktarı': item.shippedQty,
      'Bakiye': item.balance,
      'Birim': item.unit,
      'Durum': item.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operasyon Raporu");
    XLSX.writeFile(workbook, "Operasyonel_Siparis_Takip.xlsx");
  };

  const dailyGroups = useMemo(() => {
    const groups: Record<string, OperationalOrderItem[]> = {};
    filteredData.forEach(item => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredData]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden text-slate-900">
      
      {/* SOL FİLTRE PANELİ */}
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Filter size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Sipariş Filtreleri</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-200">
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                     <Calendar size={12} className="text-indigo-500" /> Tarih Aralığı
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={dates.start} onChange={(e) => setDates({...dates, start: e.target.value})} />
                    <input type="date" className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" value={dates.end} onChange={(e) => setDates({...dates, end: e.target.value})} />
                  </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Building size={12} className="text-indigo-500" /> Şube Seçimi
               </label>
               <select 
                 className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                 value={selectedBranch}
                 onChange={(e) => setSelectedBranch(e.target.value)}
               >
                 {branches.map(b => <option key={b} value={b}>{b}</option>)}
               </select>
            </div>

            <div className="pt-4 border-t border-slate-50">
               <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
                  SORGULA
               </button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
               <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
               <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  Şube bazlı yetkilendirme aktiftir. Her şube sadece kendi verdiği siparişlerin miktar takibini yapabilir. Fiyat bilgileri operasyonel gizlilik nedeniyle kapatılmıştır.
               </p>
            </div>
          </div>
        )}
      </aside>

      {/* ANA İÇERİK ALANI */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* ÜST ARAÇ ÇUBUĞU */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Truck size={24} />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setActiveTab('list')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>LİSTE GÖRÜNÜMÜ</button>
              <button onClick={() => setActiveTab('daily')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>GÜNLÜK KIRILIM</button>
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

        {/* ARAMA ÇUBUĞU */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                 type="text" 
                 placeholder="Müşteri, ürün adı veya kod ile detaylı arama..." 
                 className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* VERİ TABLOSU */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           
           {activeTab === 'list' && (
              <div className="flex-1 overflow-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
                 <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                       <tr>
                          <th className="px-8 py-5 border-r border-white/5">Tarih</th>
                          <th className="px-8 py-5 border-r border-white/5">Şube Bilgisi</th>
                          <th className="px-8 py-5 border-r border-white/5">Müşteri / Cari Ünvanı</th>
                          <th className="px-8 py-5 border-r border-white/5">Stok / Ürün</th>
                          <th className="px-8 py-5 border-r border-white/5 text-center">Sipariş</th>
                          <th className="px-8 py-5 border-r border-white/5 text-center">Sevk</th>
                          <th className="px-8 py-5 border-r border-white/5 text-center bg-indigo-950">Bakiye</th>
                          <th className="px-8 py-5 text-right">Lojistik Durum</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filteredData.map(item => (
                          <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                                   <Calendar size={14} className="text-slate-300" /> {item.date}
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.branchName}</p>
                             </td>
                             <td className="px-8 py-5">
                                <p className="text-xs font-bold text-slate-700 uppercase truncate max-w-[200px]">{item.customerName}</p>
                             </td>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 border border-slate-100 transition-colors">
                                      <Box size={18} />
                                   </div>
                                   <div>
                                      <p className="text-xs font-black text-slate-800 leading-tight uppercase">{item.stockName}</p>
                                      <p className="text-[10px] text-slate-400 font-mono font-bold">{item.stockCode}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className="text-sm font-black text-slate-800">{item.orderedQty.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{item.unit}</span>
                             </td>
                             <td className="px-8 py-5 text-center">
                                <span className={`text-sm font-black ${item.shippedQty > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>{item.shippedQty.toLocaleString()}</span>
                             </td>
                             <td className="px-8 py-5 text-center bg-indigo-50/20">
                                <div className={`inline-flex px-3 py-1 rounded-xl text-sm font-black ${item.balance > 0 ? 'text-indigo-600 bg-white shadow-sm border border-indigo-100' : 'text-slate-300'}`}>
                                   {item.balance.toLocaleString()}
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tighter ${
                                   item.balance === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                   {item.balance === 0 ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                   {item.balance === 0 ? 'SEVK EDİLDİ' : 'SEVK EDİLECEK'}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           )}

           {activeTab === 'daily' && (
              <div className="flex-1 overflow-auto custom-scrollbar p-8 bg-slate-50/50 space-y-12 animate-in slide-in-from-right-4 duration-500">
                 {dailyGroups.map(([date, items]) => (
                    <div key={date} className="space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="px-5 py-2 bg-slate-900 text-white rounded-2xl shadow-lg flex items-center gap-3">
                             <Calendar size={18} className="text-indigo-400" />
                             <span className="text-sm font-black tracking-tight">{date}</span>
                          </div>
                          <div className="h-[1px] flex-1 bg-slate-200" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length} SİPARİŞ KALEMİ</span>
                       </div>

                       <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                          <table className="w-full text-left border-collapse">
                             <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                   <th className="px-6 py-3">Şube</th>
                                   <th className="px-6 py-3">Müşteri / Cari</th>
                                   <th className="px-6 py-3">Ürün / Stok Bilgisi</th>
                                   <th className="px-6 py-3 text-center">Sipariş</th>
                                   <th className="px-6 py-3 text-center">Sevk</th>
                                   <th className="px-6 py-3 text-center">Bakiye</th>
                                   <th className="px-6 py-3 text-right">Durum</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {items.map(item => (
                                   <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                      <td className="px-6 py-4">
                                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{item.branchName}</span>
                                      </td>
                                      <td className="px-6 py-4">
                                         <p className="text-xs font-bold text-slate-700 uppercase line-clamp-1">{item.customerName}</p>
                                      </td>
                                      <td className="px-6 py-4">
                                         <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 border border-indigo-100">
                                               <Box size={14} />
                                            </div>
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.stockName}</span>
                                         </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                         <span className="text-xs font-black text-slate-700">{item.orderedQty.toLocaleString()}</span>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                         <span className="text-xs font-black text-emerald-600">{item.shippedQty.toLocaleString()}</span>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                         <span className={`text-xs font-black ${item.balance > 0 ? 'text-rose-600' : 'text-slate-300'}`}>{item.balance.toLocaleString()}</span>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                         <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase ${
                                            item.balance === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                         }`}>
                                            {item.balance === 0 ? 'TAMAM' : 'BEKLİYOR'}
                                         </div>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                 ))}
              </div>
           )}

           {/* ÖZET FOOTER */}
           <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
              <div className="flex items-center gap-12">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Açık Sipariş Bakiyesi</p>
                    <p className="text-xl font-black tracking-tight text-indigo-400">
                       {filteredData.reduce((a, b) => a + b.balance, 0).toLocaleString()} <span className="text-[10px] text-slate-600">BİRİM</span>
                    </p>
                 </div>
                 <div className="w-[1px] h-10 bg-white/10" />
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Sevk Edilen Toplam</p>
                    <p className="text-xl font-black tracking-tight text-emerald-400">
                       {filteredData.reduce((a, b) => a + b.shippedQty, 0).toLocaleString()} <span className="text-[10px] text-slate-600">BİRİM</span>
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right hidden md:block">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">FLEX Lojistik Operasyon Servisi</p>
                    <p className="text-[11px] text-indigo-400 font-black uppercase tracking-widest">SİSTEM VERİLERİ GÜNCEL</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalOrderTracking;
