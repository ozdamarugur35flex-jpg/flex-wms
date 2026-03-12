
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardList, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Clock, 
  Box, 
  BadgeAlert, 
  Factory, 
  Truck, 
  MoreHorizontal, 
  Settings2, 
  ShieldCheck, 
  DollarSign, 
  Printer, 
  CheckCircle2, 
  LayoutGrid,
  Zap,
  TrendingUp,
  Info,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiService } from '../api';

const CustomerOrderTracking: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const result = await apiService.customerOrders.getStatusReport();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = (item.musteriAdi || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.siparisNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.stokAdi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.stokKodu || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [data, searchTerm]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siparis Durum");
    XLSX.writeFile(workbook, "Musteri_Siparis_Takip.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><ClipboardList size={24} /></div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Müşteri Sipariş Durum</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Üretim & Sevkiyat İzleme</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Yenile
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
         <input type="text" placeholder="Müşteri adı, ürün kodu veya sipariş no ile akıllı arama..." className="w-full pl-14 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Sipariş No / Tarih</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Müşteri / Stok</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Sipariş</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Sevk</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Bakiye</th>
                <th className="px-6 py-5 text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 size={40} className="text-indigo-600 animate-spin" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Veriler Yükleniyor...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/20 transition-all group">
                   <td className="px-6 py-4">
                      <p className="font-black text-slate-800">{item.siparisNo}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(item.siparisTarihi).toLocaleDateString()}</p>
                   </td>
                   <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-700 uppercase">{item.musteriAdi}</p>
                      <p className="text-[10px] text-indigo-600 font-mono mt-1">{item.stokKodu} - {item.stokAdi}</p>
                   </td>
                   <td className="px-6 py-4 text-center font-black text-slate-700">{item.siparisMiktari.toLocaleString()}</td>
                   <td className="px-6 py-4 text-center font-black text-emerald-600">{item.sevkEdilenMiktar.toLocaleString()}</td>
                   <td className="px-6 py-4 text-center font-black text-rose-600">{item.bakiyeMiktar.toLocaleString()}</td>
                   <td className="px-6 py-4 text-right">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${item.kapaliMi ? 'bg-slate-100 text-slate-500 border-slate-200' : item.bakiyeMiktar <= 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {item.kapaliMi ? 'Kapalı' : item.bakiyeMiktar <= 0 ? 'Tamamlandı' : 'Açık'}
                      </div>
                   </td>
                </tr>
              ))}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <ClipboardList size={48} />
                      <p className="text-xs font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTracking;