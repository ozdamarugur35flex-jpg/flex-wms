
import React, { useState, useMemo } from 'react';
import { 
  History, 
  RotateCcw, 
  FileSpreadsheet, 
  XCircle, 
  Search, 
  Hash, 
  User, 
  Box, 
  Layers, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  LayoutList, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowRightCircle,
  Tag,
  Info,
  Clock,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SerialDetail {
  id: string;
  docNo: string;
  customerName: string;
  date: string;
  serialNo: string;
  quantity: number;
  recordedBy: string;
  revisionNo: string;
  recipeDescription: string;
}

interface ItemSummary {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  quantity: number;
}

const mockSerials: SerialDetail[] = [
  { id: 'S1', docNo: 'IRS2024001', customerName: 'Aksoy Metal Ltd.', date: '2024-03-21', serialNo: 'SR-2024-X01', quantity: 1, recordedBy: 'Mustafa A.', revisionNo: 'R02', recipeDescription: 'Standart Eloksal Kaplama Üretimi' },
  { id: 'S2', docNo: 'IRS2024001', customerName: 'Aksoy Metal Ltd.', date: '2024-03-21', serialNo: 'SR-2024-X02', quantity: 1, recordedBy: 'Mustafa A.', revisionNo: 'R02', recipeDescription: 'Standart Eloksal Kaplama Üretimi' },
  { id: 'S3', docNo: 'IRS2024005', customerName: 'Global Lojistik', date: '2024-03-22', serialNo: 'SR-2024-S99', quantity: 1, recordedBy: 'Ahmet Y.', revisionNo: 'R01', recipeDescription: 'Dış Mekan Mukavemetli Boya Uygulaması' },
  { id: 'S4', docNo: 'IRS2024008', customerName: 'Yılmaz Sanayi', date: '2024-03-24', serialNo: 'SR-2024-P12', quantity: 1, recordedBy: 'Zeynep K.', revisionNo: 'R05', recipeDescription: 'CNC Kesim & Delme Operasyonu' },
];

const mockSummaries: ItemSummary[] = [
  { id: 'I1', invoiceNo: 'IRS2024001', date: '2024-03-21', customerName: 'Aksoy Metal Ltd.', quantity: 120 },
  { id: 'I2', invoiceNo: 'IRS2024005', date: '2024-03-22', customerName: 'Global Lojistik', quantity: 5000 },
  { id: 'I3', invoiceNo: 'IRS2024008', date: '2024-03-24', customerName: 'Yılmaz Sanayi', quantity: 250 },
];

const SerialMovementAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'detail' | 'summary'>('detail');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSerials = useMemo(() => {
    return mockSerials.filter(s => 
      s.serialNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.docNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredSummaries = useMemo(() => {
    return mockSummaries.filter(s => 
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleExportExcel = () => {
    const dataToExport = activeTab === 'detail' ? filteredSerials : filteredSummaries;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seri Analiz");
    XLSX.writeFile(workbook, `Seri_Hareket_Analizi_${activeTab}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><History size={24} /></div>
          <div><h2 className="text-lg font-black text-slate-800 tracking-tight">Analiz: Seri Hareketleri</h2></div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button onClick={() => setActiveTab('detail')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'detail' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>SERİ BİLGİSİ</button>
              <button onClick={() => setActiveTab('summary')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'summary' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>KALEM BİLGİSİ</button>
           </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
         <Search size={18} className="text-slate-400 absolute left-8 mt-2.5" />
         <input type="text" placeholder="Seri no, irsaliye, cari veya personel bilgisi ile akıllı filtreleme..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
         <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead className="sticky top-0 z-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                     <th className="px-8 py-5">Seri Numarası</th>
                     <th className="px-8 py-5">Tarih</th>
                     <th className="px-8 py-5">Belge No</th>
                     <th className="px-8 py-5">Müşteri Bilgisi</th>
                     <th className="px-8 py-5 text-center">Miktar</th>
                     <th className="px-8 py-5 text-right">Kayıt Yapan</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {(activeTab === 'detail' ? filteredSerials : filteredSummaries).map((s: any) => (
                    <tr key={s.id} className="hover:bg-indigo-50/10 transition-all group">
                       <td className="px-8 py-5 font-mono text-xs font-black text-indigo-600">{s.serialNo || s.invoiceNo}</td>
                       <td className="px-8 py-5 text-xs text-slate-500">{s.date}</td>
                       <td className="px-8 py-5 text-xs text-slate-700">{s.docNo || s.invoiceNo}</td>
                       <td className="px-8 py-5 text-xs font-bold text-slate-800">{s.customerName}</td>
                       <td className="px-8 py-5 text-center font-black text-slate-700">{s.quantity}</td>
                       <td className="px-8 py-5 text-right text-[10px] font-black text-slate-500">{s.recordedBy || 'SİSTEM'}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="flex justify-end gap-3 shrink-0">
         <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-50"><RotateCcw size={16} /> YENİ ANALİZ</button>
         <button onClick={handleExportExcel} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-50"><FileSpreadsheet size={16} className="text-emerald-700" /> EXCEL AKTAR</button>
         <button className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl"><XCircle size={16} className="text-rose-500" /> KAPAT</button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, unit?: string, icon: React.ReactNode, color: string }> = ({ label, value, unit, icon, color }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-indigo-200 transition-all cursor-default">
     <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
        {icon}
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none">
           {value} {unit && <span className="text-[10px] text-slate-400 ml-0.5">{unit}</span>}
        </h4>
     </div>
  </div>
);

export default SerialMovementAnalysis;
