import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Treemap 
} from 'recharts';
import { 
  Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, 
  CreditCard, Users, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

// --- MOK MƏLUMATLAR ---

// Area Chart Məlumatı
const performanceData = [
  { time: '09:00', amount: 42000, users: 1200 },
  { time: '11:00', amount: 68000, users: 2100 },
  { time: '13:00', amount: 95000, users: 3400 },
  { time: '15:00', amount: 84000, users: 2800 },
  { time: '17:00', amount: 112000, users: 4100 },
  { time: '19:00', amount: 135000, users: 4900 },
];

// Donut Chart: User Segments
const userSegments = [
  { name: 'Bireysel (Standard)', value: 55, color: '#6366F1' },
  { name: 'Premium / VIP', value: 25, color: '#EC4899' },
  { name: 'KOB / Biznes', value: 20, color: '#10B981' },
];

// Treemap: Kateqoriyalar
const treemapData = [
  { name: 'Kommunal Payment', size: 3500, fill: '#3B82F6' },
  { name: 'P2P Köçürmələr', size: 4800, fill: '#8B5CF6' },
  { name: 'Kredit Ödənişləri', size: 2100, fill: '#EC4899' },
  { name: 'İnternet & TV', size: 1200, fill: '#10B981' },
  { name: 'Valyuta Mübadiləsi', size: 1900, fill: '#F59E0B' },
];

// Heatmap simulator (Həftəlik / Saatlıq xəritə)
const heatmapData = [
  { day: 'B.E', intensity: [20, 45, 80, 95, 60, 30] },
  { day: 'Ç.A', intensity: [15, 50, 75, 90, 70, 40] },
  { day: 'Ç.', intensity: [30, 60, 85, 100, 65, 35] },
  { day: 'C.A', intensity: [25, 55, 90, 95, 80, 50] },
  { day: 'C.', intensity: [40, 70, 95, 85, 90, 75] },
  { day: 'Ş.', intensity: [10, 30, 50, 60, 45, 80] },
  { day: 'B.', intensity: [5, 20, 40, 45, 35, 60] },
];

// Sparkline KPI məlumatları
const sparklineMetrics = [
  { label: 'Günlük Həcm', val: '₼ 2,485,000', change: '+14.2%', positive: true, spark: [12, 18, 15, 25, 22, 30, 28] },
  { label: 'Uğurlu Əməliyyatlar', val: '98.6%', change: '+0.4%', positive: true, spark: [95, 96, 98, 97, 98.6, 98.6, 98.6] },
  { label: 'Aktiv İstifadəçi', val: '42,850', change: '-1.8%', positive: false, spark: [48, 46, 45, 44, 43, 42.8, 42.8] },
];

// Son əməliyyatlar
const recentTransactions = [
  { id: 'TXN-9842', user: 'Anar Qasımov', type: 'P2P Transfer', amount: '₼ 150.00', status: 'Success', date: '14:32' },
  { id: 'TXN-9841', user: 'Leyla Məmmədova', type: 'Kommunal', amount: '₼ 42.50', status: 'Success', date: '14:30' },
  { id: 'TXN-9840', user: 'Kamran Əliyev', type: 'Kredit Ödənişi', amount: '₼ 450.00', status: 'Failed', date: '14:28' },
  { id: 'TXN-9839', user: 'Elvin Həsənov', type: 'Merchant QR', amount: '₼ 12.80', status: 'Success', date: '14:25' },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-3 sm:p-6 text-slate-800 font-sans space-y-4 sm:space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Rəqəmsal Bank Monitorinq Paneli</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-0">Real-vaxt rejimində sistem infrastrukturu və maliyyə axınları</p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <span className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Canlı Rejim
          </span>
          <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-xl transition-all shrink-0">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. HERO SYSTEM HEALTH PANEL */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 shrink-0" />
            <span>Sistem Health Status & Microservices</span>
          </h2>
          <span className="text-[10px] sm:text-xs font-medium text-slate-400 shrink-0 ml-2">Yeniləndi: İndicə</span>
        </div>

        {/* 4 Radial KPI (Circular Progress) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <RadialCard title="API Gateway" percentage={99} color="stroke-indigo-500 text-indigo-500" status="Optimal" />
          <RadialCard title="Core Banking" percentage={96} color="stroke-emerald-500 text-emerald-500" status="Normal" />
          <RadialCard title="Card Processing" percentage={88} color="stroke-amber-500 text-amber-500" status="Yüksək Yük" />
          <RadialCard title="Auth / OAuth2" percentage={100} color="stroke-blue-500 text-blue-500" status="Əla" />
        </div>

        {/* Xidmət Statusları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
          <ServiceStatus title="SMS Gateway" online={true} latency="120ms" />
          <ServiceStatus title="Push Notification" online={true} latency="45ms" />
          <ServiceStatus title="3D Secure API" online={true} latency="210ms" />
          <ServiceStatus title="Swift Bridge" online={false} latency="Timeout" />
        </div>
      </div>

      {/* 2. SPARKLINE KPI BLOKLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {sparklineMetrics.map((item, idx) => (
          <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">{item.label}</span>
              <div className="text-xl sm:text-2xl font-black text-slate-800">{item.val}</div>
              <div className={`text-xs font-semibold flex items-center gap-1 ${item.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.positive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {item.change}
              </div>
            </div>
            {/* Fake Sparkline */}
            <div className="flex items-end gap-1 h-10 w-20 shrink-0">
              {item.spark.map((v, i) => (
                <div 
                  key={i} 
                  className={`w-full rounded-t ${item.positive ? 'bg-indigo-100' : 'bg-rose-100'}`} 
                  style={{ height: `${(v / Math.max(...item.spark)) * 100}%` }} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. BÖYÜK GRADIENT AREA CHART */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Tranzaksiya Dinamikası</h3>
            <p className="text-xs text-slate-400">Saatlıq həcm və aktiv istifadəçi sayı</p>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600">Bugün</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-50 text-slate-400">Dünən</span>
          </div>
        </div>
        <div className="h-56 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} 
              />
              <Area type="monotone" dataKey="amount" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. İKİNCİL QRAFİKLƏR TORU (Heatmap, Treemap, Gauge, Donut) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Transaction Heatmap */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h4 className="text-sm font-bold text-slate-800 mb-3">Əməliyyat Sıxlığı (Heatmap)</h4>
          <div className="space-y-2">
            {heatmapData.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-6 shrink-0">{row.day}</span>
                <div className="grid grid-cols-6 gap-1 sm:gap-1.5 flex-1">
                  {row.intensity.map((val, idx) => (
                    <div 
                      key={idx} 
                      className="h-5 rounded-md transition-all hover:scale-110" 
                      style={{ 
                        backgroundColor: `rgba(99, 102, 241, ${val / 100})`,
                      }} 
                      title={`Intensivlik: ${val}%`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-4">
            <span>Sakit</span>
            <span>Çox Aktiv</span>
          </div>
        </div>

        {/* Treemap (Kateqoriyalar) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-3">Ödəniş Kateqoriyaları</h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip content={<CustomTreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gauge Chart (Fraud Risk) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-800">Fraud Risk Skor</h4>
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
          </div>
          
          <div className="relative flex items-center justify-center my-3 sm:my-2">
            <svg className="w-36 h-20">
              <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10 70 A 60 60 0 0 1 50 20" fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" />
            </svg>
            <div className="absolute bottom-0 text-center">
              <span className="text-2xl font-black text-slate-800">14%</span>
              <p className="text-[10px] text-slate-400">Aşağı Risk</p>
            </div>
          </div>

          <div className="w-full bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-center">
            <p className="text-xs text-emerald-700 font-medium">Anomaliya təsbit edilməyib</p>
          </div>
        </div>

        {/* Donut Chart (User Segments) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-2">İstifadəçi Segmentləri</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userSegments} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                  {userSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {userSegments.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  {s.name}
                </span>
                <span className="font-bold text-slate-700">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. SON ƏMƏLİYYATLAR VƏ LIVE ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Son Əməliyyatlar Cədvəli */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">Son Tranzaksiyalar</h3>
            <button className="text-xs font-semibold text-indigo-600 hover:underline">Hamısına bax</button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-100">
                  <th className="pb-3">ID</th>
                  <th className="pb-3">İstifadəçi</th>
                  <th className="pb-3">Növ</th>
                  <th className="pb-3">Məbləğ</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Saat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-medium text-slate-600">{tx.id}</td>
                    <td className="py-3 font-semibold text-slate-800">{tx.user}</td>
                    <td className="py-3 text-slate-500">{tx.type}</td>
                    <td className="py-3 font-bold text-slate-800">{tx.amount}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        tx.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-slate-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Animated Live Activity Timeline */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">Canlı Sistem Hadisələri</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-100">
            
            <TimelineItem 
              color="bg-indigo-500" 
              time="14:32:05" 
              title="Yeni Kart Əlavə Edildi" 
              desc="İstifadəçi: **** 4812" 
            />
            <TimelineItem 
              color="bg-emerald-500" 
              time="14:31:50" 
              title="Auto-Pay İcra Edildi" 
              desc="Azercell Kommunal Ödəniş" 
            />
            <TimelineItem 
              color="bg-amber-500" 
              time="14:30:12" 
              title="Şübhəli Giriş Cəhdi" 
              desc="IP: 185.22.x.x (Bloklandı)" 
            />
            <TimelineItem 
              color="bg-blue-500" 
              time="14:28:40" 
              title="KYC Təsdiqləndi" 
              desc="İstifadəçi idifikasiyadan keçdi" 
            />

          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400">Avtomatik sinxronizasiya olunur...</span>
          </div>
        </div>

      </div>

    </div>
  );
}

// --- KÖMƏKÇİ KOMPONENTLƏR ---

// Radial Progress Card
function RadialCard({ title, percentage, color, status }) {
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100;
  return (
    <div className="flex flex-col items-center p-2.5 sm:p-3 bg-slate-50/60 rounded-xl border border-slate-100">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r="32" className="stroke-slate-200" strokeWidth="6" fill="transparent" />
          <circle 
            cx="50%" cy="50%" r="32" 
            className={`${color} transition-all duration-1000 ease-out`} 
            strokeWidth="6" 
            strokeDasharray="251.2" 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            fill="transparent" 
          />
        </svg>
        <span className="absolute text-xs sm:text-sm font-black text-slate-800">{percentage}%</span>
      </div>
      <span className="text-xs font-bold text-slate-700 mt-1.5 sm:mt-2 text-center">{title}</span>
      <span className="text-[10px] text-slate-400 font-medium">{status}</span>
    </div>
  );
}

// Microservice Status Indicator
function ServiceStatus({ title, online, latency }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-2">
        {online ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
        <span className="text-xs font-semibold text-slate-700">{title}</span>
      </div>
      <span className="text-[10px] font-mono text-slate-400">{latency}</span>
    </div>
  );
}

// Live Activity Timeline Item
function TimelineItem({ color, time, title, desc }) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3 relative z-10 animate-fade-in">
      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${color} ring-4 ring-white mt-1 shrink-0`} />
      <div className="flex-1 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100/80 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate">{title}</span>
          <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 shrink-0">{time}</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 truncate">{desc}</p>
      </div>
    </div>
  );
}

// Treemap custom tooltip
function CustomTreemapTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 sm:p-2.5 rounded-lg shadow-md border border-slate-100 text-[11px] sm:text-xs max-w-[180px] sm:max-w-xs z-50">
        <p className="font-bold text-slate-800 truncate">{data.name}</p>
        <p className="text-indigo-600 font-semibold mt-0.5">Həcm: ₼{data.size}</p>
      </div>
    );
  }
  return null;
}