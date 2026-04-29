import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const bookingRepository = {
  async create(data: Prisma.BookingUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.booking.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        event: true,
        bookingSeats: true,
      },
    });
  },

  async update(id: string, data: Prisma.BookingUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.booking.update({
      where: { id },
      data,
    });
  },

  async createBookingSeats(data: Prisma.BookingSeatCreateManyInput[], tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.bookingSeat.createMany({
      data,
    });
  },
};
