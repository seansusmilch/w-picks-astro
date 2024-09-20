import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useState, useEffect } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prevents React errors #423 and #425
 * https://stackoverflow.com/a/73006128/27063322
 */
export function useFormattedDate(date) {
  const [formattedDate, setFormattedDate] = useState<Date>(null);

  useEffect(() => setFormattedDate(new Date(date)), []);

  return formattedDate;
}
