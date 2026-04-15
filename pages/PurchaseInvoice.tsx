
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileDown, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  User, 
  MapPin, 
  Box, 
  Layers, 
  Truck, 
  Calculator, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ShieldCheck, 
  Settings2,
  RefreshCcw,
  Globe,
  Lock,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { InvoiceItem, StockCard, CustomerCard } from '../types';
import { apiService } from '../api';
import SearchableSelect from '../components/SearchableSelect';

const PurchaseInvoice: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<'header' | 'lines' | 'history'>('header');
  const [isExtraFieldsOpen, setExtraFieldsOpen] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Header State
  const [invoiceHeader, setInvoiceHeader] = useState({
    invoiceNo: '',
    date: today,
    deliveryDate: today,
    customerCode: '',
    customerName: '',
    type: 'YURT İÇİ' as const,
    description: ''
  });

  // Line Entry State
  const [lineEntry, setLineEntry] = useState({
    stockCode: '',
    warehouse: '01',
    qty: 0,
    price: 0,
    vat: 20
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [stockList, customerList] = await Promise.all([
          apiService.stocks.getAll(),
          apiService.customers.getAll()
        ]);
        setStocks(stockList);
        setCustomers(customerList);
      } catch (error) {
        console.error('Data fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await apiService.purchaseInvoices.getAll();
      setHistory(data || []);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleViewDetail = async (invoiceNo: string) => {
    setIsLoading(true);
    try {
      const detail = await apiService.purchaseInvoices.getDetail(invoiceNo);
      if (detail) {
        setInvoiceHeader({
          invoiceNo: detail.invoiceNo,
          date: detail.date?.split('T')[0],
          deliveryDate: detail.deliveryDate?.split('T')[0],
          customerCode: detail.customerCode,
          customerName: detail.customerName,
          type: detail.type || 'YURT İÇİ',
          description: detail.description || ''
        });
        setItems(detail.items || []);
        setIsEditMode(true);
        setActiveTab('header');
      }
    } catch (error) {
      console.error('Detail fetch error:', error);
      alert('Detaylar alınırken hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if editing is allowed (Only on the same day)
  const canEdit = invoiceHeader.date === today || isEditMode;

  const handleDateChange = (val: string) => {
    setInvoiceHeader(prev => ({
      ...prev,
      date: val,
      deliveryDate: val // Rule: Delivery date follows Invoice date
    }));
  };

  const handleStockChange = (code: string) => {
    const stock = stocks.find(s => s.code === code);
    setLineEntry(prev => ({
      ...prev,
      stockCode: code,
      vat: stock ? stock.purchaseVat : 20 // Rule: VAT comes from stock card
    }));
  };

  const handleCustomerChange = (code: string) => {
    const customer = customers.find(c => c.code === code);
    if (customer) {
      setInvoiceHeader(prev => ({
        ...prev,
        customerCode: code,
        customerName: customer.name
      }));
    }
  };

  const handleAddLine = () => {
    if (!lineEntry.stockCode || lineEntry.qty <= 0) return;
    
    const stock = stocks.find(s => s.code === lineEntry.stockCode);
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      stockCode: lineEntry.stockCode,
      stockName: stock?.name || '',
      loadingDate: invoiceHeader.date,
      deliveryDate: invoiceHeader.deliveryDate,
      conversion: 1,
      quantity: lineEntry.qty,
      currencyType: 'TRY',
      currencyPrice: lineEntry.price,
      exchangeRate: 1,
      warehouseCode: lineEntry.warehouse,
      price: lineEntry.price,
      vat: lineEntry.vat,
      total: lineEntry.qty * lineEntry.price * (1 + lineEntry.vat / 100)
    };

    setItems(prev => [...prev, newItem]);
    setLineEntry({
      stockCode: '',
      warehouse: '01',
      qty: 0,
      price: 0,
      vat: 20
    });
  };

  const handleNew = () => {
    setInvoiceHeader({
      invoiceNo: '',
      date: today,
      deliveryDate: today,
      customerCode: '',
      customerName: '',
      type: 'YURT İÇİ',
      description: ''
    });
    setItems([]);
    setIsEditMode(false);
    setActiveTab('header');
  };

  const handleGetNextNo = async () => {
    try {
      const result = await apiService.purchaseInvoices.generateNextNo();
      if (result && result.nextNo) {
        setInvoiceHeader(prev => ({ ...prev, invoiceNo: result.nextNo }));
      }
    } catch (error) {
      console.error('Next no error:', error);
    }
  };

  const handleSave = async () => {
    if (!invoiceHeader.invoiceNo || !invoiceHeader.customerCode || items.length === 0) {
      alert('Lütfen fatura numarası, tedarikçi ve en az bir kalem giriniz.');
      return;
    }

    setIsSaving(true);
    try {
      // If in edit mode, we might want to handle it specifically if the backend requires
      const payload = {
        ...invoiceHeader,
        items: items
      };
      const result = await apiService.purchaseInvoices.save(payload);
      if (result.success) {
        alert('Alış irsaliyesi başarıyla kaydedildi.');
        handleNew();
        if (activeTab === 'history') fetchHistory();
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const totals = useMemo(() => {
    const subTotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const vatTotal = items.reduce((acc, curr) => acc + ((curr.price * curr.quantity) * curr.vat / 100), 0);
    return { subTotal, vatTotal, grandTotal: subTotal + vatTotal };
  }, [items]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
            <FileDown size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Alış İrsaliyesi Girişi</h1>
            <div className="flex items-center gap-2">
               {!canEdit ? (
                 <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                   <Lock size={10} /> Sadece Görüntüleme (Tarih Farklı)
                 </span>
               ) : (
                 <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                   <CheckCircle2 size={10} /> Düzenleme Aktif
                 </span>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button 
                onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
              >
                <Plus size={16} className="text-emerald-600" /> Yeni
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving || !canEdit}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                Kaydet
              </button>
            </>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
             <RefreshCcw size={16} className="text-sky-600" /> Taşı
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('header')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'header' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Info size={16} /> İŞLEM BAŞLIĞI
        </button>
        <button 
          onClick={() => setActiveTab('lines')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'lines' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Layers size={16} /> DETAY SATIRLARI
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileSpreadsheet size={16} /> GEÇMİŞ İRSALİYELER
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'history' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Geçmiş Alış İrsaliyeleri</h3>
            <button 
              onClick={fetchHistory}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <RefreshCcw size={18} className={isHistoryLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">İrsaliye No</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tedarikçi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Toplam Tutar</th>
                  <th className="px-6 py-4 text-right w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isHistoryLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin text-emerald-600 mx-auto" size={24} />
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Kayıt bulunamadı.</td>
                  </tr>
                ) : (
                  history.map((inv) => (
                    <tr key={inv.invoiceNo} className="hover:bg-emerald-50/20 transition-all group">
                      <td className="px-6 py-4 font-mono font-black text-emerald-600 text-sm">{inv.invoiceNo}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(inv.date).toLocaleDateString('tr-TR')}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800 leading-none mb-1 uppercase">{inv.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.customerCode}</p>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">₺{inv.totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewDetail(inv.invoiceNo)}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'header' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in slide-in-from-left-4 duration-500">
          <div className="xl:col-span-5 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <div className="border-b border-slate-100 pb-4">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evrak Bilgileri</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                         <span>Fiş / Fatura Numarası (16 Hane Sabit)</span>
                         <span className={`${invoiceHeader.invoiceNo.length === 16 ? 'text-emerald-500' : 'text-rose-500'}`}>{invoiceHeader.invoiceNo.length}/16</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          maxLength={16}
                          className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-mono" 
                          placeholder="Örn: 2024000000000001"
                          value={invoiceHeader.invoiceNo}
                          disabled={!canEdit}
                          onChange={(e) => setInvoiceHeader({...invoiceHeader, invoiceNo: e.target.value})}
                        />
                        <button 
                          onClick={handleGetNextNo}
                          title="Sıradaki Numarayı Al"
                          className="px-4 bg-slate-100 text-slate-600 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-200"
                        >
                          <RefreshCcw size={18} />
                        </button>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İrsaliye Tarihi</label>
                      <input 
                        type="date" 
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500" 
                        value={invoiceHeader.date}
                        disabled={!canEdit}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fatura Teslim Tarihi</label>
                      <input 
                        type="date" 
                        className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black text-slate-500 outline-none cursor-not-allowed" 
                        value={invoiceHeader.deliveryDate}
                        readOnly
                      />
                   </div>

                   <div className="md:col-span-2">
                      <SearchableSelect 
                        label="Tedarikçi Seçimi"
                        placeholder="Tedarikçi Seçiniz..."
                        value={invoiceHeader.customerCode}
                        disabled={!canEdit}
                        onChange={handleCustomerChange}
                        options={customers.map(c => ({
                          value: c.code,
                          label: c.name
                        }))}
                      />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operasyonel Notlar</label>
                   <textarea 
                    rows={2} 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all" 
                    placeholder="Evrak ile ilgili açıklama giriniz..." 
                    value={invoiceHeader.description}
                    disabled={!canEdit}
                    onChange={(e) => setInvoiceHeader({...invoiceHeader, description: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="xl:col-span-7 space-y-6">
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl">
                <div className="flex items-center gap-6 relative z-10">
                   <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-emerald-400 backdrop-blur-md border border-white/10">
                      <Truck size={32} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Seçili Tedarikçi Bilgisi</p>
                      <h3 className="text-xl font-black tracking-tight">{invoiceHeader.customerName}</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1 max-w-[400px] leading-relaxed flex items-start gap-1.5"><MapPin size={14} className="shrink-0 mt-0.5" /> İkitelli OSB, Metal İş San. Sit. 12. Blok No: 45 Başakşehir/İstanbul</p>
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <Globe size={180} />
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all">
                <button 
                   onClick={() => setExtraFieldsOpen(!isExtraFieldsOpen)}
                   className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                         <Settings2 size={20} />
                      </div>
                      <div className="text-left">
                         <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Ek Sahalar</h3>
                         <p className="text-[10px] text-slate-400 font-bold">Özel veri alanları</p>
                      </div>
                   </div>
                   {isExtraFieldsOpen ? <ChevronUp size={24} className="text-slate-300" /> : <ChevronDown size={24} className="text-slate-300" />}
                </button>
                
                {isExtraFieldsOpen && (
                   <div className="p-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50/50 animate-in slide-in-from-top-4 duration-500">
                      {[1,2,3,4,5,6].map(i => (
                         <div key={i} className="space-y-1 group">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 group-hover:text-emerald-600 transition-colors">Saha {i}</label>
                            <input type="text" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" placeholder="..." disabled={!canEdit} />
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           {/* QUICK LINE ENTRY */}
           <div className={`bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative ${!canEdit ? 'opacity-50 grayscale' : ''}`}>
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                 <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
                    <Layers size={140} />
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-10">
                 <div className="lg:col-span-6">
                    <SearchableSelect 
                      label="Stok Kartı Seçimi"
                      placeholder="Stok Seçiniz..."
                      value={lineEntry.stockCode}
                      disabled={!canEdit}
                      onChange={handleStockChange}
                      options={stocks.map(s => ({
                        value: s.code,
                        label: s.name
                      }))}
                    />
                 </div>

                 <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Depo</label>
                    <select disabled={!canEdit} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-emerald-500 appearance-none">
                       <option className="text-slate-900">01 - MERKEZ</option>
                    </select>
                 </div>

                 <div className="lg:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Miktar</label>
                    <input 
                      type="number" 
                      disabled={!canEdit}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-emerald-500 text-center" 
                      placeholder="0.00" 
                      value={lineEntry.qty || ''}
                      onChange={(e) => setLineEntry({...lineEntry, qty: parseFloat(e.target.value) || 0})}
                    />
                 </div>

                 <div className="lg:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyat</label>
                    <input 
                      type="number" 
                      disabled={!canEdit}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-emerald-500 text-center" 
                      placeholder="0" 
                      value={lineEntry.price || ''}
                      onChange={(e) => setLineEntry({...lineEntry, price: parseFloat(e.target.value) || 0})}
                    />
                 </div>

                 <div className="lg:col-span-2 space-y-2">
                    <button 
                      onClick={handleAddLine}
                      disabled={!canEdit || !lineEntry.stockCode || lineEntry.qty <= 0}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                       <Plus size={18} /> EKLE
                    </button>
                 </div>
              </div>

              {/* Automatic Info from Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 relative z-10">
                 <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STOK KDV ORANI</span>
                    <span className="text-lg font-black text-emerald-400">%{lineEntry.vat}</span>
                 </div>
                 <div className="md:col-span-2 flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                    <ShieldCheck size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Döviz ve Kur bilgisi bu modülde devre dışıdır (Sadece TL)</span>
                 </div>
              </div>
           </div>

           {/* LINE ITEMS TABLE */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-200">
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ürün Bilgisi</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Depo</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Birim Fiyat</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">KDV Tutarı</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Net Toplam (TL)</th>
                          <th className="px-6 py-5 text-right w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {isLoading ? (
                         <tr>
                           <td colSpan={8} className="px-6 py-12 text-center">
                             <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                           </td>
                         </tr>
                       ) : items.length === 0 ? (
                         <tr>
                           <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">Henüz kalem eklenmedi.</td>
                         </tr>
                       ) : items.map(item => (
                          <tr key={item.id} className="hover:bg-emerald-50/20 transition-all group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                      <Box size={20} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{item.stockName}</p>
                                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">{item.stockCode}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">{item.warehouseCode}</td>
                             <td className="px-6 py-4 text-center">
                                <span className="text-sm font-black text-slate-700">{item.quantity.toLocaleString()}</span>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className="text-sm font-black text-slate-600">₺{item.price.toFixed(2)}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <p className="text-xs font-bold text-slate-400">₺{((item.price * item.quantity) * item.vat / 100).toLocaleString()}</p>
                                <p className="text-[9px] text-emerald-600 font-black">%{item.vat}</p>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <p className="text-sm font-black text-emerald-600">₺{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                             </td>
                             <td className="px-6 py-4 text-right">
                                {canEdit && <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* FOOTER TOTALS */}
              <div className="bg-slate-50/80 p-10 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-8">
                 <div className="md:col-span-8 flex items-center gap-12">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">İşlem Özeti</p>
                       <div className="flex items-center gap-4">
                          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Toplam Kalem</p>
                             <p className="text-lg font-black text-slate-800">{items.length}</p>
                          </div>
                          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Toplam Miktar</p>
                             <p className="text-lg font-black text-slate-800">{items.reduce((a,b)=>a+b.quantity, 0).toLocaleString()}</p>
                          </div>
                       </div>
                    </div>
                    <div className="h-12 w-[1px] bg-slate-200" />
                    <div className="max-w-xs">
                       <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Güvenli İşlem Kilidi</p>
                       </div>
                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Sistem kuralları gereği, kayıt tarihi üzerinden 24 saat geçen belgeler üzerinde değişiklik yapılamaz.</p>
                    </div>
                 </div>
                 
                 <div className="md:col-span-4 space-y-4">
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                       <span>Ara Toplam</span>
                       <span>₺{totals.subTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px] pb-4 border-b border-slate-200">
                       <span>KDV Toplamı</span>
                       <span>₺{totals.vatTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                       <span className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Genel Toplam</span>
                       <span className="text-3xl font-black text-emerald-600 tracking-tighter">₺{totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODÜL BİLGİSİ */}
      <div className="px-8 py-4 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-slate-200">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck size={16} className="text-emerald-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sistem Güvenlik: AKTİF</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-2">
               <Globe size={16} className="text-sky-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Döviz İşlemleri: PASİF</span>
            </div>
         </div>
         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">FLEX WMS ERP v2.4 <span className="mx-2">•</span> Modül: frmAlisIrsaliyesi</p>
      </div>
    </div>
  );
};

// Sub-components
const InputField: React.FC<{ label: string, icon?: React.ReactNode, placeholder?: string, type?: string, important?: boolean, disabled?: boolean }> = ({ label, icon, placeholder, type = 'text', important, disabled }) => (
  <div className="space-y-1.5 flex-1 group">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${important ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-emerald-500 transition-colors'}`}>
       {icon} {label} {important && '*'}
    </label>
    <input 
      type={type} 
      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

export default PurchaseInvoice;

