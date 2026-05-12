
import React, { useState, useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Tag, 
  Search, 
  Filter, 
  Box, 
  Printer, 
  X, 
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
  Plus,
  Settings2,
  Image as ImageIcon
} from 'lucide-react';
import { apiService } from '../api';
import { StockListItem } from '../types';

const LabelPrinting: React.FC = () => {
  const [stocks, setStocks] = useState<StockListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDesignPanelOpen, setDesignPanelOpen] = useState(false);
  const [selectedStockIds, setSelectedStockIds] = useState<string[]>([]);
  const [labelModal, setLabelModal] = useState({ isOpen: false, item: null as StockListItem | null, qty: 1, count: 1 });

  const handlePrint = () => {
    window.print();
  };

  // Load stocks from API
  React.useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      const data = await apiService.stocks.getAll();
      if (data && data.length > 0) {
        setStocks(data.map((s: any) => ({
          id: s.id || s.code,
          code: s.code,
          name: s.name,
          groupCode: s.groupCode,
          unit: s.unit1 || 'ADET',
          barcode: s.barcode1 || s.barcode || ''
        })));
      } else {
        // Fallback to mock data with barcodes if API fails/empty
        setStocks([
          { id: '1', code: 'AL-2020', name: 'Alüminyum Profil 20x20', groupCode: 'HAM', unit: 'ADET', barcode: '869123456001' },
          { id: '2', code: 'SMN-M8', name: 'Çelik Somun M8', groupCode: 'BGL', unit: 'ADET', barcode: '869123456002' },
          { id: '3', code: 'PL-3030', name: 'Plastik Kapak 30x30', groupCode: 'MML', unit: 'ADET', barcode: '869123456003' },
          { id: '4', code: 'BND-45', name: 'Koli Bandı 45mm', groupCode: 'SRF', unit: 'RULO', barcode: '869123456004' },
          { id: '5', code: 'PRO-X1', name: 'Özel Seri Şasi Paneli', groupCode: 'MML', unit: 'ADET', barcode: '869123456005' },
        ]);
      }
      setLoading(false);
    };
    loadStocks();
  }, []);

  const [designSettings, setDesignSettings] = useState({
    width: 70, // mm
    height: 50, // mm
    logoUrl: 'https://i.hizliresim.com/qzmivwf.png',
    showLogo: true,
    showBarcode: true,
    showStockName: true,
    showStockCode: true,
    orientation: 'landscape' as 'landscape' | 'portrait',
    title: 'Ürün Etiketi'
  });

  // Filter stocks for the sidebar list
  const sidebarStocks = useMemo(() => {
    return stocks.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.barcode && s.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, stocks]);

  // Items selected to be in the main print grid
  const selectedStocks = useMemo(() => {
    return stocks.filter(s => selectedStockIds.includes(s.id));
  }, [selectedStockIds, stocks]);

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
    <>
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
                    {stock.barcode && <p className="text-[9px] font-bold text-indigo-300 tracking-widest">{stock.barcode}</p>}
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
            <button 
              onClick={() => setDesignPanelOpen(!isDesignPanelOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDesignPanelOpen ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
            >
              <Settings2 size={16} /> TASARIM MENÜSÜ
            </button>
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
           {isDesignPanelOpen && (
             <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-slate-200 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] flex flex-col animate-in slide-in-from-right duration-300">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-amber-100">
                     <Settings2 size={18} />
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest text-slate-800">Tasarım Ayarları</span>
                 </div>
                 <button onClick={() => setDesignPanelOpen(false)} className="p-1.5 hover:bg-white rounded-lg text-slate-400 border border-transparent hover:border-slate-200">
                   <X size={20} />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ImageIcon size={14} className="text-amber-500" /> Logo ve Ölçü
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Logo URL</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white"
                          value={designSettings.logoUrl}
                          onChange={(e) => setDesignSettings({...designSettings, logoUrl: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Genişlik (mm)</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white"
                            value={designSettings.width}
                            onChange={(e) => setDesignSettings({...designSettings, width: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Yükseklik (mm)</label>
                          <input 
                            type="number" 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white"
                            value={designSettings.height}
                            onChange={(e) => setDesignSettings({...designSettings, height: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <LayoutList size={14} className="text-indigo-500" /> Görünürlük ve Yönlendirme
                    </p>
                    <div className="space-y-2">
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                        <button 
                          onClick={() => setDesignSettings({...designSettings, orientation: 'landscape', width: 70, height: 50})}
                          className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${designSettings.orientation === 'landscape' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          Yatay (70x50)
                        </button>
                        <button 
                          onClick={() => setDesignSettings({...designSettings, orientation: 'portrait', width: 50, height: 70})}
                          className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${designSettings.orientation === 'portrait' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          Dikey (50x70)
                        </button>
                      </div>

                      <button 
                        onClick={() => setDesignSettings({...designSettings, showLogo: !designSettings.showLogo})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${designSettings.showLogo ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider">Logoyu Göster</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${designSettings.showLogo ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                          {designSettings.showLogo && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                      <button 
                        onClick={() => setDesignSettings({...designSettings, showBarcode: !designSettings.showBarcode})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${designSettings.showBarcode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider">Barcode/QR Göster</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${designSettings.showBarcode ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                          {designSettings.showBarcode && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                      <button 
                        onClick={() => setDesignSettings({...designSettings, showStockName: !designSettings.showStockName})}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${designSettings.showStockName ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider">Stok Adı Göster</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${designSettings.showStockName ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                          {designSettings.showStockName && <Check size={10} className="text-white" />}
                        </div>
                      </button>
                    </div>
                 </div>

                 <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Tasarım İpucu</p>
                    <p className="text-[10px] font-medium leading-relaxed opacity-70">
                      Girdiğiniz ölçüler (mm) önizleme ekranındaki kartın oranlarını belirler. 5x7cm için 70mm genişlik ve 50mm yükseklik önerilir.
                    </p>
                 </div>
               </div>
             </div>
           )}
           <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                 <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                    <tr>
                       <th className="px-8 py-5 border-r border-white/5">Stok Kodu</th>
                       <th className="px-8 py-5 border-r border-white/5 text-center">Barkod</th>
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
                          <td className="px-8 py-5 text-center font-mono text-[10px] font-bold text-slate-500 tracking-widest leading-none">
                             {item.barcode || <span className="opacity-20">-</span>}
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
              <p className="text-xs text-blue-600/80 leading-relaxed font-medium">Baskı boyutu varsayılan olarak 50mm x 70mm yatay ölçülerdedir. Tasarım menüsünden logo, barkod ve metin görünürlüğünü özelleştirebilirsiniz. Basılan her etiket otomatik olarak arşive eklenir.</p>
           </div>
        </div>
      </div>

      {/* LABEL PRINT MODAL (Parametric Input & Dynamic Preview) */}
      {labelModal.isOpen && labelModal.item && (
         <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in zoom-in duration-300">
               
               <div className="flex-1 p-10 space-y-8 border-r border-slate-100 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                           <Printer size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Etiket Yazdır</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Baskı Parametreleri</p>
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
                        <div className="flex gap-4 items-center">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Stok Kodu</p>
                              <p className="text-[10px] font-black text-indigo-600 font-mono tracking-widest">{labelModal.item.code}</p>
                           </div>
                           {labelModal.item.barcode && (
                              <div>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Barkod</p>
                                 <p className="text-[10px] font-black text-emerald-600 font-mono tracking-widest">{labelModal.item.barcode}</p>
                              </div>
                           )}
                        </div>
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

                  <button 
                    onClick={handlePrint}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-4 mt-4"
                  >
                     <Printer size={20} /> BASKIYI BAŞLAT
                  </button>
               </div>

               <div className="w-full lg:w-[500px] bg-slate-900 p-10 flex flex-col items-center justify-center gap-8 overflow-hidden">
                  <div className="text-center space-y-1">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{designSettings.width}x{designSettings.height}mm ÖNİZLEME</p>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{designSettings.orientation === 'landscape' ? 'Yatay' : 'Dikey'} Etiket Tasarımı</p>
                  </div>

                  {/* Dynamic Label Preview */}
                  <div 
                    className="bg-white shadow-2xl flex flex-col transition-all duration-500 overflow-hidden" 
                    style={{ 
                      width: `${designSettings.width * 5.5}px`, 
                      height: `${designSettings.height * 5.5}px`, 
                      padding: '16px',
                      maxWidth: '100%',
                      borderRadius: '4px'
                    }}
                  >
                     <div className="flex-1 flex flex-col border border-slate-200 p-3 relative">
                        {designSettings.showLogo && (
                          <div className={`flex justify-between items-start ${designSettings.orientation === 'portrait' ? 'mb-4' : 'mb-2'}`}>
                             <img src={designSettings.logoUrl} alt="logo" className={`${designSettings.orientation === 'portrait' ? 'h-8' : 'h-10'} object-contain`} referrerPolicy="no-referrer" />
                             <div className="text-right">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">REF NO</p>
                                <p className="text-[9px] font-black text-slate-900 font-mono tracking-tighter">#{labelModal.item.code.split('-')[0]}-2026</p>
                             </div>
                          </div>
                        )}
                        
                        <div className={`flex-1 flex ${designSettings.orientation === 'portrait' ? 'flex-col justify-center items-center gap-3 text-center' : 'flex-row items-center gap-6'}`}>
                           {designSettings.showBarcode && (
                             <div className={`${designSettings.orientation === 'portrait' ? 'w-24 h-24 mb-2' : 'w-24 h-24'} bg-white flex flex-col items-center justify-center shrink-0 border border-slate-100 p-1`}>
                                <QRCodeCanvas 
                                  value={labelModal.item.barcode || labelModal.item.code} 
                                  size={designSettings.orientation === 'portrait' ? 80 : 70}
                                  level="M"
                                  includeMargin={false}
                                />
                                <p className="text-[7px] font-black mt-1 text-slate-400 font-mono leading-none tracking-tighter">{labelModal.item.barcode || labelModal.item.code}</p>
                             </div>
                           )}
                           
                           <div className={`flex-1 flex flex-col justify-between py-1 ${designSettings.orientation === 'portrait' ? 'w-full' : ''}`}>
                              <div>
                                {designSettings.showStockName && (
                                  <p className={`text-slate-900 uppercase font-black leading-tight mb-1 ${designSettings.orientation === 'portrait' ? 'text-[13px] line-clamp-2' : 'text-[12px] line-clamp-1'}`}>
                                     {labelModal.item.name}
                                  </p>
                                )}
                                <div className="h-[2px] bg-indigo-600 w-full mb-1" />
                                <div className={`flex flex-col gap-1 ${designSettings.orientation === 'portrait' ? 'items-center' : ''}`}>
                                   {designSettings.showStockCode && (
                                     <p className="text-slate-900 font-mono font-black text-[11px] tracking-[0.2em] bg-slate-50 px-2 py-0.5 rounded border border-slate-100 inline-block">
                                        KOD: {labelModal.item.code}
                                     </p>
                                   )}
                                   {labelModal.item.barcode && (
                                     <p className="text-emerald-700 font-mono font-black text-[11px] tracking-[0.1em] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block">
                                        BRC: {labelModal.item.barcode}
                                     </p>
                                   )}
                                </div>
                              </div>
                           </div>
                        </div>

                              <div className="flex items-end justify-between mt-auto">
                                 <div>
                                    <p className="text-[6px] font-bold text-slate-400 uppercase tracking-tighter">NET MİKTAR</p>
                                    <p className="text-[20px] font-black text-slate-900 leading-none">
                                       {labelModal.qty.toLocaleString()} <span className="text-[10px] text-indigo-600">{labelModal.item.unit}</span>
                                    </p>
                                 </div>
                                 <div className="text-right px-2 py-1 bg-slate-900 rounded">
                                    <p className="text-[7px] font-black text-white uppercase tracking-[0.2em]">FLEX WMS</p>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="text-center space-y-4">
                     <div className="flex items-center gap-2 text-emerald-400 justify-center">
                        <CheckCircle2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">SİSTEM ONAYLI TASARIM</span>
                     </div>
                     <p className="text-[9px] text-slate-500 font-medium max-w-[200px] leading-relaxed">
                        Bu etiket {designSettings.width}x{designSettings.height}mm {designSettings.orientation === 'landscape' ? 'yatay' : 'dikey'} termal yazıcı standartlarına uygun olarak optimize edilmiştir.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>

    {/* PRINT ONLY SECTION - Updated for Portrait support */}
    <div id="print-area" className="hidden print:block bg-white">
      {labelModal.item && Array.from({ length: labelModal.count }).map((_, idx) => (
        <div 
          key={idx} 
          className="print-label flex flex-col border border-slate-100 relative overflow-hidden" 
          style={{ 
            width: `${designSettings.width}mm`, 
            height: `${designSettings.height}mm`,
            padding: '4mm',
            pageBreakAfter: 'always'
          }}
        >
          <div className="flex-1 flex flex-col border border-slate-200 p-2 relative h-full">
            {designSettings.showLogo && (
              <div className={`flex justify-between items-start ${designSettings.orientation === 'portrait' ? 'mb-2' : 'mb-1'}`}>
                <img src={designSettings.logoUrl} alt="logo" className={`${designSettings.orientation === 'portrait' ? 'h-6' : 'h-8'} object-contain`} referrerPolicy="no-referrer" />
                <div className="text-right">
                  <p className="text-[5pt] font-bold text-slate-400 uppercase">REF NO</p>
                  <p className="text-[7pt] font-bold text-slate-900 font-mono tracking-tighter">#{labelModal.item?.code.split('-')[0]}-2026</p>
                </div>
              </div>
            )}
            
            <div className={`flex-1 flex h-full ${designSettings.orientation === 'portrait' ? 'flex-col justify-center items-center gap-2 text-center' : 'flex-row items-center gap-4'}`}>
              {designSettings.showBarcode && (
                <div className={`${designSettings.orientation === 'portrait' ? 'w-20 h-20 mb-1' : 'w-16 h-16'} bg-white flex flex-col items-center justify-center shrink-0 border border-slate-100 p-1`}>
                  <QRCodeCanvas 
                    value={labelModal.item?.barcode || labelModal.item?.code || ''} 
                    size={designSettings.orientation === 'portrait' ? 65 : 50}
                    level="M"
                    includeMargin={false}
                  />
                  <p className="text-[5pt] font-bold mt-0.5 text-slate-400 font-mono tracking-tighter leading-none">
                    {labelModal.item?.barcode || labelModal.item?.code}
                  </p>
                </div>
              )}
              
              <div className={`flex-1 flex flex-col justify-between py-0.5 ${designSettings.orientation === 'portrait' ? 'w-full' : ''}`}>
                <div>
                  {designSettings.showStockName && (
                    <p className={`text-slate-900 uppercase font-bold leading-tight line-clamp-1 mb-1 ${designSettings.orientation === 'portrait' ? 'text-[9pt]' : 'text-[8pt]'}`}>
                      {labelModal.item?.name}
                    </p>
                  )}
                  <div className="h-[1pt] bg-indigo-600 w-full mb-1" />
                  <div className={`flex flex-col gap-0.5 ${designSettings.orientation === 'portrait' ? 'items-center' : ''}`}>
                    {designSettings.showStockCode && (
                      <p className="text-slate-900 font-mono font-bold text-[7pt] tracking-[0.1em] bg-slate-50 px-1 py-0.5 rounded border border-slate-100 inline-block">
                        KOD: {labelModal.item?.code}
                      </p>
                    )}
                    {(labelModal.item as any)?.barcode && (
                      <p className="text-emerald-700 font-mono font-bold text-[7pt] tracking-[0.05em] bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 inline-block">
                        BRC: {(labelModal.item as any)?.barcode}
                      </p>
                    )}
                  </div>
                </div>

                <div className={`flex items-end justify-between mt-auto ${designSettings.orientation === 'portrait' ? 'pt-2' : ''}`}>
                  <div className={designSettings.orientation === 'portrait' ? 'text-left' : ''}>
                    <p className="text-[5pt] font-bold text-slate-400 uppercase tracking-tighter">NET MİKTAR</p>
                    <p className="text-[14pt] font-black text-slate-900 leading-none">
                      {labelModal.qty.toLocaleString()} <span className="text-[7pt] text-indigo-600">{labelModal.item?.unit}</span>
                    </p>
                  </div>
                  <div className="text-right px-1 py-0.5 bg-slate-900 rounded">
                    <p className="text-[5pt] font-bold text-white uppercase tracking-[0.1em]">FLEX WMS</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default LabelPrinting;
