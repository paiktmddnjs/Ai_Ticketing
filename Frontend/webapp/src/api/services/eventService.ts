import { api } from '../client';
import { Event, Seat } from '../types';
// import { events as dummyEvents } from '../../data/events';
// import { delay } from './utils';

// Helper to map dummy data to API Event type
/*
const mapEvent = (e: any): Event => ({
  id: e.id,
  title: e.title,
  artist: e.artist,
  category: e.category,
  event_date: e.date,
  event_time: e.time,
  venue: e.venue,
  total_seats: e.totalSeats,
  available_seats: e.availableSeats,
  description: e.description || '',
  image: e.image || '',
  prices: e.prices,
});
*/

export const eventService = {
  /**
   * Get all events
   */
  getAllEvents: async (): Promise<Event[]> => {
    return api.get<Event[]>('/api/events');
    /*
    await delay(800);
    return dummyEvents.map(mapEvent);
    */
  },

  /**
   * Get event by ID
   */
  getEventById: async (id: string): Promise<Event> => {
    return api.get<Event>(`/api/events/${id}`);
  },

  getSeatsByEventId: async (id: string): Promise<Seat[]> => {
    return api.get<Seat[]>(`/api/events/${id}/seats`);
  },

  /**
   * Search events
   */

  searchEvents: async (query: string): Promise<Event[]> => {
    return api.get<Event[]>(`/api/events/search?q=${encodeURIComponent(query)}`);
    /*
    await delay(600);
    const filtered = dummyEvents.filter(e => 
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.artist.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.map(mapEvent);
    */
  },
};
