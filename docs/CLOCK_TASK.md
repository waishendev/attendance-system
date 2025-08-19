# Task: Fix geolocation + add file-backed persistence (no UI changes)

## Goals
1) Keep the current `/` page UI **exactly as-is** (no markup/style changes).
2) Make `/api/reverse-geocode` work so the page can display a proper address.
3) Persist clock-in/out logs to a local JSON file so data **survives page refresh** (demo-only).
4) Keep the submit button disabled until: PIN is filled AND geolocation is granted AND address is resolved.

---

## 1) Reverse Geocoding API (App Router)
Create `src/app/api/reverse-geocode/route.ts` that proxies to a reverse-geocoding provider (e.g., OpenStreetMap Nominatim).  
**Requirements:**
- Input: `GET /api/reverse-geocode?lat=<number>&lon=<number>`
- Output: JSON with at least `{ display_name: string }`
- Set a custom `User-Agent` header to avoid being blocked by the provider.
- On any error, return `{ display_name: "" }` with `200` to keep the client simple.

Example shape:
```ts
// src/app/api/reverse-geocode/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ display_name: '' }, { status: 200 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=0`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'attendance-system-demo/1.0 (contact: demo@example.com)' },
      // Nominatim requires a valid UA; adjust contact as needed.
      cache: 'no-store',
    });

    if (!res.ok) return NextResponse.json({ display_name: '' }, { status: 200 });

    const data = await res.json();
    const display_name =
      (data?.display_name || '').toString().replace(/[^\x00-\x7F]/g, '').trim();

    return NextResponse.json({ display_name }, { status: 200 });
  } catch {
    return NextResponse.json({ display_name: '' }, { status: 200 });
  }
}
Important: Do not change the frontend fetch URL; it must stay /api/reverse-geocode?lat=...&lon=....

2) File-backed persistence for clock logs
Implement file persistence so logs survive page refresh during the demo (container-local write is fine).

Create a server-only helper
src/lib/history.ts (server code):

Backing file path: ./data/history.json

Export:

readAll(): Promise<ClockLog[]>

append(log: ClockLog): Promise<void>

getToday(userId: string, now?: Date): Promise<ClockLog[]>

Types should match the current client usage:

ts
Copy
Edit
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
Behavior:

If history.json does not exist, create it with [].

Reads/writes must be atomic and handled via fs/promises.

Use local time for "today" grouping (simple match by Y/M/D is sufficient).

This is demo-only; no DB required.

Add API endpoints to use the helper
POST /api/clock → append one log (body is a ClockLog)

GET /api/clock/today?userId=... → returns today’s logs for that user

Example shapes:

ts
Copy
Edit
// src/app/api/clock/route.ts
import { NextResponse } from 'next/server';
import { append } from '@/lib/history';

export async function POST(req: Request) {
  try {
    const log = await req.json();
    await append(log);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
ts
Copy
Edit
// src/app/api/clock/today/route.ts
import { NextResponse } from 'next/server';
import { getToday } from '@/lib/history';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || '';
  const logs = userId ? await getToday(userId) : [];
  return NextResponse.json({ logs });
}
Wire the existing page to use these APIs
Do not change the current design/markup. Only replace the in-memory calls:

Replace addLog(...) with POST /api/clock (send the same object).

Replace getTodayLogs(user.id) with GET /api/clock/today?userId=....

Keep the current states, disable logic, and success/error banners intact.

3) Don’t change the UI
The current / page (time ring, location block, PIN field, check-type buttons, submit button, history gray box) must look identical.

Only adjust logic to:

Request geolocation (button or on load—your choice) and call /api/reverse-geocode

Disable submit when: PIN empty OR geolocation not granted OR address empty/failed

Post a log and then refresh today’s logs from the API

4) Acceptance checklist
Visiting http://localhost:3000/ asks for location (or an explicit “Enable Location” workflow that clearly works).

GET /api/reverse-geocode?... returns { display_name: "..." } (no 404).

After Clock In/Out, refresh the page: today’s records still show (file persisted).

No visual regressions vs. the current / page.