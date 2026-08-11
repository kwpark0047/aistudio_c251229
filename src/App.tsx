import React, { useEffect, useState } from 'react';
import { ActivityLog, BatchPipelineStatus, Lead, Media, MediaStatus, User } from './types';
import { Header } from './components/Header';
import { OohMap } from './components/OohMap';
import { MediaTable } from './components/MediaTable';
import { LeadsTable } from './components/LeadsTable';
import { PipelineDashboard } from './components/PipelineDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ArsCampaignManager } from './components/ArsCampaignManager';
import { SalesKanbanDashboard } from './components/SalesKanbanDashboard';
import { ReportLandingPage } from './components/ReportLandingPage';
import { LogsTable } from './components/LogsTable';
import { SchemaViewer } from './components/SchemaViewer';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'media' | 'leads' | 'pipeline' | 'ars' | 'kanban' | 'admin' | 'logs' | 'schema'>('kanban');
  const [selectedReportToken, setSelectedReportToken] = useState<string | null>(null);
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-admin-1',
    name: '김경영 대표',
    email: 'admin@oohcrm.co.kr',
    role: 'admin',
    department: '임원/총괄',
    createdAt: '2026-01-02',
  });
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [logsList, setLogsList] = useState<ActivityLog[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<BatchPipelineStatus>({
    lastRunAt: new Date().toISOString(),
    cronSchedule: '0 2 * * * (매일 새벽 2시)',
    status: 'idle',
    totalFetched: 0,
    tier1Count: 0,
    geocodedCount: 0,
    cachedNearestCount: 0,
    logs: [],
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data from Express backend API
  const fetchData = async () => {
    try {
      const [resUsers, resMedia, resLeads, resLogs, resPipeline] = await Promise.all([
        fetch('/api/users').then((r) => r.json()),
        fetch('/api/media').then((r) => r.json()),
        fetch('/api/leads').then((r) => r.json()),
        fetch('/api/logs').then((r) => r.json()),
        fetch('/api/pipeline/status').then((r) => r.json()),
      ]);

      if (Array.isArray(resUsers)) setUsers(resUsers);
      if (Array.isArray(resMedia)) setMediaList(resMedia);
      if (Array.isArray(resLeads)) setLeadsList(resLeads);
      if (Array.isArray(resLogs)) setLogsList(resLogs);
      if (resPipeline && resPipeline.lastRunAt) setPipelineStatus(resPipeline);
    } catch (err) {
      console.error('Failed to load API data:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup Server-Sent Events (SSE) Real-Time Synchronization Listener
    const eventSource = new EventSource('/api/realtime/stream');

    eventSource.addEventListener('media_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (Array.isArray(data)) {
          setMediaList(data);
        }
      } catch (err) {
        console.error('SSE realtime parse error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  // Handler for Admin User Management
  const handleAddUser = async (newUserData: Omit<User, 'id'>) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData),
      });
      const created = await res.json();
      setUsers((prev) => [...prev, created]);
      showToast(`신규 영업사원 계정 [${created.name}]이 등록되었습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      showToast(`계정 정보가 업데이트되었습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('계정이 삭제되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for Excel Batch Upsert
  const handleBatchUpsertMedia = async (items: Partial<Media>[], protectActiveStatus: boolean) => {
    try {
      const res = await fetch('/api/media/batch-upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, protectActiveStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
        showToast(`📊 [엑셀 Upsert 완료] 추가: ${data.stats.inserted}건, 갱신: ${data.stats.updated}건, 충돌보호: ${data.stats.statusProtected}건`);
        return data.stats;
      }
    } catch (err) {
      console.error(err);
    }
    return { inserted: 0, updated: 0, statusProtected: 0 };
  };

  // Handler for Public Data Batch Pipeline Trigger
  const handleTriggerPipeline = async () => {
    try {
      const res = await fetch('/api/pipeline/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setPipelineStatus(data.status);
        await fetchData(); // Refresh leads and logs
        showToast('🚀 [공공데이터 크론배치] 신규 인허가 수집, Tier 1 분류 및 500m 역세권 캐싱 연산이 완료되었습니다.');
      } else {
        showToast('⚠️ 배치 파이프라인 수행 실패');
      }
    } catch (err) {
      console.error(err);
      showToast('⚠️ 서버 통신 오류');
    }
  };


  // Handlers for Media CRUD
  const handleAddMedia = async (newMediaData: Omit<Media, 'id'>) => {
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMediaData),
      });
      const created = await res.json();
      setMediaList((prev) => [created, ...prev]);
      showToast(`신규 매체 [${created.stationName} ${created.mediaType}]가 성공적으로 등록되었습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMediaStatus = async (id: string, status: MediaStatus, contractEndDate?: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, contractEndDate, salesRepId: currentUser.id, salesRepName: currentUser.name }),
      });
      const updated = await res.json();
      setMediaList((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast(`매체 상태가 [${status === 'holding' ? '홀딩(가계약)' : status}]로 변경 및 실시간 동기화되었습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      showToast('매체 재고 정보가 삭제되었습니다.');
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Leads CRUD
  const handleAddLead = async (newLeadData: Omit<Lead, 'id'>) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadData),
      });
      const created = await res.json();
      setLeadsList((prev) => [created, ...prev]);
      showToast(`신규 타겟 리드 [${created.companyName}]가 등록되었습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: Lead['status']) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, salesRepId: currentUser.id }),
      });
      const updated = await res.json();
      setLeadsList((prev) => prev.map((l) => (l.id === id ? updated : l)));
      fetchData(); // Refresh logs as status change records an auto-log
      showToast(`리드 상태가 [${status}]로 업데이트되었습니다.`);
    } catch (err) {
      console.error(err);
    }
  };

  // Handler for Automated Proposal Email
  const handleSendProposal = async (lead: Lead, media: Media) => {
    try {
      // 1. Log mail dispatch
      const logRes = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mail',
          leadId: lead.id,
          leadName: lead.companyName,
          mediaId: media.id,
          mediaTitle: `${media.line} ${media.stationName} ${media.mediaType}`,
          salesRepId: currentUser.id,
          salesRepName: currentUser.name,
          description: `[자동화 제안서] ${lead.companyName} 대상 ${media.stationName} ${media.mediaType} 맞춤 제안 메일 발송 완료`,
          details: {
            subject: `[맞춤 제안] ${media.stationName} 역세권 옥외광고 특별 제안 - ${lead.companyName}`,
            mediaPrice: media.price,
            recipientPhone: lead.phone,
          },
        }),
      });
      const createdLog = await logRes.json();
      setLogsList((prev) => [createdLog, ...prev]);

      // 2. Update Lead status to 'contacted'
      if (lead.status === 'new') {
        await handleUpdateLeadStatus(lead.id, 'contacted');
      }

      showToast(`📧 [${lead.companyName}] 업체로 [${media.stationName} ${media.mediaType}] 맞춤 제안서 메일이 자동 발송되었습니다!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        users={users}
        onUserChange={setCurrentUser}
      />

      {/* Main Content Body */}
      <main className="flex-1 relative pb-16 sm:pb-0">
        {activeTab === 'map' && (
          <OohMap
            mediaList={mediaList}
            leadsList={leadsList}
            currentUser={currentUser}
            onSendProposal={handleSendProposal}
            onUpdateMediaStatus={handleUpdateMediaStatus}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            usersList={users}
            mediaList={mediaList}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onBatchUpsertMedia={handleBatchUpsertMedia}
          />
        )}

        {activeTab === 'media' && (
          <MediaTable
            mediaList={mediaList}
            users={users}
            currentUser={currentUser}
            onAddMedia={handleAddMedia}
            onUpdateStatus={handleUpdateMediaStatus}
            onDeleteMedia={handleDeleteMedia}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsTable
            leadsList={leadsList}
            mediaList={mediaList}
            users={users}
            currentUser={currentUser}
            onAddLead={handleAddLead}
            onUpdateStatus={handleUpdateLeadStatus}
            onSendProposal={handleSendProposal}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineDashboard
            status={pipelineStatus}
            leadsList={leadsList}
            onTriggerPipeline={handleTriggerPipeline}
          />
        )}

        {activeTab === 'kanban' && (
          <SalesKanbanDashboard
            leadsList={leadsList}
            currentUser={currentUser}
            onRefreshLeads={fetchData}
            onSelectLeadForArs={() => setActiveTab('ars')}
          />
        )}

        {activeTab === 'ars' && (
          <ArsCampaignManager
            leadsList={leadsList}
            currentUser={currentUser}
            onSelectReportToken={(token) => setSelectedReportToken(token)}
          />
        )}

        {activeTab === 'logs' && <LogsTable logsList={logsList} />}

        {activeTab === 'schema' && <SchemaViewer />}
      </main>

      {/* Personalized Commercial Report Fullscreen Modal Overlay */}
      {selectedReportToken && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <ReportLandingPage
            token={selectedReportToken}
            onClose={() => setSelectedReportToken(null)}
          />
        </div>
      )}

      {/* Global Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
