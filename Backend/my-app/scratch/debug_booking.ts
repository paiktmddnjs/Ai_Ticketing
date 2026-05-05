import prisma from '../src/lib/prisma';
import { bookingService } from '../src/lib/services/bookingService';

async function main() {
  try {
    const user = await prisma.user.findFirst();
    const event = await prisma.event.findFirst();
    if (!user || !event) {
        console.error('User or Event not found');
        return;
    }

    const seats = await prisma.seat.findMany({
        where: { event_id: event.id, status: 'available' },
        take: 1
    });

    if (seats.length === 0) {
        console.error('No available seats found for event', event.id);
        return;
    }

    console.log('Attempting booking for:', {
        event_id: event.id,
        user_id: user.id,
        seatIds: [seats[0].id]
    });

    const result = await bookingService.createBooking({
        event_id: event.id,
        booker_name: 'Debug User',
        seatIds: [seats[0].id],
        user_id: user.id
    });

    console.log('Booking successful:', JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error('Booking failed with error:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    if (error.code) console.error('Code:', error.code);
    if (error.meta) console.error('Meta:', JSON.stringify(error.meta, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
