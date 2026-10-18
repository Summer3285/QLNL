import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '---';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '---';
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(dateString?: string | Date): string {
  if (!dateString) return '---';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '---';
  return d.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
