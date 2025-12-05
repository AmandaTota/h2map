import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number | string, decimals: number = 0): string {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }

  if (isNaN(value)) return '0';

  // Format with specified decimals
  const formatted = value.toFixed(decimals);

  // Remove unnecessary decimal places
  return parseFloat(formatted).toString();
}
