export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

/**
 * Picks Breakfast / Lunch / Dinner / Snacks from the literal clock in an ISO
 * string (same `T(HH:mm)` rule as {@link formatIsoDateTimeWallClock12h}), so
 * listing rows match the scheduled time even when API `meal_type` is wrong.
 */
export function inferMealTypeFromWallClockIso(
  isoDateString: string,
  fallback: MealType,
): MealType {
  const trimmed = isoDateString?.trim?.() ?? "";
  const match = trimmed.match(/T(\d{2}):(\d{2})/);
  if (!match) {
    return fallback;
  }
  const hour24 = parseInt(match[1], 10);
  if (Number.isNaN(hour24) || hour24 < 0 || hour24 > 23) {
    return fallback;
  }
  // Matches mealTypeTimeSlots: Snacks 12–5 AM, Breakfast 6–11 AM, Lunch 12–5 PM, Dinner 6–11 PM
  if (hour24 >= 18) {
    return "Dinner";
  }
  if (hour24 >= 12) {
    return "Lunch";
  }
  if (hour24 >= 6) {
    return "Breakfast";
  }
  return "Snacks";
}
