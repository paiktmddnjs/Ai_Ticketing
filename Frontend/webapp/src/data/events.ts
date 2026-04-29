// ─── 타입 정의 ───────────────────────────────────────────────────────────────

export type Category = 'concert' | 'musical' | 'sports' | 'theater'
export type Zone = 'VIP' | 'R' | 'S' | 'A'
export type SeatStatus = 'available' | 'booked' | 'selected'

export interface Event {
  id: string
  title: string
  artist: string
  category: Category
  date: string
  time: string
  venue: string
  totalSeats: number
  availableSeats: number
  prices: Record<Zone, number>
  description?: string
  image?: string
}

export interface Seat {
  id: string
  eventId: string
  zone: Zone
  row: string
  number: number
  price: number
  status: SeatStatus
}

export interface BookingSeat {
  seatId: string
  zone: Zone
  row: string
  number: number
  price: number
}

export interface Booking {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  venue: string
  seats: BookingSeat[]
  totalPrice: number
  bookedAt: string
  bookerName: string
  status: 'confirmed' | 'cancelled'
}

// ─── 공연 데이터 ──────────────────────────────────────────────────────────────

export const events: Event[] = [
  {
    id: 'evt-001',
    title: '아이유 콘서트 2025 HEREH WORLD TOUR',
    artist: '아이유 (IU)',
    category: 'concert',
    date: '2025-07-12',
    time: '19:00',
    venue: '서울올림픽주경기장',
    totalSeats: 600,
    availableSeats: 142,
    prices: { VIP: 220000, R: 165000, S: 132000, A: 99000 },
    description: '아이유의 월드투어 서울 공연. 화려한 무대와 감동적인 퍼포먼스를 만나보세요.',
  },
  {
    id: 'evt-002',
    title: 'BTS PERMISSION TO DANCE ON STAGE – SEOUL',
    artist: 'BTS',
    category: 'concert',
    date: '2025-08-23',
    time: '18:00',
    venue: '잠실올림픽주경기장',
    totalSeats: 700,
    availableSeats: 35,
    prices: { VIP: 250000, R: 198000, S: 154000, A: 110000 },
    description: 'BTS의 전설적인 퍼포먼스를 직접 경험하세요.',
  },
  {
    id: 'evt-003',
    title: '뮤지컬 레미제라블',
    artist: '국립극단',
    category: 'musical',
    date: '2025-06-05',
    time: '14:00',
    venue: '국립극장 해오름극장',
    totalSeats: 400,
    availableSeats: 210,
    prices: { VIP: 180000, R: 140000, S: 110000, A: 80000 },
    description: '빅토르 위고의 불후의 명작을 뮤지컬로 만나보세요.',
  },
  {
    id: 'evt-004',
    title: '2025 KBO 한국시리즈',
    artist: 'KBO',
    category: 'sports',
    date: '2025-10-19',
    time: '18:30',
    venue: '고척스카이돔',
    totalSeats: 800,
    availableSeats: 320,
    prices: { VIP: 120000, R: 85000, S: 60000, A: 40000 },
    description: '대한민국 프로야구 최강자를 가리는 한국시리즈.',
  },
  {
    id: 'evt-005',
    title: '세븐틴 FOLLOW AGAIN TO SEOUL',
    artist: '세븐틴 (SEVENTEEN)',
    category: 'concert',
    date: '2025-09-14',
    time: '17:00',
    venue: '수원월드컵경기장',
    totalSeats: 650,
    availableSeats: 89,
    prices: { VIP: 200000, R: 154000, S: 121000, A: 88000 },
    description: '세븐틴의 에너지 넘치는 무대와 함께하세요.',
  },
  {
    id: 'evt-006',
    title: '뮤지컬 오페라의 유령',
    artist: '앤드류 로이드 웨버',
    category: 'musical',
    date: '2025-07-28',
    time: '15:00',
    venue: '샤롯데씨어터',
    totalSeats: 350,
    availableSeats: 178,
    prices: { VIP: 200000, R: 160000, S: 130000, A: 100000 },
    description: '전 세계를 사로잡은 불멸의 뮤지컬을 마침내 국내에서.',
  },
]

// ─── 좌석 생성 ────────────────────────────────────────────────────────────────

const ZONE_CONFIG: Record<Zone, { rows: string[]; seatsPerRow: number }> = {
  VIP: { rows: ['A', 'B'], seatsPerRow: 10 },
  R:   { rows: ['C', 'D', 'E', 'F'], seatsPerRow: 12 },
  S:   { rows: ['G', 'H', 'I', 'J', 'K'], seatsPerRow: 14 },
  A:   { rows: ['L', 'M', 'N', 'O', 'P', 'Q'], seatsPerRow: 16 },
}

// 공연별 사전 예매 좌석 (랜덤 시드 역할)
const PRESOLD: Record<string, Set<string>> = {}

function getPresold(eventId: string): Set<string> {
  if (PRESOLD[eventId]) return PRESOLD[eventId]

  const event = events.find(e => e.id === eventId)
  if (!event) return new Set()

  const total =
    Object.values(ZONE_CONFIG).reduce((sum, z) => sum + z.rows.length * z.seatsPerRow, 0)
  const targetSold = total - event.availableSeats
  const sold = new Set<string>()

  // 결정적 패턴으로 미리 예매 좌석 채우기 (랜덤 없이)
  let count = 0
  const zones: Zone[] = ['A', 'R', 'S', 'VIP']  // 뒷줄부터 채움
  outer: for (const zone of zones) {
    const config = ZONE_CONFIG[zone]
    const rows = [...config.rows].reverse()
    for (const row of rows) {
      for (let num = config.seatsPerRow; num >= 1; num--) {
        if (count >= targetSold) break outer
        sold.add(`${eventId}-${zone}-${row}-${num}`)
        count++
      }
    }
  }

  PRESOLD[eventId] = sold
  return sold
}

export function generateSeats(eventId: string): Seat[] {
  const event = events.find(e => e.id === eventId)
  if (!event) return []

  const presold = getPresold(eventId)
  const seats: Seat[] = []

  for (const [zone, config] of Object.entries(ZONE_CONFIG) as [Zone, typeof ZONE_CONFIG[Zone]][]) {
    for (const row of config.rows) {
      for (let num = 1; num <= config.seatsPerRow; num++) {
        const id = `${eventId}-${zone}-${row}-${num}`
        seats.push({
          id,
          eventId,
          zone,
          row,
          number: num,
          price: event.prices[zone],
          status: presold.has(id) ? 'booked' : 'available',
        })
      }
    }
  }

  return seats
}

// ─── 예매 저장소 ──────────────────────────────────────────────────────────────

export const bookings = new Map<string, Booking>()

let bookingCounter = 1000

export function generateBookingId(): string {
  bookingCounter++
  const now = new Date()
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, '')
  return `BK${yyyymmdd}-${bookingCounter}`
}
