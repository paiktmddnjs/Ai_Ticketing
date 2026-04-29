CREATE DATABASE IF NOT EXISTS ai_ticket DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_ticket;

-- 1. 회원 (Users) 테이블
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL, -- 실제로는 bcrypt 처리된 해시값 저장
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 공연 (Events) 테이블
CREATE TABLE events (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    category ENUM('concert', 'musical', 'sports', 'theater') NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 공연별 구역 가격 (Event_Prices) 테이블
CREATE TABLE event_prices (
    event_id VARCHAR(50) NOT NULL,
    zone ENUM('VIP', 'R', 'S', 'A') NOT NULL,
    price INT NOT NULL,
    PRIMARY KEY (event_id, zone),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- 4. 좌석 (Seats) 테이블
-- 런타임에 생성하던 좌석을 DB로 관리하여 동시성 제어 및 상태 저장을 용이하게 함
CREATE TABLE seats (
    id VARCHAR(50) PRIMARY KEY,  -- 예: "evt-001-VIP-A-1"
    event_id VARCHAR(50) NOT NULL,
    zone ENUM('VIP', 'R', 'S', 'A') NOT NULL,
    seat_row VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    price INT NOT NULL,
    status ENUM('available', 'booked', 'held') DEFAULT 'available',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_seat_pos (event_id, zone, seat_row, seat_number)
);

-- 5. 예매 내역 (Bookings) 테이블
CREATE TABLE bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NULL, -- 비회원 예매를 지원할 경우 NULL 허용 
    event_id VARCHAR(50) NOT NULL,
    booker_name VARCHAR(100) NOT NULL,
    total_price INT NOT NULL,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT
);

-- 6. 예매된 특정 좌석 (Booking_Seats) 테이블
-- 하나의 예매 번호(booking_id)에 여러 좌석이 포함될 수 있으므로 N:M 관계 해소
CREATE TABLE booking_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    seat_id VARCHAR(50) NOT NULL,
    zone ENUM('VIP', 'R', 'S', 'A') NOT NULL,
    seat_row VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    price INT NOT NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_booking_seat (booking_id, seat_id)
);

-- ※ 인덱스 추가 (조회 성능 향상)
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_seats_event_id ON seats(event_id, status);
