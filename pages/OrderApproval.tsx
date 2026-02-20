
import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  AlertCircle, 
  Info, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  LayoutList,
  History,
  ShieldCheck,
  Calendar,
  Box,
  Hash,
  ArrowRightLeft,
  Check,
  X,
  MessageCircle,
  AlertTriangle,
  TrendingDown,
  Truck,
  DollarSign
} from 'lucide-react';
import { OrderApprovalItem as IItem } from '../types';

const mockApprovalData: IItem[] = [
  { id: '1', orderCode: 'SİP-2024-001', lineNo: 1, stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', orderDate: '2024-03-21', deliveryDate: '2024-04-10', orderQty: 1000, deliveredQty: 0, balance: 1000, systemBalance: 0, systemDeliveryDate: '---', updatedQty: 1000, updatedDate: '2024-04-10', description: 'Yeni müşteri talebi', status: 'New', approvalStatus: 'Beklemede', lastSupplier: 'Aksoy Metal', lastPurchasePrice: 42.50, lastPurchaseDate: '2024-02-15', currentStock: 120, minStockLevel: 500 },
  { id: '2', orderCode: 'SİP-2024-002', lineNo: 1, stockCode: 'SMN-M8', stockName: 'M8 Çelik Somun', orderDate: '2024-03-21', deliveryDate: '2024-04-05', orderQty: 5000, deliveredQty: 0, balance: 5000, systemBalance: 4500, systemDeliveryDate: '2024-04-05', updatedQty: 5000, updatedDate: '2024-04-05', description: 'Miktar revize edildi', status: 'QtyChange', approvalStatus: 'Beklemede', lastSupplier: 'Civata Dünyası', lastPurchasePrice: 1.15, lastPurchaseDate: '2024-03-01', currentStock: 4500, minStockLevel: 1000 },
  { id: '3', orderCode: 'SİP-2024-003', lineNo: 2, stockCode: 'INVALID-99', stockName: 'Tanımsız Ürün', orderDate: '2024-03-21', deliveryDate: '2024-04-12', orderQty: 100, deliveredQty: 0, balance: 100, systemBalance: 0, systemDeliveryDate: '---', updatedQty: 0, updatedDate: '---', description: 'Sistemde bulunamadı!', status: 'InvalidStock', approvalStatus: 'Beklemede' },
  { id: '4', orderCode: 'SİP-2024-004', lineNo: 1, stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', orderDate: '2024-03-21', deliveryDate: '2024-04-15', orderQty: 250, deliveredQty: 0, balance: 250, systemBalance: 250, systemDeliveryDate: '2024-04-10', updatedQty: 250, updatedDate: '2024-04-15', description: 'Teslim tarihi ötelendi', status: 'DateChange', approvalStatus: 'Beklemede', lastSupplier: 'Global Plastik', lastPurchasePrice: 3.80, lastPurchaseDate: '2023-12-20', currentStock: 12, minStockLevel: 50 },
];

const OrderApproval: React.FC = () => {
  const [data, setData] = useState<IItem[]>(mockApprovalData);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingItem, setRejectingItem] = useState<IItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stockCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleApprove = (id: string) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, approvalStatus: 'Onaylandı', rejectionReason: undefined } : item
    ));
  };

  const handleReject = () => {
    if (!rejectingItem || !rejectionReason.trim()) return;
    setData(prev => prev.map(item => 
      item.id === rejectingItem.id ? { ...item, approvalStatus: 'Reddedildi', rejectionReason } : item
    ));
    setRejectingItem(null);
    setRejectionReason('');
  };

  const getStatusStyle = (status: IItem['status']) => {
    switch(status) {
      case 'New': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', label: 'Yeni Sipariş' };
      case 'QtyChange': return { bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-700', label: 'Miktar Değişikliği' };
      case 'DateChange': return { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700', label: 'Tarih Değişikliği' };
      case 'InvalidStock': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', label: 'Kayıtlı Değil' };
      case 'StockChange': return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', label: 'Kod Değişikliği' };
      default: return { bg: 'bg-white', border: 'border-slate-100', text: 'text-slate-600', label: 'Belirsiz' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Sipariş İzleme & Onay Analizi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Yönetici Onay Paneli</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100">
            <Save size={16} /> Değişiklikleri Sisteme İşle
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Sipariş kodu, stok adı veya kod ile gridde ara..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* APPROVAL GRID */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-slate-900 text-white h-16 text-[10px] font-black uppercase tracking-[0.15em]">
                <th className="px-6 py-4 border-r border-white/5">Sipariş / Kalem</th>
                <th className="px-6 py-4 border-r border-white/5">Stok & Envanter</th>
                <th className="px-6 py-4 border-r border-white/5 text-center">Satınalma Geçmişi</th>
                <th className="px-6 py-4 border-r border-white/5 text-center">Talep Miktarı</th>
                <th className="px-6 py-4 border-r border-white/5 text-center">Onay Durumu</th>
                <th className="px-6 py-4 text-right">İşlem / Gerekçe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => {
                const style = getStatusStyle(item.status);
                const isCriticalStock = item.currentStock !== undefined && item.minStockLevel !== undefined && item.currentStock < item.minStockLevel;

                return (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-indigo-50/20 transition-all group ${item.approvalStatus === 'Onaylandı' ? 'bg-emerald-50/30' : item.approvalStatus === 'Reddedildi' ? 'bg-rose-50/30' : style.bg}`}
                  >
                    <td className="px-6 py-5">
                       <p className="text-sm font-black text-slate-800 tracking-tight">{item.orderCode}</p>
                       <p className="text-[10px] text-slate-400 font-bold">KALEM NO: {item.lineNo}</p>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1">
                          <p className="text-sm font-bold text-slate-700 leading-tight">{item.stockName}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{item.stockCode}</p>
                          {item.currentStock !== undefined && (
                             <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-black">
                                   <span className="text-slate-400">MEVCUT:</span>
                                   <span className={isCriticalStock ? 'text-rose-600' : 'text-emerald-600'}>{item.currentStock.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-black">
                                   <span className="text-slate-400">MİN:</span>
                                   <span className="text-slate-700">{item.minStockLevel?.toLocaleString()}</span>
                                </div>
                                {isCriticalStock && <TrendingDown size={12} className="text-rose-500 animate-pulse" title="Kritik Stok Seviyesi!" />}
                             </div>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       {item.lastSupplier ? (
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 shadow-inner">
                             <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600">
                                <Truck size={12} />
                                <span className="uppercase truncate max-w-[150px]">{item.lastSupplier}</span>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                   <DollarSign size={10} />
                                   <span>{item.lastPurchasePrice?.toFixed(2)} TL</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                   <Calendar size={10} />
                                   <span>{item.lastPurchaseDate}</span>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="text-center text-[10px] font-bold text-slate-300 italic uppercase">Alış Kaydı Yok</div>
                       )}
                    </td>
                    <td className="px-6 py-5 text-center">
                       <p className="text-lg font-black text-slate-800">{item.orderQty.toLocaleString()}</p>
                       <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">İSTENEN ADET</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                         item.approvalStatus === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                         item.approvalStatus === 'Reddedildi' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                         'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                          {item.approvalStatus}
                       </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {item.approvalStatus === 'Beklemede' ? (
                            <>
                               <button 
                                 onClick={() => handleApprove(item.id)}
                                 className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all active:scale-95 uppercase shadow-md shadow-emerald-100"
                               >
                                  <Check size={12} /> Onayla
                               </button>
                               <button 
                                 onClick={() => setRejectingItem(item)}
                                 className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[10px] font-black hover:bg-rose-700 transition-all active:scale-95 uppercase shadow-md shadow-rose-100"
                               >
                                  <X size={12} /> Reddet
                               </button>
                            </>
                          ) : (
                             <div className="text-right">
                                {item.rejectionReason ? (
                                   <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100 max-w-[250px]">
                                      <MessageCircle size={14} className="shrink-0" />
                                      <span className="text-[10px] font-bold italic truncate">{item.rejectionReason}</span>
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                                      <CheckCircle2 size={14} />
                                      <span className="text-[10px] font-black uppercase">SİSTEME AKTARILABİLİR</span>
                                   </div>
                                )}
                             </div>
                          )}
                          <button className="p-2 text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={18} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REJECTION MODAL */}
      {rejectingItem && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                        <AlertTriangle size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Sipariş Red Gerekçesi</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{rejectingItem.orderCode} - Satır {rejectingItem.lineNo}</p>
                     </div>
                  </div>
                  <button onClick={() => setRejectingItem(null)} className="p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600 rounded-2xl transition-all">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <p className="text-xs font-bold text-slate-600 mb-1">Reddedilen Ürün:</p>
                     <p className="text-sm font-black text-slate-800 uppercase">{rejectingItem.stockName}</p>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Neden Reddediliyor? (Zorunlu)</label>
                     <textarea 
                        rows={4}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-300"
                        placeholder="Örn: Fiyat pazar ortalamasının üzerinde, Tedarik süresi çok uzun..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        autoFocus
                     />
                  </div>
               </div>

               <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button 
                     onClick={() => setRejectingItem(null)}
                     className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
                  >Vazgeç</button>
                  <button 
                     onClick={handleReject}
                     disabled={!rejectionReason.trim()}
                     className="px-10 py-3 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                  >
                     Reddi Onayla
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// Internal Components
const LegendItem: React.FC<{ color: string, label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-3 group cursor-default">
     <div className={`w-3 h-3 rounded-full ${color} group-hover:scale-150 transition-transform shadow-lg`} />
     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{label}</span>
  </div>
);

export default OrderApproval;
