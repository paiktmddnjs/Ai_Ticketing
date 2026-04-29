import prisma from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export const eventRepository = {
  async findAll() {
    return prisma.event.findMany({
      include: {
        prices: true,
      },
      orderBy: {
        event_date: 'asc',
      },
    });
  },

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        prices: true,
      },
    });
  },

  async search(query: string) {
    return prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { artist: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: {
        prices: true,
      },
    });
  },

  async update(id: string, data: Prisma.EventUncheckedUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.event.update({
      where: { id },
      data,
    });
  },
};
