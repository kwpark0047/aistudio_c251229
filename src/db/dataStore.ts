import { ActivityLog, Lead, Media, SystemStats, User, ArsCallSession, PersonalizedReport } from '../types';

// Initial Users Seed Data
export const initialUsers: User[] = [
  {
    id: 'user-admin-1',
    name: '김경영 대표',
    email: 'admin@oohcrm.co.kr',
    role: 'admin',
    department: '임원/총괄',
    createdAt: '2026-01-02',
  },
  {
    id: 'user-sales-1',
    name: '김철수 팀장',
    email: 'chulsoo@oohcrm.co.kr',
    role: 'sales',
    department: '영업 1팀',
    createdAt: '2026-01-10',
  },
  {
    id: 'user-sales-2',
    name: '이영희 대리',
    email: 'younghee@oohcrm.co.kr',
    role: 'sales',
    department: '영업 2팀',
    createdAt: '2026-02-01',
  },
  {
    id: 'user-sales-3',
    name: '박민수 과장',
    email: 'minsu@oohcrm.co.kr',
    role: 'sales',
    department: '영업 1팀',
    createdAt: '2026-02-15',
  },
];

// Initial Seoul OOH Media Inventory Seed Data
export const initialMedia: Media[] = [
  {
    id: 'med-001',
    line: '2호선',
    stationName: '강남역',
    exitNumber: '11번 출구',
    detailLocation: 'B1층 메인 환승 대합실 중앙 벽면',
    mediaType: '와이드칼라',
    size: '400 x 220 cm',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    price: 4500000,
    status: 'available',
    salesRepId: 'user-sales-1',
    salesRepName: '김철수 팀장',
    lat: 37.497952,
    lng: 127.027619,
  },
  {
    id: 'med-002',
    line: '2호선',
    stationName: '강남역',
    exitNumber: '2번 출구',
    detailLocation: '출구 통로 측면 기둥 디지털 기둥',
    mediaType: '사각기둥',
    size: '120 x 240 cm (4면)',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    price: 3800000,
    status: 'holding',
    salesRepId: 'user-sales-2',
    salesRepName: '이영희 대리',
    contractEndDate: '2026-08-30',
    lat: 37.497200,
    lng: 127.028100,
  },
  {
    id: 'med-003',
    line: '2호선',
    stationName: '홍대입구역',
    exitNumber: '9번 출구',
    detailLocation: '9번 출구 상행 에스컬레이터 정면 디스플레이',
    mediaType: '디지털포스터',
    size: '85인치 4K UHD (8기 세트)',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    price: 5200000,
    status: 'available',
    salesRepId: 'user-sales-1',
    salesRepName: '김철수 팀장',
    lat: 37.557527,
    lng: 126.924466,
  },
  {
    id: 'med-004',
    line: '2호선',
    stationName: '삼성역',
    exitNumber: '5,6번 출구 (코엑스)',
    detailLocation: '코엑스몰 연결 통로 대형 LED 전광판',
    mediaType: '전광판',
    size: '1000 x 350 cm',
    imageUrl: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=800&q=80',
    price: 8500000,
    status: 'contracted',
    salesRepId: 'user-sales-3',
    salesRepName: '박민수 과장',
    contractEndDate: '2026-12-31',
    lat: 37.508808,
    lng: 127.063160,
  },
  {
    id: 'med-005',
    line: '3호선',
    stationName: '신사역',
    exitNumber: '8번 출구',
    detailLocation: '신사역 8번출구 가로수길 진입로 조명광고',
    mediaType: '조명광고',
    size: '300 x 150 cm',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    price: 3200000,
    status: 'available',
    salesRepId: 'user-sales-2',
    salesRepName: '이영희 대리',
    lat: 37.516330,
    lng: 127.020350,
  },
  {
    id: 'med-006',
    line: '9호선/5호선',
    stationName: '여의도역',
    exitNumber: '3번 출구 (더현대)',
    detailLocation: 'IFC몰 및 더현대 지하 연결 통로 스크린',
    mediaType: '스크린도어',
    size: '350 x 200 cm',
    imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    price: 6000000,
    status: 'holding',
    salesRepId: 'user-sales-3',
    salesRepName: '박민수 과장',
    contractEndDate: '2026-09-15',
    lat: 37.521620,
    lng: 126.924200,
  },
  {
    id: 'med-007',
    line: '2호선',
    stationName: '을지로입구역',
    exitNumber: '5번 출구',
    detailLocation: '명동입구 진입 대합실 메인 벽면',
    mediaType: '와이드칼라',
    size: '400 x 200 cm',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    price: 4000000,
    status: 'available',
    salesRepId: 'user-sales-1',
    salesRepName: '김철수 팀장',
    lat: 37.566000,
    lng: 126.982200,
  }
];

