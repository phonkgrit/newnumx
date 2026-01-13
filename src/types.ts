export type MenuType = 'rounds' | 'entry' | 'reports' | 'settings';

export interface LotteryRound {
  id: number;
  draw_date: string;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceLimit {
  id: number;
  round_id: number;
  number_type: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export interface LotteryEntry {
  id: number;
  round_id: number;
  number_value: string;
  number_type: string;
  price: number;
  is_over_limit: boolean;
  customer_name: string | null;
  recorded_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface NumberSummary {
  number_value: string;
  number_type: string;
  total_entries: number;
  total_amount: number;
  limit_amount: number;
  is_over_limit: boolean;
}

export interface RoundSummary {
  round_id: number;
  draw_date: string;
  status: string;
  total_entries: number;
  total_amount: number;
  over_limit_count: number;
}

export interface CreateEntryData {
  round_id: number;
  number_value: string;
  number_type: string;
  price: number;
  recorded_by?: string | null;
}

export interface CreateLimitData {
  round_id: number;
  number_type: string;
  limit_amount: number;
}
