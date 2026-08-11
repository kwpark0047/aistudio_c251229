import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Lead, Media, User } from '../types';
import {
  MapPin,
  Tv,
  Target,
  Filter,
  ExternalLink,
  Mail,
  PhoneCall,
  CheckCircle2,
  Building2,
  TrainTrack,
  Lock,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
  Globe,
  Layers,
} from 'lucide-react';

interface OohMapProps {
  mediaList: Media[];
  leadsList: Lead[];
  currentUser: User;
  onSendProposal: (lead: Lead, media: Media) => void;
  onUpdateMediaStatus?: (mediaId: string, status: Media['status']) => void;
}

// Map Controller Component for Pan/Zoom
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Map Tile Layer Options (Free & Open Maps)
const TILE_LAYERS = {
  voyager: {
    name: '컬러 지도 (CartoDB Voyager)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    name: '다크 지도 (CartoDB Dark)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    name: '표준 오픈지도 (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

export const OohMap: React.FC<OohMapProps> = ({
  mediaList,
  leadsList,
  currentUser,
  onSendProposal,
  onUpdateMediaStatus,
}) => {
  // Filters
  const [selectedLine, setSelectedLine] = useState<string>('all');
  const [selectedMediaStatus, setSelectedMediaStatus] = useState<string>('all');
  const [minLeadScore, setMinLeadScore] = useState<number>(50);
  const [showTier1Only, setShowTier1Only] = useState<boolean>(true);
  const [showMedia, setShowMedia] = useState<boolean>(true);
  const [showLeads, setShowLeads] = useState<boolean>(true);
  const [tileStyle, setTileStyle] = useState<keyof typeof TILE_LAYERS>('dark');

  // Active Selected Pin Items
  const [selectedMediaItem, setSelectedMediaItem] = useState<Media | null>(null);
  const [selectedLeadItem, setSelectedLeadItem] = useState<Lead | null>(null);

  // Proposal modal state
  const [matchingMediaModal, setMatchingMediaModal] = useState<Lead | null>(null);
  const [targetMediaForProposal, setTargetMediaForProposal] = useState<Media | null>(null);

  // Map Center (Default to Seoul / Gangnam Area)
  const defaultCenter: [number, number] = [37.5250, 126.9800];

  // Filter Logic
  const filteredMedia = mediaList.filter((m) => {
    if (!showMedia) return false;
    if (selectedLine !== 'all' && m.line !== selectedLine) return false;
    if (selectedMediaStatus !== 'all' && m.status !== selectedMediaStatus) return false;
    return true;
  });

  const filteredLeads = leadsList.filter((l) => {
    if (!showLeads) return false;
    if (l.scoring < minLeadScore) return false;
    if (showTier1Only && !l.isTier1) return false;
    return true;
  });

  // Calculate matching available media for a selected lead's station
  const getMatchingMediaForLead = (lead: Lead) => {
    if (!lead.nearestStation) return mediaList;
    return mediaList.filter(
      (m) => m.stationName === lead.nearestStation || lead.nearestStation?.includes(m.stationName)
    );
  };

  const formatPrice = (val: number) => {
    return (val / 10000).toLocaleString() + '만원';
  };

  const getMediaStatusBadge = (status: Media['status']) => {
    switch (status) {
      case 'available':
        return <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold">판매가능</span>;
      case 'holding':
        return <span className="bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded font-bold">홀딩(가계약)</span>;
      case 'contracted':
        return <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-bold">계약완료</span>;
      case 'expiring':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded font-bold">만료예정</span>;
    }
  };

  // Helper to create custom Leaflet HTML DivIcon markers
  const createMediaIcon = (status: Media['status']) => {
    const bgColor =
      status === 'available' ? 'bg-emerald-500' : status === 'holding' ? 'bg-amber-500' : 'bg-slate-600';
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="w-7 h-7 rounded-full ${bgColor} border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-125 cursor-pointer">📺</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  const createLeadIcon = (scoring: number, isTier1: boolean) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="bg-rose-600 hover:bg-rose-500 border-2 border-white text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-2xl flex items-center space-x-1 cursor-pointer transition-transform hover:scale-125 whitespace-nowrap">
        <span>📍</span>
        <span>${scoring}점</span>
      </div>`,
      iconSize: [60, 26],
      iconAnchor: [30, 13],
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Top Filter Control Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800 p-2.5 px-3 sm:px-4 flex items-center justify-between gap-2 text-xs z-20 shadow-md overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center space-x-1 text-slate-300 font-bold pr-2 border-r border-slate-800 shrink-0">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">영업 지도 필터:</span>
          </div>

          {/* Toggle Layers */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setShowTier1Only(!showTier1Only)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] sm:text-xs transition-all flex items-center space-x-1 whitespace-nowrap min-h-[32px] ${
                showTier1Only
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>★ Tier 1</span>
            </button>

            <label className="flex items-center space-x-1 px-2 py-1 cursor-pointer select-none border-l border-slate-800 min-h-[32px]">
              <input
                type="checkbox"
                checked={showMedia}
                onChange={(e) => setShowMedia(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-200 font-semibold flex items-center gap-1 text-[11px] whitespace-nowrap">
                <Tv className="w-3 h-3 text-blue-400" />
                매체 ({filteredMedia.length})
              </span>
            </label>

            <label className="flex items-center space-x-1 px-2 py-1 cursor-pointer select-none border-l border-slate-800 min-h-[32px]">
              <input
                type="checkbox"
                checked={showLeads}
                onChange={(e) => setShowLeads(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span className="text-slate-200 font-semibold flex items-center gap-1 text-[11px] whitespace-nowrap">
                <Target className="w-3 h-3 text-rose-400" />
                리드 ({filteredLeads.length})
              </span>
            </label>
          </div>

          {/* Line Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 shrink-0 min-h-[36px]">
            <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">호선:</span>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="bg-transparent text-slate-200 font-bold text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">전체 호선</option>
              <option value="2호선" className="bg-slate-900">2호선</option>
              <option value="3호선" className="bg-slate-900">3호선</option>
              <option value="9호선/5호선" className="bg-slate-900">9호선/5호선</option>
            </select>
          </div>

          {/* Score Slider */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
            <span className="text-slate-400 font-medium text-[11px]">스코어:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minLeadScore}
              onChange={(e) => setMinLeadScore(Number(e.target.value))}
              className="w-14 accent-indigo-500 cursor-pointer"
            />
            <span className="font-bold text-indigo-400 text-[11px]">{minLeadScore}점+</span>
          </div>

          {/* Free Map Style Picker */}
          <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <Layers className="w-3 h-3 text-emerald-400 ml-1 hidden sm:block" />
            {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((key) => (
              <button
                key={key}
                onClick={() => setTileStyle(key)}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap min-h-[28px] ${
                  tileStyle === key
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {key === 'dark' ? '다크' : key === 'voyager' ? '컬러' : 'OSM'}
              </button>
            ))}
          </div>
        </div>

        {/* Free Map Badge */}
        <div className="hidden xl:flex items-center space-x-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs font-semibold shrink-0">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>무료 오픈지도 연동</span>
        </div>
      </div>

      {/* Main Map & Interactive Sidebar Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Leaflet Map Canvas */}
        <div className="flex-1 relative w-full h-full bg-slate-950 overflow-hidden min-h-[300px]">
          <MapContainer
            center={defaultCenter}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%', backgroundColor: '#090d16' }}
            className="z-10"
          >
            <TileLayer
              attribution={TILE_LAYERS[tileStyle].attribution}
              url={TILE_LAYERS[tileStyle].url}
            />

            {/* OOH Media Markers */}
            {filteredMedia.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createMediaIcon(m.status)}
                eventHandlers={{
                  click: () => {
                    setSelectedMediaItem(m);
                    setSelectedLeadItem(null);
                  },
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 text-slate-900 font-sans max-w-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-indigo-700">{m.line} {m.stationName}</span>
                      {getMediaStatusBadge(m.status)}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{m.mediaType} ({m.detailLocation})</h4>
                    <p className="text-xs text-slate-600 mt-0.5">규격: {m.size}</p>
                    <div className="mt-2 pt-1 border-t font-bold text-emerald-700 text-xs flex justify-between">
                      <span>단가: {formatPrice(m.price)}/월</span>
                      <span className="text-slate-500">담당: {m.salesRepName}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Target Leads Markers */}
            {filteredLeads.map((l) => (
              <Marker
                key={l.id}
                position={[l.lat, l.lng]}
                icon={createLeadIcon(l.scoring, l.isTier1)}
                eventHandlers={{
                  click: () => {
                    setSelectedLeadItem(l);
                    setSelectedMediaItem(null);
                  },
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 text-slate-900 font-sans max-w-xs">
                    <div className="flex items-center justify-between mb-1 gap-1">
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        적합도 스코어: {l.scoring}점
                      </span>
                      {l.isTier1 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                          ★ Tier 1 (전화보유)
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{l.companyName}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{l.address}</p>
                    {l.nearestStation && (
                      <div className="text-xs text-indigo-700 font-bold mt-1">
                        🚇 {l.nearestStation} {l.nearestExit} ({l.distanceMeters}m)
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-slate-500">개업: {l.openedAt}</span>
                      <button
                        onClick={() => setSelectedLeadItem(l)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1 rounded-md font-bold transition-colors"
                      >
                        매체 매칭 사이드바 열기
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Panel for Selected Tier 1 Lead & Station Media Matching */}
        {selectedLeadItem && (
          <div className="w-full lg:w-96 max-h-[50vh] lg:max-h-full bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-full shadow-2xl z-30 shrink-0 animate-slideUp">
            {/* Sidebar Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    적합도 {selectedLeadItem.scoring}점
                  </span>
                  {selectedLeadItem.isTier1 && (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ★ Tier 1 (전화 {selectedLeadItem.phone})
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white mt-1.5 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-400" />
                  {selectedLeadItem.companyName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-tight">{selectedLeadItem.address}</p>
              </div>

              <button
                onClick={() => setSelectedLeadItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Station 500m Radius Info */}
            <div className="p-4 bg-indigo-950/40 border-b border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-indigo-300 font-bold flex items-center gap-1.5">
                  <TrainTrack className="w-4 h-4 text-indigo-400" />
                  500m 반경 최인접 지하철역
                </span>
                <span className="text-slate-400 text-[11px]">거리 {selectedLeadItem.distanceMeters || 140}m</span>
              </div>
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span>{selectedLeadItem.nearestStation || '강남역'} ({selectedLeadItem.nearestExit || '11번 출구'})</span>
                <span className="text-xs text-indigo-300 font-mono">
                  일유동인구 {(selectedLeadItem.dailyRidership || 148500).toLocaleString()}명
                </span>
              </div>
            </div>

            {/* Matching Media List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>해당 역/출구 보유 광고 매체</span>
                <span className="text-indigo-400 font-mono">
                  {getMatchingMediaForLead(selectedLeadItem).length}개 등록
                </span>
              </div>

              {getMatchingMediaForLead(selectedLeadItem).map((media) => {
                const isAvailable = media.status === 'available';

                return (
                  <div
                    key={media.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2.5 ${
                      isAvailable
                        ? 'bg-slate-950 border-slate-800 hover:border-indigo-500/80 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5 mb-1">
                          <span className="font-bold text-indigo-300">{media.line} {media.stationName}</span>
                          <span className="text-slate-500">({media.exitNumber})</span>
                        </div>
                        <div className="font-bold text-slate-100 text-sm">{media.mediaType}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{media.detailLocation}</div>
                      </div>

                      <div className="text-right shrink-0">
                        {getMediaStatusBadge(media.status)}
                        <div className="font-bold text-emerald-400 text-xs mt-1">
                          {formatPrice(media.price)}/월
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Holding & Contract & Send Proposal */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
                      {isAvailable ? (
                        <>
                          <button
                            onClick={() => onUpdateMediaStatus && onUpdateMediaStatus(media.id, 'holding')}
                            className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center space-x-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>홀딩(가계약)</span>
                          </button>

                          <button
                            onClick={() => onUpdateMediaStatus && onUpdateMediaStatus(media.id, 'contracted')}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center justify-center space-x-1"
                          >
                            <Lock className="w-3 h-3" />
                            <span>계약 완료</span>
                          </button>

                          <button
                            onClick={() => onSendProposal(selectedLeadItem, media)}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                            title="제안서 메일 발송"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="w-full text-center text-[11px] text-slate-500 font-medium py-1 bg-slate-900 rounded-lg">
                          🔒 다른 영업사원이 홀딩/계약 중 ({media.salesRepName})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {matchingMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  자동화 매체 매칭 & 제안서 발송
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                  <Target className="w-5 h-5 text-rose-400" />
                  {matchingMediaModal.companyName}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {matchingMediaModal.address} ({matchingMediaModal.businessCategory}, 스코어 {matchingMediaModal.scoring}점)
                </p>
              </div>
              <button
                onClick={() => {
                  setMatchingMediaModal(null);
                  setTargetMediaForProposal(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-semibold mb-2">
              추천 지하철 옥외광고 매체 선택:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-5 pr-1">
              {mediaList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setTargetMediaForProposal(m)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                    targetMediaForProposal?.id === m.id
                      ? 'bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-300">{m.line} {m.stationName} ({m.exitNumber})</span>
                      {getMediaStatusBadge(m.status)}
                    </div>
                    <p className="text-slate-300 font-medium mt-0.5">{m.mediaType} - {m.detailLocation}</p>
                    <span className="text-slate-400 text-[11px]">{m.size}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">{formatPrice(m.price)}</span>
                    <span className="text-slate-400 text-[11px]">담당: {m.salesRepName}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setMatchingMediaModal(null);
                  setTargetMediaForProposal(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                취소
              </button>

              <button
                disabled={!targetMediaForProposal}
                onClick={() => {
                  if (targetMediaForProposal) {
                    onSendProposal(matchingMediaModal, targetMediaForProposal);
                    setMatchingMediaModal(null);
                    setTargetMediaForProposal(null);
                  }
                }}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all ${
                  targetMediaForProposal
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>[자동화] 맞춤 제안서 메일 발송</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
