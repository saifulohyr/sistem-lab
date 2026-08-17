"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wrench,
  Calendar,
  CheckSquare,
  Building2,
  Settings,
  LogOut,
  ChevronDown,
  Monitor,
  Users,
  Tag,
  Layers,
  PackagePlus,
  PackageMinus,
  HandCoins,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const menuGroups = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "INVENTARIS",
    items: [
      { href: "/dashboard/inventaris", label: "Semua Barang", icon: Package },
      { href: "/dashboard/pendataan-awal", label: "Pendataan Awal", icon: ClipboardList },
      { href: "/dashboard/barang-masuk", label: "Barang Masuk", icon: PackagePlus },
      { href: "/dashboard/barang-keluar", label: "Barang Keluar", icon: PackageMinus },
    ],
  },
  {
    label: "TEKNISI",
    items: [
      { href: "/dashboard/perbaikan", label: "Perbaikan", icon: Wrench },
      { href: "/dashboard/pemeliharaan", label: "Pemeliharaan", icon: Calendar },
      { href: "/dashboard/pemeriksaan", label: "Pemeriksaan Lab", icon: CheckSquare },
    ],
  },
  {
    label: "TRANSAKSI",
    items: [
      { href: "/dashboard/peminjaman", label: "Peminjaman", icon: HandCoins },
    ],
  },
  {
    label: "PENGATURAN",
    items: [
      { href: "/dashboard/ruangan", label: "Ruangan", icon: Building2 },
      { href: "/dashboard/kategori", label: "Kategori", icon: Tag },
      { href: "/dashboard/merk", label: "Merk", icon: Layers },
      { href: "/dashboard/users", label: "Pengguna", icon: Users },
      { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Settings },
    ],
  },
];

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN": return "bg-red-500/20 text-red-300";
    case "TOOLMAN": return "bg-blue-500/20 text-blue-300";
    case "KEPALA_LAB": return "bg-green-500/20 text-green-300";
    case "GURU": return "bg-amber-500/20 text-amber-300";
    default: return "bg-gray-500/20 text-gray-300";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN": return "Admin";
    case "TOOLMAN": return "Toolman";
    case "KEPALA_LAB": return "Kepala Lab";
    case "GURU": return "Guru";
    default: return role;
  }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Monitor className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-white tracking-tight">LABMUMA</h1>
          <p className="text-[10px] text-blue-300 uppercase tracking-widest">Lab Management</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuGroups.map((group) => (
          <div key={group.label || "main"} className="mb-3">
            {group.label && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase hover:text-sidebar-foreground/70 transition-colors"
              >
                {group.label}
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    expandedGroups[group.label] === false ? "-rotate-90" : ""
                  }`}
                />
              </button>
            )}
            {expandedGroups[group.label] !== false &&
              group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    isActive(item.href)
                      ? "bg-blue-600/20 text-blue-300 font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive(item.href)
                        ? "text-blue-400"
                        : "text-sidebar-foreground/50 group-hover:text-blue-400"
                    } transition-colors`}
                  />
                  <span>{item.label}</span>
                  {isActive(item.href) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                  )}
                </Link>
              ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card border border-border shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-sidebar-foreground/50 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

export function Navbar({ user }: { user: { name: string; role: string } }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kode barang, nama, serial number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted border border-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">3</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-[10px] text-muted-foreground">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
