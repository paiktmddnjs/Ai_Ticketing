/**
 * API Types based on Database Schema
 */

export type Category = 'concert' | 'musical' | 'sports' | 'theater';
export type Zone = 'VIP' | 'R' | 'S' | 'A';
export type SeatStatus = 'available' | 'booked' | 'held';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  category: Category;
  event_date: string;
  event_time: string;
  venue: string;
  total_seats: number;
  available_seats: number;
  description: string;
  image: string;
  prices: {
    VIP: number;
    R: number;
    S: number;
    A: number;
  };
  created_at?: string;
}

export interface EventPrice {
  event_id: string;
  zone: Zone;
  price: number;
}

export interface Seat {
  id: string;
  event_id: string;
  zone: Zone;
  seat_row: string;
  seat_number: number;
  price: number;
  status: SeatStatus;
}

export interface Booking {
  id: string;
  user_id: string | null;
  event_id: string;
  booker_name: string;
  total_price: number;
  status: BookingStatus;
  booked_at: string;
}

export interface BookingSeat {
  id: number;
  booking_id: string;
  seat_id: string;
  zone: Zone;
  seat_row: string;
  seat_number: number;
  price: number;
}

export interface EventData {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  durationMinutes: number;
}

// API Response Wrappers
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
