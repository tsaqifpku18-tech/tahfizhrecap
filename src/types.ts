export interface Setoran {
  id: string;
  grade: string;
  nama: string;
  tanggalSetoran: string; // Format: YYYY-MM-DD or standard string date
  kegiatan: 'Tahsin' | 'Ziyadah' | string;
  baris: number;
  ctt: string; // Catatan: "Lancar", "Kurang Lancar", etc.
  status: 'Boleh Lanjut' | 'Ulangi' | string;
  surah?: string; // Nama surah/materi yang disetorkan
  satuan?: string; // Satuan kegiatan (baris / halaman)
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

export interface UserAccount {
  id: string;
  nama: string;
  password?: string;
}

export interface UserSession {
  id: string;
  nama: string;
  role: 'ustadz' | 'siswa';
}

export interface TugasHarian {
  id: string;
  tanggal: string; // YYYY-MM-DD
  grade: string;   // e.g. "All", "2 Inter 3"
  materi: string;  // e.g. "Murojaah Juz 30"
  ustadz: string;  // Name of assigner
  keterangan: string; // Additional instructions
}

