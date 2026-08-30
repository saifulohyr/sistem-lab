"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Printer, Filter, RefreshCw, Calendar, Building2, Tag, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateShort, formatCurrency, getConditionLabel } from "@/lib/utils";

export default function LaporanPage() {
  const [reportType, setReportType] = useState("INVENTARIS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roomId, setRoomId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("");

  const [rooms, setRooms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [reportData, setReportData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // Fetch rooms & categories for filters
  useEffect(() => {
    Promise.all([
      fetch("/api/ruangan").then((res) => res.json()),
      fetch("/api/kategori").then((res) => res.json()),
    ])
      .then(([roomRes, catRes]) => {
        if (roomRes.data) setRooms(roomRes.data);
        if (catRes.data) setCategories(catRes.data);
      })
      .catch((err) => console.error("Filter fetch error:", err));
  }, []);

  // Fetch report data whenever filters change
  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", reportType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (roomId) params.set("roomId", roomId);
      if (categoryId) params.set("categoryId", categoryId);
      if (condition) params.set("condition", condition);

      const res = await fetch(`/api/laporan?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setReportData(json.data);
        setSummary(json.summary || {});
      } else {
        toast.error(json.error || "Gagal memuat data laporan");
      }
    } catch (error) {
      console.error("Report fetch error:", error);
      toast.error("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate, roomId, categoryId, condition]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    if (reportData.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }
    toast.loading("Menyiapkan file Excel...", { id: "export" });
    try {
      const params = new URLSearchParams();
      params.set("format", "xlsx");
      params.set("type", reportType);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (roomId) params.set("roomId", roomId);
      if (categoryId) params.set("categoryId", categoryId);
      if (condition) params.set("condition", condition);

      const res = await fetch(`/api/laporan/export?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal mengekspor");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("File Excel berhasil diunduh", { id: "export" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengekspor", { id: "export" });
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "INVENTARIS": return "DATA REKAPITULASI INVENTARIS BARANG LAB";
      case "PEMINJAMAN": return "REKAPITULASI SIRKULASI PEMINJAMAN BARANG";
      case "PERBAIKAN": return "REKAPITULASI PEMELIHARAAN & PERBAIKAN (SERVIS)";
      case "PEMELIHARAAN": return "CATATAN KEGIATAN PEMELIHARAAN LAB";
      case "MASUK_KELUAR": return "REKAPITULASI MUTASI BARANG (MASUK & KELUAR)";
      default: return "LAPORAN LABORATORIUM";
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-7xl mx-auto w-full print:p-0 print:max-w-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Laporan & Rekapitulasi</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Unduh data CSV (Excel) atau cetak lembar laporan resmi laboratorium</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 text-xs sm:text-sm" onClick={handleExportExcel} disabled={loading || reportData.length === 0}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Excel (.xlsx)
          </Button>
          <Button size="sm" className="h-9 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePrint} disabled={loading || reportData.length === 0}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Cetak / PDF
          </Button>
        </div>
      </div>

      {/* Main Grid: Filter vs Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Filter Card (Hidden on Print) */}
        <div className="lg:col-span-1 print:hidden space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Filter Parameter
              </CardTitle>
              <CardDescription>Sesuaikan parameter laporan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label>Jenis Laporan</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="INVENTARIS">📦 Data Inventaris Barang</option>
                  <option value="PEMINJAMAN">🤝 Sirkulasi Peminjaman</option>
                  <option value="PERBAIKAN">🔧 Rekapitulasi Perbaikan</option>
                  <option value="PEMELIHARAAN">🛡️ Catatan Pemeliharaan</option>
                  <option value="MASUK_KELUAR">🔄 Mutasi (Masuk & Keluar)</option>
                </select>
              </div>

              {/* Date Filter (Applicable to non-inventaris or transaction dates) */}
              <div className="space-y-1.5">
                <Label>Dari Tanggal</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Sampai Tanggal</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              {/* Inventaris specific filters */}
              {reportType === "INVENTARIS" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Ruangan Lab</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                    >
                      <option value="">Semua Ruangan</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Kategori Barang</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Kondisi Fisik</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    >
                      <option value="">Semua Kondisi</option>
                      <option value="BAIK">Baik</option>
                      <option value="RUSAK_RINGAN">Rusak Ringan</option>
                      <option value="RUSAK_BERAT">Rusak Berat</option>
                      <option value="TIDAK_DITEMUKAN">Tidak Ditemukan</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setRoomId("");
                  setCategoryId("");
                  setCondition("");
                }}>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Preview Card / Document */}
        <div className="lg:col-span-3">
          <div className="bg-card print:bg-white text-card-foreground print:text-black rounded-xl border print:border-none shadow-sm p-6 sm:p-8 space-y-6">
            {/* Kop Surat Sekolah */}
            <div className="border-b-2 border-black/80 pb-4 text-center">
              <h2 className="text-xl font-bold uppercase tracking-wider">SMK NEGERI — PROGRAM KEAHLIAN TEKNIK KOMPUTER & INFORMATIKA</h2>
              <h3 className="text-lg font-extrabold uppercase text-blue-600 print:text-black mt-0.5">LABORATORIUM REKAYASA PERANGKAT LUNAK (LABMUMA)</h3>
              <p className="text-xs text-muted-foreground print:text-gray-600 mt-1">
                Jl. Pendidikan No. 1 • Telp: (021) 12345678 • Email: lab.rpl@sekolah.sch.id
              </p>
            </div>

            {/* Document Title & Period */}
            <div className="text-center my-2">
              <h1 className="text-lg sm:text-xl font-bold uppercase underline tracking-wide">
                {getReportTitle()}
              </h1>
              <p className="text-xs text-muted-foreground print:text-gray-700 mt-1">
                {startDate && endDate
                  ? `Periode: ${formatDate(startDate)} s/d ${formatDate(endDate)}`
                  : `Dicetak pada: ${formatDate(new Date())}`}
              </p>
            </div>

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-muted/40 print:bg-gray-50 border text-xs">
              {reportType === "INVENTARIS" && (
                <>
                  <div>
                    <span className="text-muted-foreground block">Total Jenis Barang:</span>
                    <span className="font-bold text-sm">{summary.totalItems || 0} Item</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Kuantitas:</span>
                    <span className="font-bold text-sm">{summary.totalQuantity || 0} Unit</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Kondisi Baik:</span>
                    <span className="font-bold text-sm text-emerald-600 print:text-black">{summary.baik || 0} Item</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Estimasi Nilai Aset:</span>
                    <span className="font-bold text-sm text-blue-600 print:text-black">{formatCurrency(summary.totalValue)}</span>
                  </div>
                </>
              )}

              {reportType === "PEMINJAMAN" && (
                <>
                  <div>
                    <span className="text-muted-foreground block">Total Transaksi:</span>
                    <span className="font-bold text-sm">{summary.totalTransactions || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Sedang Dipinjam:</span>
                    <span className="font-bold text-sm text-blue-600 print:text-black">{summary.active || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Sudah Dikembalikan:</span>
                    <span className="font-bold text-sm text-emerald-600 print:text-black">{summary.returned || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Tingkat Pengembalian:</span>
                    <span className="font-bold text-sm">
                      {summary.totalTransactions ? `${Math.round((summary.returned / summary.totalTransactions) * 100)}%` : "0%"}
                    </span>
                  </div>
                </>
              )}

              {reportType === "PERBAIKAN" && (
                <>
                  <div>
                    <span className="text-muted-foreground block">Total Tiket Servis:</span>
                    <span className="font-bold text-sm">{summary.totalTickets || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Selesai Diperbaiki:</span>
                    <span className="font-bold text-sm text-emerald-600 print:text-black">{summary.selesai || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Dalam Proses:</span>
                    <span className="font-bold text-sm text-amber-600 print:text-black">{summary.proses || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Biaya Perbaikan:</span>
                    <span className="font-bold text-sm text-red-600 print:text-black">{formatCurrency(summary.totalCost)}</span>
                  </div>
                </>
              )}

              {reportType === "PEMELIHARAAN" && (
                <>
                  <div>
                    <span className="text-muted-foreground block">Total Pemeliharaan:</span>
                    <span className="font-bold text-sm">{summary.totalMaintenance || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Rutin (Preventive):</span>
                    <span className="font-bold text-sm text-blue-600 print:text-black">{summary.preventive || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Korektif (Corrective):</span>
                    <span className="font-bold text-sm text-amber-600 print:text-black">{summary.corrective || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Status:</span>
                    <span className="font-bold text-sm text-emerald-600 print:text-black">Terdokumentasi</span>
                  </div>
                </>
              )}

              {reportType === "MASUK_KELUAR" && (
                <>
                  <div>
                    <span className="text-muted-foreground block">Total Riwayat Mutasi:</span>
                    <span className="font-bold text-sm">{summary.totalMutations || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Barang Masuk:</span>
                    <span className="font-bold text-sm text-emerald-600 print:text-black">+{summary.totalIncomingQty || 0} Unit</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Barang Keluar:</span>
                    <span className="font-bold text-sm text-red-600 print:text-black">-{summary.totalOutgoingQty || 0} Unit</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Net Mutasi:</span>
                    <span className="font-bold text-sm font-mono">
                      {(summary.totalIncomingQty || 0) - (summary.totalOutgoingQty || 0)} Unit
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Tables Based on Report Type */}
            <div className="overflow-x-auto rounded-lg border">
              {loading ? (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  Memuat data laporan...
                </div>
              ) : reportData.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                  <p>Tidak ada data yang sesuai dengan filter yang dipilih.</p>
                </div>
              ) : (
                <Table>
                  {/* INVENTARIS TABLE */}
                  {reportType === "INVENTARIS" && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/50 print:bg-gray-100 text-xs">
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead>Kategori / Merk</TableHead>
                          <TableHead>Lokasi / Ruang</TableHead>
                          <TableHead className="text-center">Jumlah</TableHead>
                          <TableHead className="text-center">Kondisi</TableHead>
                          <TableHead className="text-right">Harga</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, idx) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="font-mono font-semibold">{item.code}</TableCell>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.category} • {item.brand}</TableCell>
                            <TableCell>{item.room} {item.position ? `(${item.position})` : ""}</TableCell>
                            <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                            <TableCell className="text-center font-semibold">{getConditionLabel(item.condition)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}

                  {/* PEMINJAMAN TABLE */}
                  {reportType === "PEMINJAMAN" && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/50 print:bg-gray-100 text-xs">
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>No Transaksi</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Peminjam</TableHead>
                          <TableHead>Barang Dipinjam</TableHead>
                          <TableHead>Tenggat / Kembali</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, idx) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="font-mono font-semibold">{item.number}</TableCell>
                            <TableCell>{formatDateShort(item.date)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.borrower}</div>
                              <span className="text-[10px] text-muted-foreground">{item.role}</span>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{item.itemsList}</TableCell>
                            <TableCell>
                              {item.actualReturn
                                ? formatDateShort(item.actualReturn)
                                : item.expectedReturn
                                ? formatDateShort(item.expectedReturn)
                                : "-"}
                            </TableCell>
                            <TableCell className="text-center font-semibold uppercase">{item.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}

                  {/* PERBAIKAN TABLE */}
                  {reportType === "PERBAIKAN" && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/50 print:bg-gray-100 text-xs">
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>No Tiket</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Barang</TableHead>
                          <TableHead>Diagnosa / Masalah</TableHead>
                          <TableHead>Teknisi</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Biaya</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, idx) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="font-mono font-semibold">{item.number}</TableCell>
                            <TableCell>{formatDateShort(item.date)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.inventoryName}</div>
                              <span className="text-[10px] text-muted-foreground">{item.inventoryCode}</span>
                            </TableCell>
                            <TableCell className="max-w-[220px] truncate">{item.diagnosis || item.damageType}</TableCell>
                            <TableCell>{item.technician}</TableCell>
                            <TableCell className="text-center font-semibold uppercase">{item.status}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.cost)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}

                  {/* PEMELIHARAAN TABLE */}
                  {reportType === "PEMELIHARAAN" && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/50 print:bg-gray-100 text-xs">
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>No Catatan</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Kegiatan</TableHead>
                          <TableHead>Hasil</TableHead>
                          <TableHead>Teknisi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, idx) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="font-mono font-semibold">{item.number}</TableCell>
                            <TableCell>{formatDateShort(item.date)}</TableCell>
                            <TableCell className="font-semibold uppercase">{item.type}</TableCell>
                            <TableCell className="font-medium">{item.title}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{item.result || "-"}</TableCell>
                            <TableCell>{item.technician}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}

                  {/* MASUK KELUAR TABLE */}
                  {reportType === "MASUK_KELUAR" && (
                    <>
                      <TableHeader>
                        <TableRow className="bg-muted/50 print:bg-gray-100 text-xs">
                          <TableHead className="w-10 text-center">No</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>No Dokumen</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead>Pihak Terkait / Sumber</TableHead>
                          <TableHead>Petugas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((item, idx) => (
                          <TableRow key={item.id} className="text-xs">
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                item.type === "MASUK" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}>
                                {item.type}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono font-semibold">{item.number}</TableCell>
                            <TableCell>{formatDateShort(item.date)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{item.inventoryName}</div>
                              <span className="text-[10px] text-muted-foreground">{item.inventoryCode}</span>
                            </TableCell>
                            <TableCell className="text-center font-bold">{item.quantity} Unit</TableCell>
                            <TableCell>{item.party}</TableCell>
                            <TableCell>{item.user}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  )}
                </Table>
              )}
            </div>

            {/* Official Signatures for Printed Reports */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center text-sm">
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground print:text-gray-700">Petugas Laboratorium (Toolman),</p>
                <div className="h-20" />
                <p className="font-bold underline uppercase">..................................................</p>
                <p className="text-xs text-muted-foreground">NIP/NIK. .....................................</p>
              </div>

              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground print:text-gray-700">Mengetahui,</p>
                <p className="text-xs font-semibold">Toolman Laboratorium Rekayasa Perangkat Lunak</p>
                <div className="h-16" />
                <p className="font-bold underline uppercase">..................................................</p>
                <p className="text-xs text-muted-foreground">NIP. .....................................</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
