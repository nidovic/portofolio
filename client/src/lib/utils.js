import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge utility classes while keeping later Tailwind overrides predictable.
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}