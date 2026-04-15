
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FileStack, Target, ClipboardList, Calculator, PieChart, LayoutList, FileSpreadsheet, 
  UserPlus, ShieldCheck, Search, Bell, Database, Package, Users, Warehouse, LayoutGrid, Gauge, 
  MinusCircle, Layers, Tag, ShoppingCart, PackageSearch, Truck, Receipt, RefreshCcw, Factory, ArrowLeftRight, 
  History, Calendar, Printer, ChevronLeft, ChevronRight, Sparkles, FileText, FileUp, FileDown, 
  CheckCircle2, Settings2, ShieldAlert, Archive, FilePlus, Clock, Hash, ArrowUpRight, FileJson, ArrowDownCircle,
  ChevronDown
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import StockList from './pages/StockList';
import CustomerList from './pages/CustomerList';
import WarehouseList from './pages/WarehouseList';
import LocationList from './pages/LocationList';
import WarehouseCapacityList from './pages/WarehouseCapacityList';
import CellCapacityList from './pages/CellCapacityList';
import StockWarehouseLimitList from './pages/StockWarehouseLimitList';
import MinStockList from './pages/MinStockList';
import VariantDefinitionList from './pages/VariantDefinitionList';
import LabelPrinting from './pages/LabelPrinting';
import PurchaseRequestList from './pages/PurchaseRequestList';
import PurchaseOrderList from './pages/PurchaseOrderList';
import PurchaseInvoiceList from './pages/PurchaseInvoiceList';
import OrderApproval from './pages/OrderApproval';
import CustomerOrder from './pages/CustomerOrder';
import MaterialOrderTracking from './pages/MaterialOrderTracking';
import CustomerOrderTracking from './pages/CustomerOrderTracking';
import SalesCostAnalysis from './pages/SalesCostAnalysis';
import MarketShareReport from './pages/MarketShareReport';
import WeeklyOrderTracking from './pages/WeeklyOrderTracking';
import PurchaseInvoice from './pages/PurchaseInvoice';
import SalesInvoicePage from './pages/SalesInvoice';
import ShipmentOrderEntry from './pages/ShipmentOrderEntry';
import StockMovementRecord from './pages/StockMovementRecord';
import ProductionRecordPage from './pages/ProductionRecord';
import WarehouseTransfer from './pages/WarehouseTransfer';
import WarehouseReset from './pages/WarehouseReset';
import UserDefinitionPage from './pages/UserDefinition';
import UserPermissions from './pages/UserPermissions';
import StockMovementReport from './pages/StockMovementReport';
import WarehouseBalanceReport from './pages/WarehouseBalanceReport';
import SerialWarehouseBalance from './pages/SerialWarehouseBalance';
import DateRangeStockMovement from './pages/DateRangeStockMovement';
import SerialShipmentReport from './pages/SerialShipmentReport';
import ShipmentOrderList from './pages/ShipmentOrderList';
import InventoryCountList from './pages/InventoryCountList';
import SerialMovementAnalysis from './pages/SerialMovementAnalysis';
import LabelPrintReport from './pages/LabelPrintReport';
import PurchaseRequisition from './pages/PurchaseRequisition';
import PurchaseOrder from './pages/PurchaseOrder';
import SpreadsheetModule from './pages/SpreadsheetModule';
import OrderBreakdownReport from './pages/OrderBreakdownReport';
import OperationalOrderTracking from './pages/OperationalOrderTracking';
import AiAssistant from './pages/AiAssistant';
import OrderImportTemplate from './pages/OrderImportTemplate';

