
import React, { useState, useMemo } from 'react';
import { 
  Tag, 
  Search, 
  Filter, 
  Box, 
  Printer, 
  X, 
  QrCode, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  FileSpreadsheet,
  XCircle,
  Database,
  Check,
  LayoutList,
  Info,
  Hash,
  Plus
} from 'lucide-react';
import { StockListItem } from '../types';

// Mock data for all stock cards
const allStocks: StockListItem[] = [
  { id: '1', code: 'AL-2020', name: 'Alüminyum Profil 20x20', groupCode: 'HAM', unit: 'ADET' },
  { id: '2', code: 'SMN-M8', name: 'Çelik Somun M8', groupCode: 'BGL', unit: 'ADET' },
  { id: '3', code: 'PL-3030', name: 'Plastik Kapak 30x30', groupCode: 'MML', unit: 'ADET' },
  { id: '4', code: 'BND-45', name: 'Koli Bandı 45mm', groupCode: 'SRF', unit: 'RULO' },
  { id: '5', code: 'PRO-X1', name: 'Özel Seri Şasi Paneli', groupCode: 'MML', unit: 'ADET' },
  { id: '6', code: 'RUL-6202', name: 'Rulman 6202 ZZ', groupCode: 'YED', unit: 'ADET' },
  { id: '7', code: 'KBL-3X15', name: 'Kablo 3x1.5 TTR', groupCode: 'ELK', unit: 'METRE' },
];

