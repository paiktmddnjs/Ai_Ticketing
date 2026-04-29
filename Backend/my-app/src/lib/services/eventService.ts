import { eventRepository } from '../repositories/eventRepository';
import { seatRepository } from '../repositories/seatRepository';


const formatEvent = (event: any) => {
  try {
    const prices = (event.prices || []).reduce((acc: any, p: any) => {
      acc[p.zone] = p.price;
      return acc;
    }, {});

    const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

    return {
      ...event,
      event_date: isValidDate(event.event_date) ? event.event_date.toISOString().split('T')[0] : (event.event_date?.toString() || ''),
      event_time: isValidDate(event.event_time) ? event.event_time.toISOString().split('T')[1].split('.')[0] : (event.event_time?.toString() || ''),
      prices: prices,
    };

  } catch (error) {
    console.error('Error formatting event data:', JSON.stringify(event, null, 2));
    console.error('Stack trace:', error);
    throw error;
  }
};



export const eventService = {
  async getAllEvents() {
    const events = await eventRepository.findAll();
    return events.map(formatEvent);
  },

  async searchEvents(query: string) {
    if (!query) return [];
    const events = await eventRepository.search(query);
    return events.map(formatEvent);
  },

  async getEventById(id: string) {
    const event = await eventRepository.findById(id);
    if (!event) return null;
    return formatEvent(event);
  },

  async getSeatsByEventId(eventId: string) {
    return seatRepository.findByEventId(eventId);
  },
};

