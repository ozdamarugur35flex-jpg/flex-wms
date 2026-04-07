
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardList, 
  RotateCcw, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Truck, 
  Box, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  ArrowUpRight,
  Info,
  BadgeAlert,
  Smartphone,
  Eye,
  ArrowRightCircle,
  Loader2,
  Plus,
  Minus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ShipmentOrderItem } from '../types';
import { apiService } from '../api';

const ShipmentOrderList: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    const result = await apiService.shipmentOrders.getAll();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = (item.stokAdi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.sevkEmriNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.cariIsim || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCompleted = showCompleted ? true : item.durum !== 'T';
      return matchSearch && matchCompleted;
    });
  }, [data, searchTerm, showCompleted]);

  // Group by Customer -> SevkEmriNo
  const groupedData = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {};
    filteredData.forEach(item => {
      const customer = item.cariIsim || 'BİLİNMEYEN MÜŞTERİ';
      const sevkEmriNo = item.sevkEmriNo || 'BİLİNMEYEN EMİR';

      if (!groups[customer]) {
        groups[customer] = {};
      }
      if (!groups[customer][sevkEmriNo]) {
        groups[customer][sevkEmriNo] = [];
      }
      groups[customer][sevkEmriNo].push(item);
    });
    return groups;
  }, [filteredData]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    Object.entries(groupedData).forEach(([customer, orders]) => {
      allExpanded[`cust_${customer}`] = true;
      Object.keys(orders).forEach(sevkEmriNo => {
        allExpanded[`order_${customer}_${sevkEmriNo}`] = true;
      });
    });
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sevk Emirleri");
    XLSX.writeFile(workbook, "Sevk_Emri_Listesi.xlsx");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Sevk Emri İzleme Listesi</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Depo Fiili Yükleme Takibi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all active:scale-95"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Yenile
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel Aktar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
         <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
               <Truck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bekleyen Sevk</p>
               <h4 className="text-xl font-black text-slate-800">{data.filter(o => o.durum !== 'T').length} EMİR</h4>
            </div>
         </div>
         <div className="bg-slate-900 p-5 rounded-[2rem] text-white flex items-center justify-between group cursor-pointer" onClick={() => setShowCompleted(!showCompleted)}>
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Görünüm Filtresi</p>
               <h4 className="text-sm font-black">{showCompleted ? 'TÜMÜNÜ GİZLE' : 'TAMAMLANANLARI GÖSTER'}</h4>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showCompleted ? 'bg-rose-500' : 'bg-emerald-500'}`}>
               <Eye size={20} />
            </div>
         </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0 flex items-center gap-4">
         <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
               type="text" 
               placeholder="Müşteri adı, stok kodu veya emir no ile hızlı arama..." 
               className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <button onClick={expandAll} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors">Tümünü Aç</button>
            <button onClick={collapseAll} className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors">Tümünü Kapat</button>
         </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
         <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1400px]">
               <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                     <th className="px-8 py-5 border-r border-white/5 w-16 text-center"></th>
                     <th className="px-8 py-5 border-r border-white/5">Sipariş No</th>
                     <th className="px-8 py-5 border-r border-white/5">Sevk Emri No</th>
                     <th className="px-8 py-5 border-r border-white/5">Stok Bilgisi</th>
                     <th className="px-8 py-5 border-r border-white/5 text-center">Miktar</th>
                     <th className="px-8 py-5 border-r border-white/5 text-center">Depo</th>
                     <th className="px-8 py-5 border-r border-white/5 text-center">Durum</th>
                     <th className="px-8 py-5 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 size={40} className="text-indigo-600 animate-spin" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Veriler Yükleniyor...</p>
                        </div>
                      </td>
                    </tr>
                  ) : Object.keys(groupedData).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <Truck size={48} />
                          <p className="text-xs font-black uppercase tracking-widest">Kayıt Bulunamadı</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    Object.entries(groupedData).map(([customer, orders]) => {
                      const customerNodeId = `cust_${customer}`;
                      const isCustomerExpanded = expandedNodes[customerNodeId];
                      const totalItemsForCustomer = Object.values(orders).flat().length;
                      const totalOrdersForCustomer = Object.keys(orders).length;

                      return (
                        <React.Fragment key={customerNodeId}>
                          {/* Level 1: Customer Header Row */}
                          <tr className="bg-slate-100/80 hover:bg-slate-200 cursor-pointer transition-colors" onClick={() => toggleNode(customerNodeId)}>
                             <td className="px-8 py-4 text-center">
                                <button className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-400 transition-all">
                                   {isCustomerExpanded ? <Minus size={14} /> : <Plus size={14} />}
                                </button>
                             </td>
                             <td colSpan={7} className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                   <span className="text-sm font-black text-slate-800 uppercase tracking-widest">{customer}</span>
                                   <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-black">{totalOrdersForCustomer} SEVK EMRİ ({totalItemsForCustomer} KALEM)</span>
                                </div>
                             </td>
                          </tr>
                          
                          {/* Level 2: Sevk Emri Header Row */}
                          {isCustomerExpanded && Object.entries(orders).map(([sevkEmriNo, items]) => {
                            const orderNodeId = `order_${customer}_${sevkEmriNo}`;
                            const isOrderExpanded = expandedNodes[orderNodeId];
                            const siparisNo = items[0]?.siparisNo;
                            const durum = items[0]?.durum;

                            return (
                              <React.Fragment key={orderNodeId}>
                                <tr className="bg-slate-50/80 hover:bg-slate-100 cursor-pointer transition-colors" onClick={() => toggleNode(orderNodeId)}>
                                  <td className="px-8 py-3 text-right pr-4">
                                    <button className="w-5 h-5 rounded border border-slate-200 bg-white inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all ml-auto">
                                      {isOrderExpanded ? <Minus size={12} /> : <Plus size={12} />}
                                    </button>
                                  </td>
                                  <td className="px-8 py-3">
                                      {siparisNo && siparisNo !== 'MANUEL' ? (
                                         <p className="text-[10px] font-black text-slate-600 font-mono tracking-widest">{siparisNo}</p>
                                      ) : (
                                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[9px] font-black text-slate-500 uppercase">Manuel</span>
                                      )}
                                  </td>
                                  <td className="px-8 py-3">
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs font-black text-indigo-600 font-mono tracking-widest">{sevkEmriNo}</p>
                                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[8px] font-black">{items.length} KALEM</span>
                                      </div>
                                  </td>
                                  <td colSpan={3} className="px-8 py-3"></td>
                                  <td className="px-8 py-3 text-center">
                                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${durum === 'T' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                          {durum === 'T' ? 'Tamamlandı' : durum === 'B' ? 'Beklemede' : 'İptal'}
                                      </div>
                                  </td>
                                  <td className="px-8 py-3"></td>
                                </tr>

                                {/* Level 3: Items */}
                                {isOrderExpanded && items.map(item => (
                                   <tr key={item.id} className={`hover:bg-indigo-50/10 transition-all group ${item.durum === 'T' ? 'bg-emerald-50/30' : ''}`}>
                                      <td className="px-8 py-4"></td>
                                      <td className="px-8 py-4"></td>
                                      <td className="px-8 py-4"></td>
                                      <td className="px-8 py-4">
                                          <p className="text-xs font-bold text-slate-700 uppercase">{item.stokAdi}</p>
                                          <p className="text-[10px] text-slate-400 font-mono">{item.stokKodu}</p>
                                      </td>
                                      <td className="px-8 py-4 text-center font-black text-slate-800">{item.miktar.toLocaleString()}</td>
                                      <td className="px-8 py-4 text-center font-black text-slate-500">{item.depo}</td>
                                      <td className="px-8 py-4 text-center"></td>
                                      <td className="px-8 py-4 text-right">
                                         <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"><MoreHorizontal size={18} /></button>
                                      </td>
                                   </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default ShipmentOrderList;
