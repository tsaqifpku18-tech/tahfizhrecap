import { Setoran, UserAccount } from './types';

export function getSatuanByKegiatan(kegiatan: string): string {
  const k = kegiatan.toLowerCase();
  if (k.includes('tahsin') || k.includes('murojaah') || k.includes('murajaah')) {
    return 'halaman';
  }
  if (k.includes('ziyadah')) {
    return 'baris';
  }
  return 'baris';
}

const RAW_DEMO_SETORAN: Omit<Setoran, 'satuan'>[] = [
  {
    id: "0000001",
    grade: "2 Inter 1",
    nama: "Kean",
    tanggalSetoran: "2026-09-01",
    kegiatan: "Tahsin (IQRA')",
    baris: 2,
    ctt: "Lancar",
    status: "Boleh Lanjut",
    surah: "Iqra Bab 4"
  },
  {
    id: "0000002",
    grade: "2 Inter 2",
    nama: "Azzam",
    tanggalSetoran: "2026-09-02",
    kegiatan: "Ziyadah",
    baris: 2,
    ctt: "Kurang Lancar",
    status: "Ulangi",
    surah: "An-Naba' 1-10"
  },
  {
    id: "0000003",
    grade: "2 Inter 1",
    nama: "Ahmad",
    tanggalSetoran: "2026-09-02",
    kegiatan: "Ziyadah",
    baris: 5,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut",
    surah: "An-Nazi'at 1-15"
  },
  {
    id: "0000004",
    grade: "2 Inter 2",
    nama: "Fathir",
    tanggalSetoran: "2026-09-03",
    kegiatan: "Ziyadah",
    baris: 3,
    ctt: "Kurang Lancar",
    status: "Ulangi",
    surah: "Abasa 1-10"
  },
  {
    id: "0000005",
    grade: "2 Inter 1",
    nama: "Zaid",
    tanggalSetoran: "2026-09-03",
    kegiatan: "Tahsin (Qoidah)",
    baris: 4,
    ctt: "Lancar",
    status: "Boleh Lanjut",
    surah: "Qoidah Bagian 2"
  },
  {
    id: "0000006",
    grade: "2 Inter 2",
    nama: "Rania",
    tanggalSetoran: "2026-09-04",
    kegiatan: "Ziyadah",
    baris: 6,
    ctt: "Lancar",
    status: "Boleh Lanjut",
    surah: "At-Takwir 1-15"
  },
  {
    id: "0000007",
    grade: "2 Inter 1",
    nama: "Farhan",
    tanggalSetoran: "2026-09-04",
    kegiatan: "Tahsin (Tilawah)",
    baris: 3,
    ctt: "Lancar",
    status: "Boleh Lanjut",
    surah: "Al-Infitar"
  },
  {
    id: "0000008",
    grade: "2 Inter 2",
    nama: "Salma",
    tanggalSetoran: "2026-09-05",
    kegiatan: "Ziyadah",
    baris: 5,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut",
    surah: "Al-Mutaffifin 1-20"
  },
  {
    id: "0000009",
    grade: "2 Inter 1",
    nama: "Hafizh",
    tanggalSetoran: "2026-09-05",
    kegiatan: "Ziyadah",
    baris: 1,
    ctt: "Kurang Lancar",
    status: "Ulangi",
    surah: "Al-Inshiqaq 1-5"
  },
  {
    id: "0000010",
    grade: "2 Inter 2",
    nama: "Aisyah",
    tanggalSetoran: "2026-09-06",
    kegiatan: "Tahsin (Tilawah)",
    baris: 4,
    ctt: "Lancar",
    status: "Boleh Lanjut",
    surah: "Al-Buruj"
  },
  {
    id: "0000011",
    grade: "2 Inter 1",
    nama: "Yusuf",
    tanggalSetoran: "2026-09-06",
    kegiatan: "Ziyadah",
    baris: 7,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut",
    surah: "At-Tariq 1-17"
  },
  {
    id: "0000012",
    grade: "2 Inter 2",
    nama: "Fatimah",
    tanggalSetoran: "2026-09-07",
    kegiatan: "Tahsin (IQRA')",
    baris: 3,
    ctt: "Lancar",
    status: "Boleh Lanjut",
    surah: "Iqra Bab 5"
  },
  {
    id: "0000013",
    grade: "2 Inter 1",
    nama: "Ibrahim",
    tanggalSetoran: "2026-09-07",
    kegiatan: "Ziyadah",
    baris: 4,
    ctt: "Kurang Lancar",
    status: "Ulangi",
    surah: "Al-A'la 1-10"
  },
  {
    id: "0000014",
    grade: "2 Inter 2",
    nama: "Khadijah",
    tanggalSetoran: "2026-09-08",
    kegiatan: "Ziyadah",
    baris: 8,
    ctt: "Sangat Lancar",
    status: "Boleh Lanjut",
    surah: "Al-Ghashiyah 1-26"
  }
];

