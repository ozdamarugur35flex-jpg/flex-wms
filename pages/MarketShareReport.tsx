
import React, { useState, useMemo } from 'react';
import { 
  PieChart as PieChartIcon, 
  RotateCcw, 
  FileSpreadsheet, 
  FileText, 
  XCircle, 
  Search, 
  TrendingUp, 
  Target, 
  Users, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  DollarSign,
  BarChart3,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { MarketShareReport as IReport } from '../types';

const mockReportData: IReport[] = [
  { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', date: '2024-03-01', month: 'Mart', year: '2024', customerName: 'Aksoy Lojistik Tic.', quantity: 2500, marketGroup: 'Otomotiv', marketType: 'Yurt İçi', unitPriceUSD: 12.5, salesAmountUSD: 31250, costUSD: 10.2, materialCostAmountUSD: 25500, ratioPercent: 18.4 },
  { id: '2', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', date: '2024-03-05', month: 'Mart', year: '2024', customerName: 'Yılmaz Metal San.', quantity: 1800, marketGroup: 'İnşaat', marketType: 'Yurt İçi', unitPriceUSD: 13.0, salesAmountUSD: 23400, costUSD: 10.2, materialCostAmountUSD: 18360, ratioPercent: 21.5 },
  { id: '3', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', date: '2024-03-10', month: 'Mart', year: '2024', customerName: 'Global Export GmbH', quantity: 50000, marketGroup: 'Makine', marketType: 'Yurt Dışı', unitPriceUSD: 0.15, salesAmountUSD: 7500, costUSD: 0.11, materialCostAmountUSD: 5500, ratioPercent: 26.6 },
  { id: '4', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', date: '2024-03-15', month: 'Mart', year: '2024', customerName: 'Aksoy Lojistik Tic.', quantity: 5000, marketGroup: 'Otomotiv', marketType: 'Yurt İçi', unitPriceUSD: 2.1, salesAmountUSD: 10500, costUSD: 1.8, materialCostAmountUSD: 9000, ratioPercent: 14.2 },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const MarketShareReport: React.FC = () => {
  const [data, setData] = useState<IReport[]>(mockReportData);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'customerName' | 'marketGroup'>('customerName');

  const filteredData = useMemo(() => {
    return data.filter(item => 
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.marketGroup.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const stats = useMemo(() => {
    const totalSales = filteredData.reduce((acc, curr) => acc + curr.salesAmountUSD, 0);
    const totalCost = filteredData.reduce((acc, curr) => acc + curr.materialCostAmountUSD, 0);
    const avgRatio = filteredData.length > 0 ? filteredData.reduce((acc, curr) => acc + curr.ratioPercent, 0) / filteredData.length : 0;

    // Grouping for chart
    const grouped = filteredData.reduce((acc: any, curr) => {
      const key = curr[groupBy];
      acc[key] = (acc[key] || 0) + curr.salesAmountUSD;
      return acc;
    }, {});

    const chartData = Object.keys(grouped).map(name => ({
      name,
      value: grouped[name]
    })).sort((a, b) => b.value - a.value);

    return { totalSales, totalCost, avgRatio, chartData };
  }, [filteredData, groupBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <PieChartIcon size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Pazar Payı Raporu</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Satış Dağılım & Karlılık Analizi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className="text-indigo-600" /> Listele
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileText size={16} className="text-rose-600" /> PDF Aktar
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <AnalyticCard label="Toplam Satış Hacmi" value={`$${stats.totalSales.toLocaleString()}`} icon={<Target className="text-indigo-600" />} color="bg-indigo-50" />
        <AnalyticCard label="Pazarın En Büyüğü" value={stats.chartData[0]?.name || '-'} icon={<Users className="text-sky-600" />} color="bg-sky-50" subValue={`$${stats.chartData[0]?.value.toLocaleString()}`} />
        <AnalyticCard label="Ortalama Karlılık" value={`%${stats.avgRatio.toFixed(1)}`} icon={<TrendingUp className="text-emerald-600" />} color="bg-emerald-50" />
        <AnalyticCard label="Toplam Maliyet Yükü" value={`$${stats.totalCost.toLocaleString()}`} icon={<BarChart3 className="text-rose-600" />} color="bg-rose-50" />
      </div>

      {/* ANALYTICS SECTION (Chart & Pivot Settings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Market Share Distribution Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Pazar Payı Dağılımı</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Satış Tutarı ($) Bazlı Analiz</p>
              </div>
              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button 
                  onClick={() => setGroupBy('customerName')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${groupBy === 'customerName' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >MÜŞTERİ BAZLI</button>
                <button 
                  onClick={() => setGroupBy('marketGroup')}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${groupBy === 'marketGroup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >PAZAR GRUBU BAZLI</button>
              </div>
           </div>
           <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Satış Tutarı']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Filter & Search (DockPanel1/2 Karşılığı) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex-1 relative overflow-hidden shadow-xl shadow-slate-200">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                       <Filter size={20} />
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-xs text-indigo-200">Rapor Filtreleri</h3>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Akıllı Arama</label>
                       <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
                          <input 
                             type="text" 
                             className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold outline-none focus:bg-white/10 focus:border-indigo-500 transition-all"
                             placeholder="Müşteri, ürün veya grup ara..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Yıl Seçimi</label>
                          <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold outline-none">
                             <option className="text-slate-900">2024</option>
                             <option className="text-slate-900">2023</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pazar Tipi</label>
                          <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold outline-none">
                             <option className="text-slate-900">Tümü</option>
                             <option className="text-slate-900">Yurt İçi</option>
                             <option className="text-slate-900">Yurt Dışı</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                    RAPORU GÜNCELLE
                 </button>
              </div>
              <div className="absolute -bottom-8 -right-8 p-8 opacity-10 rotate-12">
                 <Globe size={180} />
              </div>
           </div>
        </div>
      </div>

      {/* PIVOT-STYLE DATA GRID (pvtGrdPazarPayi) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Pivot Analiz Tablosu</h3>
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Görüntülenen: {filteredData.length} Kalem</span>
           </div>
           <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MoreHorizontal size={20} /></button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Müşteri / Pazar Detayı</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Satılan Ürün</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Miktar</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Satış Tutarı ($)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Malz. Maliyeti ($)</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Karlılık Oranı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-[10px] border border-slate-200">
                        {item.marketType === 'Yurt İçi' ? 'TR' : 'EX'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-tight">{item.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{item.marketGroup} <span className="mx-1">•</span> {item.marketType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <p className="text-xs font-bold text-slate-700">{item.stockName}</p>
                     <p className="text-[10px] text-slate-400 font-mono">{item.stockCode}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <span className="text-sm font-black text-slate-800">{item.quantity.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-indigo-600">${item.salesAmountUSD.toLocaleString()}</span>
                        <span className="text-[9px] font-bold text-slate-400">BR: ${item.unitPriceUSD}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                     <span className="text-sm font-bold text-slate-600">${item.materialCostAmountUSD.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[11px] font-black">
                        {item.ratioPercent > 20 ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-amber-500" />}
                        %{item.ratioPercent.toFixed(1)}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GRAND TOTAL (Pivot Grand Total) */}
        <div className="bg-slate-900 p-8 flex flex-col md:flex-row items-center justify-between text-white border-t border-white/5">
           <div className="flex items-center gap-12 mb-4 md:mb-0">
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genel Satış Toplamı</p>
                 <p className="text-2xl font-black tracking-tight text-indigo-400">${stats.totalSales.toLocaleString()}</p>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genel Maliyet Toplamı</p>
                 <p className="text-2xl font-black tracking-tight text-rose-400">${stats.totalCost.toLocaleString()}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genel Pazar Karlılığı</p>
              <h4 className="text-3xl font-black tracking-tighter">%{stats.avgRatio.toFixed(2)}</h4>
           </div>
        </div>
      </div>
      
      {/* PAGINATION */}
      <div className="px-8 py-6 bg-white rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analiz Veri Tabanı Aktif</p>
         </div>
         <div className="flex items-center gap-2">
            <button className="p-2 text-slate-300 hover:text-indigo-600 disabled:opacity-30"><ChevronLeft size={24} /></button>
            <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100">1</button>
            <button className="p-2 text-slate-300 hover:text-indigo-600"><ChevronRight size={24} /></button>
         </div>
      </div>
    </div>
  );
};

// Sub-components
const AnalyticCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string, subValue?: string }> = ({ label, value, icon, color, subValue }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
     <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
           {icon}
        </div>
        {subValue && <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{subValue}</span>}
     </div>
     <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tighter leading-none truncate">{value}</h4>
     </div>
     <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none opacity-50" />
  </div>
);

export default MarketShareReport;
