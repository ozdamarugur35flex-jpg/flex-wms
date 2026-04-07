
import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Save, 
  Search, 
  XCircle, 
  Box, 
  Smartphone,
  Info,
  Globe,
  Loader2,
  ListChecks
} from 'lucide-react';
import { apiService } from '../api';

const ShipmentOrderEntry: React.FC = () => {
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderLines, setOrderLines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [header, setHeader] = useState({
    branch: 'Merkez',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const orders = await apiService.shipmentOrders.getOpenOrders();
        setOpenOrders(orders || []);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleOrderSelect = async (orderNo: string) => {
    const order = openOrders.find(o => o.orderNo === orderNo);
    setSelectedOrder(order || null);
    
    if (order) {
      setLoading(true);
      try {
        const lines = await apiService.shipmentOrders.getOrderLines(orderNo);
        // Initialize shipQty to 0 for each line
        setOrderLines((lines || []).map((l: any) => ({ ...l, shipQty: 0 })));
      } catch (err) {
        console.error("Sipariş kalemleri yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setOrderLines([]);
    }
  };

  const handleQtyChange = (id: number, value: string) => {
    const qty = parseFloat(value) || 0;
    setOrderLines(lines => lines.map(l => {
      if (l.id === id) {
        // Prevent shipping more than remaining
        const validQty = qty > l.remainingQty ? l.remainingQty : (qty < 0 ? 0 : qty);
        return { ...l, shipQty: validQty };
      }
      return l;
    }));
  };

  const handleSave = async () => {
    const itemsToShip = orderLines.filter(l => l.shipQty > 0);
    
    if (!selectedOrder || itemsToShip.length === 0) {
      alert("Lütfen sevk edilecek kalemler için miktar giriniz!");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        customerCode: selectedOrder.customerCode,
        orderNo: selectedOrder.orderNo,
        date: header.date,
        items: itemsToShip.map(i => ({
          id: i.id,
          stockCode: i.stockCode,
          shipQty: i.shipQty,
          warehouseCode: i.warehouseCode
        }))
      };

      const res = await apiService.shipmentOrders.save(payload);
      if (res.success) {
        alert(`Sevk emri başarıyla oluşturuldu. Emir No: ${res.sevkEmriNo || ''}`);
        // Refresh open orders and clear selection
        setSelectedOrder(null);
        setOrderLines([]);
        const orders = await apiService.shipmentOrders.getOpenOrders();
        setOpenOrders(orders || []);
      }
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && openOrders.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Sevk Emri Oluştur</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Müşteri Siparişinden Sevk</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedOrder || orderLines.filter(l => l.shipQty > 0).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Sevk Emri Oluştur
          </button>
        </div>
      </div>

      {/* HEADER INFO */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         <div className="xl:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Sipariş Seçimi</h3>
            <div className="space-y-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Açık Müşteri Siparişleri</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                    value={selectedOrder?.orderNo || ''}
                    onChange={(e) => handleOrderSelect(e.target.value)}
                  >
                     <option value="">Sipariş Seçiniz...</option>
                     {openOrders.map(o => (
                       <option key={o.orderNo} value={o.orderNo}>
                         {o.orderNo} - {o.customerName}
                       </option>
                     ))}
                  </select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şube</label>
                     <select 
                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                       value={header.branch}
                       onChange={(e) => setHeader({...header, branch: e.target.value})}
                     >
                        <option value="Merkez">Merkez</option>
                        <option value="Fabrika-1">Fabrika-1</option>
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İşlem Tarihi</label>
                     <input 
                       type="date" 
                       className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" 
                       value={header.date} 
                       onChange={(e) => setHeader({...header, date: e.target.value})}
                     />
                  </div>
               </div>
            </div>
         </div>

         <div className="xl:col-span-7 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl h-full">
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 backdrop-blur-md border border-white/10">
                     <Truck size={32} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Seçili Sipariş / Müşteri</p>
                     <h3 className="text-xl font-black tracking-tight">{selectedOrder?.customerName || 'SİPARİŞ SEÇİLMEDİ'}</h3>
                     <p className="text-xs font-medium text-slate-400 mt-1 max-w-[400px] leading-relaxed uppercase tracking-tighter">
                       SİPARİŞ NO: {selectedOrder?.orderNo || '-'}
                     </p>
                  </div>
               </div>
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Globe size={180} />
               </div>
            </div>
         </div>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Sipariş Kalemleri</h3>
               <div className="h-4 w-[1px] bg-slate-200" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Bekleyen Kalem Sayısı: {orderLines.length}</span>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Bilgisi</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Birim</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Sipariş Miktarı</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Bekleyen Bakiye</th>
                     <th className="px-8 py-5 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-center">Sevk Edilecek</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2 size={32} className="text-indigo-600 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : orderLines.map((item) => (
                     <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                                 <Box size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 tracking-tight uppercase leading-none mb-1">{item.stockName}</p>
                                 <p className="text-[10px] text-slate-400 font-mono font-bold">{item.stockCode}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center text-xs font-black text-slate-400 uppercase">{item.unit}</td>
                        <td className="px-8 py-5 text-right">
                           <span className="text-sm font-black text-slate-600">{item.orderedQty?.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <span className="text-sm font-black text-rose-600">{item.remainingQty?.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <input 
                             type="number"
                             min="0"
                             max={item.remainingQty}
                             className="w-32 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500 text-center mx-auto"
                             value={item.shipQty || ''}
                             onChange={(e) => handleQtyChange(item.id, e.target.value)}
                           />
                        </td>
                     </tr>
                  ))}
                  {!loading && orderLines.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <ListChecks size={48} />
                          <p className="text-xs font-black uppercase tracking-widest">Sipariş Seçilmedi veya Bekleyen Kalem Yok</p>
                        </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default ShipmentOrderEntry;
