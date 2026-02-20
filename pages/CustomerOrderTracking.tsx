
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Clock, 
  Box, 
  BadgeAlert, 
  Factory, 
  Truck, 
  MoreHorizontal, 
  Settings2, 
  ShieldCheck, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  LayoutGrid,
  Zap,
  TrendingUp,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
// Fix: Removed JobOrder which is not defined in types.ts
import { CustomerOrderTracking as ITracking } from '../types';

const mockTrackingData: ITracking[] = [
  { id: '1', planRowNo: 1, hasTooling: true, customerCode: 'C-001', customerName: 'Aksoy Lojistik Tic.', orderStatus: 'Üretimde', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', orderQty: 1000, deliveredQty: 300, balance: 700, orderNo: 'SİP-2024-001', orderType: 'Kesin', deliveryDate: '2024-03-20', initialDeliveryDate: '2024-03-15', notes: 'Özel kesim yapılacak', priceTL: 45.5, priceCurrency: 1.4, currencyType: 'USD', productionQty: 450, isRework: false, unit: 'ADET', totalAmountTL: 45500 },
  { id: '2', planRowNo: 2, hasTooling: false, customerCode: 'C-002', customerName: 'Yılmaz Metal A.Ş.', orderStatus: 'Beklemede', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', orderQty: 5000, deliveredQty: 0, balance: 5000, orderNo: 'SİP-2024-002', orderType: 'Kesin', deliveryDate: '2024-03-26', initialDeliveryDate: '2024-03-26', notes: '', priceTL: 1.2, priceCurrency: 1.2, currencyType: 'TRY', productionQty: 0, isRework: true, unit: 'ADET', totalAmountTL: 6000 },
];

const CustomerOrderTracking: React.FC = () => {
  const [data, setData] = useState<ITracking[]>(mockTrackingData);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'Tümü' | 'Kesin' | 'Plan'>('Tümü');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.stockName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = orderTypeFilter === 'Tümü' || item.orderType === orderTypeFilter;
      return matchSearch && matchType;
    });
  }, [data, searchTerm, orderTypeFilter]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siparis Durum");
    XLSX.writeFile(workbook, "Musteri_Siparis_Takip.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><ClipboardList size={24} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Müşteri Sipariş Durum</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Üretim & Sevkiyat İzleme</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"><RotateCcw size={16} /> Listele</button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
         <input type="text" placeholder="Müşteri adı, ürün kodu veya sipariş no ile akıllı arama..." className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sipariş / Müşteri</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Üretim / Sevk</th>
                <th className="px-6 py-5 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                   <td className="px-6 py-4 font-black text-slate-800">{item.customerName} <span className="text-[10px] text-slate-400 ml-2">{item.orderNo}</span></td>
                   <td className="px-6 py-4 text-center font-black text-slate-700">{item.orderQty}</td>
                   <td className="px-6 py-4 text-center font-black text-emerald-600">{item.productionQty} / {item.deliveredQty}</td>
                   <td className="px-6 py-4 text-right font-black text-indigo-600">₺{item.totalAmountTL.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTracking;