"use client";

import {
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardProps {
  stats: {
    total: number;
    baik: number;
    rusakRingan: number;
    rusakBerat: number;
    tidakDitemukan: number;
  };
  categoryData: { name: string; count: number }[];
  roomData: { name: string; count: number }[];
  recentHistory: {
    id: string;
    action: string;
    description: string;
    createdAt: string;
    inventoryCode: string;
    inventoryName: string;
    userName: string;
  }[];
  userName: string;
}

const CONDITION_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#94a3b8"];
const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16", "#a855f7"];

function getActionIcon(action: string) {
  switch (action) {
    case "PENDATAAN": return "📋";
    case "MASUK": return "📦";
    case "KELUAR": return "📤";
    case "PERBAIKAN": return "🔧";
    case "PEMELIHARAAN": return "🛠️";
    default: return "📝";
  }
}

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardClient({
  stats,
  categoryData,
  roomData,
  recentHistory,
  userName,
}: DashboardProps) {
  const conditionData = [
    { name: "Baik", value: stats.baik, color: "#10b981" },
    { name: "Rusak Ringan", value: stats.rusakRingan, color: "#f59e0b" },
    { name: "Rusak Berat", value: stats.rusakBerat, color: "#ef4444" },
    { name: "Tidak Ditemukan", value: stats.tidakDitemukan, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  const cards = [
    { label: "Total Inventaris", value: stats.total, icon: Package, color: "from-blue-500 to-blue-600", bgLight: "bg-blue-50", textColor: "text-blue-600" },
    { label: "Kondisi Baik", value: stats.baik, icon: CheckCircle2, color: "from-emerald-500 to-emerald-600", bgLight: "bg-emerald-50", textColor: "text-emerald-600" },
    { label: "Rusak Ringan", value: stats.rusakRingan, icon: AlertTriangle, color: "from-amber-500 to-amber-600", bgLight: "bg-amber-50", textColor: "text-amber-600" },
    { label: "Rusak Berat", value: stats.rusakBerat, icon: XCircle, color: "from-red-500 to-red-600", bgLight: "bg-red-50", textColor: "text-red-600" },
    { label: "Tidak Ditemukan", value: stats.tidakDitemukan, icon: HelpCircle, color: "from-slate-500 to-slate-600", bgLight: "bg-slate-50", textColor: "text-slate-600" },
  ];

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">{greeting}, {userName}! 👋</h1>
        <p className="text-muted-foreground mt-1">Berikut ringkasan kondisi laboratorium hari ini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`animate-fade-in stagger-${i + 1} bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bgLight} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground/30" />
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Condition Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in stagger-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Kondisi Inventaris
          </h3>
          {conditionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
              Belum ada data
            </div>
          )}
        </div>

        {/* Category Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in stagger-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            Inventaris per Kategori
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" name="Jumlah" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {categoryData.map((_, index) => (
                    <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
              Belum ada data
            </div>
          )}
        </div>

        {/* Room Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in stagger-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" />
            Inventaris per Ruangan
          </h3>
          {roomData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={roomData} margin={{ left: 0, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "13px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="count" name="Jumlah" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Alerts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Peringatan
          </h3>
          <div className="space-y-3">
            {stats.rusakBerat > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{stats.rusakBerat} barang rusak berat</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">Perlu evaluasi untuk perbaikan atau penghapusan</p>
                </div>
              </div>
            )}
            {stats.rusakRingan > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{stats.rusakRingan} barang rusak ringan</p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Jadwalkan perbaikan segera</p>
                </div>
              </div>
            )}
            {stats.tidakDitemukan > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800">
                <HelpCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stats.tidakDitemukan} barang tidak ditemukan</p>
                  <p className="text-xs text-slate-600/70 dark:text-slate-400/70">Lakukan pencarian dan verifikasi</p>
                </div>
              </div>
            )}
            {stats.rusakBerat === 0 && stats.rusakRingan === 0 && stats.tidakDitemukan === 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Semua barang dalam kondisi baik! 🎉</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Aktivitas Terbaru
          </h3>
          <div className="space-y-1">
            {recentHistory.length > 0 ? (
              recentHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg mt-0.5">{getActionIcon(item.action)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{item.inventoryCode}</span>{" "}
                      <span className="text-muted-foreground">— {item.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.userName} • {formatTimeAgo(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Belum ada aktivitas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
