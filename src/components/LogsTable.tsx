import React, { useState } from 'react';
import { ActivityLog, LogType } from '../types';
import { Activity, Mail, PhoneCall, Eye, MousePointer, RefreshCw, Search, Filter } from 'lucide-react';

interface LogsTableProps {
  logsList: ActivityLog[];
}

export const LogsTable: React.FC<LogsTableProps> = ({ logsList }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filtered = logsList.filter((log) => {
    const matchesSearch =
      (log.leadName || '').includes(searchTerm) ||
      log.description.includes(searchTerm) ||
      (log.salesRepName || '').includes(searchTerm);
    const matchesType = selectedType === 'all' || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getLogTypeBadge = (type: LogType) => {
    switch (type) {
      case 'mail':
        return (
          <span className="inline-flex items-center space-x-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>메일 발송</span>
          </span>
        );
      case 'ars':
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>ARS Call</span>
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Eye className="w-3.5 h-3.5" />
            <span>이메일 오픈</span>
          </span>
        );
      case 'click':
        return (
          <span className="inline-flex items-center space-x-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <MousePointer className="w-3.5 h-3.5" />
            <span>링크 클릭</span>
          </span>
        );
      case 'status_change':
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>상태 변경</span>
          </span>
        );
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          자동화 트래킹 & 영업 활동 이력 로그 (Activity Tracking Logs)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          메일발송, ARS 콜봇, 수신확인 오픈/클릭 이벤트 및 리드 상태 변경 실시간 감사 로그
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="타겟 업체명, 로그 내용, 영업사원 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Log Type Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 font-semibold">이력 종류:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">전체 이력</option>
              <option value="mail" className="bg-slate-900">메일 발송</option>
              <option value="open" className="bg-slate-900">이메일 오픈</option>
              <option value="click" className="bg-slate-900">링크 클릭</option>
              <option value="ars" className="bg-slate-900">ARS Call</option>
              <option value="status_change" className="bg-slate-900">상태 변경</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-semibold">
          총 <strong className="text-indigo-400">{filtered.length}</strong>건 기록
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">타임스탬프</th>
                <th className="py-3.5 px-4">이력 종류</th>
                <th className="py-3.5 px-4">타겟 리드 (업체명)</th>
                <th className="py-3.5 px-4">로그 설명</th>
                <th className="py-3.5 px-4">실행 영업사원</th>
                <th className="py-3.5 px-4 text-right">상세 메타데이터</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {formatTimestamp(log.timestamp)}
                  </td>

                  <td className="py-3.5 px-4">
                    {getLogTypeBadge(log.type)}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    {log.leadName || log.leadId}
                  </td>

                  <td className="py-3.5 px-4 text-slate-200 max-w-md">
                    {log.description}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">
                      {log.salesRepName || '자동화 시스템'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {log.details && (
                      <span className="font-mono text-[11px] bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800 inline-block max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
