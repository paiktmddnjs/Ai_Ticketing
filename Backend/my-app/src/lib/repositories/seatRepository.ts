import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const seatRepository = {
  async findManyByIds(ids: string[], event_id?: string) {
    return prisma.seat.findMany({
      where: {
        id: { in: ids },
        ...(event_id ? { event_id } : {}),
      },
    });
  },

  async findByEventId(event_id: string) {
    return prisma.seat.findMany({
      where: { event_id },
      orderBy: [
        { zone: 'asc' },
        { seat_row: 'asc' },
        { seat_number: 'asc' },
      ],
    });
  },

  async updateMany(ids: string[], data: Prisma.SeatUncheckedUpdateInput, tx?: Prisma.TransactionClient) {

    const client = tx || prisma;
    return client.seat.updateMany({
      where: { id: { in: ids } },
      data,
    });
  },
};