export const DEMO_SETORAN: Setoran[] = RAW_DEMO_SETORAN.map(item => ({
  ...item,
  satuan: getSatuanByKegiatan(item.kegiatan)
}));

export const DEMO_AKUN: UserAccount[] = [
  { id: "ustadz1", nama: "Ustadz Ahmad", password: "password123" },
  { id: "ustadz2", nama: "Ustadzah Rania", password: "password123" },
  { id: "student_kean", nama: "Kean", password: "kean123" },
  { id: "student_azzam", nama: "Azzam", password: "azzam123" },
  { id: "student_ahmad", nama: "Ahmad", password: "ahmad123" },
  { id: "student_fathir", nama: "Fathir", password: "fathir123" },
  { id: "student_zaid", nama: "Zaid", password: "zaid123" },
  { id: "student_rania", nama: "Rania", password: "rania123" }
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script untuk Dashboard Penilaian Tahfizh & Sistem Login
 * Tempatkan kode ini di Google Sheets -> Ekstensi (Extensions) -> Apps Script
 */

// Menangani permintaan GET: Mengambil data dari Sheet untuk ditampilkan di Dashboard
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Ambil parameter tab atau action
  var tabParam = "";
  if (e && e.parameter) {
    tabParam = (e.parameter.tab || e.parameter.action || "").toLowerCase().trim();
  }
  
  // JIKA PERMINTAAN DATA AKUN (LOGIN)
  if (tabParam === "akun" || tabParam === "get_accounts") {
    var sheetAkun = ss.getSheetByName("Akun") || ss.getSheetByName("akun") || ss.getSheetByName("AKUN");
    if (!sheetAkun) {
      // Jika sheet Akun belum dibuat, kembalikan akun demo ustadz default agar tidak terkunci
      return createJsonResponse({ 
        status: "success", 
        data: [{ id: "ustadz1", nama: "Ustadz Ahmad Default", password: "password123" }] 
      });
    }
    
    var data = sheetAkun.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ status: "success", data: [] });
    }
    
    var headers = data[0];
    var idIdx = 0;
    var namaaIdx = 1;
    var passIdx = 2;
    
    for (var h = 0; h < headers.length; h++) {
      var headerStr = String(headers[h]).toLowerCase().trim();
      if (headerStr === "id" || headerStr === "id pengguna") idIdx = h;
      else if (headerStr === "namaa" || headerStr === "nama" || headerStr === "profil") namaaIdx = h;
      else if (headerStr === "password" || headerStr === "sandi" || headerStr === "pass") passIdx = h;
    }
    
    var accounts = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[idIdx]) continue;
      accounts.push({
        id: String(row[idIdx]).trim(),
        nama: String(row[namaaIdx] !== undefined ? row[namaaIdx] : "").trim(),
        password: String(row[passIdx] !== undefined ? row[passIdx] : "").trim()
      });
    }
    return createJsonResponse({ status: "success", data: accounts });
  }

  // JIKA PERMINTAAN DATA SETORAN (DEFAULT)
  var sheet = ss.getSheetByName("Penilaian") || ss.getSheetByName("penilaian") || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return createJsonResponse({ status: "success", data: [] });
  }
  
  var headers = data[0];
  
  // Deteksi indeks kolom secara dinamis berdasarkan nama header (dengan fallback ke indeks standar)
  var idIdx = 0;
  var gradeIdx = 1;
  var namaIdx = 2;
  var tanggalIdx = 3;
  var surahIdx = 4;
  var kegiatanIdx = 5;
  var barisIdx = 6;
  var cttIdx = 7;
  var satuanIdx = 8;
  var statusIdx = 9;
  
  for (var h = 0; h < headers.length; h++) {
    var headerStr = String(headers[h]).toLowerCase().trim();
    if (headerStr === "id") idIdx = h;
    else if (headerStr === "grade" || headerStr === "kelas" || headerStr === "grade/kelas") gradeIdx = h;
    else if (headerStr === "nama" || headerStr === "nama siswa") namaIdx = h;
    else if (headerStr === "tanggal" || headerStr === "tanggal setoran" || headerStr === "tanggal_setoran") tanggalIdx = h;
    else if (headerStr === "surah" || headerStr === "surat" || headerStr === "surah/bab" || headerStr === "surah/materi") surahIdx = h;
    else if (headerStr === "kegiatan") kegiatanIdx = h;
    else if (headerStr === "baris" || headerStr === "jumlah" || headerStr === "jumlah baris" || headerStr === "baris/halaman" || headerStr === "halaman") barisIdx = h;
    else if (headerStr === "ctt" || headerStr === "catatan" || headerStr === "nilai" || headerStr === "catatan penilaian") cttIdx = h;
    else if (headerStr === "satuan") satuanIdx = h;
    else if (headerStr === "status") statusIdx = h;
  }
  
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip baris jika kolom Nama kosong
    if (!row[namaIdx]) continue; 
    
    // Format Tanggal
    var rawDate = row[tanggalIdx];
    var formattedDate = "";
    if (rawDate instanceof Date) {
      formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else if (rawDate) {
      // Jika string, bersihkan spasi
      formattedDate = String(rawDate).trim();
    }
    
    var kegiatanVal = String(row[kegiatanIdx] !== undefined ? row[kegiatanIdx] : "").trim();
    var computedSatuan = "";
    var kLower = kegiatanVal.toLowerCase();
    if (kLower.indexOf("tahsin") !== -1 || kLower.indexOf("murojaah") !== -1 || kLower.indexOf("murajaah") !== -1) {
      computedSatuan = "halaman";
    } else {
      computedSatuan = "baris";
    }
    
    var satuanVal = (satuanIdx !== -1 && row[satuanIdx] !== undefined) ? String(row[satuanIdx]).trim() : "";
    if (!satuanVal) {
      satuanVal = computedSatuan;
    }
    
    rows.push({
      id: String(row[idIdx] !== undefined ? row[idIdx] : "").trim(),
      grade: String(row[gradeIdx] !== undefined ? row[gradeIdx] : "").trim(),
      nama: String(row[namaIdx] !== undefined ? row[namaIdx] : "").trim(),
      tanggalSetoran: formattedDate,
      kegiatan: kegiatanVal,
      baris: Number(row[barisIdx] || 0),
      ctt: String(row[cttIdx] !== undefined ? row[cttIdx] : "").trim(),
      status: String(row[statusIdx] !== undefined ? row[statusIdx] : "").trim(),
      surah: String(row[surahIdx] !== undefined ? row[surahIdx] : "").trim(),
      satuan: satuanVal
    });
  }
  
  // Mengembalikan data ke React Dashboard
  return createJsonResponse({ status: "success", data: rows });
}

