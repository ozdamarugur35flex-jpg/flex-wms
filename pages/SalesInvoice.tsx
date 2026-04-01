
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileUp, 
  Plus, 
  Save, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  User, 
  MapPin, 
  Box, 
  Layers, 
  Truck, 
  Info, 
  Calculator, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  Eye, 
  Settings,
  ArrowRight,
  TrendingUp,
  Lock,
  Globe,
  AlertTriangle,
  Hash,
  Briefcase,
  Tag,
  Clock,
  Loader2
} from 'lucide-react';
import { SalesInvoice, InvoiceItem, StockCard, CustomerCard } from '../types';
import { apiService } from '../api';

const SalesInvoicePage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [activeTab, setActiveTab] = useState<'header' | 'lines' | 'history'>('header');
  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [eWaybillDetails, setEWaybillDetails] = useState<any>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  
  // Search States
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers;
    const lowerSearch = customerSearch.toLowerCase();
    return customers.filter(c => 
      c.code.toLowerCase().includes(lowerSearch) || 
      c.name.toLowerCase().includes(lowerSearch)
    );
  }, [customers, customerSearch]);

  const filteredStocks = useMemo(() => {
    if (!stockSearch) return stocks;
    const lowerSearch = stockSearch.toLowerCase();
    return stocks.filter(s => 
      s.code.toLowerCase().includes(lowerSearch) || 
      s.name.toLowerCase().includes(lowerSearch)
    );
  }, [stocks, stockSearch]);
  
  // Header State
  const [invoiceHeader, setInvoiceHeader] = useState<Partial<SalesInvoice>>({
    invoiceNo: '',
    date: today,
    deliveryDate: today,
    customerCode: '',
    customerName: '',
    projectCode: '',
    taxOffice: '',
    taxNumber: '',
    address: '',
    description: '',
    specialCode1: ''
  });

  // Line Entry State
  const [lineEntry, setLineEntry] = useState({
    stockCode: '',
    warehouse: '01',
    qty: 0,
    price: 0,
    vat: null as number | null
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [stockList, customerList, nextNoData] = await Promise.all([
          apiService.stocks.getAll(),
          apiService.customers.getAll(),
          apiService.salesInvoices.generateNextNo()
        ]);
        setStocks(stockList);
        setCustomers(customerList);
        
        // Auto-fill next invoice number on mount
        if (nextNoData && nextNoData.nextNo) {
          setInvoiceHeader(prev => ({ ...prev, invoiceNo: nextNoData.nextNo }));
        }
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
      const data = await apiService.salesInvoices.getAll();
      setHistory(data || []);
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleViewDetail = async (invoiceNo: string) => {
    setIsLoading(true);
    setIsFetchingDetail(true);
    setItems([]); // Clear current items before fetching new ones
    try {
      const detail = await apiService.salesInvoices.getDetail(invoiceNo);
      if (detail) {
        setInvoiceHeader({
          invoiceNo: detail.invoiceNo,
          date: detail.date?.split('T')[0],
          deliveryDate: detail.deliveryDate?.split('T')[0],
          customerCode: detail.customerCode,
          customerName: detail.customerName,
          projectCode: detail.projectCode,
          taxOffice: detail.taxOffice,
          taxNumber: detail.taxNumber,
          address: detail.address,
          description: detail.description,
          specialCode1: detail.specialCode1 || getSpecialCodeFromProject(detail.projectCode || '')
        });
        setItems(detail.items || []);
        setIsEditMode(true);
        setActiveTab('header');
      } else {
        alert('İrsaliye bulunamadı.');
      }
    } catch (error) {
      console.error('Detail fetch error:', error);
      alert('Detaylar alınırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setIsFetchingDetail(false);
    }
  };

  const getSpecialCodeFromProject = (projectCode: string): string => {
    if (!projectCode) return '';
    if (projectCode.startsWith('3')) return 'F';
    if (projectCode.startsWith('2')) return 'S';
    if (projectCode.startsWith('1')) return 'M';
    return '';
  };

  const handleCustomerChange = (code: string) => {
    const customer = customers.find(c => c.code === code);
    if (customer) {
      const pCode = customer.projectCode || '';
      const sCode = getSpecialCodeFromProject(pCode) || customer.specialCode1 || '';
      
      setInvoiceHeader(prev => ({
        ...prev,
        customerCode: code,
        customerName: customer.name,
        taxOffice: customer.taxOffice || '',
        taxNumber: customer.taxNumber || '',
        address: `${customer.name} - ${customer.phone || ''}`,
        projectCode: pCode,
        specialCode1: sCode
      }));
    }
  };

  const handleStockChange = (code: string) => {
    const stock = stocks.find(s => s.code === code);
    setLineEntry(prev => ({
      ...prev,
      stockCode: code,
      vat: stock ? stock.salesVat : null,
      price: stock ? (stock.salesPrices?.[0] || 0) : 0
    }));
  };

  const handleAddLine = () => {
    if (!lineEntry.stockCode || lineEntry.qty <= 0) return;

    if (lineEntry.vat === null) {
      alert('KDV oranı tanımlanmamış. Lütfen stok kartını kontrol edin.');
      return;
    }
    
    const stock = stocks.find(s => s.code === lineEntry.stockCode);
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      stockCode: lineEntry.stockCode,
      stockName: stock?.name || '',
      loadingDate: invoiceHeader.date!,
      deliveryDate: invoiceHeader.deliveryDate!,
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
      vat: null
    });
  };

  const handleSave = async () => {
    if (!invoiceHeader.invoiceNo || !invoiceHeader.customerCode || items.length === 0) {
      alert('Lütfen zorunlu alanları doldurunuz ve en az bir kalem ekleyiniz.');
      return;
    }

    setIsSaving(true);
    try {
      // Eğer düzenleme modundaysak önce eski kaydı siliyoruz (Netsis entegrasyonu için güvenli yöntem)
      if (isEditMode) {
        const deleteRes = await apiService.salesInvoices.delete(invoiceHeader.invoiceNo!);
        if (!deleteRes.success) {
          throw new Error('Eski kayıt silinemediği için güncelleme yapılamıyor.');
        }
      }

      const dataToSave = {
        ...invoiceHeader,
        items: items.map(item => ({
          ...item,
          invoiceNo: invoiceHeader.invoiceNo,
          customerCode: invoiceHeader.customerCode
        })),
        totalAmount: totals.grandTotal
      };
      const result = await apiService.salesInvoices.save(dataToSave);
      if (result.success) {
        alert(isEditMode ? 'İrsaliye başarıyla güncellendi.' : 'İrsaliye başarıyla Netsis taslaklarına kaydedildi.');
        setIsEditMode(false);
        // Reset form after save
        setInvoiceHeader({
          invoiceNo: '',
          date: today,
          deliveryDate: today,
          customerCode: '',
          customerName: '',
          projectCode: '',
          taxOffice: '',
          taxNumber: '',
          address: '',
          description: '',
          specialCode1: ''
        });
        setItems([]);
        // Refresh next number for the next entry
        const nextNo = await apiService.salesInvoices.generateNextNo();
        if (nextNo && nextNo.nextNo) {
          setInvoiceHeader(prev => ({ ...prev, invoiceNo: nextNo.nextNo }));
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kaydedilirken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async () => {
    if (invoiceHeader.invoiceNo) {
      try {
        const details = await apiService.salesInvoices.getEWaybillDetails(invoiceHeader.invoiceNo);
        setEWaybillDetails(details);
      } catch (error) {
        console.error("E-İrsaliye detayları alınamadı", error);
        setEWaybillDetails(null);
      }
    }
    setIsPreviewMode(true);
  };

  const handleDateChange = (val: string) => {
    setInvoiceHeader(prev => ({
      ...prev,
      date: val,
      deliveryDate: val
    }));
  };

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    const lowerSearch = historySearch.toLowerCase();
    return history.filter(h => 
      h.invoiceNo.toLowerCase().includes(lowerSearch) || 
      h.customerName.toLowerCase().includes(lowerSearch) ||
      h.customerCode.toLowerCase().includes(lowerSearch)
    );
  }, [history, historySearch]);

  const handleSelectFromHistory = (invoiceNo: string) => {
    handleViewDetail(invoiceNo);
    setIsHistoryModalOpen(false);
  };

  const totals = useMemo(() => {
    const subTotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const vatTotal = items.reduce((acc, curr) => acc + ((curr.price * curr.quantity) * curr.vat / 100), 0);
    return { subTotal, vatTotal, grandTotal: subTotal + vatTotal };
  }, [items]);

  const canEdit = invoiceHeader.date === today || isEditMode;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-slate-200 p-8 flex flex-col items-center gap-6 animate-in fade-in duration-500 overflow-y-auto">
        <div className="w-full max-w-[210mm] flex justify-between items-center mb-4 px-4 print:hidden">
           <button 
             onClick={() => setIsPreviewMode(false)}
             className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-xs font-black shadow-sm text-slate-600 hover:text-indigo-600"
           >
              <XCircle size={16} /> GİRİŞ EKRANINA DÖN
           </button>
           <button 
             onClick={() => window.print()}
             className="flex items-center gap-2 px-8 py-2 bg-indigo-600 rounded-xl text-xs font-black shadow-lg text-white hover:bg-indigo-700"
           >
              <Printer size={16} /> YAZDIR
           </button>
        </div>
        {/* ... existing preview layout ... */}
        <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[10mm] text-slate-900 print:shadow-none print:m-0" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
           <div className="relative h-[100mm] border-b border-slate-100 border-dashed">
              <div className="absolute top-[20mm] left-[5mm] text-lg font-bold">SATIŞ İRSALİYESİ</div>
              <div className="absolute top-[45mm] left-[5mm] max-w-[100mm] text-sm leading-relaxed">
                 <p className="font-bold mb-1">{invoiceHeader.customerName}</p>
                 <p className="text-xs">{invoiceHeader.address}</p>
              </div>
              <div className="absolute top-[65mm] left-[5mm] text-xs space-y-1">
                 <p>Vergi Dairesi: {invoiceHeader.taxOffice}</p>
                 <p>Vergi Numarası: {invoiceHeader.taxNumber}</p>
                 <p>Proje Kodu: {invoiceHeader.projectCode}</p>
              </div>
              <div className="absolute top-[55mm] right-[5mm] text-xs text-right space-y-2">
                 <p><span className="font-bold">Düzenleme Tarihi:</span> {invoiceHeader.date}</p>
                 <p><span className="font-bold">Fiili Sevk Tarihi:</span> {invoiceHeader.deliveryDate}</p>
                 <p className="mt-4"><span className="font-bold">İrsaliye No:</span> {invoiceHeader.invoiceNo}</p>
              </div>
           </div>
           <div className="mt-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 h-10">
                    <th className="text-left w-24">Stok Kodu</th>
                    <th className="text-left">Ürün İsmi</th>
                    <th className="text-right w-24">Miktar</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="h-8 align-middle">
                      <td className="text-left font-bold">{item.stockCode}</td>
                      <td className="text-left uppercase">{item.stockName}</td>
                      <td className="text-right font-bold">{item.quantity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
           <div className="mt-12 border-t pt-4">
              <div className="text-xs leading-relaxed italic mb-4">
                 <p><span className="font-bold">Açıklama:</span> {invoiceHeader.description}</p>
              </div>
              
              {eWaybillDetails && (
                <div className="mt-8 border-t border-slate-200 pt-4 text-xs">
                  <h3 className="font-bold text-sm mb-2 uppercase">E-İrsaliye / Taşıyıcı Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><span className="font-bold">GİB İrsaliye No:</span> {eWaybillDetails.gibInvoiceNo}</p>
                      <p><span className="font-bold">Taşıyıcı Firma:</span> {eWaybillDetails.carrierName}</p>
                      <p><span className="font-bold">Taşıyıcı VKN:</span> {eWaybillDetails.carrierVkn}</p>
                      <p><span className="font-bold">İl / İlçe:</span> {eWaybillDetails.carrierCity} / {eWaybillDetails.carrierSubCity}</p>
                      <p><span className="font-bold">Posta Kodu:</span> {eWaybillDetails.carrierPostal}</p>
                    </div>
                    <div>
                      <p><span className="font-bold">Araç Plaka:</span> {eWaybillDetails.licensePlateId}</p>
                      <p><span className="font-bold">Şoför Adı Soyadı:</span> {eWaybillDetails.driverFirstName} {eWaybillDetails.driverLastName}</p>
                      <p><span className="font-bold">Şoför TCKN:</span> {eWaybillDetails.driverNid}</p>
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <FileUp size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Satış İrsaliyesi Girişi</h1>
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
                onClick={async () => {
                  setInvoiceHeader({
                    invoiceNo: '',
                    date: today,
                    deliveryDate: today,
                    customerCode: '',
                    customerName: '',
                    projectCode: '',
                    taxOffice: '',
                    taxNumber: '',
                    address: '',
                    description: '',
                    specialCode1: ''
                  });
                  setItems([]);
                  setIsEditMode(false);
                  
                  // Fetch next number when "New" is clicked
                  setIsLoading(true);
                  try {
                    const nextNo = await apiService.salesInvoices.generateNextNo();
                    if (nextNo && nextNo.nextNo) {
                      setInvoiceHeader(prev => ({ ...prev, invoiceNo: nextNo.nextNo }));
                    }
                  } catch (err) {
                    console.error('Next no fetch error:', err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Plus size={16} className="text-indigo-600" /> Yeni
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Kaydet
              </button>
            </>
          )}
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Eye size={16} className="text-sky-600" /> Önizleme
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* HISTORY SELECTION MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Geçmiş İrsaliye Seçimi</h3>
                <p className="text-xs text-slate-400 font-bold uppercase">Düzenlemek istediğiniz irsaliyeyi listeden seçiniz</p>
              </div>
              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="İrsaliye No, Müşteri Adı veya Kodu ile ara..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">İrsaliye No</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Müşteri</th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tutar</th>
                    <th className="px-4 py-3 text-right w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isHistoryLoading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={32} />
                        <p className="text-xs text-slate-400 mt-4 font-black uppercase">Kayıtlar Getiriliyor...</p>
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Eşleşen Kayıt Bulunamadı</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((inv) => (
                      <tr 
                        key={inv.invoiceNo} 
                        className="hover:bg-indigo-50/50 cursor-pointer transition-all group"
                        onClick={() => handleSelectFromHistory(inv.invoiceNo)}
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm font-black text-indigo-600 font-mono">{inv.invoiceNo}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-bold text-slate-600">{new Date(inv.date).toLocaleDateString('tr-TR')}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 uppercase">{inv.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.customerCode}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-black text-slate-800">₺{inv.totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <ArrowRight size={16} />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam {filteredHistory.length} Kayıt Listeleniyor</p>
            </div>
          </div>
        </div>
      )}

      {/* EIR ALERT NOTIFICATION */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center justify-between shadow-sm animate-pulse">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
               <AlertTriangle size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none mb-1">ÖNEMLİ HATIRLATMA</p>
               <p className="text-xs font-bold text-amber-700">Lütfen bu irsaliye için kullanılacak <span className="underline">e-İrsaliye (EIR) Serisini</span> açıklama alanında belirtiniz.</p>
            </div>
         </div>
         <span className="text-[9px] font-black text-amber-500 uppercase bg-white px-2 py-1 rounded border border-amber-100">Gerekli İşlem</span>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('header')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'header' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Info size={16} /> İŞLEM BAŞLIĞI
        </button>
        <button 
          onClick={() => setActiveTab('lines')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'lines' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Layers size={16} /> DETAY SATIRLARI
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <FileSpreadsheet size={16} /> GEÇMİŞ İRSALİYELER
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Geçmiş İrsaliye Kayıtları</h3>
            <button 
              onClick={fetchHistory}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Yenile"
            >
              <Loader2 size={18} className={isHistoryLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">İrsaliye No</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tarih</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Müşteri</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Proje</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Toplam Tutar</th>
                  <th className="px-6 py-4 text-right w-16">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isHistoryLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="animate-spin text-indigo-600 mx-auto" size={24} />
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase">Veriler Yükleniyor...</p>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-sm text-slate-400 font-bold uppercase">Kayıt Bulunmuyor</p>
                    </td>
                  </tr>
                ) : (
                  history.map((inv) => (
                    <tr key={inv.invoiceNo} className="hover:bg-indigo-50/20 transition-all group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-indigo-600 font-mono tracking-tight">{inv.invoiceNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600">{new Date(inv.date).toLocaleDateString('tr-TR')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{inv.customerName}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.customerCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase">{inv.projectCode || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-black text-slate-800">₺{inv.totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetail(inv.invoiceNo)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
                          title="Detay Gör"
                        >
                          <ArrowRight size={18} />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`${inv.invoiceNo} numaralı irsaliyeyi silmek istediğinize emin misiniz?`)) {
                              try {
                                const res = await apiService.salesInvoices.delete(inv.invoiceNo);
                                if (res.success) {
                                  alert('İrsaliye silindi.');
                                  fetchHistory();
                                }
                              } catch (error) {
                                console.error('Delete error:', error);
                                alert('Silinirken hata oluştu.');
                              }
                            }
                          }}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Sil"
                        >
                          <Trash2 size={18} />
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
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Evrak Bilgileri</h3>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-500">
                      <ShieldCheck size={14} /> GÜVENLİ KAYIT
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                         <span>Fiş / İrsaliye No (EIR + YIL + 8 Hane)</span>
                         <span className={`${invoiceHeader.invoiceNo?.length === 15 ? 'text-indigo-500' : 'text-rose-500'}`}>{invoiceHeader.invoiceNo?.length}/15</span>
                      </label>
                      <div className="relative group">
                         <input 
                           type="text" 
                           maxLength={15}
                           disabled={!canEdit || isFetchingDetail}
                           className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono" 
                           placeholder="EIR202400000001"
                           value={invoiceHeader.invoiceNo}
                           onChange={(e) => {
                             setInvoiceHeader({...invoiceHeader, invoiceNo: e.target.value.toUpperCase()});
                             setIsEditMode(false); // Numara değişirse edit modundan çık
                           }}
                           onKeyDown={(e) => {
                             if (e.key === 'Enter' && invoiceHeader.invoiceNo) {
                               handleViewDetail(invoiceHeader.invoiceNo);
                             }
                           }}
                         />
                         <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                              onClick={() => {
                                fetchHistory();
                                setIsHistoryModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all"
                              title="Geçmişten Seç"
                            >
                              <FileSpreadsheet size={16} />
                            </button>
                            <button
                              onClick={() => invoiceHeader.invoiceNo && handleViewDetail(invoiceHeader.invoiceNo)}
                              disabled={!invoiceHeader.invoiceNo || isFetchingDetail}
                              className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50"
                              title="İrsaliye Ara / Getir"
                            >
                              {isFetchingDetail ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            </button>
                         </div>
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İrsaliye Tarihi</label>
                      <input 
                        type="date" 
                        disabled={!canEdit}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500" 
                        value={invoiceHeader.date}
                        onChange={(e) => handleDateChange(e.target.value)}
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiili Sevk Tarihi</label>
                      <input 
                        type="date" 
                        className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-black text-slate-500 outline-none cursor-not-allowed" 
                        value={invoiceHeader.deliveryDate}
                        readOnly
                      />
                   </div>

                   <div className="md:col-span-2 space-y-2 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <User size={14} className="text-indigo-500" /> Müşteri Seçimi
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled={!canEdit}
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                          placeholder="Müşteri Ara (Kod veya İsim)..."
                          value={isCustomerDropdownOpen ? customerSearch : (invoiceHeader.customerName ? `${invoiceHeader.customerCode} | ${invoiceHeader.customerName}` : '')}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setIsCustomerDropdownOpen(true);
                          }}
                          onFocus={() => {
                            setCustomerSearch('');
                            setIsCustomerDropdownOpen(true);
                          }}
                          onBlur={() => {
                            setTimeout(() => setIsCustomerDropdownOpen(false), 200);
                          }}
                        />
                        {isCustomerDropdownOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {filteredCustomers.length > 0 ? (
                              filteredCustomers.map(c => (
                                <div
                                  key={c.code}
                                  className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleCustomerChange(c.code);
                                    setIsCustomerDropdownOpen(false);
                                  }}
                                >
                                  <div className="font-bold">{c.code}</div>
                                  <div className="text-xs text-slate-500">{c.name}</div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-slate-500 text-center">Müşteri bulunamadı</div>
                            )}
                          </div>
                        )}
                      </div>
                   </div>

                   <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Briefcase size={14} className="text-indigo-500" /> Proje Kodu
                      </label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        readOnly
                        placeholder="Cari seçildiğinde otomatik gelir"
                        className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold outline-none text-slate-600"
                        value={invoiceHeader.projectCode}
                      />
                   </div>

                   <div className="md:col-span-1 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Tag size={14} className="text-indigo-500" /> Özel Kod 1
                      </label>
                      <input 
                        type="text"
                        disabled={!canEdit}
                        readOnly
                        className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-sm font-bold outline-none text-slate-600"
                        value={invoiceHeader.specialCode1}
                      />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Info size={14} /> EIR Serisi ve Notlar
                   </label>
                   <textarea 
                    rows={3} 
                    disabled={!canEdit}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-300" 
                    placeholder="EIR Serisi: (Örn: ABC2024...) ve diğer operasyonel notlar..." 
                    value={invoiceHeader.description}
                    onChange={(e) => setInvoiceHeader({...invoiceHeader, description: e.target.value})}
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
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Sevk Edilen Müşteri</p>
                      <h3 className="text-xl font-black tracking-tight">{invoiceHeader.customerName}</h3>
                      <p className="text-xs font-medium text-slate-400 mt-1 max-w-[400px] leading-relaxed flex items-start gap-1.5"><MapPin size={14} className="shrink-0 mt-0.5" /> {invoiceHeader.address}</p>
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                   <Globe size={180} />
                </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <Settings size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Sistem Konfigürasyonu</h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">DÖVİZ MODÜLÜ</p>
                      <p className="text-xs font-bold text-slate-600 uppercase">DEVRE DIŞI (SADECE TL)</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase">E-İRSALİYE DURUMU</p>
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter">ENTEGRASYON HAZIR</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           {/* QUICK LINE ENTRY */}
           <div className={`bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden ${!canEdit ? 'opacity-50 grayscale' : ''}`}>
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                 <Layers size={140} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-10">
                 <div className="lg:col-span-5 space-y-2 relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Box size={14} className="text-indigo-400" /> Stok Kartı Seçimi
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled={!canEdit}
                        className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 backdrop-blur-md transition-all pr-12 text-white placeholder:text-slate-400"
                        placeholder="Stok Ara (Kod veya İsim)..."
                        value={isStockDropdownOpen ? stockSearch : (lineEntry.stockCode ? `${lineEntry.stockCode} | ${stocks.find(s => s.code === lineEntry.stockCode)?.name || ''}` : '')}
                        onChange={(e) => {
                          setStockSearch(e.target.value);
                          setIsStockDropdownOpen(true);
                        }}
                        onFocus={() => {
                          setStockSearch('');
                          setIsStockDropdownOpen(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setIsStockDropdownOpen(false), 200);
                        }}
                      />
                      {isStockDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {filteredStocks.length > 0 ? (
                            filteredStocks.map(s => (
                              <div
                                key={s.code}
                                className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm text-white border-b border-slate-700 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleStockChange(s.code);
                                  setIsStockDropdownOpen(false);
                                }}
                              >
                                <div className="font-bold">{s.code}</div>
                                <div className="text-xs text-slate-400">{s.name}</div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center">Stok bulunamadı</div>
                          )}
                        </div>
                      )}
                    </div>
                 </div>

                 <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Miktar</label>
                    <input 
                      type="number" 
                      disabled={!canEdit}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-indigo-500 text-center" 
                      placeholder="0" 
                      value={lineEntry.qty || ''}
                      onChange={(e) => setLineEntry({...lineEntry, qty: parseFloat(e.target.value) || 0})}
                    />
                 </div>

                 <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Birim Fiyat (TL)</label>
                    <input 
                      type="number" 
                      disabled={!canEdit}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-indigo-500 text-center" 
                      placeholder="Girmeyebilirsiniz" 
                      value={lineEntry.price || ''}
                      onChange={(e) => setLineEntry({...lineEntry, price: parseFloat(e.target.value) || 0})}
                    />
                 </div>

                 <div className="lg:col-span-3 space-y-2">
                    <button 
                      onClick={handleAddLine}
                      disabled={!canEdit || !lineEntry.stockCode || lineEntry.qty <= 0}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                       <Plus size={18} /> KALEM EKLE
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10 relative z-10">
                 <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">KDV ORANI (KART)</span>
                    <span className={`text-lg font-black ${lineEntry.vat === null ? 'text-rose-400' : 'text-indigo-400'}`}>
                      {lineEntry.vat !== null ? `%${lineEntry.vat}` : 'TANIMLANMAMIŞ'}
                    </span>
                 </div>
                 <div className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-4 border border-white/5">
                    <ShieldCheck size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fiyat girişi opsiyoneldir. TL bazlı hesaplama yapılır.</span>
                 </div>
              </div>
           </div>

           {/* LINE ITEMS TABLE */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-200">
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ürün / Stok Bilgisi</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Birim Fiyat</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">KDV</th>
                          <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Net Toplam (TL)</th>
                          <th className="px-6 py-5 text-right w-16"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {items.map(item => (
                          <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                      <Box size={20} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{item.stockName}</p>
                                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{item.stockCode}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-center font-black text-slate-700">{item.quantity.toLocaleString()}</td>
                             <td className="px-6 py-4 text-center font-bold text-slate-500">₺{item.price.toFixed(2)}</td>
                             <td className="px-6 py-4 text-right">
                                <p className="text-xs font-black text-indigo-600">%{item.vat}</p>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <p className="text-sm font-black text-indigo-700">₺{item.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                             </td>
                             <td className="px-6 py-4 text-right">
                                {canEdit && (
                                  <button 
                                    onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* FOOTER TOTALS */}
              <div className="bg-slate-50/80 p-10 border-t border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-8">
                 <div className="md:col-span-8 flex items-center gap-12">
                    <div className="max-w-md">
                       <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={14} className="text-indigo-600" />
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">EIR Serisi Kontrolü</p>
                       </div>
                       <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Başlık kısmındaki açıklama alanına <b>EIR Serisi</b> girilmediyse, faturalandırma birimi işlemi durduracaktır. Lütfen kontrollerinizi yapınız.</p>
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
                       <span className="text-3xl font-black text-indigo-600 tracking-tighter">₺{totals.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
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
               <ShieldCheck size={16} className="text-indigo-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sistem Güvenlik: AKTİF</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="flex items-center gap-2">
               <Globe size={16} className="text-sky-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">E-Devlet Entegrasyonu: HAZIR</span>
            </div>
         </div>
         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">FLEX WMS ERP v2.4 <span className="mx-2">•</span> Modül: frmSatisIrsaliyesi</p>
      </div>
    </div>
  );
};

export default SalesInvoicePage;
