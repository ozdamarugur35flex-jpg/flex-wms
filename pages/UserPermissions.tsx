import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  UserCheck, 
  Users, 
  XCircle, 
  Search, 
  LayoutList, 
  CheckCircle2, 
  ShieldAlert, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  MoreHorizontal,
  Lock,
  Database,
  Grid3X3,
  BadgeAlert,
  Zap,
  Filter,
  Check
} from 'lucide-react';
import { UserDefinition, UserPermissionSet, ModulePermission } from '../types';

const mockUsers: UserDefinition[] = [
  { id: '1', username: 'maksoy', fullName: 'Mustafa Aksoy', email: 'mustafa@aksoy.com', receiptSerial: 'MA', isActive: true, isApprovalAuthority1: true, isApprovalAuthority2: false, isFmApprovalAuthority: true },
  { id: '2', username: 'ahmet.yilmaz', fullName: 'Ahmet Yılmaz', email: 'ahmet@yilmaz.com', receiptSerial: 'AY', isActive: true, isApprovalAuthority1: false, isApprovalAuthority2: false, isFmApprovalAuthority: false },
  { id: '3', username: 'zeynep.k', fullName: 'Zeynep Kaya', email: 'zeynep@kaya.com', receiptSerial: 'ZK', isActive: false, isApprovalAuthority1: true, isApprovalAuthority2: true, isFmApprovalAuthority: false },
];

const initialPermissions: ModulePermission[] = [
  { id: 'p1', moduleGroup: 'STOK', formDescription: 'Stok Kartı Tanım', canRead: true, canWrite: true, canDelete: false },
  { id: 'p2', moduleGroup: 'STOK', formDescription: 'Minimum Stok Seviyeleri', canRead: true, canWrite: false, canDelete: false },
  { id: 'p3', moduleGroup: 'DEPO', formDescription: 'Hücre Tanımlama', canRead: true, canWrite: true, canDelete: true },
  { id: 'p4', moduleGroup: 'DEPO', formDescription: 'Depolar Arası Transfer', canRead: true, canWrite: true, canDelete: false },
  { id: 'p5', moduleGroup: 'SATINALMA', formDescription: 'Alış İrsaliyesi', canRead: true, canWrite: true, canDelete: false },
  { id: 'p6', moduleGroup: 'SATIŞ', formDescription: 'Satış İrsaliyesi', canRead: true, canWrite: true, canDelete: false },
  { id: 'p7', moduleGroup: 'FİNANS', formDescription: 'Maliyet Analizi', canRead: false, canWrite: false, canDelete: false },
];

