
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
        apiService.stocks.getAll()
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

  const handleStockSelect = (stockCode: string) => {
    const stock = stocks.find(s => s.code === stockCode);
    if(stock) setSelectedStock(stock);
  };

  const handleAddOrUpdate = async () => {
    if(!selectedStock || requestedQty <= 0) return;
    
    setIsSaving(true);
    try {
      const payload = {
        stockCode: selectedStock.code,
        stockName: selectedStock.name,
        branchName: selectedBranch,
        requestedQty: requestedQty,
        date: new Date().toISOString().split('T')[0],
        status: 'Beklemede'
      };

      const result = await apiService.purchaseRequests.save(payload);
      if (result.success) {
        await fetchData();
        setIsModalOpen(false);
        setSelectedStock(null);
        setRequestedQty(0);
        setEditingId(null);
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
          <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"><Plus size={16} /> Yeni Talep</button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
         <Search size={18} className="text-slate-400 absolute left-8 mt-2.5" />
         <input type="text" placeholder="Ürün adı veya kod ile talep ara..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Şube / Ürün</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Talep Miktarı</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                <th className="px-6 py-5 text-right"></th>
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
              ) : filteredReqs.map((r) => (
                <tr key={r.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">{r.stockName}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{r.branchName} • {r.stockCode}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-indigo-600">{r.requestedQty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                      r.status === 'Beklemede' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      r.status === 'Onaylandı' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right"><MoreHorizontal size={18} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                  <FilePlus2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Yeni Talep Oluştur</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">İç İhtiyaç Bildirimi</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-2.5 hover:bg-rose-50 rounded-2xl transition-all">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şube Seçimi</label>
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ürün Seçimi</label>
                <select 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                  onChange={(e) => handleStockSelect(e.target.value)}
                  value={selectedStock?.code || ''}
                >
                  <option value="">Seçiniz...</option>
                  {stocks.map(s => <option key={s.code} value={s.code}>{s.code} | {s.name}</option>)}
                </select>
              </div>

              {selectedStock && (
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-indigo-400 uppercase">
                    <span>Mevcut Stok</span>
                    <span>Min. Seviye</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-indigo-700">
                    <span>{selectedStock.quantity} {selectedStock.unit1}</span>
                    <span>{selectedStock.minStockLevel} {selectedStock.unit1}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Talep Miktarı</label>
                <input 
                  type="number" 
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500"
                  value={requestedQty || ''}
                  onChange={(e) => setRequestedQty(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all">İptal</button>
              <button 
                onClick={handleAddOrUpdate}
                disabled={isSaving || !selectedStock || requestedQty <= 0}
                className="px-8 py-4 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-3 uppercase tracking-widest disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                {editingId ? 'Güncelle' : 'Talep Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequisition;
