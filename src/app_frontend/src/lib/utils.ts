import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Allow only digits and a single dot, clamp fractional digits
export function sanitizeDecimalInput(
  value: string,
  maxDecimals: number
): string {
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

export const safeStringify = (value: unknown): string => {
  const seen = new WeakSet<object>();
  const isPlainObject = (o: any) =>
    Object.prototype.toString.call(o) === "[object Object]";

  const toHex = (u8: Uint8Array) =>
    Array.from(u8)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const formatValue = (v: any): string => {
    if (v === null || v === undefined) return "";
    const t = typeof v;
    if (t === "bigint") return (v as bigint).toString();
    if (t === "string") return v as string;
    if (t === "number" || t === "boolean") return String(v);
    if (v instanceof Uint8Array) return `0x${toHex(v)}`;
    if (Array.isArray(v)) return v.map(formatValue).join(", ");
    if (isPlainObject(v)) return flattenObject(v);
    return String(v);
  };

  const flattenObject = (obj: Record<string, any>): string => {
    if (seen.has(obj)) return "[Circular]";
    seen.add(obj);
    const keys = Object.keys(obj);
    // Variant-like: { Variant: {...} }
    if (keys.length === 1 && /^[A-Z]/.test(keys[0])) {
      const k = keys[0];
      const inner = obj[k];
      // If inner is object, print key=value pairs without braces
      if (isPlainObject(inner)) {
        const innerPairs = Object.keys(inner)
          .map((ik) => `${ik}=${formatValue(inner[ik])}`)
          .join(", ");
        return `${k}: ${innerPairs}`;
      }
      return `${k}: ${formatValue(inner)}`;
    }
    return keys.map((k) => `${k}=${formatValue(obj[k])}`).join(", ");
  };

  try {
    if (isPlainObject(value as any)) return flattenObject(value as any);
    return formatValue(value);
  } catch {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
};
