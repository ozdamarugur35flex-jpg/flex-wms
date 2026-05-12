
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Minus, 
  Loader2, 
  Info, 
  Clock, 
  Building, 
  ChevronRight,
  PackageCheck,
  PackageX,
  ArrowRightLeft,
  Users,
  AlertCircle,
  Save,
  RefreshCcw,
  Trash2,
  History
} from 'lucide-react';
import { PurchaseRequisition as IReq, StockCard } from '../types';
import { apiService } from '../api';
import SearchableSelect from '../components/SearchableSelect';

const PurchaseApproval: React.FC = () => {
  const [reqs, setReqs] = useState<IReq[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'CONVERTED' | 'CANCELED'>('PENDING');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedNos, setSelectedNos] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Convert Order State
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [convertingNo, setConvertingNo] = useState<string | null>(null);
  const [previousSupplierCodes, setPreviousSupplierCodes] = useState<string[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reqList, supplierList] = await Promise.all([
        apiService.purchaseRequests.getAll(),
        apiService.customers.getAll()
      ]);
      setReqs(reqList);
      
      // Strict Uniueness Check for Suppliers
      const uniqueSuppliers = supplierList.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.code === current.code);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      
      setSuppliers(uniqueSuppliers);
      setSelectedNos([]);
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
    let base = reqs || [];

    // Date filtering (ISO string contains date)
    if (startDate) {
      base = base.filter(r => r.date && r.date.split('T')[0] >= startDate);
    }
    if (endDate) {
      base = base.filter(r => r.date && r.date.split('T')[0] <= endDate);
    }

    // Status filtering
    if (statusFilter === 'PENDING') {
      base = base.filter(r => r.status === 'W' || r.status === 'Onayda' || !r.status);
    } else if (statusFilter === 'APPROVED') {
      base = base.filter(r => r.status === 'O' || r.status === 'Onaylandı');
    } else if (statusFilter === 'CONVERTED') {
      base = base.filter(r => r.status === 'Sipariş' || r.status === 'S'); // 'S' means Converted to Order
    } else if (statusFilter === 'CANCELED') {
      base = base.filter(r => r.status === 'İptal' || r.status === 'I' || r.status === 'R' || r.status === 'Reddedildi');
    }

    return base.filter(r => 
      (r?.stockName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (r?.stockCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r?.requestNo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [reqs, searchTerm, startDate, endDate, statusFilter]);

  const groupedReqs = useMemo(() => {
    const groups: Record<string, IReq[]> = {};
    filteredReqs.forEach(req => {
      const key = req.requestNo || 'No Number';
      if (!groups[key]) groups[key] = [];
      groups[key].push(req);
    });
    return Object.entries(groups).map(([requestNo, items]) => ({
      requestNo,
      items,
      date: items[0].date,
      branchName: items[0].branchName,
      status: items[0].status
    })).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  }, [filteredReqs]);

  const toggleSelection = (requestNo: string) => {
    setSelectedNos(prev => 
      prev.includes(requestNo) 
        ? prev.filter(no => no !== requestNo) 
        : [...prev, requestNo]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedNos.length === 0) return;
    
    setIsProcessing(true);
    try {
      const result = await apiService.purchaseRequests.updateStatus(selectedNos, 'O', '');
      if (result.success) {
        await fetchData();
        setSelectedNos([]);
      }
    } catch (error) {
      console.error("Toplu onay hatası:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (selectedNos.length === 0) return;
    if (!rejectionReason.trim()) {
      alert("Lütfen red nedeni belirtiniz.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await apiService.purchaseRequests.updateStatus(selectedNos, 'R', rejectionReason);
      if (result.success) {
        await fetchData();
        setSelectedNos([]);
        setShowRejectModal(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error("Red hatası:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenConvertModal = async (requestNo: string) => {
    setConvertingNo(requestNo);
    setShowConvertModal(true);
    setIsLoadingHistory(true);
    try {
      const history = await apiService.purchaseRequests.getPreviousSuppliers(requestNo);
      setPreviousSupplierCodes(history || []);
    } catch (err) {
      console.error("Geçmiş tedarikçi hatası:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      const aIsPrev = previousSupplierCodes.includes(a.code);
      const bIsPrev = previousSupplierCodes.includes(b.code);
      if (aIsPrev && !bIsPrev) return -1;
      if (!aIsPrev && bIsPrev) return 1;
      return a.name.localeCompare(b.name);
    }).map(s => ({
      value: s.code,
      label: s.name,
      subLabel: previousSupplierCodes.includes(s.code) ? '★ ÖNCEDEN ALINMIŞ' : undefined
    }));
  }, [suppliers, previousSupplierCodes]);

  const handleConvertToOrder = async () => {
    if (!convertingNo || !selectedSupplier) return;
    
    setIsProcessing(true);
    try {
      const result = await apiService.purchaseRequests.convertToOrder(convertingNo, selectedSupplier);
      if (result.success) {
        alert("Başarıyla siparişe dönüştürüldü.");
        await fetchData();
        setShowConvertModal(false);
        setConvertingNo(null);
        setSelectedSupplier('');
      } else {
        alert("Hata: " + (result as any).message);
      }
    } catch (error) {
      console.error("Siparişe dönüştürme hatası:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQtyChange = async (requestNo: string, stockCode: string, newQty: number) => {
    if (newQty < 0 || isNaN(newQty)) return;
    
    setIsProcessing(true);
    try {
      await apiService.purchaseRequests.updateItemQty(requestNo, stockCode, newQty);
      await fetchData();
    } catch (err) {
      console.error("Miktar güncelleme hatası:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateItemQtyInline = async (requestNo: string, stockCode: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    handleQtyChange(requestNo, stockCode, newQty);
  };

  const handleCancelConvertedOrder = async (requestNo: string) => {
    if (!window.confirm("Bu sipariş dönüşümünü iptal etmek istediğinize emin misiniz? Oluşturulan sipariş silinecek ve talep durumu 'İptal Edildi' olarak güncellenecektir.")) return;
    
    setIsProcessing(true);
    try {
      const result = await apiService.purchaseRequests.cancelConversion(requestNo);
      if (result.success) {
        await fetchData();
      }
    } catch (error) {
      console.error("İptal hatası:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'S': case 'Sipariş': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Onaylandı': case 'O': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Reddedildi': case 'R': case 'İptal': case 'I': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Beklemede': case 'A': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'W': case 'Onayda': return 'bg-sky-50 text-sky-600 border-sky-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Sipariş': case 'S': return 'SİPARİŞE DÖNÜŞTÜ';
      case 'W': case 'Onayda': return 'ONAY BEKLİYOR';
      case 'A': case 'Beklemede': return 'TASLAK / BEKLİYOR';
      case 'O': case 'Onaylandı': return 'ONAYLANDI';
      case 'R': case 'Reddedildi': return 'REDDEDİLDİ';
      case 'I': case 'İptal': return 'İPTAL EDİLDİ';
      default: return status;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><CheckCircle2 size={24} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Satınalma Onay Paneli</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Yönetici Onayı ve Sipariş Dönüşümü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedNos.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all active:scale-95"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                Toplu Onayla ({selectedNos.length})
              </button>
              <button 
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 shadow-lg shadow-rose-100 transition-all active:scale-95"
              >
                <PackageX size={16} />
                Reddet
              </button>
            </div>
          )}
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
            <RefreshCcw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit">
        <button 
          onClick={() => setStatusFilter('PENDING')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            statusFilter === 'PENDING' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
              : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          <Clock size={16} />
          Onay Bekleyen
        </button>
        <button 
          onClick={() => setStatusFilter('APPROVED')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            statusFilter === 'APPROVED' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 size={16} />
          Onaylananlar
        </button>
        <button 
          onClick={() => setStatusFilter('CONVERTED')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            statusFilter === 'CONVERTED' 
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' 
              : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
          }`}
        >
          <ArrowRightLeft size={16} />
          Dönüştürülenler
        </button>
        <button 
          onClick={() => setStatusFilter('CANCELED')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            statusFilter === 'CANCELED' 
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' 
              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
          }`}
        >
          <XCircle size={16} />
          İptal Edilenler
        </button>
        <button 
          onClick={() => setStatusFilter('ALL')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            statusFilter === 'ALL' 
              ? 'bg-slate-700 text-white shadow-lg shadow-slate-100' 
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Search size={16} />
          Hepsi
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
           <div className="relative flex-1 min-w-[200px]">
              <Search size={18} className="text-slate-400 absolute left-4 mt-2.5" />
              <input type="text" placeholder="Talep no, ürün adı veya kod ile ara..." className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>

           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarih:</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500" />
              <span className="text-slate-300">-</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 w-12 pr-0">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={groupedReqs.length > 0 && selectedNos.length === groupedReqs.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedNos(groupedReqs.map(r => r.requestNo).filter(no => no));
                      } else {
                        setSelectedNos([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-left">Ürün Bilgisi</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Talep Miktarı</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Mevcut Stok</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                  </td>
                </tr>
              ) : groupedReqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Onay bekleyen veya kritikte olan kayıt bulunamadı.</td>
                </tr>
              ) : groupedReqs.map((group, gIdx) => (
                <React.Fragment key={group.requestNo || gIdx}>
                  {/* Group Header */}
                  <tr className={`border-t border-slate-100 transition-all ${selectedNos.includes(group.requestNo) ? 'bg-indigo-50/40' : 'bg-slate-50/30'}`}>
                    <td className="px-6 py-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selectedNos.includes(group.requestNo)}
                        onChange={() => toggleSelection(group.requestNo)}
                      />
                    </td>
                    <td className="px-6 py-3" colSpan={3}>
                      <div className="flex items-center gap-4">
                        <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-black tracking-tighter shadow-sm">
                          # {group.requestNo}
                        </div>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Building size={12} className="text-slate-300" /> {group.branchName || 'Genel'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300">|</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" /> {group.date ? new Date(group.date).toLocaleDateString('tr-TR') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(group.status)}`}>
                        {getStatusText(group.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {(group.status === 'O' || group.status === 'Onaylandı') && (
                        <button 
                          onClick={() => handleOpenConvertModal(group.requestNo)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black hover:bg-emerald-700 transition-all shadow-sm ml-auto"
                        >
                          <ArrowRightLeft size={14} /> SİPARİŞE DÖNÜŞTÜR
                        </button>
                      )}
                      {(group.status === 'S' || group.status === 'Sipariş') && (
                        <button 
                          onClick={() => handleCancelConvertedOrder(group.requestNo)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black hover:bg-rose-700 transition-all shadow-sm ml-auto"
                        >
                          <Trash2 size={14} /> DÖNÜŞÜMÜ İPTAL ET
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Group Items */}
                  {group.items.map((item, iIdx) => (
                    <tr key={`${group.requestNo}-${iIdx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-slate-800 tracking-tight">{item.stockName || 'Stok Bilgisi Yok'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.stockCode || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-1">
                            <button 
                              onClick={() => updateItemQtyInline(group.requestNo, item.stockCode, item.requestedQty, -1)}
                              disabled={isProcessing}
                              className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-all active:scale-90"
                            >
                              <Minus size={12} />
                            </button>
                            <input 
                              type="number"
                              className="w-16 p-1 text-center text-sm font-black text-indigo-600 bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 outline-none tabular-nums"
                              value={item.requestedQty}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  // Local update for responsiveness
                                  setReqs(prev => prev.map(r => 
                                    (r.requestNo === group.requestNo && r.stockCode === item.stockCode) 
                                      ? { ...r, requestedQty: val } 
                                      : r
                                  ));
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  handleQtyChange(group.requestNo, item.stockCode, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = parseFloat((e.target as HTMLInputElement).value);
                                  if (!isNaN(val)) {
                                    handleQtyChange(group.requestNo, item.stockCode, val);
                                  }
                                }
                              }}
                            />
                            <button 
                              onClick={() => updateItemQtyInline(group.requestNo, item.stockCode, item.requestedQty, 1)}
                              disabled={isProcessing}
                              className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-md transition-all active:scale-90"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                   
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-300 font-mono">{(item.currentStock || 0).toLocaleString()}</td>
                      <td className="px-6 py-4" colSpan={2}>
                        {item.description && (
                          <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg max-w-xs ml-auto">
                            <p className="text-[10px] text-slate-400 italic flex items-center gap-1.5">
                              <Info size={10} className="text-indigo-400 shrink-0" /> {item.description}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Selection Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Tedarikçi Seçimi</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Siparişe dönüştürmek için satıcı seçin</p>
            </div>
            
            <div className="p-8 space-y-4">
              <SearchableSelect 
                label="Tedarikçi (Cari)"
                placeholder="Tedarikçi seçin..."
                options={sortedSuppliers}
                value={selectedSupplier}
                onChange={setSelectedSupplier}
                disabled={isLoadingHistory}
              />
              
              {isLoadingHistory && (
                <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold">
                  <Loader2 size={12} className="animate-spin" />
                  Alım geçmişi kontrol ediliyor...
                </div>
              )}

              <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  Bu işlem seçilen talebi Netsis Satınalma Siparişi (TBLSIPAMAS/TBLSIPATRA) olarak kaydedecektir.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowConvertModal(false)}
                className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
              >
                Vazgeç
              </button>
              <button 
                onClick={handleConvertToOrder}
                disabled={!selectedSupplier || isProcessing}
                className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                SİPARİŞ OLUŞTUR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <PackageX size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Talebi Reddet</h3>
                  <p className="text-xs text-slate-400 font-bold">Red gerekçesini aşağıda belirtebilirsiniz.</p>
                </div>
              </div>
              
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all font-medium resize-none shadow-inner"
                placeholder="Örn: Bütçe aşımı, alternatif stok mevcut..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            
            <div className="p-4 bg-slate-50 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-6 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-all"
              >
                Vazgeç
              </button>
              <button 
                onClick={handleReject}
                disabled={isProcessing}
                className="px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
              >
                Reddet ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseApproval;
