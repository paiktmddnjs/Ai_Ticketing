import 'dotenv/config';
import prisma from '../src/lib/prisma';
import type { Prisma } from '../src/generated/prisma/client';

type Category = 'concert' | 'musical' | 'sports' | 'theater';
type Zone = 'VIP' | 'R' | 'S' | 'A';

// DATABASE_URL 파싱 (mysql://user:pass@host:port/db)
async function main() {
  console.log('🚀 시드 데이터 삽입 시작 (MJS)...');

  await prisma.user.deleteMany({});

  // 연관 관계를 고려한 삭제 (BookingSeat -> Booking -> Seat 순서 등)
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.eventPrice.deleteMany();
  await prisma.event.deleteMany();

  const events: (Omit<Prisma.EventCreateInput, 'category'> & { id: string, category: Category })[] = [
    {
      id: 'evt-001',
      title: '2026 WORLD TOUR [CHAMPION]',
      artist: '임영웅',
      category: 'concert' as Category,
      event_date: new Date('2026-06-15'),
      event_time: new Date('1970-01-01T19:00:00Z'),
      venue: '서울월드컵경기장',
      total_seats: 100,
      available_seats: 100,
      description: '임영웅의 2026년 월드 투어 첫 서울 공연!',
      image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    },
    {
      id: 'evt-002',
      title: '뮤지컬 [레미제라블]',
      artist: '최재림, 카이',
      category: 'musical' as Category,
      event_date: new Date('2026-07-20'),
      event_time: new Date('1970-01-01T14:00:00Z'),
      venue: '블루스퀘어 신한카드홀',
      total_seats: 100,
      available_seats: 100,
      description: '빅토르 위고의 걸작, 불멸의 뮤지컬 레미제라블. 압도적인 스케일과 전율의 무대를 만나보세요.',
      image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800',
    },
    {
      id: 'evt-003',
      title: '2026 KBO 리그 개막전',
      artist: 'LG 트윈스 vs KIA 타이거즈',
      category: 'sports' as Category,
      event_date: new Date('2026-03-28'),
      event_time: new Date('1970-01-01T18:30:00Z'),
      venue: '잠실 야구장',
      total_seats: 100,
      available_seats: 100,
      description: '프로야구의 계절이 돌아왔다! 뜨거운 열기로 가득할 개막전을 직접 직관하세요.',
      image: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800',
    },
    {
      id: 'evt-004',
      title: 'IU H.E.R. WORLD TOUR CONCERT',
      artist: '아이유(IU)',
      category: 'concert' as Category,
      event_date: new Date('2026-05-10'),
      event_time: new Date('1970-01-01T18:00:00Z'),
      venue: 'KSPO DOME',
      total_seats: 100,
      available_seats: 100,
      description: '아이유의 독보적인 감성과 압도적인 라이브, 그 환상적인 세계로 초대합니다.',
      image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800',
    },
    {
      id: 'evt-005',
      title: '뮤지컬 [시카고]',
      artist: '최정원, 아이비',
      category: 'musical' as Category,
      event_date: new Date('2026-08-15'),
      event_time: new Date('1970-01-01T19:30:00Z'),
      venue: '디큐브 링크아트센터',
      total_seats: 100,
      available_seats: 100,
      description: '관능적이고 매혹적인 재즈의 향연. 25년 역사의 정통 브로드웨이 뮤지컬.',
      image: 'https://images.unsplash.com/photo-1514525253344-f814d873ee61?w=800',
    },
    {
      id: 'evt-006',
      title: '토트넘 홋스퍼 vs K리그 올스타',
      artist: '손흥민, 해리 케인 등',
      category: 'sports' as Category,
      event_date: new Date('2026-07-30'),
      event_time: new Date('1970-01-01T20:00:00Z'),
      venue: '서울월드컵경기장',
      total_seats: 100,
      available_seats: 100,
      description: '유럽 최고의 클럽과 대한민국 K리그의 자존심이 맞붙는 역사적인 친선 경기.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    },
    {
      id: 'evt-007',
      title: '연극 [고도를 기다리며]',
      artist: '신구, 박근형',
      category: 'theater' as Category,
      event_date: new Date('2026-09-05'),
      event_time: new Date('1970-01-01T15:00:00Z'),
      venue: '국립극장 해오름극장',
      total_seats: 100,
      available_seats: 100,
      description: '사무엘 베케트의 부조리극 걸작. 한국 연극계를 이끌어온 거장들의 숨막히는 연기.',
      image: 'https://images.unsplash.com/photo-1503095396549-807a89010046?w=800',
    }
  ];

  for (const eventData of events) {
    const event = await prisma.event.create({
      data: eventData
    });

    // ... (zones and seats logic remains same)
    const zones: { zone: Zone; price: number }[] = [
      { zone: 'VIP', price: 180000 },
      { zone: 'R', price: 150000 },
      { zone: 'S', price: 120000 },
      { zone: 'A', price: 90000 },
    ];

    await prisma.eventPrice.createMany({
      data: zones.map(z => ({
        event_id: event.id,
        ...z
      }))
    });

    const zoneRows: Record<Zone, string[]> = {
      'VIP': ['A', 'B'],
      'R': ['C', 'D', 'E'],
      'S': ['F', 'G', 'H'],
      'A': ['I', 'J'],
    };

    for (const [zone, rows] of Object.entries(zoneRows)) {
      const z = zones.find(gz => gz.zone === zone)!;
      const seatsData: Prisma.SeatCreateManyInput[] = [];
      
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

      await prisma.seat.createMany({
        data: seatsData
      });
    }
  }

  // 테스트 사용자 생성
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: '테스트유저',
      password: 'password123',
    }
  });

  // 샘플 예약 내역 생성 (임영웅 콘서트 VIP석 2개)
  const booking = await prisma.booking.create({
    data: {
      id: 'book-001',
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

  console.log('✅ 모든 데이터(사용자, 예약 포함)가 성공적으로 삽입되었습니다!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 중 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
