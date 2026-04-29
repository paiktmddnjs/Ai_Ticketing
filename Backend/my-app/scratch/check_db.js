const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  try {
    const event = await prisma.event.findUnique({
      where: { id: 'evt-004' },
      include: { prices: true }
    });
    console.log('Event evt-004:', JSON.stringify(event, null, 2));
    
    if (event) {
        console.log('event_date type:', typeof event.event_date, event.event_date instanceof Date);
        console.log('event_time type:', typeof event.event_time, event.event_time instanceof Date);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
