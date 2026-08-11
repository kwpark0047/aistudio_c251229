import React, { useState } from 'react';
import { Lead, ActivityNote, ActivityType, User } from '../types';
import {
  PhoneCall,
  Users,
  Mail,
  FileSpreadsheet,
  CheckCircle,
  FileText,
  Clock,
  Plus,
  X,
  Calendar,
  User as UserIcon,
  Send,
  MessageSquare,
} from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  currentUser: User;
  onAddActivity: (leadId: string, activity: Omit<ActivityNote, 'id' | 'createdAt'>) => void;
  onShowToast?: (msg: string) => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  lead,
  currentUser,
  onAddActivity,
  onShowToast,
}) => {
  const [type, setType] = useState<ActivityType>('call');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !lead) return null;

  const activities = lead.activities || [];

  const getActivityIcon = (actType: ActivityType) => {
    switch (actType) {
      case 'call':
        return <PhoneCall className="w-4 h-4 text-blue-400" />;
      case 'meeting':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'proposal':
        return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
      case 'contract':
        return <CheckCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      onAddActivity(lead.id, {
        leadId: lead.id,
        type,
        title: title.trim(),
        content: content.trim(),
        salesRepId: currentUser.id,
        salesRepName: currentUser.name,
        nextFollowUpDate: nextFollowUpDate || undefined,
      });

      setTitle('');
      setContent('');
      setNextFollowUpDate('');
      setSubmitting(false);

      if (onShowToast) onShowToast('영업 활동 일지가 등록되었습니다.');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                영업 이력 & 타임라인
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                {lead.businessCategory}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1.5">
              {lead.companyName} 영업 커뮤니케이션 일지
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              전화 통화, 미팅 내용, 제안 현황 및 차기 일정(Follow-up)을 작성하고 관리합니다.
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
          {/* Create New Activity Form */}
          <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>새 영업 활동 작성</span>
              </span>
              <span className="text-[11px] text-slate-400">작성자: {currentUser.name} ({currentUser.department})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setType('call')}
                className={`py-2 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                  type === 'call'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>전화 통화</span>
              </button>

              <button
                type="button"
                onClick={() => setType('meeting')}
                className={`py-2 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                  type === 'meeting'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>대면 미팅</span>
              </button>

              <button
                type="button"
                onClick={() => setType('email')}
                className={`py-2 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                  type === 'email'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>이메일</span>
              </button>

              <button
                type="button"
                onClick={() => setType('proposal')}
                className={`py-2 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                  type === 'proposal'
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>제안서</span>
              </button>

              <button
                type="button"
                onClick={() => setType('contract')}
                className={`py-2 px-2 rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                  type === 'contract'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>계약 체결</span>
              </button>
            </div>

            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="활동 요약 제목 (예: 2호선 전광판 관련 1차 전화상담 완료)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="상세 협의 내용 및 광고주 반응 기록..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">다음 팔로업 예정일:</span>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? '저장 중...' : '활동 등록'}</span>
              </button>
            </div>
          </form>

          {/* Activity Timeline List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>누적 영업 활동 타임라인 ({activities.length}건)</span>
            </h3>

            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                등록된 영업 활동이 없습니다. 위 서식에서 첫 미팅 또는 통화 내역을 등록하세요.
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs transition-colors hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                          {getActivityIcon(act.type)}
                        </div>
                        <span className="font-bold text-white">{act.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {act.createdAt}
                      </span>
                    </div>

                    <p className="text-slate-300 pl-8 leading-relaxed font-sans">{act.content}</p>

                    <div className="pl-8 pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3 text-indigo-400" /> 담당자: {act.salesRepName}
                      </span>
                      {act.nextFollowUpDate && (
                        <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          다음 팔로업: {act.nextFollowUpDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
