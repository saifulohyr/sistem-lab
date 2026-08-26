"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AsistenPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", nis: "", className: "", phone: "" });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/asisten");
      const json = await res.json();
      if (json.data) setRecords(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/asisten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Asisten lab ditambahkan");
        fetchData();
        setFormData({ name: "", nis: "", className: "", phone: "" });
      } else toast.error(json.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-1">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Daftar Asisten Lab</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div><Label>Nama Lengkap</Label><Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>NIS / NISN</Label><Input required value={formData.nis} onChange={e=>setFormData({...formData, nis: e.target.value})} /></div>
          <div><Label>Kelas</Label><Input required value={formData.className} onChange={e=>setFormData({...formData, className: e.target.value})} placeholder="Contoh: XI RPL 1"/></div>
          <div><Label>Nomor HP / WA</Label><Input value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} /></div>
          <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm h-9"><Plus className="w-4 h-4 mr-2"/> Tambah Asisten</Button>
        </form>
      </div>
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map(r => (
            <div key={r.id} className="p-4 bg-card border rounded-xl shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-emerald-600"><Users className="w-5 h-5"/> <span className="font-bold">{r.name}</span></div>
              <p className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>NIS: {r.nis}</span>
                <span className="font-bold text-foreground">Kelas {r.className}</span>
              </p>
              {r.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {r.phone}</p>}
              <div className="mt-2 pt-2 border-t">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${r.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {r.active ? "AKTIF" : "NONAKTIF"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
