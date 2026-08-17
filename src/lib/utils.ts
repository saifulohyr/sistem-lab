import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function generateCode(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(3, "0")}`;
}

export const CONDITIONS = [
  { value: "BAIK", label: "Baik", color: "emerald" },
  { value: "RUSAK_RINGAN", label: "Rusak Ringan", color: "amber" },
  { value: "RUSAK_BERAT", label: "Rusak Berat", color: "red" },
  { value: "TIDAK_DITEMUKAN", label: "Tidak Ditemukan", color: "slate" },
] as const;

export const STATUSES = [
  { value: "AKTIF", label: "Aktif", color: "emerald" },
  { value: "PERBAIKAN", label: "Perbaikan", color: "amber" },
  { value: "DIPINJAM", label: "Dipinjam", color: "blue" },
  { value: "NONAKTIF", label: "Nonaktif", color: "slate" },
  { value: "DIHAPUS", label: "Dihapus", color: "red" },
] as const;

export const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "TOOLMAN", label: "Toolman" },
  { value: "KEPALA_LAB", label: "Kepala Lab" },
  { value: "GURU", label: "Guru / Peminjam" },
] as const;

export function getConditionLabel(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.label ?? value;
}

export function getConditionColor(value: string): string {
  return CONDITIONS.find((c) => c.value === value)?.color ?? "slate";
}

export function getStatusLabel(value: string): string {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function getRoleLabel(value: string): string {
  return ROLES.find((r) => r.value === value)?.label ?? value;
}
