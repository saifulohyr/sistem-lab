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
  Truck,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

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
      { href: "/dashboard", label: "OVERVIEW", icon: LayoutDashboard },
    ],
  },
  {
    label: "MASTER DATA",
    items: [
      { href: "/dashboard/inventaris", label: "Daftar Inventaris", icon: Package },
      { href: "/dashboard/kategori", label: "Kategori Barang", icon: Tag },
      { href: "/dashboard/ruangan", label: "Ruangan Lab", icon: Building2 },
      { href: "/dashboard/merk", label: "Merk / Brand", icon: Layers },
      { href: "/dashboard/supplier", label: "Data Supplier", icon: Truck },
      { href: "/dashboard/users", label: "Manajemen Pengguna", icon: Users },
    ],
  },
  {
    label: "TRANSACTIONS",
    items: [
      { href: "/dashboard/barang-masuk", label: "Barang Masuk", icon: PackagePlus },
      { href: "/dashboard/barang-keluar", label: "Barang Keluar", icon: PackageMinus },
      { href: "/dashboard/peminjaman", label: "Peminjaman Alat", icon: HandCoins },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { href: "/dashboard/pendataan-awal", label: "Pendataan Awal", icon: ClipboardList },
      { href: "/dashboard/jadwal", label: "Jadwal Laboratorium", icon: Calendar },
      { href: "/dashboard/pemeriksaan", label: "Pemeriksaan Rutin", icon: CheckSquare },
      { href: "/dashboard/software", label: "Software & Lisensi", icon: Package },
      { href: "/dashboard/asisten", label: "Asisten Lab", icon: Users },
    ],
  },
  {
    label: "MAINTENANCE",
    items: [
      { href: "/dashboard/perbaikan/laporan", label: "Lapor Kerusakan", icon: AlertTriangle },
      { href: "/dashboard/perbaikan", label: "Tiket Perbaikan", icon: Wrench },
      { href: "/dashboard/pemeliharaan", label: "Pemeliharaan", icon: Calendar },
      { href: "/dashboard/laporan", label: "Laporan & Rekap", icon: ClipboardList },
      { href: "/dashboard/pengaturan", label: "Pengaturan Sistem", icon: Settings },
    ],
  },
];

function getRoleColor(role: string) {
  switch (role) {
    case "ADMIN": return "bg-red-50 text-red-700 border border-red-200";
    case "TOOLMAN": return "bg-blue-50 text-blue-700 border border-blue-200";
    case "SISWA": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "GURU": return "bg-amber-50 text-amber-700 border border-amber-200";
    default: return "bg-slate-50 text-slate-700 border border-slate-200";
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "ADMIN": return "Admin";
    case "TOOLMAN": return "Toolman";
    case "SISWA": return "Siswa";
    case "GURU": return "Guru";
    default: return role;
  }
}

