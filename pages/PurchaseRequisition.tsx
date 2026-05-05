
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FilePlus2, 
  Search, 
  Save, 
  Trash2, 
  Plus, 
  Package, 
  User, 
  Calendar, 
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  BadgeAlert,
  Building,
  Edit,
  History,
  FileSpreadsheet,
  Loader2,
  RefreshCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PurchaseRequisition as IReq, StockCard } from '../types';
import { apiService } from '../api';

const BRANCHES = ['Merkez', 'Fabrika-1', 'Fabrika-2', 'Lojistik Depo'];

const PurchaseRequisition: React.FC = () => {
  const [reqs, setReqs] = useState<IReq[]>([]);
  const [stocks, setStocks] = useState<StockCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockCard | null>(null);
  const [requestedQty, setRequestedQty] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqList, stockList] = await Promise.all([
        apiService.purchaseRequests.getAll(),
        apiService.stocks.getMinLevels() // Miktarları doğru almak için getMinLevels kullanıyoruz
      ]);
      setReqs(reqList);
      setStocks(stockList);
    } catch (error) {
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredReqs = useMemo(() => {
    return reqs.filter(r => 
      r.stockName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.stockCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reqs, searchTerm]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReqs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Talepler");
    XLSX.writeFile(workbook, "Satinalma_Talepleri.xlsx");
  };

  const [modalSearch, setModalSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const filteredModalStocks = useMemo(() => {
    return stocks.filter(s => 
      s.name.toLowerCase().includes(modalSearch.toLowerCase()) || 
      s.code.toLowerCase().includes(modalSearch.toLowerCase())
    ).sort((a, b) => {
      // Kritik olanları üste alalım
      const aKritik = a.quantity < a.minStockLevel;
      const bKritik = b.quantity < b.minStockLevel;
      if (aKritik && !bKritik) return -1;
      if (!aKritik && bKritik) return 1;
      return 0;
    });
  }, [stocks, modalSearch]);

  const toggleItem = (code: string) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[code] !== undefined) {
        delete next[code];
      } else {
        next[code] = 1;
      }
      return next;
    });
  };

  const updateItemQty = (code: string, qty: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [code]: qty
    }));
  };

  const handleAddOrUpdate = async () => {
    const itemsToSave = Object.entries(selectedItems).map(([code, qty]) => {
      const stock = stocks.find(s => s.code === code);
      return {
        stockCode: code,
        stockName: stock?.name || '',
        branchName: selectedBranch,
        requestedQty: qty as number,
        date: new Date().toISOString().split('T')[0]
      };
    }).filter((item: any) => item.requestedQty > 0);

    if (itemsToSave.length === 0) return;
    
    setIsSaving(true);
    try {
      const result = await (apiService.purchaseRequests as any).bulkSave(itemsToSave);
      if (result.success) {
        await fetchData();
        setIsModalOpen(false);
        setSelectedItems({});
        setModalSearch('');
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><FilePlus2 size={24} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Satınalma Talepleri</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">İç İhtiyaç Bildirim Modülü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); setSelectedItems({}); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"><Plus size={16} /> Yeni Toplu Talep</button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
         <Search size={18} className="text-slate-400 absolute left-8 mt-2.5" />
         <input type="text" placeholder="Ürün adı veya kod ile talep ara..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Şube / Ürün</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Talep Miktarı</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tarih</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                  </td>
                </tr>
              ) : filteredReqs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">Kayıt bulunamadı.</td>
                </tr>
              ) : filteredReqs.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">{r.stockName}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{r.branchName} • {r.stockCode}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-indigo-600 font-mono">{r.requestedQty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase">{r.date ? new Date(r.date).toLocaleDateString('tr-TR') : '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      r.status === 'Beklemede' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      r.status === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <FilePlus2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Talep Açılacak Ürünleri Seçin</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Miktar Girerek Toplu Talep Oluşturabilirsiniz</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-2.5 hover:bg-rose-50 rounded-2xl transition-all">
                <XCircle size={28} />
              </button>
            </div>

            <div className="p-6 flex flex-col md:flex-row gap-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Ürün Ara..." 
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 shadow-sm"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <select 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 shadow-sm"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Seç</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">Stok Tanımı</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Mevcut Stok</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">Min. Seviye</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center w-32">Talep Miktarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredModalStocks.map((s) => {
                    const isSelected = selectedItems[s.code] !== undefined;
                    const isBelowMin = s.quantity < s.minStockLevel;
                    const isNearMin = s.quantity <= s.minStockLevel * 1.1 && !isBelowMin && s.minStockLevel > 0;
                    
                    let bgClass = "bg-white hover:bg-slate-50";
                    if (isBelowMin) bgClass = "bg-rose-50/50 hover:bg-rose-50";
                    else if (isNearMin) bgClass = "bg-amber-50/50 hover:bg-amber-50";
                    
                    if (isSelected) bgClass = "bg-indigo-50/70 hover:bg-indigo-50";

                    return (
                      <tr key={s.code} className={`${bgClass} transition-colors`}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleItem(s.code)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700 uppercase leading-none mb-1">{s.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{s.code}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${isBelowMin ? 'text-rose-600' : isNearMin ? 'text-amber-600' : 'text-slate-600'}`}>
                            {s.quantity.toLocaleString()} {s.unit1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-500">
                          {s.minStockLevel.toLocaleString()} {s.unit1}
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            disabled={!isSelected}
                            className={`w-full px-3 py-2 text-center text-xs font-black rounded-lg border outline-none transition-all ${
                              isSelected ? 'bg-white border-indigo-300 text-indigo-700 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                            placeholder="0"
                            value={selectedItems[s.code] || ''}
                            onChange={(e) => updateItemQty(s.code, parseFloat(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seçili Ürün:</span>
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-indigo-100 italic">
                  {Object.keys(selectedItems).length} Adet
                </span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">Vazgeç</button>
                <button 
                  onClick={handleAddOrUpdate}
                  disabled={isSaving || Object.keys(selectedItems).length === 0}
                  className="px-10 py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 uppercase tracking-widest disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Talepleri Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PurchaseRequisition;
