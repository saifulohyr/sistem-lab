"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  X,
  Users,
  BookOpen,
  Building2,
  RefreshCw,
  Printer,
  Info,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// ─── Bell Schedule (sesuai KETERANGAN JAM MENGAJAR resmi) ──────
interface PeriodSlot {
  period: number;
  startTime: string;
  endTime: string;
  label: string;
  isBreak?: boolean;
}

const SENIN: PeriodSlot[] = [
  { period: 0, startTime: "07:00", endTime: "07:45", label: "Upacara Bendera", isBreak: true },
  { period: 1, startTime: "07:45", endTime: "08:15", label: "Jam 1" },
  { period: 2, startTime: "08:15", endTime: "08:45", label: "Jam 2" },
  { period: 3, startTime: "08:45", endTime: "09:15", label: "Jam 3" },
  { period: -1, startTime: "09:15", endTime: "09:45", label: "Istirahat", isBreak: true },
  { period: 4, startTime: "09:45", endTime: "10:15", label: "Jam 4" },
  { period: 5, startTime: "10:15", endTime: "10:45", label: "Jam 5" },
  { period: 6, startTime: "10:45", endTime: "11:15", label: "Jam 6" },
  { period: 7, startTime: "11:15", endTime: "11:45", label: "Jam 7" },
  { period: -2, startTime: "11:45", endTime: "13:00", label: "Istirahat & Dzuhur", isBreak: true },
  { period: 8, startTime: "13:00", endTime: "13:30", label: "Jam 8" },
  { period: 9, startTime: "13:30", endTime: "14:00", label: "Jam 9" },
  { period: 10, startTime: "14:00", endTime: "14:30", label: "Jam 10" },
];

const SELASA_KAMIS: PeriodSlot[] = [
  { period: 0, startTime: "07:00", endTime: "07:30", label: "Pembiasaan", isBreak: true },
  { period: 1, startTime: "07:30", endTime: "08:00", label: "Jam 1" },
  { period: 2, startTime: "08:00", endTime: "08:30", label: "Jam 2" },
  { period: 3, startTime: "08:30", endTime: "09:00", label: "Jam 3" },
  { period: -1, startTime: "09:00", endTime: "09:30", label: "Istirahat", isBreak: true },
  { period: 4, startTime: "09:30", endTime: "10:00", label: "Jam 4" },
  { period: 5, startTime: "10:00", endTime: "10:30", label: "Jam 5" },
  { period: 6, startTime: "10:30", endTime: "11:00", label: "Jam 6" },
  { period: 7, startTime: "11:00", endTime: "11:30", label: "Jam 7" },
  { period: 8, startTime: "11:30", endTime: "12:00", label: "Jam 8" },
  { period: -2, startTime: "12:00", endTime: "13:00", label: "Istirahat & Dzuhur", isBreak: true },
  { period: 9, startTime: "13:00", endTime: "13:30", label: "Jam 9" },
  { period: 10, startTime: "13:30", endTime: "14:00", label: "Jam 10" },
  { period: 11, startTime: "14:00", endTime: "14:30", label: "Jam 11" },
];

const JUMAT: PeriodSlot[] = [
  { period: 0, startTime: "07:00", endTime: "07:30", label: "Pembiasaan", isBreak: true },
  { period: 1, startTime: "07:30", endTime: "08:00", label: "Jam 1" },
  { period: 2, startTime: "08:00", endTime: "08:30", label: "Jam 2" },
  { period: 3, startTime: "08:30", endTime: "09:00", label: "Jam 3" },
  { period: -1, startTime: "09:00", endTime: "09:15", label: "Istirahat", isBreak: true },
  { period: 4, startTime: "09:15", endTime: "09:45", label: "Jam 4" },
  { period: 5, startTime: "09:45", endTime: "10:15", label: "Jam 5" },
  { period: 6, startTime: "10:15", endTime: "10:45", label: "Jam 6" },
  { period: 7, startTime: "10:45", endTime: "11:15", label: "Jam 7" },
];

function getDaySchedule(dayOfWeek: number): PeriodSlot[] {
  if (dayOfWeek === 1) return SENIN;
  if (dayOfWeek >= 2 && dayOfWeek <= 4) return SELASA_KAMIS;
  if (dayOfWeek === 5) return JUMAT;
  return [];
}

