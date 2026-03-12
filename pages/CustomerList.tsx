
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Save, Trash2, RotateCcw, FileSpreadsheet, XCircle, Search, Filter,
  ChevronLeft, ChevronRight, MoreHorizontal, Mail, Phone, MapPin, Building2,
  Contact, CreditCard, Truck, FileText, BadgeInfo, Globe, UserPlus, Hash, MessageSquare, Loader2
} from 'lucide-react';
import { CustomerCard } from '../types';
import { apiService } from '../api';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<CustomerCard>>({
    code: '',
    name: '',
    type: 'Alıcı',
    locationType: 'Yurt İçi',
    taxNumber: '',
    taxOffice: '',
    phone: '',
    email: ''
  });

  const loadCustomers = async () => {
    setLoading(true);
    const data = await apiService.customers.getAll();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      alert("Cari kod ve isim zorunludur!");
      return;
    }
    
    try {
      const result = await apiService.customers.save(formData);
      if (result.success) {
        setIsModalOpen(false);
        setFormData({ type: 'Alıcı', locationType: 'Yurt İçi' });
        loadCustomers();
      }
    } catch (error) {
      console.error('Cari kart kaydedilirken hata oluştu:', error);
      alert('Kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (code: string) => {
    if (window.confirm('Bu cari kartı silmek istediğinize emin misiniz?')) {
      try {
        const result = await apiService.customers.delete(code);
        if (result.success) {
          loadCustomers();
        }
      } catch (error) {
        console.error('Cari kart silinirken hata oluştu:', error);
        alert('Silinirken bir hata oluştu.');
      }
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (c.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Cari Kart Tanımlama</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-xs">CASABIT Entegrasyonu</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => {
            setFormData({ type: 'Alıcı', locationType: 'Yurt İçi', code: '', name: '', phone: '', email: '', taxNumber: '', taxOffice: '' });
            setIsModalOpen(true);
          }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-md">
            <UserPlus size={16} /> Yeni Cari
          </button>
          <button onClick={loadCustomers} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className={loading ? 'animate-spin' : ''} /> Yenile
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">Yeni Cari Kart</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">Netsis Cari Kayıt Formu</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari Kodu</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="Örn: 120-01-001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari İsim</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Müşteri veya Tedarikçi Adı"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cari Tipi</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="Alıcı">Alıcı (120)</option>
                  <option value="Satıcı">Satıcı (320)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yerleşke</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  value={formData.locationType}
                  onChange={(e) => setFormData({...formData, locationType: e.target.value as any})}
                >
                  <option value="Yurt İçi">Yurt İçi</option>
                  <option value="Yurt Dışı">Yurt Dışı</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vergi Numarası</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({...formData, taxNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:border-indigo-500 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all">İptal</button>
              <button onClick={handleSave} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                <Save size={18} /> Kaydet (F2)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari kod veya isim ile ara..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cari Bilgisi</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Tip</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">İletişim</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vergi No</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer, index) => (
                  <tr key={customer.code || customer.id || index} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black ${customer.type === 'Alıcı' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>
                          {customer.type === 'Alıcı' ? 'A' : 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{customer.name || 'İSİMSİZ CARİ'}</p>
                          <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{customer.code || 'KODSUZ'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                        {customer.locationType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-600">{customer.phone}</p>
                      <p className="text-xs font-medium text-slate-400">{customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono text-slate-500 uppercase">{customer.taxNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleDelete(customer.code)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-all"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-all">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && <div className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest">Kayıt Bulunamadı</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