// ─── Search Results Types ──────────────────────────────────────
interface SearchResult {
  inventories: { id: string; code: string; name: string; condition: string; status: string; category: { name: string } | null; room: { name: string } | null }[];
  categories: { id: string; name: string; icon: string | null }[];
  rooms: { id: string; name: string }[];
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // ─── Search state ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // ─── Debounced search ─────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (json.data) setSearchResults(json.data);
    } catch {
      // silent fail
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/dashboard/inventaris?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery("");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-700 border-r border-[#eaedff] shadow-[1px_0_8px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="p-6 mb-2 flex items-center gap-3 border-b border-[#eaedff]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 text-white">
          <Monitor className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-[#0058be] tracking-tight">LABMUMA</h1>
          <p className="text-[10px] text-[#505f76] font-semibold uppercase tracking-widest">Lab System</p>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {menuGroups.map((group) => (
          <div key={group.label || "main"} className="mb-3">
            {group.label && (
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#727785] uppercase hover:text-[#131b2e] transition-colors"
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
              group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      active
                        ? "bg-[#2170e4] text-white shadow-sm font-semibold"
                        : "text-[#424754] hover:bg-[#f2f3ff] hover:text-[#0058be]"
                    }`}
                  >
                    <item.icon
                      className={`w-[18px] h-[18px] shrink-0 ${
                        active ? "text-white" : "text-[#727785] group-hover:text-[#0058be]"
                      } transition-colors`}
                    />
                    <span>{item.label}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-[#eaedff] bg-[#faf8ff]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#131b2e] truncate">{user.name}</p>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${getRoleColor(user.role)} mt-0.5`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-2.5 left-3 z-40 p-2 rounded-xl bg-white/95 backdrop-blur border border-[#eaedff] shadow-md text-[#131b2e] hover:bg-[#f2f3ff] transition-colors"
        aria-label="Buka Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 animate-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-800 z-10"
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
  const router = useRouter();

  // ─── Navbar search state ──────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      if (json.data) setSearchResults(json.data);
    } catch { /* silent */ } finally { setSearchLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery, doSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/dashboard/inventaris?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      setSearchQuery("");
    }
    if (e.key === "Escape") setShowSearchDropdown(false);
  };

  const hasResults = searchResults && (
    searchResults.inventories.length > 0 ||
    searchResults.categories.length > 0 ||
    searchResults.rooms.length > 0
  );

  return (
    <header className="sticky top-0 z-30 h-14 lg:h-16 bg-white/80 backdrop-blur-xl border-b border-[#eaedff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] flex items-center justify-between px-3 sm:px-4 lg:px-6">
      <div className="flex items-center gap-4 flex-1 ml-10 lg:ml-0">
        {/* Search with live dropdown */}
        <div ref={searchRef} className="relative max-w-md flex-1 group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727785] group-focus-within:text-[#0058be] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
            onFocus={() => setShowSearchDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cari inventaris, kategori, ruangan..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#f2f3ff] border border-transparent text-xs sm:text-sm text-[#131b2e] placeholder:text-[#727785] focus:outline-none focus:bg-white focus:border-[#2170e4] focus:ring-4 focus:ring-[#2170e4]/10 transition-all"
          />
          {/* Dropdown results */}
          {showSearchDropdown && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#eaedff] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
              {searchLoading ? (
                <div className="p-4 text-center text-xs text-[#727785]">Mencari...</div>
              ) : !hasResults ? (
                <div className="p-4 text-center text-xs text-[#727785]">
                  Tidak ada hasil untuk &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto py-1">
                  {searchResults!.inventories.length > 0 && (
                    <>
                      <p className="px-3 py-1.5 text-[10px] font-bold text-[#727785] uppercase tracking-wider">Inventaris</p>
                      {searchResults!.inventories.map((item) => (
                        <button
                          key={item.id}
                          className="w-full text-left px-3 py-2 hover:bg-[#f2f3ff] transition-colors flex items-start gap-2.5"
                          onClick={() => {
                            router.push(`/dashboard/inventaris/${item.id}`);
                            setShowSearchDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#eaedff] flex items-center justify-center shrink-0 mt-0.5">
                            <Package className="w-3.5 h-3.5 text-[#0058be]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#131b2e] truncate">{item.name}</p>
                            <p className="text-[10px] text-[#727785]">{item.code} · {item.category?.name} · {item.room?.name ?? "Belum ditempatkan"}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {searchResults!.rooms.length > 0 && (
                    <>
                      <p className="px-3 py-1.5 text-[10px] font-bold text-[#727785] uppercase tracking-wider border-t border-[#f2f3ff] mt-1">Ruangan</p>
                      {searchResults!.rooms.map((room) => (
                        <button
                          key={room.id}
                          className="w-full text-left px-3 py-2 hover:bg-[#f2f3ff] transition-colors flex items-center gap-2.5"
                          onClick={() => {
                            router.push(`/dashboard/ruangan`);
                            setShowSearchDropdown(false);
                            setSearchQuery("");
                          }}
                        >
                          <Building2 className="w-4 h-4 text-[#727785] shrink-0" />
                          <span className="text-xs font-medium text-[#131b2e]">{room.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                  <div className="px-3 py-2 border-t border-[#f2f3ff]">
                    <button
                      className="text-[10px] text-[#0058be] hover:underline font-semibold"
                      onClick={() => {
                        router.push(`/dashboard/inventaris?search=${encodeURIComponent(searchQuery)}`);
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                      }}
                    >
                      Cari semua inventaris untuk &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button className="sm:hidden p-2 rounded-lg text-[#727785] hover:bg-[#f2f3ff] hover:text-[#131b2e] transition-all">
          <Search className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <button className="relative p-2 rounded-full text-[#505f76] hover:bg-[#f2f3ff] hover:text-[#131b2e] transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#eaedff]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0058be] to-[#2170e4] flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-[#2170e4]/20">
            {user.name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-[#131b2e] leading-tight">{user.name}</p>
            <p className="text-[10px] text-[#505f76]">{getRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
