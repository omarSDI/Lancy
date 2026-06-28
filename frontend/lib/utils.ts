/**
 * Lansy.ai — Utility Functions
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Merge class names with clsx (shadcn/ui pattern).
 * Since we're not using tailwind-merge, we use clsx directly.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a date string to a localized display format.
 */
export function formatDate(dateStr: string, locale: string = 'fr-TN'): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a relative time (e.g., "il y a 2 heures").
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(dateStr);
}

/**
 * Get ATS score color based on value.
 */
export function getATSColor(score: number): string {
  if (score >= 80) return '#10B981'; // emerald-500
  if (score >= 60) return '#F59E0B'; // amber-500
  return '#EF4444'; // red-500
}

/**
 * Get ATS score label.
 */
export function getATSLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  return 'À améliorer';
}

/**
 * Truncate text to a maximum length.
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
