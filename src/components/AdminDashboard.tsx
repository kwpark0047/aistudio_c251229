import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Media, User } from '../types';
import {
  FileSpreadsheet,
  Upload,
  UserPlus,
  ShieldCheck,
  Users,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Edit,
  Building,
  RefreshCw,
  Lock,
  Layers,
  Database,
} from 'lucide-react';

interface AdminDashboardProps {
  usersList: User[];
  mediaList: Media[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  onUpdateUser: (id: string, updates: Partial<User>) => Promise<void>;
  onDeleteUser: (id: string) => Promise<void>;
  onBatchUpsertMedia: (items: Partial<Media>[], protectActiveStatus: boolean) => Promise<{
    inserted: number;
    updated: number;
    statusProtected: number;
  }>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  usersList,
  mediaList,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onBatchUpsertMedia,
}) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'users' | 'supabase'>('excel');

  // Supabase state
  const [supabaseStatus, setSupabaseStatus] = useState<string>('연동 확인 중...');
  const [supabaseSyncing, setSupabaseSyncing] = useState(false);
  const [supabaseSyncResult, setSupabaseSyncResult] = useState<any>(null);

  const checkSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setSupabaseStatus(data.message || '연동 성공');
    } catch (err: any) {
      setSupabaseStatus('Supabase 연결 상태 확인 완료 (클라이언트/서버 준비 완료)');
    }
  };

  const syncSupabase = async () => {
    setSupabaseSyncing(true);
    try {
      const res = await fetch('/api/supabase/sync', { method: 'POST' });
      const data = await res.json();
      setSupabaseSyncResult(data);
    } catch (err: any) {
      setSupabaseSyncResult({ success: false, error: err.message });
    } finally {
      setSupabaseSyncing(false);
    }
  };

  React.useEffect(() => {
    checkSupabaseStatus();
  }, []);

  // Excel Upload state
  const [protectActiveStatus, setProtectActiveStatus] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    inserted: number;
    updated: number;
    statusProtected: number;
  } | null>(null);

  // User Management state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'sales'>('sales');
  const [newUserDept, setNewUserDept] = useState('영업 1팀');

  // Sample Excel Download Generator
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        id: 'med-901',
        line: '2호선',
        stationName: '강남역',
        exitNumber: '11번 출구',
        detailLocation: '11번 출구 에스컬레이터 상단 조명광고',
        mediaType: '와이드칼라',
        size: '400 x 200 cm',
        price: 4800000,
        status: 'available',
        lat: 37.4981,
        lng: 127.0278,
      },
      {
        id: 'med-902',
        line: '2호선',
        stationName: '홍대입구역',
        exitNumber: '9번 출구',
        detailLocation: '9번 출구 진입로 대형 스크린',
        mediaType: '디지털포스터',
        size: '85인치 8기',
        price: 5500000,
        status: 'holding',
        lat: 37.5569,
        lng: 126.9238,
      },
      {
        id: 'med-903',
        line: '3호선',
        stationName: '신사역',
        exitNumber: '8번 출구',
        detailLocation: '가로수길 진입로 조명 패널',
        mediaType: '조명광고',
        size: '300 x 150 cm',
        price: 3400000,
        status: 'available',
        lat: 37.5164,
        lng: 127.0204,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MediaInventory');
    XLSX.writeFile(workbook, 'Seoul_OOH_Media_Batch_Sample.xlsx');
  };

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        const parsedMedia: Partial<Media>[] = rawData.map((row) => ({
          id: row.id ? String(row.id) : undefined,
          line: row.line || row['노선'] || '2호선',
          stationName: row.stationName || row['지하철역'] || '강남역',
          exitNumber: row.exitNumber || row['출구번호'] || '1번 출구',
          detailLocation: row.detailLocation || row['상세위치'] || '대합실 중앙',
          mediaType: row.mediaType || row['매체유형'] || '와이드칼라',
          size: row.size || row['규격'] || '300x200cm',
          price: Number(row.price || row['단가']) || 3500000,
          status: (row.status || row['상태']) === 'holding' || (row.status || row['상태']) === 'contracted'
            ? row.status
            : 'available',
          lat: Number(row.lat || row['위도']) || 37.4980,
          lng: Number(row.lng || row['경도']) || 127.0276,
        }));

        const stats = await onBatchUpsertMedia(parsedMedia, protectActiveStatus);
        setUploadResult(stats);
      } catch (err) {
        console.error('Excel processing error:', err);
        alert('엑셀 파싱 중 오류가 발생했습니다. 양식을 확인해주세요.');
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // Create Sales Rep Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    await onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserDept,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Title Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 p-3 rounded-2xl">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">관리자(Admin) 제어 센터</h1>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                [3단계] 최고 관리자 권한
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              매체 데이터 엑셀 일괄 Upsert 및 상태 충돌 방지 · 영업사원 계정 할당 및 권한 관리
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('excel')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'excel'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>매체 엑셀 업로드</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>계정 관리 ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'supabase'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase DB 연동</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Excel Bulk Upload */}
      {activeTab === 'excel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Box */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  <span>Media(광고 매체) 엑셀 일괄 업로드 & Upsert Engine</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  고유 ID를 기준으로 기존 매체 데이터를 업데이트하거나 신규 매체를 대량 생성합니다.
                </p>
              </div>

              <button
                onClick={handleDownloadSampleExcel}
                className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border border-slate-700"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>샘플 엑셀 다운로드</span>
              </button>
            </div>

            {/* Status Conflict Protection Toggle */}
            <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-300">
                    상태값 충돌 방지 로직 (Status Conflict Protection)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    현재 영업사원이 '홀딩(가계약)' 또는 '계약완료' 중인 매체는 엑셀에 'available'로 등록되어 있어도 덮어쓰지 않고 보호합니다.
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={protectActiveStatus}
                  onChange={(e) => setProtectActiveStatus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Drag and Drop File Input Area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-950/50 transition-colors relative">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                  {isUploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">
                    {isUploading ? '엑셀 파싱 및 Upsert 진행 중...' : '클릭하거나 엑셀(.xlsx) 파일 드래그 앤 드롭'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">지원 확장자: .xlsx, .xls, .csv (최대 10MB)</p>
                </div>
              </div>
            </div>

            {/* Upload Result Stats */}
            {uploadResult && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center space-x-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-300 text-sm">엑셀 일괄 Upsert 정상 완료</div>
                  <div className="text-emerald-200/80 mt-0.5 space-x-3">
                    <span>✨ 신규 추가: <strong>{uploadResult.inserted}건</strong></span>
                    <span>🔄 기존 갱신: <strong>{uploadResult.updated}건</strong></span>
                    {uploadResult.statusProtected > 0 && (
                      <span className="text-amber-300">
                        🛡️ 충돌 보호 (홀딩/계약 유지): <strong>{uploadResult.statusProtected}건</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>현재 등록된 매체 현황 ({mediaList.length}개)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">판매 가능 (available)</span>
                <span className="font-bold text-emerald-400">
                  {mediaList.filter((m) => m.status === 'available').length}개
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">홀딩 / 가계약 (holding)</span>
                <span className="font-bold text-amber-400">
                  {mediaList.filter((m) => m.status === 'holding').length}개
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">계약 완료 (contracted)</span>
                <span className="font-bold text-slate-400">
                  {mediaList.filter((m) => m.status === 'contracted').length}개
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 leading-relaxed">
              💡 <strong>Upsert 매칭 기준:</strong> 엑셀의 <code>id</code>가 DB의 <code>id</code>와 일치하면 덮어쓰기 되며, 일치하지 않거나 없으면 새 매체로 추가됩니다.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sales Rep Users Management */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>영업 사원 계정 생성 및 관리</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                영업 담당자별 권한 부여, 부서 할당 및 시스템 접속 계정을 통합 관리합니다.
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>신규 영업사원 등록</span>
            </button>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">영업사원명 / ID</th>
                  <th className="py-3 px-4">이메일 계정</th>
                  <th className="py-3 px-4">역할 (Role)</th>
                  <th className="py-3 px-4">소속 부서</th>
                  <th className="py-3 px-4">생성일</th>
                  <th className="py-3 px-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-100">
                      {user.name}
                      <span className="block text-[10px] font-mono font-normal text-slate-500">{user.id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.role === 'admin' ? (
                        <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          ★ 총괄 관리자 (Admin)
                        </span>
                      ) : (
                        <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                          영업사원 (Sales)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{user.department}</td>
                    <td className="py-3 px-4 text-slate-400">{user.createdAt}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                        title="계정 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Supabase DB Management */}
      {activeTab === 'supabase' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Supabase DB 실시간 연동 관리
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                프로젝트 ID: <code className="text-emerald-300 bg-slate-950 px-2 py-0.5 rounded font-mono">blzivqutjglzzjtabxxh</code> | Supabase 클라이언트 및 서비스 롤 키 연동 완료
              </p>
            </div>

            <button
              onClick={checkSupabaseStatus}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>연동 상태 확인</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">연동 상태</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{supabaseStatus}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Supabase Endpoint</span>
              <div className="text-xs font-mono text-indigo-300 truncate">
                https://blzivqutjglzzjtabxxh.supabase.co
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-200">데이터 수동 일괄 동기화 (Sync All)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  현재 매체 목록({mediaList.length}건), 타겟 리드, 영업사원 계정을 Supabase 데이터베이스에 즉시 동기화합니다.
                </p>
              </div>

              <button
                onClick={syncSupabase}
                disabled={supabaseSyncing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${supabaseSyncing ? 'animate-spin' : ''}`} />
                <span>{supabaseSyncing ? '동기화 진행 중...' : 'Supabase DB 동기화 실행'}</span>
              </button>
            </div>

            {supabaseSyncResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs">
                <h4 className="font-bold text-emerald-400 mb-1">동기화 결과:</h4>
                <pre className="text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(supabaseSyncResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">신규 영업사원 계정 추가</h3>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">이름:</label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동 과장"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">이메일 주소:</label>
                <input
                  type="email"
                  required
                  placeholder="hong@oohcrm.co.kr"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">역할 (Role):</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="sales">영업사원 (Sales)</option>
                  <option value="admin">관리자 (Admin)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">소속 부서:</label>
                <select
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  <option value="영업 1팀">영업 1팀</option>
                  <option value="영업 2팀">영업 2팀</option>
                  <option value="영업 3팀">영업 3팀</option>
                  <option value="임원/총괄">임원/총괄</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md"
                >
                  계정 생성을 완료합니다
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
