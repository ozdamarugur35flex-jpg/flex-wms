
import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Database, 
  Grid3X3, 
  Filter, 
  CheckCircle2, 
  History, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal, 
  Box, 
  ArrowRightCircle, 
  Hash, 
  Info,
  Calendar,
  User,
  Truck,
  RefreshCcw,
  BadgeAlert,
  Maximize2,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SerialBalanceItem {
  id: string;
  stockCode: string;
  stockName: string;
  unit: string;
  warehouseCode: string;
  cellCode: string;
  serialNo: string;
  balance: number;
  shelfLife?: string;
  recordedBy: string;
  recordedAt: string;
  supplier: string;
  variant: string;
  width: number;
  height: number;
  thickness: number;
  groupCode: string;
  refreshDate: string;
}

const mockData: SerialBalanceItem[] = [
  { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', unit: 'ADET', warehouseCode: '100', cellCode: 'A-01-01', serialNo: 'SR-2024-X01', balance: 450, shelfLife: '2025-12-31', recordedBy: 'Mustafa A.', recordedAt: '2024-03-20 14:30', supplier: 'Aksoy Metal', variant: 'Standart', width: 20, height: 2000, thickness: 2, groupCode: 'HAMMADDE', refreshDate: '2024-03-21' },
  { id: '2', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', unit: 'ADET', warehouseCode: '100', cellCode: 'A-01-05', serialNo: 'SR-2024-X02', balance: 120, shelfLife: '2025-12-31', recordedBy: 'Ahmet Y.', recordedAt: '2024-03-21 10:15', supplier: 'Aksoy Metal', variant: 'Standart', width: 20, height: 2000, thickness: 2, groupCode: 'HAMMADDE', refreshDate: '2024-03-21' },
  { id: '3', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', unit: 'ADET', warehouseCode: '100', cellCode: 'B-10-12', serialNo: 'SR-2024-S99', balance: 5000, shelfLife: '2027-01-01', recordedBy: 'Mustafa A.', recordedAt: '2024-03-18 09:00', supplier: 'Civata Dünyası', variant: 'Galvaniz', width: 8, height: 0, thickness: 0, groupCode: 'BAĞLANTI', refreshDate: '2024-03-20' },
  { id: '4', stockCode: 'YM-001', stockName: 'Ön Panel Montajı', unit: 'ADET', warehouseCode: '100', cellCode: 'C-05-01', serialNo: 'SR-YM-55', balance: 25, recordedBy: 'Zeynep K.', recordedAt: '2024-03-21 16:00', supplier: 'Dahili Üretim', variant: 'Yarı Mamul', width: 400, height: 600, thickness: 50, groupCode: 'YARI MAMUL', refreshDate: '2024-03-21' },
  { id: '5', stockCode: 'PL-3030', stockName: 'Plastik Kapak', unit: 'ADET', warehouseCode: '02', cellCode: 'D-01-01', serialNo: 'SR-P-11', balance: 100, recordedBy: 'Mustafa A.', recordedAt: '2024-03-20 11:00', supplier: 'Global Plastik', variant: 'PVC', width: 30, height: 30, thickness: 2, groupCode: 'MAMUL', refreshDate: '2024-03-20' },
];

const SerialWarehouseBalance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unit' | 'serial'>('unit');
  const [searchTerm, setSearchTerm] = useState('');
  const [hideSemiFinished, setHideSemiFinished] = useState(true);

  const filteredData = useMemo(() => {
    return mockData.filter(item => {
      const isDepo100 = item.warehouseCode === '100';
      const isNotYM = hideSemiFinished ? item.groupCode !== 'YARI MAMUL' : true;
      const matchesSearch = item.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.stockCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.serialNo.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isDepo100 && isNotYM && matchesSearch;
    });
  }, [searchTerm, hideSemiFinished]);

  const unitBasedData = useMemo(() => {
    const groups: Record<string, { stockCode: string, stockName: string, balance: number, unit: string, groupCode: string }> = {};
    filteredData.forEach(item => {
      if (!groups[item.stockCode]) {
        groups[item.stockCode] = { stockCode: item.stockCode, stockName: item.stockName, balance: 0, unit: item.unit, groupCode: item.groupCode };
      }
      groups[item.stockCode].balance += item.balance;
    });
    return Object.values(groups);
  }, [filteredData]);

  const handleExportExcel = () => {
    const dataToExport = activeTab === 'unit' ? unitBasedData : filteredData;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seri Bakiyeler");
    XLSX.writeFile(workbook, `Seri_Depo_Bakiyeleri_${activeTab}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Seri Depo Bakiye Listesi</h1>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DEPO 100 - ÖZEL ANALİZ</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className="text-indigo-600" /> Listele
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all active:scale-95">
             <RefreshCcw size={16} /> Stok Sıfırla
          </button>
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('unit')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'unit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Box size={16} /> STOK BİRİM BAZINDA
        </button>
        <button 
          onClick={() => setActiveTab('serial')}
          className={`flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'serial' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Hash size={16} /> SERİ BİRİM BAZINDA
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
         <div className="md:col-span-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Stok adı, kod veya seri no ara..." 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="md:col-span-4 flex items-center gap-4 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-200 group cursor-pointer" onClick={() => setHideSemiFinished(!hideSemiFinished)}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hideSemiFinished ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 border border-slate-200'}`}>
               <Filter size={18} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grup Filtresi (chkYM)</p>
               <p className="text-xs font-black text-slate-700">{hideSemiFinished ? 'YARI MAMULLER GİZLENDİ' : 'TÜM GRUPLAR LİSTELENİYOR'}</p>
            </div>
            <div className="ml-auto">
               <div className={`w-10 h-5 rounded-full relative transition-all ${hideSemiFinished ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hideSemiFinished ? 'left-5.5' : 'left-0.5'}`} />
               </div>
            </div>
         </div>

         <div className="md:col-span-4 bg-slate-900 px-6 py-4 rounded-2xl text-white flex items-center justify-between">
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Toplam Kayıt</p>
               <h4 className="text-xl font-black text-indigo-400 leading-none">{filteredData.length} <span className="text-[10px]">SERİ</span></h4>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="text-right">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Konsolide Bakiye</p>
               <h4 className="text-xl font-black text-emerald-400 leading-none">{filteredData.reduce((a,b) => a + b.balance, 0).toLocaleString()} <span className="text-[10px]">ADET</span></h4>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
         {activeTab === 'unit' ? (
            <div className="overflow-x-auto animate-in slide-in-from-left-4 duration-500">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-200 h-16">
                        <th className="px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Stok / Ürün Bilgisi</th>
                        <th className="px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Grup</th>
                        <th className="px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Birim</th>
                        <th className="px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Toplam Bakiye</th>
                        <th className="px-8 text-right w-16"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {unitBasedData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/10 transition-colors group">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                                    <Box size={20} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{item.stockName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono font-bold">{item.stockCode}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${item.groupCode === 'HAMMADDE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                 {item.groupCode}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <span className="text-xs font-black text-slate-500 uppercase">{item.unit}</span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <div className="inline-flex flex-col items-end px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                                 <p className="text-lg font-black text-indigo-600 leading-none">{item.balance.toLocaleString()}</p>
                                 <p className="text-[8px] font-black text-indigo-400 uppercase mt-1">KONSOLİDE</p>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><ArrowRightCircle size={20} /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="overflow-x-auto animate-in slide-in-from-right-4 duration-500">
               <table className="w-full text-left border-collapse min-w-[1500px]">
                  <thead>
                     <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-8 py-5 border-r border-white/5 sticky left-0 z-10 bg-slate-950">Seri Numarası</th>
                        <th className="px-8 py-5 border-r border-white/5">Stok Bilgisi</th>
                        <th className="px-8 py-5 border-r border-white/5 text-center">Hücre</th>
                        <th className="px-8 py-5 border-r border-white/5 text-right">Bakiye</th>
                        <th className="px-8 py-5 border-r border-white/5 text-center">Raf Ömrü</th>
                        <th className="px-8 py-5 border-r border-white/5">Tedarikçi</th>
                        <th className="px-8 py-5 border-r border-white/5 text-center">Yenilenme</th>
                        <th className="px-8 py-5 text-right">Etiket Detay</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredData.map(item => (
                        <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group">
                           <td className="px-8 py-5 sticky left-0 z-10 bg-white group-hover:bg-indigo-50 transition-colors shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-400 border border-indigo-100">
                                    <Hash size={16} />
                                 </div>
                                 <span className="text-xs font-black font-mono tracking-tight uppercase text-indigo-600">{item.serialNo}</span>
                              </div>
                           </td>
                           <td className="px-8 py-5">
                              <p className="text-xs font-black text-slate-800 leading-none mb-1 uppercase">{item.stockName}</p>
                              <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-slate-400 font-mono font-bold">{item.stockCode}</span>
                                 <span className="text-[9px] px-1 bg-slate-50 text-slate-400 rounded border border-slate-100 font-bold uppercase">{item.groupCode}</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 text-[10px] font-black">
                                 <Grid3X3 size={12} /> {item.cellCode}
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <div className="inline-flex flex-col items-end">
                                 <span className="text-sm font-black text-slate-800">{item.balance.toLocaleString()}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase">{item.unit}</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <div className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                 <Clock size={12} className="text-slate-300" /> {item.shelfLife || 'SÜRESİZ'}
                              </div>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                 <Truck size={12} className="text-slate-300" /> {item.supplier}
                              </div>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <div className="inline-flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                 <CheckCircle2 size={12} /> {item.refreshDate}
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                 <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{item.recordedBy}</p>
                                    <p className="text-[8px] font-bold text-slate-400">{item.recordedAt}</p>
                                 </div>
                                 <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={18} /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Rapor Motoru: AKTİF (Warehouse 100)</span>
               </div>
               <div className="h-4 w-[1px] bg-slate-200" />
               <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Toplam Kalem</span>
                    <p className="text-xs font-black text-slate-700 leading-none">{filteredData.length}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Net Bakiye</span>
                    <p className="text-xs font-black text-indigo-600 leading-none">{filteredData.reduce((a,b) => a+b.balance, 0).toLocaleString()} <span className="text-[8px]">ADET</span></p>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="p-2 hover:text-indigo-600 disabled:opacity-30 transition-colors" disabled><ChevronLeft size={18} /></button>
               <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shadow-md">1</div>
               <button className="p-2 hover:text-indigo-600 transition-colors"><ChevronRight size={18} /></button>
            </div>
         </div>
      </div>

      <div className="bg-sky-50 p-6 rounded-[2.5rem] border border-sky-100 flex items-start gap-4 shadow-sm">
         <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600 shrink-0">
            <Info size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="text-xs font-black text-sky-800 uppercase tracking-widest leading-none mb-1">Rapor Bilgilendirmesi</h4>
            <p className="text-xs text-sky-600/80 leading-relaxed font-medium">Bu rapor, **sadece Depo 100** üzerindeki hareketleri ve mevcut seri bazlı stok dağılımını gösterir. "Yenilenme Tarihi" kolonu, serinin en son ne zaman bir hareket gördüğünü veya sayıldığını ifade eder. Excel aktarımı yaparken sadece filtrelenmiş veriler dışarı aktarılır.</p>
         </div>
      </div>
    </div>
  );
};

export default SerialWarehouseBalance;