// Menangani permintaan POST: Menambah (create), Mengedit (edit), atau Menghapus (delete) data penilaian dari Dashboard ke Google Sheets
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var action = postData.action || "create";
    
    var postSatuan = postData.satuan;
    if (!postSatuan) {
      var kLower = String(postData.kegiatan || "").toLowerCase();
      if (kLower.indexOf("tahsin") !== -1 || kLower.indexOf("murojaah") !== -1 || kLower.indexOf("murajaah") !== -1) {
        postSatuan = "halaman";
      } else {
        postSatuan = "baris";
      }
    }
    
    if (action === "create") {
      // Tentukan nilai tanggal, default hari ini jika kosong
      var tanggal = postData.tanggalSetoran;
      if (!tanggal) {
        tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      // Menambahkan baris baru ke Sheet: 
      // ID (A), Grade (B), Nama (C), Tanggal (D), Surah (E), Kegiatan (F), Jumlah/Baris (G), Ctt/Nilai (H), Satuan (I), Status (J)
      sheet.appendRow([
        String(postData.id || ""),
        String(postData.grade || ""),
        String(postData.nama || ""),
        tanggal,
        String(postData.surah || ""),
        String(postData.kegiatan || ""),
        Number(postData.baris || 0),
        String(postData.ctt || ""),
        String(postSatuan || ""),
        String(postData.status || "")
      ]);
      
      return createJsonResponse({ 
        status: "success", 
        message: "Alhamdulillah, data penilaian berhasil disimpan ke Google Sheets." 
      });
    } else if (action === "edit") {
      var data = sheet.getDataRange().getValues();
      var idToFind = String(postData.id || "").trim();
      var foundRow = -1;
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === idToFind) {
          foundRow = i + 1; // baris di Sheets dimulai dari 1
          break;
        }
      }
      
      if (foundRow === -1) {
        // Pencarian alternatif: nama siswa
        var nameToFind = String(postData.nama || "").toLowerCase().trim();
        for (var i = 1; i < data.length; i++) {
          if (String(data[i][2]).toLowerCase().trim() === nameToFind) {
            foundRow = i + 1;
            break;
          }
        }
      }
      
      if (foundRow !== -1) {
        var tanggal = postData.tanggalSetoran || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        sheet.getRange(foundRow, 1, 1, 10).setValues([[
          idToFind,
          String(postData.grade || ""),
          String(postData.nama || ""),
          tanggal,
          String(postData.surah || ""),
          String(postData.kegiatan || ""),
          Number(postData.baris || 0),
          String(postData.ctt || ""),
          String(postSatuan || ""),
          String(postData.status || "")
        ]]);
        return createJsonResponse({ 
          status: "success", 
          message: "Alhamdulillah, data penilaian berhasil diperbarui." 
        });
      } else {
        return createJsonResponse({ 
          status: "error", 
          message: "Data penilaian tidak ditemukan." 
        });
      }
    } else if (action === "delete") {
      var data = sheet.getDataRange().getValues();
      var idToFind = String(postData.id || "").trim();
      var foundRow = -1;
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === idToFind) {
          foundRow = i + 1;
          break;
        }
      }
      
      if (foundRow !== -1) {
        sheet.deleteRow(foundRow);
        return createJsonResponse({ 
          status: "success", 
          message: "Data penilaian berhasil dihapus." 
        });
      } else {
        return createJsonResponse({ 
          status: "error", 
          message: "Data penilaian tidak ditemukan." 
        });
      }
    }
    
    return createJsonResponse({ status: "error", message: "Aksi tidak dikenali." });
  } catch (error) {
    return createJsonResponse({ 
      status: "error", 
      message: "Gagal memproses data: " + error.toString() 
    });
  }
}

