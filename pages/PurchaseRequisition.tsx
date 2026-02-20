
import React, { useState, useMemo } from 'react';
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
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PurchaseRequisition as IReq, StockCard } from '../types';

const BRANCHES = ['Merkez', 'Fabrika-1', 'Fabrika-2', 'Lojistik Depo'];

const mockStocks: StockCard[] = [
  // Added missing properties 'isLocked' and 'isAutoConsumption' to fix TypeScript errors
  { id: '1', code: 'STK001', name: 'Alüminyum Profil 20x20', quantity: 125, minStockLevel: 500, unit1: 'Adet', category: 'Hammadde', lastPurchasePrice: 45.5, lastUpdated: '2024-03-20', purchaseVat: 20, salesVat: 20, purchasePrices: [45.5], salesPrices: [60], leadTime: 7, isLocked: false, isAutoConsumption: false },
  // Added missing properties 'isLocked' and 'isAutoConsumption' to fix TypeScript errors
  { id: '2', code: 'STK002', name: 'Çelik Somun M8', quantity: 4500, minStockLevel: 1000, unit1: 'Adet', category: 'Bağlantı Elemanı', lastPurchasePrice: 1.2, lastUpdated: '2024-03-21', purchaseVat: 20, salesVat: 20, purchasePrices: [1.2], salesPrices: [2.5], leadTime: 3, isLocked: false, isAutoConsumption: false }
];

const mockRequisitions: IReq[] = [
  { id: 'R1', stockCode: 'STK001', stockName: 'Alüminyum Profil 20x20', branchName: 'Fabrika-1', minStockLevel: 500, currentStock: 125, requestedQty: 1000, requesterUser: 'Mustafa Aksoy', date: '2024-03-21', status: 'Beklemede', isRevised: true },
  { id: 'R2', stockCode: 'STK002', stockName: 'Çelik Somun M8', branchName: 'Merkez', minStockLevel: 1000, currentStock: 4500, requestedQty: 2500, requesterUser: 'Ahmet Yılmaz', date: new Date().toISOString().split('T')[0], status: 'Beklemede', isRevised: false }
];

const PurchaseRequisition: React.FC = () => {
  const [reqs, setReqs] = useState<IReq[]>(mockRequisitions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockCard | null>(null);
  const [requestedQty, setRequestedQty] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    const stock = mockStocks.find(s => s.code === stockCode);
    if(stock) setSelectedStock(stock);
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  const handleAddOrUpdate = () => {
    if(!selectedStock || requestedQty <= 0) return;
    if(editingId) {
      setReqs(reqs.map(r => r.id === editingId ? { ...r, requestedQty, branchName: selectedBranch, isRevised: true } : r));
    } else {
      const newReq: IReq = { id: `R${Date.now()}`, stockCode: selectedStock.code, stockName: selectedStock.name, branchName: selectedBranch, minStockLevel: selectedStock.minStockLevel, currentStock: selectedStock.quantity, requestedQty: requestedQty, requesterUser: 'Mustafa Aksoy', date: new Date().toISOString().split('T')[0], status: 'Beklemede', isRevised: false };
      setReqs([newReq, ...reqs]);
    }
    setIsModalOpen(false); setSelectedStock(null); setRequestedQty(0); setEditingId(null);
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
              {filteredReqs.map((r) => (
                <tr key={r.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-800">{r.stockName}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{r.branchName} • {r.stockCode}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-indigo-600">{r.requestedQty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase border bg-amber-50 text-amber-600 border-amber-100">{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right"><MoreHorizontal size={18} className="text-slate-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequisition;
