"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Package,
  Cpu,
  MapPin,
  DollarSign,
} from "lucide-react";

export default function TambahInventarisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [type, setType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [source, setSource] = useState("DIPA");
  const [price, setPrice] = useState("");
  const [documentNo, setDocumentNo] = useState("");
  const [roomId, setRoomId] = useState("");
  const [position, setPosition] = useState("");
  const [condition, setCondition] = useState("BAIK");
  const [status, setStatus] = useState("AKTIF");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");

  // Dynamic Specs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "Processor", value: "" },
    { key: "RAM", value: "" },
    { key: "Storage", value: "" },
    { key: "OS", value: "" },
  ]);

  useEffect(() => {
    async function loadMasterData() {
      try {
        const [catRes, brandRes, roomRes] = await Promise.all([
          fetch("/api/kategori"),
          fetch("/api/merk"),
          fetch("/api/ruangan"),
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();
        const roomData = await roomRes.json();

        if (catData.data) {
          setCategories(catData.data);
          if (catData.data.length > 0) setCategoryId(catData.data[0].id);
        }
        if (brandData.data) setBrands(brandData.data);
        if (roomData.data) {
          setRooms(roomData.data);
          if (roomData.data.length > 0) setRoomId(roomData.data[0].id);
        }
      } catch (err) {
        console.error("Error loading master data:", err);
      }
    }
    loadMasterData();
  }, []);

  const addSpecRow = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const removeSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const next = [...specs];
    next[index][field] = val;
    setSpecs(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !categoryId) {
      alert("Kode, Nama Barang, dan Kategori wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/inventaris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          name,
          categoryId,
          brandId: brandId || undefined,
          type,
          serialNumber,
          year,
          source,
          price,
          documentNo,
          roomId: roomId || undefined,
          position,
          condition,
          status,
          quantity,
          note,
          specs: specs.filter((s) => s.key.trim() && s.value.trim()),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/inventaris/${data.data.id}`);
      } else {
        alert(data.error || "Gagal menambahkan inventaris");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]";
  const labelClass = "block font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2";
  const cardClass = "bg-surface-container-lowest rounded-xl shadow-sm p-gutter-md flex flex-col gap-stack-md relative overflow-hidden group";
  const headerClass = "flex items-center gap-2 pb-3 border-b border-outline-variant/50 text-on-surface font-headline-md tracking-tight";

  return (
    <div className="max-w-4xl mx-auto space-y-stack-lg pb-12 animate-[fade-in_0.5s_ease-out]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-stack-md bg-surface-container rounded-xl p-gutter-md shadow-sm">
        <Link
          href="/dashboard/inventaris"
          className="p-2 rounded-lg text-outline hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex flex-col gap-stack-sm">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Tambah Inventaris Baru
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Isi formulir identitas, spesifikasi, dan lokasi barang laboratorium.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-stack-lg">
        {/* Section 1: Identitas Barang */}
        <div className={cardClass}>
          <div className={headerClass}>
            <Package className="w-6 h-6 text-primary" />
            <h2 className="text-[20px]">Identitas Barang</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className={labelClass}>Kode Barang *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: PC-RPL1-011"
                required
                className={`${inputClass} font-code text-code`}
              />
            </div>

            <div>
              <label className={labelClass}>Nama Barang *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: PC Desktop Client 11"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Kategori *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Merk</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className={inputClass}
              >
                <option value="">-- Pilih Merk --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Tipe / Model</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Contoh: ExpertCenter D500SC"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Serial Number</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Contoh: SN-829381920"
                className={`${inputClass} font-code text-code`}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Spesifikasi Perangkat */}
        <div className={cardClass}>
          <div className={`${headerClass} justify-between border-none pb-0`}>
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              <h2 className="text-[20px]">Spesifikasi Teknis</h2>
            </div>
            <button
              type="button"
              onClick={addSpecRow}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Baris
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {specs.map((spec, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Komponen (cth: RAM)"
                  value={spec.key}
                  onChange={(e) => updateSpec(index, "key", e.target.value)}
                  className="w-1/3 bg-surface-container-low border-none rounded-lg py-2.5 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                />
                <input
                  type="text"
                  placeholder="Detail (cth: 16 GB DDR4 3200MHz)"
                  value={spec.value}
                  onChange={(e) => updateSpec(index, "value", e.target.value)}
                  className="flex-1 bg-surface-container-low border-none rounded-lg py-2.5 px-4 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(index)}
                  className="p-2.5 text-outline hover:text-error rounded-lg hover:bg-error-container transition-colors"
                  title="Hapus baris"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Lokasi & Status */}
        <div className={cardClass}>
          <div className={headerClass}>
            <MapPin className="w-6 h-6 text-primary" />
            <h2 className="text-[20px]">Lokasi & Kondisi</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div>
              <label className={labelClass}>Ruangan</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className={inputClass}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Posisi / Meja</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Contoh: Meja 11"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Kondisi Fisik</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={inputClass}
              >
                <option value="BAIK">Baik</option>
                <option value="RUSAK_RINGAN">Rusak Ringan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
                <option value="TIDAK_DITEMUKAN">Tidak Ditemukan</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="AKTIF">Aktif</option>
                <option value="PERBAIKAN">Perbaikan</option>
                <option value="DIPINJAM">Dipinjam</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Pengadaan & Catatan */}
        <div className={cardClass}>
          <div className={headerClass}>
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="text-[20px]">Data Pengadaan & Catatan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <div>
              <label className={labelClass}>Tahun Pengadaan</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={`${inputClass} font-code text-code`}
              />
            </div>

            <div>
              <label className={labelClass}>Sumber Dana</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Contoh: DIPA / BOS"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Estimasi Harga</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 8500000"
                className={`${inputClass} font-code text-code`}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className={labelClass}>Catatan Tambahan</label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Keterangan kelengkapan, riwayat awal, atau catatan khusus..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-4 border-t border-outline-variant/50">
          <Link
            href="/dashboard/inventaris"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm group disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? "Menyimpan..." : "Simpan Inventaris"}
          </button>
        </div>
      </form>
    </div>
  );
}
