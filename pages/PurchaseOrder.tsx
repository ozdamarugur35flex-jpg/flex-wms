
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Edit,
  Loader2,
  ExternalLink,
  TrendingDown
} from 'lucide-react';
import { PurchaseOrderItem, DeliveryHistory } from '../types';
import { apiService } from '../api';

const PurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderItem | null>(null);
  const [stockDetail, setStockDetail] = useState<any>(null);
  const [receiveQty, setReceiveQty] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const orderList = await apiService.purchaseOrders.getEntries();
      setOrders(orderList);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.branchName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const handleRowClick = async (order: PurchaseOrderItem) => {
    setSelectedOrder(order);
    setReceiveQty(0);
    setStockDetail(null);
    
    try {
      const detail = await apiService.stocks.getDetail(order.stockCode);
      if (detail) setStockDetail(detail);
    } catch (e) {
      console.error('Stock detail error:', e);
    }
  };

  const handleReceive = async () => {
    if(!selectedOrder || receiveQty <= 0) return;
    
    setIsSaving(true);
    try {
      const payload = {
        orderNo: selectedOrder.id,
        receivedQuantity: receiveQty,
        date: new Date().toISOString().split('T')[0],
        receivedBy: 'Mustafa Aksoy'
      };

      const result = await apiService.purchaseOrders.save(payload);
      if (result.success) {
        if (result.irsNo) {
          alert(`Alış İrsaliyesi başarıyla oluşturuldu: ${result.irsNo}`);
        }
        await fetchData();
        setSelectedOrder(null);
        setReceiveQty(0);
      }
    } catch (error) {
      console.error('Receive error:', error);
    } finally {
      setIsSaving(false);
    }
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Kayıt bulunamadı.</td>
                </tr>
              ) : filteredOrders.map((o) => (
                <tr key={o.id} onDoubleClick={() => handleRowClick(o)} className="hover:bg-emerald-50/20 transition-all group cursor-pointer">
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
                         onClick={() => handleRowClick(o)}
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

      <AnimatePresence>
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <ArrowDownCircle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Alış İrsaliyesi Girişi</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     SİPARİŞ ID: {selectedOrder.id} <span className="w-1 h-1 rounded-full bg-slate-200" /> {selectedOrder.supplierName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="px-8 py-4 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto custom-scrollbar max-h-[60vh]">
              {/* Left Side: Order Info */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sipariş Bilgisi</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 leading-none">{selectedOrder.stockName}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100 uppercase">{selectedOrder.stockCode}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><Building size={12} /> {selectedOrder.branchName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden group">
                   <div className="relative z-10 space-y-4">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pazar Karar Desteği</p>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Son Alınan Fiyat</p>
                        <div className="flex items-end gap-2">
                          <span className="text-3xl font-black text-white">${stockDetail?.lastPurchasePrice || selectedOrder.lastPurchasePrice || '0.00'}</span>
                          <span className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-0.5"><TrendingDown size={12} /> %1.2 DÜŞÜŞ</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400 border-t border-white/10 pt-4">
                         <Truck size={14} className="text-indigo-400" />
                         {selectedOrder.supplierName}
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                      <Loader2 size={120} />
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between px-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> Teslimat Geçmişi
                      </p>
                   </div>
                   <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden max-h-40 overflow-y-auto">
                      <table className="w-full text-left text-[10px]">
                         <thead>
                            <tr className="bg-slate-100/50 border-b border-slate-200">
                               <th className="px-5 py-3 font-black text-slate-400 uppercase">Tarih</th>
                               <th className="px-5 py-3 font-black text-slate-400 uppercase text-center">Miktar</th>
                               <th className="px-5 py-3 font-black text-slate-400 uppercase text-right">Kayıt</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {selectedOrder.deliveries.length > 0 ? selectedOrder.deliveries.map((d, i) => (
                               <tr key={i} className="hover:bg-white transition-colors">
                                  <td className="px-5 py-3 font-bold text-slate-600">{d.date}</td>
                                  <td className="px-5 py-3 font-black text-emerald-600 text-center">{d.quantity}</td>
                                  <td className="px-5 py-3 text-slate-400 text-right">{d.receivedBy}</td>
                               </tr>
                            )) : (
                               <tr>
                                  <td colSpan={3} className="px-5 py-8 text-center text-slate-400 italic">Henüz bir teslimat kaydı bulunmamaktadır.</td>
                               </tr>
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
              </div>

              {/* Right Side: Quantity Input */}
              <div className="flex flex-col gap-6">
                <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 text-center">Beklenen Miktar</p>
                  <div className="flex items-end gap-2 leading-none">
                     <span className="text-[72px] font-black text-emerald-600 tracking-tighter">{selectedOrder.balance.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">{selectedOrder.unit} KALAN</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gelen (Fiili) Miktar</label>
                  <input 
                    type="number"
                    autoFocus
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl text-3xl font-black text-slate-800 outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center"
                    value={receiveQty || ''}
                    onChange={(e) => setReceiveQty(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => {
                    if (!selectedOrder) return;
                    const lineNo = selectedOrder.id.split('-').pop();
                    navigate('/alis-irsaliye', { 
                      state: { 
                        orderNo: selectedOrder.id.split('-')[0],
                        orderLineNo: lineNo,
                        stockCode: selectedOrder.stockCode,
                        customerCode: selectedOrder.customerCode,
                        customerName: selectedOrder.supplierName,
                        qty: receiveQty > 0 ? receiveQty : selectedOrder.balance
                      } 
                    });
                }}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-[11px] uppercase tracking-widest transition-colors group"
              >
                <ExternalLink size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                DETAYLI İRSALİYE EKRANINA GİT
              </button>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  İPTAL
                </button>
                <button 
                  onClick={handleReceive}
                  disabled={isSaving || receiveQty <= 0}
                  className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  GİRİŞİ ONAYLA
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default PurchaseOrder;
