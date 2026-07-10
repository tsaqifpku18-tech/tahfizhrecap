import { Setoran } from './types';

export const DEMO_SETORAN: Setoran[] = [
  {
    id: "0000001",
    grade: "2 Inter 1",
    nama: "Kean",
    tanggalSetoran: "2026-09-01",
    kegiatan: "Tahsin",
    baris: 2,
    ctt: "Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000002",
    grade: "2 Inter 2",
    nama: "Azzam",
    tanggalSetoran: "2026-09-02",
    kegiatan: "Ziyadah",
    baris: 2,
    ctt: "Kurang Lancar",
    status: "Ulangi"
  },
  {
    id: "0000003",
    grade: "2 Inter 1",
    nama: "Ahmad",
    tanggalSetoran: "2026-09-02",
    kegiatan: "Ziyadah",
    baris: 5,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000004",
    grade: "2 Inter 2",
    nama: "Fathir",
    tanggalSetoran: "2026-09-03",
    kegiatan: "Ziyadah",
    baris: 3,
    ctt: "Kurang Lancar",
    status: "Ulangi"
  },
  {
    id: "0000005",
    grade: "2 Inter 1",
    nama: "Zaid",
    tanggalSetoran: "2026-09-03",
    kegiatan: "Tahsin",
    baris: 4,
    ctt: "Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000006",
    grade: "2 Inter 2",
    nama: "Rania",
    tanggalSetoran: "2026-09-04",
    kegiatan: "Ziyadah",
    baris: 6,
    ctt: "Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000007",
    grade: "2 Inter 1",
    nama: "Farhan",
    tanggalSetoran: "2026-09-04",
    kegiatan: "Tahsin",
    baris: 3,
    ctt: "Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000008",
    grade: "2 Inter 2",
    nama: "Salma",
    tanggalSetoran: "2026-09-05",
    kegiatan: "Ziyadah",
    baris: 5,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000009",
    grade: "2 Inter 1",
    nama: "Hafizh",
    tanggalSetoran: "2026-09-05",
    kegiatan: "Ziyadah",
    baris: 1,
    ctt: "Kurang Lancar",
    status: "Ulangi"
  },
  {
    id: "0000010",
    grade: "2 Inter 2",
    nama: "Aisyah",
    tanggalSetoran: "2026-09-06",
    kegiatan: "Tahsin",
    baris: 4,
    ctt: "Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000011",
    grade: "2 Inter 1",
    nama: "Yusuf",
    tanggalSetoran: "2026-09-06",
    kegiatan: "Ziyadah",
    baris: 7,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000012",
    grade: "2 Inter 2",
    nama: "Fatimah",
    tanggalSetoran: "2026-09-07",
    kegiatan: "Tahsin",
    baris: 3,
    ctt: "Lancar",
    status: "Boleh Lanjut"
  },
  {
    id: "0000013",
    grade: "2 Inter 1",
    nama: "Ibrahim",
    tanggalSetoran: "2026-09-07",
    kegiatan: "Ziyadah",
    baris: 4,
    ctt: "Kurang Lancar",
    status: "Ulangi"
  },
  {
    id: "0000014",
    grade: "2 Inter 2",
    nama: "Khadijah",
    tanggalSetoran: "2026-09-08",
    kegiatan: "Ziyadah",
    baris: 8,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut"
  }
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script untuk Dashboard Penilaian Tahfizh
 * Tempatkan kode ini di Google Sheets -> Ekstensi (Extensions) -> Apps Script
 */

// Menangani permintaan GET: Mengambil data dari Sheet untuk ditampilkan di Dashboard
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return createJsonResponse({ status: "success", data: [] });
  }
  
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip baris jika kolom Nama kosong
    if (!row[2]) continue; 
    
    // Format Tanggal
    var rawDate = row[3];
    var formattedDate = "";
    if (rawDate instanceof Date) {
      formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else if (rawDate) {
      // Jika string, bersihkan spasi
      formattedDate = String(rawDate).trim();
    }
    
    rows.push({
      id: String(row[0] !== undefined ? row[0] : "").trim(),
      grade: String(row[1] !== undefined ? row[1] : "").trim(),
      nama: String(row[2] !== undefined ? row[2] : "").trim(),
      tanggalSetoran: formattedDate,
      kegiatan: String(row[4] !== undefined ? row[4] : "").trim(),
      baris: Number(row[5] || 0),
      ctt: String(row[6] !== undefined ? row[6] : "").trim(),
      status: String(row[7] !== undefined ? row[7] : "").trim()
    });
  }
  
  // Mengembalikan data ke React Dashboard
  return createJsonResponse({ status: "success", data: rows });
}

