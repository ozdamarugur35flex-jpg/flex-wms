
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RotateCcw, 
  Trash2,
  Database,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Merhaba! Ben FLEX WMS Akıllı Asistanı. Hem bu proje ile ilgili sorularınızı hem de genel merak ettiğiniz her şeyi bana sorabilirsiniz. Size nasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const streamResponse = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMessage].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "Sen 'FLEX WMS' adındaki modern depo yönetim sisteminin resmi yapay zeka asistanısın. Kullanıcının hem bu yazılımın özellikleri (stok takibi, seri no yönetimi, depo transferleri, raporlar) hakkındaki sorularını hem de genel konulardaki sorularını yanıtlamalısın. Yanıtlarını Türkçe, profesyonel, yardımsever ve anlaşılır bir dille ver. Markdown formatını kullanarak başlıklar, listeler ve vurgular oluşturabilirsin. Eğer soru sistemle ilgiliyse teknik uzman gibi davran, genel bir soruysa nazik bir asistan gibi yanıtla.",
          temperature: 0.7,
        }
      });

      let modelText = "";
      const modelMessageId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: 'model',
        text: '',
        timestamp: new Date()
      }]);

      for await (const chunk of streamResponse) {
        const text = chunk.text;
        if (text) {
          modelText += text;
          setMessages(prev => prev.map(m => 
            m.id === modelMessageId ? { ...m, text: modelText } : m
          ));
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'model',
        text: 'Üzgünüm, yanıt oluştururken bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyiniz.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Sohbet geçmişini temizlemek istiyor musunuz?")) {
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: 'Sohbet temizlendi. Yeni sorularınızı bekliyorum.',
        timestamp: new Date()
      }]);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in duration-500">
      
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight">Yapay Zeka Asistanı</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">FLEX AI Intelligent Services</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all active:scale-95"
          >
            <Trash2 size={16} /> Temizle
          </button>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all active:scale-95">
            <RotateCcw size={16} /> Yenile
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-4 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`space-y-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`px-6 py-4 rounded-[2rem] text-sm leading-relaxed ${
                      message.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none prose prose-slate max-w-none'
                    }`}>
                      {message.text.split('\n').map((line, i) => (
                        <p key={i} className={line === '' ? 'h-4' : 'mb-1'}>{line}</p>
                      ))}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yanıt Hazırlanıyor...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-slate-50/50 border-t border-slate-100 shrink-0">
            <div className="relative group">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Bir soru sorun (Proje özellikleri veya genel konular)..." 
                className="w-full pl-12 pr-16 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none shadow-sm"
              />
              <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <MessageSquare size={20} />
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-4 top-3 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90 disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-4">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Enter ile gönder, Shift + Enter ile alt satır.</p>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Gemini 3 Flash LLM Engine</p>
            </div>
          </div>
        </div>

        <div className="w-80 flex flex-col gap-6 shrink-0 hidden xl:flex">
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
                 <Database size={18} className="text-indigo-600" />
                 <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Sistem Bilgisi</h3>
              </div>
              <div className="space-y-2 text-xs font-medium text-slate-500">
                 <p className="flex justify-between border-b border-slate-50 pb-2"><span>Versiyon:</span> <span className="text-indigo-600 font-bold">4.2.0</span></p>
                 <p className="flex justify-between border-b border-slate-50 pb-2"><span>Model:</span> <span className="text-indigo-600 font-bold">Gemini 3 Flash</span></p>
                 <p className="flex justify-between"><span>Durum:</span> <span className="text-emerald-500 font-bold">Çevrimiçi</span></p>
              </div>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 relative z-10">Örnek İstekler</h3>
              <ul className="space-y-4 text-xs font-medium text-slate-400 relative z-10">
                 <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    "Depo bakiye raporunda filtreleme nasıl yapılır?"
                 </li>
                 <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    "Lojistik maliyetlerini düşürmek için 5 strateji öner."
                 </li>
                 <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    "Gelecekte depo yönetimi trendleri neler olacak?"
                 </li>
              </ul>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                 <Sparkles size={160} />
              </div>
           </div>

           <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-4 shadow-sm">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                 <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest leading-none mb-1">AI Notu</h4>
                 <p className="text-[10px] text-amber-700/80 leading-relaxed font-medium">Yapay zeka sistemleri bazen hatalı bilgi üretebilir. Kritik kararlar öncesi verileri doğrulayınız.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
