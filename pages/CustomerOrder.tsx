
import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { CustomerOrder as ICustomerOrder, OrderItem } from '../types';

const mockOrderItems: OrderItem[] = [
  { id: '1', stockCode: 'AL-001', stockName: 'Alüminyum Profil 20x20', deliveryDate: '2024-04-10', loadingDate: '2024-04-05', warehouseCode: '01', quantity: 100, unit: 'ADET', price: 45.5, vat: 20, currency: 'TRY', exchangeRate: 1, total: 4550, isRework: false },
  { id: '2', stockCode: 'SMN-08', stockName: 'M8 Çelik Somun', deliveryDate: '2024-04-12', loadingDate: '2024-04-08', warehouseCode: '01', quantity: 5000, unit: 'ADET', price: 1.2, vat: 20, currency: 'TRY', exchangeRate: 1, total: 6000, isRework: false },
];

const CustomerOrder: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState<OrderItem[]>(mockOrderItems);
  const [selectedStock, setSelectedStock] = useState<string>('');

  const tabs = [
    { id: 0, label: 'ÜST BİLGİ', icon: <Info size={16} /> },
    { id: 1, label: 'KALEM BİLGİSİ', icon: <Layers size={16} /> },
    { id: 2, label: 'FİYAT / SATIŞ ANALİZİ', icon: <TrendingUp size={16} /> },
    { id: 3, label: 'STOK SİP. BAKİYE', icon: <Calculator size={16} /> },
    { id: 4, label: 'CARİ SATIŞ GEÇMİŞİ', icon: <History size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <FileStack size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Müşteri Sipariş Yönetimi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Satış & Planlama Modülü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-indigo-600" /> Yeni Kayıt
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Save size={16} className="text-emerald-600" /> Kaydet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Trash2 size={16} className="text-rose-600" /> Sil
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Printer size={16} className="text-slate-500" /> Yazdır
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
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
        {activeTab === 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in slide-in-from-left-4 duration-500">
            {/* Left: General Order Info (GroupControl1) */}
            <div className="xl:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase border-b border-slate-100 pb-4">Genel Sipariş Bilgileri</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Fiş Numarası" icon={<FileStack size={14}/>} placeholder="SİP20240001" important />
                    <InputField label="Tarih" icon={<Calendar size={14}/>} type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Müşteri Seçimi (grdLueCari)</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none">
                      <option>Müşteri Seçiniz...</option>
                      <option>Aksoy Metal Sanayi</option>
                      <option>Global Lojistik A.Ş.</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Teslim Tarihi" icon={<Calendar size={14}/>} type="date" />
                    <InputField label="Döv. Baz Tarihi" icon={<Calendar size={14}/>} type="date" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600">Sipariş Tipi</label>
                      <select className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm font-black text-emerald-800 outline-none">
                        <option>YURT İÇİ</option>
                        <option>YURT DIŞI</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">KDV Durumu</label>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                         <input type="checkbox" id="kdvDahil" className="w-4 h-4 text-indigo-600 rounded" />
                         <label htmlFor="kdvDahil" className="text-xs font-bold text-slate-600">KDV Dahil (chkKdvDahil)</label>
                      </div>
                    </div>
                  </div>
                  <InputField label="Genel Açıklama" placeholder="Sipariş hakkında genel notlar..." />
               </div>
            </div>

            {/* Right Top: Customer Info & Risk (GroupControl2 & GroupControl6) */}
            <div className="xl:col-span-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Card (GroupControl2) */}
                  <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-xl shadow-indigo-100">
                    <div className="relative z-10 flex items-start justify-between">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Cari Detayları</p>
                          <h4 className="text-xl font-black tracking-tight">Aksoy Metal Sanayi</h4>
                       </div>
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <User size={24} />
                       </div>
                    </div>
                    <div className="relative z-10 grid grid-cols-1 gap-4 text-sm font-medium text-indigo-100">
                       <p className="flex items-center gap-2"><MapPin size={16} /> Sarıyer, İstanbul (Sarıyer V.D.)</p>
                       <p className="flex items-center gap-2"><ShieldCheck size={16} /> Vergi No: 1234567890</p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <FileStack size={120} />
                    </div>
                  </div>

                  {/* Risk Info (GroupControl6) */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                     <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Müşteri Risk Durumu</h3>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">GÜVENLİ</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <RiskCard label="Risk Limiti" value="₺100,000" color="text-slate-400" />
                        <RiskCard label="Toplam Borç" value="₺14,250" color="text-indigo-600" />
                        <RiskCard label="Çek Riski" value="₺5,000" color="text-amber-600" />
                        <RiskCard label="Net Risk" value="₺19,250" color="text-rose-600" bold />
                     </div>
                     <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                           <span>KULLANIM: %19.2</span>
                           <span>KALAN: ₺80,750</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="w-[19.2%] h-full bg-indigo-500" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Descriptions (GroupControl3) - Modern Grid Layout */}
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Ek Saha Açıklamaları (1-16)</h3>
                    <Info size={18} className="text-slate-300" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(i => (
                       <div key={i} className="space-y-1 group">
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 group-hover:text-indigo-500 transition-colors">Açıklama {i}</label>
                         <input type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-400 transition-all outline-none" placeholder={`Not-${i}...`} />
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            {/* Quick Line Entry (GroupControl4) */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Layers size={140} />
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end relative z-10">
                  <div className="lg:col-span-5 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Box size={14} className="text-indigo-400" /> Stok Kartı Seçimi (grdLueStok)
                    </label>
                    <select 
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 backdrop-blur-md transition-all appearance-none"
                    >
                      <option className="text-slate-900">Stok Seçiniz...</option>
                      <option value="AL-001" className="text-slate-900">AL-001 | Alüminyum Profil 20x20</option>
                      <option value="SMN-08" className="text-slate-900">SMN-08 | M8 Çelik Somun</option>
                    </select>
                  </div>
                  
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Miktar</label>
                    <input type="number" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-indigo-400 text-center" placeholder="0.00" />
                  </div>
                  
                  <div className="lg:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Birim Fiyat (TL)</label>
                    <input type="number" className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.5rem] text-sm font-black outline-none focus:border-indigo-400 text-center" placeholder="0.00" />
                  </div>

                  <div className="lg:col-span-3 space-y-2 flex flex-col justify-end">
                    <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                       <Plus size={18} /> Kalem Ekle
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t border-white/10 relative z-10">
                  <InputFieldDark label="Teslim Tarihi" type="date" />
                  <InputFieldDark label="Revizyon No" placeholder="R01" />
                  <InputFieldDark label="Planlama Notu" placeholder="Acil sipariş..." />
                  <div className="flex items-center gap-6 px-4">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-5 h-5 border-2 border-white/20 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 flex items-center justify-center transition-all">
                           <CheckIcon className="w-3 h-3 text-white hidden peer-checked:block" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Rework (chkRework)</span>
                     </label>
                  </div>
               </div>
            </div>

            {/* Line Items Table (grdKalemListesi) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-200">
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Stok Bilgisi</th>
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar</th>
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Fiyat / KDV</th>
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Teslim Tarihi</th>
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">K/P</th>
                       <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Toplam</th>
                       <th className="px-6 py-5 text-right"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {items.map((item) => (
                       <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors border border-slate-100">
                                  <Box size={20} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800 tracking-tight">{item.stockName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KOD: {item.stockCode} <span className="mx-1">•</span> REVIZYON: {item.revisionNo || '-'}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="text-sm font-black text-slate-700">{item.quantity.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">{item.unit}</span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <p className="text-sm font-bold text-slate-700">₺{item.price.toFixed(2)}</p>
                            <p className="text-[10px] text-emerald-600 font-black">KDV %{item.vat}</p>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-black text-slate-600">
                               <Calendar size={12} className="text-slate-400" /> {item.deliveryDate}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-black rounded border border-sky-100 uppercase">KESİN</span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <p className="text-sm font-black text-indigo-600 tracking-tight">₺{item.total.toLocaleString()}</p>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               {/* Grid Footer Summary */}
               <div className="bg-slate-50/80 p-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-12">
                     <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Toplam Kalem</p>
                        <p className="text-xl font-black text-slate-800 leading-none">{items.length}</p>
                     </div>
                     <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Toplam Miktar</p>
                        <p className="text-xl font-black text-slate-800 leading-none">5,100.00</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-8 mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ara Toplam:</span>
                        <span className="text-lg font-black text-slate-600 tracking-tight">₺10,550.00</span>
                     </div>
                     <div className="flex items-center gap-8">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-[0.15em]">Sipariş Genel Toplamı:</span>
                        <span className="text-3xl font-black text-indigo-600 tracking-tighter">₺12,660.00</span>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Analytic Tabs (TabPage 3,4,5) - Placeholder for demonstration */}
        {[2,3,4].includes(activeTab) && (
          <div className="animate-in fade-in duration-500 space-y-6">
             <div className="bg-white p-12 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  {activeTab === 2 ? <TrendingUp size={40} /> : activeTab === 3 ? <Calculator size={40} /> : <History size={40} />}
                </div>
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest">Analiz Verisi Hazırlanıyor</h4>
                <p className="text-sm font-medium text-slate-400 text-center max-w-sm">Bu sekme için geçmiş veriler ve bakiye kontrolleri sistemden anlık olarak çekiliyor. Lütfen bekleyiniz...</p>
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                   <div className="w-1/3 h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" />
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FOOTER INFO BAR */}
      <div className="bg-slate-900 px-8 py-4 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-slate-200">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <ShieldCheck size={16} className="text-indigo-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Mali Onay: BEKLEMEDE</span>
            </div>
            <div className="flex items-center gap-2">
               <Warehouse size={16} className="text-sky-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Lojistik Planlama: AKTİF</span>
            </div>
         </div>
         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            FLEX WMS ERP v2.4 <span className="mx-2">•</span> Modül: frmMusteriSiparis
         </p>
      </div>
    </div>
  );
};

// Sub-components
const InputField: React.FC<{ label: string, icon?: React.ReactNode, placeholder?: string, type?: string, important?: boolean }> = ({ label, icon, placeholder, type = 'text', important }) => (
  <div className="space-y-1.5 flex-1 group">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${important ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-500 transition-colors'}`}>
       {icon} {label} {important && '*'}
    </label>
    <input 
      type={type} 
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300"
      placeholder={placeholder}
    />
  </div>
);

const InputFieldDark: React.FC<{ label: string, placeholder?: string, type?: string }> = ({ label, placeholder, type = 'text' }) => (
  <div className="space-y-1.5 flex-1 group">
    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 group-hover:text-indigo-300 transition-colors">{label}</label>
    <input 
      type={type} 
      className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:bg-white/10 focus:border-indigo-500 transition-all placeholder:text-white/20"
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

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default CustomerOrder;
