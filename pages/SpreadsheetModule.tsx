
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Folder as FolderIcon, 
  FolderPlus, 
  FilePlus, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Trash2, 
  Save, 
  Download, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  X,
  Plus,
  ArrowLeft,
  LayoutGrid,
  Lock,
  Share2,
  Database,
  ChevronLeft,
  MousePointer2,
  Maximize2,
  Minimize2,
  Settings2,
  MoreVertical,
  Type,
  Info,
  Palette,
  Eraser,
  Baseline,
  ChevronUp,
  UploadCloud,
  FileUp,
  RefreshCcw,
  AlertTriangle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { FileSystemItem, SpreadsheetFile, Folder, SpreadsheetData, SpreadsheetCell, SpreadsheetSheet } from '../types';

const COLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ROWS = Array.from({ length: 50 }, (_, i) => i + 1);

const FONT_FAMILIES = [
  "Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Courier New", "Inter", "system-ui"
];

const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72
];

const SpreadsheetModule: React.FC = () => {
  const currentUserId = "mustafa_aksoy_123";
  const nameInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const bgColorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State Management
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(() => {
    try {
      const saved = localStorage.getItem('flex_spreadsheet_fs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Veri okuma hatası:", e);
    }
    return [];
  });
  
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSpreadsheetFullscreen, setIsSpreadsheetFullscreen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [storageError, setStorageError] = useState<string | null>(null);
  
  // Creation Modal State
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'folder' | 'file'>('folder');
  const [newName, setNewName] = useState('');

  // Active File Reference
  const activeFile = useMemo(() => 
    fileSystem.find(item => item && item.id === activeFileId && item.type === 'file') as SpreadsheetFile | undefined
  , [activeFileId, fileSystem]);

  // Active Sheet Reference
  const activeSheet = useMemo(() => {
    if (!activeFile || !activeFile.sheets) return null;
    return activeFile.sheets.find(s => s.id === activeFile.activeSheetId) || activeFile.sheets[0];
  }, [activeFile]);

  // Evaluator function for Excel formulas
  const evaluateValue = (val: string, data: SpreadsheetData): string => {
    if (!val || !val.startsWith('=')) return val;
    
    try {
      const formula = val.substring(1).toUpperCase();
      
      if (formula.startsWith('SUM(')) {
        const range = formula.match(/\((.*?)\)/)?.[1];
        if (range && range.includes(':')) {
          const [start, end] = range.split(':');
          const startCol = start[0];
          const startRow = parseInt(start.substring(1));
          const endCol = end[0];
          const endRow = parseInt(end.substring(1));
          
          let sum = 0;
          for (let r = startRow; r <= endRow; r++) {
            const cellId = `${startCol}${r}`;
            const cellValue = parseFloat(data[cellId]?.value || '0');
            if (!isNaN(cellValue)) sum += cellValue;
          }
          return sum.toString();
        }
      }

      const mathFormula = formula.replace(/[A-Z][0-9]+/g, (match) => {
        const cellVal = parseFloat(data[match]?.value || '0');
        return isNaN(cellVal) ? '0' : cellVal.toString();
      });
      
      return eval(mathFormula).toString();
    } catch (e) {
      return "#FORMÜL!";
    }
  };

  // Sync to LocalStorage with error handling
  useEffect(() => {
    try {
      const dataString = JSON.stringify(fileSystem);
      localStorage.setItem('flex_spreadsheet_fs', dataString);
      setStorageError(null);
    } catch (e) {
      console.error("LocalStorage Kayıt Hatası:", e);
      setStorageError("Hafıza limiti aşıldı! Bazı dosyaları silmeniz gerekebilir.");
    }
  }, [fileSystem]);

  // Handlers
  const handleCreateFile = () => {
    openCreateModal('file');
  };

  const handleConfirmCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim()) return;

    const newId = Math.random().toString(36).substr(2, 9) + Date.now();
    
    if (createType === 'folder') {
      const newFolder: Folder = {
        id: newId,
        name: newName.trim(),
        parentId: activeFolderId,
        ownerId: currentUserId,
        createdAt: new Date().toISOString(),
        type: 'folder'
      };
      setFileSystem(prev => [...prev, newFolder]);
    } else {
      const sheetId = 'sheet-1';
      const newFile: SpreadsheetFile = {
        id: newId,
        name: newName.trim(),
        parentId: activeFolderId,
        ownerId: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sheets: [{ id: sheetId, name: 'Sayfa 1', data: {} }],
        activeSheetId: sheetId,
        type: 'file'
      };
      setFileSystem(prev => [...prev, newFile]);
      setActiveFileId(newId);
    }
    setCreateModalOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    setImportProgress({ current: 0, total: files.length });

    const newFiles: SpreadsheetFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setImportProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        
        const importedSheets: SpreadsheetSheet[] = workbook.SheetNames.map((name, index) => {
          const worksheet = workbook.Sheets[name];
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const spreadsheetData: SpreadsheetData = {};

          jsonData.forEach((row, rowIndex) => {
            if (rowIndex > 100) return; // Performans için ilk 100 satır sınırı (opsiyonel)
            if (Array.isArray(row)) {
              row.forEach((cellValue, colIndex) => {
                if (colIndex > 25) return; // A-Z arası sütun sınırı
                if (cellValue !== null && cellValue !== undefined) {
                  const colLetter = String.fromCharCode(65 + colIndex);
                  const cellId = `${colLetter}${rowIndex + 1}`;
                  spreadsheetData[cellId] = {
                    value: String(cellValue),
                    align: typeof cellValue === 'number' ? 'right' : 'left',
                    color: '#000000',
                    background: '#ffffff',
                    fontFamily: 'Inter',
                    fontSize: 12
                  };
                }
              });
            }
          });

          return {
            id: `sheet-${Date.now()}-${i}-${index}`,
            name: name || `Sayfa ${index + 1}`,
            data: spreadsheetData
          };
        });

        const newId = 'file-' + Math.random().toString(36).substr(2, 9) + Date.now();
        const newFile: SpreadsheetFile = {
          id: newId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          parentId: activeFolderId,
          ownerId: currentUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          sheets: importedSheets.length > 0 ? importedSheets : [{ id: `sheet-${Date.now()}-empty`, name: 'Sayfa 1', data: {} }],
          activeSheetId: importedSheets[0]?.id || `sheet-${Date.now()}-empty`,
          type: 'file'
        };

        newFiles.push(newFile);
      } catch (error) {
        console.error(`Dosya işlenirken hata oluştu: ${file.name}`, error);
      }
    }

    if (newFiles.length > 0) {
      setFileSystem(prev => [...prev, ...newFiles]);
      setActiveFileId(newFiles[newFiles.length - 1].id);
    }

    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateActiveFile = (updater: (file: SpreadsheetFile) => SpreadsheetFile) => {
    setFileSystem(prev => prev.map(item => {
      if (item && item.id === activeFileId && item.type === 'file') {
        return updater(item as SpreadsheetFile);
      }
      return item;
    }));
  };

  const addSheet = () => {
    const newSheetId = `sheet-${Date.now()}`;
    updateActiveFile(file => ({
      ...file,
      sheets: [...(file.sheets || []), { id: newSheetId, name: `Sayfa ${(file.sheets?.length || 0) + 1}`, data: {} }],
      activeSheetId: newSheetId
    }));
  };

  const switchSheet = (id: string) => {
    updateActiveFile(file => ({ ...file, activeSheetId: id }));
    setSelectedCell(null);
  };

  const renameSheet = (id: string) => {
    const newName = prompt("Sayfa ismi:");
    if (!newName) return;
    updateActiveFile(file => ({
      ...file,
      sheets: file.sheets.map(s => s.id === id ? { ...s, name: newName } : s)
    }));
  };

  const updateCell = (cellId: string, value: string) => {
    updateActiveFile(file => ({
      ...file,
      updatedAt: new Date().toISOString(),
      sheets: file.sheets.map(s => s.id === file.activeSheetId ? {
        ...s,
        data: {
          ...s.data,
          [cellId]: {
            ...(s.data[cellId] || {}),
            value: value.startsWith('=') ? evaluateValue(value, s.data) : value,
            formula: value.startsWith('=') ? value : undefined
          }
        }
      } : s)
    }));
  };

  const applyFormatting = (format: Partial<SpreadsheetCell>) => {
    if (!selectedCell) return;
    updateActiveFile(file => ({
      ...file,
      sheets: file.sheets.map(s => s.id === file.activeSheetId ? {
        ...s,
        data: {
          ...s.data,
          [selectedCell]: { ...(s.data[selectedCell] || { value: "" }), ...format }
        }
      } : s)
    }));
  };

  const clearFormatting = () => {
    if (!selectedCell) return;
    updateActiveFile(file => ({
      ...file,
      sheets: file.sheets.map(s => s.id === file.activeSheetId ? {
        ...s,
        data: {
          ...s.data,
          [selectedCell]: { 
            value: s.data[selectedCell]?.value || "",
            formula: s.data[selectedCell]?.formula,
            bold: false,
            italic: false,
            underline: false,
            align: 'left',
            color: '#000000',
            background: '#ffffff',
            fontFamily: 'Inter',
            fontSize: 12
          }
        }
      } : s)
    }));
  };

  const openCreateModal = (type: 'folder' | 'file') => {
    setCreateType(type);
    setNewName('');
    setCreateModalOpen(true);
  };

  const deleteItem = (id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    setFileSystem(prev => prev.filter(i => i && i.id !== id && i.parentId !== id));
    if (activeFileId === id) setActiveFileId(null);
  };

  const renderFolderTree = (parentId: string | null = null, depth = 0) => {
    const items = fileSystem
      .filter(item => item && item.parentId === parentId)
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1));
    
    return items.map(item => (
      <div key={item.id} className="select-none group">
        <div 
          onClick={() => item.type === 'folder' ? setActiveFolderId(item.id) : setActiveFileId(item.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer mb-0.5 transition-all ${activeFolderId === item.id ? 'bg-indigo-600 text-white shadow-md' : activeFileId === item.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
          style={{ marginLeft: `${depth * 0.75}rem` }}
        >
          {item.type === 'folder' ? <FolderIcon size={16} /> : <FileSpreadsheet size={16} />}
          <span className="text-xs font-bold truncate flex-1 uppercase tracking-tight">{item.name}</span>
          <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
        {item.type === 'folder' && renderFolderTree(item.id, depth + 1)}
      </div>
    ));
  };

  const currentCellData = selectedCell && activeSheet?.data ? activeSheet.data[selectedCell] : null;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500 overflow-hidden text-slate-900 relative" ref={containerRef}>
      
      {/* HIDDEN FILE INPUT */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".xlsx, .xls" 
        multiple
        onChange={handleFileUpload}
      />

      {/* STORAGE ERROR NOTIFICATION */}
      {storageError && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertTriangle size={20} />
          <span className="text-xs font-black uppercase tracking-widest">{storageError}</span>
          <button onClick={() => setStorageError(null)}><X size={16}/></button>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-500 flex flex-col relative overflow-hidden ${isSidebarOpen ? 'w-80' : 'w-0 opacity-0'} ${isSpreadsheetFullscreen ? 'hidden' : ''}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <LayoutGrid size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">Dosya Sistemi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-all">
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <button onClick={() => openCreateModal('folder')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter shadow-sm active:scale-95">
              <FolderPlus size={14} /> Klasör
            </button>
            <button onClick={() => openCreateModal('file')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all text-[10px] font-black uppercase tracking-tighter active:scale-95">
              <FilePlus size={14} /> Excel
            </button>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className={`w-full flex items-center justify-center gap-2 py-2.5 border rounded-xl transition-all text-[10px] font-black uppercase tracking-tighter shadow-sm active:scale-95 disabled:opacity-50 ${isImporting ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
          >
            {isImporting ? (
              <>
                <RefreshCcw size={14} className="animate-spin" />
                Yükleniyor ({importProgress.current}/{importProgress.total})
              </>
            ) : (
              <>
                <FileUp size={14} />
                Excel Yükle (Toplu)
              </>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <div 
            onClick={() => setActiveFolderId(null)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer mb-2 transition-all border ${!activeFolderId ? 'bg-slate-900 text-white border-slate-800 shadow-md' : 'text-slate-400 border-transparent hover:bg-slate-100'}`}
          >
            <Database size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Root (Ana Dizin)</span>
          </div>
          {renderFolderTree()}
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className={`flex-1 flex flex-col gap-4 transition-all duration-500 ${isSpreadsheetFullscreen ? 'fixed inset-0 z-[60] bg-slate-50 p-6' : 'relative overflow-hidden'}`}>
        {!isSidebarOpen && !isSpreadsheetFullscreen && (
          <button onClick={() => setSidebarOpen(true)} className="absolute left-0 top-0 mt-4 -ml-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl z-20 hover:scale-110 transition-transform active:scale-95">
            <ChevronRight size={20} />
          </button>
        )}

        {activeFile && activeSheet ? (
          <>
            {/* TOOLBAR */}
            <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3 shrink-0">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 flex-wrap">
                    <select 
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all min-w-[140px] shadow-sm"
                      value={currentCellData?.fontFamily || "Inter"}
                      onChange={(e) => applyFormatting({ fontFamily: e.target.value })}
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                      ))}
                    </select>

                    <select 
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all w-20 shadow-sm"
                      value={currentCellData?.fontSize || 12}
                      onChange={(e) => applyFormatting({ fontSize: parseInt(e.target.value) })}
                    >
                      {FONT_SIZES.map(size => (
                        <option key={size} value={size}>{size} px</option>
                      ))}
                    </select>

                    <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                    <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-sm">
                      <button onClick={() => applyFormatting({ bold: !currentCellData?.bold })} className={`p-2 rounded-lg transition-all ${currentCellData?.bold ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-400'}`}>
                        <Bold size={16} />
                      </button>
                      <button onClick={() => applyFormatting({ italic: !currentCellData?.italic })} className={`p-2 rounded-lg transition-all ${currentCellData?.italic ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-400'}`}>
                        <Italic size={16} />
                      </button>
                      <button onClick={() => applyFormatting({ underline: !currentCellData?.underline })} className={`p-2 rounded-lg transition-all ${currentCellData?.underline ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white text-slate-400'}`}>
                        <Underline size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-sm">
                      <div className="relative group">
                        <button onClick={() => textColorInputRef.current?.click()} className="p-2 rounded-lg hover:bg-white text-slate-600 flex flex-col items-center">
                          <Baseline size={16} />
                          <div className="w-4 h-0.5 mt-0.5" style={{ backgroundColor: currentCellData?.color || '#000000' }} />
                        </button>
                        <input ref={textColorInputRef} type="color" className="sr-only" value={currentCellData?.color || '#000000'} onChange={(e) => applyFormatting({ color: e.target.value })} />
                      </div>
                      <div className="relative group">
                        <button onClick={() => bgColorInputRef.current?.click()} className="p-2 rounded-lg hover:bg-white text-slate-600 flex flex-col items-center">
                          <Palette size={16} />
                          <div className="w-4 h-0.5 mt-0.5" style={{ backgroundColor: currentCellData?.background || '#ffffff' }} />
                        </button>
                        <input ref={bgColorInputRef} type="color" className="sr-only" value={currentCellData?.background || '#ffffff'} onChange={(e) => applyFormatting({ background: e.target.value })} />
                      </div>
                      <button onClick={clearFormatting} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500" title="Biçimlendirmeyi Temizle">
                        <Eraser size={16} />
                      </button>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-2xl border border-indigo-100">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedCell || '--'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => setIsSpreadsheetFullscreen(!isSpreadsheetFullscreen)} className={`p-2.5 rounded-xl transition-all border ${isSpreadsheetFullscreen ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-sm active:scale-95'}`}>
                          {isSpreadsheetFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                       </button>
                       <button onClick={() => setActiveFileId(null)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 transition-all shadow-sm active:scale-95">
                          <X size={18} />
                       </button>
                       <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                          <Save size={18} /> KAYDET
                       </button>
                    </div>
                 </div>
               </div>

               <div className="px-1 py-1 rounded-2xl flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-xs font-black italic text-indigo-400 select-none">fx</div>
                  <input 
                     type="text" 
                     className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-300 transition-all" 
                     placeholder="Formül (=SUM(A1:A5)) veya veri girişi..."
                     value={selectedCell && activeSheet?.data ? (activeSheet.data[selectedCell]?.formula || activeSheet.data[selectedCell]?.value || "") : ""}
                     onChange={(e) => selectedCell && updateCell(selectedCell, e.target.value)}
                  />
               </div>
            </div>

            {/* GRID */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
               <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <table className="border-collapse table-fixed w-full">
                     <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-50">
                           <th className="w-12 h-10 border border-slate-200 bg-slate-100 sticky left-0 z-30"></th>
                           {COLS.map(col => (
                              <th key={col} className="w-32 h-10 border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center shadow-sm">
                                 {col}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {ROWS.map(row => (
                           <tr key={row}>
                              <td className="w-12 h-8 border border-slate-200 bg-slate-50 sticky left-0 z-10 text-[9px] font-black text-slate-400 text-center select-none shadow-sm">
                                 {row}
                              </td>
                              {COLS.map(col => {
                                 const id = `${col}${row}`;
                                 const cell = activeSheet?.data?.[id];
                                 const isSelected = selectedCell === id;
                                 return (
                                    <td 
                                       key={id}
                                       onClick={() => setSelectedCell(id)}
                                       className={`border border-slate-100 h-8 p-0 relative transition-all ${isSelected ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/10 z-10' : 'hover:bg-slate-50'}`}
                                       style={{ backgroundColor: cell?.background || '#ffffff' }}
                                    >
                                       <input 
                                          type="text"
                                          className={`w-full h-full bg-transparent border-none outline-none px-2 transition-all ${
                                             cell?.bold ? 'font-bold' : 'font-medium'
                                          } ${cell?.italic ? 'italic' : ''} ${cell?.underline ? 'underline' : ''}`}
                                          style={{ 
                                             textAlign: cell?.align || 'left', 
                                             color: cell?.color || '#000000',
                                             fontFamily: cell?.fontFamily || 'Inter',
                                             fontSize: cell?.fontSize ? `${cell.fontSize}px` : '12px'
                                          }}
                                          value={cell?.value || ""}
                                          onChange={(e) => updateCell(id, e.target.value)}
                                          onFocus={() => setSelectedCell(id)}
                                       />
                                    </td>
                                 );
                              })}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="bg-slate-50 p-2 border-t border-slate-200 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-2">
                     <button onClick={addSheet} className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all active:scale-90" title="Sayfa Ekle">
                        <Plus size={16} />
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                     {activeFile.sheets?.map(sheet => (
                        <div 
                           key={sheet.id}
                           onDoubleClick={() => renameSheet(sheet.id)}
                           onClick={() => switchSheet(sheet.id)}
                           className={`flex items-center gap-2 px-6 py-2 rounded-t-xl cursor-pointer text-[10px] font-black uppercase transition-all border-x border-t relative group ${activeFile.activeSheetId === sheet.id ? 'bg-white text-indigo-600 border-slate-200 -mb-[9px] z-10 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.1)]' : 'bg-slate-100 text-slate-400 border-transparent hover:bg-slate-200'}`}
                        >
                           {sheet.name}
                           {activeFile.sheets.length > 1 && (
                              <button onClick={(e) => { e.stopPropagation(); updateActiveFile(f => ({ ...f, sheets: f.sheets.filter(s => s.id !== sheet.id) })) }} className="opacity-0 group-hover:opacity-100 hover:text-rose-500 ml-1 transition-all">
                                 <X size={10} />
                              </button>
                           )}
                           {activeFile.activeSheetId === sheet.id && (
                              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-indigo-600" />
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm gap-6 p-20 text-center animate-in fade-in zoom-in duration-700">
             <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 shadow-inner relative">
                <FileSpreadsheet size={64} />
                <button onClick={handleCreateFile} className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-indigo-600 border border-indigo-100 hover:scale-110 transition-transform active:scale-95">
                   <Plus size={24} />
                </button>
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Excel Çalışma Alanı</h3>
                <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">Sol taraftan bir dosya seçin, yeni bir çalışma kitabı oluşturun veya mevcut Excel dosyalarını (toplu seçim desteğiyle) yükleyin.</p>
             </div>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className={`p-8 border-b border-slate-100 flex items-center justify-between ${createType === 'folder' ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
                <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                   {createType === 'folder' ? 'Yeni Klasör' : 'Yeni Excel'}
                </h3>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 text-slate-400 hover:bg-white rounded-xl transition-all">
                   <X size={24} />
                </button>
             </div>

             <form onSubmit={handleConfirmCreate} className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İSİMLENDİRME</label>
                   <input ref={nameInputRef} type="text" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-lg font-black outline-none focus:border-indigo-500 transition-all shadow-inner" placeholder="İsim giriniz..." value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
                </div>
                <div className="flex items-center gap-3 pt-4">
                   <button type="button" onClick={() => setCreateModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">İPTAL</button>
                   <button type="submit" disabled={!newName.trim()} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50">OLUŞTUR</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetModule;
