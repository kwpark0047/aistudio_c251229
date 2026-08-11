export const SQL_SCHEMA = `-- ====================================================================
-- B2B 옥외광고(OOH) 영업 자동화 CRM - Database Schema (PostgreSQL / Supabase)
-- Stage 1: DB 스키마 설계 및 테이블 구조
-- ====================================================================

-- 1. 커스텀 ENUM 타입 정의
CREATE TYPE user_role AS ENUM ('admin', 'sales');
CREATE TYPE media_status AS ENUM ('available', 'holding', 'contracted');
CREATE TYPE media_type AS ENUM ('와이드칼라', '디지털포스터', '사각기둥', '조명광고', '스크린도어', '전광판');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'negotiating', 'converted', 'unqualified');
CREATE TYPE log_type AS ENUM ('mail', 'ars', 'open', 'click', 'status_change');

-- 2. Users 테이블 (사용자 권한 분리: Admin vs Sales)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'sales',
    department VARCHAR(100) NOT NULL DEFAULT '영업팀',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Media 테이블 (옥외광고 매체 재고)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line VARCHAR(50) NOT NULL,                -- 호선 (예: 2호선, 3호선)
    station_name VARCHAR(100) NOT NULL,       -- 역명 (예: 강남역, 홍대입구역)
    exit_number VARCHAR(50) NOT NULL,         -- 출구번호 (예: 1번 출구)
    detail_location TEXT NOT NULL,            -- 상세위치 (예: B1층 대합실 중앙)
    media_type media_type NOT NULL,           -- 매체종류
    size VARCHAR(100) NOT NULL,               -- 규격 (예: 400x200 cm)
    image_url TEXT NOT NULL,                  -- 이미지 URL
    price NUMERIC(12, 0) NOT NULL,            -- 단가 (월/원)
    status media_status NOT NULL DEFAULT 'available', -- 판매상태
    contract_end_date DATE,                   -- 계약종료일
    sales_rep_id UUID REFERENCES users(id) ON DELETE SET NULL, -- 담당영업사원ID
    lat DOUBLE PRECISION NOT NULL,            -- 위도 (WGS84)
    lng DOUBLE PRECISION NOT NULL,            -- 경도 (WGS84)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Leads 테이블 (인허가 타겟 업체 및 스코어링)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(200) NOT NULL,       -- 업체명
    address TEXT NOT NULL,                    -- 주소
    lat DOUBLE PRECISION NOT NULL,            -- 위도
    lng DOUBLE PRECISION NOT NULL,            -- 경도
    phone VARCHAR(50),                        -- 전화번호
    opened_at DATE NOT NULL,                  -- 개업일
    status lead_status NOT NULL DEFAULT 'new',-- 상태
    scoring INT NOT NULL DEFAULT 50 CHECK (scoring BETWEEN 0 AND 100), -- 스코어링 점수
    business_category VARCHAR(100) NOT NULL,  -- 업종 (성형외과, 법률, 피트니스 등)
    estimated_budget NUMERIC(12, 0) DEFAULT 0,-- 예상 예산 (월/원)
    sales_rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Logs 테이블 (트래킹 이력: 메일, ARS, 오픈, 클릭, 상태변경)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type log_type NOT NULL,                   -- 이력 유형
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE SET NULL,
    sales_rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
    description TEXT NOT NULL,                -- 이력 내용 요약
    details JSONB DEFAULT '{}'::jsonb,        -- 상세 정보 (트래킹 헤더, 링크 클릭 URL 등)
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. 성능 최적화를 위한 인덱스 생성
CREATE INDEX idx_media_station ON media(station_name, line);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_location ON media(lat, lng);

CREATE INDEX idx_leads_location ON leads(lat, lng);
CREATE INDEX idx_leads_scoring ON leads(scoring DESC);
CREATE INDEX idx_leads_status ON leads(status);

CREATE INDEX idx_logs_lead_id ON activity_logs(lead_id);
CREATE INDEX idx_logs_type ON activity_logs(type);
CREATE INDEX idx_logs_timestamp ON activity_logs(timestamp DESC);

-- 7. Row Level Security (RLS) 및 보안 정책 예시 (Supabase)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 관리자는 전체 접근, 영업사원은 읽기 및 본인 관련 매체/리드 수정 권한
CREATE POLICY "Admin Full Access" ON media FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Sales Read All Media" ON media FOR SELECT
  USING (true);
`;

