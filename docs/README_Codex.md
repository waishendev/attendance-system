# Task: Build a Demo Clock In/Clock Out Page

## Goal
We need a simple demo attendance system for both **desktop and mobile**.  
It should allow users to **Clock In / Clock Out** only (no break in/out needed).

## Requirements
- Modify the **`/` (root)** page to display the design below, but adapted for Clock In/Clock Out.
- Add **location fetching** and show current location (address or coordinates).
- Add a simple **data/user.ts** file that contains demo user info (id, name, pin).
- Users must enter their **PIN** before being allowed to Clock In/Out.
- Each clock action should be saved in a local record (state).
- Show today's **history logs** at the bottom (Clock In/Out times).
- Responsive design: should work well on **mobile and desktop**.

## Design
- Big clock in the middle (current time + date).
- Location display (with 📍 icon).
- Two main buttons:
  - 🟢 Clock In
  - 🔴 Clock Out
- Below: today’s clock history list.

## Example Flow
1. User opens `/`.
2. Sees current time, date, and location.
3. Enters PIN → gets access to Clock In/Clock Out buttons.
4. Clicks "Clock In" → record is saved → shows in history.
5. Later clicks "Clock Out" → record saved → shows in history.

## Tech
- Next.js (App Router).
- Tailwind CSS for styling.
- Use React state for logs (no backend needed).
- Fetch location using `navigator.geolocation`.

