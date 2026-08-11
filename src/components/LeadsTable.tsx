import React, { useState } from 'react';
import { Lead, LeadStatus, Media, User, ActivityNote, AiProposal } from '../types';
import { Target, Plus, Search, Building2, Phone, Calendar, Mail, Zap, TrendingUp, Filter, Sparkles, MessageSquare, Download, FileText } from 'lucide-react';
import { AiProposalModal } from './AiProposalModal';
import { ActivityLogModal } from './ActivityLogModal';

interface LeadsTableProps {
  leadsList: Lead[];
  mediaList: Media[];
  users: User[];
  currentUser: User;
  onAddLead: (newLead: Omit<Lead, 'id'>) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onSendProposal: (lead: Lead, media: Media) => void;
  onAddActivityNote?: (leadId: string, note: Omit<ActivityNote, 'id' | 'createdAt'>) => void;
  onShowToast?: (msg: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leadsList,
  mediaList,
  users,
  currentUser,
  onAddLead,
  onUpdateStatus,
  onSendProposal,
  onAddActivityNote,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTier1Only, setFilterTier1Only] = useState(false);
  const [filterStationOnly, setFilterStationOnly] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProposalLead, setSelectedProposalLead] = useState<Lead | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<string>('');

  // Enhanced Modals State
  const [aiProposalLead, setAiProposalLead] = useState<Lead | null>(null);
  const [activityLogLead, setActivityLogLead] = useState<Lead | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openedAt, setOpenedAt] = useState('2026-08-01');
  const [businessCategory, setBusinessCategory] = useState('의료/성형외과');
  const [estimatedBudget, setEstimatedBudget] = useState<number>(3500000);
  const [scoring, setScoring] = useState<number>(85);

  const filtered = leadsList.filter((l) => {
    const matchesSearch =
      l.companyName.includes(searchTerm) ||
      l.address.includes(searchTerm) ||
      l.phone.includes(searchTerm);
    const matchesCategory = filterCategory === 'all' || l.businessCategory.includes(filterCategory);
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchesScore = l.scoring >= minScore;
    const matchesTier1 = !filterTier1Only || l.isTier1;
    const matchesStation = !filterStationOnly || Boolean(l.nearestStation);
    return matchesSearch && matchesCategory && matchesStatus && matchesScore && matchesTier1 && matchesStation;
  });

  const handleExportCsv = () => {
    const headers = ['ID', '상호명', '업종', '전화번호', '주소', '인근역세권', '일일유동인구', '스코어', '상태', '예상예산(원)'];
    const rows = filtered.map((l) => [
      l.id,
      `"${l.companyName}"`,
      `"${l.businessCategory}"`,
      l.phone || '',
      `"${l.address}"`,
      l.nearestStation ? `"${l.nearestStation} ${l.nearestExit || ''}"` : '',
      l.dailyRidership || 0,
      l.scoring,
      l.status,
      l.estimatedBudget,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ooh_target_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast(`${filtered.length}건의 리드 목록이 CSV 파일로 다운로드되었습니다.`);
  };


  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      companyName,
      address,
      phone,
      openedAt,
      status: 'new',
      scoring: Number(scoring),
      businessCategory,
      estimatedBudget: Number(estimatedBudget),
      salesRepId: currentUser.id,
      lat: 37.4988,
      lng: 127.0271,
    });
    setShowAddModal(false);
    setCompanyName('');
    setAddress('');
    setPhone('');
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-xs font-semibold">신규(New)</span>;
      case 'contacted':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-xs font-semibold">접촉완료</span>;
      case 'negotiating':
        return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-xs font-semibold">협상중</span>;
      case 'converted':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-semibold">계약체결</span>;
      case 'unqualified':
        return <span className="bg-slate-700/50 text-slate-400 border border-slate-600 px-2 py-0.5 rounded text-xs font-semibold">이탈</span>;
    }
  };

  const formatPrice = (val: number) => {
    return (val / 10000).toLocaleString() + '만원';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-rose-400" />
            신규 인허가 타겟 리드 & AI 스코어링 (Target Leads & AI Scoring)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            신규 개업 인허가 정보 수집 데이터 기반역세권 거리, 업종 예산, 마케팅 시급성에 따른 자동 스코어링
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>CSV 엑셀 다운로드</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>신규 타겟 리드 수동 추가</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="업체명, 주소, 연락처 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 font-semibold">상태:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">전체 상태</option>
              <option value="new" className="bg-slate-900">신규 (New)</option>
              <option value="contacted" className="bg-slate-900">접촉완료</option>
              <option value="negotiating" className="bg-slate-900">협상중</option>
              <option value="converted" className="bg-slate-900">계약체결</option>
            </select>
          </div>

          {/* Min Score Filter */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 font-semibold">최소 스코어:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-slate-900">전체 (0점 이상)</option>
              <option value="70" className="bg-slate-900">70점 이상 (우수)</option>
              <option value="85" className="bg-slate-900">85점 이상 (고타겟)</option>
              <option value="90" className="bg-slate-900">90점 이상 (최우선)</option>
            </select>
          </div>

          {/* Tier 1 Filter Toggle */}
          <button
            onClick={() => setFilterTier1Only(!filterTier1Only)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              filterTier1Only
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Tier 1 (전화번호 보유)
          </button>

          {/* 500m Station Filter Toggle */}
          <button
            onClick={() => setFilterStationOnly(!filterStationOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              filterStationOnly
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            500m 역세권
          </button>
        </div>

        <span className="text-slate-400 font-semibold">
          타겟 리드 <strong className="text-rose-400">{filtered.length}</strong>건
        </span>
      </div>

      {/* Leads Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">타겟 업체명 / 주소</th>
                <th className="py-3.5 px-4">Tier 1 / 500m 최인접 지하철역</th>
                <th className="py-3.5 px-4">업종 / 예상 예산</th>
                <th className="py-3.5 px-4">개업일 (인허가)</th>
                <th className="py-3.5 px-4">AI 타겟 스코어</th>
                <th className="py-3.5 px-4">영업 상태</th>
                <th className="py-3.5 px-4 text-right">영업 제안 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{l.companyName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 flex items-center gap-1">
                      <span>{l.address}</span>
                      <span className="text-slate-600">|</span>
                      <span className="text-slate-300 font-mono">{l.phone}</span>
                    </div>
                  </td>

                  {/* Tier 1 & Station Exit Column */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <div>
                        {l.isTier1 ? (
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center space-x-1">
                            <span>★ Tier 1 (전화번호 보유)</span>
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md">
                            Tier 2 (전화 미등록)
                          </span>
                        )}
                      </div>

                      {l.nearestStation ? (
                        <div className="text-[11px] text-indigo-300 font-medium flex items-center space-x-1 mt-0.5">
                          <span>🚇 {l.nearestStation} {l.nearestExit}</span>
                          <span className="text-slate-500">({l.distanceMeters}m)</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500">반경 500m 외역세권</div>
                      )}
                    </div>
                  </td>


                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{l.businessCategory}</div>
                    <div className="text-emerald-400 font-mono font-bold mt-0.5">
                      {formatPrice(l.estimatedBudget)}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    {l.openedAt}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          l.scoring >= 90
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : l.scoring >= 80
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}
                      >
                        {l.scoring}점
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full ${l.scoring >= 90 ? 'bg-rose-500' : 'bg-amber-500'}`}
                          style={{ width: `${l.scoring}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={l.status}
                      onChange={(e) => onUpdateStatus(l.id, e.target.value as LeadStatus)}
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="new">신규 (New)</option>
                      <option value="contacted">접촉완료</option>
                      <option value="negotiating">협상중</option>
                      <option value="converted">계약체결</option>
                      <option value="unqualified">이탈</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => setAiProposalLead(l)}
                        title="AI 맞춤 옥외광고 제안서 생성"
                        className="inline-flex items-center space-x-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">AI 제안서</span>
                      </button>

                      <button
                        onClick={() => setActivityLogLead(l)}
                        title="영업 일지 & 팔로업 작성"
                        className="inline-flex items-center space-x-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">영업일지</span>
                        {l.activities && l.activities.length > 0 && (
                          <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-mono">
                            {l.activities.length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedProposalLead(l);
                          if (mediaList.length > 0) setSelectedMediaId(mediaList[0].id);
                        }}
                        title="자동 메일 수동 발송"
                        className="inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-sm transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden lg:inline">메일 발송</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Proposal Trigger Modal */}
      {selectedProposalLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                맞춤 OOH 광고 제안 메일 자동 발송
              </h3>
              <button onClick={() => setSelectedProposalLead(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 mb-5">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">수신 타겟 업체:</span>
                <strong className="text-sm text-indigo-300 block">{selectedProposalLead.companyName}</strong>
                <span className="text-slate-400">{selectedProposalLead.address} ({selectedProposalLead.phone})</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">제안할 지하철 옥외광고 매체 선택:</label>
                <select
                  value={selectedMediaId}
                  onChange={(e) => setSelectedMediaId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-slate-200"
                >
                  {mediaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.line} {m.stationName}] {m.mediaType} ({m.exitNumber}) - {formatPrice(m.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedProposalLead(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const media = mediaList.find((m) => m.id === selectedMediaId) || mediaList[0];
                  if (media && selectedProposalLead) {
                    onSendProposal(selectedProposalLead, media);
                    setSelectedProposalLead(null);
                  }
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg"
              >
                제안서 발송 및 이력 기록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                신규 인허가 타겟 리드 등록
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">업체명 (상호) *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 강남 시그니처 피부과의원"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">도로명 주소 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 서울특별시 강남구 테헤란로 120 3층"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">전화번호</label>
                  <input
                    type="text"
                    placeholder="02-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">개업/인허가일</label>
                  <input
                    type="date"
                    value={openedAt}
                    onChange={(e) => setOpenedAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">업종 분류</label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  >
                    <option value="의료/성형외과">의료/성형외과</option>
                    <option value="의료/치과">의료/치과</option>
                    <option value="법률/세무">법률/세무</option>
                    <option value="휘트니스/스포츠">휘트니스/스포츠</option>
                    <option value="금융/투자">금융/투자</option>
                    <option value="프랜차이즈/식음료">프랜차이즈/식음료</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">AI 스코어링 점수 (0~100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scoring}
                    onChange={(e) => setScoring(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-md"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* AI Proposal Generator Modal */}
      <AiProposalModal
        isOpen={Boolean(aiProposalLead)}
        onClose={() => setAiProposalLead(null)}
        lead={aiProposalLead}
        medias={mediaList}
        currentUser={currentUser}
        onShowToast={onShowToast}
      />

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={Boolean(activityLogLead)}
        onClose={() => setActivityLogLead(null)}
        lead={activityLogLead}
        currentUser={currentUser}
        onAddActivity={(leadId, note) => {
          if (onAddActivityNote) {
            onAddActivityNote(leadId, note);
          }
          // Update local view
          if (activityLogLead) {
            const updatedActs = [
              ...(activityLogLead.activities || []),
              {
                id: `act-${Date.now()}`,
                ...note,
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              },
            ];
            setActivityLogLead({
              ...activityLogLead,
              activities: updatedActs,
            });
          }
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