// Initial Target Leads Seed Data (Newly Licensed Businesses near Media Stations)
export const initialLeads: Lead[] = [
  {
    id: 'lead-101',
    companyName: '리엔장 성형외과 강남점',
    address: '서울특별시 강남구 강남대로 406 3~5층',
    lat: 37.498800,
    lng: 127.027100,
    phone: '02-555-1234',
    openedAt: '2026-07-15',
    status: 'new',
    scoring: 94,
    businessCategory: '의료/성형외과',
    estimatedBudget: 5000000,
    salesRepId: 'user-sales-1',
    isTier1: true,
    hasPhone: true,
    geocoded: true,
    nearestStation: '강남역',
    nearestExit: '11번 출구',
    distanceMeters: 142,
    dailyRidership: 148500,
  },
  {
    id: 'lead-102',
    companyName: '더법률사무소 강남',
    address: '서울특별시 서초구 서초대로 397 7층',
    lat: 37.496500,
    lng: 127.025800,
    phone: '02-3482-9900',
    openedAt: '2026-06-20',
    status: 'contacted',
    scoring: 88,
    businessCategory: '법률/세무',
    estimatedBudget: 3500000,
    salesRepId: 'user-sales-1',
    isTier1: true,
    hasPhone: true,
    geocoded: true,
    nearestStation: '강남역',
    nearestExit: '2번 출구',
    distanceMeters: 210,
    dailyRidership: 148500,
  },
  {
    id: 'lead-103',
    companyName: '플래티넘 피트니스 홍대본점',
    address: '서울특별시 마포구 양화로 162 지하1층',
    lat: 37.556200,
    lng: 126.923100,
    phone: '02-333-8877',
    openedAt: '2026-08-01',
    status: 'negotiating',
    scoring: 85,
    businessCategory: '휘트니스/스포츠',
    estimatedBudget: 4000000,
    salesRepId: 'user-sales-2',
    isTier1: true,
    hasPhone: true,
    geocoded: true,
    nearestStation: '홍대입구역',
    nearestExit: '9번 출구',
    distanceMeters: 180,
    dailyRidership: 132000,
  },
  {
    id: 'lead-104',
    companyName: '서울올바른치과 신사점',
    address: '서울특별시 강남구 도산대로 107 2층',
    lat: 37.517100,
    lng: 127.021100,
    phone: '02-512-2875',
    openedAt: '2026-07-28',
    status: 'new',
    scoring: 91,
    businessCategory: '의료/치과',
    estimatedBudget: 4500000,
    salesRepId: 'user-sales-2',
    isTier1: true,
    hasPhone: true,
    geocoded: true,
    nearestStation: '신사역',
    nearestExit: '8번 출구',
    distanceMeters: 110,
    dailyRidership: 78000,
  },
  {
    id: 'lead-105',
    companyName: '삼성 파이낸스 타워 자산운용',
    address: '서울특별시 강남구 테헤란로 508 12층',
    lat: 37.507900,
    lng: 127.061500,
    phone: '02-6000-1122',
    openedAt: '2026-05-10',
    status: 'converted',
    scoring: 78,
    businessCategory: '금융/투자',
    estimatedBudget: 8000000,
    salesRepId: 'user-sales-3',
    isTier1: true,
    hasPhone: true,
    geocoded: true,
    nearestStation: '삼성역',
    nearestExit: '5,6번 출구',
    distanceMeters: 195,
    dailyRidership: 115000,
  },
  {
    id: 'lead-106',
    companyName: '여의도 자산관리자문그룹',
    address: '서울특별시 영등포구 국제금융로 10 20층',
    lat: 37.523000,
    lng: 126.925500,
    phone: '02-780-4400',
    openedAt: '2026-07-02',
    status: 'contacted',
    scoring: 82,
    businessCategory: '금융/법률',
    estimatedBudget: 6000000,
    salesRepId: 'user-sales-3',
    isTier1: true,
    hasPhone: true,
    geocoded: true,
    nearestStation: '여의도역',
    nearestExit: '3번 출구',
    distanceMeters: 230,
    dailyRidership: 92400,
  }
];


