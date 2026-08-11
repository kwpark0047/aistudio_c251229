import React, { useState, useEffect } from 'react';
import { Lead, Media, User } from '../types';
import {
  Flame,
  Sun,
  Snowflake,
  TrendingUp,
  Clock,
  Eye,
  MousePointerClick,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Send,
  PhoneCall,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
  Zap,
  Building2,
  ShieldAlert,
} from 'lucide-react';

interface SalesKanbanDashboardProps {
  leadsList: Lead[];
  currentUser: User;
  onRefreshLeads?: () => void;
  onSelectLeadForArs?: (leadId: string) => void;
}

export const SalesKanbanDashboard: React.FC<SalesKanbanDashboardProps> = ({
  leadsList,
  currentUser,
  onRefreshLeads,
  onSelectLeadForArs,
}) => {
  const [leadsWithScore, setLeadsWithScore] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [expiringMedia, setExpiringMedia] = useState<Media[]>([]);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'surge'>('all');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [lastNotificationMessage, setLastNotificationMessage] = useState<string | null>(null);

  const fetchScoredLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads/scoring');
      if (res.ok) {
        const data = await res.json();
        setLeadsWithScore(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringMedia = async () => {
    try {
      const res = await fetch('/api/media/check-expiring', { method: 'POST' });
      const data = await res.json();
      if (data.expiring) {
        setExpiringMedia(data.expiring);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScoredLeads();
    fetchExpiringMedia();
  }, []);

  const requestNotification = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
    }
  };

  const triggerSystemNotification = (title: string, body: string) => {
    setLastNotificationMessage(`${title}: ${body}`);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  // Simulate Pixel Open
  const handleSimulatePixelOpen = async (lead: Lead) => {
    try {
      await fetch(`/api/track/pixel.gif?leadId=${lead.id}`);
      await fetchScoredLeads();

      triggerSystemNotification(
        '📧 이메일/리포트 오픈 감지',
        `[${lead.companyName}] 대표자가 메일을 오픈했습니다! (+5점 상승)`
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate Link Click
  const handleSimulateLinkClick = async (lead: Lead) => {
    try {
      await fetch(`/api/track/click?leadId=${lead.id}&redirect=/`);
      await fetchScoredLeads();

      triggerSystemNotification(
        '🔥 [점수 급상승] 제안서 클릭 감지!',
        `[${lead.companyName}] 대표자가 제안서 PDF를 클릭하여 Hot 리드로 반응했습니다! (+20점 상승)`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leadsWithScore.filter((l) => {
    if (activeTabFilter === 'surge') return l.scoreSurgeAlert || (l.scoring && l.scoring >= 80);
    return true;
  });

  const hotLeads = filteredLeads.filter((l) => (l.scoring || 0) >= 80);
  const warmLeads = filteredLeads.filter((l) => (l.scoring || 0) >= 50 && (l.scoring || 0) < 80);
  const coldLeads = filteredLeads.filter((l) => (l.scoring || 0) < 50);

  const [mobileColumnFilter, setMobileColumnFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  return (
    <div className="p-3 sm:p-6 bg-slate-900 text-slate-100 min-h-screen space-y-4 sm:space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 p-4 sm:p-6 rounded-2xl border border-rose-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              [5단계] 인텐트 기반 스코어링 & 칸반
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              Time Decay & 1x1 Pixel Tracking
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white mt-2 flex items-center gap-2">
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 animate-pulse" />
            고객 반응 트래킹 & 영업 유도 칸반
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            1x1 투명 픽셀 & 고유 링크 리다이렉트를 통한 오픈/클릭 실시간 점수화 | 3일·7일 Time Decay 시간 감쇄 적용
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {notificationPermission !== 'granted' && (
            <button
              onClick={requestNotification}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all min-h-[40px]"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">실시간 팝업 알림 허용</span>
              <span className="sm:hidden">알림 허용</span>
            </button>
          )}

          <button
            onClick={fetchScoredLeads}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>재계산</span>
          </button>
        </div>
      </div>

      {/* Real-time Notification Banner alert if triggered */}
      {lastNotificationMessage && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="font-bold">{lastNotificationMessage}</span>
          </div>
          <button
            onClick={() => setLastNotificationMessage(null)}
            className="text-xs text-rose-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* D-30 Expiring Media Retention Alert Bar */}
      {expiringMedia.length > 0 && (
        <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs">
              <Clock className="w-4 h-4 text-purple-400 animate-spin" />
              <span>[D-30 리텐션 크론 알림] 계약 만료 예정 매체 ({expiringMedia.length}건)</span>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/30">
              담당 영업사원 재계약 유도 필요
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {expiringMedia.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="p-3 bg-slate-900 border border-purple-500/30 rounded-xl text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-100">{m.line} {m.stationName}</div>
                  <div className="text-[11px] text-slate-400">{m.mediaType} ({m.detailLocation})</div>
                </div>
                <div className="text-right">
                  <span className="bg-purple-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full block">
                    만료 예정
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono mt-0.5 block">
                    {m.contractEndDate} 만료
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Rules Legend & Quick Filter */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-300 flex items-center gap-1">
            <Info className="w-4 h-4 text-indigo-400" />
            리드 스코어링 가중치 규칙:
          </span>

          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
            ✉️ 메일 오픈: <strong className="text-emerald-400">+5점</strong> (다중오픈 +10점)
          </span>

          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
            🖱️ 제안서/PDF 클릭: <strong className="text-rose-400">+20점</strong>
          </span>

          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
            📞 Tier 1 전화보유: <strong className="text-amber-400">+15점</strong>
          </span>

          <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
            ⏳ Time Decay: <strong className="text-indigo-300">3일 50% 차감 / 7일 초기화</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTabFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            전체 보기 ({leadsWithScore.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('surge')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activeTabFilter === 'surge'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>급상승 & Hot 리드 ({hotLeads.length})</span>
          </button>
        </div>
      </div>

      {/* Mobile Column Switcher Tabs */}
      <div className="lg:hidden flex items-center justify-between p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
        <button
          onClick={() => setMobileColumnFilter('all')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mobileColumnFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
          }`}
        >
          전체 ({filteredLeads.length})
        </button>
        <button
          onClick={() => setMobileColumnFilter('hot')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            mobileColumnFilter === 'hot' ? 'bg-rose-600 text-white shadow' : 'text-rose-400'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hot ({hotLeads.length})</span>
        </button>
        <button
          onClick={() => setMobileColumnFilter('warm')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            mobileColumnFilter === 'warm' ? 'bg-amber-600 text-white shadow' : 'text-amber-400'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Warm ({warmLeads.length})</span>
        </button>
        <button
          onClick={() => setMobileColumnFilter('cold')}
          className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            mobileColumnFilter === 'cold' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'
          }`}
        >
          <Snowflake className="w-3.5 h-3.5" />
          <span>Cold ({coldLeads.length})</span>
        </button>
      </div>

      {/* Kanban Board Grid: 3 Columns (Hot, Warm, Cold) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1: Hot Leads (Score 80+) */}
        {(mobileColumnFilter === 'all' || mobileColumnFilter === 'hot') && (
        <div className="bg-slate-950 border border-rose-500/30 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                  <Flame className="w-5 h-5 text-rose-500" />
                </span>
                <div>
                  <h2 className="font-bold text-sm text-rose-200">Hot 리드 (80점 이상)</h2>
                  <p className="text-[11px] text-slate-400">즉시 전화/방문 컨택 필요 (고반응)</p>
                </div>
              </div>

              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black px-2.5 py-0.5 rounded-full">
                {hotLeads.length}개
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {hotLeads.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  현재 Hot 등급의 리드가 없습니다. 시뮬레이터로 클릭 이벤트를 발생시켜 보세요.
                </div>
              ) : (
                hotLeads.map((lead) => (
                  <LeadKanbanCard
                    key={lead.id}
                    lead={lead}
                    temperature="Hot"
                    onSimulateOpen={() => handleSimulatePixelOpen(lead)}
                    onSimulateClick={() => handleSimulateLinkClick(lead)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* COLUMN 2: Warm Leads (Score 50 ~ 79) */}
        {(mobileColumnFilter === 'all' || mobileColumnFilter === 'warm') && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Sun className="w-5 h-5 text-amber-400" />
                </span>
                <div>
                  <h2 className="font-bold text-sm text-amber-200">Warm 리드 (50~79점)</h2>
                  <p className="text-[11px] text-slate-400">맞춤 제안서 및 리포트 재발송 유도</p>
                </div>
              </div>

              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black px-2.5 py-0.5 rounded-full">
                {warmLeads.length}개
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {warmLeads.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Warm 등급의 리드가 없습니다.
                </div>
              ) : (
                warmLeads.map((lead) => (
                  <LeadKanbanCard
                    key={lead.id}
                    lead={lead}
                    temperature="Warm"
                    onSimulateOpen={() => handleSimulatePixelOpen(lead)}
                    onSimulateClick={() => handleSimulateLinkClick(lead)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        )}

        {/* COLUMN 3: Cold Leads (Score < 50) */}
        {(mobileColumnFilter === 'all' || mobileColumnFilter === 'cold') && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-slate-800 text-slate-400 rounded-lg">
                  <Snowflake className="w-5 h-5 text-sky-400" />
                </span>
                <div>
                  <h2 className="font-bold text-sm text-slate-200">Cold 리드 (50점 미만)</h2>
                  <p className="text-[11px] text-slate-400">ARS 오토콜 & 이메일 너처링 대상</p>
                </div>
              </div>

              <span className="bg-slate-800 text-slate-400 border border-slate-700 text-xs font-black px-2.5 py-0.5 rounded-full">
                {coldLeads.length}개
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {coldLeads.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  Cold 등급의 리드가 없습니다.
                </div>
              ) : (
                coldLeads.map((lead) => (
                  <LeadKanbanCard
                    key={lead.id}
                    lead={lead}
                    temperature="Cold"
                    onSimulateOpen={() => handleSimulatePixelOpen(lead)}
                    onSimulateClick={() => handleSimulateLinkClick(lead)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

interface LeadKanbanCardProps {
  lead: Lead;
  temperature: 'Hot' | 'Warm' | 'Cold';
  onSimulateOpen: () => void;
  onSimulateClick: () => void;
}

const LeadKanbanCard: React.FC<LeadKanbanCardProps> = ({
  lead,
  temperature,
  onSimulateOpen,
  onSimulateClick,
}) => {
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const getBorderTheme = () => {
    if (temperature === 'Hot') return 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400';
    if (temperature === 'Warm') return 'bg-amber-950/20 border-amber-500/40 hover:border-amber-300';
    return 'bg-slate-900 border-slate-800 hover:border-slate-700';
  };

  const getBadgeTheme = () => {
    if (temperature === 'Hot') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (temperature === 'Warm') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className={`p-4 rounded-2xl border ${getBorderTheme()} transition-all space-y-3 relative`}>
      {/* Surge Alert Badge */}
      {lead.scoreSurgeAlert && (
        <span className="absolute -top-2.5 -right-2 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 animate-bounce">
          <Zap className="w-3 h-3 fill-current" />
          <span>20pt 급상승!</span>
        </span>
      )}

      {/* Card Header: Company Name & Score Badge */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>{lead.companyName}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{lead.address}</p>
        </div>

        <div className="text-right">
          <span className={`text-xs px-2.5 py-1 rounded-xl font-mono font-black border block ${getBadgeTheme()}`}>
            {lead.scoring}점
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{lead.businessCategory}</span>
        </div>
      </div>

      {/* Engagement Activity Stats */}
      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] grid grid-cols-2 gap-2">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span>오픈: <strong className="text-emerald-400">{lead.openCount || 0}회</strong></span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-300">
          <MousePointerClick className="w-3.5 h-3.5 text-rose-400" />
          <span>클릭: <strong className="text-rose-400">{lead.clickCount || 0}회</strong></span>
        </div>
      </div>

      {/* Nearest station info */}
      <div className="text-[11px] text-indigo-300 flex items-center justify-between">
        <span>🚇 {lead.nearestStation} ({lead.nearestExit})</span>
        <span className="text-emerald-400 font-mono font-bold">📞 {lead.phone}</span>
      </div>

      {/* Interactive Action Simulation Tools */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={onSimulateOpen}
          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 flex items-center justify-center gap-1 transition-colors"
          title="1x1 투명 픽셀 오픈 이벤트 가상 수신"
        >
          <Eye className="w-3 h-3 text-indigo-400" />
          <span>[픽셀] 메일오픈</span>
        </button>

        <button
          onClick={onSimulateClick}
          className="flex-1 py-1.5 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 rounded-lg text-[11px] font-bold border border-rose-500/30 flex items-center justify-center gap-1 transition-colors"
          title="제안서 링크 클릭 이벤트 가상 수신"
        >
          <MousePointerClick className="w-3 h-3 text-rose-400" />
          <span>[링크] 제안서클릭</span>
        </button>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="px-2 py-1.5 bg-slate-950 text-slate-400 hover:text-white rounded-lg text-[10px] font-bold border border-slate-800"
        >
          {showBreakdown ? '닫기' : '점수산식'}
        </button>
      </div>

      {/* Detailed Score Breakdown Popover */}
      {showBreakdown && lead.scoreBreakdown && (
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[10px] space-y-1 text-slate-300 animate-fadeIn">
          <div className="font-bold text-indigo-300 border-b border-slate-800 pb-1 mb-1">
            📊 점수 세부 산식 (Time Decay 적용)
          </div>
          <div className="flex justify-between">
            <span>Tier 1 전화 보유 보너스:</span>
            <strong className="text-amber-400">+{lead.scoreBreakdown.tier1Bonus}pt</strong>
          </div>
          <div className="flex justify-between">
            <span>1개월 신규 매장 보너스:</span>
            <strong className="text-amber-400">+{lead.scoreBreakdown.newStoreBonus}pt</strong>
          </div>
          <div className="flex justify-between">
            <span>메일/리포트 오픈 점수:</span>
            <strong className="text-emerald-400">+{lead.scoreBreakdown.openBonus}pt</strong>
          </div>
          <div className="flex justify-between">
            <span>제안서/PDF 클릭 점수:</span>
            <strong className="text-rose-400">+{lead.scoreBreakdown.clickBonus}pt</strong>
          </div>
          <div className="flex justify-between text-indigo-400">
            <span>Time Decay 차감 (3일/7일):</span>
            <strong className="text-indigo-400">-{lead.scoreBreakdown.timeDecayDeduction}pt</strong>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800 font-bold text-white text-[11px]">
            <span>최종 산출 스코어:</span>
            <span className="text-rose-400 font-mono">{lead.scoreBreakdown.finalScore}pt</span>
          </div>
        </div>
      )}
    </div>
  );
};
