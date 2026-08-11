import React, { useState } from 'react';
import { User } from '../types';
import {
  Shield,
  UserCheck,
  X,
  Mail,
  Building,
  Phone,
  Calendar,
  LogOut,
  Edit2,
  CheckCircle2,
  Database,
  Lock,
  Clock,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateProfile: (updated: Partial<User>) => void;
  onLogout: () => void;
  onSwitchUser: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onLogout,
  onSwitchUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [department, setDepartment] = useState(currentUser.department);
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUser.id,
          name,
          phone,
          department,
          password: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onUpdateProfile(data.user);
        setMsg('프로필 정보가 성공적으로 수정되었습니다.');
        setIsEditing(false);
        setNewPassword('');
      }
    } catch (err) {
      setMsg('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative text-slate-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white shadow-md">
              {currentUser.role === 'admin' ? (
                <Shield className="w-6 h-6 text-amber-400" />
              ) : (
                <UserCheck className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  {currentUser.role === 'admin' ? '최고 관리자' : '영업 담당자'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {msg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Building className="w-3 h-3 text-indigo-400" /> 소속 부서
                  </span>
                  <p className="font-bold text-slate-200">{currentUser.department}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-indigo-400" /> 연락처
                  </span>
                  <p className="font-bold text-slate-200">{currentUser.phone || '미등록'}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> 최근 접속
                  </span>
                  <p className="font-bold text-slate-200">{currentUser.lastLoginAt || '오늘'}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" /> 계정 생성일
                  </span>
                  <p className="font-bold text-slate-200">{currentUser.createdAt}</p>
                </div>
              </div>

              {/* Supabase status badge */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 font-semibold">Supabase DB 동기화</span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  정상 연동됨
                </span>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>내 정보 수정</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onSwitchUser();
                  }}
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold px-3 py-2.5 rounded-xl text-xs border border-indigo-500/30 transition-colors"
                >
                  계정 전환
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">성명</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">연락처</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">소속 부서</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">새 비밀번호 변경 (선택)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="변경할 경우에만 입력"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl"
                >
                  {saving ? '저장 중...' : '변경사항 저장'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃 (Sign Out)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
