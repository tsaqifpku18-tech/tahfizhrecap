import { Setoran, UserAccount, TugasHarian } from './types';

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

export const DEMO_TUGAS_HARIAN: TugasHarian[] = [
  {
    id: "t1",
    tanggal: "2026-07-13",
    grade: "2 Inter 1",
    materi: "Ziyadah Surah Al-Ghashiyah baris 1-10",
    ustadz: "Ustadz Ahmad",
    keterangan: "Mohon diulang-ulang minimal 15 kali sebelum disetorkan besok pagi."
  },
  {
    id: "t2",
    tanggal: "2026-07-13",
    grade: "2 Inter 2",
    materi: "Murojaah Surah An-Naba & An-Nazi'at",
    ustadz: "Ustadzah Rania",
    keterangan: "Lancar dan mutqin untuk evaluasi pekanan."
  },
  {
    id: "t3",
    tanggal: "2026-07-12",
    grade: "All",
    materi: "Adab terhadap orang tua dan guru",
    ustadz: "Ustadz Ahmad",
    keterangan: "Pelajari dan amalkan adab ke-4 di buku saku."
  }
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

  // JIKA PERMINTAAN DATA TUGAS HARIAN
  if (tabParam === "tugas" || tabParam === "tugas_harian" || tabParam === "tugasharian") {
    var sheetTugas = ss.getSheetByName("Tugas Harian") || ss.getSheetByName("tugas_harian") || ss.getSheetByName("Tugas") || ss.getSheetByName("tugas");
    if (!sheetTugas) {
      // Jika tab belum ada, return data kosong
      return createJsonResponse({ status: "success", data: [] });
    }
    
    var data = sheetTugas.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ status: "success", data: [] });
    }
    
    var headers = data[0];
    var idIdx = -1;
    var tanggalIdx = -1;
    var gradeIdx = -1;
    var ustadzIdx = -1;
    var ketIdx = -1;
    var siswaIdx = -1;
    
    // New split columns
    var tugasZiyadahIdx = -1;
    var tugasMurojaahIdx = -1;
    var tugasMateriIdx = -1;
    var legacyMateriIdx = -1;
    
    for (var h = 0; h < headers.length; h++) {
      var headerStr = String(headers[h]).toLowerCase().trim();
      if (headerStr === "id") idIdx = h;
      else if (headerStr.indexOf("tanggal") !== -1 || headerStr.indexOf("tgl") !== -1 || headerStr.indexOf("date") !== -1) tanggalIdx = h;
      else if (headerStr.indexOf("grade") !== -1 || headerStr.indexOf("kelas") !== -1 || headerStr.indexOf("class") !== -1) gradeIdx = h;
      
      // Look for specific "tugas ziyadah", "tugas murojaah", "tugas materi" columns first
      else if (headerStr.indexOf("tugas ziyadah") !== -1 || headerStr === "ziyadah") tugasZiyadahIdx = h;
      else if (headerStr.indexOf("tugas murojaah") !== -1 || headerStr === "murojaah") tugasMurojaahIdx = h;
      else if (headerStr === "tugas materi" || headerStr === "tugas_materi") tugasMateriIdx = h;
      else if (headerStr.indexOf("materi") !== -1 || headerStr === "tugas" || headerStr.indexOf("tugas harian") !== -1) legacyMateriIdx = h;
      
      else if (headerStr.indexOf("ustadz") !== -1 || headerStr.indexOf("guru") !== -1 || headerStr.indexOf("pembuat") !== -1 || headerStr.indexOf("teacher") !== -1) ustadzIdx = h;
      else if (headerStr.indexOf("keterangan") !== -1 || headerStr.indexOf("ket") !== -1 || headerStr.indexOf("catatan") !== -1 || headerStr.indexOf("note") !== -1) ketIdx = h;
      else if (headerStr.indexOf("siswa") !== -1 || headerStr.indexOf("penerima") !== -1 || headerStr.indexOf("student") !== -1) siswaIdx = h;
    }
    
    var tasks = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row.length === 0 || !row[0]) continue;
      
      var zVal = tugasZiyadahIdx !== -1 ? String(row[tugasZiyadahIdx] !== undefined ? row[tugasZiyadahIdx] : "").trim() : "";
      var mVal = tugasMurojaahIdx !== -1 ? String(row[tugasMurojaahIdx] !== undefined ? row[tugasMurojaahIdx] : "").trim() : "";
      var tmVal = tugasMateriIdx !== -1 ? String(row[tugasMateriIdx] !== undefined ? row[tugasMateriIdx] : "").trim() : "";
      var legVal = legacyMateriIdx !== -1 ? String(row[legacyMateriIdx] !== undefined ? row[legacyMateriIdx] : "").trim() : "";
      
      // If separate column values are present, package them into a JSON string so frontend handles it seamlessly
      var finalMateri = "";
      if (zVal || mVal || tmVal) {
        finalMateri = JSON.stringify({
          ziyadah: zVal,
          murojaah: mVal,
          tugasMateri: tmVal
        });
      } else {
        // Fallback to legacy single "materi" column
        finalMateri = legVal;
      }
      
      var rawDate = tanggalIdx !== -1 ? row[tanggalIdx] : "";
      var formattedDate = "";
      if (rawDate instanceof Date) {
        formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else if (rawDate) {
        formattedDate = String(rawDate).trim();
      }
      
      tasks.push({
        id: idIdx !== -1 ? String(row[idIdx] !== undefined ? row[idIdx] : "").trim() : "",
        tanggal: formattedDate,
        grade: gradeIdx !== -1 ? String(row[gradeIdx] !== undefined ? row[gradeIdx] : "").trim() : "",
        materi: finalMateri,
        ustadz: ustadzIdx !== -1 ? String(row[ustadzIdx] !== undefined ? row[ustadzIdx] : "").trim() : "",
        keterangan: ketIdx !== -1 ? String(row[ketIdx] !== undefined ? row[ketIdx] : "").trim() : "",
        siswa: siswaIdx !== -1 ? String(row[siswaIdx] !== undefined ? row[siswaIdx] : "All").trim() : "All"
      });
    }
    return createJsonResponse({ status: "success", data: tasks });
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

