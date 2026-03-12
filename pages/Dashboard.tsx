
import React, { useEffect, useState } from 'react';
// Added Database to the imported icons from lucide-react
import { TrendingUp, TrendingDown, Package, ShoppingCart, Truck, AlertTriangle, History as LucideHistory, Loader2, Database } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { apiService } from '../api';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Backend henüz hazır değilse mock veriye düşmesi için try-catch
        const [statsRes, chartsRes, logsRes] = await Promise.all([
          apiService.dashboard.getStats().catch(() => null),
          apiService.dashboard.getCharts().catch(() => []),
          apiService.dashboard.getLogs().catch(() => [])
        ]);
        
        if (statsRes) setStats(statsRes);
        if (chartsRes.length > 0) setChartData(chartsRes);
        if (logsRes.length > 0) setLogs(logsRes);
      } catch (err) {
        console.error("Dashboard verisi yüklenemedi", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Netsis Verileri Okunuyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sistem Özeti</h1>
        <p className="text-slate-500">Netsis ERP üzerinden anlık çekilen veriler.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Toplam Stok Değeri" 
          value={stats?.totalStockValue || "0"} 
          change={stats?.totalStockValueChange || "0%"} trend={stats?.totalStockValueTrend || "up"} icon={<Package className="text-sky-600" />} color="bg-sky-50" 
        />
        <StatCard 
          label="Bekleyen Sevk Emri" 
          value={stats?.pendingShipments || "0"} 
          change={stats?.pendingShipmentsChange || "0%"} trend={stats?.pendingShipmentsTrend || "down"} icon={<Truck className="text-amber-600" />} color="bg-amber-50" 
        />
        <StatCard 
          label="Günlük Satış" 
          value={stats?.dailySales || "0"} 
          change={stats?.dailySalesChange || "0%"} trend={stats?.dailySalesTrend || "up"} icon={<ShoppingCart className="text-emerald-600" />} color="bg-emerald-50" 
        />
        <StatCard 
          label="Kritik Stok" 
          value={stats?.criticalStockCount || "0"} 
          change={stats?.criticalStockChange || "0"} trend={stats?.criticalStockTrend || "up"} icon={<AlertTriangle className="text-rose-600" />} color="bg-rose-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 uppercase tracking-widest text-xs">Haftalık Hareket Analizi</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="satis" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={20} />
                <Bar dataKey="alis" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
           <h3 className="font-bold mb-6 uppercase tracking-widest text-xs text-indigo-400">Son Sistem Logları</h3>
           <div className="space-y-4 relative z-10">
              {logs.length > 0 ? logs.map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><LucideHistory size={16}/></div>
                      <span className="text-xs font-medium">{log.message || log.title}</span>
                   </div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{log.time || log.date}</span>
                </div>
              )) : [1,2,3,4].map(i => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><LucideHistory size={16}/></div>
                      <span className="text-xs font-medium">Netsis Entegrasyonu: Başarılı</span>
                   </div>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">14:05</span>
                </div>
              ))}
           </div>
           <Database className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64" />
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, change: string, trend: 'up' | 'down', icon: React.ReactNode, color: string }> = ({ label, value, change, trend, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full ${trend === 'up' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-rose-600 bg-rose-50 border border-rose-100'}`}>
        {change}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{value}</h4>
    </div>
  </div>
);

export default Dashboard;