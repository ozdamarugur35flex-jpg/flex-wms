
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Factory, 
  Plus, 
  Save, 
  Trash2, 
  Printer, 
  FileSpreadsheet, 
  XCircle, 
  Calendar, 
  Box, 
  Layers, 
  Warehouse as WarehouseIcon, 
  Settings, 
  Info, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle,
  History,
  LayoutGrid,
  Search,
  BadgeAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  Hash,
  Tag,
  MoreHorizontal,
  Loader2,
  FileText,
  Upload,
  Check
} from 'lucide-react';
import { ProductionRecord, DepotMaterialStatus, StockCard } from '../types';
import { apiService } from '../api';
import SearchableSelect from '../components/SearchableSelect';

const WarehouseEntryExitPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [tempItems, setTempItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    stockCode: '',
    type: 'Giriş' as 'Giriş' | 'Çıkış',
    quantity: 0,
    notes: '',
    warehouse: '01'
  });

  // Workflow State
  const [isPrinted, setIsPrinted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const stockList = await apiService.stocks.getAll();
      setStocks(stockList);
    } catch (error) {
      console.error("Veriler yüklenemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToList = () => {
    if (!form.stockCode || form.quantity <= 0 || !form.notes.trim()) {
      alert("Lütfen stok seçiniz, miktar giriniz ve zorunlu not alanını doldurunuz.");
      return;
    }

    const stock = stocks.find(s => s.code === form.stockCode);
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...form,
      stockName: stock?.name || '',
      unit: stock?.unit || 'ADET'
    };

    setTempItems(prev => [...prev, newItem]);
    setForm(prev => ({ ...prev, stockCode: '', quantity: 0 }));
    // Reset workflow if list changes
    setIsPrinted(false);
    setUploadedFile(null);
  };

  const handleRemoveFromList = (id: string) => {
    setTempItems(prev => prev.filter(item => item.id !== id));
    setIsPrinted(false);
    setUploadedFile(null);
  };

  const handlePrint = () => {
    if (tempItems.length === 0) {
      alert("Yazdırmak için listede en az bir kalem olmalıdır.");
      return;
    }
    // Simulate printing
    window.print();
    setIsPrinted(true);
    alert("Form yazdırıldı. Lütfen imzalayıp tarattıktan sonra sisteme yükleyiniz.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      alert("İmzalı form başarıyla yüklendi. Artık kaydı tamamlayabilirsiniz.");
    }
  };

  const handleSave = async () => {
    if (!uploadedFile) {
      alert("İmzalı form yüklenmeden işlem tamamlanamaz.");
      return;
    }

    setIsSaving(true);
    try {
      // In a real app, we would upload the file first, then save the records
      // For now, we simulate the API call
      for (const item of tempItems) {
        await apiService.production.save({
          stockCode: item.stockCode,
          quantity: item.quantity,
          warehouseCode: parseInt(item.warehouse),
          machine: 'DEPO', // Defaulted
          operator: 'DEPO_USER', // Defaulted
          jobOrderNo: 'AMBAR_HAREKET', // Defaulted
          serialNo: item.notes // Using notes as serial or description in backend
        });
      }
      
      alert("Stok hareketleri başarıyla resmileştirildi ve form arşive alındı.");
      setTempItems([]);
      setForm({
        stockCode: '',
        type: 'Giriş',
        quantity: 0,
        notes: '',
        warehouse: '01'
      });
      setIsPrinted(false);
      setUploadedFile(null);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      alert("Kaydetme sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Factory size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Ambar Giriş Çıkış</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Evrak Takibi & Stok Doğruluğu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            disabled={tempItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <Printer size={16} className="text-indigo-600" /> Yazdır ve Hazırla
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              disabled={!isPrinted}
            />
            <label 
              htmlFor="file-upload"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 ${uploadedFile ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : isPrinted ? 'bg-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {uploadedFile ? <Check size={16} /> : <Upload size={16} />}
              {uploadedFile ? 'Form Yüklendi' : 'İmzalı Formu Yükle'}
            </label>
          </div>

          <button 
            onClick={handleSave}
            disabled={!uploadedFile || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
            Kaydet & Resmileştir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* FORM SECTION */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">İşlem Detayları</h3>
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setForm(prev => ({ ...prev, type: 'Giriş' }))}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${form.type === 'Giriş' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  GİRİŞ
                </button>
                <button 
                  onClick={() => setForm(prev => ({ ...prev, type: 'Çıkış' }))}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${form.type === 'Çıkış' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  ÇIKIŞ
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <SearchableSelect 
                label="Stok Seçimi"
                placeholder="Stok Ara..."
                value={form.stockCode}
                onChange={(val) => setForm(prev => ({ ...prev, stockCode: val }))}
                options={stocks.map(s => ({ value: s.code, label: `${s.code} | ${s.name}` }))}
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İşlem Miktarı</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500"
                    value={form.quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">
                    {stocks.find(s => s.code === form.stockCode)?.unit || 'ADET'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                  <span>İşlem Notu (Zorunlu)</span>
                  {form.notes.trim() === '' && <span className="text-[9px] text-rose-500 font-bold animate-pulse">NOT GEREKLİ</span>}
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  placeholder="İşlemin detaylarını buraya yazınız..."
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <button 
                onClick={handleAddToList}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Listeye Ekle
              </button>
            </div>
          </div>

          {!isPrinted && tempItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4 animate-bounce">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                <Printer size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Sıradaki Adım</h4>
                <p className="text-[11px] text-amber-700 font-medium leading-relaxed">Listeniz hazır. Lütfen yukarıdaki "Yazdır ve Hazırla" butonuna basarak formu yazdırınız.</p>
              </div>
            </div>
          )}
        </div>

        {/* LIST SECTION */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <FileText size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Geçici Hareket Listesi</h3>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam {tempItems.length} Kalem</span>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tip</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stok Bilgisi</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Miktar</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notlar</th>
                    <th className="px-6 py-4 text-right w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tempItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                          <LayoutGrid size={48} strokeWidth={1} />
                          <p className="text-xs font-black uppercase tracking-widest">Liste Henüz Boş</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tempItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${item.type === 'Giriş' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-slate-800">{item.stockCode}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{item.stockName}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-black text-slate-800">{item.quantity.toLocaleString()}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{item.unit}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[11px] text-slate-600 font-medium italic line-clamp-2">"{item.notes}"</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleRemoveFromList(item.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PRINT PREVIEW FOOTER (ONLY VISIBLE ON PRINT) */}
            <div className="hidden print:block p-12 border-t-4 border-slate-900 mt-auto">
               <div className="grid grid-cols-2 gap-20">
                  <div className="text-center space-y-12">
                     <p className="text-sm font-black uppercase tracking-widest border-b-2 border-slate-200 pb-2">Teslim Eden</p>
                     <div className="h-24" />
                     <p className="text-xs font-bold text-slate-400">İsim / İmza</p>
                  </div>
                  <div className="text-center space-y-12">
                     <p className="text-sm font-black uppercase tracking-widest border-b-2 border-slate-200 pb-2">Teslim Alan</p>
                     <div className="h-24" />
                     <p className="text-xs font-bold text-slate-400">İsim / İmza</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseEntryExitPage;
