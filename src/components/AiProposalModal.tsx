import React, { useState, useEffect } from 'react';
import { Lead, Media, AiProposal, User } from '../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  Send,
  Copy,
  ExternalLink,
  Building,
  TrendingUp,
  MapPin,
  Layers,
  FileText,
  DollarSign,
  Share2,
  Users,
  Check,
} from 'lucide-react';

interface AiProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  medias: Media[];
  currentUser: User;
  onProposalCreated?: (proposal: AiProposal) => void;
  onShowToast?: (msg: string) => void;
}

export const AiProposalModal: React.FC<AiProposalModalProps> = ({
  isOpen,
  onClose,
  lead,
  medias,
  currentUser,
  onProposalCreated,
  onShowToast,
}) => {
  const [generating, setGenerating] = useState(false);
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  useEffect(() => {
    if (lead && isOpen) {
      // Find candidate medias near lead's station or matched
      const matched = medias.filter((m) => {
        if (lead.nearestStation && m.stationName.includes(lead.nearestStation.replace('역', ''))) {
          return true;
        }
        return m.status === 'available';
      });

      const chosen = matched.length > 0 ? matched.slice(0, 2) : medias.slice(0, 2);
      setSelectedMediaIds(chosen.map((m) => m.id));
      setProposal(null);
    }
  }, [lead, isOpen, medias]);

  if (!isOpen || !lead) return null;

  // Selected media objects
  const selectedMedias = medias.filter((m) => selectedMediaIds.includes(m.id));
  const totalMonthlyPrice = selectedMedias.reduce((sum, m) => sum + m.price, 0);

  // Generate AI Pitch Strategy based on category
  const generatePitch = (category: string, company: string, station: string) => {
    if (category.includes('성형') || category.includes('의료') || category.includes('피부')) {
      return `[${company} X ${station || '역세권'} OOH 전광판 솔루션]
1. 타깃 분석: 출퇴근 유동인구 중 2040 직장인 및 인근 거주자 대상 고신뢰도 의료 브랜드 인지도 극대화
2. 매체 강점: ${station || '주요 역'} 동선에 위치하여 시선 집중도 87% 이상의 초대형 LED 와이드칼라 노출
3. 스페셜 오퍼: 신규 개원은 전광판+지하철 타임 슬롯 15% 패키지 프로모션 제공`;
    } else if (category.includes('법률') || category.includes('세무')) {
      return `[${company} 프라이빗 선점형 옥외광고 제안]
1. 타깃 분석: 법원/주요 상권 이동 인구 대상 압도적 전문성과 신뢰감 각인
2. 매체 강점: 일일 유동인구 ${(lead.dailyRidership || 85000).toLocaleString()}명의 프리미엄 스크린도어 및 출구 조명
3. 브랜드 효과: 브랜딩 노출 지속 시 방문 전환율 3.4배 상승 효과 확인`;
    } else {
      return `[${company} 신규 오픈 하이팩트 옥외 마케팅]
1. 타깃 분석: ${lead.address.split(' ')[1] || '지역'} 상권 중심 출구 및 대로변 매체 집중 배치
2. 매체 강점: 반경 500m 이내 타깃 고객 대상 반복 노출을 통한 매장 방문 유도
3. 가성비: 온라인 SNS 광고 대비 1,000회 노출당 비용(CPM) 65% 절감`;
    }
  };

  const handleGenerateProposal = () => {
    setGenerating(true);
    setTimeout(() => {
      const station = lead.nearestStation || '강남역';
      const pitch = generatePitch(lead.businessCategory, lead.companyName, station);
      const landingUrl = `${window.location.origin}/report/${lead.id}`;
      const expExposures = Math.round((lead.dailyRidership || 75000) * 0.42 * selectedMedias.length);

      const draft = `안녕하세요 ${lead.companyName} 원장님/대표님!
OOH 옥외광고 전문 미디어 컨설턴트 ${currentUser.name}입니다.

최근 인허가 및 신규 개업 축하드립니다! 🎉
원장님의 매장이 위치한 ${lead.address.split(' ').slice(0, 3).join(' ')} 인근, 일일 유동인구 ${(lead.dailyRidership || 80000).toLocaleString()}명의 ${station} 핵심 동선 광고 매체를 선점 제안드립니다.

▼ 맞춤 옥외광고 제안서 및 실물 3D 시뮬레이션 보기:
${landingUrl}

추가 문의사항이나 현장 미팅은 언제든 편하게 답장 주시기 바랍니다!
감사합니다.`;

      const newProp: AiProposal = {
        id: `prop-${Date.now()}`,
        leadId: lead.id,
        companyName: lead.companyName,
        targetCategory: lead.businessCategory,
        recommendedMediaIds: selectedMedias.map((m) => m.id),
        recommendedMediaNames: selectedMedias.map((m) => `${m.stationName} ${m.exitNumber} ${m.mediaType}`),
        totalMonthlyPrice: totalMonthlyPrice || 3500000,
        expectedDailyExposures: expExposures || 38000,
        keyCopywriterPitch: pitch,
        proposalLandingUrl: landingUrl,
        messageDraft: draft,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      setProposal(newProp);
      setGenerating(false);
      if (onProposalCreated) onProposalCreated(newProp);
      if (onShowToast) onShowToast('AI 맞춤 옥외광고 제안서가 성공적으로 생성되었습니다!');
    }, 900);
  };

  const handleCopyUrl = () => {
    if (!proposal) return;
    navigator.clipboard.writeText(proposal.proposalLandingUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    if (onShowToast) onShowToast('제안서 전용 URL이 클립보드에 복사되었습니다.');
  };

  const handleCopyMessage = () => {
    if (!proposal) return;
    navigator.clipboard.writeText(proposal.messageDraft);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    if (onShowToast) onShowToast('알림톡/문자 전송 초안 메시지가 복사되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 p-5 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> AI Proposal Engine
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                {lead.businessCategory}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>{lead.companyName} 맞춤 옥외광고 AI 제안서 생성기</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              입지 분석, 유동인구 데이터 및 최적 인근 매체를 조합하여 원클릭 제안서를 제작합니다.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Lead Overview */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">타깃 상호명</span>
              <span className="font-bold text-white truncate block">{lead.companyName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">인근 역세권</span>
              <span className="font-bold text-indigo-400 block">{lead.nearestStation || '역세권 분석중'} ({lead.nearestExit || '출구'})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">일일 유동인구</span>
              <span className="font-bold text-emerald-400 block">{(lead.dailyRidership || 85000).toLocaleString()}명/일</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">예상 마케팅 예산</span>
              <span className="font-bold text-amber-400 block">{(lead.estimatedBudget || 3000000).toLocaleString()}원/월</span>
            </div>
          </div>

          {/* Media Selection Checklist */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>추천 옥외 매체 선택 (조합 구성)</span>
              </span>
              <span className="text-[11px] text-slate-400">선택된 매체: {selectedMedias.length}개</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {medias.slice(0, 6).map((m) => {
                const isSelected = selectedMediaIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMediaIds(selectedMediaIds.filter((id) => id !== m.id));
                      } else {
                        setSelectedMediaIds([...selectedMediaIds, m.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-200 truncate">
                        {m.line} {m.stationName} {m.exitNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {m.mediaType} · 월 {m.price.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          {!proposal && (
            <button
              onClick={handleGenerateProposal}
              disabled={generating || selectedMediaIds.length === 0}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {generating ? (
                <span>AI가 입지 및 매체 매칭 분석 중...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI 맞춤 제안서 & 카피 라이팅 생성하기</span>
                </>
              )}
            </button>
          )}

          {/* Proposal Result View */}
          {proposal && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-extrabold text-sm text-white">생성된 OOH 제안 솔루션 요약</span>
                  </div>
                  <span className="text-[10px] text-slate-400">생성일: {proposal.createdAt}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">총 추천 매체 수</span>
                    <span className="font-bold text-indigo-300 text-sm">{proposal.recommendedMediaNames.length}개 매체 패키지</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">월 종합 소요 견적</span>
                    <span className="font-bold text-emerald-300 text-sm">{proposal.totalMonthlyPrice.toLocaleString()} 원</span>
                  </div>
                </div>

                {/* Key Pitch Text */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>AI 맞춤 셀링 세일즈 카피 (Selling Pitch)</span>
                  </label>
                  <pre className="bg-slate-900 p-3 rounded-xl text-xs text-slate-300 whitespace-pre-wrap font-sans border border-slate-800 leading-relaxed">
                    {proposal.keyCopywriterPitch}
                  </pre>
                </div>

                {/* Proposal URL & Message Draft */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-slate-400 block">반응형 제안서 Landing URL</span>
                      <a
                        href={`/report/${lead.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline font-bold truncate block flex items-center gap-1"
                      >
                        <span>{proposal.proposalLandingUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                    <button
                      onClick={handleCopyUrl}
                      className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1.5 rounded-lg font-bold shrink-0 transition-colors flex items-center gap-1"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? '복사됨' : 'URL 복사'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      고객 전송용 알림톡 / 문자 메시지 초안
                    </label>
                    <textarea
                      readOnly
                      value={proposal.messageDraft}
                      rows={5}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none font-mono"
                    />
                    <div className="flex justify-end mt-1.5">
                      <button
                        onClick={handleCopyMessage}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copiedText ? '문구 복사 완료' : '전송 문구 복사'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleGenerateProposal();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
                >
                  재생성하기
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  확인 및 모달 닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
