export type UserRole = 'admin' | 'sales';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  password?: string;
  avatarUrl?: string;
  status?: 'active' | 'pending' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
}

export type MediaStatus = 'available' | 'holding' | 'contracted' | 'expiring';
export type MediaType = '와이드칼라' | '디지털포스터' | '사각기둥' | '조명광고' | '스크린도어' | '전광판';

export interface Media {
  id: string;
  line: string;             // 호선 (예: 2호선, 3호선, 신분당선)
  stationName: string;      // 역명 (예: 강남역, 홍대입구역, 삼성역)
  exitNumber: string;       // 출구번호 (예: 1번 출구, 10번 출구)
  detailLocation: string;   // 상세위치 (예: B1층 대합실 중앙, 개찰구 앞)
  mediaType: MediaType;     // 매체종류
  size: string;             // 규격 (예: 400x200 cm, 85인치 UHD)
  imageUrl: string;         // 이미지URL
  price: number;            // 단가 (월/원)
  status: MediaStatus;      // 판매상태 ('available' | 'holding' | 'contracted')
  contractEndDate?: string; // 계약종료일 (YYYY-MM-DD)
  salesRepId: string;       // 담당영업사원ID
  salesRepName?: string;    // 담당영업사원 이름 (조인용)
  lat: number;              // 위도
  lng: number;              // 경도
}

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'converted' | 'unqualified';

export interface Lead {
  id: string;
  companyName: string;      // 업체명 (예: 강남 리프팅 성형외과, 바른길 법률사무소)
  address: string;          // 주소
  lat: number;              // 위도
  lng: number;              // 경도
  phone: string;            // 전화번호
  openedAt: string;         // 개업일 / 인허가일 (YYYY-MM-DD)
  status: LeadStatus;       // 상태
  scoring: number;          // 스코어링 점수 (0 ~ 100)
  businessCategory: string; // 업종 (예: 의료/성형, 법률, 피트니스, 프랜차이즈)
  estimatedBudget: number;  // 예상 예산 (월/원)
  salesRepId?: string;      // 배정된 영업사원 ID
  // [2단계] 공공데이터 연동 추가 컬럼
  isTier1: boolean;         // 전화번호 보유 여부에 따른 최우선 순위 (Tier 1) 여부
  hasPhone: boolean;        // 전화번호 존재 여부
  geocoded: boolean;        // 주소 -> 위경도 지오코딩 처리 완료 여부
  nearestStation?: string;  // 반경 500m 이내 최인접 지하철역 (예: 강남역)
  nearestExit?: string;     // 최인접 역 출구 (예: 11번 출구)
  distanceMeters?: number;  // 최인접 출구까지의 거치 (m)
  dailyRidership?: number;  // 지하철역 일일 승하차 유동인구 (명/일)
  // [5단계] 리드 스코어링 & 트래킹 메타데이터
  temperatureGrade?: 'Hot' | 'Warm' | 'Cold';
  openCount?: number;
  clickCount?: number;
  lastActionAt?: string;
  scoreSurgeAlert?: boolean; // 20점 이상 급상승 알림 깃발
  scoreBreakdown?: {
    tier1Bonus: number;
    newStoreBonus: number;
    openBonus: number;
    clickBonus: number;
    timeDecayDeduction: number;
    finalScore: number;
  };
}

export interface SubwayExitData {
  id: string;
  stationName: string;      // 역명 (예: 강남역)
  line: string;             // 노선 (예: 2호선)
  exitNumber: string;       // 출구 번호 (예: 11번 출구)
  lat: number;              // 위도
  lng: number;              // 경도
  dailyRidership: number;   // 일일 승하차 유동인구
}

export interface BatchPipelineStatus {
  lastRunAt: string;
  cronSchedule: string;     // '0 2 * * *' (매일 새벽 2시)
  status: 'idle' | 'running' | 'success' | 'failed';
  totalFetched: number;     // 수집된 인허가 업체 수
  tier1Count: number;       // Tier 1 (전화번호 보유) 수
  geocodedCount: number;   // 지오코딩 성공 수
  cachedNearestCount: number; // 500m 이내 역세권 매칭 수
  logs: string[];           // 최근 실행 로그
}

export type LogType = 'mail' | 'ars' | 'open' | 'click' | 'status_change' | 'batch_pipeline' | 'user_created' | 'user_login';

export interface ActivityLog {
  id: string;
  type: LogType;            // 메일발송, ARS발송, 오픈, 클릭, 상태변경 이력
  leadId: string;           // 타겟 업체 ID
  leadName?: string;
  mediaId?: string;         // 관련 매체 ID (선택)
  mediaTitle?: string;
  salesRepId: string;       // 실행 영업사원 ID
  salesRepName?: string;
  description: string;      // 이력 내용 설명
  details?: Record<string, any>; // 상세 메타데이터 (이메일 제목, 전화 연결 결과 등)
  timestamp: string;        // 발생 시각
}

export interface ArsCallSession {
  id: string;
  leadId: string;
  companyName: string;
  landlinePhone: string;
  status: 'dialing' | 'connected' | 'dtmf_received' | 'lms_sent' | 'failed';
  dtmfMobilePhone?: string;
  reportToken?: string;
  reportUrl?: string;
  salesRepId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizedReport {
  token: string;
  leadId: string;
  companyName: string;
  address: string;
  businessCategory: string;
  openedAt: string;
  competitorCount500m: number;
  competitorGrowth2Yr: string; // 예: "+32% 증가 (치열한 상권 경쟁)"
  nearestStation: string;
  nearestExit: string;
  dailyRidership: number;
  mobilePhone: string;
  recommendedMedia: Media[];
  viewsCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

export interface SystemStats {
  totalMedia: number;
  availableMedia: number;
  holdingMedia: number;
  contractedMedia: number;
  totalLeads: number;
  highScoreLeads: number; // 70점 이상
  totalLogsToday: number;
}
