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
