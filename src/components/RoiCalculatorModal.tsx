import React, { useState } from 'react';
import {
  Calculator,
  X,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  PieChart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface RoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const RoiCalculatorModal: React.FC<RoiCalculatorModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState(3000000); // 300만원
  const [dailyRidership, setDailyRidership] = useState(85000); // 8.5만명
  const [mediaCount, setMediaCount] = useState(2); // 2개 매체
  const [conversionRate, setConversionRate] = useState(0.15); // 0.15% 방문전환
  const [customerLtv, setCustomerLtv] = useState(250000); // 객단가 25만원

  if (!isOpen) return null;

  // Calculation Logic
  const totalMonthlyExposures = dailyRidership * 30 * mediaCount * 0.4; // 40% 시선 집중율
  const cpm = (monthlyBudget / totalMonthlyExposures) * 1000; // 1,000회 노출당 비용
  const estimatedNewCustomers = Math.round((totalMonthlyExposures * (conversionRate / 100)));
  const estimatedRevenue = estimatedNewCustomers * customerLtv;
  const netProfit = estimatedRevenue - monthlyBudget;
  const roi = Math.round((netProfit / monthlyBudget) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 border-b border-slate-800 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Calculator className="w-3 h-3 text-emerald-400" /> OOH ROI Estimator
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
                영업 지원 도구
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>옥외광고 마케팅 ROI & 매출 예측 계산기</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              예산과 인근 지하철역/전광판 유동인구를 입력하여 추정 노출수 및 기대 매출 수치를 시뮬레이션합니다.
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
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">월 예상 광고 예산 (원)</label>
              <input
                type="number"
                step={500000}
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">인근 역 일일 유동인구 (명)</label>
              <input
                type="number"
                step={5000}
                value={dailyRidership}
                onChange={(e) => setDailyRidership(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-400 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">집행 매체 수 (개)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={mediaCount}
                onChange={(e) => setMediaCount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">고객 1인당 평균 객단가 (LTV 원)</label>
              <input
                type="number"
                step={10000}
                value={customerLtv}
                onChange={(e) => setCustomerLtv(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Results Summary Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-extrabold text-white flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>시뮬레이션 분석 리포트</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">ROI: +{roi}%</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">월간 추정 노출수</span>
                <span className="font-extrabold text-white text-sm">{Math.round(totalMonthlyExposures).toLocaleString()}회</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">CPM (1천회 노출단가)</span>
                <span className="font-extrabold text-indigo-300 text-sm">{Math.round(cpm).toLocaleString()}원</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">추정 신규 유입고객</span>
                <span className="font-extrabold text-amber-300 text-sm">{estimatedNewCustomers.toLocaleString()}명/월</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">추정 창출 매출액</span>
                <span className="font-extrabold text-emerald-400 text-sm">{estimatedRevenue.toLocaleString()}원</span>
              </div>
            </div>

            {/* Insight text */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong>영업 셀링 포인트 브리핑:</strong>
                <p className="mt-0.5 text-[11px] text-emerald-200/90 leading-relaxed">
                  "월 {monthlyBudget.toLocaleString()}원 투입 시, 지하철역 동선에서 약 {Math.round(totalMonthlyExposures).toLocaleString()}회의 타깃 노출이 일어납니다. 
                  CPM 단가는 약 {Math.round(cpm).toLocaleString()}원으로 온라인 키워드 광고 대비 절반 이하 수준이며, 약 {estimatedNewCustomers}명의 신규 객 유치로 {estimatedRevenue.toLocaleString()}원의 추가 매출이 예상됩니다."
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const text = `[OOH ROI 시뮬레이션 결과]
- 월 집행 예산: ${monthlyBudget.toLocaleString()}원
- 월간 노출수: ${Math.round(totalMonthlyExposures).toLocaleString()}회 (CPM: ${Math.round(cpm).toLocaleString()}원)
- 예상 신규 고객: ${estimatedNewCustomers}명
- 예상 추가 매출: ${estimatedRevenue.toLocaleString()}원 (ROI: +${roi}%)`;
              navigator.clipboard.writeText(text);
              if (onShowToast) onShowToast('ROI 계산 결과가 클립보드에 복사되었습니다.');
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>시뮬레이션 요약 결과 복사하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
