import React, { useState, useEffect } from 'react';
import { Lead, ArsCallSession, User } from '../types';
import {
  PhoneCall,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Zap,
  Building2,
  Play,
  RefreshCw,
  Sparkles,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

interface ArsCampaignManagerProps {
  leadsList: Lead[];
  currentUser: User;
  onSelectReportToken?: (token: string) => void;
}

export const ArsCampaignManager: React.FC<ArsCampaignManagerProps> = ({
  leadsList,
  currentUser,
  onSelectReportToken,
}) => {
  const [sessions, setSessions] = useState<ArsCallSession[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [customMobile, setCustomMobile] = useState<string>('010-9876-5432');
  const [activeTestSession, setActiveTestSession] = useState<ArsCallSession | null>(null);

  // Filter Tier 1 leads (leads with phone)
  const tier1Leads = leadsList.filter((l) => l.isTier1 && l.phone);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/ars/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSessions();
    const timer = setInterval(fetchSessions, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllTier1 = () => {
    if (selectedLeadIds.length === tier1Leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(tier1Leads.map((l) => l.id));
    }
  };

  const handleTriggerBatchArs = async () => {
    if (selectedLeadIds.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ars/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          salesRepId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedLeadIds([]);
        await fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate Webhook Call for active test session
  const handleSimulateWebhook = async (sessionId: string) => {
    try {
      const res = await fetch('/api/ars/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          dtmfMobilePhone: customMobile,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSessions();
        setActiveTestSession(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-slate-100 min-h-screen space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-rose-950 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              [4단계] 리드 제너레이션 자동화
            </span>
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Twilio ARS & Webhook Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-indigo-400" />
            ARS 음성 오토콜 & 카카오톡/LMS 초개인화 리포트 발송
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            지하철 500m 이내 신규 개업 매장의 유선전화로 자동 발신 ➔ 대표자 휴대폰 DTMF(#) 수집 ➔ 500m 상권 위기감 & 유동인구 기반 초개인화 웹 리포트 LMS 자동 발송
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>실시간 갱신</span>
        </button>
      </div>

      {/* Main Grid: Left Lead Selector, Right ARS Call Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tier 1 Outbound Call Target Selector */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
                  <PhoneCall className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">발신 대상 Tier 1 유선전화</h3>
                  <p className="text-[11px] text-slate-400">전화번호가 검증된 신규 인허가 리드 목록</p>
                </div>
              </div>

              <button
                onClick={handleSelectAllTier1}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 border border-indigo-500/30 px-2.5 py-1 rounded-lg"
              >
                {selectedLeadIds.length === tier1Leads.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            {/* List of Tier 1 Leads */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {tier1Leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);

                return (
                  <div
                    key={lead.id}
                    onClick={() => handleToggleSelectLead(lead.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>{lead.companyName}</span>
                          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">
                            {lead.scoring}점
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                          {lead.address}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-bold block">
                        📞 {lead.phone}
                      </span>
                      <span className="text-[10px] text-indigo-300 font-medium">
                        🚇 {lead.nearestStation} ({lead.nearestExit})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger ARS Outbound Button */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              disabled={selectedLeadIds.length === 0 || loading}
              onClick={handleTriggerBatchArs}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                selectedLeadIds.length > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 animate-bounce" />
              <span>
                선택한 {selectedLeadIds.length}개 매장으로 가상 ARS 음성전화 오토콜 발신
              </span>
            </button>
          </div>
        </div>

        {/* Right: Live ARS Outbound Call Sessions & Webhook Simulator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl">
                  <PhoneCall className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">실시간 ARS 콜 세션 및 DTMF 트래킹</h3>
                  <p className="text-[11px] text-slate-400">음성 송출 ➔ 휴대폰 DTMF(#) 수집 ➔ 카카오톡/LMS 자동 발송 로그</p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                총 {sessions.length}건 실행
              </span>
            </div>

            {/* Sessions Table / List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  아직 실행된 ARS 콜 세션이 없습니다. 좌측에서 매장을 선택 후 [ARS 음성전화 오토콜 발신]을 클릭하세요.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-100">{sess.companyName}</span>
                          <span className="text-xs font-mono text-slate-400">({sess.landlinePhone})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          발신 시각: {new Date(sess.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {sess.status === 'dialing' && (
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            전화 발신중 (음성 멘트 송출)
                          </span>
                        )}
                        {sess.status === 'lms_sent' && (
                          <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            DTMF 수집 완료 (LMS 발송됨)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Audio Voice Prompt Waveform Simulation */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-indigo-300 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Play className="w-3.5 h-3.5 text-indigo-400" />
                        <span>🎙️ 음성 멘트: "무료 상권정보를 받으실 폰 번호를 입력 후 우물정(#)을 누르세요"</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">Twilio Voice API</span>
                    </div>

                    {/* DTMF Capturing & Personalized Report URL Link */}
                    {sess.dtmfMobilePhone ? (
                      <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-bold flex items-center gap-1">
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                            수집된 휴대폰 번호: <span className="text-emerald-400 font-mono">{sess.dtmfMobilePhone}</span>
                          </span>

                          {sess.reportToken && (
                            <button
                              onClick={() => onSelectReportToken && onSelectReportToken(sess.reportToken!)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-md transition-all"
                            >
                              <span>개인화 리포트 보기</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {sess.reportUrl && (
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            URL: {sess.reportUrl}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-amber-400 font-medium">
                          ⏳ 고객이 번호를 입력하는 중입니다...
                        </span>

                        <button
                          onClick={() => setActiveTestSession(sess)}
                          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          수동 DTMF 수집 테스터
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Webhook Modal for DTMF input */}
      {activeTestSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                가상 ARS DTMF(#) 번호 입력 수집
              </h3>
              <button
                onClick={() => setActiveTestSession(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              고객 <strong className="text-white">{activeTestSession.companyName}</strong>의 키패드 입력 DTMF 데이터 시뮬레이션:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  입력된 대표자 휴대폰 번호
                </label>
                <input
                  type="text"
                  value={customMobile}
                  onChange={(e) => setCustomMobile(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => handleSimulateWebhook(activeTestSession.id)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>[웹훅 전송] DTMF 저장 & 카카오톡/LMS 자동 발송</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
