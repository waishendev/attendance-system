# Task: Mobile-first polish for Attendance Demo (keep desktop as-is)

**Goal:** Make the `/` page feel like a lightweight mobile web app while preserving the current desktop look. Focus on touch targets, layout, and readability on small screens (<= 390–430px wide).

## Must-haves
1) **Responsive layout (no desktop regressions)**
   - Keep the current desktop styles (≥ `md`).
   - On mobile (`<md`):
     - Card container: `w-full max-w-[420px] mx-auto px-3 sm:px-4`.
     - Reduce outer shadows slightly to avoid heavy halos on tiny screens.

2) **Time capsule (clock)**
   - Full-bleed inside the card on mobile: `rounded-2xl px-4 py-5`.
   - Ensure the time text doesn’t wrap; scale font: `text-4xl` (mobile) → `md:text-5xl` (desktop).
   - Date line: `text-sm md:text-base`.

3) **Location block**
   - Prefix pin icon stays; wrap long addresses gracefully: `break-words leading-relaxed`.
   - Two lines max on very small screens; then ellipsis (`line-clamp-2` if available).

4) **Inputs & buttons (tap comfort)**
   - Inputs and main actions must be easy to hit:
     - Height ≥ 44px; font-size ≥ 16px (prevents iOS zoom).
     - Buttons `IN/OUT`: stack on mobile (2 rows), side-by-side only on `md+`.
     - Primary action **Submit**: full width, large, sticky at the bottom on mobile (see Sticky Action Bar below).

5) **Sticky Action Bar (mobile)**
   - On mobile, show a bottom bar that contains the **Submit** button:
     - Wrapper: `fixed inset-x-0 bottom-[env(safe-area-inset-bottom)] z-30`
       with a subtle blur/bg: `backdrop-blur bg-white/75 border-t`.
     - Inside: max width container aligned with the card; padding `px-4 py-3`.
     - The existing Submit button in the form can stay but hidden on mobile (`hidden md:block`),
       while the sticky one is `md:hidden`. Both share the same disabled/enabled states.
     - Respect safe area on iOS: add `pb-[env(safe-area-inset-bottom)]`.

6) **History list**
   - Keep the current styling; improve mobile ergonomics:
     - Container: `rounded-xl bg-white/90 border shadow-md`.
     - Scroll area height on mobile: `max-h-[30vh]` (desktop keep current).
     - Each row: `px-2 py-2 rounded hover:bg-gray-50 active:bg-gray-100 -mx-2`.

7) **States & accessibility**
   - Disabled Submit: reduce opacity and disable pointer events, keep color contrast readable.
   - Add `aria-live="polite"` for success/error banners so screen readers announce updates.
   - Ensure keyboard focus ring visible on all focusable elements.

8) **No layout shift**
   - When banners (success/error) appear, reserve space or animate height to avoid jank.
   - Prefer `motion` fade/slide with `layout` where appropriate.

## Nice-to-haves (if quick)
- **Pull-to-refresh vibe:** not required; but ensure scroll works smoothly.
- **App-like meta:**
  - `<meta name="theme-color" content="#ffffff">`
  - Avoid iOS input zoom by keeping inputs at `font-size: 16px`.
- **PWA ready (optional, do not block):**
  - `public/manifest.json`, icons, and `next-pwa` or appDir service worker.
  - Only if time allows; desktop must not regress.

## Acceptance checklist
- ✅ On iPhone 12/13/14 and small Android widths (~360–390px), UI fits without horizontal scroll.
- ✅ Buttons have ≥44px height; Submit is sticky at the bottom on mobile and mirrors the same enable/disable logic.
- ✅ Time capsule is readable and centered; address wraps cleanly up to 2 lines.
- ✅ History section scrolls (`max-h-[30vh]`) and rows are easy to tap.
- ✅ No visual changes on desktop (≥ `md`) compared to current design.

## Notes
- Don’t rename components or move business logic. Only apply responsive classes / minor wrappers.
- Keep all strings and existing class names unless you are adding responsive variants (`sm:`, `md:`, etc.).
- If any element overflows on very narrow screens, prefer stacking and spacing over shrinking font too far.
