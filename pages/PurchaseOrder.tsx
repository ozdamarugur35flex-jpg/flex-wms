
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Truck, 
  Package, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  ArrowDownCircle, 
  Info, 
  DollarSign, 
  User, 
  Save, 
  CheckCircle2, 
  BadgeAlert,
  Hash,
  Database,
  Building,
  Edit
} from 'lucide-react';
import { PurchaseOrderItem, DeliveryHistory } from '../types';

const mockOrders: PurchaseOrderItem[] = [
  { 
    id: 'PO-001', 
    requisitionId: 'R1', 
    stockCode: 'STK001', 
    stockName: 'Alüminyum Profil 20x20', 
    branchName: 'Fabrika-1',
    supplierName: 'Aksoy Metal', 
    orderedQty: 1000, 
    receivedQty: 400, 
    balance: 600, 
    lastPurchasePrice: 42.80, 
    lastSupplier: 'Yılmaz Profil Co.', 
    unit: 'ADET', 
    status: 'Kısmi Teslim',
    isRevised: true,
    deliveries: [
      { date: '2024-03-21', quantity: 400, receivedBy: 'Mustafa A.' }
    ]
  },
  { 
    id: 'PO-002', 
    requisitionId: 'R2', 
    stockCode: 'STK002', 
    stockName: 'Çelik Somun M8', 
    branchName: 'Merkez',
    supplierName: 'Civata Dünyası', 
    orderedQty: 5000, 
    receivedQty: 0, 
    balance: 5000, 
    lastPurchasePrice: 1.15, 
    lastSupplier: 'Civata Dünyası', 
    unit: 'ADET', 
    status: 'Açık',
    isRevised: false,
    deliveries: []
  }
];

const PurchaseOrder: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderItem | null>(null);
  const [receiveQty, setReceiveQty] = useState(0);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.branchName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const handleReceive = () => {
    if(!selectedOrder || receiveQty <= 0) return;
    
    const newHistory: DeliveryHistory = {
      date: new Date().toISOString().split('T')[0],
      quantity: receiveQty,
      receivedBy: 'Mustafa Aksoy'
    };

    const updatedOrders = orders.map(o => {
      if(o.id === selectedOrder.id) {
        const newReceived = o.receivedQty + receiveQty;
        const newBalance = o.orderedQty - newReceived;
        return {
          ...o,
          receivedQty: newReceived,
          balance: newBalance,
          status: newBalance <= 0 ? 'Tamamlandı' : 'Kısmi Teslim',
          deliveries: [...o.deliveries, newHistory]
        } as PurchaseOrderItem;
      }
      return o;
    });

    setOrders(updatedOrders);
    setSelectedOrder(null);
    setReceiveQty(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Satınalma Siparişleri</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Sipariş Kabul & Mal Giriş Modülü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} /> Listele
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Şube, ürün adı, kod veya tedarikçi ara..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Şube / Ürün / Tedarikçi</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Referans Bilgi</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar Durumu</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Bakiye</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-emerald-50/20 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-emerald-600 transition-colors">
                        <Truck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-black text-slate-800 tracking-tight">{o.supplierName}</p>
                           {o.isRevised && (
                             <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black rounded uppercase flex items-center gap-1 border border-amber-200">
                               <Edit size={8} /> REVİZE EDİLDİ
                             </span>
                           )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                           <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                             <Building size={10} /> {o.branchName}
                           </p>
                           <span className="text-slate-200">•</span>
                           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{o.stockName}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1">En Son Alınan</span>
                        <p className="text-xs font-bold text-slate-600">${o.lastPurchasePrice.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400 italic">via {o.lastSupplier}</p>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                       <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Sipariş</p>
                          <p className="text-xs font-black text-slate-700">{o.orderedQty}</p>
                       </div>
                       <div className="w-[1px] h-6 bg-slate-200" />
                       <div className="text-center">
                          <p className="text-[9px] font-black text-slate-400 uppercase text-emerald-600">Gelen</p>
                          <p className="text-xs font-black text-emerald-600">{o.receivedQty}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-black ${o.balance > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{o.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      o.status === 'Açık' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                      o.status === 'Kısmi Teslim' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setSelectedOrder(o)}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all active:scale-95 border border-emerald-100 uppercase"
                       >
                          <ArrowDownCircle size={14} /> GİRİŞ YAP
                       </button>
                       <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                  <ArrowDownCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Malzeme Kabul Girişi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sipariş ID: {selectedOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-rose-500 p-2.5 hover:bg-rose-50 rounded-2xl transition-all">
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sipariş Bilgisi</h4>
                           {selectedOrder.isRevised && <span className="text-[8px] font-black text-amber-600 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">REVİZE EDİLDİ</span>}
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-emerald-600"><Package size={16}/></div>
                           <p className="text-sm font-black text-slate-800">{selectedOrder.stockName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black font-mono">{selectedOrder.stockCode}</span>
                           <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                              <Building size={10} /> {selectedOrder.branchName}
                           </span>
                        </div>
                     </div>

                     <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pazar Karar Desteği</p>
                        <div className="space-y-1">
                           <p className="text-[9px] font-bold text-slate-400 uppercase">Son Alınan Fiyat</p>
                           <h5 className="text-2xl font-black text-indigo-400">${selectedOrder.lastPurchasePrice.toFixed(2)}</h5>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 italic">
                           <Truck size={12} /> {selectedOrder.lastSupplier}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 text-center space-y-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Beklenen Miktar</p>
                        <h4 className="text-4xl font-black text-emerald-700 tracking-tighter">{selectedOrder.balance.toLocaleString()}</h4>
                        <span className="text-[10px] font-black text-emerald-500 uppercase">ADET KALAN</span>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gelen (Fiili) Miktar</label>
                        <input 
                           type="number" 
                           className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-2xl font-black text-center text-emerald-600 outline-none focus:border-emerald-500 transition-all"
                           placeholder="0.00"
                           value={receiveQty}
                           onChange={(e) => setReceiveQty(parseFloat(e.target.value) || 0)}
                        />
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <History size={14} /> Teslimat Geçmişi
                  </h4>
                  <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden">
                     <table className="w-full text-left text-xs">
                        <thead>
                           <tr className="bg-slate-100/50 border-b border-slate-200">
                              <th className="px-6 py-3 font-black text-slate-400 uppercase">Tarih</th>
                              <th className="px-6 py-3 font-black text-slate-400 uppercase text-center">Gelen</th>
                              <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Teslim Alan</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {selectedOrder.deliveries.length > 0 ? selectedOrder.deliveries.map((d, i) => (
                              <tr key={i}>
                                 <td className="px-6 py-3 font-bold text-slate-600">{d.date}</td>
                                 <td className="px-6 py-3 font-black text-emerald-600 text-center">{d.quantity}</td>
                                 <td className="px-6 py-3 text-slate-500 text-right">{d.receivedBy}</td>
                              </tr>
                           )) : (
                              <tr>
                                 <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Henüz bir teslimat kaydı bulunmamaktadır.</td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
               <button onClick={() => setSelectedOrder(null)} className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">İptal</button>
               <button 
                  onClick={handleReceive}
                  className="px-10 py-4 bg-emerald-600 text-white text-xs font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center gap-3 uppercase tracking-[0.1em]"
               >
                  <Save size={18} /> Girişi Onayla
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
