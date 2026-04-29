import { Event, EventData } from '../types';

/**
 * Helper to simulate network latency
 */
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Maps an Api Event to Calendar EventData format
 */
export const mapEventToCalendarData = (event: Event): EventData => {
  // event_date: "YYYY-MM-DD", event_time: "HH:mm"
  const startDateTime = new Date(`${event.event_date}T${event.event_time}`);
  
  return {
    title: event.title,
    description: `${event.artist} - ${event.venue} 공연 예매 완료`,
    location: event.venue,
    startDate: startDateTime,
    durationMinutes: 120, // Default duration if not provided
  };
};
