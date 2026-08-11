import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  MapPin,
  Shield,
  UserCheck,
  Database,
  Tv,
  Target,
  Activity,
  Cpu,
  PhoneCall,
  Flame,
  Menu,
  X,
  Layers,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'media' | 'leads' | 'pipeline' | 'ars' | 'kanban' | 'admin' | 'logs' | 'schema';
  setActiveTab: (tab: 'map' | 'media' | 'leads' | 'pipeline' | 'ars' | 'kanban' | 'admin' | 'logs' | 'schema') => void;
  currentUser: User;
  users: User[];
  onUserChange: (user: User) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onUserChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'kanban', label: '스코어링 칸반', icon: Flame, badge: '5단계', color: 'rose' },
    { id: 'map', label: '영업 지도', icon: MapPin, color: 'indigo' },
    { id: 'ars', label: 'ARS 오토콜', icon: PhoneCall, badge: '4단계', color: 'rose' },
    { id: 'media', label: '광고 매체', icon: Tv, color: 'indigo' },
    { id: 'leads', label: '타겟 리드', icon: Target, color: 'indigo' },
    { id: 'pipeline', label: '공공데이터 크론', icon: Cpu, color: 'emerald' },
    { id: 'admin', label: '관리자 제어', icon: Shield, color: 'amber' },
    { id: 'logs', label: '트래킹 로그', icon: Activity, color: 'indigo' },
    { id: 'schema', label: 'DB 설계', icon: Database, color: 'indigo' },
  ] as const;

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Brand & App Title */}
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="bg-gradient-to-tr from-indigo-600 to-rose-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">OOH Sales CRM</span>
                  <span className="bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full">
                    반응형 앱
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden lg:block">
                  지도 기반 B2B 옥외광고 영업 자동화 플랫폼 (모바일·태블릿·PC 최적화)
                </p>
              </div>
            </div>

            {/* Desktop / Large Tablet Nav Bar */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto max-w-2xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`tab-${item.id}`}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] ${
                      isActive
                        ? item.id === 'kanban' || item.id === 'ars'
                          ? 'bg-rose-600 text-white shadow-sm font-bold'
                          : 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right User Selector & Mobile Drawer Button */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-1 flex items-center space-x-1 px-2 text-xs">
                {currentUser.role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                )}
                <select
                  id="user-role-select"
                  value={currentUser.id}
                  onChange={(e) => {
                    const selected = users.find((u) => u.id === e.target.value);
                    if (selected) onUserChange(selected);
                  }}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer py-1"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                      {u.name} ({u.role === 'admin' ? 'Admin' : 'Sales'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Drawer Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 hover:text-white transition-colors"
                aria-label="메뉴 열기"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Medium Screen / Tablet Horizontal Scroll Tabs */}
          <div className="hidden sm:flex lg:hidden items-center space-x-1.5 py-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar scroll-smooth">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all min-h-[40px] ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Slide-down Full Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2 animate-fadeIn">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              전체 메뉴 (모바일/태블릿)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Persistent App Mobile Bottom Navigation Bar (Handheld Phone optimized) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
            activeTab === 'kanban' ? 'text-rose-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Flame className="w-5 h-5 mb-0.5" />
          <span>칸반</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
            activeTab === 'map' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>영업지도</span>
        </button>

        <button
          onClick={() => setActiveTab('ars')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
            activeTab === 'ars' ? 'text-rose-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-0.5" />
          <span>ARS</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
            activeTab === 'media' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Tv className="w-5 h-5 mb-0.5" />
          <span>매체</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
            activeTab === 'leads' ? 'text-indigo-400 font-extrabold' : 'text-slate-400'
          }`}
        >
          <Target className="w-5 h-5 mb-0.5" />
          <span>리드</span>
        </button>
      </div>
    </>
  );
};

