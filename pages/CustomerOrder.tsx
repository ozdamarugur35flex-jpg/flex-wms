
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileStack, 
  Plus, 
  Save, 
  Trash2, 
  Search, 
  Printer, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  User, 
  MapPin, 
  AlertTriangle, 
  Info, 
  Box, 
  Layers, 
  History, 
  Warehouse, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  CreditCard,
  ChevronRight,
  Calculator,
  ArrowRightLeft,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Target
} from 'lucide-react';
import { 
  CustomerOrderHeader, 
  CustomerOrderItem, 
  StockOrderBalance, 
  SalesAnalysis 
} from '../types';
import { apiService } from '../api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const CustomerOrder: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [orderNo, setOrderNo] = useState('SIP20240001');
  const [header, setHeader] = useState<CustomerOrderHeader | null>(null);
  const [items, setItems] = useState<CustomerOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Analiz Verileri
  const [selectedStockCode, setSelectedStockCode] = useState<string>('');
  const [stockAnalysis, setStockAnalysis] = useState<SalesAnalysis | null>(null);
  const [stockBalance, setStockBalance] = useState<StockOrderBalance | null>(null);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderNo]);

  useEffect(() => {
    if (selectedStockCode && header?.customerCode) {
      fetchStockDetails(selectedStockCode);
    }
  }, [selectedStockCode, header?.customerCode]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const [headerData, itemsData] = await Promise.all([
        apiService.customerOrders.getDetail(orderNo),
        apiService.customerOrders.getItems(orderNo)
      ]);
      setHeader(headerData);
      setItems(itemsData);
      
      if (headerData?.customerCode) {
        const history = await apiService.customerOrders.getCustomerSalesHistory(headerData.customerCode);
        setSalesHistory(history);
      }
    } catch (error) {
      console.error('Sipariş detayları çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockDetails = async (stockCode: string) => {
    try {
      const [analysis, balance] = await Promise.all([
        apiService.customerOrders.getStockAnalysis(stockCode, header?.customerCode || ''),
        apiService.customerOrders.getStockOrderBalance(stockCode)
      ]);
      setStockAnalysis(analysis);
      setStockBalance(balance);
    } catch (error) {
      console.error('Stok detayları çekme hatası:', error);
    }
  };

  const tabs = [
    { id: 0, label: 'ÜST BİLGİ', icon: <Info size={16} /> },
    { id: 1, label: 'KALEM BİLGİSİ', icon: <Layers size={16} /> },
    { id: 2, label: 'FİYAT / SATIŞ ANALİZİ', icon: <TrendingUp size={16} /> },
    { id: 3, label: 'STOK SİP. BAKİYE', icon: <Calculator size={16} /> },
    { id: 4, label: 'CARİ SATIŞ GEÇMİŞİ', icon: <History size={16} /> },
  ];

  if (loading && !header) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Netsis verileri senkronize ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <FileStack size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Müşteri Sipariş Yönetimi (Netsis)</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">TBLSIPAMAS & TBLSIPATRA Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Sipariş No Ara..." 
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 w-48"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-indigo-600" /> Yeni
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Save size={16} className="text-emerald-600" /> Kaydet
          </button>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto shadow-sm no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-transparent space-y-6">
        {activeTab === 0 && header && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in slide-in-from-left-4 duration-500">
            {/* Left: General Order Info */}
            <div className="xl:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-4">Üst Bilgi (TBLSIPAMAS)</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Fiş No" value={header.orderNo} readOnly important />
                    <InputField label="Tarih" value={header.date} type="date" readOnly />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari Kodu / İsim</label>
                    <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold">
                      {header.customerCode} - {header.customerName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Teslim Tarihi" value={header.deliveryDate} type="date" />
                    <InputField label="Sipariş Tipi" value={header.orderType} readOnly />
                  </div>
                  <InputField label="Genel Açıklama" placeholder="Sipariş hakkında genel notlar..." />
               </div>
            </div>

            {/* Right Top: Customer Info & Risk */}
            <div className="xl:col-span-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-xl shadow-indigo-100">
                    <div className="relative z-10 flex items-start justify-between">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Cari Kart (TBLCASAB)</p>
                          <h4 className="text-xl font-black tracking-tight">{header.customerName}</h4>
                       </div>
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <User size={24} />
                       </div>
                    </div>
                    <div className="relative z-10 grid grid-cols-1 gap-4 text-sm font-medium text-indigo-100">
                       <p className="flex items-center gap-2"><ShieldCheck size={16} /> Cari Kod: {header.customerCode}</p>
                       <p className="flex items-center gap-2"><DollarSign size={16} /> Toplam Sipariş Tutarı: ₺{header.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Risk Durumu (TBLCAHAR)</h3>
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${header.riskStatus.netRisk > header.riskStatus.limit ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {header.riskStatus.netRisk > header.riskStatus.limit ? 'RİSKLİ' : 'GÜVENLİ'}
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <RiskCard label="Risk Limiti" value={`₺${header.riskStatus.limit.toLocaleString()}`} color="text-slate-400" />
                        <RiskCard label="Toplam Borç" value={`₺${header.riskStatus.balance.toLocaleString()}`} color="text-indigo-600" />
                        <RiskCard label="Çek Riski" value={`₺${header.riskStatus.checkRisk.toLocaleString()}`} color="text-amber-600" />
                        <RiskCard label="Net Risk" value={`₺${header.riskStatus.netRisk.toLocaleString()}`} color="text-rose-600" bold />
                     </div>
                  </div>
               </div>

               {/* Ek Sahalar (TBLSIPAMASEK) */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Ek Saha Açıklamaları (TBLSIPAMASEK)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(i => (
                       <div key={i} className="space-y-1">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Açıklama {i}</label>
                         <input 
                           type="text" 
                           className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-400 transition-all outline-none" 
                           defaultValue={header.extraFields[`EKALAN${i}`] || ''}
                         />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Kalem Listesi (TBLSIPATRA) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-200">
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Stok (TBLSTSAB)</th>
                       <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar</th>
                       <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Fiyat / KDV</th>
                       <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Teslim Tarihi</th>
                       <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Toplam</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {items.map((item) => (
                       <tr 
                        key={item.id} 
                        className={`hover:bg-indigo-50/20 transition-all cursor-pointer ${selectedStockCode === item.stockCode ? 'bg-indigo-50/40' : ''}`}
                        onClick={() => setSelectedStockCode(item.stockCode)}
                       >
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                                  <Box size={20} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 tracking-tight">{item.stockName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.stockCode}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-slate-700">{item.quantity.toLocaleString()}</span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <p className="text-sm font-bold text-slate-700">₺{item.price.toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600 font-black">KDV %{item.vatRate}</p>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-black text-slate-600">
                               <Calendar size={12} className="text-slate-400" /> {item.deliveryDate}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-indigo-600 tracking-tight">₺{item.total.toLocaleString()}</p>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Geçmiş Satış Fiyatları (TBLSTHAR)</h3>
              {selectedStockCode ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockAnalysis?.pastPrices}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#4f46e5" strokeWidth={3} dot={{ r: 6, fill: '#4f46e5' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 italic">
                  Lütfen kalem listesinden bir stok seçiniz.
                </div>
              )}
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Karşılaştırmalı Analiz</h3>
               <div className="space-y-4">
                  {stockAnalysis?.pastPrices.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <span className="text-xs font-bold text-slate-500">{p.date}</span>
                      <span className="text-sm font-black text-slate-800">₺{p.price.toFixed(2)}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Warehouse size={32} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Depo Bakiyesi (TBLSTOKURS)</p>
                <p className="text-4xl font-black text-slate-800">{stockBalance?.warehouseBalance.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <Target size={32} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Rezerv Siparişler (TBLSIPATRA)</p>
                <p className="text-4xl font-black text-slate-800">{stockBalance?.reservedOrders.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ArrowRightLeft size={32} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Gelecek Siparişler (TBLSIPATRA)</p>
                <p className="text-4xl font-black text-slate-800">{stockBalance?.futureOrders.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 4 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
             <div className="p-8 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Cari Satış Geçmişi (TBLSTHAR)</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-200">
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Stok</th>
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Toplam Miktar</th>
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Son Fiyat</th>
                     <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Son Alım Tarihi</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {salesHistory.map((h, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-all">
                       <td className="px-8 py-4">
                         <p className="text-sm font-black text-slate-800">{h.stockName}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{h.stockCode}</p>
                       </td>
                       <td className="px-8 py-4 text-center font-black text-slate-700">{h.totalQty.toLocaleString()}</td>
                       <td className="px-8 py-4 text-center font-black text-indigo-600">₺{h.lastPrice.toFixed(2)}</td>
                       <td className="px-8 py-4 text-right text-xs font-bold text-slate-500">{h.lastDate}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER INFO BAR */}
      <div className="bg-slate-900 px-8 py-4 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-slate-200">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck size={16} className="text-indigo-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Netsis Entegrasyonu: AKTİF</span>
            </div>
            <div className="flex items-center gap-2">
               <CheckCircle2 size={16} className="text-emerald-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Veri Doğrulama: BAŞARILI</span>
            </div>
         </div>
         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            FLEX WMS ERP v2.4 <span className="mx-2">•</span> Modül: frmMusteriSiparis (Netsis Edition)
         </p>
      </div>
    </div>
  );
};

// Sub-components
const InputField: React.FC<{ label: string, value?: string, placeholder?: string, type?: string, important?: boolean, readOnly?: boolean }> = ({ label, value, placeholder, type = 'text', important, readOnly }) => (
  <div className="space-y-1.5 flex-1 group">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${important ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-500 transition-colors'}`}>
       {label} {important && '*'}
    </label>
    <input 
      type={type} 
      defaultValue={value}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 ${readOnly ? 'bg-slate-100' : 'bg-slate-50'} border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300`}
      placeholder={placeholder}
    />
  </div>
);

const RiskCard: React.FC<{ label: string, value: string, color: string, bold?: boolean }> = ({ label, value, color, bold }) => (
  <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex flex-col gap-1 hover:border-slate-300 transition-all group cursor-default">
     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
     <span className={`text-sm font-black tracking-tight ${color} ${bold ? 'text-lg' : ''}`}>{value}</span>
  </div>
);

export default CustomerOrder;
