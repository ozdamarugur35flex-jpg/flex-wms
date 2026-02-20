
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Info, 
  ArrowRightLeft,
  Settings2,
  LayoutList,
  Target,
  BadgeAlert
} from 'lucide-react';
import { SalesCostAnalysis as IAnalysis } from '../types';

const mockAnalysisData: IAnalysis[] = [
  { id: '1', salesStatus: 'Satıldı', customerName: 'Aksoy Metal Ltd.', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', salesPriceUSD: 14.5, costUSD: 11.2, specCode: 'S-01', specName: 'Standart Eloksal', totalSalesQty: 1250, grossProfitUSD: 3.3, profitPercent: 22.7 },
  { id: '2', salesStatus: 'Satıldı', customerName: 'Global Lojistik', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', salesPriceUSD: 0.12, costUSD: 0.14, specCode: 'S-05', specName: 'Paslanmaz Çelik', totalSalesQty: 50000, grossProfitUSD: -0.02, profitPercent: -16.6 },
  { id: '3', salesStatus: 'Satıldı', customerName: 'Yılmaz Sanayi', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', salesPriceUSD: 0, costUSD: 2.1, specCode: 'S-12', specName: 'ABS Plastik', totalSalesQty: 200, grossProfitUSD: -2.1, profitPercent: -100 },
  { id: '4', salesStatus: 'Satılmadı', customerName: '---', stockCode: 'BND-45', stockName: 'Koli Bandı 45mm', salesPriceUSD: 4.5, costUSD: 3.8, specCode: 'S-02', specName: 'Ambalaj', totalSalesQty: 0, grossProfitUSD: 0.7, profitPercent: 15.5 },
];

const SalesCostAnalysis: React.FC = () => {
  const [data, setData] = useState<IAnalysis[]>(mockAnalysisData);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' });
  const [stockType, setStockType] = useState<'Satılan' | 'Satılmayan' | 'Hepsi'>('Hepsi');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = stockType === 'Hepsi' || 
                        (stockType === 'Satılan' && item.totalSalesQty > 0) ||
                        (stockType === 'Satılmayan' && item.totalSalesQty === 0);

      return matchSearch && matchType;
    }).sort((a, b) => b.totalSalesQty - a.totalSalesQty);
  }, [data, searchTerm, stockType]);

  const stats = useMemo(() => {
    const soldItems = filteredData.filter(i => i.totalSalesQty > 0);
    const lossItems = soldItems.filter(i => i.grossProfitUSD < 0).length;
    const totalProfit = soldItems.reduce((acc, curr) => acc + (curr.grossProfitUSD * curr.totalSalesQty), 0);
    const avgMargin = soldItems.length > 0 ? soldItems.reduce((acc, curr) => acc + curr.profitPercent, 0) / soldItems.length : 0;

    return {
      totalVolume: soldItems.reduce((acc, curr) => acc + (curr.salesPriceUSD * curr.totalSalesQty), 0),
      avgMargin,
      lossItems,
      totalProfit
    };
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Satış Maliyet Analizi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Karlılık & Verimlilik Raporu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className="text-indigo-600" /> Listele
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

      {/* FILTER PANEL (DockPanel1 & DockPanel2 Karşılığı) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Date Filters */}
         <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <Calendar size={16} className="text-indigo-500" />
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Analiz Dönemi</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Başlangıç</label>
                  <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bitiş</label>
                  <input type="date" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
               </div>
            </div>
         </div>

         {/* Stock Type Filter */}
         <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <Settings2 size={16} className="text-emerald-500" />
               <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Rapor Kriteri (opStokTipi)</h3>
            </div>
            <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100">
               {['Satılan', 'Satılmayan', 'Hepsi'].map(type => (
                 <button 
                  key={type}
                  onClick={() => setStockType(type as any)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${stockType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                 >
                   {type.toUpperCase()}
                 </button>
               ))}
            </div>
         </div>

         {/* Modern Search */}
         <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-end">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input 
                  type="text" 
                  placeholder="Müşteri veya ürün ile analiz ara..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
         </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <KPICard label="Toplam Satış Hacmi" value={`$${stats.totalVolume.toLocaleString()}`} icon={<Target className="text-sky-600" />} color="bg-sky-50" />
         <KPICard label="Ortalama Marj" value={`%${stats.avgMargin.toFixed(1)}`} icon={<TrendingUp className="text-emerald-600" />} color="bg-emerald-50" />
         <KPICard label="Zarar Eden Kalemler" value={stats.lossItems} icon={<BadgeAlert className="text-rose-600" />} color="bg-rose-50" warning={stats.lossItems > 0} />
         <KPICard label="Net Brüt Kar" value={`$${stats.totalProfit.toLocaleString()}`} icon={<DollarSign className="text-indigo-600" />} color="bg-indigo-50" />
      </div>

      {/* DATA GRID (grdMaliyet / GridView1) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Analiz Detayı</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Satış / Maliyet ($)</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Satış Miktarı</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Brüt Kar ($)</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Kar Yüzdesi</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item) => {
                const isLoss = item.grossProfitUSD < 0;
                const noPrice = item.salesPriceUSD === 0;
                
                return (
                  <tr key={item.id} className={`hover:bg-indigo-50/30 transition-all group ${isLoss ? 'bg-rose-50/10' : noPrice ? 'bg-orange-50/10' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isLoss ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-white group-hover:text-indigo-600 group-hover:border-indigo-100'}`}>
                           <LayoutList size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.stockCode}</p>
                          <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{item.stockName}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] italic">{item.customerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                             <p className={`text-sm font-black ${noPrice ? 'text-orange-600' : 'text-slate-800'}`}>${item.salesPriceUSD.toFixed(2)}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase">SATIŞ</p>
                          </div>
                          <div className="w-[1px] h-6 bg-slate-200" />
                          <div className="text-center">
                             <p className="text-sm font-black text-slate-600">${item.costUSD.toFixed(2)}</p>
                             <p className="text-[8px] font-black text-slate-400 uppercase">MALİYET</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <p className="text-sm font-black text-slate-700">{item.totalSalesQty.toLocaleString()}</p>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">BİRİM SATIŞ</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <div className={`inline-flex px-3 py-1 rounded-xl text-sm font-black ${isLoss ? 'text-rose-600 bg-rose-50' : 'text-emerald-600 bg-emerald-50'}`}>
                          {item.grossProfitUSD < 0 ? '' : '+'}${item.grossProfitUSD.toFixed(2)}
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center justify-between w-24">
                             <span className={`text-[10px] font-black ${isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>%{item.profitPercent.toFixed(1)}</span>
                             {isLoss && <TrendingDown size={12} className="text-rose-400" />}
                          </div>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div className={`h-full ${isLoss ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${Math.min(Math.abs(item.profitPercent), 100)}%`}} />
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${item.salesStatus === 'Satıldı' ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                         {item.salesStatus}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER SUMMARY (GridView1 Footer) */}
        <div className="bg-slate-50/80 p-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-12">
                <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Analiz Edilen Kalem</p>
                    <p className="text-xl font-black text-slate-800 leading-none">{filteredData.length}</p>
                </div>
                <div className="w-[1px] h-8 bg-slate-200" />
                <div className="flex flex-col">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Toplam Kar Hacmi</p>
                    <p className="text-xl font-black text-indigo-600 leading-none">${stats.totalProfit.toLocaleString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="p-3 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors" disabled>
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-1">
                    <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100">1</button>
                </div>
                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
      </div>

      {/* STATUS LEGEND (PanelControl1 / LabelControl9-10) */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
         <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                  <BadgeAlert size={24} className="text-white" />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-rose-400">Negatif Karlılık</p>
                  <p className="text-[11px] text-slate-400 font-medium">Kar yüzdesi 0'ın altında olan satışlar. Maliyetler satış fiyatını aşmış durumdadır.</p>
               </div>
            </div>
            <div className="hidden md:block w-[1px] h-10 bg-white/10" />
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <AlertCircle size={24} className="text-white" />
               </div>
               <div>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-400">Fiyat Girişi Yok</p>
                  <p className="text-[11px] text-slate-400 font-medium">Satış fiyatı $0.00 olarak görünen kalemler. Analiz için fiyat girişi gereklidir.</p>
               </div>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Finansal Veri Kaynağı: FLEX ERP</p>
            <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">Son Güncelleme: 14:30</p>
         </div>
      </div>
    </div>
  );
};

// Internal Components
const KPICard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string, warning?: boolean }> = ({ label, value, icon, color, warning }) => (
  <div className={`p-6 bg-white rounded-[2rem] border transition-all shadow-sm hover:shadow-xl group ${warning ? 'border-rose-200 ring-2 ring-rose-50' : 'border-slate-200'}`}>
     <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
           {icon}
        </div>
        {warning && <AlertCircle size={18} className="text-rose-500 animate-bounce" />}
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className={`text-2xl font-black tracking-tighter leading-none ${warning ? 'text-rose-600' : 'text-slate-800'}`}>{value}</h4>
     </div>
  </div>
);

export default SalesCostAnalysis;
