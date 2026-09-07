import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Vehicle {
  id: string;
  plate_number: string;
  make: string;
  model: string;
  image_url: string;
  is_authorized: boolean;
  owner_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleEvent {
  id: string;
  vehicle_id?: string;
  plate_number: string;
  make: string;
  model: string;
  confidence: number;
  image_url: string;
  weather_condition: string;
  temperature?: number;
  status: 'allowed' | 'denied';
  gate_action: 'opened' | 'closed';
  timestamp: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'unauthorized' | 'weather' | 'system';
  message: string;
  is_read: boolean;
  created_at: string;
}
