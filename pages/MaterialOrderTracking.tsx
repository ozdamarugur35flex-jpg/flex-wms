
import React, { useState, useMemo } from 'react';
import { 
  PackageSearch, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  TrendingDown,
  Truck,
  Box,
  BadgeAlert,
  ArrowRightCircle,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MaterialOrder } from '../types';

const mockMaterialOrders: MaterialOrder[] = [
  { id: '1', orderStatus: 'Açık', groupCode: 'HAMMADDE', materialCode: 'AL-2020', materialName: 'Alüminyum Profil 20x20', orderQty: 1000, deliveredQty: 400, balance: 600, orderNo: 'MLZ-2024-001', supplierName: 'Aksoy Metal Sanayi', orderType: 'Kesin', deliveryDate: '2024-03-15', notes: 'Acil üretim için', unit: 'ADET' },
  { id: '2', orderStatus: 'Açık', groupCode: 'BAĞLANTI', materialCode: 'SMN-M8', materialName: 'Çelik Somun M8', orderQty: 5000, deliveredQty: 0, balance: 5000, orderNo: 'MLZ-2024-002', supplierName: 'Civata Dünyası', orderType: 'Kesin', deliveryDate: '2024-03-24', notes: '', unit: 'ADET' },
  { id: '3', orderStatus: 'Açık', groupCode: 'HAMMADDE', materialCode: 'PL-3030', materialName: 'Plastik Kapak 30x30', orderQty: 200, deliveredQty: 200, balance: 0, orderNo: 'MLZ-2024-003', supplierName: 'Global Plastik A.Ş.', orderType: 'Planlanan', deliveryDate: '2024-03-28', notes: 'Yedek parça', unit: 'ADET' },
  { id: '4', orderStatus: 'Kapalı', groupCode: 'SARF', materialCode: 'BND-45', materialName: 'Koli Bandı 45mm', orderQty: 50, deliveredQty: 50, balance: 0, orderNo: 'MLZ-2024-004', supplierName: 'Ambalaj Market', orderType: 'Kesin', deliveryDate: '2024-03-10', notes: '', unit: 'RULO' },
];

const MaterialOrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<MaterialOrder[]>(mockMaterialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Tümü' | 'Geciken' | 'Yaklaşan'>('Tümü');

  const today = new Date();
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = order.materialName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      const delDate = new Date(order.deliveryDate);
      const diffDays = Math.ceil((delDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (filterType === 'Geciken') return delDate < today && order.balance > 0;
      if (filterType === 'Yaklaşan') return diffDays >= 0 && diffDays <= 5 && order.balance > 0;
      return true;
    });
  }, [orders, searchTerm, filterType]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Malzeme Takip");
    XLSX.writeFile(workbook, "Malzeme_Siparis_Takip.xlsx");
  };

  const stats = useMemo(() => {
    return {
      totalOpen: orders.filter(o => o.balance > 0).length,
      totalBalance: orders.reduce((acc, curr) => acc + curr.balance, 0)
    };
  }, [orders]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><PackageSearch size={24} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Malzeme Sipariş Durum</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Tedarik & Takip Dashboard</p>
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

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
         <Search size={18} className="text-slate-400 absolute left-8 mt-2.5" />
         <input type="text" placeholder="Malzeme adı, sipariş no veya tedarikçi ile hızlı ara..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sipariş Bilgisi</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Bakiye</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Teslim Tarihi</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-6 py-4 font-black text-slate-800">{order.materialName} <span className="text-[10px] text-slate-400 ml-2">{order.orderNo}</span></td>
                  <td className="px-6 py-4 text-center font-black text-indigo-600">{order.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">{order.deliveryDate}</td>
                  <td className="px-6 py-4 text-right"><MoreHorizontal size={18} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MaterialOrderTracking;
