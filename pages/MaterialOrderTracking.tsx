
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PackageSearch, 
  RotateCcw, 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  MoreHorizontal, 
  Truck,
  Box,
  BadgeAlert,
  ArrowRightCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MaterialOrderStatus } from '../types';
import { apiService } from '../api';

const MaterialOrderTracking: React.FC = () => {
  const [orders, setOrders] = useState<MaterialOrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Tümü' | 'Açık' | 'Geciken'>('Tümü');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.materialOrderTracking.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch = 
        order.stockName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.stockCode.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchSearch) return false;

      if (filterType === 'Açık') return order.status !== 'Kapalı';
      if (filterType === 'Geciken') {
        // Basit bir gecikme kontrolü simülasyonu
        return order.remainingQuantity > 0 && new Date(order.orderDate) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }
      return true;
    });
  }, [orders, searchTerm, filterType]);

  const handleExportExcel = () => {
    const exportData = filteredOrders.map(o => ({
      'Sipariş No': o.orderNo,
      'Stok Kodu': o.stockCode,
      'Stok Adı': o.stockName,
      'Tedarikçi': o.supplierName,
      'Sipariş Tarihi': o.orderDate,
      'Sipariş Miktarı': o.orderedQuantity,
      'Gelen Miktar': o.receivedQuantity,
      'Kalan Miktar': o.remainingQuantity,
      'Birim': o.unit,
      'Durum': o.status,
      'Son Teslimat': o.lastDeliveryDate,
      'Son İrsaliye': o.lastWaybillNo
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Malzeme Takip");
    XLSX.writeFile(workbook, `Netsis_Malzeme_Takip_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      open: orders.filter(o => o.status !== 'Kapalı').length,
      completed: orders.filter(o => o.status === 'Kapalı').length,
      totalRemaining: orders.reduce((acc, curr) => acc + curr.remainingQuantity, 0)
    };
  }, [orders]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <PackageSearch className="w-8 h-8 text-indigo-600" />
            Malzeme Sipariş Durum (Netsis)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">TBLSIPATRA ve TBLSTHAR verileri ile sipariş takip dashboard.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Yenile"
          >
            <RotateCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-emerald-200"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Excel Aktar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam Sipariş</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Açık Siparişler</p>
          <p className="text-2xl font-bold text-amber-600">{stats.open}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tamamlanan</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Toplam Bakiye</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Sipariş no, stok veya tedarikçi ile ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl">
          {(['Tümü', 'Açık', 'Geciken'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Veriler yükleniyor...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sipariş & Stok</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tedarikçi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Miktar</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Durum</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Son Teslimat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.status === 'Kapalı' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          <Box className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{order.orderNo}</p>
                          <p className="text-xs text-slate-500">{order.stockCode} - {order.stockName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-700">{order.supplierName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{order.supplierCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <span className="text-slate-900">{order.receivedQuantity}</span>
                          <span className="text-slate-300">/</span>
                          <span className="text-slate-500">{order.orderedQuantity}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${order.status === 'Kapalı' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${(order.receivedQuantity / order.orderedQuantity) * 100}%` }}
                          />
                        </div>
                        {order.remainingQuantity > 0 && (
                          <p className="text-[10px] text-rose-500 font-bold mt-1">Kalan: {order.remainingQuantity}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Kapalı' ? 'bg-emerald-100 text-emerald-700' : 
                        order.status === 'Kısmi' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                      }`}>
                        {order.status === 'Kapalı' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.lastDeliveryDate ? (
                        <div>
                          <p className="text-xs font-bold text-slate-700">{order.lastDeliveryDate}</p>
                          <p className="text-[10px] text-slate-400 font-medium">İrs: {order.lastWaybillNo}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Henüz teslimat yok</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
              <PackageSearch className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sipariş Bulunamadı</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Arama kriterlerinize uygun herhangi bir malzeme siparişi bulunamadı.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialOrderTracking;
