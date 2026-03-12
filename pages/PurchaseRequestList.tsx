
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Search, Filter, FileText, 
  Calendar, Clock, User, ArrowRight, Loader2, RotateCcw,
  CheckCircle2, XCircle, AlertCircle, MoreHorizontal
} from 'lucide-react';
import { PurchaseRequest } from '../types';
import { apiService } from '../api';

const PurchaseRequestList: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await apiService.purchaseRequests.getAll();
      setRequests(data);
    } catch (err) {
      console.error("Satın alma talepleri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

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
    (r.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (r.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
              placeholder="Talep no, açıklama veya departman ile ara..." 
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
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Talep Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Departman / Proje</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Kalem</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Durum</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req, index) => (
                  <tr key={req.id || index} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{req.requestNo}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-bold">{req.date}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-600">{req.department || 'GENEL'}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{req.projectCode || 'PROJESİZ'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-slate-700">{req.totalItems || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                          <ArrowRight size={18} />
                        </button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
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
    </div>
  );
};

export default PurchaseRequestList;
