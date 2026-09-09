/**
 * Konfigurasi Jam Mengajar SMK Muhammadiyah Majenang
 * Berdasarkan tabel KETERANGAN JAM MENGAJAR resmi sekolah.
 *
 * dayType:
 *   "senin"       → Senin (ada Upacara)
 *   "selasa-kamis" → Selasa, Rabu, Kamis (jadwal normal panjang)
 *   "jumat"       → Jumat (jadwal pendek, 7 jam)
 */

export interface PeriodSlot {
  period: number;       // Jam ke-X (1, 2, 3, ...)
  startTime: string;    // "07:30"
  endTime: string;      // "08:00"
  label: string;        // "Jam 1"
  isBreak?: boolean;    // true = istirahat
}

export type DayType = "senin" | "selasa-kamis" | "jumat";

// ─── Senin ──────────────────────────────────────────────────────
const SENIN_SCHEDULE: PeriodSlot[] = [
  { period: 0, startTime: "07:00", endTime: "07:45", label: "Upacara", isBreak: true },
  { period: 1, startTime: "07:45", endTime: "08:15", label: "Jam 1" },
  { period: 2, startTime: "08:15", endTime: "08:45", label: "Jam 2" },
  { period: 3, startTime: "08:45", endTime: "09:15", label: "Jam 3" },
  { period: -1, startTime: "09:15", endTime: "09:45", label: "Istirahat", isBreak: true },
  { period: 4, startTime: "09:45", endTime: "10:15", label: "Jam 4" },
  { period: 5, startTime: "10:15", endTime: "10:45", label: "Jam 5" },
  { period: 6, startTime: "10:45", endTime: "11:15", label: "Jam 6" },
  { period: 7, startTime: "11:15", endTime: "11:45", label: "Jam 7" },
  { period: -2, startTime: "11:45", endTime: "13:00", label: "Istirahat", isBreak: true },
  { period: 8, startTime: "13:00", endTime: "13:30", label: "Jam 8" },
  { period: 9, startTime: "13:30", endTime: "14:00", label: "Jam 9" },
  { period: 10, startTime: "14:00", endTime: "14:30", label: "Jam 10" },
];

// ─── Selasa, Rabu, Kamis ────────────────────────────────────────
const SELASA_KAMIS_SCHEDULE: PeriodSlot[] = [
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
  { period: -2, startTime: "12:00", endTime: "13:00", label: "Istirahat", isBreak: true },
  { period: 9, startTime: "13:00", endTime: "13:30", label: "Jam 9" },
  { period: 10, startTime: "13:30", endTime: "14:00", label: "Jam 10" },
  { period: 11, startTime: "14:00", endTime: "14:30", label: "Jam 11" },
];

// ─── Jumat ──────────────────────────────────────────────────────
const JUMAT_SCHEDULE: PeriodSlot[] = [
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

const SCHEDULE_MAP: Record<DayType, PeriodSlot[]> = {
  "senin": SENIN_SCHEDULE,
  "selasa-kamis": SELASA_KAMIS_SCHEDULE,
  "jumat": JUMAT_SCHEDULE,
};

/**
 * Mendapatkan tipe hari berdasarkan dayOfWeek (1=Senin ... 7=Minggu)
 */
export function getDayType(dayOfWeek: number): DayType | null {
  if (dayOfWeek === 1) return "senin";
  if (dayOfWeek >= 2 && dayOfWeek <= 4) return "selasa-kamis";
  if (dayOfWeek === 5) return "jumat";
  return null; // Sabtu/Minggu — tidak ada jadwal reguler
}

/**
 * Mendapatkan jadwal jam mengajar untuk hari tertentu
 */
export function getScheduleForDay(dayOfWeek: number): PeriodSlot[] {
  const dayType = getDayType(dayOfWeek);
  if (!dayType) return [];
  return SCHEDULE_MAP[dayType];
}

/**
 * Mendapatkan jadwal jam mengajar berdasarkan tanggal
 */
export function getScheduleForDate(date: Date): PeriodSlot[] {
  // JS: getDay() = 0(Sun) ... 6(Sat) → convert to 1(Mon) ... 7(Sun)
  const jsDay = date.getDay();
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;
  return getScheduleForDay(dayOfWeek);
}

/**
 * Mendapatkan nama hari (Indonesia) dari dayOfWeek (1-7)
 */
export function getDayName(dayOfWeek: number): string {
  const days = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  return days[dayOfWeek] || "";
}

/**
 * Mendapatkan dayOfWeek (1=Senin) dari Date
 */
export function getDayOfWeek(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Mendapatkan waktu mulai berdasarkan jam ke-X dan hari
 */
export function getTimeForPeriod(period: number, dayOfWeek: number): { startTime: string; endTime: string } | null {
  const schedule = getScheduleForDay(dayOfWeek);
  const slot = schedule.find(s => s.period === period);
  if (!slot) return null;
  return { startTime: slot.startTime, endTime: slot.endTime };
}

/**
 * Mendapatkan waktu mulai dari periode awal dan waktu selesai dari periode akhir
 */
export function getTimeRange(startPeriod: number, endPeriod: number, dayOfWeek: number): { startTime: string; endTime: string } | null {
  const schedule = getScheduleForDay(dayOfWeek);
  const startSlot = schedule.find(s => s.period === startPeriod);
  const endSlot = schedule.find(s => s.period === endPeriod);
  if (!startSlot || !endSlot) return null;
  return { startTime: startSlot.startTime, endTime: endSlot.endTime };
}

/**
 * Jumlah jam pelajaran maksimum per hari
 */
export function getMaxPeriods(dayOfWeek: number): number {
  const dayType = getDayType(dayOfWeek);
  if (dayType === "senin") return 10;
  if (dayType === "selasa-kamis") return 11;
  if (dayType === "jumat") return 7;
  return 0;
}
