import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ display_name: '' }, { status: 200 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=0`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'attendance-system-demo/1.0 (contact: demo@example.com)',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ display_name: '' }, { status: 200 });
    }

    const data = await res.json();
    const display_name = (data?.display_name || '')
      .toString()
      .replace(/[^\x00-\x7F]/g, '')
      .trim();

    return NextResponse.json({ display_name }, { status: 200 });
  } catch {
    return NextResponse.json({ display_name: '' }, { status: 200 });
  }
}
