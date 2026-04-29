import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Zone } from '@/generated/prisma/client';

export async function GET(request: NextRequest) {
  try {
    // 1. 기존 데이터 초기화 (순서 주의: 자식부터 삭제)
    await prisma.bookingSeat.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.user.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.eventPrice.deleteMany();
    await prisma.event.deleteMany();

    // 2. 이벤트 데이터 생성 (총 100석 기준)
    const eventsData = [
      {
        id: 'evt-001',
        title: '2026 WORLD TOUR [CHAMPION]',
        artist: '임영웅',
        category: 'concert' as any,
        event_date: new Date('2026-06-15'),
        event_time: new Date('1970-01-01T19:00:00Z'),
        venue: '서울월드컵경기장',
        total_seats: 100,
        available_seats: 98, // 샘플 예약 2석 제외
        description: '임영웅의 2026년 월드 투어 첫 서울 공연!',
        image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      },
      {
        id: 'evt-002',
        title: '뮤지컬 [레미제라블]',
        artist: '최재림, 카이',
        category: 'musical' as any,
        event_date: new Date('2026-07-20'),
        event_time: new Date('1970-01-01T14:00:00Z'),
        venue: '블루스퀘어 신한카드홀',
        total_seats: 100,
        available_seats: 100,
        description: '빅토르 위고의 걸작, 불멸의 뮤지컬 레미제라블.',
        image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
      }
    ];
    
    for (const eventData of eventsData) {
      const event = await prisma.event.create({ data: eventData });

      const zones = [
        { zone: 'VIP' as Zone, price: 180000 },
        { zone: 'R' as Zone, price: 150000 },
        { zone: 'S' as Zone, price: 120000 },
        { zone: 'A' as Zone, price: 90000 },
      ];

      await prisma.eventPrice.createMany({
        data: zones.map(z => ({ event_id: event.id, ...z }))
      });

      const zoneRows: Record<Zone, string[]> = {
        'VIP': ['A', 'B'], 'R': ['C', 'D', 'E'], 'S': ['F', 'G', 'H'], 'A': ['I', 'J'],
      };

      for (const [zone, rows] of Object.entries(zoneRows)) {
        const z = zones.find(gz => gz.zone === zone)!;
        const seatsData = [];
        for (const row of rows) {
          for (let i = 1; i <= 10; i++) {
            seatsData.push({
              id: `${event.id}-${zone}-${row}${i}`,
              event_id: event.id,
              zone: zone as Zone,
              seat_row: row,
              seat_number: i,
              price: z.price,
              status: (event.id === 'evt-001' && zone === 'VIP' && row === 'A' && i <= 2) ? 'booked' : 'available',
            });
          }
        }
        await prisma.seat.createMany({ data: seatsData as any });
      }
    }

    // 3. 테스트 사용자 생성 (고정 ID 사용)
    const testUser = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: '테스트유저',
        password: 'password123',
      }
    });

    // 4. 샘플 예약 내역 생성
    const booking = await prisma.booking.create({
      data: {
        id: 'BK-SAMPLE001',
        user_id: testUser.id,
        event_id: 'evt-001',
        booker_name: '테스트유저',
        total_price: 360000,
        status: 'confirmed',
      }
    });

    await prisma.bookingSeat.createMany({
      data: [
        {
          booking_id: booking.id,
          seat_id: 'evt-001-VIP-A1',
          zone: 'VIP',
          seat_row: 'A',
          seat_number: 1,
          price: 180000,
        },
        {
          booking_id: booking.id,
          seat_id: 'evt-001-VIP-A2',
          zone: 'VIP',
          seat_row: 'A',
          seat_number: 2,
          price: 180000,
        }
      ]
    });

    return NextResponse.json({ 
      success: true,
      message: '데이터 초기화 및 샘플 생성 완료',
      loginInfo: {
        email: 'test@example.com',
        password: 'password123',
        userId: 'test-user-id'
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
