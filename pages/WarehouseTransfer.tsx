
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Save, 
  Trash2, 
  RotateCcw, 
  XCircle, 
  Warehouse as WarehouseIcon, 
  Grid3X3, 
  Box, 
  Hash, 
  LayoutList, 
  Search, 
  ArrowRightCircle, 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight,
  MoreHorizontal,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  History,
  LayoutGrid
} from 'lucide-react';
import { SerialStockItem, WarehouseTransferLine } from '../types';

const mockSerialStock: SerialStockItem[] = [
  { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', serialNo: 'SR-2024-X01', warehouseCode: '01', cellCode: 'A-01-01', balance: 450, unit: 'ADET' },
  { id: '2', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', serialNo: 'SR-2024-X02', warehouseCode: '01', cellCode: 'A-01-01', balance: 120, unit: 'ADET' },
  { id: '3', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', serialNo: 'SR-2024-S12', warehouseCode: '02', cellCode: 'B-05-12', balance: 5000, unit: 'ADET' },
  { id: '4', stockCode: 'PL-3030', stockName: 'Plastik Kapak 30x30', serialNo: 'SR-2024-P99', warehouseCode: '01', cellCode: 'A-02-05', balance: 250, unit: 'ADET' },
];

const WarehouseTransfer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [sourceWarehouse, setSourceWarehouse] = useState('01');
  const [targetWarehouse, setTargetWarehouse] = useState('02');
  const [sourceCell, setSourceCell] = useState('A-01-01');
  const [targetCell, setTargetCell] = useState('B-05-12');
  
  const [availableStock, setAvailableStock] = useState<SerialStockItem[]>(mockSerialStock);
  const [selectedForTransfer, setSelectedForTransfer] = useState<SerialStockItem[]>([]);
  const [searchInAvailable, setSearchInAvailable] = useState('');

  // Single Transfer Form State
  const [singleTransfer, setSingleTransfer] = useState({
    serialNo: '',
    stockCode: '',
    stockName: '---',
    balance: 0,
    qty: 0,
    unit: 'ADET'
  });

  const handleMoveToTransfer = (item: SerialStockItem) => {
    setSelectedForTransfer([...selectedForTransfer, item]);
    setAvailableStock(availableStock.filter(i => i.id !== item.id));
  };

  const handleMoveBack = (item: SerialStockItem) => {
    setAvailableStock([...availableStock, item]);
    setSelectedForTransfer(selectedForTransfer.filter(i => i.id !== item.id));
  };

  const filteredAvailable = availableStock.filter(i => 
    i.warehouseCode === sourceWarehouse && 
    (i.serialNo.toLowerCase().includes(searchInAvailable.toLowerCase()) || 
     i.stockName.toLowerCase().includes(searchInAvailable.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Hızlı Depolar Arası Transfer</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Depo İçi Lokasyon & DAT Modülü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-indigo-600" /> Yeni İşlem
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            <Save size={16} /> Transferi Onayla
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
             <History size={16} className="text-sky-600" /> Geçmiş
          </button>
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* WAREHOUSE CONTEXT (GroupControl2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
         <div className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 group hover:border-rose-200 transition-all">
            <div className="flex items-center justify-between border-b border-rose-50 pb-3">
               <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <WarehouseIcon size={14} /> Kaynak Lokasyon (SOURCE)
               </h3>
               <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black rounded uppercase border border-rose-100">STOK ÇIKACAK</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kaynak Depo</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-rose-500 appearance-none"
                    value={sourceWarehouse}
                    onChange={(e) => setSourceWarehouse(e.target.value)}
                  >
                     <option value="01">01 - MERKEZ DEPO</option>
                     <option value="02">02 - ÜRETİM</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Kaynak Hücre</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-rose-500"
                    value={sourceCell}
                    onChange={(e) => setSourceCell(e.target.value)}
                  >
                     <option>A-01-01</option>
                     <option>A-02-05</option>
                  </select>
               </div>
            </div>
         </div>

         <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100 animate-pulse">
               <ArrowRightCircle size={28} />
            </div>
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em]">Hızlı DAT</span>
         </div>

         <div className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 group hover:border-emerald-200 transition-all">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
               <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <LayoutGrid size={14} /> Hedef Lokasyon (TARGET)
               </h3>
               <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase border border-emerald-100">STOK GİRECEK</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hedef Depo</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 appearance-none"
                    value={targetWarehouse}
                    onChange={(e) => setTargetWarehouse(e.target.value)}
                  >
                     <option value="02">02 - ÜRETİM</option>
                     <option value="01">01 - MERKEZ DEPO</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hedef Hücre</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                    value={targetCell}
                    onChange={(e) => setTargetCell(e.target.value)}
                  >
                     <option>B-05-12</option>
                     <option>C-10-10</option>
                  </select>
               </div>
            </div>
         </div>
      </div>

      {/* TAB SYSTEM (XtraTabControl1) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         <div className="flex bg-slate-50/50 p-1.5 border-b border-slate-100">
            <button 
               onClick={() => setActiveTab('single')}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'single' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <Hash size={16} /> SERİ BAZINDA TRANSFER (TabPage1)
            </button>
            <button 
               onClick={() => setActiveTab('batch')}
               className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'batch' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
               <Layers size={16} /> TOPLU TRANSFER (TabPage2)
            </button>
         </div>

         {activeTab === 'single' ? (
            <div className="p-12 animate-in slide-in-from-left-4 duration-500">
               <div className="max-w-4xl mx-auto space-y-12">
                  {/* Step 1: Serial Pickup (grdLueSeriList) */}
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
                        <Search size={14} className="text-indigo-500" /> Transfer Edilecek Seri Numarası
                     </label>
                     <div className="relative group">
                        <select 
                          className="w-full px-8 py-6 bg-slate-900 border-none rounded-[2rem] text-2xl font-black text-indigo-400 outline-none focus:ring-8 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                          value={singleTransfer.serialNo}
                          onChange={(e) => {
                            const val = e.target.value;
                            const item = mockSerialStock.find(i => i.serialNo === val);
                            if(item) setSingleTransfer({ serialNo: val, stockCode: item.stockCode, stockName: item.stockName, balance: item.balance, qty: item.balance, unit: item.unit });
                          }}
                        >
                           <option value="">--- SERİ SEÇİNİZ VEYA OKUTUNUZ ---</option>
                           {mockSerialStock.map(s => (
                             <option key={s.id} value={s.serialNo}>{s.serialNo} ({s.stockCode})</option>
                           ))}
                        </select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4 text-slate-500">
                           <div className="w-[1px] h-8 bg-white/10" />
                           <Hash size={24} className="group-hover:text-indigo-400 transition-colors" />
                        </div>
                     </div>
                  </div>

                  {/* Step 2: Info Cards (txtStokAdi, spDepoBakiye) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Tanımı</p>
                           <Box size={16} className="text-indigo-300" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 leading-tight">{singleTransfer.stockName}</h4>
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-500 uppercase">{singleTransfer.stockCode || 'SEÇİMEDİ'}</span>
                        </div>
                     </div>
                     <div className="bg-indigo-50/30 p-8 rounded-[2rem] border border-indigo-100/50 space-y-4">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Mevcut Hücre Bakiyesi</p>
                           <Database size={16} className="text-indigo-300" />
                        </div>
                        <div className="flex items-end gap-2">
                           <h4 className="text-4xl font-black text-indigo-600 tracking-tighter">{singleTransfer.balance.toLocaleString()}</h4>
                           <span className="text-sm font-black text-indigo-400 mb-1">{singleTransfer.unit}</span>
                        </div>
                        <div className="w-full h-1 bg-indigo-200/50 rounded-full overflow-hidden">
                           <div className="w-full h-full bg-indigo-500" />
                        </div>
                     </div>
                  </div>

                  {/* Step 3: Transaction (spMiktar) */}
                  <div className="flex flex-col md:flex-row items-center gap-6 pt-6">
                     <div className="flex-1 space-y-2 w-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transfer Edilecek Miktar</label>
                        <div className="relative">
                           <input 
                              type="number" 
                              className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-800 outline-none focus:border-indigo-500 transition-all text-center"
                              value={singleTransfer.qty}
                              onChange={(e) => setSingleTransfer({...singleTransfer, qty: parseFloat(e.target.value) || 0})}
                           />
                           <div className="absolute right-6 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-tighter">MAX: {singleTransfer.balance}</div>
                        </div>
                     </div>
                     <button className="w-full md:w-auto md:px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-4">
                        <ArrowLeftRight size={20} /> TRANSFERİ TAMAMLA
                     </button>
                  </div>
               </div>
            </div>
         ) : (
            /* BATCH TRANSFER PANEL (SplitContainerControl1 Karşılığı) */
            <div className="flex-1 flex flex-col md:flex-row animate-in slide-in-from-right-4 duration-500">
               {/* Left: Available Stock (grdDepoBakiye) */}
               <div className="flex-1 p-6 flex flex-col gap-4 border-r border-slate-100">
                  <div className="flex items-center justify-between">
                     <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <Database size={16} className="text-indigo-500" /> Mevcut Stok Listesi
                     </h4>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                          type="text" 
                          placeholder="Seri no veya stok ara..." 
                          className="pl-9 pr-4 py-1.5 bg-slate-100 border-none rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
                          value={searchInAvailable}
                          onChange={(e) => setSearchInAvailable(e.target.value)}
                        />
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                     {filteredAvailable.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => handleMoveToTransfer(item)}
                          className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 cursor-pointer transition-all group"
                        >
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tight uppercase px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">{item.serialNo}</span>
                              <div className="flex items-center gap-1.5">
                                 <span className="text-sm font-black text-slate-800">{item.balance}</span>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase">{item.unit}</span>
                              </div>
                           </div>
                           <h5 className="text-xs font-bold text-slate-700 truncate">{item.stockName}</h5>
                           <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                              <span className="text-[9px] font-black text-slate-400 uppercase">{item.cellCode}</span>
                              <button className="p-1.5 bg-slate-50 text-slate-300 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all"><ArrowRight size={14} /></button>
                           </div>
                        </div>
                     ))}
                     {filteredAvailable.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
                           <XCircle size={48} />
                           <p className="text-xs font-bold uppercase tracking-widest">Kayıt Bulunamadı</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* Middle: Action Buttons (PanelControl1) - Hidden on desktop, implicit in UI flow */}
               
               {/* Right: Selected for Transfer (grdSeciliSeri) */}
               <div className="flex-1 p-6 flex flex-col gap-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                     <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest flex items-center gap-2">
                        <Layers size={16} className="text-indigo-600" /> Transfer Sepeti
                     </h4>
                     <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-indigo-100">{selectedForTransfer.length} KALEM</span>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                     {selectedForTransfer.map(item => (
                        <div 
                          key={item.id} 
                          className="p-4 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm relative group animate-in zoom-in duration-300"
                        >
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black text-indigo-600 font-mono">{item.serialNo}</span>
                              <button 
                                onClick={() => handleMoveBack(item)}
                                className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                              ><XCircle size={16} /></button>
                           </div>
                           <h5 className="text-xs font-bold text-slate-700 truncate mb-4">{item.stockName}</h5>
                           <div className="flex items-center gap-4">
                              <div className="flex-1 space-y-1">
                                 <label className="text-[8px] font-black text-slate-400 uppercase">Transfer Miktarı</label>
                                 <input type="number" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-indigo-600 outline-none focus:bg-white" defaultValue={item.balance} />
                              </div>
                              <div className="flex flex-col items-end pt-4">
                                 <span className="text-[8px] font-black text-slate-400 uppercase">HEDEF:</span>
                                 <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{targetCell}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                     {selectedForTransfer.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50 border-4 border-dashed border-slate-200 rounded-[2.5rem]">
                           <LayoutList size={64} />
                           <div className="text-center">
                              <p className="text-xs font-bold uppercase tracking-widest">Sepetiniz Boş</p>
                              <p className="text-[9px] font-medium mt-1">Sol taraftan ürün seçerek başlayın</p>
                           </div>
                        </div>
                     )}
                  </div>

                  {selectedForTransfer.length > 0 && (
                     <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4">
                        <CheckCircle2 size={18} /> TOPLU TRANSFERİ BAŞLAT
                     </button>
                  )}
               </div>
            </div>
         )}
         
         {/* GRID FOOTER SUMMARY (Birimler, Bakiyeler vs) */}
         <div className="px-8 py-4 bg-slate-900 border-t border-white/5 flex items-center justify-between shrink-0 text-white">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">İşlem Bazı: SERİ NO</p>
               </div>
               <div className="h-4 w-[1px] bg-white/10" />
               <div className="flex items-center gap-4">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Toplam Transfer Edilecek:</p>
                  <p className="text-lg font-black tracking-tight">
                    {activeTab === 'single' ? singleTransfer.qty : selectedForTransfer.reduce((a, b) => a + b.balance, 0)} <span className="text-[10px] text-slate-500">ADET</span>
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <button className="p-2 text-slate-500 hover:text-white transition-colors"><Search size={18} /></button>
               <div className="w-[1px] h-4 bg-white/10" />
               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">FLEX DAT v2.4</p>
            </div>
         </div>
      </div>

      {/* INFO FOOTER */}
      <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
         <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest leading-none">Önemli Uyarı</h4>
            <p className="text-xs text-amber-600/80 leading-relaxed font-medium">Hücreler arası transfer yaparken, hedef hücrenin kapasitesini (`Depo Kapasite Tanım`) kontrol ediniz. Negatif stok izni olmayan depolarda, mevcut bakiyeden fazla transfer yapılması sistem tarafından engellenmektedir.</p>
         </div>
      </div>
    </div>
  );
};

// Internal Input Helper
const InputField: React.FC<{ label: string, icon?: React.ReactNode, placeholder?: string, type?: string, important?: boolean, value?: any, onChange?: any }> = ({ label, icon, placeholder, type = 'text', important, value, onChange }) => (
  <div className="space-y-1.5 flex-1 group">
    <label className={`text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${important ? 'text-rose-500' : 'text-slate-400 group-focus-within:text-indigo-500 transition-colors'}`}>
       {icon} {label} {important && '*'}
    </label>
    <input 
      type={type} 
      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default WarehouseTransfer;
