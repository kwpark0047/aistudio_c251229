import React, { useState } from 'react';
import { BatchPipelineStatus, Lead } from '../types';
import { calculateHaversineDistance, SEOUL_SUBWAY_STATION_EXITS } from '../services/spatialUtils';
import {
  Clock,
  Play,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Train,
  Database,
  Terminal,
  RefreshCw,
  Cpu,
  Layers,
  Search,
  Sparkles,
} from 'lucide-react';

interface PipelineDashboardProps {
  status: BatchPipelineStatus;
  leadsList: Lead[];
  onTriggerPipeline: () => Promise<void>;
}

export const PipelineDashboard: React.FC<PipelineDashboardProps> = ({
  status,
  leadsList,
  onTriggerPipeline,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [calcLat, setCalcLat] = useState('37.4988');
  const [calcLng, setCalcLng] = useState('127.0271');
  const [calcResult, setCalcResult] = useState<string | null>(null);

  const tier1Count = leadsList.filter((l) => l.isTier1).length;
  const nearestMatchedCount = leadsList.filter((l) => l.nearestStation).length;

  const handleManualRun = async () => {
    setIsProcessing(true);
    try {
      await onTriggerPipeline();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestHaversine = () => {
    const lat = parseFloat(calcLat);
    const lng = parseFloat(calcLng);
    if (isNaN(lat) || isNaN(lng)) return;

    let nearest = SEOUL_SUBWAY_STATION_EXITS[0];
    let minDist = Infinity;

    for (const exit of SEOUL_SUBWAY_STATION_EXITS) {
      const d = calculateHaversineDistance(lat, lng, exit.lat, exit.lng);
      if (d < minDist) {
        minDist = d;
        nearest = exit;
      }
    }

    setCalcResult(
      `🎯 최인접 역: [${nearest.stationName} ${nearest.exitNumber}] | 직선 거리: ${minDist}m | 일일 유동인구: ${nearest.dailyRidership.toLocaleString()}명/일 (${minDist <= 500 ? '✅ 500m 역세권 포함' : '❌ 500m 초과'})`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-start space-x-4">
          <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 p-3 rounded-2xl">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                공공데이터 자동 수집 & 백그라운드 파이프라인 엔진
              </h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>[2단계] 크론배치 가동 중</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              서울시 열린데이터 광장 (상가업소 인허가) + 서울교통공사 유동인구 API 수집 · Tier 1 전화번호 필터링 · Haversine 500m 공간연산 캐싱
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleManualRun}
          disabled={isProcessing}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 shrink-0"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>배치 파이프라인 연산 중...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>새벽 2시 크론배치 즉시 실행 (Manual Run)</span>
            </>
          )}
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>수집된 인허가 업체 (2년)</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{leadsList.length}개</span>
            <span className="text-xs font-semibold text-emerald-400">100% 지오코딩</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Tier 1 (전화번호 보유)</span>
            <PhoneCall className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">{tier1Count}개</span>
            <span className="text-xs font-semibold text-slate-400">
              우선 타겟 ({Math.round((tier1Count / (leadsList.length || 1)) * 100)}%)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${Math.round((tier1Count / (leadsList.length || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>500m 반경 역세권 매칭</span>
            <Train className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400">{nearestMatchedCount}개</span>
            <span className="text-xs font-semibold text-slate-400">
              역세권 비율 ({Math.round((nearestMatchedCount / (leadsList.length || 1)) * 100)}%)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${Math.round((nearestMatchedCount / (leadsList.length || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>크론 주기 & Uptime</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3">
            <span className="text-sm font-bold text-white font-mono block">0 2 * * *</span>
            <span className="text-xs text-slate-400 block mt-0.5">매일 새벽 02:00:00 AM 정기실행</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            최근 실행: {new Date(status.lastRunAt).toLocaleTimeString('ko-KR')}
          </div>
        </div>
      </div>

      {/* Main Grid: Haversine Calculator + ENV API Status & Console Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spatial Calculation & API Key Config Status */}
        <div className="space-y-6">
          {/* Spatial Math Sandbox */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Haversine 500m 거리 연산 검증기</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              타겟 업소 좌표(Lat/Lng)와 서울교통공사 지하철 출구 좌표 간의 구면 거리를 실시간으로 계산합니다.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">위도 (Latitude):</label>
                <input
                  type="text"
                  value={calcLat}
                  onChange={(e) => setCalcLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">경도 (Longitude):</label>
                <input
                  type="text"
                  value={calcLng}
                  onChange={(e) => setCalcLng(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={handleTestHaversine}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
              >
                반경 500m 최인접 지하철역 계산
              </button>

              {calcResult && (
                <div className="mt-3 p-3 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs font-mono text-indigo-300 leading-relaxed">
                  {calcResult}
                </div>
              )}
            </div>
          </div>

          {/* API Configuration Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-3">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>공공데이터 API 환경변수(ENV) 연동 현황</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">SEOUL_OPEN_DATA_API_KEY</div>
                  <div className="text-[10px] text-slate-500">서울시 열린데이터 광장 (인허가 API)</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full">
                  연동 준비 완료
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">SEOUL_SUBWAY_API_KEY</div>
                  <div className="text-[10px] text-slate-500">서울교통공사 지하철역 좌표/유동인구</div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full">
                  연동 준비 완료
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">GOOGLE_MAPS_PLATFORM_KEY</div>
                  <div className="text-[10px] text-slate-500">지오코딩 & 구글 맵스 API</div>
                </div>
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full">
                  자동 폴백 가동
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Logs Stream Console */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>배치 파이프라인 실시간 로그 (Live Audit Terminal)</span>
            </h3>
            <span className="font-mono text-[11px] text-slate-500">Log Uptime: Active</span>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-emerald-400/90 overflow-y-auto space-y-2">
            {status.logs.map((log, idx) => (
              <div key={idx} className="hover:bg-slate-900/50 p-1 rounded transition-colors">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
