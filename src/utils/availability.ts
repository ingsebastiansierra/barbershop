import {
  BarberSchedule,
  OpeningHours,
  TimeRange,
  DaySchedule,
} from '../types/models';

/**
 * Calculate available time slots for a barber on a specific date
 * @param date - ISO date string (YYYY-MM-DD)
 * @param barberSchedule - Barber's weekly schedule
 * @param barbershopHours - Barbershop's opening hours
 * @param existingAppointments - Existing appointments for the date
 * @param serviceDuration - Duration of the service in minutes
 * @returns Array of available time slots in HH:mm format
 */
export function calculateAvailableSlots(
  date: string,
  barberSchedule: BarberSchedule,
  barbershopHours: OpeningHours,
  existingAppointments: Array<{ start_time: string; end_time: string }>,
  serviceDuration: number
): string[] {
  // Get day of week from date
  const dayOfWeek = getDayOfWeek(date);

  // Get barber's schedule for this day
  const barberDaySchedule = barberSchedule[dayOfWeek];
  if (!barberDaySchedule || barberDaySchedule.length === 0) {
    return []; // Barber not working this day
  }

  // Get barbershop hours for this day
  const barbershopDayHours = barbershopHours[dayOfWeek];
  if (!barbershopDayHours) {
    return []; // Barbershop closed this day
  }

  // Generate all possible slots in 15-minute intervals
  const allSlots = generateTimeSlots(
    barberDaySchedule,
    barbershopDayHours,
    serviceDuration
  );

  // Filter out slots that overlap with existing appointments
  const availableSlots = allSlots.filter((slot) => {
    const slotEndTime = addMinutesToTime(slot, serviceDuration);
    return !hasOverlap(slot, slotEndTime, existingAppointments);
  });

  return availableSlots;
}

/**
 * Get day of week from ISO date string
 * @param date - ISO date string (YYYY-MM-DD)
 * @returns Day name in lowercase (monday, tuesday, etc.)
 */
function getDayOfWeek(date: string): keyof BarberSchedule {
  const dateObj = new Date(date + 'T00:00:00');
  const days: Array<keyof BarberSchedule> = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  return days[dateObj.getDay()];
}

/**
 * Generate all possible time slots in 15-minute intervals
 * @param barberSchedule - Barber's time ranges for the day
 * @param barbershopHours - Barbershop's opening hours for the day
 * @param serviceDuration - Duration of the service in minutes
 * @returns Array of time slots in HH:mm format
 */
function generateTimeSlots(
  barberSchedule: TimeRange[],
  barbershopHours: DaySchedule,
  serviceDuration: number
): string[] {
  const slots: string[] = [];

  // Iterate through each barber time range
  for (const timeRange of barberSchedule) {
    // Ensure time range is within barbershop hours
    const effectiveStart = maxTime(timeRange.start, barbershopHours.open);
    const effectiveEnd = minTime(timeRange.end, barbershopHours.close);

    if (effectiveStart >= effectiveEnd) {
      continue; // Invalid range
    }

    // Generate slots in 15-minute intervals
    let currentTime = effectiveStart;
    while (true) {
      const slotEndTime = addMinutesToTime(currentTime, serviceDuration);

      // Check if slot end time is within the effective range
      if (slotEndTime > effectiveEnd) {
        break;
      }

      slots.push(currentTime);

      // Move to next 15-minute interval
      currentTime = addMinutesToTime(currentTime, 15);
    }
  }

  return slots;
}

/**
 * Check if a time slot overlaps with existing appointments
 * @param startTime - Slot start time in HH:mm format
 * @param endTime - Slot end time in HH:mm format
 * @param appointments - Existing appointments
 * @returns True if there's an overlap
 */
function hasOverlap(
  startTime: string,
  endTime: string,
  appointments: Array<{ start_time: string; end_time: string }>
): boolean {
  return appointments.some((appointment) => {
    // Check if times overlap
    // Overlap occurs if: (start1 < end2) AND (end1 > start2)
    return startTime < appointment.end_time && endTime > appointment.start_time;
  });
}

