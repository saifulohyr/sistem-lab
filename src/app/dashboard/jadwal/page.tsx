"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  BookOpen,
  MoreVertical,
  Search,
  CalendarDays,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
  Calendar as CalendarIcon,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ScheduleRecord {
  id: string;
  roomId: string;
  subject: string;
  teacher: string;
  className: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: string;
  room: { id: string; name: string };
  status?: string;
  requestedBy?: { name: string };
}

interface RoomData {
  id: string;
  name: string;
}

// Lab styling & color system (Matching Stitch Design)
const LAB_THEMES: Record<string, {
  color: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  descColor: string;
  dotColor: string;
  tagColor: string;
}> = {
  "lab-rpl-1": {
    color: "#0058be",
    badgeBg: "bg-blue-600 text-white",
    badgeText: "text-blue-700",
    cardBg: "bg-blue-600 text-white shadow-blue-500/20",
    cardBorder: "border-blue-700",
    titleColor: "text-white font-bold",
    descColor: "text-blue-100",
    dotColor: "bg-blue-600",
    tagColor: "bg-blue-700/60 text-blue-100",
  },
  "lab-rpl-2": {
    color: "#475569",
    badgeBg: "bg-slate-100 text-slate-800",
    badgeText: "text-slate-700",
    cardBg: "bg-slate-50 border border-slate-200 text-slate-800 shadow-slate-500/10",
    cardBorder: "border-slate-300",
    titleColor: "text-slate-900 font-bold",
    descColor: "text-slate-600",
    dotColor: "bg-slate-700",
    tagColor: "bg-slate-200 text-slate-700",
  },
  "lab-rpl-3": {
    color: "#334155",
    badgeBg: "bg-slate-800 text-white",
    badgeText: "text-slate-800",
    cardBg: "bg-[#1e293b] text-white border border-slate-700 shadow-slate-900/30",
    cardBorder: "border-slate-600",
    titleColor: "text-white font-bold",
    descColor: "text-slate-300",
    dotColor: "bg-slate-800",
    tagColor: "bg-slate-700 text-slate-200",
  },
  "lab-rpl-4": {
    color: "#b45309",
    badgeBg: "bg-amber-100 text-amber-900",
    badgeText: "text-amber-800",
    cardBg: "bg-amber-50/90 border border-amber-200 text-amber-950 shadow-amber-500/10",
    cardBorder: "border-amber-300",
    titleColor: "text-amber-950 font-bold",
    descColor: "text-amber-700",
    dotColor: "bg-amber-600",
    tagColor: "bg-amber-200/80 text-amber-900",
  },
};

