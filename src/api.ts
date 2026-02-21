import axios from 'axios';
import { API_BASE_URL } from './config';
import type {
  LotteryRound,
  LotteryEntry,
  PriceLimit,
  NumberSummary,
  RoundSummary,
  CreateEntryData,
  CreateLimitData,
} from './types';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rounds API
export const roundsApi = {
  getAll: () => api.get<LotteryRound[]>('/rounds/'),
  getById: (id: number) => api.get<LotteryRound>(`/rounds/${id}`),
  create: (drawDate: string) => api.post<LotteryRound>('/rounds/', { draw_date: drawDate }),
  update: (id: number, status: string) => api.put<LotteryRound>(`/rounds/${id}`, { status }),
  delete: (id: number) => api.delete(`/rounds/${id}`),
  getSummary: (id: number) => api.get<RoundSummary>(`/rounds/${id}/summary`),
};

// Entries API
export const entriesApi = {
  getByRound: (roundId: number, limit: number = 10, offset: number = 0) => api.get<{ entries: LotteryEntry[]; total: number; offset: number; limit: number }>(`/entries/round/${roundId}?limit=${limit}&offset=${offset}`),
  getById: (id: number) => api.get<LotteryEntry>(`/entries/${id}`),
  create: (data: CreateEntryData) => api.post<LotteryEntry>('/entries/', data),
  update: (id: number, data: Partial<CreateEntryData>) => api.put<LotteryEntry>(`/entries/${id}`, data),
  delete: (id: number) => api.delete(`/entries/${id}`),
  getSummary: (roundId: number) => api.get<NumberSummary[]>(`/entries/round/${roundId}/summary`),
};

// Limits API
export const limitsApi = {
  getByRound: (roundId: number) => api.get<PriceLimit[]>(`/limits/round/${roundId}`),
  create: (data: CreateLimitData) => api.post<PriceLimit>('/limits/', data),
  update: (id: number, limitAmount: number) => api.put<PriceLimit>(`/limits/${id}`, { limit_amount: limitAmount }),
  delete: (id: number) => api.delete(`/limits/${id}`),
};

export default api;