/**
 * Add minutes to a time string
 * @param time - Time in HH:mm format
 * @param minutes - Minutes to add
 * @returns New time in HH:mm format
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

/**
 * Get the maximum (later) of two times
 * @param time1 - First time in HH:mm format
 * @param time2 - Second time in HH:mm format
 * @returns The later time
 */
function maxTime(time1: string, time2: string): string {
  return time1 > time2 ? time1 : time2;
}

/**
 * Get the minimum (earlier) of two times
 * @param time1 - First time in HH:mm format
 * @param time2 - Second time in HH:mm format
 * @returns The earlier time
 */
function minTime(time1: string, time2: string): string {
  return time1 < time2 ? time1 : time2;
}

/**
 * Check if a time is within a time range
 * @param time - Time to check in HH:mm format
 * @param start - Range start in HH:mm format
 * @param end - Range end in HH:mm format
 * @returns True if time is within range
 */
export function isTimeInRange(
  time: string,
  start: string,
  end: string
): boolean {
  return time >= start && time <= end;
}

/**
 * Convert time string to minutes since midnight
 * @param time - Time in HH:mm format
 * @returns Minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string
 * @param minutes - Minutes since midnight
 * @returns Time in HH:mm format
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Calculate duration between two times in minutes
 * @param startTime - Start time in HH:mm format
 * @param endTime - End time in HH:mm format
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

/**
 * Validate that a time slot is within barber's schedule
 * @param time - Time to validate in HH:mm format
 * @param barberSchedule - Barber's time ranges for the day
 * @returns True if time is within barber's schedule
 */
export function isTimeInBarberSchedule(
  time: string,
  barberSchedule: TimeRange[]
): boolean {
  return barberSchedule.some((range) =>
    isTimeInRange(time, range.start, range.end)
  );
}

/**
 * Validate that a time slot is within barbershop's opening hours
 * @param time - Time to validate in HH:mm format
 * @param barbershopHours - Barbershop's opening hours for the day
 * @returns True if time is within opening hours
 */
export function isTimeInBarbershopHours(
  time: string,
  barbershopHours: DaySchedule | null
): boolean {
  if (!barbershopHours) {
    return false;
  }
  return isTimeInRange(time, barbershopHours.open, barbershopHours.close);
}

/**
 * Get the next available date for a barber
 * @param startDate - Starting date to search from (ISO format)
 * @param barberSchedule - Barber's weekly schedule
 * @param barbershopHours - Barbershop's opening hours
 * @param maxDaysToCheck - Maximum number of days to check (default: 30)
 * @returns Next available date in ISO format, or null if none found
 */
export function getNextAvailableDate(
  startDate: string,
  barberSchedule: BarberSchedule,
  barbershopHours: OpeningHours,
  maxDaysToCheck: number = 30
): string | null {
  const startDateObj = new Date(startDate + 'T00:00:00');

  for (let i = 0; i < maxDaysToCheck; i++) {
    const checkDate = new Date(startDateObj);
    checkDate.setDate(checkDate.getDate() + i);
    const dateString = checkDate.toISOString().split('T')[0];

    const dayOfWeek = getDayOfWeek(dateString);
    const barberDaySchedule = barberSchedule[dayOfWeek];
    const barbershopDayHours = barbershopHours[dayOfWeek];

    if (
      barberDaySchedule &&
      barberDaySchedule.length > 0 &&
      barbershopDayHours
    ) {
      return dateString;
    }
  }

  return null;
}

/**
 * Format time for display (e.g., "09:00" -> "9:00 AM")
 * @param time - Time in HH:mm format
 * @returns Formatted time string
 */
export function formatTimeForDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Check if a date is in the past
 * @param date - Date in ISO format (YYYY-MM-DD)
 * @returns True if date is in the past
 */
export function isDateInPast(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date < today;
}

/**
 * Check if a time is in the past for today's date
 * @param time - Time in HH:mm format
 * @returns True if time is in the past (only relevant for today)
 */
export function isTimeInPast(time: string): boolean {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return time < currentTime;
}

/**
 * Validate service duration (must be multiple of 15 minutes)
 * @param duration - Duration in minutes
 * @returns True if duration is valid
 */
export function isValidServiceDuration(duration: number): boolean {
  return duration > 0 && duration % 15 === 0;
}
