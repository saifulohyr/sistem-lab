"use client";

import { useEffect, useState } from "react";
import { Plus, Disc, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SoftwarePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", version: "", license: "FREE", category: "IDE", description: "" });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/software");
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
      const res = await fetch("/api/software", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Software ditambahkan");
        fetchData();
        setFormData({ name: "", version: "", license: "FREE", category: "IDE", description: "" });
      } else toast.error(json.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-1">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Daftar Software</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-card p-4 rounded-xl border shadow-sm">
          <div><Label>Nama Software</Label><Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} /></div>
          <div><Label>Versi</Label><Input value={formData.version} onChange={e=>setFormData({...formData, version: e.target.value})} /></div>
          <div><Label>Kategori</Label><Input required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} /></div>
          <div>
            <Label>Lisensi</Label>
            <select className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={formData.license} onChange={e=>setFormData({...formData, license: e.target.value})}>
              <option value="FREE">Freeware</option>
              <option value="OPEN_SOURCE">Open Source</option>
              <option value="COMMERCIAL">Berbayar / Komersial</option>
            </select>
          </div>
          <Button type="submit" disabled={submitting}><Plus className="w-4 h-4 mr-2"/> Tambah</Button>
        </form>
      </div>
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map(r => (
            <div key={r.id} className="p-4 bg-card border rounded-xl shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-600"><Disc className="w-5 h-5"/> <span className="font-bold">{r.name}</span></div>
              <p className="text-xs text-muted-foreground">Versi: {r.version || "-"}</p>
              <div className="flex gap-2 text-[10px] font-bold mt-2">
                <span className="bg-muted px-2 py-1 rounded">{r.category}</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{r.license}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
