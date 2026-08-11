import React, { useState } from 'react';
import { User, UserRole } from '../types';
import {
  LogIn,
  UserPlus,
  Shield,
  UserCheck,
  Mail,
  Lock,
  User as UserIcon,
  Building,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  users: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupRole, setSignupRole] = useState<UserRole>('sales');
  const [signupDepartment, setSignupDepartment] = useState('영업 1팀');
  const [signupPhone, setSignupPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Reset Password Form
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, text: '약함 (6자 이상 권장)', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: '보통', color: 'bg-amber-500' };
    if (score >= 3) return { score: 3, text: '안전함 (강력)', color: 'bg-emerald-500' };
    return { score: 1, text: '약함', color: 'bg-rose-500' };
  };

  const strength = getPasswordStrength(signupPassword);

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (demoUser: User) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(demoUser, `token-${demoUser.id}-${Date.now()}`);
      setLoading(false);
      onClose();
    }, 400);
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }

      setSuccessMsg('로그인되었습니다!');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || '로그인 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signupName.trim()) {
      setErrorMsg('이름을 입력해주세요.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    if (signupPassword.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (signupRole === 'admin' && !adminCode) {
      setErrorMsg('관리자 가입을 위한 보안코드를 입력해주세요. (기본코드: ooh2026)');
      return;
    }
    if (!termsAgreed) {
      setErrorMsg('이용약관 및 개인정보 처리방침에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          role: signupRole,
          department: signupDepartment,
          phone: signupPhone,
          adminCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '회원가입에 실패했습니다.');
      }

      setSuccessMsg('회원가입이 완료되었습니다! 자동으로 로그인합니다.');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Password Reset
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMsg('가입된 이메일 주소를 입력해주세요.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setErrorMsg('재설정할 비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, newPassword: resetNewPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '비밀번호 재설정에 실패했습니다.');
      }

      setResetDone(true);
      setSuccessMsg(data.message);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative text-slate-100 my-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-rose-950 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between relative">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                OOH CRM 인증센터
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Supabase DB 연동
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              {mode === 'login' && <LogIn className="w-5 h-5 text-indigo-400" />}
              {mode === 'signup' && <UserPlus className="w-5 h-5 text-rose-400" />}
              {mode === 'reset' && <KeyRound className="w-5 h-5 text-amber-400" />}
              <span>
                {mode === 'login' && '영업 CRM 로그인'}
                {mode === 'signup' && '신규 회원가입'}
                {mode === 'reset' && '비밀번호 재설정'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'login' && '옥외광고 통합 영업 관리 플랫폼에 접속하세요.'}
              {mode === 'signup' && '새로운 영업 계정을 생성하고 리드 관리를 시작하세요.'}
              {mode === 'reset' && '가입된 이메일로 비밀번호를 안전하게 재설정합니다.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950 text-xs font-bold text-center">
          <button
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 transition-colors ${
              mode === 'login'
                ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 transition-colors ${
              mode === 'signup'
                ? 'bg-slate-900 text-rose-400 border-b-2 border-rose-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            회원가입
          </button>
          <button
            onClick={() => {
              setMode('reset');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-3 transition-colors ${
              mode === 'reset'
                ? 'bg-slate-900 text-amber-400 border-b-2 border-amber-500 font-extrabold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            비밀번호 찾기
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">이메일 주소</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@oohcrm.co.kr 또는 본인 이메일"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-300">비밀번호</label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호 입력 (초기: admin1234! / sales1234!)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 min-h-[44px]"
              >
                {loading ? (
                  <span>인증 확인 중...</span>
                ) : (
                  <>
                    <span>로그인하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Accounts for fast testing */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>원클릭 데모 계정 체험 (테스트용)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {users.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all flex items-center space-x-2 text-xs group"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-white shrink-0 transition-colors">
                        {u.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:text-white" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-200 truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {u.department} · {u.role === 'admin' ? '관리자' : '영업'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* MODE 2: SIGNUP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">성명 (이름) *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="홍길동 팀장"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">연락처 (휴대폰)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">이메일 주소 (ID) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="user@oohcrm.co.kr"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">비밀번호 *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="6자 이상 입력"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  {signupPassword && (
                    <div className="mt-1.5 flex items-center space-x-2">
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{strength.text}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">비밀번호 확인 *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="비밀번호 재입력"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">소속 부서</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={signupDepartment}
                      onChange={(e) => setSignupDepartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      <option value="영업 1팀">영업 1팀</option>
                      <option value="영업 2팀">영업 2팀</option>
                      <option value="영업 3팀">영업 3팀</option>
                      <option value="마케팅팀">마케팅팀</option>
                      <option value="미디어사업부">미디어사업부</option>
                      <option value="임원/총괄">임원/총괄</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">권한 구분 *</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSignupRole('sales')}
                      className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 ${
                        signupRole === 'sales'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>영업사원</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole('admin')}
                      className={`py-1.5 rounded-lg flex items-center justify-center space-x-1 ${
                        signupRole === 'admin'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>관리자</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Code input if Admin role selected */}
              {signupRole === 'admin' && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1.5 animate-fadeIn">
                  <div className="flex items-center space-x-1 text-amber-300 text-xs font-bold">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>관리자 보안 승인 코드</span>
                  </div>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="관리자 인증 코드 입력 (테스트 코드: ooh2026)"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-amber-400/80">
                    관리자 권한은 시스템 전반 제어가 가능하므로 보안코드가 필요합니다.
                  </p>
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-0"
                />
                <span className="text-xs text-slate-300">
                  OOH CRM 이용약관 및 개인정보 처리방침에 동의합니다.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center space-x-2 min-h-[44px]"
              >
                {loading ? (
                  <span>회원가입 처리 중...</span>
                ) : (
                  <>
                    <span>회원가입 완료</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {!resetDone ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">가입된 이메일 주소</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="가입했던 이메일 입력"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">새로 변경할 비밀번호</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="새 비밀번호 (6자 이상)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center space-x-2 min-h-[44px]"
                  >
                    {loading ? <span>재설정 중...</span> : <span>비밀번호 재설정 완료</span>}
                  </button>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300">비밀번호가 성공적으로 변경되었습니다.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetDone(false);
                    }}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold"
                  >
                    새 비밀번호로 로그인하기
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
