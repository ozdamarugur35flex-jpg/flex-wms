
import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, Calendar, 
  RotateCcw, Loader2, ChevronRight, Receipt,
  Hash, User, CreditCard
} from 'lucide-react';
import { PurchaseInvoice } from '../types';
import { apiService } from '../api';

const PurchaseInvoiceList: React.FC = () => {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiService.purchaseInvoices.getAll();
      setInvoices(data);
    } catch (err) {
      console.error("Alış irsaliyeleri yüklenemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(inv => 
    (inv.invoiceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.customerCode?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (inv.gibInvoiceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Alış İrsaliyeleri</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Netsis İrsaliye Takibi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={loadInvoices} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="İrsaliye no, tedarikçi veya GİB no ile ara..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
          <button className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
            <Filter size={16} /> Filtrele
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İrsaliyeler Yükleniyor...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">İrsaliye Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tedarikçi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">GİB No</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tutar</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv, index) => (
                  <tr key={inv.id || index} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{inv.invoiceNo}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Calendar size={10} className="text-slate-400" />
                            <span className="text-[10px] text-slate-400 font-bold">{inv.date}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-600">{inv.customerName || 'BİLİNMEYEN TEDARİKÇİ'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{inv.customerCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Hash size={12} />
                        <span className="text-[11px] font-bold">{inv.gibInvoiceNo || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-slate-700">₺{inv.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 && (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <Receipt size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">İrsaliye Bulunamadı</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseInvoiceList;
