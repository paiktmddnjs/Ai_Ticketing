import { api } from '../client';
import { Booking, BookingSeat, ApiResponse } from '../types';
// import { delay } from './utils';

// Simple in-memory storage for dummy bookings
// const mockBookings: Booking[] = [];

export interface CreateBookingRequest {
  event_id: string;
  booker_name: string;
  seats: string[]; // seat IDs
}

export const bookingService = {
  /**
   * Create a new booking
   */
  createBooking: async (data: CreateBookingRequest): Promise<Booking> => {
    return api.post<Booking>('/api/bookings', data);
    /*
    await delay(1000);
    const newBooking: Booking = {
      id: `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      user_id: 'user-123',
      event_id: data.event_id,
      booker_name: data.booker_name,
      total_price: 150000, // Dummy price
      status: 'confirmed',
      booked_at: new Date().toISOString(),
    };
    mockBookings.push(newBooking);
    return newBooking;
    */
  },

  /**
   * Get user bookings
   */
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    return api.get<Booking[]>(`/api/bookings/user/${userId}`);
    /*
    await delay(700);
    return mockBookings.filter(b => b.user_id === userId);
    */
  },

  /**
   * Get booking details
   */
  getBookingById: async (id: string): Promise<Booking & { seats: BookingSeat[] }> => {
    return api.get<Booking & { seats: BookingSeat[] }>(`/api/bookings/${id}`);
    /*
    await delay(500);
    const booking = mockBookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found');
    
    return {
      ...booking,
      seats: [
        {
          id: 1,
          booking_id: id,
          seat_id: 'seat-1',
          zone: 'VIP',
          seat_row: 'A',
          seat_number: 1,
          price: 150000,
        }
      ]
    };
    */
  },

  /**
   * Cancel booking
   */
  cancelBooking: async (id: string): Promise<ApiResponse<null>> => {
    return api.post<ApiResponse<null>>(`/api/bookings/${id}/cancel`);
    /*
    await delay(800);
    const index = mockBookings.findIndex(b => b.id === id);
    if (index !== -1) {
      mockBookings[index].status = 'cancelled';
    }
    return { status: 'success', message: 'Booking cancelled' };
    */
  },
};
