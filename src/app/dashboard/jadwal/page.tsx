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
}

interface RoomData {
  id: string;
  name: string;
}

// Lab color mapping
const LAB_COLORS: Record<number, { bg: string; border: string; text: string; dot: string }> = {
  0: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
  1: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  2: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", dot: "bg-purple-500" },
  3: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500" },
  4: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500" },
  5: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", dot: "bg-cyan-500" },
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

  // Calendar state
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Lab visibility toggles
  const [visibleRooms, setVisibleRooms] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    roomId: "",
    subject: "",
    teacher: "",
    className: "",
    dayOfWeek: "1",
    startTime: "07:30",
    endTime: "10:00",
    academicYear: "2026/2027",
    semester: "GANJIL",
    type: "PRACTICAL",
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
        setRooms(jsonRooms.data);
        // Initially all rooms visible
        setVisibleRooms(new Set(jsonRooms.data.map((r: RoomData) => r.id)));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData, dayOfWeek: parseInt(formData.dayOfWeek) };
      const res = await fetch("/api/jadwal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Jadwal berhasil ditambahkan");
        setShowForm(false);
        setFormData({
          roomId: "",
          subject: "",
          teacher: "",
          className: "",
          dayOfWeek: "1",
          startTime: "07:30",
          endTime: "10:00",
          academicYear: "2026/2027",
          semester: "GANJIL",
          type: "PRACTICAL",
        });
        fetchData();
      } else {
        toast.error(json.error);
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
      const json = await res.json();
      if (json.success) {
        toast.success("Jadwal dihapus");
        fetchData();
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
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
      .filter((r) => r.dayOfWeek === selectedDayOfWeek && visibleRooms.has(r.roomId))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [records, selectedDayOfWeek, visibleRooms]);

  // Build room color index
  const roomColorIndex = useMemo(() => {
    const map: Record<string, number> = {};
    rooms.forEach((r, i) => {
      map[r.id] = i % Object.keys(LAB_COLORS).length;
    });
    return map;
  }, [rooms]);

  // Calendar helpers
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  // Convert time string "HH:MM" to fractional hour
  const timeToHour = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h + m / 60;
  };

  // Get formatted day string
  const formatDateHeader = (date: Date) => {
    return `${DAYS_FULL[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] animate-fade-in">
      {/* ─── LEFT SIDEBAR ─── */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-5">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Schedule</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage and oversee laboratory usage across all facilities.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex bg-surface-container-low rounded-lg p-1 gap-1">
          {(["timeline", "month", "week"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                viewMode === mode
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {mode === "timeline" ? "Timeline" : mode === "month" ? "Month" : "Week"}
            </button>
          ))}
        </div>

        {/* Mini Calendar */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-on-surface">
              {MONTHS[calMonth]} {calYear}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-surface-container-high transition-colors">
                <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
              </button>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-surface-container-high transition-colors">
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-on-surface-variant uppercase">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isToday =
                day === today.getDate() &&
                calMonth === today.getMonth() &&
                calYear === today.getFullYear();
              const isSelected =
                day === selectedDate.getDate() &&
                calMonth === selectedDate.getMonth() &&
                calYear === selectedDate.getFullYear();

              // Check if any schedule exists on this day
              const dateObj = new Date(calYear, calMonth, day);
              const dow = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
              const hasSchedule = records.some((r) => r.dayOfWeek === dow);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(calYear, calMonth, day))}
                  className={`
                    relative w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all
                    ${isSelected
                      ? "bg-primary text-on-primary font-bold shadow-sm"
                      : isToday
                        ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/30"
                        : "text-on-surface hover:bg-surface-container-high"
                    }
                  `}
                >
                  {day}
                  {hasSchedule && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facilities List */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
            Facilities
          </h3>
          <div className="space-y-2">
            {rooms.map((room, idx) => {
              const colorIdx = idx % Object.keys(LAB_COLORS).length;
              const colors = LAB_COLORS[colorIdx];
              const isVisible = visibleRooms.has(room.id);

              return (
                <label
                  key={room.id}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleRoom(room.id)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${
                        isVisible
                          ? `${colors.dot} border-transparent`
                          : "bg-transparent border-outline-variant"
                      }`}
                    >
                      {isVisible && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isVisible ? "text-on-surface" : "text-on-surface-variant line-through opacity-50"}`}>
                    {room.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Book Session Button */}
        <button
          onClick={() => {
            if (session?.user?.name && !formData.teacher) {
              setFormData((prev) => ({ ...prev, teacher: session.user?.name || "" }));
            }
            setShowForm(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:bg-primary-container transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {isAdminOrToolman ? "+ Book Session" : "+ Ajukan Jadwal"}
        </button>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 min-w-0">
        {/* Day Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-on-surface">
              {formatDateHeader(selectedDate)}
            </h2>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
              Week {getWeekNumber(selectedDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
              className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-on-surface-variant" />
            </button>
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-surface-container hover:bg-surface-container-high transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
              className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Timeline View */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-on-surface-variant">
            <svg className="animate-spin w-6 h-6 text-primary mr-2" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
            </svg>
            Loading schedules...
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            {/* Room column headers */}
            <div className="flex border-b border-outline-variant/50">
              <div className="w-16 shrink-0" />
              {rooms.filter((r) => visibleRooms.has(r.id)).map((room, idx) => {
                const colorIdx = roomColorIndex[room.id] ?? 0;
                const colors = LAB_COLORS[colorIdx];
                return (
                  <div
                    key={room.id}
                    className="flex-1 min-w-[140px] px-3 py-3 text-center border-l border-outline-variant/30"
                  >
                    <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                      {room.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Timeline grid */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="flex border-b border-outline-variant/20 min-h-[80px]">
                  {/* Time label */}
                  <div className="w-16 shrink-0 pr-2 pt-1 text-right">
                    <span className="text-[11px] font-medium text-on-surface-variant">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>

                  {/* Room columns */}
                  {rooms.filter((r) => visibleRooms.has(r.id)).map((room) => {
                    const colorIdx = roomColorIndex[room.id] ?? 0;
                    const colors = LAB_COLORS[colorIdx];

                    // Find records that overlap with this hour for this room
                    const cellRecords = dayRecords.filter((rec) => {
                      if (rec.roomId !== room.id) return false;
                      const start = timeToHour(rec.startTime);
                      const end = timeToHour(rec.endTime);
                      return start < hour + 1 && end > hour;
                    });

                    return (
                      <div
                        key={room.id}
                        className="flex-1 min-w-[140px] border-l border-outline-variant/20 relative p-1"
                      >
                        {cellRecords.map((rec) => {
                          const start = timeToHour(rec.startTime);
                          const end = timeToHour(rec.endTime);
                          // Only render the block in the first hour it appears
                          if (Math.floor(start) !== hour && start < hour) return null;

                          const heightHours = end - start;
                          const topOffset = (start - hour) * 80;
                          const height = heightHours * 80 - 4;

                          return (
                            <div
                              key={rec.id}
                              className={`absolute left-1 right-1 ${colors.bg} ${colors.border} border rounded-lg p-2 overflow-hidden z-10 group/card cursor-pointer hover:shadow-md transition-shadow`}
                              style={{
                                top: `${topOffset}px`,
                                height: `${height}px`,
                                minHeight: "36px",
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className={`text-[10px] font-bold uppercase tracking-wider ${colors.text} opacity-70 mb-0.5`}>
                                    {rec.className || "Practical"}
                                  </div>
                                  <p className={`text-sm font-bold ${colors.text} truncate leading-tight`}>
                                    {rec.subject}
                                  </p>
                                  <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                                    👨‍🏫 {rec.teacher}
                                  </p>
                                </div>
                                {isAdminOrToolman && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(rec.id);
                                    }}
                                    className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-white/60 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                  </button>
                                )}
                              </div>
                              {height > 60 && (
                                <p className="text-[10px] text-on-surface-variant mt-1">
                                  {rec.startTime} - {rec.endTime}
                                </p>
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

            {/* Footer */}
            <div className="px-4 py-3 border-t border-outline-variant/50 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-medium">
                {dayRecords.length} session{dayRecords.length !== 1 ? "s" : ""} scheduled
              </span>
              <span className="text-xs text-on-surface-variant">
                {rooms.filter((r) => visibleRooms.has(r.id)).length} of {rooms.length} labs visible
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── BOOK SESSION MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/50">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Book New Session
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Mata Pelajaran *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Web Development, Network Security..."
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Guru Pengajar *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="Nama Guru"
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Kelas *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="XI RPL 1"
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Ruangan Lab *
                  </label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Hari *
                  </label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {DAYS_FULL.slice(1).map((d, i) => (
                      <option key={i + 1} value={i + 1}>
                        {d}
                      </option>
                    ))}
                    <option value="7">Minggu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-surface-container-low border-none rounded-lg py-2.5 px-4 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/50">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-on-surface-variant bg-surface-container-low hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Book Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
