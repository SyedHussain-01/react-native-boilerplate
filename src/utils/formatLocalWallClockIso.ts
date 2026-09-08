const pad2 = (n: number) => String(n).padStart(2, "0");
const pad3 = (n: number) => String(n).padStart(3, "0");

/**
 * Local calendar date + clock as `YYYY-MM-DDTHH:mm:ss.sss` (no `Z`, no offset).
 * Matches what the user sees on the picker; not an absolute UTC instant by itself.
 */
export function formatLocalWallClockIso(d: Date): string {
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  const h = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const s = pad2(d.getSeconds());
  const ms = pad3(d.getMilliseconds());
  return `${y}-${mo}-${da}T${h}:${mi}:${s}.${ms}`;
}
