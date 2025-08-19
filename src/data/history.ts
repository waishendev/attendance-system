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

const logs: ClockLog[] = [];

// Demo：可以放几条初始数据（可删）
logs.push({
  id: 'seed-1',
  userId: 'u_001',
  check_type: 'in',
  check_time: new Date().toISOString(),
  address: 'Demo Office',
});

export function addLog(log: ClockLog) {
  logs.push(log);
}

export function getTodayLogs(userId: string, today = new Date()): ClockLog[] {
  const yyyy = today.getFullYear();
  const mm = today.getMonth();
  const dd = today.getDate();
  return logs.filter((l) => {
    if (l.userId !== userId) return false;
    const d = new Date(l.check_time);
    return d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd;
  });
}
