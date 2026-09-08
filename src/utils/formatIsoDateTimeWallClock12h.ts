/**
 * Formats the clock part of an API ISO datetime as "H:MM AM/PM" using the
 * literal hours and minutes after "T" (e.g. 18:30 from …T18:30:00+05:00),
 * without converting to the device timezone.
 */
export function formatIsoDateTimeWallClock12h(isoDateString: string): string {
  const trimmed = isoDateString?.trim?.() ?? "";
  if (!trimmed) {
    return "12:00 PM";
  }

  const match = trimmed.match(/T(\d{2}):(\d{2})/);
  if (match) {
    const hour24 = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (
      Number.isNaN(hour24) ||
      Number.isNaN(minutes) ||
      hour24 < 0 ||
      hour24 > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return "12:00 PM";
    }
    const ampm = hour24 >= 12 ? "PM" : "AM";
    const displayHours = hour24 % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  try {
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return "12:00 PM";
    }
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch {
    return "12:00 PM";
  }
}
