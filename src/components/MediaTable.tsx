import React, { useState } from 'react';
import { Media, MediaStatus, MediaType, User } from '../types';
import { Tv, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, AlertTriangle, XCircle, MapPin, ExternalLink } from 'lucide-react';

interface MediaTableProps {
  mediaList: Media[];
  users: User[];
  currentUser: User;
  onAddMedia: (newMedia: Omit<Media, 'id'>) => void;
  onUpdateStatus: (id: string, status: MediaStatus, contractEndDate?: string) => void;
  onDeleteMedia: (id: string) => void;
}

export const MediaTable: React.FC<MediaTableProps> = ({
  mediaList,
  users,
  currentUser,
  onAddMedia,
  onUpdateStatus,
  onDeleteMedia,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLine, setFilterLine] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Media Form State
  const [line, setLine] = useState('2호선');
  const [stationName, setStationName] = useState('');
  const [exitNumber, setExitNumber] = useState('1번 출구');
  const [detailLocation, setDetailLocation] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('와이드칼라');
  const [size, setSize] = useState('400 x 200 cm');
  const [price, setPrice] = useState<number>(3000000);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80');
  const [salesRepId, setSalesRepId] = useState(currentUser.id);
  const [lat, setLat] = useState<number>(37.4979);
  const [lng, setLng] = useState<number>(127.0276);

  const filtered = mediaList.filter((m) => {
    const matchesSearch =
      m.stationName.includes(searchTerm) ||
      m.detailLocation.includes(searchTerm) ||
      m.mediaType.includes(searchTerm);
    const matchesLine = filterLine === 'all' || m.line === filterLine;
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchesSearch && matchesLine && matchesStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rep = users.find((u) => u.id === salesRepId);
    onAddMedia({
      line,
      stationName,
      exitNumber,
      detailLocation,
      mediaType,
      size,
      imageUrl,
      price: Number(price),
      status: 'available',
      salesRepId,
      salesRepName: rep?.name || '담당자',
      lat: Number(lat),
      lng: Number(lng),
    });
    setShowAddModal(false);
    // Reset form
    setStationName('');
    setDetailLocation('');
  };

  const formatPrice = (val: number) => {
    return (val / 10000).toLocaleString() + ' 만원';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tv className="w-6 h-6 text-indigo-400" />
            지하철 및 옥외광고 매체 재고 관리 (Media Inventory)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            역사별 광고 매체 위치, 규격, 단가, 실시간 판매 상태 관리 및 담당 영업사원 지정
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>신규 매체 등록</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="역명, 상세위치, 매체종류 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Line Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400 font-semibold">호선:</span>
            <select
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">전체 호선</option>
              <option value="2호선" className="bg-slate-900">2호선</option>
              <option value="3호선" className="bg-slate-900">3호선</option>
              <option value="9호선/5호선" className="bg-slate-900">9호선/5호선</option>
            </select>
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
              <option value="available" className="bg-slate-900">판매가능</option>
              <option value="holding" className="bg-slate-900">홀딩중</option>
              <option value="contracted" className="bg-slate-900">계약완료</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-semibold">
          총 <strong className="text-indigo-400">{filtered.length}</strong>개 매체
        </span>
      </div>

      {/* Media Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-3.5 px-4">매체/역명</th>
                <th className="py-3.5 px-4">종류 / 규격</th>
                <th className="py-3.5 px-4">상세 위치</th>
                <th className="py-3.5 px-4">월 단가</th>
                <th className="py-3.5 px-4">담당 영업사원</th>
                <th className="py-3.5 px-4">판매 상태</th>
                <th className="py-3.5 px-4 text-right">상태변경 / 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={m.imageUrl}
                        alt={m.stationName}
                        className="w-12 h-10 object-cover rounded-lg border border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5">
                          {m.line}
                        </span>
                        <strong className="text-slate-100 text-sm">{m.stationName}</strong>
                        <span className="text-slate-400 text-xs block mt-0.5">{m.exitNumber}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium">
                    <div className="text-slate-100 font-bold">{m.mediaType}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{m.size}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                    {m.detailLocation}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                    {formatPrice(m.price)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">
                      {m.salesRepName || '미지정'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {m.status === 'available' && (
                      <span className="inline-flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>판매가능</span>
                      </span>
                    )}
                    {m.status === 'holding' && (
                      <span className="inline-flex items-center space-x-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>홀딩 (종료: {m.contractEndDate || '미정'})</span>
                      </span>
                    )}
                    {m.status === 'contracted' && (
                      <span className="inline-flex items-center space-x-1 bg-slate-700/50 text-slate-300 border border-slate-600 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                        <XCircle className="w-3 h-3" />
                        <span>계약완료 ({m.contractEndDate})</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <select
                        value={m.status}
                        onChange={(e) => {
                          const newSt = e.target.value as MediaStatus;
                          const endDate = newSt !== 'available' ? '2026-12-31' : undefined;
                          onUpdateStatus(m.id, newSt, endDate);
                        }}
                        className="bg-slate-950 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg focus:outline-none cursor-pointer"
                      >
                        <option value="available">판매가능</option>
                        <option value="holding">홀딩</option>
                        <option value="contracted">계약완료</option>
                      </select>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => onDeleteMedia(m.id)}
                          className="text-rose-400 hover:text-rose-300 p-1.5 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="매체 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Media Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                신규 옥외광고 매체 등록
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">지하철 호선</label>
                  <select
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  >
                    <option value="2호선">2호선</option>
                    <option value="3호선">3호선</option>
                    <option value="9호선/5호선">9호선/5호선</option>
                    <option value="신분당선">신분당선</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">지하철 역명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 강남역, 신사역"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">출구 번호</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 11번 출구"
                    value={exitNumber}
                    onChange={(e) => setExitNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">매체 종류</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaType)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  >
                    <option value="와이드칼라">와이드칼라</option>
                    <option value="디지털포스터">디지털포스터</option>
                    <option value="사각기둥">사각기둥</option>
                    <option value="조명광고">조명광고</option>
                    <option value="스크린도어">스크린도어</option>
                    <option value="전광판">전광판</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">상세 위치 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: B1층 환승 게이트 정면 대합실 벽면"
                  value={detailLocation}
                  onChange={(e) => setDetailLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">규격</label>
                  <input
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">월 단가 (KRW)</label>
                  <input
                    type="number"
                    required
                    step="100000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">담당 영업사원 지정</label>
                <select
                  value={salesRepId}
                  onChange={(e) => setSalesRepId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-2 rounded-xl text-slate-200"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-md"
                >
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
