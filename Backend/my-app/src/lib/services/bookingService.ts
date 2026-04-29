import prisma from '@/lib/prisma';
import { bookingRepository } from '../repositories/bookingRepository';
import { seatRepository } from '../repositories/seatRepository';
import { eventRepository } from '../repositories/eventRepository';

export const bookingService = {
  async createBooking({ event_id, booker_name, seatIds, user_id }: any) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. 좌석 가용 여부 확인
      const seats = await seatRepository.findManyByIds(seatIds, event_id);

      if (seats.length !== seatIds.length) {
        throw new Error('일부 좌석을 찾을 수 없습니다.');
      }

      const unavailableSeats = seats.filter(s => s.status !== 'available');
      if (unavailableSeats.length > 0) {
        throw new Error('일부 좌석이 이미 예약되었거나 선점된 상태입니다.');
      }

      // 2. 총 가격 계산
      const totalPrice = seats.reduce((sum, s) => sum + s.price, 0);

      // 3. 예매 정보 생성
      const booking = await bookingRepository.create({
        id: `BK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        event_id,
        user_id: user_id || null,
        booker_name,
        total_price: totalPrice,
        status: 'confirmed',
      }, tx);

      // 4. 좌석 상태를 예약됨(booked)으로 변경
      await seatRepository.updateMany(seatIds, { status: 'booked' }, tx);

      // 5. 예매된 좌석 상세 정보 생성
      await bookingRepository.createBookingSeats(seats.map(s => ({
        booking_id: booking.id,
        seat_id: s.id,
        zone: s.zone,
        seat_row: s.seat_row,
        seat_number: s.seat_number,
        price: s.price,
      })), tx);

      // 6. 이벤트의 남은 좌석 수 차감
      await eventRepository.update(event_id, {
        available_seats: { decrement: seatIds.length },
      }, tx);

      // 7. 생성된 전체 정보 다시 조회하여 반환
      return await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          event: true,
          bookingSeats: true,
        },
      });
    });
  },

  async cancelBooking(id: string) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. 예매 정보 조회
      const booking = await bookingRepository.findById(id);
      if (!booking) throw new Error('예매 내역을 찾을 수 없습니다.');
      if (booking.status === 'cancelled') throw new Error('이미 취소된 예매입니다.');

      // 2. 예매 상태 변경
      await bookingRepository.update(id, { status: 'cancelled' }, tx);

      // 3. 좌석 상태 복구
      const seatIds = booking.bookingSeats.map(bs => bs.seat_id);
      await seatRepository.updateMany(seatIds, { status: 'available' }, tx);

      // 4. 이벤트 좌석 수 복구
      await eventRepository.update(booking.event_id, {
        available_seats: { increment: seatIds.length },
      }, tx);

      return { status: 'success', message: '예매가 취소되었습니다.' };
    });
  },

  async getBooking(id: string) {
    const booking = await bookingRepository.findById(id);
    if (!booking) return null;
    return {
      ...booking,
      seats: booking.bookingSeats,
    };
  },
};
