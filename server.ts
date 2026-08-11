import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { store } from './src/db/dataStore';
import { SQL_SCHEMA, SCHEMA_DOCS } from './src/db/schemaSql';
import { pipelineService } from './src/services/seoulDataPipeline';
import { initBatchCronJob } from './src/cron/batchRunner';
import { supabaseService } from './src/services/supabaseService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize daily 02:00 AM Cron Batch pipeline
  initBatchCronJob();

  // Realtime Server-Sent Events (SSE) Client Pool
  let sseClients: express.Response[] = [];

  function broadcastRealtimeEvent(event: string, payload: any) {
    const dataString = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    sseClients.forEach((client) => {
      try {
        client.write(dataString);
      } catch (e) {
        // ignore disconnected client
      }
    });
  }

  // Realtime Event Stream Endpoint
  app.get('/api/realtime/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', media: store.getMedia() })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter((c) => c !== res);
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. Users & Authentication API
  app.get('/api/users', (req, res) => {
    res.json(store.getUsers());
  });

  app.post('/api/auth/signup', (req, res) => {
    try {
      const { name, email, password, role, department, phone, adminCode } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: '이름, 이메일, 비밀번호는 필수 입력 항목입니다.' });
      }

      // Check email duplicate
      const existingUser = store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ error: '이미 가입된 이메일 주소입니다. 로그인해주세요.' });
      }

      // Admin role code verification
      let finalRole = role || 'sales';
      if (finalRole === 'admin') {
        const validAdminCodes = ['ooh2026', 'admin1234', 'superadmin'];
        if (!adminCode || !validAdminCodes.includes(adminCode.trim())) {
          return res.status(403).json({ error: '관리자 가입 보안코드가 일치하지 않습니다. (기본 코드: ooh2026)' });
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const newUser = store.addUser({
        name,
        email,
        password,
        role: finalRole,
        department: department || '영업팀',
        phone: phone || '',
        status: 'active',
        lastLoginAt: now,
        createdAt: new Date().toISOString().split('T')[0],
      });

      // Log activity
      store.addLog({
        type: 'user_created',
        leadId: newUser.id,
        salesRepId: newUser.id,
        salesRepName: newUser.name,
        description: `새로운 회원가입: ${newUser.name} (${newUser.department} / ${newUser.role === 'admin' ? '관리자' : '영업'})`,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: '회원가입이 정상 완료되었습니다.',
        user: newUser,
        token: `token-${newUser.id}-${Date.now()}`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
      }

      const user = store.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        return res.status(401).json({ error: '가입되지 않은 이메일 주소입니다.' });
      }

      // If user has a password set, verify it
      if (user.password && user.password !== password) {
        return res.status(401).json({ error: '비밀번호가 일치하지 않습니다. 다시 확인해주세요.' });
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
      store.updateUser(user.id, { lastLoginAt: now });
      const updatedUser = store.getUserById(user.id) || user;

      store.addLog({
        type: 'user_login',
        leadId: updatedUser.id,
        salesRepId: updatedUser.id,
        salesRepName: updatedUser.name,
        description: `시스템 로그인: ${updatedUser.name} (${updatedUser.role === 'admin' ? '관리자' : '영업'})`,
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        message: '로그인되었습니다.',
        user: updatedUser,
        token: `token-${updatedUser.id}-${Date.now()}`,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/reset-password', (req, res) => {
    const { email, newPassword } = req.body;
    const user = store.getUsers().find((u) => u.email.toLowerCase() === email?.toLowerCase());

    if (!user) {
      return res.status(404).json({ error: '등록되지 않은 이메일입니다.' });
    }

    if (newPassword) {
      store.updateUser(user.id, { password: newPassword });
    }

    res.json({
      success: true,
      message: `${user.name}님의 비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.`,
    });
  });

  app.post('/api/auth/update-profile', (req, res) => {
    const { id, name, phone, department, password } = req.body;
    const user = store.getUserById(id);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    const updates: Partial<typeof user> = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (department) updates.department = department;
    if (password) updates.password = password;

    const updated = store.updateUser(id, updates);
    res.json({ success: true, message: '프로필 정보가 수정되었습니다.', user: updated });
  });

  app.post('/api/users', (req, res) => {
    try {
      const newUser = store.addUser(req.body);
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    const updated = store.updateUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  });

  app.delete('/api/users/:id', (req, res) => {
    const success = store.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, id: req.params.id });
  });

  // 2. Media (광고 매체) API
  app.get('/api/media', (req, res) => {
    res.json(store.getMedia());
  });

  app.post('/api/media', (req, res) => {
    try {
      const newMedia = store.addMedia(req.body);
      broadcastRealtimeEvent('media_updated', store.getMedia());
      res.status(201).json(newMedia);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/media/batch-upsert', (req, res) => {
    try {
      const { items, protectActiveStatus } = req.body;
      const result = store.upsertMediaBatch(items || [], { protectActiveStatus: protectActiveStatus !== false });
      broadcastRealtimeEvent('media_updated', store.getMedia());
      res.json({ success: true, stats: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/media/:id', (req, res) => {
    const updated = store.updateMedia(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Media not found' });
    broadcastRealtimeEvent('media_updated', store.getMedia());
    res.json(updated);
  });

  app.delete('/api/media/:id', (req, res) => {
    const success = store.deleteMedia(req.params.id);
    if (!success) return res.status(404).json({ error: 'Media not found' });
    broadcastRealtimeEvent('media_updated', store.getMedia());
    res.json({ success: true, id: req.params.id });
  });

  // 3. Leads (인허가 타겟 업체) API
  app.get('/api/leads', (req, res) => {
    res.json(store.getLeads());
  });

  app.post('/api/leads', (req, res) => {
    try {
      const newLead = store.addLead(req.body);
      res.status(201).json(newLead);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/leads/:id', (req, res) => {
    const updated = store.updateLead(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Lead not found' });
    res.json(updated);
  });

  app.delete('/api/leads/:id', (req, res) => {
    const success = store.deleteLead(req.params.id);
    if (!success) return res.status(404).json({ error: 'Lead not found' });
    res.json({ success: true, id: req.params.id });
  });

  // 4. Activity Logs (트래킹 이력) API
  app.get('/api/logs', (req, res) => {
    res.json(store.getLogs());
  });

  app.post('/api/logs', (req, res) => {
    try {
      const newLog = store.addLog({
        ...req.body,
        timestamp: req.body.timestamp || new Date().toISOString(),
      });
      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 5. System Stats API
  app.get('/api/stats', (req, res) => {
    res.json(store.getStats());
  });

  // 6. DB Schema & ERD Spec API
  app.get('/api/schema', (req, res) => {
    res.json({
      sql: SQL_SCHEMA,
      docs: SCHEMA_DOCS,
    });
  });

  // 7. [2단계] 공공데이터 배치 파이프라인 API
  app.get('/api/pipeline/status', (req, res) => {
    res.json(pipelineService.getStatus());
  });

  // 8. [4단계] ARS 연동 및 개인화 웹 리포트 API
  app.post('/api/ars/trigger', (req, res) => {
    try {
      const { leadIds, salesRepId } = req.body;
      if (!leadIds || !Array.isArray(leadIds)) {
        return res.status(400).json({ error: 'leadIds array is required' });
      }
      const sessions = store.triggerArsCalls(leadIds, salesRepId || 'user-sales-1');
      res.json({ success: true, sessions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/ars/webhook', (req, res) => {
    try {
      const { sessionId, dtmfMobilePhone } = req.body;
      if (!sessionId || !dtmfMobilePhone) {
        return res.status(400).json({ error: 'sessionId and dtmfMobilePhone are required' });
      }
      const report = store.processArsWebhookDTMF(sessionId, dtmfMobilePhone);
      if (!report) {
        return res.status(404).json({ error: 'ARS session or lead not found' });
      }
      res.json({ success: true, report });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ars/sessions', (req, res) => {
    res.json(store.getArsSessions());
  });

  app.get('/api/reports/:token', (req, res) => {
    const report = store.getReportByToken(req.params.token);
    if (!report) {
      return res.status(404).json({ error: 'Report not found or link expired' });
    }
    res.json(report);
  });

  // 9. [5단계] 행동 트래킹(픽셀, 클릭) & 리드 스코어링 & 만료 관리 API
  app.get('/api/track/pixel.gif', (req, res) => {
    const { leadId } = req.query;
    if (leadId && typeof leadId === 'string') {
      store.trackPixelOpen(leadId);
    }
    // 1x1 Transparent GIF Image Buffer
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': transparentGif.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    });
    res.end(transparentGif);
  });

  app.get('/api/track/click', (req, res) => {
    const { leadId, redirect } = req.query;
    if (leadId && typeof leadId === 'string') {
      store.trackLinkClick(leadId, redirect ? String(redirect) : undefined);
    }
    const targetUrl = redirect && typeof redirect === 'string' ? redirect : '/';
    res.redirect(targetUrl);
  });

  app.get('/api/leads/scoring', (req, res) => {
    res.json(store.getLeadsWithScoring());
  });

  app.post('/api/media/check-expiring', (req, res) => {
    const expiring = store.checkExpiringMedia();
    res.json({ success: true, count: expiring.length, expiring });
  });

  app.post('/api/pipeline/run', async (req, res) => {
    try {
      const existingLeads = store.getLeads();
      const { updatedLeads, logEntries } = await pipelineService.processPublicDataPipeline(existingLeads);
      store.setLeads(updatedLeads);

      store.addLog({
        type: 'batch_pipeline',
        leadId: 'manual-trigger',
        leadName: '서울시 공공데이터 수동 수집 실행',
        salesRepId: 'user-admin-1',
        salesRepName: '김경영 대표 (관리자)',
        description: `[공공데이터 수동 실행] 신규 인허가 수집, Tier 1 전화번호 분류 및 500m 역세권 캐싱 완료 (${updatedLeads.length}건)`,
        details: { logs: logEntries },
        timestamp: new Date().toISOString(),
      });

      res.json({
        success: true,
        status: pipelineService.getStatus(),
        leadsCount: updatedLeads.length,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });


  // 10. Supabase DB Integration & Status API
  app.get('/api/supabase/status', async (req, res) => {
    const status = await supabaseService.checkConnection();
    res.json(status);
  });

  app.post('/api/supabase/sync', async (req, res) => {
    try {
      const result = await supabaseService.syncAllToSupabase();
      res.json({ success: true, ...result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite Middleware integration for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OOH CRM Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[OOH CRM Server Error]', err);
  process.exit(1);
});