// Initial Activity Logs
export const initialLogs: ActivityLog[] = [
  {
    id: 'log-501',
    type: 'mail',
    leadId: 'lead-101',
    leadName: '리엔장 성형외과 강남점',
    mediaId: 'med-001',
    mediaTitle: '2호선 강남역 11번 출구 와이드칼라',
    salesRepId: 'user-sales-1',
    salesRepName: '김철수 팀장',
    description: '[자동화 제안서] 강남역 11번출구 메인 와이드칼라 맞춤 옥외광고 제안 메일 발송',
    details: { subject: '강남역 11번출구 신규 개업 맞춤 옥외광고 특별 제안', recipient: 'marketing@lienjang.com' },
    timestamp: '2026-08-10T09:30:00+09:00',
  },
  {
    id: 'log-502',
    type: 'open',
    leadId: 'lead-101',
    leadName: '리엔장 성형외과 강남점',
    mediaId: 'med-001',
    salesRepId: 'user-sales-1',
    salesRepName: '김철수 팀장',
    description: '고객사에서 제안 메일 및 미디어킷 PDF 열람 확인 (1회차)',
    details: { ip: '211.108.45.12', userAgent: 'Chrome Mobile iOS' },
    timestamp: '2026-08-10T10:15:22+09:00',
  },
  {
    id: 'log-503',
    type: 'click',
    leadId: 'lead-101',
    leadName: '리엔장 성형외과 강남점',
    mediaId: 'med-001',
    salesRepId: 'user-sales-1',
    salesRepName: '김철수 팀장',
    description: '제안서 내 [매체 위치 및 보도자료 보기] 링크 클릭 트래킹 수신',
    details: { targetUrl: 'https://oohcrm.co.kr/media/med-001/view' },
    timestamp: '2026-08-10T10:18:05+09:00',
  },
  {
    id: 'log-504',
    type: 'ars',
    leadId: 'lead-103',
    leadName: '플래티넘 피트니스 홍대본점',
    mediaId: 'med-003',
    salesRepId: 'user-sales-2',
    salesRepName: '이영희 대리',
    description: 'AI 콜봇/ARS 영업안내전화 연결 완료 (통화시간 1분 45초)',
    details: { durationSec: 105, dtmfKey: '1 (담당자 연결 희망)' },
    timestamp: '2026-08-09T14:20:00+09:00',
  },
  {
    id: 'log-505',
    type: 'status_change',
    leadId: 'lead-103',
    leadName: '플래티넘 피트니스 홍대본점',
    salesRepId: 'user-sales-2',
    salesRepName: '이영희 대리',
    description: '리드 상태 변경: [신규 (new)] -> [협상중 (negotiating)]',
    details: { previousStatus: 'new', newStatus: 'negotiating' },
    timestamp: '2026-08-09T14:25:00+09:00',
  }
];

// In-memory Database Class
class DataStore {
  private users: User[] = [...initialUsers];
  private media: Media[] = [...initialMedia];
  private leads: Lead[] = [...initialLeads];
  private logs: ActivityLog[] = [...initialLogs];

  // Users
  getUsers(): User[] {
    return this.users;
  }

