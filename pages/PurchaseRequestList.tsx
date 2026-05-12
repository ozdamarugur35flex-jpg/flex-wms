
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Search, Filter, FileText, 
  Calendar, Clock, User, ArrowRight, Loader2, RotateCcw,
  CheckCircle2, XCircle, AlertCircle, MoreHorizontal, Minus
} from 'lucide-react';
import { PurchaseRequest } from '../types';
import { apiService } from '../api';

const PurchaseRequestList: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNos, setSelectedNos] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.purchaseRequests.getAll();
      setRequests(data);
      setSelectedNos([]);
    } catch (err) {
      console.error("Satın alma talepleri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const toggleSelection = (requestNo: string) => {
    setSelectedNos(prev => 
      prev.includes(requestNo) 
        ? prev.filter(no => no !== requestNo) 
        : [...prev, requestNo]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedNos.length === 0) return;
    
    try {
      setProcessing(true);
      await apiService.purchaseRequests.updateStatus(selectedNos, 'Onayda');
      await loadRequests();
      setSelectedNos([]);
    } catch (err) {
      console.error("Toplu onay hatası:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (selectedNos.length === 0) return;
    if (!rejectionReason.trim()) {
      alert("Lütfen red nedeni belirtiniz.");
      return;
    }
    
    try {
      setProcessing(true);
      await apiService.purchaseRequests.updateStatus(selectedNos, 'Reddedildi', rejectionReason);
      await loadRequests();
      setSelectedNos([]);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error("Red hatası:", err);
    } finally {
      setProcessing(false);
    }
  };

  const updateQty = async (requestNo: string, stockCode: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty < 0) return;
    
    try {
      setProcessing(true);
      await apiService.purchaseRequests.updateItemQty(requestNo, stockCode, newQty);
      await loadRequests();
    } catch (err) {
      console.error("Miktar güncelleme hatası:", err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onaylandı': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Reddedildi': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Onayda': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Tamamlandı': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredRequests = requests.filter(r => 
    (r.requestNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.branchName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.stockName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.stockCode?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Verileri RequestNo'ya göre gruplayalım
  const groupedData = filteredRequests.reduce((acc: any, curr: any) => {
    if (!acc[curr.requestNo]) {
      acc[curr.requestNo] = {
        requestNo: curr.requestNo,
        date: curr.date,
        branchName: curr.branchName,
        status: curr.status,
        items: []
      };
    }
    acc[curr.requestNo].items.push({
      stockCode: curr.stockCode,
      stockName: curr.stockName,
      requestedQty: curr.requestedQty,
      currentStock: curr.currentStock
    });
    return acc;
  }, {});

  const groupedList = Object.values(groupedData) as any[];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Satın Alma Talepleri</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Talep Yönetim Sistemi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedNos.length > 0 && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
              <button 
                onClick={handleBulkApprove}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                {processing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Onayla ({selectedNos.length})
              </button>
              <button 
                onClick={() => setShowRejectModal(true)}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                <XCircle size={16} />
                Reddet
              </button>
            </div>
          )}
          <button onClick={loadRequests} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
            <Plus size={16} /> Yeni Talep Oluştur
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Talep no, ürün adı veya şube ile ara..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
          <button className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">
            <Filter size={16} /> Gelişmiş Filtre
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Talepler Yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 w-12 mr-0 pr-0">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={groupedList.length > 0 && selectedNos.length === groupedList.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNos(groupedList.map(g => g.requestNo));
                        } else {
                          setSelectedNos([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Talep Başlığı</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ürün Detayları</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Talep Miktarı</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupedList.map((group, groupIndex) => (
                  <React.Fragment key={group.requestNo || groupIndex}>
                    {/* Header Row */}
                    <tr className={`border-t border-slate-100 transition-colors ${selectedNos.includes(group.requestNo) ? 'bg-indigo-50/30' : 'bg-slate-50/30'}`}>
                      <td className="px-6 py-3 mr-0 pr-0">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedNos.includes(group.requestNo)}
                          onChange={() => toggleSelection(group.requestNo)}
                        />
                      </td>
                      <td className="px-6 py-3" colSpan={2}>
                        <div className="flex items-center gap-4">
                          <div className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-black tracking-tighter">
                            # {group.requestNo}
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold">{new Date(group.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <ArrowRight size={12} className="text-slate-300" />
                            <span className="text-[10px] font-black uppercase tracking-wider">{group.branchName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(group.status)}`}>
                          {group.status === 'A' ? 'BEKLEMEDE' : group.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Item Rows */}
                    {group.items.map((item: any, itemIndex: number) => (
                      <tr key={`${group.requestNo}-${itemIndex}`} className="hover:bg-slate-50/50 transition-colors group border-l-4 border-l-transparent hover:border-l-indigo-500">
                        <td className="px-6 py-4"></td> {/* Empty cell for checkbox column */}
                        <td className="px-6 py-4 pl-4" colSpan={2}>
                          <div className="flex flex-col">
                            <p className="text-xs font-black text-slate-700 tracking-tight group-hover:text-indigo-600 transition-colors">
                              {item.stockName || 'Stok Bilgisi Yok'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                              {item.stockCode || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                              <button 
                                onClick={() => updateQty(group.requestNo, item.stockCode, item.requestedQty, -1)}
                                disabled={processing}
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-black text-indigo-600 w-8">{item.requestedQty}</span>
                              <button 
                                onClick={() => updateQty(group.requestNo, item.stockCode, item.requestedQty, 1)}
                                disabled={processing}
                                className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-md transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold">Stok: {item.currentStock || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4" colSpan={2}></td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <ShoppingCart size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Talep Bulunamadı</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Talebi Reddet</h3>
                  <p className="text-xs text-slate-400 font-bold">Red gerekçesini aşağıda belirtebilirsiniz.</p>
                </div>
              </div>
              
              <textarea 
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-rose-500 transition-all font-medium resize-none"
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

export default PurchaseRequestList;
