import { UTC8_OFFSET, SECONDS_PER_DAY } from "@/consts";

/**
 * Get current UTC+8 day number
 * Day number = (timestamp + 8h) / 86400
 */
export function getCurrentDayNumber(): number {
  const now = Date.now();
  return Math.floor((now + UTC8_OFFSET) / (SECONDS_PER_DAY * 1000));
}

/**
 * Convert timestamp (ms) to UTC+8 day number
 */
export function timestampToDayNumber(timestamp: number): number {
  return Math.floor((timestamp + UTC8_OFFSET) / (SECONDS_PER_DAY * 1000));
}

/**
 * Get next UTC+8 midnight timestamp
 */
export function getNextMidnight(): Date {
  const now = Date.now();
  const currentDayNumber = getCurrentDayNumber();
  const nextMidnightMs = (currentDayNumber + 1) * SECONDS_PER_DAY * 1000 - UTC8_OFFSET;
  return new Date(nextMidnightMs);
}

/**
 * Get time remaining until next UTC+8 midnight
 */
export function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
} {
  const now = Date.now();
  const nextMidnight = getNextMidnight().getTime();
  const totalMs = nextMidnight - now;

  const hours = Math.floor(totalMs / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, totalMs };
}

/**
 * Format countdown timer
 * @example formatCountdown(3661000) // "1:01:01"
 */
export function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Check if can check in today
 */
export function canCheckIn(lastCheckInDay: number | null): boolean {
  if (lastCheckInDay === null) return true;
  const currentDay = getCurrentDayNumber();
  return currentDay > lastCheckInDay;
}

/**
 * Calculate consecutive check-in days from events
 * This is a placeholder - actual implementation would query events
 */
export function calculateConsecutiveDays(checkInEvents: Array<{ day: number }>): number {
  if (checkInEvents.length === 0) return 0;

  // Sort events by day descending
  const sorted = [...checkInEvents].sort((a, b) => b.day - a.day);

  let consecutive = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].day - sorted[i].day === 1) {
      consecutive++;
    } else {
      break;
    }
  }

  return consecutive;
}
