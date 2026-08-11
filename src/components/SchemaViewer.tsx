import React, { useState } from 'react';
import { SQL_SCHEMA, SCHEMA_DOCS } from '../db/schemaSql';
import { Database, Code2, Copy, Check, Table, ShieldCheck, KeyRound, ArrowRightLeft, Layers } from 'lucide-react';

export const SchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>('all');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Stage Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-2.5 py-1 rounded-md font-bold">
                [1단계] 완료
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                PostgreSQL / Supabase DB 스키마 설계 및 데이터 모델링
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
              B2B 옥외광고 영업 CRM에 최적화된 4개 핵심 테이블 (Users, Media, Leads, Activity Logs)과 
              ENUM 타입, 외래키 관계, 인덱스 및 Row Level Security (RLS) 접근 제어 정책이 적용된 가용 DDL 코드입니다.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all border border-indigo-400/30 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL 복사됨!' : '전체 DDL SQL 복사하기'}</span>
          </button>
        </div>
      </div>

      {/* ERD Visual Relationship Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-100">테이블 연관관계 및 데이터 흐름 (ERD Architecture)</h3>
          </div>
          <span className="text-xs text-slate-400">PostgreSQL Relational FK Flow</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* User Table Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                <Table className="w-3.5 h-3.5" /> users
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.5 rounded">사용자/권한</span>
            </div>
            <ul className="text-xs space-y-1 text-slate-300">
              <li><code className="text-amber-400">id</code> (PK)</li>
              <li>role (Admin / Sales)</li>
              <li>name, email</li>
            </ul>
          </div>

          {/* Media Table Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                <Table className="w-3.5 h-3.5" /> media
              </span>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded">광고 매체</span>
            </div>
            <ul className="text-xs space-y-1 text-slate-300">
              <li><code className="text-amber-400">id</code> (PK)</li>
              <li>line, station, exit</li>
              <li>type, price, status</li>
              <li><code className="text-cyan-400">sales_rep_id</code> (FK)</li>
            </ul>
          </div>

          {/* Leads Table Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Table className="w-3.5 h-3.5" /> leads
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">타겟 리드</span>
            </div>
            <ul className="text-xs space-y-1 text-slate-300">
              <li><code className="text-amber-400">id</code> (PK)</li>
              <li>company_name, opened_at</li>
              <li>scoring (0~100)</li>
              <li><code className="text-cyan-400">sales_rep_id</code> (FK)</li>
            </ul>
          </div>

          {/* Logs Table Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Table className="w-3.5 h-3.5" /> activity_logs
              </span>
              <span className="text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded">트래킹 이력</span>
            </div>
            <ul className="text-xs space-y-1 text-slate-300">
              <li><code className="text-amber-400">id</code> (PK)</li>
              <li>type (mail/ars/open/click)</li>
              <li><code className="text-cyan-400">lead_id</code> (FK)</li>
              <li><code className="text-cyan-400">media_id</code> (FK)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Schema Table Field Details & SQL Code Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Table Documentation Inspector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              테이블 명세서 (Table Specifications)
            </h3>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none"
            >
              <option value="all">전체 테이블 명세</option>
              <option value="users">users 테이블</option>
              <option value="media">media 테이블</option>
              <option value="leads">leads 테이블</option>
              <option value="activity_logs">activity_logs 테이블</option>
            </select>
          </div>

          <div className="space-y-6 overflow-y-auto max-h-[500px] pr-1">
            {SCHEMA_DOCS.filter((d) => selectedTable === 'all' || d.table === selectedTable).map((doc) => (
              <div key={doc.table} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    CREATE TABLE {doc.table}
                  </span>
                  <span className="text-[11px] text-slate-400">{doc.description}</span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2 font-semibold">컬럼명 (Column)</th>
                      <th className="py-2 font-semibold">데이터 타입</th>
                      <th className="py-2 font-semibold">설명 및 제약조건</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {doc.fields.map((f) => (
                      <tr key={f.name}>
                        <td className="py-2 font-mono text-amber-300 font-medium">{f.name}</td>
                        <td className="py-2 font-mono text-indigo-300 text-[11px]">{f.type}</td>
                        <td className="py-2 text-slate-400">{f.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {/* DDL SQL Code View */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              PostgreSQL DDL SQL Script
            </h3>
            <span className="text-xs text-slate-400 font-mono">schema.sql</span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed">
            <pre>{SQL_SCHEMA}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
