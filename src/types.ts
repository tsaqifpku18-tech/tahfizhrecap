export interface Setoran {
  id: string;
  grade: string;
  nama: string;
  tanggalSetoran: string; // Format: YYYY-MM-DD or standard string date
  kegiatan: 'Tahsin' | 'Ziyadah' | string;
  baris: number;
  ctt: string; // Catatan: "Lancar", "Kurang Lancar", etc.
  status: 'Boleh Lanjut' | 'Ulangi' | string;
}

export interface Settings {
  appsScriptUrl: string;
  sheetName: string;
}

export interface DashboardStats {
  totalSetoran: number;
  totalSiswa: number;
  lancarRate: number;
  avgBaris: number;
}
