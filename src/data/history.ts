export type CheckType = 'in' | 'out';

export interface ClockLog {
  id: string;
  userId: string;
  check_type: CheckType;
  check_time: string; // ISO string
  address?: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
}