// Menangani permintaan POST: Menambah data penilaian baru dari Dashboard ke Google Sheets
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tentukan nilai tanggal, default hari ini jika kosong
    var tanggal = postData.tanggalSetoran;
    if (!tanggal) {
      tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    }
    
    // Menambahkan baris baru ke Sheet: 
    // ID (0), Grade (1), Nama (2), Tanggal (3), Kegiatan (4), Baris (5), Ctt (6), Status (7)
    sheet.appendRow([
      String(postData.id || ""),
      String(postData.grade || ""),
      String(postData.nama || ""),
      tanggal,
      String(postData.kegiatan || ""),
      Number(postData.baris || 0),
      String(postData.ctt || ""),
      String(postData.status || "")
    ]);
    
    return createJsonResponse({ 
      status: "success", 
      message: "Alhamdulillah, data penilaian berhasil disimpan ke Google Sheets." 
    });
  } catch (error) {
    return createJsonResponse({ 
      status: "error", 
      message: "Gagal menyimpan data: " + error.toString() 
    });
  }
}

// Helper untuk membuat respon JSON & mengizinkan CORS (Cross-Origin Resource Sharing)
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const APPS_SCRIPT_INSTRUCTIONS = `### Cara Menghubungkan Google Sheet Anda:

1. **Buat Google Sheet Baru** atau buka yang sudah ada.
2. Buat kolom header di Baris ke-1 persis seperti berikut (Huruf besar/kecil tidak berpengaruh, namun pastikan urutannya benar):
   * **Kolom A:** \`ID\`
   * **Kolom B:** \`Grade\`
   * **Kolom C:** \`Nama\`
   * **Kolom D:** \`Tanggal Setoran\`
   * **Kolom E:** \`Kegiatan\`
   * **Kolom F:** \`Baris\`
   * **Kolom G:** \`Ctt\`
   * **Kolom H:** \`Status\` (Boleh Lanjut / Ulangi)
3. Isi beberapa baris data awal sebagai contoh (misal: seperti Kean dan Azzam).
4. Klik menu **Ekstensi** (Extensions) di bagian atas, lalu pilih **Apps Script**.
5. Hapus semua kode default di dalam editor Google Apps Script, lalu **Paste** kode yang telah kami siapkan di tab sebelah.
6. Klik ikon **Simpan** (Floppy disk) atau tekan \`Ctrl + S\`.
7. Klik tombol **Terapkan** (Deploy) di kanan atas -> Pilih **Penerapan Baru** (New deployment).
8. Klik ikon roda gigi (Pilih tipe) -> Pilih **Aplikasi Web** (Web app).
9. Konfigurasi setingannya:
   * **Deskripsi:** \`Tahfizh API\`
   * **Jalankan sebagai (Execute as):** \`Saya (Email Anda)\`
   * **Siapa yang memiliki akses (Who has access):** Pilih **\`Siapa saja\` (Anyone)**. *(Catatan: Ini aman karena Google Sheets hanya bisa dibaca/tulis melalui link Apps Script unik ini)*.
10. Klik **Terapkan** (Deploy). Anda mungkin diminta untuk **Berikan Akses** (Authorize Access) -> Pilih akun Google Anda -> Klik **Lanjutan** (Advanced) -> Pilih **Buka Proyek Tanpa Judul (tidak aman)** -> Klik **Izinkan** (Allow).
11. Salin **URL Aplikasi Web** (Web app URL) yang diberikan (formatnya diawali dengan \`https://script.google.com/macros/s/.../exec\`).
12. Paste URL tersebut ke form **"Link Apps Script"** di panel atas dashboard ini, lalu klik **Hubungkan**!`;