const LabelPrinting: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);
  const [labelModal, setLabelModal] = useState({ isOpen: false, item: null as StockListItem | null, qty: 1, count: 1 });

  // Filter stocks for the sidebar list
  const sidebarStocks = useMemo(() => {
    return allStocks.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Items selected to be in the main print grid
  const selectedStocks = useMemo(() => {
    return allStocks.filter(s => selectedStockIds.includes(s.id));
  }, [selectedStockIds]);

  const toggleStockSelection = (id: string) => {
    setSelectedStockIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedStockIds(sidebarStocks.map(s => s.id));
  };

  const handleClearSelection = () => {
    setSelectedStockIds([]);
  };

  const openModal = (item: StockListItem) => {
    setLabelModal({ isOpen: true, item, qty: 1, count: 1 });
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden text-slate-900">
      
      {/* SIDEBAR: PRODUCT FILTER & SELECTION (As in InventoryCountList) */}
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-16'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          {isSidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Filter size={18} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-800">Ürün Filtrele</span>
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
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 space-y-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="Kod veya isim ara..." 
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleSelectAll}
                  className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                >Tümünü Seç</button>
                <button 
                  onClick={handleClearSelection}
                  className="flex-1 py-2 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200"
                >Temizle</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 bg-slate-50/20">
              {sidebarStocks.map(stock => {
                const isSelected = selectedStockIds.includes(stock.id);
                return (
                  <div 
                    key={stock.id}
                    onClick={() => toggleStockSelection(stock.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 group ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{stock.code}</span>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-100'}`}>
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                    <p className="text-xs font-black tracking-tight leading-tight uppercase line-clamp-1">{stock.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Tag size={24} />
            </div>
            <div>
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Basılacak Etiket Listesi</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Seçili Ürünler & Barkod Ayarları</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95">
              <RotateCcw size={16} /> Yenile
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
              <Printer size={16} className="text-indigo-600" /> Toplu Yazdır
            </button>
            <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
              <XCircle size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                       <th className="px-8 py-5 border-r border-white/5">Stok Kodu</th>
                       <th className="px-8 py-5 border-r border-white/5">Stok Adı</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Grup</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Birim</th>
                       <th className="px-8 py-5 text-right w-32">İşlem</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {selectedStocks.map((item) => (
                       <tr key={item.id} className="hover:bg-indigo-50/10 transition-all group animate-in slide-in-from-right-2">
                          <td className="px-8 py-5 font-mono text-xs font-black text-indigo-600 uppercase">
                             {item.code}
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-xs font-black text-slate-800 uppercase">{item.name}</p>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase border border-slate-200">{item.groupCode}</span>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button 
                                onClick={() => openModal(item)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-indigo-600 transition-all active:scale-90 shadow-md"
                             >
                                <Printer size={14} /> ETİKET
                             </button>
                          </td>
                       </tr>
                    ))}
                    {selectedStocks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center text-slate-300">
                          <div className="flex flex-col items-center gap-4 opacity-50">
                             <Tag size={64} />
                             <p className="text-xs font-black uppercase tracking-widest">Basılacak Ürün Seçilmedi</p>
                             <p className="text-[10px] font-medium">Sol taraftaki listeden seçim yaparak devam edebilirsiniz.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
           
           <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex items-center justify-between shrink-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Seçili Kayıt: {selectedStocks.length}</p>
              <div className="flex items-center gap-1">
                 <button className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-20"><ChevronLeft size={20} /></button>
                 <button className="w-8 h-8 bg-indigo-600 text-white rounded-lg text-[10px] font-black shadow-lg">1</button>
                 <button className="p-2 text-slate-400 hover:text-indigo-600"><ChevronRight size={20} /></button>
              </div>
           </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-4">
           <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <Info size={20} />
           </div>
           <div className="space-y-1">
              <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest leading-none">Etiketleme Bilgisi</h4>
              <p className="text-xs text-blue-600/80 leading-relaxed font-medium">QR kodlar yalnızca ürünün <b>stok kodunu</b> içerecek şekilde oluşturulur. Baskı boyutu 30mm x 100mm standart ölçülerdedir. Basılan her etiket otomatik olarak "Etiket Basım Listesi" raporuna eklenir.</p>
           </div>
        </div>
      </div>

      {/* LABEL PRINT MODAL (Parametric Input & 30x100mm Preview) */}
      {labelModal.isOpen && labelModal.item && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in duration-300">
               
               <div className="flex-1 p-10 space-y-8 border-r border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                           <Printer size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Etiket Yazdır</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Parametre Belirleyin</p>
                        </div>
                     </div>
                     <button onClick={() => setLabelModal({ ...labelModal, isOpen: false, item: null })} className="p-2.5 bg-white rounded-2xl text-slate-400 hover:text-rose-500 border border-slate-200 shadow-sm transition-all">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Seçili Stok</p>
                        <h4 className="text-sm font-black text-slate-800 uppercase leading-tight">{labelModal.item.name}</h4>
                        <p className="text-[10px] font-black text-indigo-600 font-mono tracking-widest">{labelModal.item.code}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">İçerik Miktarı</label>
                           <div className="relative">
                              <input 
                                 type="number" 
                                 className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-center text-slate-800 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                 value={labelModal.qty}
                                 onChange={(e) => setLabelModal({ ...labelModal, qty: parseFloat(e.target.value) || 0 })}
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">{labelModal.item.unit}</div>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Yazım Adedi (Kopya)</label>
                           <input 
                              type="number" 
                              className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xl font-black text-center text-slate-800 focus:border-indigo-500 outline-none transition-all shadow-inner"
                              value={labelModal.count}
                              onChange={(e) => setLabelModal({ ...labelModal, count: parseInt(e.target.value) || 0 })}
                           />
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-4 mt-4">
                     <Printer size={20} /> BASKIYI BAŞLAT
                  </button>
               </div>

               <div className="w-full lg:w-[350px] bg-slate-900 p-10 flex flex-col items-center justify-center gap-8">
                  <div className="text-center space-y-1">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">30x100mm ÖNİZLEME</p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Sanal Baskı Şablonu</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ width: '120px', height: '320px', padding: '12px' }}>
                     <div className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-slate-900 border-dashed rounded-md p-2">
                        <div className="w-16 h-16 bg-slate-900 flex items-center justify-center rounded-sm">
                           <QrCode size={48} className="text-white" />
                        </div>
                        
                        <div className="text-center space-y-2">
                           <p className="text-slate-900 uppercase font-black break-words px-1 text-[7px] leading-tight">
                              {labelModal.item.name}
                           </p>
                           <div className="h-[1px] bg-slate-900 w-full" />
                           <p className="text-slate-900 font-mono font-black text-[9px] tracking-widest">
                              {labelModal.item.code}
                           </p>
                        </div>

                        <div className="mt-auto w-full text-center">
                           <p className="text-[14px] font-black text-slate-900 leading-none">
                              {labelModal.qty.toLocaleString()}
                           </p>
                           <p className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">MİKTAR / {labelModal.item.unit}</p>
                        </div>

                        <div className="w-full h-4 bg-slate-100 flex items-center justify-center rounded">
                           <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.2em]">FLEX WMS</p>
                        </div>
                     </div>
                  </div>

                  <div className="text-center space-y-2">
                     <div className="flex items-center gap-2 text-emerald-400 justify-center">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">QR VERİSİ: {labelModal.item.code}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LabelPrinting;