const HARI = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function toDayOfWeek(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

function formatDateID(date: Date): string {
  return `${HARI[toDayOfWeek(date)]}, ${date.getDate()} ${BULAN[date.getMonth()]} ${date.getFullYear()}`;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Lab Colors ─────────────────────────────────────────────────
const LAB_COLORS: Record<string, {
  bg: string;
  badgeBg: string;
  text: string;
  border: string;
  header: string;
  dot: string;
  light: string;
}> = {
  "lab-rpl-1": {
    bg: "bg-blue-50/80 hover:bg-blue-100/80",
    badgeBg: "bg-blue-600 text-white",
    text: "text-blue-900",
    border: "border-blue-200",
    header: "bg-blue-600 text-white",
    dot: "bg-blue-500",
    light: "bg-blue-100",
  },
  "lab-rpl-2": {
    bg: "bg-emerald-50/80 hover:bg-emerald-100/80",
    badgeBg: "bg-emerald-600 text-white",
    text: "text-emerald-900",
    border: "border-emerald-200",
    header: "bg-emerald-600 text-white",
    dot: "bg-emerald-500",
    light: "bg-emerald-100",
  },
  "lab-rpl-3": {
    bg: "bg-amber-50/80 hover:bg-amber-100/80",
    badgeBg: "bg-amber-600 text-white",
    text: "text-amber-900",
    border: "border-amber-200",
    header: "bg-amber-600 text-white",
    dot: "bg-amber-500",
    light: "bg-amber-100",
  },
  "lab-rpl-4": {
    bg: "bg-purple-50/80 hover:bg-purple-100/80",
    badgeBg: "bg-purple-600 text-white",
    text: "text-purple-900",
    border: "border-purple-200",
    header: "bg-purple-600 text-white",
    dot: "bg-purple-500",
    light: "bg-purple-100",
  },
};

function getLabColor(roomId: string) {
  return LAB_COLORS[roomId] || {
    bg: "bg-slate-50 hover:bg-slate-100",
    badgeBg: "bg-slate-600 text-white",
    text: "text-slate-800",
    border: "border-slate-200",
    header: "bg-slate-600 text-white",
    dot: "bg-slate-500",
    light: "bg-slate-100",
  };
}

// ─── Types ──────────────────────────────────────────────────────
interface LabUsageRecord {
  id: string;
  roomId: string;
  date: string;
  startPeriod: number;
  endPeriod: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  className: string;
  studentCount?: number;
  activity?: string;
  note?: string;
  room: { id: string; name: string };
  user: { name: string };
}

interface RoomData {
  id: string;
  name: string;
}

// ─── Main Page ──────────────────────────────────────────────────
export default function PemakaianLabPage() {
  const { data: sessionData } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<LabUsageRecord[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [modalPreselect, setModalPreselect] = useState<{ roomId?: string; period?: number }>({});

  // Sort lab rooms in natural order (Lab RPL 1, Lab RPL 2, Lab RPL 3, Lab RPL 4)
  const labRooms = useMemo(() => {
    return rooms
      .filter(r => r.id.startsWith("lab-rpl"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [rooms]);

  const dayOfWeek = toDayOfWeek(selectedDate);
  const schedule = useMemo(() => getDaySchedule(dayOfWeek), [dayOfWeek]);
  const isWeekend = dayOfWeek >= 6;
  const isSaturday = dayOfWeek === 6;

  // Fetch rooms
  useEffect(() => {
    fetch("/api/ruangan")
      .then(r => r.json())
      .then(json => {
        if (json.data) setRooms(json.data);
      })
      .catch(console.error);
  }, []);

  // Fetch records for selected date
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pemakaian-lab?date=${toISODate(selectedDate)}`);
      const json = await res.json();
      if (json.data) {
        setRecords(json.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data pemakaian lab");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Navigate dates
  const goDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  const goToday = () => setSelectedDate(new Date());

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split("-").map(Number);
    setSelectedDate(new Date(y, m - 1, d));
  };

  // Open modal with preselected room and period
  const handleOpenAddModal = (roomId?: string, period?: number) => {
    setModalPreselect({ roomId, period });
    setShowForm(true);
  };

  // Check if a period is occupied by a usage record for a specific room
  const getUsageForCell = (roomId: string, period: number): LabUsageRecord | null => {
    return (
      records.find(
        r => r.roomId === roomId && period >= r.startPeriod && period <= r.endPeriod
      ) || null
    );
  };

  // Delete a single record
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan pemakaian ini?")) return;
    try {
      const res = await fetch(`/api/pemakaian-lab?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Data pemakaian berhasil dihapus");
        fetchRecords();
      } else {
        toast.error("Gagal menghapus");
      }
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  // Count stats
  const stats = useMemo(() => {
    const usedLabs = new Set(records.map(r => r.roomId)).size;
    const totalPeriods = records.reduce((acc, r) => acc + (r.endPeriod - r.startPeriod + 1), 0);
    const uniqueClasses = new Set(records.map(r => r.className)).size;
    return { usedLabs, totalPeriods, uniqueClasses, totalRecords: records.length };
  }, [records]);

  const isToday = toISODate(selectedDate) === toISODate(new Date());

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131b2e] flex items-center gap-2">
            <Calendar className="w-7 h-7 text-blue-600" />
            Pemakaian Laboratorium Komputer
          </h1>
          <p className="text-sm text-[#505f76] mt-1">
            Jadwal penggunaan harian Lab RPL 1, Lab RPL 2, Lab RPL 3, dan Lab RPL 4
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#505f76] border border-[#eaedff] rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            title="Cetak Jadwal Hari Ini"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak</span>
          </button>
          <button
            onClick={goToday}
            className={`px-3 py-2 text-sm rounded-lg font-medium transition-all ${
              isToday
                ? "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                : "bg-white text-[#505f76] border border-[#eaedff] hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Catat Pemakaian
          </button>
        </div>
      </div>

      {/* ─── Date Navigation Bar ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#eaedff] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm print:hidden">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => goDay(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-[#505f76] transition-colors border border-[#eaedff]"
            title="Hari Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center sm:text-left px-2">
            <p className="text-lg font-bold text-[#131b2e]">{formatDateID(selectedDate)}</p>
            <p className="text-xs text-[#727785] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {isSaturday
                ? "Sabtu • Ekstrakurikuler Wajib/Pilihan"
                : isWeekend
                ? "Minggu • Hari Libur"
                : `${schedule.filter(s => !s.isBreak).length} Jam Pelajaran (${
                    dayOfWeek === 1
                      ? "Senin - Ada Upacara"
                      : dayOfWeek === 5
                      ? "Jum'at - Pulang 11:15"
                      : "Selasa, Rabu, Kamis - Normal"
                  })`}
            </p>
          </div>
          <button
            onClick={() => goDay(1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-[#505f76] transition-colors border border-[#eaedff]"
            title="Hari Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs font-medium text-[#727785]">Pilih Tanggal:</label>
          <input
            type="date"
            value={toISODate(selectedDate)}
            onChange={handleDateChange}
            className="px-3 py-1.5 rounded-lg border border-[#eaedff] text-sm text-[#131b2e] focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* ─── Printable Header (visible only on print) ────────── */}
      <div className="hidden print:block text-center mb-6">
        <h2 className="text-xl font-bold text-black uppercase tracking-wider">
          Jadwal Penggunaan Laboratorium Komputer
        </h2>
        <p className="text-sm font-semibold text-slate-700">SMK Muhammadiyah Majenang</p>
        <p className="text-xs text-slate-500 mt-1">{formatDateID(selectedDate)}</p>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        {[
          { label: "Lab Terpakai", value: `${stats.usedLabs} / ${labRooms.length || 4}`, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Sesi", value: stats.totalRecords, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Jam Pelajaran", value: `${stats.totalPeriods} Jam`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Kelas Praktikum", value: stats.uniqueClasses, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#eaedff] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className={`p-1.5 rounded-lg ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <span className="text-xs text-[#727785] font-medium">{s.label}</span>
            </div>
            <span className="text-2xl font-bold text-[#131b2e] mt-1 block">{s.value}</span>
          </div>
        ))}
      </div>

      {/* ─── Timetable Grid ──────────────────────────────────── */}
      {isWeekend ? (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-12 text-center shadow-sm">
          <Calendar className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <p className="text-lg font-bold text-[#131b2e]">
            {isSaturday ? "Sabtu: Ekstrakurikuler Wajib / Pilihan" : "Hari Minggu: Libur Sekolah"}
          </p>
          <p className="text-sm text-[#727785] max-w-md mx-auto mt-2">
            {isSaturday
              ? "Laboratorium komputer dibuka untuk kegiatan ekstrakurikuler (Cyber Security, Web Programming, Desain Grafis, Game Dev, dll.). Silakan gunakan tombol Catat Pemakaian jika ada kegiatan khusus."
              : "Tidak ada kegiatan pembelajaran terjadwal di hari Minggu."}
          </p>
          {isSaturday && (
            <button
              onClick={() => handleOpenAddModal()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Catat Pemakaian Khusus Sabtu
            </button>
          )}
        </div>
      ) : loading ? (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-16 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-[#727785] font-medium">Memuat jadwal pemakaian lab...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#eaedff] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px]">
              {/* Table Header */}
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="bg-slate-900 text-white text-xs font-bold px-4 py-3.5 text-center border-r border-slate-800 w-[140px] uppercase tracking-wider">
                    Jam Bel
                  </th>
                  {labRooms.map(room => {
                    const c = getLabColor(room.id);
                    return (
                      <th
                        key={room.id}
                        className={`${c.header} text-sm font-bold px-4 py-3.5 text-center border-r border-white/20 uppercase tracking-wide`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <Building2 className="w-4 h-4 opacity-80" />
                          <span>{room.name}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {schedule.map((slot, slotIdx) => {
                  const isBreak = slot.isBreak;

                  // ─── Break row (Upacara / Pembiasaan / Istirahat) ──────────
                  if (isBreak) {
                    return (
                      <tr key={`break-${slotIdx}`} className="bg-amber-50/90 border-y border-amber-200">
                        <td className="px-3 py-2 text-center border-r border-amber-200 bg-amber-100/60">
                          <span className="text-xs font-bold text-amber-900 block">{slot.label}</span>
                          <span className="text-[10px] text-amber-700 font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </td>
                        <td
                          colSpan={labRooms.length}
                          className="px-4 py-2 text-center text-xs font-semibold text-amber-900 tracking-wide"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            {slot.period === 0 ? "🚩" : "☕"}
                            <span>{slot.label.toUpperCase()}</span>
                            <span className="text-amber-700 font-normal">({slot.startTime} – {slot.endTime})</span>
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  // ─── Normal Period Row ────────────────────────────────────
                  return (
                    <tr key={`period-${slot.period}`} className="hover:bg-slate-50/40 transition-colors">
                      {/* Jam Bel column */}
                      <td className="px-3 py-3 text-center border-r border-[#eaedff] border-b border-[#f0f2ff] bg-slate-50/70">
                        <span className="text-xs font-bold text-[#131b2e] block">{slot.label}</span>
                        <span className="text-[11px] text-[#727785] font-medium block mt-0.5">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </td>

                      {/* Lab columns */}
                      {labRooms.map(room => {
                        const usage = getUsageForCell(room.id, slot.period);
                        const c = getLabColor(room.id);

                        // If occupied:
                        if (usage) {
                          const isStart = usage.startPeriod === slot.period;
                          const isEnd = usage.endPeriod === slot.period;

                          if (isStart) {
                            return (
                              <td
                                key={room.id}
                                className={`px-3 py-2.5 border-r border-b ${c.border} ${c.bg} align-top relative group`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between gap-1">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${c.badgeBg} shadow-sm`}
                                    >
                                      {usage.className}
                                    </span>
                                    <button
                                      onClick={() => handleDelete(usage.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-red-500 transition-all print:hidden"
                                      title="Hapus pemakaian ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">
                                    {usage.subject}
                                  </p>
                                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                                    <span>👤</span>
                                    <span>{usage.teacher}</span>
                                  </p>

                                  <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5 font-medium">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>
                                      Jam {usage.startPeriod}–{usage.endPeriod} ({usage.startTime}–{usage.endTime})
                                    </span>
                                  </div>

                                  {usage.note && (
                                    <p className="text-[10px] text-slate-500 italic mt-0.5">
                                      📝 {usage.note}
                                    </p>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          // Middle / Continuation Period:
                          return (
                            <td
                              key={room.id}
                              className={`px-3 py-2 border-r border-b ${c.border} ${c.bg} align-middle`}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                                  <span className="font-bold text-slate-900">{usage.className}</span>
                                  <span className="text-[11px] text-slate-500">
                                    ({usage.subject})
                                  </span>
                                </div>
                                {isEnd && (
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                    Selesai
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        }

                        // Empty Cell:
                        return (
                          <td
                            key={room.id}
                            onClick={() => handleOpenAddModal(room.id, slot.period)}
                            className="px-3 py-3 text-center border-r border-[#eaedff] border-b border-[#f0f2ff] hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            title={`Klik untuk mencatat penggunaan ${room.name} Jam ${slot.period}`}
                          >
                            <span className="text-xs text-slate-300 group-hover:hidden">—</span>
                            <span className="hidden group-hover:inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                              <Plus className="w-3.5 h-3.5" /> Pakai Lab
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend & Tips */}
          <div className="border-t border-[#eaedff] bg-slate-50/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#727785] font-semibold">Keterangan:</span>
              {labRooms.map(room => {
                const c = getLabColor(room.id);
                return (
                  <div key={room.id} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${c.dot}`} />
                    <span className="text-[#505f76] font-medium">{room.name}</span>
                  </div>
                );
              })}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-[#505f76] font-medium">Istirahat / Upacara</span>
              </div>
            </div>
            <div className="text-slate-500 text-[11px] flex items-center gap-1 print:hidden">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span>Tip: Klik sel kosong pada tabel untuk langsung mencatat kelas pada jam tersebut.</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail List of Day's Records (responsive) ────────── */}
      {records.length > 0 && !isWeekend && (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm print:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#131b2e] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Ringkasan Kelas Menggunakan Lab Hari Ini
            </h3>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full border border-blue-200">
              {records.length} Sesi Terjadwal
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {records.map(rec => {
              const c = getLabColor(rec.roomId);
              return (
                <div
                  key={rec.id}
                  className={`${c.bg} ${c.border} border rounded-xl p-4 flex flex-col justify-between gap-2`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${c.badgeBg}`}>
                        {rec.room.name}
                      </span>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-2">{rec.className}</h4>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{rec.subject}</p>
                    <p className="text-xs text-slate-500">Guru: {rec.teacher}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold text-blue-700">
                      Jam {rec.startPeriod} – {rec.endPeriod}
                    </span>
                    <span>
                      {rec.startTime} - {rec.endTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Add Form Modal ──────────────────────────────────── */}
      {showForm && (
        <AddUsageModal
          date={selectedDate}
          dayOfWeek={dayOfWeek}
          rooms={labRooms}
          schedule={schedule}
          preselectRoomId={modalPreselect.roomId}
          preselectPeriod={modalPreselect.period}
          onClose={() => {
            setShowForm(false);
            setModalPreselect({});
          }}
          onSaved={() => {
            fetchRecords();
            setShowForm(false);
            setModalPreselect({});
          }}
        />
      )}
    </div>
  );
}

// ─── Add Usage Form Modal ───────────────────────────────────────
function AddUsageModal({
  date,
  dayOfWeek,
  rooms,
  schedule,
  preselectRoomId,
  preselectPeriod,
  onClose,
  onSaved,
}: {
  date: Date;
  dayOfWeek: number;
  rooms: RoomData[];
  schedule: PeriodSlot[];
  preselectRoomId?: string;
  preselectPeriod?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const periods = useMemo(() => schedule.filter(s => !s.isBreak && s.period > 0), [schedule]);

  const defaultStart = preselectPeriod ? String(preselectPeriod) : periods[0]?.period ? String(periods[0].period) : "1";
  const defaultEnd = preselectPeriod ? String(preselectPeriod) : periods[0]?.period ? String(periods[0].period) : "4";

  const [formData, setFormData] = useState({
    roomId: preselectRoomId || rooms[0]?.id || "",
    startPeriod: defaultStart,
    endPeriod: defaultEnd,
    subject: "",
    teacher: "",
    className: "",
    studentCount: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  const startSlot = periods.find(p => p.period === Number(formData.startPeriod));
  const endSlot = periods.find(p => p.period === Number(formData.endPeriod));

  const quickClasses = ["X RPL 6", "XII RPL 3", "XII RPL 4", "XI RPL 1", "XI RPL 2", "X RPL 1"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomId || !formData.subject || !formData.teacher || !formData.className) {
      toast.error("Harap isi semua field yang wajib bertanda bintang (*)");
      return;
    }

    if (Number(formData.endPeriod) < Number(formData.startPeriod)) {
      toast.error("Jam selesai tidak boleh lebih awal dari jam mulai");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/pemakaian-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: formData.roomId,
          date: toISODate(date),
          startPeriod: Number(formData.startPeriod),
          endPeriod: Number(formData.endPeriod),
          startTime: startSlot?.startTime || "07:30",
          endTime: endSlot?.endTime || "11:15",
          subject: formData.subject,
          teacher: formData.teacher,
          className: formData.className,
          studentCount: formData.studentCount ? Number(formData.studentCount) : null,
          note: formData.note || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Pemakaian lab berhasil dicatat!");
        onSaved();
      } else {
        toast.error(json.error || "Gagal mencatat pemakaian");
      }
    } catch {
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#eaedff] bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-lg font-bold text-[#131b2e] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Catat Pemakaian Lab
            </h2>
            <p className="text-xs text-[#505f76] mt-0.5">{formatDateID(date)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white text-[#727785] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Ruangan */}
          <div>
            <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
              Ruangan Laboratorium <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.roomId}
              onChange={e => setFormData(d => ({ ...d, roomId: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium bg-white"
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Jam Ke Pelajaran */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
                Mulai Jam Ke <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.startPeriod}
                onChange={e => {
                  const newStart = e.target.value;
                  setFormData(d => ({
                    ...d,
                    startPeriod: newStart,
                    endPeriod: Number(d.endPeriod) < Number(newStart) ? newStart : d.endPeriod,
                  }));
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {periods.map(p => (
                  <option key={p.period} value={p.period}>
                    Jam {p.period} ({p.startTime})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
                Sampai Jam Ke <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.endPeriod}
                onChange={e => setFormData(d => ({ ...d, endPeriod: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                {periods
                  .filter(p => p.period >= Number(formData.startPeriod))
                  .map(p => (
                    <option key={p.period} value={p.period}>
                      Jam {p.period} ({p.endTime})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Time range info indicator */}
          {startSlot && endSlot && (
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-2.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  Waktu Bel: <strong>{startSlot.startTime}</strong> s/d <strong>{endSlot.endTime}</strong>
                </span>
              </div>
              <span className="text-[11px] bg-blue-200/70 font-bold px-2 py-0.5 rounded-md">
                {Number(formData.endPeriod) - Number(formData.startPeriod) + 1} Jam
              </span>
            </div>
          )}

          {/* Kelas */}
          <div>
            <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
              Kelas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: XII RPL 3"
              value={formData.className}
              onChange={e => setFormData(d => ({ ...d, className: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {/* Quick buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickClasses.map(cls => (
                <button
                  type="button"
                  key={cls}
                  onClick={() => setFormData(d => ({ ...d, className: cls }))}
                  className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded font-medium transition-colors"
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
              Mata Pelajaran / Praktikum <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Pemrograman Web / Basis Data / Praktikum RPL"
              value={formData.subject}
              onChange={e => setFormData(d => ({ ...d, subject: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Guru */}
          <div>
            <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">
              Guru Pengajar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nama Guru Pengajar"
              value={formData.teacher}
              onChange={e => setFormData(d => ({ ...d, teacher: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Jumlah Siswa & Catatan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">Jumlah Siswa</label>
              <input
                type="number"
                placeholder="36"
                value={formData.studentCount}
                onChange={e => setFormData(d => ({ ...d, studentCount: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#131b2e] mb-1.5">Catatan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Bawa flashdisk"
                value={formData.note}
                onChange={e => setFormData(d => ({ ...d, note: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#eaedff] text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-2/3 py-2.5 px-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {saving ? "Menyimpan..." : "Simpan Pemakaian Lab"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