const DEFAULT_THEME = {
  color: "#2563eb",
  badgeBg: "bg-blue-50 text-blue-700",
  badgeText: "text-blue-700",
  cardBg: "bg-blue-50/80 border border-blue-200 text-blue-900",
  cardBorder: "border-blue-300",
  titleColor: "text-blue-950 font-bold",
  descColor: "text-blue-700",
  dotColor: "bg-blue-600",
  tagColor: "bg-blue-200 text-blue-800",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAYS_FULL = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 - 18:00

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function JadwalLabPage() {
  const { data: session } = useSession();
  const isAdminOrToolman = session?.role === "ADMIN" || session?.role === "TOOLMAN";

  const [records, setRecords] = useState<ScheduleRecord[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "month" | "week">("timeline");
  const [searchQuery, setSearchQuery] = useState("");

  // Calendar state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Lab visibility toggles
  const [visibleRooms, setVisibleRooms] = useState<Set<string>>(new Set());

  // Form state
  const selectedDayNum = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
  const [formData, setFormData] = useState({
    roomId: "",
    subject: "",
    teacher: "",
    className: "",
    dayOfWeek: String(selectedDayNum),
    startTime: "08:00",
    endTime: "10:30",
    academicYear: "2026/2027",
    semester: "GANJIL",
  });

  const fetchData = async () => {
    try {
      const [resJadwal, resRooms] = await Promise.all([
        fetch("/api/jadwal"),
        fetch("/api/ruangan"),
      ]);
      const jsonJadwal = await resJadwal.json();
      const jsonRooms = await resRooms.json();

      if (jsonJadwal.data) setRecords(jsonJadwal.data);
      if (jsonRooms.data) {
        // Filter ONLY teaching lab rooms (Exclude Gudang Lab, etc.)
        const labRooms = jsonRooms.data
          .filter((r: RoomData) => r.name.toLowerCase().includes("lab") && !r.name.toLowerCase().includes("gudang"))
          .sort((a: RoomData, b: RoomData) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        setRooms(labRooms);
        setVisibleRooms(new Set(labRooms.map((r: RoomData) => r.id)));
      }
    } catch (error) {
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update formData dayOfWeek when selectedDate changes
  useEffect(() => {
    const dow = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    setFormData((prev) => ({ ...prev, dayOfWeek: String(dow) }));
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        roomId: formData.roomId,
        subject: formData.subject,
        teacher: formData.teacher,
        className: formData.className,
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        academicYear: formData.academicYear,
        semester: formData.semester,
      };

      const res = await fetch("/api/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Jadwal praktikum berhasil disimpan");
        setShowForm(false);
        setFormData({
          roomId: rooms[0]?.id || "",
          subject: "",
          teacher: session?.user?.name || "",
          className: "",
          dayOfWeek: String(selectedDayNum),
          startTime: "08:00",
          endTime: "10:30",
          academicYear: "2026/2027",
          semester: "GANJIL",
        });
        fetchData();
      } else {
        toast.error(json.error || "Gagal menyimpan jadwal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    try {
      const res = await fetch(`/api/jadwal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      toast.success("Jadwal dihapus");
      fetchData();
    } catch {
      toast.error("Gagal menghapus jadwal");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/jadwal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status");
      toast.success(`Jadwal ${status.toLowerCase()}`);
      fetchData();
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const toggleRoom = (roomId: string) => {
    setVisibleRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  // Get day of week from selected date (1=Senin ... 7=Minggu)
  const selectedDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

  // Filter records for the selected day and visible rooms
  const dayRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesDay = r.dayOfWeek === selectedDayOfWeek;
        const matchesRoom = visibleRooms.has(r.roomId);
        const matchesSearch = searchQuery
          ? r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.className.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchesDay && matchesRoom && matchesSearch;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [records, selectedDayOfWeek, visibleRooms, searchQuery]);

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  // Convert time string "HH:MM" to fractional hour
  const timeToHour = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + (m || 0) / 60;
  };

  // Current real-time indicator
  const now = new Date();
  const currentHourDecimal = now.getHours() + now.getMinutes() / 60;
  const isSelectedDateToday =
    selectedDate.getDate() === now.getDate() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getFullYear() === now.getFullYear();

  const currentTimeTop = (currentHourDecimal - 7) * 80;
  const currentTimeFormatted = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const formatDateHeader = (date: Date) => {
    return `${DAYS_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  };

  const getTheme = (roomId: string) => LAB_THEMES[roomId] || DEFAULT_THEME;

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] animate-fade-in">
      {/* ─── LEFT SIDEBAR (STITCH SYSTEM) ─── */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-5">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Schedule</h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Manage and oversee laboratory usage across all facilities. Coordinate practical sessions, classes, and maintenance blocks.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          {(["timeline", "month", "week"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                viewMode === mode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {mode === "timeline" ? "Timeline" : mode === "month" ? "Month" : "Week"}
            </button>
          ))}
        </div>

        {/* Mini Calendar Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-black text-slate-900">
              {MONTHS[calMonth]} {calYear}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day column headers */}
          <div className="grid grid-cols-7 gap-1 mb-1.5">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid matrix */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateObj = new Date(calYear, calMonth, day);
              const dow = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
              const hasSchedule = records.some((r) => r.dayOfWeek === dow);

              const isToday =
                day === today.getDate() &&
                calMonth === today.getMonth() &&
                calYear === today.getFullYear();
              const isSelected =
                day === selectedDate.getDate() &&
                calMonth === selectedDate.getMonth() &&
                calYear === selectedDate.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(calYear, calMonth, day))}
                  className={`
                    relative w-full aspect-square flex items-center justify-center rounded-xl text-xs font-semibold transition-all
                    ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105"
                        : isToday
                        ? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
                        : "text-slate-700 hover:bg-slate-100"
                    }
                  `}
                >
                  {day}
                  {hasSchedule && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facilities Filter List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">
            FACILITIES
          </h3>
          <div className="space-y-2.5">
            {rooms.map((room) => {
              const theme = getTheme(room.id);
              const isVisible = visibleRooms.has(room.id);

              return (
                <label
                  key={room.id}
                  className="flex items-center gap-3 cursor-pointer select-none group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleRoom(room.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                        isVisible
                          ? `${theme.dotColor} border-transparent shadow-sm`
                          : "bg-white border-slate-300 group-hover:border-slate-400"
                      }`}
                    >
                      {isVisible && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-semibold transition-colors ${isVisible ? "text-slate-800" : "text-slate-400 line-through"}`}>
                    {room.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Action Button: Book Session */}
        <button
          onClick={() => {
            const dow = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
            setFormData({
              roomId: rooms[0]?.id || "",
              subject: "",
              teacher: session?.user?.name || "",
              className: "",
              dayOfWeek: String(dow),
              startTime: "08:00",
              endTime: "10:30",
              academicYear: "2026/2027",
              semester: "GANJIL",
            });
            setShowForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-98 transition-all shadow-lg shadow-blue-600/25"
        >
          <Plus className="w-4 h-4" />
          + Book Session
        </button>
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatDateHeader(selectedDate)}
            </h2>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              Week {getWeekNumber(selectedDate)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search schedule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-36 sm:w-48 transition-all"
              />
            </div>

            {/* Prev / Today / Next */}
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-0.5">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(today)}
                className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-white rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── VIEW MODE: TIMELINE ─── */}
        {viewMode === "timeline" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
            {/* Column Headers for Labs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <div className="w-16 shrink-0 py-3.5 text-center text-[11px] font-bold text-slate-400 uppercase">
                Time
              </div>
              {rooms
                .filter((r) => visibleRooms.has(r.id))
                .map((room) => {
                  const theme = getTheme(room.id);
                  return (
                    <div
                      key={room.id}
                      className="flex-1 min-w-[150px] py-3.5 px-3 text-center border-l border-slate-100"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                        {room.name}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Timeline Grid Rows */}
            {loading ? (
              <div className="flex items-center justify-center h-96 text-slate-400 text-sm">
                <svg className="animate-spin w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                </svg>
                Loading schedule timeline...
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                {/* Real-time Indicator Line (Stitch Style) */}
                {isSelectedDateToday && currentHourDecimal >= 7 && currentHourDecimal <= 19 && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                    style={{ top: `${currentTimeTop}px` }}
                  >
                    <div className="bg-red-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md ml-2 z-30">
                      {currentTimeFormatted}
                    </div>
                    <div className="flex-1 h-0.5 bg-red-500/80 -ml-1" />
                  </div>
                )}

                {HOURS.map((hour) => (
                  <div key={hour} className="flex border-b border-slate-100 min-h-[80px]">
                    {/* Time Label */}
                    <div className="w-16 shrink-0 pr-3 pt-2 text-right">
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        {String(hour).padStart(2, "0")}:00
                      </span>
                    </div>

                    {/* Room Columns */}
                    {rooms
                      .filter((r) => visibleRooms.has(r.id))
                      .map((room) => {
                        const theme = getTheme(room.id);
                        const cellRecords = dayRecords.filter((rec) => {
                          if (rec.roomId !== room.id) return false;
                          const start = timeToHour(rec.startTime);
                          const end = timeToHour(rec.endTime);
                          return start < hour + 1 && end > hour;
                        });

                        return (
                          <div
                            key={room.id}
                            className="flex-1 min-w-[150px] border-l border-slate-100 relative p-1.5 hover:bg-slate-50/40 transition-colors"
                          >
                            {cellRecords.map((rec) => {
                              const start = timeToHour(rec.startTime);
                              const end = timeToHour(rec.endTime);
                              if (Math.floor(start) !== hour && start < hour) return null;

                              const duration = Math.max(end - start, 0.75);
                              const topOffset = (start - hour) * 80;
                              const height = duration * 80 - 6;

                              return (
                                <div
                                  key={rec.id}
                                  className={`absolute left-1.5 right-1.5 ${theme.cardBg} rounded-xl p-2.5 z-10 group/card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between`}
                                  style={{
                                    top: `${topOffset}px`,
                                    height: `${height}px`,
                                    minHeight: "44px",
                                  }}
                                >
                                  <div>
                                    {/* Header Badge */}
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <div className="flex gap-1 flex-wrap">
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md ${theme.tagColor}`}>
                                          {rec.className || "PRACTICAL"}
                                        </span>
                                        {rec.status === "MENUNGGU" && (
                                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500 text-white">
                                            MENUNGGU
                                          </span>
                                        )}
                                      </div>
                                      {isAdminOrToolman && (
                                        <div className="flex gap-1">
                                          {rec.status === "MENUNGGU" && (
                                            <>
                                              <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(rec.id, "DISETUJUI"); }}
                                                className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-black/10 transition-all text-emerald-400 hover:text-emerald-600"
                                                title="Setujui Jadwal"
                                              >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                              </button>
                                              <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(rec.id, "DITOLAK"); }}
                                                className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-black/10 transition-all text-red-400 hover:text-red-600"
                                                title="Tolak Jadwal"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </>
                                          )}
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(rec.id); }}
                                            className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-black/10 transition-all text-red-400 hover:text-red-600"
                                            title="Hapus Jadwal"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Subject Title */}
                                    <h4 className={`text-xs ${theme.titleColor} truncate leading-tight`}>
                                      {rec.subject}
                                    </h4>

                                    {/* Teacher / Subtitle */}
                                    <p className={`text-[10px] ${theme.descColor} truncate mt-0.5 flex items-center gap-1`}>
                                      <span>👨‍🏫</span> {rec.teacher}
                                    </p>
                                  </div>

                                  {/* Time Footer */}
                                  {height > 55 && (
                                    <div className="mt-1 flex items-center justify-between pt-1 border-t border-white/10 text-[10px] font-mono opacity-85">
                                      <span>{rec.startTime} - {rec.endTime}</span>
                                      <span className="text-[9px] uppercase">{room.name}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                  </div>
                ))}
              </div>
            )}

            {/* Footer Summary */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                {dayRecords.length} sesi praktikum terdaftar pada hari {DAYS_FULL[selectedDate.getDay()]}
              </span>
              <span>
                {rooms.filter((r) => visibleRooms.has(r.id)).length} dari {rooms.length} fasilitas lab aktif
              </span>
            </div>
          </div>
        )}

        {/* ─── VIEW MODE: WEEK ─── */}
        {viewMode === "week" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Jadwal Mingguan Terpadu (Senin - Sabtu)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((dow) => {
                const dayName = DAYS_FULL[dow];
                const daySchedules = records
                  .filter((r) => r.dayOfWeek === dow && visibleRooms.has(r.roomId))
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div key={dow} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                      <span className="font-bold text-sm text-slate-800">{dayName}</span>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {daySchedules.length} Sesi
                      </span>
                    </div>

                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Tidak ada jadwal</p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedules.map((s) => (
                          <div key={s.id} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-slate-900 truncate">{s.subject}</span>
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                                {s.startTime} - {s.endTime}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>👨‍🏫 {s.teacher} ({s.className})</span>
                              <span className="font-semibold text-slate-700">{s.room.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── VIEW MODE: MONTH ─── */}
        {viewMode === "month" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Overview Kalender Bulan {MONTHS[calMonth]} {calYear}
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-xs font-bold text-slate-400 uppercase py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`m-empty-${i}`} className="min-h-[80px] bg-slate-50/50 rounded-xl" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateObj = new Date(calYear, calMonth, day);
                const dow = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
                const daySchedules = records.filter((r) => r.dayOfWeek === dow && visibleRooms.has(r.roomId));

                return (
                  <div
                    key={day}
                    onClick={() => {
                      setSelectedDate(dateObj);
                      setViewMode("timeline");
                    }}
                    className="min-h-[80px] p-1.5 border border-slate-200/80 rounded-xl text-left hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-slate-700">{day}</span>
                    {daySchedules.length > 0 ? (
                      <div className="space-y-1 mt-1">
                        {daySchedules.slice(0, 2).map((s) => (
                          <div key={s.id} className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1 py-0.5 rounded truncate">
                            {s.startTime} {s.subject}
                          </div>
                        ))}
                        {daySchedules.length > 2 && (
                          <span className="text-[9px] text-slate-400 block text-right">
                            +{daySchedules.length - 2} lagi
                          </span>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── BOOK SESSION MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Tambah Jadwal Praktikum
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menambahkan jadwal untuk hari <span className="font-bold text-blue-600">{DAYS_FULL[parseInt(formData.dayOfWeek)]}</span>
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Mata Pelajaran *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Contoh: Pemrograman Web, Basis Data, Jaringan Komputer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Guru Pengajar *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="Nama Guru Pengajar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Kelas *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="Contoh: XI RPL 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Ruangan Lab *
                  </label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Pilih Lab...</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Hari Praktikum *
                  </label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-blue-700"
                  >
                    {DAYS_FULL.slice(1).map((d, i) => (
                      <option key={i + 1} value={i + 1}>
                        Hari {d}
                      </option>
                    ))}
                    <option value="7">Hari Minggu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-98 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
