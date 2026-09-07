/**
 * Device IANA timezone (e.g. "Asia/Karachi", "America/New_York").
 */
export function getDeviceTimezoneIana(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof tz === "string" && tz.trim().length > 0) {
      return tz.trim();
    }
  } catch {
    // ignore
  }
  return "UTC";
}
