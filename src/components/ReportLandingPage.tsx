import React, { useState, useEffect } from 'react';
import { PersonalizedReport, Media } from '../types';
import {
  Building2,
  TrainTrack,
  TrendingUp,
  AlertTriangle,
  Users,
  Tv,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Send,
  Calendar,
  Lock,
} from 'lucide-react';

interface ReportLandingPageProps {
  token: string;
  onClose?: () => void;
}

export const ReportLandingPage: React.FC<ReportLandingPageProps> = ({ token, onClose }) => {
  const [report, setReport] = useState<PersonalizedReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);
  const [contactName, setContactName] = useState<string>('');
  const [contactNote, setContactNote] = useState<string>('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports/${token}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [token]);

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
  };

  const formatPrice = (val: number) => {
    return (val / 10000).toLocaleString() + '만원';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-300">초개인화 상권 분석 리포트 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100 p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">유효하지 않거나 만료된 리포트입니다</h2>
          <p className="text-xs text-slate-400">
            링크 보안 토큰이 변경되었거나 만료되었습니다. 담당 영업사원에게 다시 문의해 주세요.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Floating Bar for In-App Viewing */}
      {onClose && (
        <div className="bg-slate-900 border-b border-slate-800 p-3 px-6 flex items-center justify-between sticky top-0 z-40 shadow-xl">
          <div className="flex items-center space-x-2 text-xs text-indigo-300 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>[고객용 랜딩 페이지 미리보기] 토큰: <code className="text-amber-300 font-mono">{token}</code></span>
            <span className="text-slate-500 text-[11px]">(열람 횟수: {report.viewsCount}회)</span>
          </div>

          <button
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            대시보드로 돌아가기 ✕
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center space-x-1.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3.5 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>서울시 빅데이터 기반 맞춤형 상권 분석 리포트</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            <span className="text-rose-400">{report.companyName}</span> 대표님을 위한 <br />
            <span className="bg-gradient-to-r from-indigo-300 via-white to-amber-300 bg-clip-text text-transparent">
              {report.nearestStation} 역세권 독점 상권 진단 보고서
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {report.address} | 업종: <strong className="text-slate-200">{report.businessCategory}</strong>
          </p>
        </div>

        {/* SECTION 1: [위기감 조성] 500m 반경 경쟁사 급증 경고 */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs mb-3">
            <AlertTriangle className="w-4 h-4 animate-bounce text-rose-500" />
            <span>STEP 1. 주변 상권 위기 진단 (Risk Factor)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {report.companyName} 주변 500m 내 <br />
            동종 업계 <span className="text-rose-400 underline decoration-rose-500/50">{report.competitorCount500m}개 매장</span>이 치열하게 경쟁 중입니다!
          </h2>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 block mb-1">반경 500m 동종업체 수</span>
              <span className="text-3xl font-black text-rose-400">{report.competitorCount500m}개소</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs text-slate-400 block mb-1">최근 2년 간 신규 인허가 증가율</span>
              <span className="text-2xl font-extrabold text-amber-400">{report.competitorGrowth2Yr}</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-rose-950/20 border border-rose-500/20 p-3.5 rounded-xl">
            ⚠️ <strong>경고:</strong> 신규 인허가 매장이 지속적으로 늘어남에 따라 기존 고객 이탈률이 급증하고 있습니다. 상권 선점을 위한 강력한 신규 고객 유입 브랜딩이 시급합니다.
          </p>
        </div>

        {/* SECTION 2: [기회 제공] 최인접 지하철역 일일 유동인구 */}
        <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs mb-3">
            <TrainTrack className="w-4 h-4 text-indigo-400" />
            <span>STEP 2. 독점 유동인구 기회 (Opportunity)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            최인접 <span className="text-indigo-400 font-black">{report.nearestStation} {report.nearestExit}</span>의 <br />
            일일 <span className="text-emerald-400 font-black">{report.dailyRidership.toLocaleString()}명</span> 유동인구를 매장으로 끌어올 기회!
          </h2>

          <div className="mt-6 bg-slate-950/80 border border-slate-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">최인접 역사</span>
              <span className="text-lg font-bold text-white">{report.nearestStation} ({report.nearestExit})</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">일일 승하차 유동인구</span>
              <span className="text-2xl font-black text-emerald-400">{report.dailyRidership.toLocaleString()} 명/일</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-indigo-950/30 border border-indigo-500/20 p-3.5 rounded-xl">
            💡 <strong>기회:</strong> 매장으로 연결되는 {report.nearestExit} 길목의 지하철 오프라인 옥외광고는 매일 출퇴근하는 직장인 및 지역 주민에게 100% 노출되는 가장 확실한 모객 창구입니다.
          </p>
        </div>

        {/* SECTION 3: [해결책 제안] 독점 광고 매체 스펙 및 맞춤 단가 */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs mb-2">
              <Tv className="w-4 h-4 text-emerald-400" />
              <span>STEP 3. 맞춤형 솔루션 제안 (Solution)</span>
            </div>

            <h2 className="text-xl font-bold text-white">
              {report.nearestStation} {report.nearestExit} 추천 옥외광고 매체
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              대표님 매장 위치와 유동 동선에 가장 최적화된 오프라인 옥외광고 매체 스펙입니다.
            </p>
          </div>

          <div className="space-y-4">
            {report.recommendedMedia.map((media) => (
              <div
                key={media.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all flex flex-col md:flex-row items-center gap-5"
              >
                <img
                  src={media.imageUrl}
                  alt={media.mediaType}
                  className="w-full md:w-44 h-28 object-cover rounded-xl border border-slate-800 shrink-0"
                />

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-0.5 rounded-md font-bold">
                      {media.line} {media.stationName} ({media.exitNumber})
                    </span>

                    <span className="text-emerald-400 font-black text-sm">
                      {formatPrice(media.price)}/월
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base">{media.mediaType} - {media.detailLocation}</h3>
                  <p className="text-xs text-slate-400">규격: {media.size}</p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {report.companyName} 전용 특별 할인가 적용 가능
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Direct Consultation Inquiry Form */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          {inquirySubmitted ? (
            <div className="py-8 space-y-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl w-12 h-12 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">상담 신청이 완료되었습니다!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                담당 전담 영업팀장이 10분 이내로 연락을 드려 맞춤형 보조금 지원 및 스펙 견적서를 안내해 드리겠습니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} className="space-y-4 max-w-md mx-auto">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {report.companyName} 전용 무료 광고 상담 신청
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  선착순 3개 업체에만 제공되는 역사 독점 매체 할인가를 확인해보세요.
                </p>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    신청자 성함 / 직함
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동 대표"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    연락받으실 휴대폰 번호
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={report.mobilePhone}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    문의 내용 (선택)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="희망 시작 시기나 질문사항을 적어주세요."
                    value={contactNote}
                    onChange={(e) => setContactNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>무료 견적서 및 1:1 담당자 상담 신청하기</span>
              </button>

              <p className="text-[10px] text-slate-500">
                🔒 대표님의 개인정보는 상담 완료 후 안전하게 파기됩니다.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