// Helper untuk membuat respon JSON & mengizinkan CORS (Cross-Origin Resource Sharing)
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const APPS_SCRIPT_INSTRUCTIONS = `### Cara Menghubungkan Google Sheet Anda & Sistem Akun:

1. **Buat Google Sheet Baru** atau buka yang sudah ada.
2. Buat **Dua Tab / Sheet**:
   * **Tab ke-1 bernama "Penilaian"** (atau biarkan default sebagai sheet pertama) dengan header kolom sebagai berikut:
     * **Kolom A:** \`ID\`
     * **Kolom B:** \`Grade\`
     * **Kolom C:** \`Nama\`
     * **Kolom D:** \`Tanggal Setoran\` (Format: dd/mmmm/yyyy)
     * **Kolom E:** \`Surah\`
     * **Kolom F:** \`Kegiatan\`
     * **Kolom G:** \`Jumlah\`
     * **Kolom H:** \`Nilai\`
     * **Kolom I:** \`Satuan\` (halaman / baris)
     * **Kolom J:** \`Status\` (Boleh Lanjut / Ulangi)
   * **Tab ke-2 bernama "Akun"** (atau "akun") dengan header kolom sebagai berikut:
     * **Kolom A:** \`ID\` (Jika mengandung kata 'Ustadz', misal: 'ustadz_ahmad', maka dapat melihat semua data. Jika tidak, hanya melihat data dirinya sendiri)
     * **Kolom B:** \`Namaa\` (Untuk profil siswa / ustadz)
     * **Kolom C:** \`Password\` (Sandi login siswa / ustadz)
3. Isi beberapa baris data awal di kedua tab sebagai contoh (misal di tab Akun: \`ID: ustadz1, Namaa: Ustadz Ahmad, Password: password123\` dan \`ID: student_kean, Namaa: Kean, Password: kean123\`).
4. Klik menu **Ekstensi** (Extensions) di bagian atas, lalu pilih **Apps Script**.
5. Hapus semua kode default di dalam editor Google Apps Script, lalu **Paste** kode yang telah kami siapkan di tab sebelah.
6. Klik ikon **Simpan** (Floppy disk) atau tekan \`Ctrl + S\`.
7. Klik tombol **Terapkan** (Deploy) di kanan atas -> Pilih **Penerapan Baru** (New deployment).
8. Klik ikon roda gigi (Pilih tipe) -> Pilih **Aplikasi Web** (Web app).
9. Konfigurasi setingannya:
   * **Deskripsi:** \`Tahfizh API & Auth\`
   * **Jalankan sebagai (Execute as):** \`Saya (Email Anda)\`
   * **Siapa yang memiliki akses (Who has access):** Pilih **\`Siapa saja\` (Anyone)**.
10. Klik **Terapkan** (Deploy) dan setujui izin jika diminta.
11. Salin **URL Aplikasi Web** (Web app URL) yang diberikan dan masukkan di form Apps Script URL di panel pengaturan.`;
