import { promises as fs } from 'fs';
import path from 'path';
import type { ClockLog } from '@/data/history';

const DATA_FILE = path.join(process.cwd(), 'data', 'history.json');

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function readAll(): Promise<ClockLog[]> {
  await ensureFile();
  try {
    const text = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(text) as ClockLog[];
  } catch {
    return [];
  }
}

export async function append(log: ClockLog): Promise<void> {
  const logs = await readAll();
  logs.push(log);
  await fs.writeFile(DATA_FILE, JSON.stringify(logs, null, 2));
}

export async function getToday(userId: string, now = new Date()): Promise<ClockLog[]> {
  const logs = await readAll();
  const yyyy = now.getFullYear();
  const mm = now.getMonth();
  const dd = now.getDate();
  return logs.filter((l) => {
    if (l.userId !== userId) return false;
    const d = new Date(l.check_time);
    return d.getFullYear() === yyyy && d.getMonth() === mm && d.getDate() === dd;
  });
}
