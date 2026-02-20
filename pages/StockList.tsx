
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, PackageCheck, Save, XCircle, Camera, Info,
  FileSpreadsheet, Edit2, RotateCcw, Database, MoreHorizontal, Loader2,
  Lock, Unlock, Ruler, ArrowRight, X, Layers, Tag, Box, Calculator, Barcode,
  ChevronRight, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';
import { StockCard } from '../types';
import { apiService } from '../api';

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showYM, setShowYM] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Partial<StockCard> | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await apiService.stocks.getAll(!showYM);
      setStocks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, [showYM]);

  const handleOpenModal = (stock?: StockCard) => {
    if (stock) {
      setEditingStock(stock);
    } else {
      setEditingStock({
        code: '',
        name: '',
        unit1: 'ADET',
        purchaseVat: 20,
        salesVat: 20,
        quantity: 0,
        minStockLevel: 0,
        isLocked: false,
        isAutoConsumption: false,
        groupCode: '',
        barcode1: '',
        barcode2: '',
        barcode3: '',
        englishName: '',
        producerCode: '',
        customsCode: '',
        width: 0,
        height: 0,
        depth: 0,
        kod1: '',
        kod2: '',
        kod3: '',
        kod4: '',
        kod5: ''
      });
    }
    setActiveTab(0);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingStock?.code || !editingStock?.name) {
      alert("Stok kodu ve adı zorunludur!");
      return;
    }
    try {
      await apiService.stocks.save(editingStock);
      setIsModalOpen(false);
      loadStocks();
    } catch (err) {
      console.error(err);
    }
  };

  const generateNextCode = async (prefix: string) => {
    if (!prefix) return;
    try {
      const res = await apiService.stocks.generateNextCode(prefix);
      setEditingStock(prev => ({ ...prev, code: res.nextCode }));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 0, label: 'Genel Bilgiler', icon: <Info size={16} /> },
    { id: 1, label: 'Fiyat & Muhasebe', icon: <Calculator size={16} /> },
    { id: 2, label: 'Boyut & Kodlar', icon: <Layers size={16} /> },
    { id: 3, label: 'Barkodlar', icon: <Barcode size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-100">
            <PackageCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Netsis Stok Yönetimi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">STSABIT / STSABITEK Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
              checked={showYM}
              onChange={(e) => setShowYM(e.target.checked)}
            />
            <span className="text-[10px] font-black text-slate-600 uppercase">YMA Grubu Hariç</span>
          </label>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> Yeni Stok
          </button>
          <button onClick={loadStocks} className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50">
            <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Stok adı, kod veya üretici kodu ile ara..." 
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
               <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-5">Ürün Tanımı</th>
                  <th className="px-8 py-5 text-center">Birim</th>
                  <th className="px-8 py-5 text-center">Kilit</th>
                  <th className="px-8 py-5 text-right">Mevcut Bakiye</th>
                  <th className="px-8 py-5 text-right">Son Alış</th>
                  <th className="px-8 py-5 text-right w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStocks.map((stock) => (
                  <tr 
                    key={stock.id} 
                    onClick={() => handleOpenModal(stock)}
                    className="hover:bg-indigo-50/20 transition-all group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:text-indigo-600 transition-colors">
                          <Database size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 uppercase">{stock.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{stock.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded border border-slate-200">{stock.unit1}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {stock.isLocked ? <Lock size={16} className="text-rose-500 mx-auto" /> : <Unlock size={16} className="text-emerald-500 mx-auto" />}
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`text-lg font-black tracking-tighter ${stock.quantity < stock.minStockLevel ? 'text-rose-600' : 'text-slate-800'}`}>
                        {stock.quantity?.toLocaleString()}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-emerald-600">₺{stock.lastPurchasePrice?.toFixed(2) || "0.00"}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                        <Edit2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detailed Stock Card Modal */}
      {isModalOpen && editingStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <PackageCheck size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Stok Kartı Detayı</h2>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Netsis STSABIT / STSABITEK</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-1 bg-slate-50 p-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
              {activeTab === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4 duration-300">
                  <div className="space-y-6">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Stok Kodu</label>
                        <input 
                          type="text" 
                          value={editingStock.code}
                          onChange={(e) => setEditingStock({...editingStock, code: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                          placeholder="Örn: H0001"
                        />
                      </div>
                      <button 
                        onClick={() => generateNextCode(editingStock.code?.substring(0, 1) || 'H')}
                        className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all"
                        title="Sıradaki Kodu Üret"
                      >
                        <RotateCcw size={20} />
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Stok Adı</label>
                      <input 
                        type="text" 
                        value={editingStock.name}
                        onChange={(e) => setEditingStock({...editingStock, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        placeholder="Ürün adı giriniz..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">İngilizce İsim (STSABITEK)</label>
                      <input 
                        type="text" 
                        value={editingStock.englishName}
                        onChange={(e) => setEditingStock({...editingStock, englishName: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        placeholder="English name..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Grup Kodu</label>
                        <select 
                          value={editingStock.groupCode}
                          onChange={(e) => setEditingStock({...editingStock, groupCode: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                        >
                          <option value="">Seçiniz...</option>
                          <option value="HAMMADDE">HAMMADDE</option>
                          <option value="YMA">YMA (Yarı Mamul)</option>
                          <option value="MAMUL">MAMUL</option>
                          <option value="TICARI">TİCARİ MAL</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Ölçü Birimi</label>
                        <select 
                          value={editingStock.unit1}
                          onChange={(e) => setEditingStock({...editingStock, unit1: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none"
                        >
                          <option value="ADET">ADET</option>
                          <option value="KG">KG</option>
                          <option value="MT">MT</option>
                          <option value="M2">M2</option>
                          <option value="LT">LT</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Üretici Kodu</label>
                      <input 
                        type="text" 
                        value={editingStock.producerCode}
                        onChange={(e) => setEditingStock({...editingStock, producerCode: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Gümrük Tarife Kodu</label>
                      <input 
                        type="text" 
                        value={editingStock.customsCode}
                        onChange={(e) => setEditingStock({...editingStock, customsCode: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Sistem Kontrolleri</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Stok Kilitli (KILIT)</span>
                        <button 
                          onClick={() => setEditingStock({...editingStock, isLocked: !editingStock.isLocked})}
                          className={`w-12 h-6 rounded-full transition-all relative ${editingStock.isLocked ? 'bg-rose-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingStock.isLocked ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">Otomatik Tüketim (SAFKOD)</span>
                        <button 
                          onClick={() => setEditingStock({...editingStock, isAutoConsumption: !editingStock.isAutoConsumption})}
                          className={`w-12 h-6 rounded-full transition-all relative ${editingStock.isAutoConsumption ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingStock.isAutoConsumption ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">Vergi Oranları</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Alış KDV (%)</label>
                        <input 
                          type="number" 
                          value={editingStock.purchaseVat}
                          onChange={(e) => setEditingStock({...editingStock, purchaseVat: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Satış KDV (%)</label>
                        <input 
                          type="number" 
                          value={editingStock.salesVat}
                          onChange={(e) => setEditingStock({...editingStock, salesVat: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2 mt-8">Stok Seviyeleri</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Min. Stok Seviyesi</label>
                        <input 
                          type="number" 
                          value={editingStock.minStockLevel}
                          onChange={(e) => setEditingStock({...editingStock, minStockLevel: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Tedarik Süresi (Gün)</label>
                        <input 
                          type="number" 
                          value={editingStock.leadTime}
                          onChange={(e) => setEditingStock({...editingStock, leadTime: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">Muhasebe & Maliyet</h4>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Muhasebe Detay Kodu</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all appearance-none">
                        <option>01 - HAMMADDE HESAPLARI</option>
                        <option>02 - YARI MAMUL HESAPLARI</option>
                        <option>03 - MAMUL HESAPLARI</option>
                        <option>04 - TİCARİ MAL HESAPLARI</option>
                      </select>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                      <div className="flex items-center gap-3 mb-4">
                        <Calculator className="text-indigo-600" size={20} />
                        <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">Son Alış Bilgisi</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Birim Fiyat</p>
                          <p className="text-2xl font-black text-indigo-600 tracking-tighter">₺{editingStock.lastPurchasePrice?.toFixed(2) || "0.00"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Son Hareket</p>
                          <p className="text-xs font-bold text-indigo-900">12.02.2024</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">Boyut Bilgileri (mm)</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Genişlik</label>
                        <input 
                          type="number" 
                          value={editingStock.width}
                          onChange={(e) => setEditingStock({...editingStock, width: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Yükseklik</label>
                        <input 
                          type="number" 
                          value={editingStock.height}
                          onChange={(e) => setEditingStock({...editingStock, height: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Derinlik</label>
                        <input 
                          type="number" 
                          value={editingStock.depth}
                          onChange={(e) => setEditingStock({...editingStock, depth: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Ruler className="text-indigo-400" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Hesaplanan Alan</span>
                      </div>
                      <span className="text-sm font-black text-indigo-400">
                        {((editingStock.width || 0) * (editingStock.height || 0) / 1000000).toFixed(4)} m²
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight border-b border-slate-100 pb-2">Özel Kodlar (KOD_1 - KOD_5)</h4>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-16 text-[10px] font-black text-slate-400 uppercase tracking-widest">KOD {i}</div>
                        <input 
                          type="text" 
                          value={(editingStock as any)[`kod${i}`]}
                          onChange={(e) => setEditingStock({...editingStock, [`kod${i}`]: e.target.value})}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all"
                          placeholder={`Özel Kod ${i}...`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4 group hover:border-indigo-500 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Barcode className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={20} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Barkod {i}</span>
                          </div>
                          {i === 1 && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded uppercase">Varsayılan</span>}
                        </div>
                        <input 
                          type="text" 
                          value={(editingStock as any)[`barcode${i}`]}
                          onChange={(e) => setEditingStock({...editingStock, [`barcode${i}`]: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          placeholder="Barkod okutun veya girin..."
                        />
                        <div className="h-12 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-300">
                          <span className="text-[10px] font-bold uppercase tracking-widest">Barkod Önizleme</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                    <AlertCircle className="text-amber-600 shrink-0" size={24} />
                    <div>
                      <h5 className="text-sm font-black text-amber-900 uppercase tracking-tight">Barkod Yönetimi Hakkında</h5>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        Netsis sisteminde bir stok kartına en fazla 3 adet barkod tanımlanabilir. 
                        Barkod 1, el terminali ve sevkiyat işlemlerinde öncelikli olarak kullanılır. 
                        Barkod okutma işlemi sırasında sistem otomatik olarak bu üç alanı da kontrol eder.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Veri Doğrulandı</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={16} className="text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Netsis Bağlantısı Aktif</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all active:scale-95"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSave}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2"
                >
                  <Save size={18} /> Kaydet (F2)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockList;

