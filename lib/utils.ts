import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export { formatBytes } from './utils/format'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