const FlexLogo: React.FC<{ collapsed?: boolean }> = ({ collapsed }) => (
  <div className="flex flex-col items-center select-none">
    <div className="flex items-end gap-1.5">
      {!collapsed && (
        <span className="text-4xl font-black text-[#3c3c3b] tracking-tighter leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          flex
        </span>
      )}
      <div className={`grid grid-cols-2 gap-1 ${collapsed ? 'scale-125 translate-y-1' : 'mb-1 scale-90'}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3c3c3b" strokeWidth="2.5">
          <path d="M12 4L4 20H20L12 4Z" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#a8dadc">
          <path d="M12 20L4 4H20L12 20Z" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#a8dadc">
          <path d="M12 4L4 20H20L12 4Z" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#3c3c3b">
          <path d="M12 4L4 20H20L12 4Z" />
        </svg>
      </div>
    </div>
    {!collapsed && (
      <div className="mt-1 flex flex-col items-center">
        <span className="text-[9px] font-black text-[#3c3c3b] tracking-[0.2em] whitespace-nowrap uppercase">
          YAZILIM DANIŞMANLIK
        </span>
      </div>
    )}
  </div>
);

const AppContent: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Yapay Zeka": true,
    "Belgeler": true,
    "Kartlar & Tanımlar": false,
    "Satınalma & Giriş": false,
    "Satış & Sevkiyat": false,
    "Depo & Üretim": false,
    "Raporlar & Analiz": false,
    "Sistem": false,
  });
  const location = useLocation();

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const menuGroups = [
    {
      title: "Yapay Zeka",
      items: [
        { id: 'ai-asistan', label: 'Yapay Zeka Asistanı', icon: <Sparkles size={18} className="text-amber-500" />, path: '/ai-asistan' },
      ]
    },
    {
      title: "Belgeler",
      items: [
        { id: 'alis-irsaliye-giris', label: 'Alış İrsaliyesi Giriş', icon: <FileDown size={18} />, path: '/alis-irsaliye' },
        { id: 'satis-irsaliye-giris', label: 'Satış İrsaliye Girişi', icon: <FileUp size={18} />, path: '/satis-irsaliye' },
        { id: 'ambar-giris-cikis', label: 'Ambar Giriş Çıkış', icon: <Factory size={18} />, path: '/uretim-kayit' },
      ]
    },
    {
      title: "Kartlar & Tanımlar",
      items: [
        { id: 'stok-kart', label: 'Stok Kartları', icon: <Package size={18} />, path: '/stok-kart' },
        { id: 'cari-kart', label: 'Cari Kartlar', icon: <Users size={18} />, path: '/cari-kart' },
        { id: 'depo-tanim', label: 'Depo Tanımları', icon: <Warehouse size={18} />, path: '/depo-tanim' },
        { id: 'depo-hucre', label: 'Hücre Tanımları', icon: <LayoutGrid size={18} />, path: '/depo-hucre' },
        { id: 'hucre-kapasite', label: 'Hücre Kapasiteleri', icon: <Gauge size={18} />, path: '/hucre-kapasite' },
        { id: 'stok-depo-limit', label: 'Stok Depo Limitleri', icon: <ArrowDownCircle size={18} />, path: '/stok-depo-limit' },
        { id: 'depo-kapasite', label: 'Kapasite Tanımları', icon: <Gauge size={18} />, path: '/depo-kapasite' },
        { id: 'satin-alma-talep', label: 'Satın Alma Talepleri', icon: <ShoppingCart size={18} />, path: '/satin-alma-talep' },
        { id: 'satin-alma-siparis', label: 'Satın Alma Siparişleri', icon: <Truck size={18} />, path: '/satin-alma-siparis' },
        { id: 'varyant-tanim', label: 'Varyant Tanımları', icon: <Layers size={18} />, path: '/varyant-definition' },
        { id: 'min-stok', label: 'Minimum Stok Listesi', icon: <MinusCircle size={18} />, path: '/min-stok' },
      ]
    },
    {
      title: "Satınalma & Giriş",
      items: [
        { id: 'satinalma-talep', label: 'Satınalma Talepleri', icon: <FilePlus size={18} />, path: '/satinalma-talep' },
        { id: 'satinalma-siparis', label: 'Satınalma Siparişleri', icon: <ShoppingCart size={18} />, path: '/satinalma-siparis' },
        { id: 'malzeme-takip', label: 'Malzeme Sipariş Durum', icon: <PackageSearch size={18} />, path: '/malzeme-siparis-durum' },
      ]
    },
    {
      title: "Satış & Sevkiyat",
      items: [
        { id: 'musteri-siparis', label: 'Müşteri Siparişleri', icon: <FileStack size={18} />, path: '/musteri-siparis' },
        { id: 'siparis-onay', label: 'Sipariş Onay Paneli', icon: <CheckCircle2 size={18} />, path: '/siparis-onay' },
        { id: 'siparis-sablon', label: 'Sipariş Şablonları', icon: <FileJson size={18} />, path: '/siparis-sablon' },
        { id: 'sevk-emri-giris', label: 'Sevk Emri Girişi', icon: <Truck size={18} />, path: '/sevk-emri-giris' },
        { id: 'sevk-emri-liste', label: 'Sevk Emri Listesi', icon: <LayoutList size={18} />, path: '/rapor-sevk-emri' },
        { id: 'musteri-sip-durum', label: 'Müşteri Sipariş Durum', icon: <ClipboardList size={18} />, path: '/musteri-siparis-durum' },
      ]
    },
    {
      title: "Depo & Üretim",
      items: [
        { id: 'stok-hareket', label: 'Stok Hareket Kaydı', icon: <History size={18} />, path: '/stok-hareket' },
        { id: 'depolar-arasi', label: 'Depolar Arası Transfer', icon: <ArrowLeftRight size={18} />, path: '/depolar-arasi' },
        { id: 'stok-sifirlama', label: 'Stok Sıfırlama (Reset)', icon: <RefreshCcw size={18} className="text-rose-500" />, path: '/stok-sifirlama' },
        { id: 'etiket-basim', label: 'Etiket Basım Modülü', icon: <Tag size={18} />, path: '/etiket-basim' },
      ]
    },
    {
      title: "Raporlar & Analiz",
      items: [
        { id: 'operasyon-takip', label: 'Operasyonel Takip', icon: <Truck size={18} className="text-sky-500" />, path: '/operasyon-takip-raporu' },
        { id: 'satis-maliyet', label: 'Satış Maliyet Analizi', icon: <Calculator size={18} />, path: '/satis-maliyet' },
        { id: 'pazar-payi', label: 'Pazar Payı Raporu', icon: <PieChart size={18} />, path: '/pazar-payi' },
        { id: 'siparis-kirilim', label: 'Sipariş Kırılım Raporu', icon: <Target size={18} />, path: '/siparis-kirilim' },
        { id: 'rapor-stok-hareket', label: 'Stok Hareket Raporu', icon: <History size={18} />, path: '/rapor-stok-hareket' },
        { id: 'rapor-depo-bakiye', label: 'Depo Bakiye Raporu', icon: <Database size={18} />, path: '/rapor-depo-bakiye' },
        { id: 'rapor-sayim', label: 'Envanter Sayım Listesi', icon: <ClipboardList size={18} />, path: '/rapor-sayim' },
      ]
    },
    {
      title: "Sistem",
      items: [
        { id: 'kullanici-tanim', label: 'Kullanıcı Tanımları', icon: <UserPlus size={18} />, path: '/kullanici-tanim' },
        { id: 'kullanici-yetki', label: 'Kullanıcı Yetkileri', icon: <ShieldCheck size={18} />, path: '/kullanici-yetki' },
        { id: 'excel-workspace', label: 'Excel Çalışma Alanı', icon: <FileSpreadsheet size={18} />, path: '/excel-workspace' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm z-20`}>
        <div className="p-4 border-b border-slate-100 flex flex-col items-center justify-center min-h-[140px] bg-white">
          <FlexLogo collapsed={!isSidebarOpen} />
          {isSidebarOpen && (
            <div className="mt-4 text-center">
              <h1 className="font-black text-slate-600 text-[13px] tracking-[0.4em] uppercase leading-none">FLEX WMS</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1.5 border-t border-slate-100 pt-1.5">Depo Yönetim Sistemi</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === '/' ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Genel Bakış</span>}
          </Link>
          
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isSidebarOpen ? (
                <button 
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1 mt-4 opacity-70 hover:text-indigo-600 transition-colors group"
                >
                  <span>{group.title}</span>
                  <motion.div
                    animate={{ rotate: expandedGroups[group.title] ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={12} />
                  </motion.div>
                </button>
              ) : (
                <div className="h-px bg-slate-100 my-4 mx-4" />
              )}
              
              <AnimatePresence initial={false}>
                {(expandedGroups[group.title] || !isSidebarOpen) && (
                  <motion.div
                    initial={isSidebarOpen ? { height: 0, opacity: 0 } : false}
                    animate={isSidebarOpen ? { height: 'auto', opacity: 1 } : false}
                    exit={isSidebarOpen ? { height: 0, opacity: 0 } : false}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden space-y-1"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group relative ${location.pathname === item.path ? 'bg-sky-600 text-white shadow-lg shadow-sky-100 font-medium' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
                      >
                        <span className={location.pathname === item.path ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}>
                          {item.icon}
                        </span>
                        {isSidebarOpen && <span className="text-[13px] truncate">{item.label}</span>}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-50">
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             className="w-full flex items-center justify-center p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
           >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 hidden lg:flex">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Sistem Aktif</span>
            </div>
            <button className="relative text-slate-500 hover:text-sky-600 transition-all p-2 hover:bg-slate-50 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3 cursor-pointer group p-1 pr-3 hover:bg-slate-50 rounded-full transition-all">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ring-2 ring-white shadow-sm overflow-hidden">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mustafa" alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">Mustafa Aksoy</p>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Yönetici</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stok-kart" element={<StockList />} />
            <Route path="/siparis-kirilim" element={<OrderBreakdownReport />} />
            <Route path="/satinalma-talep" element={<PurchaseRequisition />} />
            <Route path="/satinalma-siparis" element={<PurchaseOrder />} />
            <Route path="/cari-kart" element={<CustomerList />} />
            <Route path="/depo-tanim" element={<WarehouseList />} />
            <Route path="/depo-hucre" element={<LocationList />} />
            <Route path="/hucre-kapasite" element={<CellCapacityList />} />
            <Route path="/stok-depo-limit" element={<StockWarehouseLimitList />} />
            <Route path="/depo-kapasite" element={<WarehouseCapacityList />} />
            <Route path="/satin-alma-talep" element={<PurchaseRequestList />} />
            <Route path="/satin-alma-siparis" element={<PurchaseOrderList />} />
            <Route path="/satin-alma-irsaliye" element={<PurchaseInvoiceList />} />
            <Route path="/min-stok" element={<MinStockList />} />
            <Route path="/varyant-definition" element={<VariantDefinitionList />} />
            <Route path="/etiket-basim" element={<LabelPrinting />} />
            <Route path="/siparis-onay" element={<OrderApproval />} />
            <Route path="/siparis-sablon" element={<OrderImportTemplate />} />
            <Route path="/musteri-siparis" element={<CustomerOrder />} />
            <Route path="/malzeme-siparis-durum" element={<MaterialOrderTracking />} />
            <Route path="/musteri-siparis-durum" element={<CustomerOrderTracking />} />
            <Route path="/satis-maliyet" element={<SalesCostAnalysis />} />
            <Route path="/pazar-payi" element={<MarketShareReport />} />
            <Route path="/haftalik-durum" element={<WeeklyOrderTracking />} />
            <Route path="/alis-irsaliye" element={<PurchaseInvoice />} />
            <Route path="/satis-irsaliye" element={<SalesInvoicePage />} />
            <Route path="/sevk-emri-giris" element={<ShipmentOrderEntry />} />
            <Route path="/stok-hareket" element={<StockMovementRecord />} />
            <Route path="/uretim-kayit" element={<ProductionRecordPage />} />
            <Route path="/depolar-arasi" element={<WarehouseTransfer />} />
            <Route path="/stok-sifirlama" element={<WarehouseReset />} />
            <Route path="/excel-workspace" element={<SpreadsheetModule />} />
            <Route path="/kullanici-tanim" element={<UserDefinitionPage />} />
            <Route path="/kullanici-yetki" element={<UserPermissions />} />
            <Route path="/operasyon-takip-raporu" element={<OperationalOrderTracking />} />
            <Route path="/rapor-stok-hareket" element={<StockMovementReport />} />
            <Route path="/rapor-depo-bakiye" element={<WarehouseBalanceReport />} />
            <Route path="/rapor-sayim" element={<InventoryCountList />} />
            <Route path="/rapor-tarih-stok" element={<DateRangeStockMovement />} />
            <Route path="/rapor-seri-bakiye" element={<SerialWarehouseBalance />} />
            <Route path="/rapor-seri-sevkiyat" element={<SerialShipmentReport />} />
            <Route path="/rapor-sevk-emri" element={<ShipmentOrderList />} />
            <Route path="/rapor-tarih-seri" element={<SerialMovementAnalysis />} />
            <Route path="/rapor-etiket-basim" element={<LabelPrintReport />} />
            <Route path="/ai-asistan" element={<AiAssistant />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
