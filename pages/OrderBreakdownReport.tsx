
import React, { useState, useMemo } from 'react';
import { 
  History, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Calendar,
  Building,
  Target,
  UserCheck,
  TrendingUp,
  Info,
  Layers,
  Box,
  Hash,
  ArrowRightCircle,
  Database,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { OrderBreakdownItem, CustomerMapping, InactiveBranch } from '../types';

const mockOrderData: OrderBreakdownItem[] = [
  { id: '1', date: '2024-03-21', branchName: 'Merkez', customerCode: 'C001', customerName: 'Aksoy Metal Sanayi', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', groupCode: 'METAL', quantity: 1250, unitPrice: 45.5, totalPrice: 56875, unit: 'ADET' },
  { id: '2', date: '2024-03-22', branchName: 'Fabrika-1', customerCode: 'C002', customerName: 'Yılmaz Lojistik', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', groupCode: 'BAGLANTI', quantity: 5000, unitPrice: 1.25, totalPrice: 6250, unit: 'ADET' },
  { id: '3', date: '2024-03-23', branchName: 'Fabrika-2', customerCode: 'C001', customerName: 'Aksoy Metal Sanayi', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', groupCode: 'METAL', quantity: 800, unitPrice: 45.5, totalPrice: 36400, unit: 'ADET' },
  { id: '4', date: '2024-03-24', branchName: 'Merkez', customerCode: 'C003', customerName: 'Global Export Ltd.', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', groupCode: 'PLASTIK', quantity: 200, unitPrice: 8.5, totalPrice: 1700, unit: 'ADET' },
];

const mockInactiveBranches: InactiveBranch[] = [
  { id: 'I1', branchName: 'Bursa Şube', customerName: 'Otomotiv Yan Sanayi A.Ş.', lastPurchaseDate: '2024-01-15', daysSinceLastPurchase: 66 },
  { id: 'I2', branchName: 'İzmir Şube', customerName: 'Ege Metal Sanayi', lastPurchaseDate: '2024-02-10', daysSinceLastPurchase: 40 },
];

const OrderBreakdownReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'mapping' | 'inactive'>('report');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [dates, setDates] = useState({ start: '2024-03-01', end: '2024-03-31' });
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [mappings, setMappings] = useState<CustomerMapping[]>([
    { id: 'm1', originalName: 'Aksoy Metal Sanayi', aliasName: 'Aksoy Grup (Ana)' },
    { id: 'm2', originalName: 'Yılmaz Lojistik', aliasName: 'Yılmaz Nakliyat Hizmetleri' }
  ]);
  const [newMap, setNewMap] = useState({ original: '', alias: '' });

  const groups = Array.from(new Set(mockOrderData.map(item => item.groupCode)));
  const stocks = Array.from(new Set(mockOrderData.map(item => item.stockCode)));

  const filteredData = useMemo(() => {
    return mockOrderData.filter(item => {
      const matchGroup = !selectedGroup || item.groupCode === selectedGroup;
      const matchStock = !selectedStock || item.stockCode === selectedStock;
      const matchSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.stockName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGroup && matchStock && matchSearch;
    });
  }, [selectedGroup, selectedStock, searchTerm]);

  const handleExportExcel = () => {
    let exportData: any[] = [];
    if (activeTab === 'report') {
      exportData = filteredData.map(item => ({
        'Tarih': item.date,
        'Şube': item.branchName,
        'Müşteri Kodu': item.customerCode,
        'Müşteri Adı': item.customerName,
        'Stok Kodu': item.stockCode,
        'Stok Adı': item.stockName,
        'Miktar': item.quantity,
        'Birim': item.unit,
        'Birim Fiyat': item.unitPrice,
        'Toplam Tutar': item.totalPrice
      }));
    } else if (activeTab === 'mapping') {
      exportData = mappings.map(m => ({
        'Orijinal İsim': m.originalName,
        'Alias (Görünen İsim)': m.aliasName
      }));
    } else {
      exportData = mockInactiveBranches.map(ib => ({
        'Şube': ib.branchName,
        'Müşteri': ib.customerName,
        'Son Alım Tarihi': ib.lastPurchaseDate,
        'Pasif Gün Sayısı': ib.daysSinceLastPurchase
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siparis Kirilim");
    XLSX.writeFile(workbook, `Siparis_Kirilim_${activeTab}.xlsx`);
  };

  const getAlias = (name: string) => {
    const map = mappings.find(m => m.originalName === name);
    return map ? map.aliasName : name;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden text-slate-900">
      
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <Filter size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Rapor Kriterleri</span>
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
            <div className="space-y-4 pt-4 border-t border-slate-50">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grup Kodu</label>
                  <select className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500" value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
                    <option value="">TÜMÜ</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
            </div>
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">ANALİZ ET</button>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Target size={24} />
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setActiveTab('report')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'report' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>SİPARİŞ DETAY</button>
              <button onClick={() => setActiveTab('mapping')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'mapping' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>CARİ EŞLEŞTİRME</button>
              <button onClick={() => setActiveTab('inactive')} className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'inactive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>PASİF ANALİZİ</button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95">
              <RotateCcw size={16} /> Yenile
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
              <FileSpreadsheet size={16} className="text-emerald-700" /> Excel
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           {activeTab === 'report' && (
              <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="relative max-w-md w-full">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                       <input type="text" placeholder="Hızlı filtrele..." className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                 </div>
                 <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                       <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.15em]">
                          <tr>
                             <th className="px-8 py-5 border-r border-white/5">Tarih</th>
                             <th className="px-8 py-5 border-r border-white/5">Müşteri</th>
                             <th className="px-8 py-5 border-r border-white/5 bg-indigo-950">Alias</th>
                             <th className="px-8 py-5 border-r border-white/5">Ürün</th>
                             <th className="px-8 py-5 border-r border-white/5 text-center">Miktar</th>
                             <th className="px-8 py-5 text-right">Toplam</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {filteredData.map(item => (
                             <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group">
                                <td className="px-8 py-5 text-xs font-black text-slate-800">{item.date}</td>
                                <td className="px-8 py-5 text-sm font-bold text-slate-600">{item.customerName}</td>
                                <td className="px-8 py-5 bg-indigo-50/30 text-sm font-black text-indigo-700">{getAlias(item.customerName)}</td>
                                <td className="px-8 py-5 text-xs font-bold text-slate-700 uppercase">{item.stockName}</td>
                                <td className="px-8 py-5 text-center text-sm font-black">{item.quantity.toLocaleString()} {item.unit}</td>
                                <td className="px-8 py-5 text-right text-sm font-black text-emerald-600">₺{item.totalPrice.toLocaleString()}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OrderBreakdownReport;