// Menangani permintaan POST: Menambah (create), Mengedit (edit), atau Menghapus (delete) data penilaian/tugas dari Dashboard ke Google Sheets
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targetTab = (postData.targetTab || "").toLowerCase().trim();
    var sheet;
    
    // Tentukan sheet berdasarkan targetTab
    if (targetTab === "tugas" || targetTab === "tugas_harian" || targetTab === "tugasharian") {
      sheet = ss.getSheetByName("Tugas Harian") || ss.getSheetByName("tugas_harian") || ss.getSheetByName("Tugas") || ss.getSheetByName("tugas");
      if (!sheet) {
        // Buat sheet Tugas Harian jika belum ada
        sheet = ss.insertSheet("Tugas Harian");
        sheet.appendRow(["ID", "Tanggal", "Grade", "Tugas Ziyadah", "Tugas Murojaah", "Tugas Materi", "Ustadz", "Keterangan", "Siswa"]);
      }
    } else {
      sheet = ss.getSheetByName("Penilaian") || ss.getSheetByName("penilaian") || ss.getSheets()[0];
    }
    
    var action = postData.action || "create";
    
    // JIKA AKSI TUGAS HARIAN
    if (targetTab === "tugas" || targetTab === "tugas_harian" || targetTab === "tugasharian") {
      if (action === "create") {
        var tanggal = postData.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        
        // Find existing headers to map columns dynamically
        var headers = [];
        if (sheet.getLastColumn() > 0) {
          headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        }
        
        if (headers.length === 0) {
          headers = ["ID", "Tanggal", "Grade", "Tugas Ziyadah", "Tugas Murojaah", "Tugas Materi", "Ustadz", "Keterangan", "Siswa"];
          sheet.appendRow(headers);
        }
        
        var idIdx = headers.indexOf("ID");
        var tanggalIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("tanggal") !== -1 || String(h).toLowerCase().indexOf("tgl") !== -1 || String(h).toLowerCase().indexOf("date") !== -1; });
        var gradeIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("grade") !== -1 || String(h).toLowerCase().indexOf("kelas") !== -1 || String(h).toLowerCase().indexOf("class") !== -1; });
        
        var tugasZiyadahIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("ziyadah") !== -1; });
        var tugasMurojaahIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("murojaah") !== -1; });
        var tugasMateriIdx = headers.findIndex(function(h) { return String(h).toLowerCase() === "tugas materi" || String(h).toLowerCase() === "tugas_materi"; });
        var legacyMateriIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("materi") !== -1 || String(h).toLowerCase() === "tugas" || String(h).toLowerCase().indexOf("tugas harian") !== -1; });
        
        var ustadzIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("ustadz") !== -1 || String(h).toLowerCase().indexOf("guru") !== -1 || String(h).toLowerCase().indexOf("pembuat") !== -1 || String(h).toLowerCase().indexOf("teacher") !== -1; });
        var ketIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("keterangan") !== -1 || String(h).toLowerCase().indexOf("ket") !== -1 || String(h).toLowerCase().indexOf("catatan") !== -1 || String(h).toLowerCase().indexOf("note") !== -1; });
        var siswaIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("siswa") !== -1 || String(h).toLowerCase().indexOf("penerima") !== -1 || String(h).toLowerCase().indexOf("student") !== -1; });
        
        if (idIdx === -1) idIdx = 0;
        if (tanggalIdx === -1) tanggalIdx = 1;
        if (gradeIdx === -1) gradeIdx = 2;
        
        // Parse raw string or extract direct attributes
        var zVal = "";
        var mVal = "";
        var tmVal = "";
        if (postData.materi) {
          try {
            var parsed = JSON.parse(postData.materi);
            if (parsed && typeof parsed === 'object') {
              zVal = String(parsed.ziyadah || "").trim();
              mVal = String(parsed.murojaah || "").trim();
              tmVal = String(parsed.tugasMateri || parsed.materi || "").trim();
            } else {
              tmVal = String(postData.materi).trim();
            }
          } catch(e) {
            tmVal = String(postData.materi).trim();
          }
        }
        if (postData.ziyadah) zVal = String(postData.ziyadah).trim();
        if (postData.murojaah) mVal = String(postData.murojaah).trim();
        if (postData.tugasMateri) tmVal = String(postData.tugasMateri).trim();
        
        var maxIdx = Math.max(idIdx, tanggalIdx, gradeIdx, ustadzIdx, ketIdx, siswaIdx, tugasZiyadahIdx, tugasMurojaahIdx, tugasMateriIdx, legacyMateriIdx);
        if (maxIdx < 8) maxIdx = 8;
        
        var rowData = new Array(maxIdx + 1).fill("");
        rowData[idIdx] = String(postData.id || "");
        rowData[tanggalIdx] = tanggal;
        rowData[gradeIdx] = String(postData.grade || "");
        if (ustadzIdx !== -1) rowData[ustadzIdx] = String(postData.ustadz || "");
        if (ketIdx !== -1) rowData[ketIdx] = String(postData.keterangan || "");
        if (siswaIdx !== -1) rowData[siswaIdx] = String(postData.siswa || "All");
        
        if (tugasZiyadahIdx !== -1) rowData[tugasZiyadahIdx] = zVal;
        if (tugasMurojaahIdx !== -1) rowData[tugasMurojaahIdx] = mVal;
        if (tugasMateriIdx !== -1) rowData[tugasMateriIdx] = tmVal;
        
        if (legacyMateriIdx !== -1) {
          if (tugasZiyadahIdx !== -1 || tugasMurojaahIdx !== -1) {
            rowData[legacyMateriIdx] = tmVal;
          } else {
            rowData[legacyMateriIdx] = String(postData.materi || "");
          }
        }
        
        sheet.appendRow(rowData);
        return createJsonResponse({ status: "success", message: "Alhamdulillah, tugas harian berhasil ditambahkan." });
      } else if (action === "edit") {
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
          var headers = data[0];
          var idIdx = headers.indexOf("ID");
          var tanggalIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("tanggal") !== -1 || String(h).toLowerCase().indexOf("tgl") !== -1 || String(h).toLowerCase().indexOf("date") !== -1; });
          var gradeIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("grade") !== -1 || String(h).toLowerCase().indexOf("kelas") !== -1 || String(h).toLowerCase().indexOf("class") !== -1; });
          
          var tugasZiyadahIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("ziyadah") !== -1; });
          var tugasMurojaahIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("murojaah") !== -1; });
          var tugasMateriIdx = headers.findIndex(function(h) { return String(h).toLowerCase() === "tugas materi" || String(h).toLowerCase() === "tugas_materi"; });
          var legacyMateriIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("materi") !== -1 || String(h).toLowerCase() === "tugas" || String(h).toLowerCase().indexOf("tugas harian") !== -1; });
          
          var ustadzIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("ustadz") !== -1 || String(h).toLowerCase().indexOf("guru") !== -1 || String(h).toLowerCase().indexOf("pembuat") !== -1 || String(h).toLowerCase().indexOf("teacher") !== -1; });
          var ketIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("keterangan") !== -1 || String(h).toLowerCase().indexOf("ket") !== -1 || String(h).toLowerCase().indexOf("catatan") !== -1 || String(h).toLowerCase().indexOf("note") !== -1; });
          var siswaIdx = headers.findIndex(function(h) { return String(h).toLowerCase().indexOf("siswa") !== -1 || String(h).toLowerCase().indexOf("penerima") !== -1 || String(h).toLowerCase().indexOf("student") !== -1; });
          
          if (idIdx === -1) idIdx = 0;
          if (tanggalIdx === -1) tanggalIdx = 1;
          if (gradeIdx === -1) gradeIdx = 2;
          
          var zVal = "";
          var mVal = "";
          var tmVal = "";
          if (postData.materi) {
            try {
              var parsed = JSON.parse(postData.materi);
              if (parsed && typeof parsed === 'object') {
                zVal = String(parsed.ziyadah || "").trim();
                mVal = String(parsed.murojaah || "").trim();
                tmVal = String(parsed.tugasMateri || parsed.materi || "").trim();
              } else {
                tmVal = String(postData.materi).trim();
              }
            } catch(e) {
              tmVal = String(postData.materi).trim();
            }
          }
          if (postData.ziyadah) zVal = String(postData.ziyadah).trim();
          if (postData.murojaah) mVal = String(postData.murojaah).trim();
          if (postData.tugasMateri) tmVal = String(postData.tugasMateri).trim();
          
          var maxIdx = Math.max(idIdx, tanggalIdx, gradeIdx, ustadzIdx, ketIdx, siswaIdx, tugasZiyadahIdx, tugasMurojaahIdx, tugasMateriIdx, legacyMateriIdx);
          if (maxIdx < 8) maxIdx = 8;
          
          var currentLength = sheet.getLastColumn();
          var arraySize = Math.max(maxIdx + 1, currentLength);
          var rowData = new Array(arraySize).fill("");
          
          var existingRowValues = sheet.getRange(foundRow, 1, 1, arraySize).getValues()[0];
          for (var k = 0; k < existingRowValues.length; k++) {
            rowData[k] = existingRowValues[k];
          }
          
          rowData[idIdx] = idToFind;
          rowData[tanggalIdx] = String(postData.tanggal || "");
          rowData[gradeIdx] = String(postData.grade || "");
          if (ustadzIdx !== -1) rowData[ustadzIdx] = String(postData.ustadz || "");
          if (ketIdx !== -1) rowData[ketIdx] = String(postData.keterangan || "");
          if (siswaIdx !== -1) rowData[siswaIdx] = String(postData.siswa || "All");
          
          if (tugasZiyadahIdx !== -1) rowData[tugasZiyadahIdx] = zVal;
          if (tugasMurojaahIdx !== -1) rowData[tugasMurojaahIdx] = mVal;
          if (tugasMateriIdx !== -1) rowData[tugasMateriIdx] = tmVal;
          
          if (legacyMateriIdx !== -1) {
            if (tugasZiyadahIdx !== -1 || tugasMurojaahIdx !== -1) {
              rowData[legacyMateriIdx] = tmVal;
            } else {
              rowData[legacyMateriIdx] = String(postData.materi || "");
            }
          }
          
          sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
          return createJsonResponse({ status: "success", message: "Alhamdulillah, tugas harian berhasil diperbarui." });
        } else {
          return createJsonResponse({ status: "error", message: "Data tugas harian tidak ditemukan." });
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
          return createJsonResponse({ status: "success", message: "Tugas harian berhasil dihapus." });
        } else {
          return createJsonResponse({ status: "error", message: "Data tugas harian tidak ditemukan." });
        }
      }
    }
    
    // JIKA AKSI PENILAIAN (DEFAULT)
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
2. Buat **Tiga Tab / Sheet**:
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
   * **Tab ke-3 bernama "Tugas Harian"** (atau "tugas_harian") dengan header kolom sebagai berikut:
     * **Kolom A:** \`ID\`
     * **Kolom B:** \`Tanggal\` (Format: yyyy-mm-dd atau dd/mmmm/yyyy)
     * **Kolom C:** \`Grade\` (Kelas sasaran, e.g. "2 Inter 1", atau "All" jika untuk semua kelas)
     * **Kolom D:** \`Materi\` (Isi tugas, e.g. "Murojaah Juz 30")
     * **Kolom E:** \`Ustadz\` (Nama ustadz pemberi tugas)
     * **Kolom F:** \`Keterangan\` (Catatan tambahan)
     * **Kolom G:** \`Siswa\` (Nama siswa sasaran, atau All jika untuk semua siswa)
3. Isi beberapa baris data awal di tab tersebut sebagai contoh (misal di tab Akun: \`ID: ustadz1, Namaa: Ustadz Ahmad, Password: password123\` dan \`ID: student_kean, Namaa: Kean, Password: kean123\`).
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
