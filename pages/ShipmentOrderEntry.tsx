
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Printer, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  User, 
  Box, 
  Layers, 
  Warehouse as WarehouseIcon, 
  Hash, 
  ArrowRightCircle, 
  CheckCircle2, 
  Smartphone,
  ShieldCheck,
  Globe,
  Info,
  Building,
  Loader2
} from 'lucide-react';
import { ShipmentOrderItem, StockCard, CustomerCard } from '../types';
import { apiService } from '../api';

const ShipmentOrderEntry: React.FC = () => {
  const [items, setItems] = useState<ShipmentOrderItem[]>([]);
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [header, setHeader] = useState({
    branch: 'Merkez',
    customer: '',
    orderNo: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [lineEntry, setLineEntry] = useState({
    stockCode: '',
    stockName: '',
    qty: 0,
    unit: 'ADET'
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [stockList, customerList] = await Promise.all([
          apiService.stocks.getAll(),
          apiService.customers.getAll()
        ]);
        setStocks(stockList);
        setCustomers(customerList);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleAddLine = () => {
    if(!lineEntry.stockCode || lineEntry.qty <= 0) return;
    
    const newItem: ShipmentOrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      orderNo: header.orderNo,
      stockCode: lineEntry.stockCode,
      stockName: lineEntry.stockName,
      customerName: header.customer,
      branchName: header.branch,
      orderedQty: lineEntry.qty,
      shippedQty: 0,
      unit: lineEntry.unit,
      status: 'Beklemede',
      terminalStatus: 'Bekliyor',
      date: header.date
    };

    setItems([...items, newItem]);
    setLineEntry({ stockCode: '', stockName: '', qty: 0, unit: 'ADET' });
  };

  const handleSave = async () => {
    if (!header.customer || items.length === 0) {
      alert("Müşteri seçilmeli ve en az bir kalem eklenmelidir!");
      return;
    }

    try {
      setIsSaving(true);
      const customer = customers.find(c => c.name === header.customer);
      const payload = {
        customerCode: customer?.code || '',
        orderNo: header.orderNo,
        date: header.date,
        items: items.map(i => ({
          stockCode: i.stockCode,
          quantity: i.orderedQty
        }))
      };

      const res = await apiService.shipmentOrders.save(payload);
      if (res.success) {
        alert("Sevk emri başarıyla kaydedildi.");
        setItems([]);
        setHeader({ ...header, orderNo: '', customer: '' });
      }
    } catch (err) {
      console.error("Kaydetme hatası:", err);
      alert("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTransferToTerminal = () => {
    if (items.length === 0) return;
    setItems(items.map(item => ({ ...item, terminalStatus: 'Aktarıldı' })));
    alert("Kalemler el terminaline aktarıldı.");
  };

  if (loading) {
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
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Sevk Emri Girişi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Yükleme Planlama Modülü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setItems([]);
              setHeader({
                branch: 'Merkez',
                customer: '',
                orderNo: '',
                date: new Date().toISOString().split('T')[0]
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <Plus size={16} className="text-indigo-600" /> Yeni Emir
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button 
            onClick={handleTransferToTerminal}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
             <Smartphone size={16} className="text-indigo-400" /> Terminale Aktar
          </button>
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* HEADER INFO */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         <div className="xl:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-4">Genel Bilgiler</h3>
            <div className="space-y-4">
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
                        <option value="Fabrika-2">Fabrika-2</option>
                        <option value="Lojistik Depo">Lojistik Depo</option>
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
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Müşteri (Cari Seçimi)</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                    value={header.customer}
                    onChange={(e) => setHeader({...header, customer: e.target.value})}
                  >
                     <option value="">Seçiniz...</option>
                     {customers.map(c => <option key={c.code} value={c.name}>{c.code} | {c.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sipariş No (Reference)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-indigo-600 outline-none focus:border-indigo-500" 
                    placeholder="SİP2024-00..."
                    value={header.orderNo}
                    onChange={(e) => setHeader({...header, orderNo: e.target.value})}
                  />
               </div>
            </div>
         </div>

         <div className="xl:col-span-7 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl">
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-indigo-400 backdrop-blur-md border border-white/10">
                     <Truck size={32} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Sevk Edilecek Müşteri</p>
                     <h3 className="text-xl font-black tracking-tight">{header.customer || 'MÜŞTERİ SEÇİLMEDİ'}</h3>
                     <p className="text-xs font-medium text-slate-400 mt-1 max-w-[400px] leading-relaxed uppercase tracking-tighter">ŞUBE: {header.branch}</p>
                  </div>
               </div>
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Globe size={180} />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
               <div className="flex items-center gap-3">
                  <Info size={18} className="text-indigo-500" />
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic">Sevk emirleri terminale aktarıldıktan sonra saha personeli tarafından kalem kalem okutularak gerçek sevk miktarları sisteme akacaktır.</p>
               </div>
            </div>
         </div>
      </div>

      {/* LINE ENTRY */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-10">
            <div className="lg:col-span-5 space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Box size={14} className="text-indigo-400" /> Stok Kartı Seçimi
               </label>
               <select 
                 className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 backdrop-blur-md transition-all appearance-none pr-12"
                 value={lineEntry.stockCode}
                 onChange={(e) => {
                    const s = stocks.find(x => x.code === e.target.value);
                    if(s) setLineEntry({...lineEntry, stockCode: s.code, stockName: s.name, unit: s.unit1 || 'ADET'});
                 }}
               >
                  <option value="" className="text-slate-900">Ürün Seçiniz...</option>
                  {stocks.map(s => <option key={s.code} value={s.code} className="text-slate-900">{s.code} | {s.name}</option>)}
               </select>
            </div>
            <div className="lg:col-span-3 space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sevk Edilecek Miktar</label>
               <input 
                  type="number" 
                  className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-indigo-500 text-center" 
                  placeholder="0"
                  value={lineEntry.qty || ''}
                  onChange={(e) => setLineEntry({...lineEntry, qty: parseFloat(e.target.value) || 0})}
               />
            </div>
            <div className="lg:col-span-4 space-y-2">
               <button 
                 onClick={handleAddLine}
                 disabled={!header.customer || !lineEntry.stockCode || lineEntry.qty <= 0}
                 className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
               >
                  <Plus size={18} /> KALEM EKLE
               </button>
            </div>
         </div>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Planlanan Sevk Kalemleri</h3>
               <div className="h-4 w-[1px] bg-slate-200" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Kalem Sayısı: {items.length}</span>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Bilgisi</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Birim</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Planlanan Miktar</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Terminal Durumu</th>
                     <th className="px-8 py-5 text-right w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
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
                           <span className="text-sm font-black text-indigo-600">{item.orderedQty.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${item.terminalStatus === 'Aktarıldı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'}`}>
                              <Smartphone size={12} /> {item.terminalStatus}
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                        </td>
                     </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Truck size={48} />
                          <p className="text-xs font-black uppercase tracking-widest">Henüz Kalem Eklenmedi</p>
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
