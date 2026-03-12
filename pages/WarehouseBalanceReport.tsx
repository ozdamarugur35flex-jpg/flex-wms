
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  Box, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  ListTree, 
  Layers, 
  Table as TableIcon,
  Info,
  Settings2,
  TrendingUp,
  Tag,
  ArrowRightCircle,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '../api';

interface WarehouseStock {
  id: string;
  stockCode: string;
  stockName: string;
  unit: string;
  groupCode: string;
  category1: string;
  supplier: string;
  lastPurchasePrice: number;
  salesPrice: number;
  warehouseBalances: Record<string, number>;
  totalBalance: number;
}

const WarehouseBalanceReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pivot' | 'detail'>('pivot');
  const [searchTerm, setSearchTerm] = useState('');
  const [showValues, setShowValues] = useState(true);
  const [data, setData] = useState<WarehouseStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<{code: string, name: string}[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceData, warehouseData] = await Promise.all([
        apiService.reports.getWarehouseBalances(),
        apiService.warehouses.getAll()
      ]);
      setData(balanceData);
      setWarehouses(warehouseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.stockName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.stockCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.category1?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Depo Bakiyeleri");
    XLSX.writeFile(workbook, `Depo_Bakiye_Raporu_${activeTab}.xlsx`);
  };

  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      balance: acc.balance + curr.totalBalance,
      inventoryValue: acc.inventoryValue + (curr.totalBalance * curr.lastPurchasePrice),
      potentialSalesValue: acc.potentialSalesValue + (curr.totalBalance * curr.salesPrice)
    }), { balance: 0, inventoryValue: 0, potentialSalesValue: 0 });
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      
      {/* TOOLBAR */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Depo Bakiye Listesi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Finansal Envanter & Satır Bazlı Analiz</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 mr-2">
              <button 
                onClick={() => setActiveTab('pivot')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'pivot' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <TableIcon size={14} /> PİVOT GÖRÜNÜM
              </button>
              <button 
                onClick={() => setActiveTab('detail')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${activeTab === 'detail' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 <ListTree size={14} /> DETAYLI LİSTE
              </button>
           </div>

          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all active:scale-95">
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> LİSTELE
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> EXCEL
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
         <AnalyticCard 
            label="Toplam Kalem" 
            value={filteredData.length} 
            unit="ADET" 
            icon={<LayoutGrid className="text-sky-600"/>} 
            color="bg-sky-50" 
         />
         <AnalyticCard 
            label="Genel Stok Bakiyesi" 
            value={totals.balance.toLocaleString()} 
            unit="ADET" 
            icon={<Layers className="text-indigo-600"/>} 
            color="bg-indigo-50" 
         />
         <div className="bg-slate-900 p-5 rounded-[2rem] border border-slate-800 shadow-xl flex items-center justify-between group cursor-pointer" onClick={() => setShowValues(!showValues)}>
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Finansal Görünüm</p>
               <h4 className="text-sm font-black text-white">{showValues ? 'DEĞERLERİ GİZLE' : 'DEĞERLERİ GÖSTER'}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showValues ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
               <Settings2 size={20} />
            </div>
         </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Stok adı, kod veya Kategori 1 ile filtrele..." 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
         
         <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
            ) : activeTab === 'pivot' ? (
               <table className="w-full text-left border-collapse min-w-[1500px] animate-in slide-in-from-left-4 duration-500">
                  <thead className="sticky top-0 z-10">
                     <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-8 py-5 border-r border-white/5 sticky left-0 z-30 bg-slate-950 w-[300px]">Stok Kartı / Ürün</th>
                        <th className="px-6 py-5 border-r border-white/5 text-center w-32">Kategori 1</th>
                        <th className="px-6 py-5 border-r border-white/5 text-center w-20">Birim</th>
                        {warehouses.map(w => (
                           <th key={w.code} className="px-6 py-5 border-r border-white/5 text-center min-w-[120px]">
                              <div className="flex flex-col items-center">
                                 <span className="text-indigo-400 mb-1">{w.name}</span>
                                 <span className="text-[8px] opacity-40 font-mono">KOD: {w.code}</span>
                              </div>
                           </th>
                        ))}
                        {showValues && (
                           <>
                              <th className="px-6 py-5 border-r border-white/5 text-right min-w-[140px] bg-rose-950/30">Envanter Değeri</th>
                              <th className="px-6 py-5 border-r border-white/5 text-right min-w-[140px] bg-emerald-950/30">Pot. Satış</th>
                           </>
                        )}
                        <th className="px-8 py-5 text-right bg-indigo-900 sticky right-0 z-20">Toplam Bakiye</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredData.map(item => (
                        <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group">
                           <td className="px-8 py-5 sticky left-0 z-10 bg-white group-hover:bg-indigo-50 transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                              <div>
                                 <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{item.stockName}</p>
                                 <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{item.stockCode}</p>
                              </div>
                           </td>
                           <td className="px-6 py-5 text-center">
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded border border-slate-200 text-[9px] font-black uppercase tracking-widest">{item.category1}</span>
                           </td>
                           <td className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase">{item.unit}</td>
                           {warehouses.map(w => {
                              const balance = item.warehouseBalances[w.code] || 0;
                              return (
                                 <td key={w.code} className={`px-6 py-5 text-center ${balance > 0 ? 'bg-indigo-50/20' : ''}`}>
                                    <span className={`text-sm font-black ${balance > 0 ? 'text-indigo-600' : 'text-slate-200'}`}>
                                       {balance > 0 ? balance.toLocaleString() : '---'}
                                    </span>
                                 </td>
                              );
                           })}
                           {showValues && (
                              <>
                                 <td className="px-6 py-5 text-right font-black text-rose-600 bg-rose-50/10">
                                    ₺{(item.totalBalance * item.lastPurchasePrice).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                 </td>
                                 <td className="px-6 py-5 text-right font-black text-emerald-600 bg-emerald-50/10">
                                    ₺{(item.totalBalance * item.salesPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                 </td>
                              </>
                           )}
                           <td className="px-8 py-5 text-right sticky right-0 z-10 bg-white group-hover:bg-indigo-50 transition-colors shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                              <div className="inline-flex flex-col items-end">
                                 <span className="text-lg font-black text-slate-800 tracking-tighter">{item.totalBalance.toLocaleString()}</span>
                                 <span className="text-[8px] font-black text-indigo-500 uppercase">KONSOLİDE</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            ) : (
               <table className="w-full text-left border-collapse min-w-[1600px] animate-in slide-in-from-right-4 duration-500">
                  <thead className="sticky top-0 z-10">
                     <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-8 py-5 border-r border-white/5 sticky left-0 z-30 bg-slate-950 w-[300px]">Stok Kartı</th>
                        <th className="px-6 py-5 border-r border-white/5 text-center w-32">Kategori 1</th>
                        <th className="px-6 py-5 border-r border-white/5 text-center">Birim</th>
                        <th className="px-8 py-5 border-r border-white/5 text-right">Son Alış (BR)</th>
                        <th className="px-8 py-5 border-r border-white/5 text-right">Satış Fiyat (BR)</th>
                        {showValues && (
                           <>
                              <th className="px-8 py-5 border-r border-white/5 text-right bg-rose-950/30">Envanter Değeri</th>
                              <th className="px-8 py-5 border-r border-white/5 text-right bg-emerald-950/30">Potansiyel Satış</th>
                           </>
                        )}
                        <th className="px-8 py-5 border-r border-white/5 text-right bg-indigo-900 sticky right-0 z-10">Toplam Bakiye</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredData.map((item) => {
                        const invValue = item.totalBalance * item.lastPurchasePrice;
                        const potValue = item.totalBalance * item.salesPrice;
                        
                        return (
                           <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group">
                              <td className="px-8 py-5 sticky left-0 z-10 bg-white group-hover:bg-indigo-50 transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                 <div>
                                    <p className="text-sm font-black text-slate-800 leading-tight uppercase mb-1">{item.stockName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest">{item.stockCode}</p>
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-center">
                                 <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 text-[10px] font-black uppercase tracking-tighter">{item.category1}</span>
                              </td>
                              <td className="px-6 py-5 text-center text-xs font-black text-slate-400">{item.unit}</td>
                              <td className="px-8 py-5 text-right font-black text-slate-600">₺{item.lastPurchasePrice.toFixed(2)}</td>
                              <td className="px-8 py-5 text-right font-black text-slate-600">₺{item.salesPrice.toFixed(2)}</td>
                              {showValues && (
                                 <>
                                    <td className="px-8 py-5 text-right font-black text-rose-600 bg-rose-50/30">₺{invValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    <td className="px-8 py-5 text-right font-black text-emerald-600 bg-emerald-50/30">₺{potValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                 </>
                              )}
                              <td className="px-8 py-5 text-right sticky right-0 z-10 bg-white group-hover:bg-indigo-50 transition-colors shadow-[-4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                                 <span className="text-sm font-black text-slate-800">{item.totalBalance.toLocaleString()}</span>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            )}
         </div>

         <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
            <div className="flex items-center gap-12">
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Kalem</p>
                  <p className="text-xl font-black tracking-tight text-indigo-400">{filteredData.length}</p>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genel Bakiye Miktarı</p>
                  <p className="text-xl font-black tracking-tight text-emerald-400">
                     {totals.balance.toLocaleString()} <span className="text-xs font-bold text-slate-500 ml-1">ADET</span>
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-1">
                  <button className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-colors" disabled><ChevronLeft size={20} /></button>
                  <button className="w-8 h-8 bg-indigo-600 text-white rounded-lg text-[10px] font-black shadow-lg">1</button>
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><ChevronRight size={20} /></button>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 flex items-start gap-4 shadow-sm">
         <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <Info size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest leading-none mb-1">Analiz Bilgisi</h4>
            <p className="text-xs text-indigo-600/80 leading-relaxed font-medium">Bu rapor sadece seçilen ana depoları (Ana, Red, Sevk, Fabrika-2) kapsamaktadır. **Envanter Değeri** ve **Potansiyel Satış** kolonları ürün bazında toplam bakiye üzerinden dinamik hesaplanarak listeye eklenmiştir.</p>
         </div>
      </div>
    </div>
  );
};

const AnalyticCard: React.FC<{ label: string, value: string | number, unit?: string, icon: React.ReactNode, color: string }> = ({ label, value, unit, icon, color }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-default">
     <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none">
           {value} {unit && <span className="text-[10px] text-slate-400 ml-0.5">{unit}</span>}
        </h4>
     </div>
  </div>
);

export default WarehouseBalanceReport;