export const SCHEMA_DOCS = [
  {
    table: 'users',
    description: '시스템 사용자 및 권한 관리 (관리자 Admin / 영업사원 Sales)',
    fields: [
      { name: 'id', type: 'UUID (PK)', desc: '사용자 고유 식별자' },
      { name: 'name', type: 'VARCHAR(100)', desc: '사용자 성명' },
      { name: 'email', type: 'VARCHAR(255)', desc: '로그인 이메일 (Unique)' },
      { name: 'role', type: 'ENUM (admin, sales)', desc: '권한 구분 (Admin: 전권, Sales: 영업사원)' },
      { name: 'department', type: 'VARCHAR(100)', desc: '소속 부서' },
    ]
  },
  {
    table: 'media',
    description: '지하철 및 옥외광고 매체 재고 관리',
    fields: [
      { name: 'id', type: 'UUID (PK)', desc: '매체 고유 ID' },
      { name: 'line', type: 'VARCHAR(50)', desc: '지하철 호선 (2호선, 3호선 등)' },
      { name: 'station_name', type: 'VARCHAR(100)', desc: '역명 (강남역, 홍대입구역 등)' },
      { name: 'exit_number', type: 'VARCHAR(50)', desc: '출구번호 (1번 출구)' },
      { name: 'detail_location', type: 'TEXT', desc: '상세위치 (B1 대합실 중앙 등)' },
      { name: 'media_type', type: 'ENUM', desc: '매체종류 (와이드칼라, 디지털포스터 등)' },
      { name: 'size', type: 'VARCHAR(100)', desc: '규격 (400x200cm 등)' },
      { name: 'price', type: 'NUMERIC', desc: '월 판매 단가 (KRW)' },
      { name: 'status', type: 'ENUM', desc: '판매상태 (available, holding, contracted)' },
      { name: 'contract_end_date', type: 'DATE', desc: '계약종료 예정일' },
      { name: 'sales_rep_id', type: 'UUID (FK)', desc: '담당 영업사원 ID' },
      { name: 'lat, lng', type: 'DOUBLE', desc: '지도 표시용 위경도 Coordinates' }
    ]
  },
  {
    table: 'leads',
    description: '인허가 타겟 업체 데이터베이스 및 스코어링',
    fields: [
      { name: 'id', type: 'UUID (PK)', desc: '타겟 업체 고유 ID' },
      { name: 'company_name', type: 'VARCHAR(200)', desc: '상호명/업체명' },
      { name: 'address', type: 'TEXT', desc: '도로명 주소' },
      { name: 'phone', type: 'VARCHAR(50)', desc: '대표 연락처' },
      { name: 'opened_at', type: 'DATE', desc: '신규 개업일/인허가일' },
      { name: 'status', type: 'ENUM', desc: '영업 상태 (new, contacted, negotiating, converted)' },
      { name: 'scoring', type: 'INT (0~100)', desc: 'AI 타겟 적합도 스코어' },
      { name: 'business_category', type: 'VARCHAR', desc: '업종 (성형외과, 피트니스, 법률 등)' },
      { name: 'lat, lng', type: 'DOUBLE', desc: '업체 지리 위치' }
    ]
  },
  {
    table: 'activity_logs',
    description: '자동화 영업 트래킹 이력 (메일, ARS, 오픈, 클릭, 상태)',
    fields: [
      { name: 'id', type: 'UUID (PK)', desc: '로그 고유 ID' },
      { name: 'type', type: 'ENUM', desc: '이력종류 (mail, ars, open, click, status_change)' },
      { name: 'lead_id', type: 'UUID (FK)', desc: '타겟 업체 FK' },
      { name: 'media_id', type: 'UUID (FK)', desc: '제안 매체 FK' },
      { name: 'sales_rep_id', type: 'UUID (FK)', desc: '담당 영업사원 FK' },
      { name: 'description', type: 'TEXT', desc: '트래킹 로그 상세 내용' },
      { name: 'details', type: 'JSONB', desc: '메일 오픈시각, 클릭 링크, 수신확인 메타데이터' }
    ]
  }
];