const UserPermissions: React.FC = () => {
  const [users, setUsers] = useState<(UserDefinition & { isSelected: boolean })[]>(
    mockUsers.map(u => ({ ...u, isSelected: false }))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPermissionSet, setCurrentPermissionSet] = useState<UserPermissionSet>({
    userId: '1',
    isSystemAdmin: false,
    isRdPersonnel: false,
    canSeePrices: false,
    permissions: initialPermissions
  });

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const selectedCount = users.filter(u => u.isSelected).length;

  const toggleUserSelection = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isSelected: !u.isSelected } : u));
  };

  const toggleAllUsers = (select: boolean) => {
    setUsers(prev => prev.map(u => ({ ...u, isSelected: select })));
  };

  const updatePermission = (permId: string, field: keyof Omit<ModulePermission, 'id' | 'moduleGroup' | 'formDescription'>) => {
    setCurrentPermissionSet(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => p.id === permId ? { ...p, [field]: !p[field] } : p)
    }));
  };

  // WinForms GRUP equivalent: Grouping permissions by moduleGroup
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, ModulePermission[]> = {};
    currentPermissionSet.permissions.forEach(p => {
      if (!groups[p.moduleGroup]) groups[p.moduleGroup] = [];
      groups[p.moduleGroup].push(p);
    });
    return groups;
  }, [currentPermissionSet]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* LEFT: USER LIST (grdKullanici) */}
      <aside className="w-96 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
         <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                     <Users size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-800">Personel Listesi</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Yetki Grubu Belirleme</p>
                  </div>
               </div>
               <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-200">
                  <RotateCcw size={16} />
               </button>
            </div>
            
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
               <input 
                  type="text" 
                  placeholder="Personel ara..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* Batch Select Controls (btnTumunuSec / btnTumunuSecme) */}
         <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
               <button 
                  onClick={() => toggleAllUsers(true)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:text-indigo-600 transition-all uppercase"
               >Tümünü Seç</button>
               <button 
                  onClick={() => toggleAllUsers(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:text-indigo-600 transition-all uppercase"
               >Seçme</button>
            </div>
            {selectedCount > 0 && (
               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 animate-in zoom-in duration-300">
                  {selectedCount} SEÇİLİ
               </span>
            )}
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1 bg-slate-50/30">
            {filteredUsers.map(user => (
               <div 
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${user.isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30'}`}
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all border ${user.isSelected ? 'bg-white/20 border-white/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {user.fullName.charAt(0)}
                     </div>
                     <div>
                        <p className={`text-xs font-black tracking-tight leading-none mb-1 ${user.isSelected ? 'text-white' : 'text-slate-800'}`}>{user.fullName}</p>
                        <p className={`text-[9px] font-mono font-bold uppercase tracking-widest ${user.isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{user.username}</p>
                     </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${user.isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-100'}`}>
                     {user.isSelected && <Check size={14} />}
                  </div>
               </div>
            ))}
         </div>
      </aside>

      {/* RIGHT: PERMISSION MATRIX (grdYetki) */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* ACTION HEADER (Bar1) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                 <ShieldCheck size={24} />
              </div>
              <div>
                 <h2 className="text-lg font-black text-slate-800 tracking-tight">Yetki Matrisi (Matrix)</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Fonksiyonel Erişim Denetimi</p>
              </div>
           </div>

           <div className="flex items-center gap-2">
              {/* Batch Apply Button (btnYetki) */}
              {selectedCount > 1 && (
                 <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 animate-in slide-in-from-right-4 duration-300">
                    <Zap size={16} /> TOPLU YETKİ UYGULA
                 </button>
              )}
              <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95">
                 <Save size={16} /> DEĞİŞİKLİKLERİ KAYDET
              </button>
              <div className="w-[1px] h-6 bg-slate-200 mx-1" />
              <button className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                 <XCircle size={20} />
              </button>
           </div>
        </div>

        {/* PERMISSION AREA */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
           
           {/* GLOBAL PERMISSIONS (GroupControl1) */}
           <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <ShieldAlert size={18} />
                 </div>
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Global Sistem Rolleri</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <GlobalPermissionCard 
                    label="Sistem Yöneticisi" 
                    desc="Tam erişim ve yönetim yetkisi" 
                    checked={currentPermissionSet.isSystemAdmin}
                    onChange={(v) => setCurrentPermissionSet({...currentPermissionSet, isSystemAdmin: v})}
                 />
                 <GlobalPermissionCard 
                    label="ARGE Personeli" 
                    desc="Prototip ve özel stok yetkisi" 
                    checked={currentPermissionSet.isRdPersonnel}
                    onChange={(v) => setCurrentPermissionSet({...currentPermissionSet, isRdPersonnel: v})}
                    color="bg-sky-500"
                 />
                 <GlobalPermissionCard 
                    label="Fiyat Görme Yetkisi" 
                    desc="Alış/Satış rakamlarını görüntüleme" 
                    checked={currentPermissionSet.canSeePrices}
                    onChange={(v) => setCurrentPermissionSet({...currentPermissionSet, canSeePrices: v})}
                    color="bg-amber-500"
                 />
              </div>
           </div>

           {/* MODULE MATRIX GRID */}
           <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <div className="space-y-12">
                 {/* Fixed error "Property 'map' does not exist on type 'unknown'" on line 246 by using Object.keys for more robust type inference */}
                 {Object.keys(groupedPermissions).map((groupName) => (
                    <div key={groupName} className="space-y-4">
                       <div className="flex items-center gap-4 px-2">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 tracking-[0.2em] uppercase">{groupName} MODÜLÜ</span>
                          <div className="flex-1 h-[1px] bg-slate-100" />
                       </div>
                       <div className="grid grid-cols-1 gap-3">
                          {groupedPermissions[groupName].map(perm => (
                             <div key={perm.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-50/50 group">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                      <LayoutList size={20} />
                                   </div>
                                   <div>
                                      <h4 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1 uppercase">{perm.formDescription}</h4>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Erişim ID: {perm.id.toUpperCase()}</p>
                                   </div>
                                </div>

                                <div className="flex items-center gap-12 mr-8">
                                   <PermissionToggle 
                                      label="OKUMA" 
                                      checked={perm.canRead} 
                                      onChange={() => updatePermission(perm.id, 'canRead')}
                                      color="bg-sky-500"
                                      icon={<Eye size={12}/>}
                                   />
                                   <div className="w-[1px] h-8 bg-slate-100" />
                                   <PermissionToggle 
                                      label="YAZMA" 
                                      checked={perm.canWrite} 
                                      onChange={() => updatePermission(perm.id, 'canWrite')}
                                      color="bg-emerald-500"
                                      icon={<Edit3 size={12}/>}
                                   />
                                   <div className="w-[1px] h-8 bg-slate-100" />
                                   <PermissionToggle 
                                      label="SİLME" 
                                      checked={perm.canDelete} 
                                      onChange={() => updatePermission(perm.id, 'canDelete')}
                                      color="bg-rose-500"
                                      icon={<Trash2 size={12}/>}
                                   />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* FOOTER INFO (Grid Footer equivalent) */}
           <div className="px-8 py-6 bg-slate-900 border-t border-white/5 flex items-center justify-between shrink-0 text-white">
              <div className="flex items-center gap-8">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sistem Yetki Servisi: ÇALIŞIYOR</span>
                 </div>
                 <div className="h-4 w-[1px] bg-white/10" />
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    Tanımlanan Fonksiyon Sayısı: {currentPermissionSet.permissions.length}
                 </p>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                    <Lock size={14} className="text-rose-400" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">İşlem Loglanmaktadır</span>
                 </div>
                 <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">FLEX WMS Security Engine v4.0</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const GlobalPermissionCard: React.FC<{ label: string, desc: string, checked: boolean, onChange: (v: boolean) => void, color?: string }> = ({ label, desc, checked, onChange, color = "bg-indigo-600" }) => (
  <div 
     onClick={() => onChange(!checked)}
     className={`p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group flex items-center justify-between ${checked ? `border-${color.split('-')[1]}-200 bg-${color.split('-')[1]}-50/50 shadow-lg shadow-slate-100` : 'border-slate-100 bg-white hover:border-slate-200'}`}
  >
     <div className="space-y-0.5">
        <h5 className={`text-[11px] font-black uppercase tracking-widest transition-colors ${checked ? `text-${color.split('-')[1]}-700` : 'text-slate-600'}`}>{label}</h5>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{desc}</p>
     </div>
     <div className={`w-12 h-6 rounded-full relative transition-all ${checked ? color : 'bg-slate-200'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7 shadow-md' : 'left-1'}`} />
     </div>
  </div>
);

const PermissionToggle: React.FC<{ label: string, checked: boolean, onChange: () => void, color: string, icon: React.ReactNode }> = ({ label, checked, onChange, color, icon }) => (
  <div 
     onClick={onChange}
     className="flex flex-col items-center gap-2 cursor-pointer group/toggle"
  >
     <span className={`text-[8px] font-black tracking-widest transition-colors ${checked ? `text-${color.split('-')[1]}-600` : 'text-slate-300'}`}>{label}</span>
     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${checked ? `${color} text-white shadow-lg ${color}/30` : 'bg-slate-50 text-slate-300 border border-slate-100 group-hover/toggle:bg-slate-100'}`}>
        {icon}
     </div>
  </div>
);

export default UserPermissions;