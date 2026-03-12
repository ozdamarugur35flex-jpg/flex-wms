
import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Box, 
  Database, 
  Layers, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calculator, 
  LayoutList, 
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Calendar,
  Warehouse as WarehouseIcon,
  Info,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StockListItem, StockMovementReportItem, StockWarehouseBalance } from '../types';
import { apiService } from '../api';

const StockMovementReport: React.FC = () => {
  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockListItem | null>(null);
  const [movements, setMovements] = useState<StockMovementReportItem[]>([]);
  const [balances, setBalances] = useState<StockWarehouseBalance[]>([]);
  const [activeTab, setActiveTab] = useState<'movements' | 'balances'>('movements');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [stocksLoading, setStocksLoading] = useState(true);

  const loadStocks = async () => {
    setStocksLoading(true);
    try {
      const data = await apiService.stocks.getAll();
      setStocks(data);
      if (data.length > 0 && !selectedStock) {
        setSelectedStock(data[0]);
      }
    } catch (error) {
      console.error('Stoklar yüklenirken hata:', error);
    } finally {
      setStocksLoading(false);
    }
  };

  const loadReportData = async () => {
    if (!selectedStock) return;
    setLoading(true);
    try {
      const [movementsData, balancesData] = await Promise.all([
        apiService.reports.getStockMovements([selectedStock.code], '', ''),
        apiService.reports.getStockWarehouseBalances([selectedStock.code])
      ]);
      setMovements(movementsData);
      setBalances(balancesData);
    } catch (error) {
      console.error('Rapor verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      loadReportData();
    }
  }, [selectedStock]);

  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
      (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (s.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [stocks, searchTerm]);

  const handleExportExcel = () => {
    if (!selectedStock) return;
    const dataToExport = activeTab === 'movements' ? movements.map(m => ({
      'Yıl': m.year,
      'Tarih': m.date,
      'Fiş/İrsaliye No': m.slipNo,
      'İşlem Tipi': m.type,
      'Birim Fiyat': m.price,
      'Giriş Miktarı': m.inQty,
      'Çıkış Miktarı': m.outQty,
      'Net Bakiye': m.balance,
      'Depo Kodu': m.warehouseCode,
      'Cari Ünvanı': m.customerName,
      'Açıklama': m.description
    })) : balances.map(b => ({
      'Depo Kodu': b.warehouseCode,
      'Depo Adı': b.warehouseName,
      'Mevcut Bakiye': b.balance
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'movements' ? "Stok Hareketleri" : "Depo Bakiyeleri");
    XLSX.writeFile(workbook, `Stok_Analiz_${selectedStock.code}_${activeTab}.xlsx`);
  };

  const handleNextStock = () => {
    if (!selectedStock) return;
    const currentIndex = stocks.findIndex(s => s.code === selectedStock.code);
    if (currentIndex < stocks.length - 1) setSelectedStock(stocks[currentIndex + 1]);
  };

  const handlePrevStock = () => {
    if (!selectedStock) return;
    const currentIndex = stocks.findIndex(s => s.code === selectedStock.code);
    if (currentIndex > 0) setSelectedStock(stocks[currentIndex - 1]);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all duration-500 shrink-0 ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            {isSidebarOpen && (
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                     <Box size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-800">Stok Listesi</span>
               </div>
            )}
            <button 
               onClick={() => setSidebarOpen(!isSidebarOpen)}
               className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-200"
            >
               {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
         </div>
         
         {isSidebarOpen && (
            <>
               <div className="p-4 border-b border-slate-100">
                  <div className="relative group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                     <input 
                        type="text" 
                        placeholder="Stok ara..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {stocksLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
                  ) : filteredStocks.map(stock => (
                     <div 
                        key={stock.id || stock.code}
                        onClick={() => setSelectedStock(stock)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 group ${selectedStock?.code === stock.code ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                     >
                        <div className="flex items-center justify-between">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${selectedStock?.code === stock.code ? 'text-indigo-200' : 'text-slate-400'}`}>{stock.code}</span>
                           <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${selectedStock?.code === stock.code ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-100'}`}>{stock.groupCode}</span>
                        </div>
                        <p className="text-xs font-black tracking-tight leading-tight uppercase line-clamp-2">{stock.name}</p>
                     </div>
                  ))}
               </div>
            </>
         )}
         
         {!isSidebarOpen && (
            <div className="flex-1 flex flex-col items-center py-8 gap-6 text-slate-300">
               <Search size={20} />
               <Filter size={20} />
               <div className="w-8 h-[1px] bg-slate-100" />
               <Box size={20} />
            </div>
         )}
      </aside>

      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <History size={24} />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                 <button 
                    onClick={() => setActiveTab('movements')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'movements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >HAREKET LİSTESİ</button>
                 <button 
                    onClick={() => setActiveTab('balances')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'balances' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                 >DEPO BAKİYELERİ</button>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-2">
                 <button 
                    onClick={handlePrevStock}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                    title="Önceki Stok"
                 >
                    <ChevronLeft size={18} />
                 </button>
                 <button 
                    onClick={handleNextStock}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                    title="Sonraki Stok"
                 >
                    <ChevronRight size={18} />
                 </button>
              </div>
              <button 
                onClick={loadReportData}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
              >
                 <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> LİSTELE
              </button>
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                 <FileSpreadsheet size={16} /> EXCEL AKTAR
              </button>
              <div className="w-[1px] h-6 bg-slate-200 mx-1" />
              <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                 <XCircle size={20} />
              </button>
           </div>
        </div>

        <div className="bg-slate-900 px-8 py-4 rounded-3xl text-white flex items-center justify-between relative overflow-hidden shadow-2xl">
           {selectedStock ? (
             <>
               <div className="flex items-center gap-6 relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 backdrop-blur-md border border-white/5">
                     <PackageCheck size={32} />
                  </div>
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Analizi Yapılan Stok</span>
                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{selectedStock.groupCode} GRUBU</span>
                     </div>
                     <div className="flex items-baseline gap-4">
                        <h2 className="text-xl font-black tracking-tight">{selectedStock.name}</h2>
                        <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 bg-white/5 rounded border border-white/10 uppercase">{selectedStock.code}</span>
                     </div>
                  </div>
               </div>
               <div className="text-right relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Genel Bakiye (Net)</p>
                  <div className="flex items-end gap-2 justify-end">
                     <h3 className="text-3xl font-black tracking-tighter text-emerald-400">
                        {movements.length > 0 ? movements[movements.length-1].balance.toLocaleString() : '0'}
                     </h3>
                     <span className="text-xs font-black text-slate-400 mb-1.5">{selectedStock.unit}</span>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 text-center py-4 text-slate-500 font-bold uppercase tracking-widest">Stok Seçiniz</div>
           )}
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Database size={160} />
           </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           
           {activeTab === 'movements' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                       <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Hareket Kayıtları</h3>
                       <div className="h-4 w-[1px] bg-slate-200" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">İşlem Bazı: FİFO / LİFO</span>
                    </div>
                 </div>

                 <div className="flex-1 overflow-auto custom-scrollbar">
                    {loading ? (
                      <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
                    ) : (
                      <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                           <tr>
                              <th className="px-6 py-5 border-r border-white/5 text-center w-16">Yıl</th>
                              <th className="px-6 py-5 border-r border-white/5">Tarih</th>
                              <th className="px-6 py-5 border-r border-white/5">Fiş / İrsaliye</th>
                              <th className="px-6 py-5 border-r border-white/5 text-center">İşlem</th>
                              <th className="px-6 py-5 border-r border-white/5 text-right">Birim Fiyat</th>
                              <th className="px-6 py-5 border-r border-white/5 text-right">Giriş (+)</th>
                              <th className="px-6 py-5 border-r border-white/5 text-right">Çıkış (-)</th>
                              <th className="px-6 py-5 border-r border-white/5 text-right bg-slate-950">Net Bakiye</th>
                              <th className="px-6 py-5">Açıklama / Kaynak</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {movements.map(m => (
                              <tr key={m.id} className="hover:bg-indigo-50/20 transition-all group">
                                 <td className="px-6 py-5 text-center font-bold text-slate-400">{m.year}</td>
                                 <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                                       <Calendar size={14} className="text-slate-300" /> {m.date}
                                    </div>
                                 </td>
                                 <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black font-mono border border-slate-200">{m.slipNo}</span>
                                 </td>
                                 <td className="px-6 py-5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${m.inQty > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                       {m.type}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 text-right font-bold text-slate-600">
                                    {m.price > 0 ? `₺${m.price.toFixed(2)}` : '---'}
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <span className={`text-sm font-black ${m.inQty > 0 ? 'text-emerald-600' : 'text-slate-200'}`}>
                                       {m.inQty > 0 ? `+${m.inQty.toLocaleString()}` : '-'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 text-right">
                                    <span className={`text-sm font-black ${m.outQty > 0 ? 'text-rose-600' : 'text-slate-200'}`}>
                                       {m.outQty > 0 ? `-${m.outQty.toLocaleString()}` : '-'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 text-right bg-slate-50/50">
                                    <span className="text-sm font-black text-indigo-600 tracking-tight">{m.balance.toLocaleString()}</span>
                                 </td>
                                 <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-slate-800 leading-none mb-1 uppercase">{m.customerName}</p>
                                    <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[200px]">{m.description}</p>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                      </table>
                    )}
                 </div>

                 <div className="bg-slate-900 p-8 flex items-center justify-between text-white border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-12">
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Giriş Hacmi</p>
                          <p className="text-xl font-black tracking-tight text-emerald-400">+{movements.reduce((a,b)=>a+b.inQty, 0).toLocaleString()}</p>
                       </div>
                       <div className="w-[1px] h-10 bg-white/10" />
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Toplam Çıkış Hacmi</p>
                          <p className="text-xl font-black tracking-tight text-rose-400">-{movements.reduce((a,b)=>a+b.outQty, 0).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex-1 p-12 animate-in slide-in-from-right-4 duration-500">
                 <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex items-center justify-between shadow-2xl relative overflow-hidden">
                       <div className="flex items-center gap-6 relative z-10">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 backdrop-blur-md">
                             <WarehouseIcon size={32} />
                          </div>
                          <div>
                             <h4 className="text-xl font-black tracking-tight uppercase tracking-widest">Lokal Depo Bakiyeleri</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stok Kartının Dağılım Analizi</p>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {loading ? (
                         <div className="col-span-full flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
                       ) : balances.map((wb, index) => (
                          <div key={wb.id || index} className={`p-6 rounded-[2.5rem] border-2 transition-all group hover:shadow-xl ${wb.balance > 0 ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-300' : 'bg-slate-50 border-slate-100'}`}>
                             <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${wb.balance > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                      <Box size={20} />
                                   </div>
                                   <h5 className="text-sm font-black text-slate-800 uppercase">{wb.warehouseName}</h5>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className={`text-2xl font-black tracking-tight ${wb.balance > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>{wb.balance.toLocaleString()}</span>
                                <span className="text-[10px] font-black text-slate-400 ml-2">{selectedStock?.unit || ''}</span>
                             </div>
                          </div>
                       ))}
                       {!loading && balances.length === 0 && <div className="col-span-full text-center py-10 text-slate-300 font-bold uppercase tracking-widest">Bakiye Verisi Yok</div>}
                    </div>
                 </div>
              </div>
           )}

           <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">FLEX WMS Reporting Engine v4.0</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StockMovementReport;
