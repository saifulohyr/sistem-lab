"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Building2,
  Tag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MoreVertical,
} from "lucide-react";
import { getConditionLabel, getStatusLabel } from "@/lib/utils";

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  type: string | null;
  serialNumber: string | null;
  position: string | null;
  condition: string;
  status: string;
  quantity: number;
  category: { id: string; name: string };
  brand: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
}

export default function InventarisListPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (roomFilter) params.append("roomId", roomFilter);
      if (conditionFilter) params.append("condition", conditionFilter);

      const res = await fetch(`/api/inventaris?${params.toString()}`);
      const data = await res.json();
      if (data.data) {
        setItems(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [catRes, roomRes] = await Promise.all([
        fetch("/api/kategori"),
        fetch("/api/ruangan"),
      ]);
      const catData = await catRes.json();
      const roomData = await roomRes.json();
      if (catData.data) setCategories(catData.data);
      if (roomData.data) setRooms(roomData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, roomFilter, conditionFilter]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Yakin ingin menghapus inventaris ${code}?`)) return;
    try {
      const res = await fetch(`/api/inventaris/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        const d = await res.json();
        alert(d.error || "Gagal menghapus");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case "BAIK":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Baik
          </span>
        );
      case "RUSAK_RINGAN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-tertiary" />
            Rusak Ringan
          </span>
        );
      case "RUSAK_BERAT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Rusak Berat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px]">
            <HelpCircle className="w-3.5 h-3.5" />
            {getConditionLabel(condition)}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AKTIF":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Aktif
          </span>
        );
      case "PERBAIKAN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            Perbaikan
          </span>
        );
      case "DIPINJAM":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-md text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Dipinjam
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-[11px]">
            {getStatusLabel(status)}
          </span>
        );
    }
  };

  const filterSelectClass = "w-full lg:w-48 bg-surface-container-low border-none rounded-lg py-2.5 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]";

  return (
    <div className="flex flex-col w-full gap-stack-lg animate-[fade-in_0.5s_ease-out]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-md bg-surface-container rounded-xl p-gutter-md shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col gap-stack-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Inventory Master List
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Manage, track, and locate all laboratory equipment and consumables. Select items to generate batch QR codes for physical tagging.
          </p>
        </div>
        <div className="flex flex-wrap gap-stack-sm">
          <Link
            href="/dashboard/inventaris/tambah"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            New Item
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-md flex flex-col gap-stack-md relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary-fixed rounded-full blur-[80px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700"></div>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-stack-md relative z-10">
          <div className="flex-1 w-full lg:max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input
              type="text"
              placeholder="Search ID, Name, or Brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg py-2.5 pl-10 pr-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">Semua Ruangan</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className={filterSelectClass}
            >
              <option value="">Semua Kondisi</option>
              <option value="BAIK">Baik</option>
              <option value="RUSAK_RINGAN">Rusak Ringan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
              <option value="TIDAK_DITEMUKAN">Tidak Ditemukan</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto pb-4 -mx-gutter-md px-gutter-md sm:mx-0 sm:px-0 relative z-10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest/50 backdrop-blur-sm sticky top-0">
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-24">ID</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Brand</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Room</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status & Kondisi</th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <div className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                      </svg>
                      Loading inventory data...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <Package className="w-10 h-10 mx-auto text-outline mb-2" />
                    No inventory items found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="group hover:bg-surface-container-low transition-colors duration-200 border-b border-outline-variant/50 last:border-0 cursor-pointer">
                    <td className="p-3 font-code text-code text-on-surface-variant">
                      #{item.code}
                    </td>
                    <td className="p-3 font-medium flex flex-col gap-0.5">
                      <span className="truncate max-w-[200px] text-on-surface font-semibold">{item.name}</span>
                      {item.type && (
                        <span className="text-[12px] text-on-surface-variant font-normal">{item.type}</span>
                      )}
                    </td>
                    <td className="p-3 text-on-surface-variant hidden sm:table-cell">
                      {item.category?.name}
                    </td>
                    <td className="p-3 text-on-surface-variant hidden md:table-cell">
                      {item.brand ? item.brand.name : "-"}
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-[11px] font-medium text-on-surface-variant">
                        <Building2 className="w-3.5 h-3.5" /> 
                        {item.room?.name || "Belum Ditempatkan"}
                      </span>
                      {item.position && (
                        <div className="text-[11px] text-on-surface-variant mt-1 ml-1">{item.position}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-start gap-1.5">
                        {getStatusBadge(item.status)}
                        {getConditionBadge(item.condition)}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/dashboard/inventaris/${item.id}`}
                          className="p-2 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/inventaris/${item.id}/edit`}
                          className="p-2 rounded text-outline hover:text-amber-600 hover:bg-surface-container transition-colors"
                          title="Edit Barang"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="p-2 rounded text-outline hover:text-error hover:bg-error-container transition-colors"
                          title="Hapus Barang"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-outline-variant/50 pt-4 mt-2">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Showing 1-{items.length} of {items.length} items
          </span>
        </div>
      </div>
    </div>
  );
}
