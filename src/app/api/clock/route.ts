import { NextResponse } from 'next/server';
import { append } from '@/lib/history';
import type { ClockLog } from '@/data/history';

export async function POST(req: Request) {
  try {
    const log = (await req.json()) as ClockLog;
    await append(log);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
