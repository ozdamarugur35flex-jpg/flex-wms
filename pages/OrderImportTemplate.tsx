
import React, { useState } from 'react';
import { 
  FileJson, 
  Plus, 
  Save, 
  Trash2, 
  XCircle, 
  FileSpreadsheet, 
  Grid3X3, 
  ListOrdered, 
  Calendar, 
  Package, 
  Hash, 
  FileText, 
  CheckCircle2, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info
} from 'lucide-react';
import { OrderTemplate } from '../types';

const mockTemplates: OrderTemplate[] = [
  { id: '1', name: 'Standart Excel Şablonu', orderCodeCol: 1, lineNoCol: 2, stockCodeCol: 3, stockNameCol: 4, orderDateCol: 5, deliveryDateCol: 6, orderQtyCol: 7, deliveredQtyCol: 8, balanceQtyCol: 9, descriptionCol: 10 },
  { id: '2', name: 'B2B Müşteri Portalı Aktarım', orderCodeCol: 0, lineNoCol: 1, stockCodeCol: 5, stockNameCol: 6, orderDateCol: 2, deliveryDateCol: 3, orderQtyCol: 7, deliveredQtyCol: 8, balanceQtyCol: 9, descriptionCol: 11 },
];

const OrderImportTemplate: React.FC = () => {
  const [templates, setTemplates] = useState<OrderTemplate[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<OrderTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<OrderTemplate>>({
    name: '',
    orderCodeCol: 0,
    lineNoCol: 0,
    stockCodeCol: 0,
    stockNameCol: 0,
    orderDateCol: 0,
    deliveryDateCol: 0,
    orderQtyCol: 0,
    deliveredQtyCol: 0,
    balanceQtyCol: 0,
    descriptionCol: 0
  });

  const handleSave = () => {
    // Save logic
    console.log("Saving template:", formData);
  };

  const handleNew = () => {
    setFormData({
      name: '', orderCodeCol: 0, lineNoCol: 0, stockCodeCol: 0, stockNameCol: 0, 
      orderDateCol: 0, deliveryDateCol: 0, orderQtyCol: 0, deliveredQtyCol: 0, 
      balanceQtyCol: 0, descriptionCol: 0
    });
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <FileJson size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Sipariş Aktarım Şablonu</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Excel Veri Eşleştirme Modülü</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Plus size={16} className="text-indigo-600" /> Yeni
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Save size={16} className="text-emerald-600" /> Kaydet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Trash2 size={16} className="text-rose-600" /> Sil
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* TEMPLATE DEFINITION (GroupControl1) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col xl:flex-row">
        
        {/* Left Side: Form (frmSiparisAktarimSablon Inputs) */}
        <div className="flex-1 p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" /> Şablon Genel Tanımı
            </h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şablon Adı (txtSablonAdi)</label>
              <input 
                type="text" 
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-800"
                placeholder="Şablon ismini giriniz..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Excel Column Definition Header (LabelControl2) */}
          <div className="bg-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <FileSpreadsheet size={24} className="text-emerald-400" />
               </div>
               <div>
                 <h4 className="text-lg font-black tracking-tight">Excel Sütun Eşleştirme</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Excel dosyasındaki sütun indislerini tanımlayın</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Grid3X3 size={80} />
            </div>
          </div>

          {/* Mapping Grid (PanelControl1 Controls) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MappingInput 
              label="Sipariş Kod" 
              icon={<Hash size={14} />} 
              required 
              value={formData.orderCodeCol || 0} 
              onChange={(val) => setFormData({...formData, orderCodeCol: val})}
            />
            <MappingInput 
              label="Kalem No" 
              icon={<ListOrdered size={14} />} 
              required 
              value={formData.lineNoCol || 0} 
              onChange={(val) => setFormData({...formData, lineNoCol: val})}
            />
            <MappingInput 
              label="Stok Kod" 
              icon={<Package size={14} />} 
              required 
              value={formData.stockCodeCol || 0} 
              onChange={(val) => setFormData({...formData, stockCodeCol: val})}
            />
            <MappingInput 
              label="Stok Adı" 
              icon={<FileText size={14} />} 
              value={formData.stockNameCol || 0} 
              onChange={(val) => setFormData({...formData, stockNameCol: val})}
            />
            <MappingInput 
              label="Sipariş Tarih" 
              icon={<Calendar size={14} />} 
              required 
              value={formData.orderDateCol || 0} 
              onChange={(val) => setFormData({...formData, orderDateCol: val})}
            />
            <MappingInput 
              label="Teslim Tarih" 
              icon={<Calendar size={14} />} 
              value={formData.deliveryDateCol || 0} 
              onChange={(val) => setFormData({...formData, deliveryDateCol: val})}
            />
            <MappingInput 
              label="Sipariş Miktar" 
              icon={<Hash size={14} />} 
              required 
              value={formData.orderQtyCol || 0} 
              onChange={(val) => setFormData({...formData, orderQtyCol: val})}
            />
            <MappingInput 
              label="Teslim Miktar" 
              icon={<CheckCircle2 size={14} />} 
              value={formData.deliveredQtyCol || 0} 
              onChange={(val) => setFormData({...formData, deliveredQtyCol: val})}
            />
            <MappingInput 
              label="Bakiye Miktar" 
              icon={<Hash size={14} />} 
              value={formData.balanceQtyCol || 0} 
              onChange={(val) => setFormData({...formData, balanceQtyCol: val})}
            />
            <MappingInput 
              label="Açıklama" 
              icon={<FileText size={14} />} 
              value={formData.descriptionCol || 0} 
              onChange={(val) => setFormData({...formData, descriptionCol: val})}
            />
          </div>

          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 flex items-start gap-3">
            <Info size={18} className="text-sky-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-sky-700 leading-relaxed font-medium">
               <b>İpucu:</b> Excel sütun indisleri 0'dan başlar. Örneğin: A sütunu 0, B sütunu 1, C sütunu 2 olarak tanımlanmalıdır. 
               Kırmızı yıldızla işaretli alanların eşleştirilmesi zorunludur.
            </p>
          </div>
        </div>

        {/* Right Side: Grid (grdSablon) */}
        <div className="w-full xl:w-[450px] bg-slate-50 border-l border-slate-100 p-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">Kayıtlı Şablonlar</h3>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-md">{templates.length} KAYIT</span>
           </div>
           
           <div className="space-y-4">
             {templates.map((template) => (
               <div 
                 key={template.id} 
                 onClick={() => {
                   setSelectedTemplate(template);
                   setFormData(template);
                 }}
                 className={`p-5 rounded-3xl border bg-white transition-all cursor-pointer group hover:shadow-xl hover:shadow-indigo-50/50 ${selectedTemplate?.id === template.id ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm'}`}
               >
                 <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileJson size={20} />
                    </div>
                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                 </div>
                 <p className="text-sm font-black text-slate-800 tracking-tight">{template.name}</p>
                 <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>Eşleşme Sayısı: 10</span>
                    <span className="flex items-center gap-1 group-hover:text-indigo-600 transition-colors">DÜZENLE <ChevronRight size={12} /></span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* FOOTER PAGINATION */}
      <div className="px-8 py-6 bg-white rounded-[2rem] border border-slate-200 flex items-center justify-between shadow-sm">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Flex WMS <span className="mx-2">•</span> Sipariş Aktarım Motoru v1.2
        </p>
        <div className="flex items-center gap-1.5">
          <button className="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30" disabled>
            <ChevronLeft size={20} />
          </button>
          <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100">1</button>
          <button className="p-2 text-slate-400 hover:text-indigo-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for mapping input (SpinEdit equivalent)
const MappingInput: React.FC<{ 
  label: string, 
  icon: React.ReactNode, 
  required?: boolean, 
  value: number, 
  onChange: (val: number) => void 
}> = ({ label, icon, required, value, onChange }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 group hover:border-indigo-200 transition-all">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">{icon}</div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      {required && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Zorunlu Alan" />}
    </div>
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition-all"
      >-</button>
      <input 
        type="number" 
        className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-center text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition-all"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      />
      <button 
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition-all"
      >+</button>
    </div>
  </div>
);

export default OrderImportTemplate;
