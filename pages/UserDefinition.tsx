
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Save, 
  Trash2, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Key, 
  Hash, 
  CheckCircle2, 
  MoreHorizontal, 
  Eye, 
  EyeOff,
  UserCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { UserDefinition } from '../types';

const mockUsers: UserDefinition[] = [
  { id: '1', username: 'maksoy', fullName: 'Mustafa Aksoy', email: 'mustafa@aksoy.com', receiptSerial: 'MA', isActive: true, isApprovalAuthority1: true, isApprovalAuthority2: false, isFmApprovalAuthority: true, lastLogin: '2024-03-21 09:15' },
  { id: '2', username: 'ahmet.yilmaz', fullName: 'Ahmet Yılmaz', email: 'ahmet@yilmaz.com', receiptSerial: 'AY', isActive: true, isApprovalAuthority1: false, isApprovalAuthority2: false, isFmApprovalAuthority: false, lastLogin: '2024-03-21 11:20' },
  { id: '3', username: 'zeynep.k', fullName: 'Zeynep Kaya', email: 'zeynep@kaya.com', receiptSerial: 'ZK', isActive: false, isApprovalAuthority1: true, isApprovalAuthority2: true, isFmApprovalAuthority: false, lastLogin: '2024-03-20 16:45' },
];

const UserDefinitionPage: React.FC = () => {
  const [users, setUsers] = useState<UserDefinition[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Partial<UserDefinition>>({
    isActive: true,
    isApprovalAuthority1: false,
    isApprovalAuthority2: false,
    isFmApprovalAuthority: false
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* TOOLBAR (BarManager1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Kullanıcı Tanımlama</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Sistem Erişim & Yetki Yönetimi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSelectedUser({ isActive: true, isApprovalAuthority1: false, isApprovalAuthority2: false, isFmApprovalAuthority: false })}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            <UserPlus size={16} className="text-indigo-600" /> Yeni
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
            <Save size={16} /> Kaydet
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <Trash2 size={16} className="text-rose-600" /> Sil
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <RotateCcw size={16} className="text-sky-600" /> Listele
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
            <FileSpreadsheet size={16} className="text-emerald-700" /> Excel
          </button>
          <button className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
            <XCircle size={20} />
          </button>
        </div>
      </div>

      {/* MAIN FORM (GroupControl1) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* User Identity Info */}
        <div className="xl:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none rotate-12">
              <User size={240} />
           </div>

           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <UserCheck size={18} className="text-indigo-500" /> Kullanıcı Kimlik Bilgileri
                 </h3>
                 <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded border border-indigo-100">PROFIL</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-500 transition-colors">
                       <User size={12} /> Kullanıcı Adı (txtKullanici)
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" 
                      placeholder="Username..."
                      value={selectedUser.username || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                    />
                 </div>
                 <div className="md:col-span-2 space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-500 transition-colors">
                       <Database size={12} /> Adı Soyadı (txtAdiSoyadi)
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" 
                      placeholder="Personel tam ismi..."
                      value={selectedUser.fullName || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, fullName: e.target.value})}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-500 transition-colors">
                       <Key size={12} /> Sistem Şifresi (txtSifre)
                    </label>
                    <div className="relative">
                       <input 
                         type={showPassword ? "text" : "password"} 
                         className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" 
                         placeholder="••••••••"
                       />
                       <button 
                         onClick={() => setShowPassword(!showPassword)}
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors"
                       >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                    </div>
                 </div>
                 <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-indigo-500 transition-colors">
                       <Mail size={12} /> E-Posta Adresi (txtEPosta)
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all" 
                      placeholder="ornek@sirket.com"
                      value={selectedUser.email || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Roles & Status (CheckEdits) */}
        <div className="xl:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between relative z-10">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Yetkiler & Durum</h4>
              <ShieldCheck size={18} className="text-indigo-500" />
           </div>

           <div className="space-y-4 relative z-10">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 group">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İşlem Fiş Seri (txtFisSeriNo)</label>
                 <div className="relative">
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-lg font-black text-center text-indigo-400 outline-none focus:bg-white/10 focus:border-indigo-500 transition-all uppercase" 
                      maxLength={2}
                      placeholder="AA"
                      value={selectedUser.receiptSerial || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, receiptSerial: e.target.value})}
                    />
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <ToggleField 
                   label="Hesap Aktif" 
                   desc="Sisteme giriş izni" 
                   checked={selectedUser.isActive || false} 
                   onChange={(val) => setSelectedUser({...selectedUser, isActive: val})}
                 />
                 <div className="h-[1px] bg-white/5 w-full my-2" />
                 <ToggleField 
                   label="İzin Amir-1" 
                   desc="Birinci seviye onay yetkisi" 
                   checked={selectedUser.isApprovalAuthority1 || false} 
                   onChange={(val) => setSelectedUser({...selectedUser, isApprovalAuthority1: val})}
                 />
                 <ToggleField 
                   label="İzin Amir-2" 
                   desc="Üst düzey onay yetkisi" 
                   checked={selectedUser.isApprovalAuthority2 || false} 
                   onChange={(val) => setSelectedUser({...selectedUser, isApprovalAuthority2: val})}
                 />
                 <ToggleField 
                   label="FM Onay Amir" 
                   desc="Mali onay yetki havuzu" 
                   checked={selectedUser.isFmApprovalAuthority || false} 
                   onChange={(val) => setSelectedUser({...selectedUser, isFmApprovalAuthority: val})}
                 />
              </div>
           </div>
           
           <div className="absolute -bottom-8 -right-8 opacity-5">
              <ShieldAlert size={160} />
           </div>
        </div>
      </div>

      {/* USER LIST GRID (grdKullanici) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                  <RotateCcw size={20} />
               </div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Tanımlı Kullanıcı Listesi (GridView1)</h3>
            </div>
            
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Kullanıcı, isim veya e-posta ara..." 
                 className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Durum</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kullanıcı Bilgisi</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">E-Posta Adresi</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fiş Seri</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Son Erişim</th>
                     <th className="px-8 py-5 text-right w-16"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                     <tr 
                       key={u.id} 
                       className="hover:bg-indigo-50/10 transition-colors group cursor-pointer"
                       onClick={() => setSelectedUser(u)}
                     >
                        <td className="px-8 py-5 text-center">
                           <div className={`inline-flex items-center justify-center w-3 h-3 rounded-full border-2 ${u.isActive ? 'bg-emerald-500 border-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-300 border-slate-100'}`} />
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all group-hover:border-indigo-500">
                                 {u.fullName.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{u.fullName}</p>
                                 <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">{u.username}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <p className="text-xs font-medium text-slate-600 flex items-center gap-2 italic">
                              <Mail size={12} className="text-slate-300" /> {u.email}
                           </p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black font-mono border border-slate-200">
                              {u.receiptSerial}
                           </span>
                        </td>
                        <td className="px-8 py-5">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{u.lastLogin || 'HİÇ GİRİŞ YAPILMADI'}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100 transition-all">
                              <MoreHorizontal size={18} />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            {filteredUsers.length === 0 && (
               <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                  <Database size={64} />
                  <p className="text-xs font-black uppercase tracking-widest">Kullanıcı Kaydı Bulunamadı</p>
               </div>
            )}
         </div>

         {/* GRID FOOTER SUMMARY */}
         <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gösterilen Kayıt: <span className="text-slate-800">{filteredUsers.length}</span></p>
               <div className="h-4 w-[1px] bg-slate-200" />
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Aktif: {users.filter(u=>u.isActive).length}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-slate-400" />
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Pasif: {users.filter(u=>!u.isActive).length}</span>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <button className="p-2 text-slate-300 hover:text-indigo-600 disabled:opacity-30"><ChevronLeft size={20} /></button>
               <button className="w-8 h-8 bg-indigo-600 text-white rounded-lg text-xs font-black shadow-md">1</button>
               <button className="p-2 text-slate-300 hover:text-indigo-600"><ChevronRight size={20} /></button>
            </div>
         </div>
      </div>
      
      {/* SECURITY INFO BAR */}
      <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-4 shadow-sm">
         <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <Lock size={20} />
         </div>
         <div className="space-y-1">
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest leading-none">Güvenlik Politikası</h4>
            <p className="text-xs text-amber-700/80 leading-relaxed font-medium">Kullanıcı şifreleri sistemde 256-bit hash algoritması ile saklanmaktadır. Fiş Seri No alanı, her kullanıcının oluşturacağı belgelerin (İrsaliye, Sipariş vb.) ayrıştırılması için kritik öneme sahiptir.</p>
         </div>
      </div>
    </div>
  );
};

// Sub-components
const ToggleField: React.FC<{ label: string, desc: string, checked: boolean, onChange: (val: boolean) => void }> = ({ label, desc, checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group"
  >
     <div className="space-y-0.5">
        <p className="text-xs font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">{label}</p>
        <p className="text-[9px] text-slate-500 font-bold group-hover:text-slate-400 transition-colors">{desc}</p>
     </div>
     <div className={`w-10 h-5 rounded-full relative transition-all ${checked ? 'bg-indigo-500' : 'bg-white/10'}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-5.5 shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'left-0.5 opacity-20'}`} />
     </div>
  </div>
);

export default UserDefinitionPage;