  addUser(newUser: Omit<User, 'id'>): User {
    const created: User = {
      ...newUser,
      id: `user-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    this.users.push(created);
    return created;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  deleteUser(id: string): boolean {
    const len = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    return this.users.length < len;
  }

  // Media CRUD
  getMedia(): Media[] {
    return this.media;
  }

  getMediaById(id: string): Media | undefined {
    return this.media.find(m => m.id === id);
  }

  addMedia(newMedia: Omit<Media, 'id'>): Media {
    const created: Media = {
      ...newMedia,
      id: `med-${Date.now().toString().slice(-4)}`,
    };
    this.media.unshift(created);
    return created;
  }

  updateMedia(id: string, updates: Partial<Media>): Media | null {
    const idx = this.media.findIndex(m => m.id === id);
    if (idx === -1) return null;
    this.media[idx] = { ...this.media[idx], ...updates };
    return this.media[idx];
  }

  deleteMedia(id: string): boolean {
    const len = this.media.length;
    this.media = this.media.filter(m => m.id !== id);
    return this.media.length < len;
  }

  /**
   * Excel Bulk Upsert with Status Conflict Protection
   */
  upsertMediaBatch(
    items: Partial<Media>[],
    options: { protectActiveStatus?: boolean } = { protectActiveStatus: true }
  ): { inserted: number; updated: number; statusProtected: number; items: Media[] } {
    let inserted = 0;
    let updated = 0;
    let statusProtected = 0;

    for (const raw of items) {
      if (!raw.id) {
        raw.id = `med-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`;
      }

      const existingIdx = this.media.findIndex(m => m.id === raw.id);

      if (existingIdx !== -1) {
        const existing = this.media[existingIdx];
        let finalStatus = raw.status || existing.status;

        // Status conflict protection logic:
        // If existing is active ('holding' or 'contracted') and incoming is 'available',
        // keep the existing active status to prevent accidental overwrite/double-booking!
        if (
          options.protectActiveStatus &&
          (existing.status === 'holding' || existing.status === 'contracted') &&
          raw.status === 'available'
        ) {
          finalStatus = existing.status;
          statusProtected++;
        }

        this.media[existingIdx] = {
          ...existing,
          ...raw,
          status: finalStatus,
        } as Media;
        updated++;
      } else {
        const newMedia: Media = {
          id: raw.id,
          line: raw.line || '2호선',
          stationName: raw.stationName || '강남역',
          exitNumber: raw.exitNumber || '1번 출구',
          detailLocation: raw.detailLocation || '대합실 중앙',
          mediaType: raw.mediaType || '와이드칼라',
          size: raw.size || '300 x 200 cm',
          imageUrl: raw.imageUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
          price: raw.price || 3500000,
          status: raw.status || 'available',
          salesRepId: raw.salesRepId || 'user-sales-1',
          salesRepName: raw.salesRepName || '김철수 팀장',
          lat: raw.lat || 37.4980,
          lng: raw.lng || 127.0276,
        };
        this.media.unshift(newMedia);
        inserted++;
      }
    }

    return {
      inserted,
      updated,
      statusProtected,
      items: this.media,
    };
  }

  // Leads CRUD
  getLeads(): Lead[] {
    return this.leads;
  }

  setLeads(newLeads: Lead[]): void {
    this.leads = [...newLeads];
  }

  getLeadById(id: string): Lead | undefined {
    return this.leads.find(l => l.id === id);
  }

  addLead(newLead: Omit<Lead, 'id'>): Lead {
    const created: Lead = {
      ...newLead,
      id: `lead-${Date.now().toString().slice(-4)}`,
    };
    this.leads.unshift(created);
    return created;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const idx = this.leads.findIndex(l => l.id === id);
    if (idx === -1) return null;
    
    const oldStatus = this.leads[idx].status;
    this.leads[idx] = { ...this.leads[idx], ...updates };

    // Record automatic log if status changed
    if (updates.status && updates.status !== oldStatus) {
      this.addLog({
        type: 'status_change',
        leadId: id,
        leadName: this.leads[idx].companyName,
        salesRepId: updates.salesRepId || this.leads[idx].salesRepId || 'user-sales-1',
        salesRepName: '담당 영업사원',
        description: `상태 변경: [${oldStatus}] → [${updates.status}]`,
        details: { previousStatus: oldStatus, newStatus: updates.status },
        timestamp: new Date().toISOString(),
      });
    }

    return this.leads[idx];
  }

  deleteLead(id: string): boolean {
    const len = this.leads.length;
    this.leads = this.leads.filter(l => l.id !== id);
    return this.leads.length < len;
  }

  // Logs
  getLogs(): ActivityLog[] {
    return this.logs;
  }

  addLog(log: Omit<ActivityLog, 'id'>): ActivityLog {
    const created: ActivityLog = {
      ...log,
      id: `log-${Date.now().toString().slice(-4)}`,
    };
    this.logs.unshift(created);
    return created;
  }

  // System Dashboard Stats
  getStats(): SystemStats {
    return {
      totalMedia: this.media.length,
      availableMedia: this.media.filter(m => m.status === 'available').length,
      holdingMedia: this.media.filter(m => m.status === 'holding').length,
      contractedMedia: this.media.filter(m => m.status === 'contracted').length,
      totalLeads: this.leads.length,
      highScoreLeads: this.leads.filter(l => l.scoring >= 80).length,
      totalLogsToday: this.logs.length,
    };
  }

  // --- [4단계] ARS 연동 및 개인화 웹 리포트 Engine ---
  private arsSessions: ArsCallSession[] = [];
  private reports: Record<string, PersonalizedReport> = {};

  getArsSessions(): ArsCallSession[] {
    return this.arsSessions;
  }

  /**
   * 영업사원이 리드 다중 선택 후 ARS 발송
   */
  triggerArsCalls(leadIds: string[], salesRepId: string): ArsCallSession[] {
    const createdSessions: ArsCallSession[] = [];

    for (const leadId of leadIds) {
      const lead = this.leads.find(l => l.id === leadId);
      if (!lead) continue;

      const sessionId = `ars-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
      const session: ArsCallSession = {
        id: sessionId,
        leadId: lead.id,
        companyName: lead.companyName,
        landlinePhone: lead.phone,
        status: 'dialing',
        salesRepId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.arsSessions.unshift(session);
      createdSessions.push(session);

      // Record Activity Log
      this.addLog({
        type: 'ars',
        leadId: lead.id,
        leadName: lead.companyName,
        salesRepId,
        salesRepName: '영업담당자',
        description: `[ARS 자동발송] ${lead.companyName}(${lead.phone})로 가상 ARS 음성전화 발신중`,
        details: { sessionId, landlinePhone: lead.phone },
        timestamp: new Date().toISOString(),
      });

      // Auto simulate DTMF response after 1.5 seconds if test simulation
      setTimeout(() => {
        const dummyMobile = `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        this.processArsWebhookDTMF(sessionId, dummyMobile);
      }, 1800);
    }

    return createdSessions;
  }

  /**
   * ARS Webhook Callback (DTMF 번호입력 수집 -> 카카오톡/LMS 자동발송 및 개인화 리포트 토큰 생성)
   */
  processArsWebhookDTMF(sessionId: string, dtmfMobilePhone: string): PersonalizedReport | null {
    const session = this.arsSessions.find(s => s.id === sessionId);
    if (!session) return null;

    const lead = this.leads.find(l => l.id === session.leadId);
    if (!lead) return null;

    // Generate Unique Token
    const reportToken = `token-${Math.random().toString(36).substring(2, 10)}`;
    const reportUrl = `${globalThis.location?.origin || ''}/report/${reportToken}`;

    // Calculate competitor stores within 500m (mocked based on businessCategory)
    const competitorCount = Math.floor(12 + Math.random() * 15);
    const competitorGrowth = `+${Math.floor(25 + Math.random() * 20)}% (2년 내 급증)`;

    // Find recommended OOH media for nearest station
    const recommendedMedia = this.media.filter(
      m => m.stationName === lead.nearestStation || (lead.nearestStation && lead.nearestStation.includes(m.stationName))
    );

    const report: PersonalizedReport = {
      token: reportToken,
      leadId: lead.id,
      companyName: lead.companyName,
      address: lead.address,
      businessCategory: lead.businessCategory,
      openedAt: lead.openedAt,
      competitorCount500m: competitorCount,
      competitorGrowth2Yr: competitorGrowth,
      nearestStation: lead.nearestStation || '강남역',
      nearestExit: lead.nearestExit || '11번 출구',
      dailyRidership: lead.dailyRidership || 148500,
      mobilePhone: dtmfMobilePhone,
      recommendedMedia: recommendedMedia.length > 0 ? recommendedMedia : this.media.slice(0, 3),
      viewsCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.reports[reportToken] = report;

    // Update Session
    session.status = 'lms_sent';
    session.dtmfMobilePhone = dtmfMobilePhone;
    session.reportToken = reportToken;
    session.reportUrl = reportUrl;
    session.updatedAt = new Date().toISOString();

    // Log LMS/KakaoTalk auto-sending
    this.addLog({
      type: 'mail',
      leadId: lead.id,
      leadName: lead.companyName,
      salesRepId: session.salesRepId,
      salesRepName: '영업담당자',
      description: `[카톡/LMS 자동발송] DTMF 수집된 휴대폰(${dtmfMobilePhone})으로 상권분석 리포트 URL 발송`,
      details: { dtmfMobilePhone, reportToken, reportUrl },
      timestamp: new Date().toISOString(),
    });

    return report;
  }

  getReportByToken(token: string): PersonalizedReport | null {
    const report = this.reports[token];
    if (!report) return null;

    report.viewsCount += 1;
    report.lastViewedAt = new Date().toISOString();

    // Log Report Viewed Event
    this.addLog({
      type: 'open',
      leadId: report.leadId,
      leadName: report.companyName,
      salesRepId: 'system',
      salesRepName: '고객 열람',
      description: `[고객 리포트 열람] ${report.companyName} 대표자가 초개인화 상권분석 리포트(${token})를 확인했습니다.`,
      details: { token, viewsCount: report.viewsCount },
      timestamp: new Date().toISOString(),
    });

    return report;
  }

  // --- [5단계] 리드 스코어링 & 행동 트래킹 & 리텐션 메디아 만료 엔진 ---

  /**
   * Time Decay(시간 감쇄) 가중치가 적용된 실시간 리드 스코어링 계산
   */
  recalculateLeadScore(lead: Lead): Lead {
    const tier1Bonus = lead.isTier1 ? 15 : 0;

    // 1개월 이내 신규 개업 업체 가중치
    let newStoreBonus = 0;
    if (lead.openedAt) {
      const openDate = new Date(lead.openedAt);
      const now = new Date();
      const diffDays = (now.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 30) {
        newStoreBonus = 15;
      }
    }

    const openCount = lead.openCount || 0;
    const clickCount = lead.clickCount || 0;

    const openBonus = openCount === 1 ? 5 : openCount >= 2 ? 15 : 0;
    const clickBonus = Math.min(40, clickCount * 20);
    const rawActionPoints = openBonus + clickBonus;

    // Time Decay 적용 (3일 경과 시 50% 차감, 7일 경과 시 행동점수 100% 차감 초기화)
    let decayMultiplier = 1.0;
    if (lead.lastActionAt) {
      const actionDate = new Date(lead.lastActionAt);
      const now = new Date();
      const elapsedDays = (now.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24);

      if (elapsedDays >= 7) {
        decayMultiplier = 0;
      } else if (elapsedDays >= 3) {
        decayMultiplier = 0.5;
      }
    }

    const decayedActionPoints = Math.round(rawActionPoints * decayMultiplier);
    const timeDecayDeduction = rawActionPoints - decayedActionPoints;

    // Base default weight
    const baseWeight = lead.nearestStation ? 35 : 20;

    const finalScore = Math.min(
      100,
      Math.max(0, baseWeight + tier1Bonus + newStoreBonus + decayedActionPoints)
    );

    // Temperature Grade (Hot: 80+, Warm: 50~79, Cold: <50)
    let temperatureGrade: 'Hot' | 'Warm' | 'Cold' = 'Cold';
    if (finalScore >= 80) {
      temperatureGrade = 'Hot';
    } else if (finalScore >= 50) {
      temperatureGrade = 'Warm';
    }

    lead.scoring = finalScore;
    lead.temperatureGrade = temperatureGrade;
    lead.scoreBreakdown = {
      tier1Bonus,
      newStoreBonus,
      openBonus,
      clickBonus,
      timeDecayDeduction,
      finalScore,
    };

    return lead;
  }

  getLeadsWithScoring(): Lead[] {
    return this.leads.map((l) => this.recalculateLeadScore(l));
  }

  /**
   * 1x1 투명 픽셀 오프닝 트래킹
   */
  trackPixelOpen(leadId: string): Lead | null {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const oldScore = lead.scoring || 50;
    lead.openCount = (lead.openCount || 0) + 1;
    lead.lastActionAt = new Date().toISOString();

    this.recalculateLeadScore(lead);

    // 20점 이상 급상승 체킹
    if (lead.scoring - oldScore >= 20) {
      lead.scoreSurgeAlert = true;
    }

    // Activity Log
    this.addLog({
      type: 'open',
      leadId: lead.id,
      leadName: lead.companyName,
      salesRepId: lead.salesRepId || 'system',
      salesRepName: '트래킹 픽셀',
      description: `[1x1 픽셀 감지] ${lead.companyName} 대표자가 메일/리포트를 오픈했습니다. (총 ${lead.openCount}회 오픈)`,
      details: { openCount: lead.openCount, newScore: lead.scoring },
      timestamp: new Date().toISOString(),
    });

    return lead;
  }

  /**
   * 고유 링크 클릭 트래킹
   */
  trackLinkClick(leadId: string, redirectUrl?: string): Lead | null {
    const lead = this.leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const oldScore = lead.scoring || 50;
    lead.clickCount = (lead.clickCount || 0) + 1;
    lead.lastActionAt = new Date().toISOString();

    this.recalculateLeadScore(lead);

    // 20점 이상 급상승 체킹
    if (lead.scoring - oldScore >= 15 || lead.clickCount >= 2) {
      lead.scoreSurgeAlert = true;
    }

    // Activity Log
    this.addLog({
      type: 'click',
      leadId: lead.id,
      leadName: lead.companyName,
      salesRepId: lead.salesRepId || 'system',
      salesRepName: '링크 트래커',
      description: `[링크 클릭 감지] ${lead.companyName} 대표자가 제안서/PDF 링크를 클릭했습니다. (+20점 부여)`,
      details: { clickCount: lead.clickCount, redirectUrl, newScore: lead.scoring },
      timestamp: new Date().toISOString(),
    });

    return lead;
  }

  /**
   * D-30일 만료 예정 계약 매체 자동 감지 크론 로직
   */
  checkExpiringMedia(): Media[] {
    const today = new Date();
    const expiringItems: Media[] = [];

    this.media.forEach((m) => {
      if (m.status === 'contracted' && m.contractEndDate) {
        const endDate = new Date(m.contractEndDate);
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
          m.status = 'expiring';
          expiringItems.push(m);

          this.addLog({
            type: 'status_change',
            leadId: 'media-system',
            salesRepId: m.salesRepId || 'system',
            salesRepName: m.salesRepName || '매체 관리 시스템',
            description: `[D-30 리텐션 알림] ${m.line} ${m.stationName} (${m.mediaType}) 계약 만료 ${diffDays}일 전 ➔ '만료 예정'으로 상태 전환`,
            details: { mediaId: m.id, contractEndDate: m.contractEndDate, daysLeft: diffDays },
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    return expiringItems;
  }
}

export const store = new DataStore();
