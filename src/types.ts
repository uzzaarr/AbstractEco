export interface GlobalData {
  totalVolume30d: number;
  totalUsers30d: number;
  totalTrx30d: number;
}

export interface ProjectStats30d {
  volume: number;
  users: number;
  trx: number;
}

export interface ProjectData {
  id: string;
  name: string;
  stats30d: ProjectStats30d;
  volume?: number;
  users?: number;
  trx?: number;
}

export interface DashboardData {
  globalData: GlobalData;
  projects: ProjectData[];
  updatedAt: string;
}

export interface VolumeTrackerData {
  user_address: string;
  estimated_volume_usd: number;
  swap_transactions: number;
  dex_confirmed_volume_usd: number;
  fallback_transfer_volume_usd: number;
  dex_confirmed_tx_count: number;
  fallback_tx_count: number;
  first_swap: string;
  last_swap: string;
  updated_at: string;
}
