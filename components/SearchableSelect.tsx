
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
        {label}
      </label>
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? `${selectedOption.value} | ${selectedOption.label}` : placeholder}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 min-w-full lg:min-w-[400px] mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`px-5 py-3 hover:bg-emerald-50 cursor-pointer transition-colors border-b border-slate-50 last:border-none ${value === opt.value ? 'bg-emerald-50' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">{opt.value}</span>
                      <span className="text-xs font-bold text-slate-500">{opt.label}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                  Sonuç bulunamadı
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchableSelect;
