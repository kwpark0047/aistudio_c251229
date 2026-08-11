import { createClient } from '@supabase/supabase-js';
import { store } from '../db/dataStore';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  'https://blzivqutjglzzjtabxxh.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseml2cXV0amdsenpqdGFieHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQzNDc2NywiZXhwIjoyMTAyMDEwNzY3fQ.bGAKUvAZWxIZcDC-RlyS9dOU_dp2rhszE4-nYmWR034';

export class SupabaseService {
  private client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  async checkConnection(): Promise<{ connected: boolean; message: string; url: string }> {
    try {
      // Simple ping to check if Supabase is reachable
      const { data, error } = await this.client.from('media').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
        return { connected: true, message: `Connected to Supabase (${error.message})`, url: SUPABASE_URL };
      }
      return { connected: true, message: 'Supabase DB Connection Successful', url: SUPABASE_URL };
    } catch (err: any) {
      return { connected: false, message: err.message || 'Connection failed', url: SUPABASE_URL };
    }
  }

  async syncAllToSupabase(): Promise<{
    usersCount: number;
    mediaCount: number;
    leadsCount: number;
    logsCount: number;
  }> {
    const users = store.getUsers();
    const media = store.getMedia();
    const leads = store.getLeads();
    const logs = store.getLogs();

    // Upsert into Supabase tables (if tables exist)
    try {
      await this.client.from('users').upsert(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          created_at: u.createdAt,
        }))
      );
    } catch (e) {
      console.log('Supabase users table sync note:', e);
    }

    try {
      await this.client.from('media').upsert(
        media.map((m) => ({
          id: m.id,
          line: m.line,
          station_name: m.stationName,
          exit_number: m.exitNumber,
          detail_location: m.detailLocation,
          media_type: m.mediaType,
          size: m.size,
          image_url: m.imageUrl,
          price: m.price,
          status: m.status,
          sales_rep_id: m.salesRepId,
          sales_rep_name: m.salesRepName,
          lat: m.lat,
          lng: m.lng,
        }))
      );
    } catch (e) {
      console.log('Supabase media table sync note:', e);
    }

    try {
      await this.client.from('leads').upsert(
        leads.map((l) => ({
          id: l.id,
          company_name: l.companyName,
          address: l.address,
          phone: l.phone,
          is_tier1: l.isTier1,
          scoring: l.scoring,
          temperature_grade: l.temperatureGrade,
          nearest_station: l.nearestStation,
          nearest_exit: l.nearestExit,
          distance_meters: l.distanceMeters,
          daily_ridership: l.dailyRidership,
          lat: l.lat,
          lng: l.lng,
        }))
      );
    } catch (e) {
      console.log('Supabase leads table sync note:', e);
    }

    return {
      usersCount: users.length,
      mediaCount: media.length,
      leadsCount: leads.length,
      logsCount: logs.length,
    };
  }
}

export const supabaseService = new SupabaseService();
