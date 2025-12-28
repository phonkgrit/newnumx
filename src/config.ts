// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Number Types
export const NUMBER_TYPES = {
  '2digit': '2 ตัว',
  '3digit': '3 ตัว',
} as const;

export type NumberType = keyof typeof NUMBER_TYPES;
