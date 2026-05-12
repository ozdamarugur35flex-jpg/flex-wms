
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  AlertCircle,
  X,
  TrendingDown,
  Info,
  ChevronRight,
  Save,
  ExternalLink,
  FileDown,
  LayoutGrid,
  History
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MaterialOrderStatus } from '../types';
import { apiService } from '../api';

const MaterialOrderTracking: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<MaterialOrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'Tümü' | 'Açık' | 'Geciken'>('Tümü');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<MaterialOrderStatus | null>(null);
  const [quickQty, setQuickQty] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockDetail, setStockDetail] = useState<any>(null);

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

  const handleRowClick = async (order: MaterialOrderStatus) => {
    setSelectedOrder(order);
    setQuickQty(0);
    setStockDetail(null);
    
    // Fetch last price etc.
    try {
      const detail = await apiService.stocks.getDetail(order.stockCode);
      if (detail) setStockDetail(detail);
    } catch (e) {
      console.error('Stock detail error:', e);
    }
  };

  const handleQuickSubmit = async () => {
    if (!selectedOrder || quickQty <= 0) return;
    setIsSubmitting(true);
    try {
      // Create a payload for Alış İrsaliyesi
      // We generate a temp invoice no or let the backend ignore it if we add a "Quick" flag, 
      // but standard Save is better.
      const nextNoResult = await apiService.purchaseInvoices.generateNextNo();
      const invoiceNo = nextNoResult.nextNo || `T-${Date.now()}`;

      const lineNo = selectedOrder.id.split('-').pop();
      const payload = {
        invoiceNo,
        customerCode: selectedOrder.supplierCode,
        customerName: selectedOrder.supplierName,
        date: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        description: `Hızlı Giriş - Sipariş: ${selectedOrder.orderNo}`,
        type: 'YURT İÇİ',
        items: [{
          id: Math.random().toString(36).substr(2, 9),
          stockCode: selectedOrder.stockCode,
          stockName: selectedOrder.stockName,
          quantity: quickQty,
          price: stockDetail?.lastPurchasePrice || 0,
          unit: selectedOrder.unit,
          warehouseCode: '01',
          orderNo: selectedOrder.orderNo,
          orderLineNo: lineNo
        }]
      };

      const result = await apiService.purchaseInvoices.save(payload);
      if (result.success) {
        alert(`Başarılı: ${selectedOrder.orderNo} için ${quickQty} birim giriş yapıldı ve ${invoiceNo} nolu irsaliye oluşturuldu.`);
        setSelectedOrder(null);
        fetchData();
      } else {
        alert('Giriş yapılırken bir sorun oluştu.');
      }
    } catch (error) {
      console.error('Quick submit error:', error);
      alert('Sistem hatası oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToDetailedInvoice = () => {
    if (!selectedOrder) return;
    const lineNo = selectedOrder.id.split('-').pop();
    navigate('/alis-irsaliye', { 
      state: { 
        orderNo: selectedOrder.orderNo,
        orderLineNo: lineNo,
        stockCode: selectedOrder.stockCode,
        customerCode: selectedOrder.supplierCode,
        qty: quickQty > 0 ? quickQty : selectedOrder.remainingQuantity
      } 
    });
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
                  <tr 
                    key={order.id} 
                    onDoubleClick={() => handleRowClick(order)}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
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

      {/* QUICK RECEIPT MODAL (Screenshot match) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <FileDown size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Alış İrsaliyesi Girişi</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       SİPARİŞ ID: {selectedOrder.orderNo} <span className="w-1 h-1 rounded-full bg-slate-200" /> {selectedOrder.supplierName}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="px-8 py-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Order Info */}
                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sipariş Bilgisi</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600 border border-slate-100">
                        <Box size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800 leading-none">{selectedOrder.stockName}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded border border-indigo-100 uppercase">{selectedOrder.stockCode}</span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase"><LayoutGrid size={12} /> MERKEZ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-3xl text-white relative overflow-hidden group">
                     <div className="relative z-10 space-y-4">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pazar Karar Desteği</p>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mb-1">Son Alınan Fiyat</p>
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-black text-white">${stockDetail?.lastPurchasePrice || '0.05'}</span>
                            <span className="text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-0.5"><TrendingDown size={12} /> %1.2 DÜŞÜŞ</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 border-t border-white/10 pt-4">
                           <Truck size={14} className="text-indigo-400" />
                           {selectedOrder.supplierName}
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-500">
                        <Loader2 size={120} />
                     </div>
                  </div>
                </div>

                {/* Right Side: Quantity Input */}
                <div className="flex flex-col gap-6">
                  <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 text-center">Beklenen Miktar</p>
                    <div className="flex items-end gap-2 leading-none">
                       <span className="text-[72px] font-black text-emerald-600 tracking-tighter">{selectedOrder.remainingQuantity.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">{selectedOrder.unit} KALAN</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gelen (Fiili) Miktar</label>
                    <input 
                      type="number"
                      autoFocus
                      className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-3xl text-3xl font-black text-slate-800 outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-center"
                      value={quickQty || ''}
                      onChange={(e) => setQuickQty(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={goToDetailedInvoice}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-black text-[11px] uppercase tracking-widest transition-colors group"
                >
                  <ExternalLink size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                  DETAYLI İRSALİYE EKRANINA GİT
                </button>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    İPTAL
                  </button>
                  <button 
                    onClick={handleQuickSubmit}
                    disabled={isSubmitting || quickQty <= 0}
                    className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                    GİRİŞİ ONAYLA
                  </button>
                </div>
              </div>

              <div className="absolute bottom-4 left-8 pointer-events-none opacity-20">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.5em] text-slate-400">
                  <History size={12} /> TESLİMAT GEÇMİŞİ
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MaterialOrderTracking;
