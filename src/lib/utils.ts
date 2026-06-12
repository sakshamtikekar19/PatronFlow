import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Formats a YYYY-MM-DD birthday as "Mon D" (month + day only). Parsed as a
 * local date to avoid timezone day-shift, since birthdays have no time/year
 * relevance.
 */
export function formatBirthday(date: string | null | undefined): string {
  if (!date) return "—";
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(y, m - 1, d));
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Returns true when a YYYY-MM-DD birthday falls on today's month + day
 * (year-agnostic). Parsed as a local date to avoid timezone day-shift.
 */
export function isBirthdayToday(date: string | null | undefined): boolean {
  if (!date) return false;
  const [, m, d] = date.split("-").map(Number);
  if (!m || !d) return false;
  const now = new Date();
  return now.getMonth() + 1 === m && now.getDate() === d;
}

/**
 * Build a WhatsApp click-to-chat link from a stored phone number. Indian
 * 10-digit numbers are prefixed with the 91 country code; numbers that already
 * include a country code are used as-is.
 */
export function whatsappLink(phone: string, message?: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
