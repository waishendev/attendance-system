import { NextResponse } from 'next/server';
import { getToday } from '@/lib/history';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const logs = userId ? await getToday(userId) : [];
  return NextResponse.json({ logs });
}
