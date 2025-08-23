import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Allow only digits and a single dot, clamp fractional digits
export function sanitizeDecimalInput(value: string, maxDecimals: number): string {
  // Remove invalid characters
  let v = value.replace(/[^0-9.]/g, "");
  // Allow only the first dot
  const firstDot = v.indexOf(".");
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
  }
  // Clamp decimals
  if (firstDot !== -1) {
    const [w, f] = v.split(".");
    return `${w}.${(f || "").slice(0, maxDecimals)}`;
  }
  return v;
}

export function isValidEthAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address.trim());
}
