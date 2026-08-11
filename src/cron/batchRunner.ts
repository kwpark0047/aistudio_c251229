import cron from 'node-cron';
import { pipelineService } from '../services/seoulDataPipeline';
import { store } from '../db/dataStore';

/**
 * Initializes background Cron job running at 02:00 AM daily
 */
export function initBatchCronJob() {
  console.log('[Batch Pipeline] Initializing Seoul Open Data Cron Scheduler (0 2 * * *)...');

  // Schedule cron job for 02:00 AM every day
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron Job] Executing 02:00 AM daily public data batch pipeline...');
    try {
      const existingLeads = store.getLeads();
      const { updatedLeads, logEntries } = await pipelineService.processPublicDataPipeline(existingLeads);
      
      // Update data store
      store.setLeads(updatedLeads);

      // Record system activity log
      store.addLog({
        type: 'batch_pipeline',
        leadId: 'system-batch',
        leadName: '서울시 공공데이터 배치 파이프라인',
        salesRepId: 'system-bot',
        salesRepName: '크론 자동화 로봇',
        description: `[새벽 2시 크론배치 완료] 신규 인허가 수집, Tier 1 분류 및 Haversine 500m 역세권 캐싱 (${updatedLeads.length}건 업데이트)`,
        details: {
          tier1Count: updatedLeads.filter(l => l.isTier1).length,
          cronTime: '02:00:00 AM',
          logs: logEntries,
        },
        timestamp: new Date().toISOString(),
      });

      console.log('[Cron Job] Daily 02:00 AM public data batch successfully completed.');
    } catch (err) {
      console.error('[Cron Job Error] Failed to run public data pipeline:', err);
    }
  });

  console.log('[Batch Pipeline] Cron scheduler active: "0 2 * * *" (Daily at 02:00 AM)');
}
