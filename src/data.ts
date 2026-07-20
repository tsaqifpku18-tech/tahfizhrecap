import { Setoran, UserAccount, TugasHarian, CapaianTargetZiyadah } from './types';

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

export const DEMO_CAPAIAN_TARGET_ZIYADAH: CapaianTargetZiyadah[] = [
  { id: "c1", nama: "Kean", grade: "2 Inter 1", capaian: 240, target: 400 },
  { id: "c2", nama: "Azzam", grade: "2 Inter 2", capaian: 180, target: 400 },
  { id: "c3", nama: "Ahmad", grade: "2 Inter 1", capaian: 350, target: 400 },
  { id: "c4", nama: "Fathir", grade: "2 Inter 2", capaian: 120, target: 400 },
  { id: "c5", nama: "Zaid", grade: "2 Inter 1", capaian: 290, target: 400 },
  { id: "c6", nama: "Rania", grade: "2 Inter 2", capaian: 310, target: 400 },
  { id: "c7", nama: "Salma", grade: "2 Inter 2", capaian: 380, target: 400 },
  { id: "c8", nama: "Yusuf", grade: "2 Inter 1", capaian: 220, target: 400 },
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script untuk Dashboard Penilaian Tahfizh & Sistem Login
 * Tempatkan kode ini di Google Sheets -> Ekstensi (Extensions) -> Apps Script
 */

// Helper untuk menormalisasi ID (menghapus format .0 dari Google Sheets agar cocok sempurna)
function normalizeId(idStr) {
  var s = String(idStr !== undefined && idStr !== null ? idStr : "").trim();
  if (s.indexOf('.') !== -1 && !isNaN(Number(s))) {
    var parts = s.split('.');
    if (parts[1] === '0') {
      return parts[0];
    }
  }
  return s;
}

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
        id: normalizeId(row[idIdx]),
        nama: String(row[namaaIdx] !== undefined ? row[namaaIdx] : "").trim(),
        password: String(row[passIdx] !== undefined ? row[passIdx] : "").trim()
      });
    }
    return createJsonResponse({ status: "success", data: accounts });
  }

  // JIKA PERMINTAAN DATA TUGAS HARIAN
  if (tabParam === "tugas" || tabParam === "tugas_harian" || tabParam === "tugasharian") {
    var tasks = [];
    
    // 1. Ambil dari sheet "Tugas Harian" jika ada
    var sheetTugas = ss.getSheetByName("Tugas Harian") || ss.getSheetByName("tugas_harian") || ss.getSheetByName("Tugas") || ss.getSheetByName("tugas");
    if (sheetTugas) {
      var dataTugas = sheetTugas.getDataRange().getValues();
      if (dataTugas.length > 1) {
        var headersTugas = dataTugas[0];
        var idIdx = -1, tanggalIdx = -1, gradeIdx = -1, ustadzIdx = -1, ketIdx = -1, siswaIdx = -1;
        var tugasZiyadahIdx = -1, tugasMurojaahIdx = -1, tugasMateriIdx = -1, legacyMateriIdx = -1;
        
        for (var h = 0; h < headersTugas.length; h++) {
          var headerStr = String(headersTugas[h]).toLowerCase().trim();
          if (headerStr === "id") idIdx = h;
          else if (headerStr.indexOf("tanggal") !== -1 || headerStr.indexOf("tgl") !== -1 || headerStr.indexOf("date") !== -1) tanggalIdx = h;
          else if (headerStr.indexOf("grade") !== -1 || headerStr.indexOf("kelas") !== -1 || headerStr.indexOf("class") !== -1) gradeIdx = h;
          else if (headerStr.indexOf("tugas ziyadah") !== -1 || headerStr === "ziyadah") tugasZiyadahIdx = h;
          else if (headerStr.indexOf("tugas murojaah") !== -1 || headerStr === "murojaah") tugasMurojaahIdx = h;
          else if (headerStr === "tugas materi" || headerStr === "tugas_materi") tugasMateriIdx = h;
          else if (headerStr.indexOf("materi") !== -1 || headerStr === "tugas" || headerStr.indexOf("tugas harian") !== -1) legacyMateriIdx = h;
          else if (headerStr.indexOf("ustadz") !== -1 || headerStr.indexOf("guru") !== -1 || headerStr.indexOf("pembuat") !== -1) ustadzIdx = h;
          else if (headerStr.indexOf("keterangan") !== -1 || headerStr.indexOf("ket") !== -1 || headerStr.indexOf("catatan") !== -1) ketIdx = h;
          else if (headerStr.indexOf("siswa") !== -1 || headerStr.indexOf("penerima") !== -1 || headerStr.indexOf("student") !== -1) siswaIdx = h;
        }
        
        for (var i = 1; i < dataTugas.length; i++) {
          var row = dataTugas[i];
          if (row.length === 0 || !row[0]) continue;
          
          var zVal = tugasZiyadahIdx !== -1 ? String(row[tugasZiyadahIdx] !== undefined ? row[tugasZiyadahIdx] : "").trim() : "";
          var mVal = tugasMurojaahIdx !== -1 ? String(row[tugasMurojaahIdx] !== undefined ? row[tugasMurojaahIdx] : "").trim() : "";
          var tmVal = tugasMateriIdx !== -1 ? String(row[tugasMateriIdx] !== undefined ? row[tugasMateriIdx] : "").trim() : "";
          var legVal = legacyMateriIdx !== -1 ? String(row[legacyMateriIdx] !== undefined ? row[legacyMateriIdx] : "").trim() : "";
          
          var finalMateri = "";
          if (zVal || mVal || tmVal) {
            finalMateri = JSON.stringify({
              ziyadah: zVal,
              murojaah: mVal,
              tugasMateri: tmVal
            });
          } else {
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
            id: idIdx !== -1 ? normalizeId(row[idIdx] !== undefined ? row[idIdx] : "") : "T" + i,
            tanggal: formattedDate,
            grade: gradeIdx !== -1 ? String(row[gradeIdx] !== undefined ? row[gradeIdx] : "").trim() : "All",
            materi: finalMateri,
            ustadz: ustadzIdx !== -1 ? String(row[ustadzIdx] !== undefined ? row[ustadzIdx] : "Ustadz").trim() : "Ustadz",
            keterangan: ketIdx !== -1 ? String(row[ketIdx] !== undefined ? row[ketIdx] : "").trim() : "",
            siswa: siswaIdx !== -1 ? String(row[siswaIdx] !== undefined ? row[siswaIdx] : "All").trim() : "All"
          });
        }
      }
    }
    
    // 2. ALSO AMBIL DARI SHEET "Penilaian" JIKA MEMILIKI KOLOM TUGAS
    var sheetPenilaian = ss.getSheetByName("Penilaian") || ss.getSheetByName("penilaian") || ss.getSheets()[0];
    if (sheetPenilaian) {
      var dataPenilaian = sheetPenilaian.getDataRange().getValues();
      if (dataPenilaian.length > 1) {
        var headersPenilaian = dataPenilaian[0];
        var pIdIdx = -1, pGradeIdx = -1, pNamaIdx = -1, pTanggalIdx = -1, pUstadzIdx = -1;
        var pTugasZiyadahIdx = -1, pTugasMurojaahIdx = -1, pTugasMateriIdx = -1;
        
        for (var h = 0; h < headersPenilaian.length; h++) {
          var headerStr = String(headersPenilaian[h]).toLowerCase().trim();
          if (headerStr === "id") pIdIdx = h;
          else if (headerStr === "grade" || headerStr === "kelas" || headerStr === "grade/kelas") pGradeIdx = h;
          else if (headerStr === "nama" || headerStr === "nama siswa") pNamaIdx = h;
          else if (headerStr === "tanggal" || headerStr === "tanggal setoran" || headerStr === "tanggal_setoran") pTanggalIdx = h;
          else if (headerStr.indexOf("tugas ziyadah") !== -1 || headerStr === "ziyadah") pTugasZiyadahIdx = h;
          else if (headerStr.indexOf("tugas murojaah") !== -1 || headerStr === "murojaah") pTugasMurojaahIdx = h;
          else if (headerStr === "tugas materi" || headerStr === "tugas_materi") pTugasMateriIdx = h;
          else if (headerStr.indexOf("ustadz") !== -1 || headerStr.indexOf("guru") !== -1) pUstadzIdx = h;
        }
        
        if (pTugasZiyadahIdx !== -1 || pTugasMurojaahIdx !== -1 || pTugasMateriIdx !== -1) {
          for (var i = 1; i < dataPenilaian.length; i++) {
            var row = dataPenilaian[i];
            if (row.length === 0 || !row[pNamaIdx]) continue;
            
            var zVal = pTugasZiyadahIdx !== -1 ? String(row[pTugasZiyadahIdx] !== undefined ? row[pTugasZiyadahIdx] : "").trim() : "";
            var mVal = pTugasMurojaahIdx !== -1 ? String(row[pTugasMurojaahIdx] !== undefined ? row[pTugasMurojaahIdx] : "").trim() : "";
            var tmVal = pTugasMateriIdx !== -1 ? String(row[pTugasMateriIdx] !== undefined ? row[pTugasMateriIdx] : "").trim() : "";
            
            if (!zVal && !mVal && !tmVal) continue;
            
            var rawDate = pTanggalIdx !== -1 ? row[pTanggalIdx] : "";
            var formattedDate = "";
            if (rawDate instanceof Date) {
              formattedDate = Utilities.formatDate(rawDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
            } else if (rawDate) {
              formattedDate = String(rawDate).trim();
            }
            
            var finalMateri = JSON.stringify({
              ziyadah: zVal,
              murojaah: mVal,
              tugasMateri: tmVal
            });
            
            tasks.push({
              id: "penilaian_tugas_" + (pIdIdx !== -1 ? normalizeId(row[pIdIdx]) : i),
              tanggal: formattedDate,
              grade: pGradeIdx !== -1 ? String(row[pGradeIdx]).trim() : "All",
              materi: finalMateri,
              ustadz: pUstadzIdx !== -1 ? String(row[pUstadzIdx]).trim() : "Ustadz",
              keterangan: "Tugas diinput langsung dari tab penilaian.",
              siswa: pNamaIdx !== -1 ? String(row[pNamaIdx]).trim() : "All"
            });
          }
        }
      }
    }
    
    return createJsonResponse({ status: "success", data: tasks });
  }

  // JIKA PERMINTAAN DATA CAPAIAN TARGET ZIYADAH
  if (tabParam === "capaian_ziyadah" || tabParam === "capaian_target" || tabParam === "target_ziyadah" || tabParam === "capaiantargetziyadah") {
    var sheetCapaian = ss.getSheetByName("Capaian Target Ziyadah") || ss.getSheetByName("capaian_target_ziyadah") || ss.getSheetByName("Capaian Target") || ss.getSheetByName("capaian") || ss.getSheetByName("target");
    if (!sheetCapaian) {
      return createJsonResponse({ status: "success", data: [] });
    }
    var dataCapaian = sheetCapaian.getDataRange().getValues();
    if (dataCapaian.length <= 1) {
      return createJsonResponse({ status: "success", data: [] });
    }
    
    var headersCapaian = dataCapaian[0];
    var cNamaIdx = -1;
    var cGradeIdx = -1;
    var cCapaianIdx = -1;
    var cTargetIdx = -1;
    var cPersenIdx = -1;
    
    // First, look for exact matches to avoid partial matching conflicts (e.g. "Capaian" matching "Persentase Kecapaian")
    for (var h = 0; h < headersCapaian.length; h++) {
      var headerStr = String(headersCapaian[h]).toLowerCase().trim();
      if (headerStr === "nama" || headerStr === "nama siswa" || headerStr === "siswa") {
        cNamaIdx = h;
      } else if (headerStr === "grade" || headerStr === "kelas" || headerStr === "grade/kelas") {
        cGradeIdx = h;
      } else if (headerStr === "capaian") {
        cCapaianIdx = h;
      } else if (headerStr === "target") {
        cTargetIdx = h;
      } else if (headerStr === "persentase" || headerStr === "persen" || headerStr === "percentage") {
        cPersenIdx = h;
      }
    }
    
    // Looser fallback matching for incomplete or combined headers
    for (var h = 0; h < headersCapaian.length; h++) {
      var headerStr = String(headersCapaian[h]).toLowerCase().trim();
      
      if (cPersenIdx === -1) {
        if (headerStr.indexOf("persen") !== -1 || headerStr.indexOf("percentage") !== -1 || headerStr.indexOf("kecapaian") !== -1) {
          cPersenIdx = h;
          continue;
        }
      }
      
      if (cTargetIdx === -1) {
        if (headerStr.indexOf("target") !== -1) {
          if (headerStr.indexOf("persen") === -1 && headerStr.indexOf("kecapaian") === -1) {
            cTargetIdx = h;
            continue;
          }
        }
      }

      if (cCapaianIdx === -1) {
        if (headerStr.indexOf("capaian") !== -1) {
          if (headerStr.indexOf("persen") === -1 && headerStr.indexOf("kecapaian") === -1) {
            cCapaianIdx = h;
            continue;
          }
        }
      }
    }
    
    if (cNamaIdx === -1) cNamaIdx = 0;
    if (cGradeIdx === -1) cGradeIdx = 1;
    if (cCapaianIdx === -1) cCapaianIdx = 2;
    if (cTargetIdx === -1) {
      for (var h = 0; h < headersCapaian.length; h++) {
        if (h !== cNamaIdx && h !== cGradeIdx && h !== cCapaianIdx && h !== cPersenIdx) {
          cTargetIdx = h;
          break;
        }
      }
      if (cTargetIdx === -1) cTargetIdx = 3;
    }
    
    var capaianList = [];
    for (var i = 1; i < dataCapaian.length; i++) {
      var row = dataCapaian[i];
      if (row.length === 0 || !row[cNamaIdx]) continue;
      
      var rawPersen = cPersenIdx !== -1 ? row[cPersenIdx] : null;
      var persenVal = null;
      if (rawPersen !== null && rawPersen !== "") {
        var pNum = Number(rawPersen);
        if (!isNaN(pNum)) {
          persenVal = pNum <= 1.5 ? Math.round(pNum * 100) : Math.round(pNum);
        }
      }

      capaianList.push({
        id: "C" + i,
        nama: String(row[cNamaIdx] !== undefined ? row[cNamaIdx] : "").trim(),
        grade: cGradeIdx !== -1 ? String(row[cGradeIdx] !== undefined ? row[cGradeIdx] : "").trim() : "",
        capaian: cCapaianIdx !== -1 ? Number(row[cCapaianIdx] || 0) : 0,
        target: cTargetIdx !== -1 ? Number(row[cTargetIdx] || 0) : 0,
        persentase: persenVal
      });
    }
    return createJsonResponse({ status: "success", data: capaianList });
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
  
  var pTugasZiyadahIdx = -1;
  var pTugasMurojaahIdx = -1;
  var pTugasMateriIdx = -1;
  
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
    else if (headerStr.indexOf("tugas ziyadah") !== -1 || headerStr === "ziyadah") pTugasZiyadahIdx = h;
    else if (headerStr.indexOf("tugas murojaah") !== -1 || headerStr === "murojaah") pTugasMurojaahIdx = h;
    else if (headerStr === "tugas materi" || headerStr === "tugas_materi") pTugasMateriIdx = h;
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
      id: normalizeId(row[idIdx] !== undefined ? row[idIdx] : ""),
      grade: String(row[gradeIdx] !== undefined ? row[gradeIdx] : "").trim(),
      nama: String(row[namaIdx] !== undefined ? row[namaIdx] : "").trim(),
      tanggalSetoran: formattedDate,
      kegiatan: kegiatanVal,
      baris: Number(row[barisIdx] || 0),
      ctt: String(row[cttIdx] !== undefined ? row[cttIdx] : "").trim(),
      status: String(row[statusIdx] !== undefined ? row[statusIdx] : "").trim(),
      surah: String(row[surahIdx] !== undefined ? row[surahIdx] : "").trim(),
      satuan: satuanVal,
      tugasZiyadah: (pTugasZiyadahIdx !== -1 && row[pTugasZiyadahIdx] !== undefined) ? String(row[pTugasZiyadahIdx]).trim() : "",
      tugasMurojaah: (pTugasMurojaahIdx !== -1 && row[pTugasMurojaahIdx] !== undefined) ? String(row[pTugasMurojaahIdx]).trim() : "",
      tugasMateri: (pTugasMateriIdx !== -1 && row[pTugasMateriIdx] !== undefined) ? String(row[pTugasMateriIdx]).trim() : ""
    });
  }
  
  // Mengembalikan data ke React Dashboard
  return createJsonResponse({ status: "success", data: rows });
}

// Helper untuk mencari baris berdasarkan ID secara dinamis
function findRowById(sheet, idToFind) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return -1;
  var headers = data[0];
  var idIdx = -1;
  for (var h = 0; h < headers.length; h++) {
    if (String(headers[h]).toLowerCase().trim() === "id") {
      idIdx = h;
      break;
    }
  }
  if (idIdx === -1) idIdx = 0;
  
  var normalizedIdToFind = normalizeId(idToFind);
  for (var i = 1; i < data.length; i++) {
    var cellVal = data[i][idIdx];
    var normalizedCellVal = normalizeId(cellVal);
    if (normalizedCellVal === normalizedIdToFind) {
      return i + 1;
    }
  }
  return -1;
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
    } else if (targetTab === "capaian_ziyadah" || targetTab === "capaian_target" || targetTab === "target_ziyadah" || targetTab === "capaiantargetziyadah") {
      sheet = ss.getSheetByName("Capaian Target Ziyadah") || ss.getSheetByName("capaian_target_ziyadah") || ss.getSheetByName("Capaian Target") || ss.getSheetByName("capaian") || ss.getSheetByName("target");
      if (!sheet) {
        return createJsonResponse({ 
          status: "error", 
          message: "Sheet 'Capaian Target Ziyadah' tidak ditemukan. Harap buat sheet tersebut terlebih dahulu." 
        });
      }
    } else {
      sheet = ss.getSheetByName("Penilaian") || ss.getSheetByName("penilaian") || ss.getSheets()[0];
    }
    
    var action = postData.action || "create";
    
    // JIKA AKSI CAPAIAN TARGET ZIYADAH
    if (targetTab === "capaian_ziyadah" || targetTab === "capaian_target" || targetTab === "target_ziyadah" || targetTab === "capaiantargetziyadah") {
      var dataCapaian = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
      if (dataCapaian.length <= 1) {
        return createJsonResponse({ status: "error", message: "Data Capaian Target masih kosong." });
      }
      
      var headersCapaian = dataCapaian[0];
      var cNamaIdx = -1;
      var cCapaianIdx = -1;
      var cTargetIdx = -1;
      var cPersenIdx = -1;
      
      for (var h = 0; h < headersCapaian.length; h++) {
        var headerStr = String(headersCapaian[h]).toLowerCase().trim();
        if (headerStr === "nama" || headerStr === "nama siswa" || headerStr === "siswa") {
          cNamaIdx = h;
        } else if (headerStr === "capaian") {
          cCapaianIdx = h;
        } else if (headerStr === "target") {
          cTargetIdx = h;
        } else if (headerStr === "persentase" || headerStr === "persen" || headerStr === "percentage") {
          cPersenIdx = h;
        }
      }
      
      // Looser fallback matching for incomplete or combined headers
      for (var h = 0; h < headersCapaian.length; h++) {
        var headerStr = String(headersCapaian[h]).toLowerCase().trim();
        if (cPersenIdx === -1 && (headerStr.indexOf("persen") !== -1 || headerStr.indexOf("percentage") !== -1 || headerStr.indexOf("kecapaian") !== -1)) {
          cPersenIdx = h;
        }
        if (cTargetIdx === -1 && headerStr.indexOf("target") !== -1 && headerStr.indexOf("persen") === -1 && headerStr.indexOf("kecapaian") === -1) {
          cTargetIdx = h;
        }
        if (cCapaianIdx === -1 && headerStr.indexOf("capaian") !== -1 && headerStr.indexOf("persen") === -1 && headerStr.indexOf("kecapaian") === -1) {
          cCapaianIdx = h;
        }
      }
      
      if (cNamaIdx === -1) cNamaIdx = 0;
      if (cCapaianIdx === -1) cCapaianIdx = 2;
      if (cTargetIdx === -1) cTargetIdx = 3;
      
      var nameToFind = String(postData.nama || "").toLowerCase().trim();
      var foundRow = -1;
      for (var i = 1; i < dataCapaian.length; i++) {
        if (String(dataCapaian[i][cNamaIdx]).toLowerCase().trim() === nameToFind) {
          foundRow = i + 1;
          break;
        }
      }
      
      if (foundRow !== -1) {
        if (action === "edit") {
          var cap = Number(postData.capaian || 0);
          var tar = Number(postData.target || 0);
          
          if (cCapaianIdx !== -1) {
            sheet.getRange(foundRow, cCapaianIdx + 1).setValue(cap);
          }
          if (cTargetIdx !== -1) {
            sheet.getRange(foundRow, cTargetIdx + 1).setValue(tar);
          }
          if (cPersenIdx !== -1) {
            var pct = tar > 0 ? (cap / tar) : 0;
            sheet.getRange(foundRow, cPersenIdx + 1).setValue(pct);
          }
          
          return createJsonResponse({ 
            status: "success", 
            message: "Alhamdulillah, capaian target ziyadah berhasil diperbarui di Google Sheets." 
          });
        }
      } else {
        if (action === "edit" || action === "create") {
          var rowData = [];
          var maxIdx = Math.max(cNamaIdx, cCapaianIdx, cTargetIdx, cPersenIdx);
          if (maxIdx < 4) maxIdx = 4;
          for (var k = 0; k <= maxIdx; k++) {
            rowData.push("");
          }
          rowData[cNamaIdx] = String(postData.nama || "");
          rowData[cCapaianIdx] = Number(postData.capaian || 0);
          rowData[cTargetIdx] = Number(postData.target || 0);
          if (cPersenIdx !== -1) {
            var tar = Number(postData.target || 0);
            rowData[cPersenIdx] = tar > 0 ? (Number(postData.capaian || 0) / tar) : 0;
          }
          sheet.appendRow(rowData);
          return createJsonResponse({ 
            status: "success", 
            message: "Alhamdulillah, siswa baru dan capaian target ziyadah berhasil ditambahkan ke Google Sheets." 
          });
        }
        return createJsonResponse({ 
          status: "error", 
          message: "Data siswa '" + postData.nama + "' tidak ditemukan di Capaian Target Ziyadah." 
        });
      }
    }
    
    // JIKA AKSI TUGAS HARIAN
    if (targetTab === "tugas" || targetTab === "tugas_harian" || targetTab === "tugasharian") {
      if (action === "create") {
        var tanggal = postData.tanggal || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        
        // Find existing headers to map columns dynamically
        var headers = [];
        if (sheet.getLastColumn() > 0) {
          headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        }
        
        var standardTugasHeaders = ["ID", "Tanggal", "Grade", "Tugas Ziyadah", "Tugas Murojaah", "Tugas Materi", "Ustadz", "Keterangan", "Siswa"];
        if (headers.length === 0) {
          headers = standardTugasHeaders;
          sheet.appendRow(headers);
        } else {
          for (var h = 0; h < standardTugasHeaders.length; h++) {
            if (h >= headers.length) {
              headers.push(standardTugasHeaders[h]);
              sheet.getRange(1, h + 1).setValue(standardTugasHeaders[h]);
            } else if (!headers[h] || String(headers[h]).trim() === "") {
              headers[h] = standardTugasHeaders[h];
              sheet.getRange(1, h + 1).setValue(standardTugasHeaders[h]);
            }
          }
        }
        
        var idIdx = headers.findIndex(function(h) { return String(h).toLowerCase() === "id"; });
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
        if (tugasZiyadahIdx === -1) tugasZiyadahIdx = 3;
        if (tugasMurojaahIdx === -1) tugasMurojaahIdx = 4;
        if (tugasMateriIdx === -1) tugasMateriIdx = 5;
        if (ustadzIdx === -1) ustadzIdx = 6;
        if (ketIdx === -1) ketIdx = 7;
        if (siswaIdx === -1) siswaIdx = 8;
        if (legacyMateriIdx === -1) legacyMateriIdx = 5;
        
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
        var idToFind = String(postData.id || "").trim();
        if (idToFind.indexOf("penilaian_tugas_") === 0) {
          var realId = idToFind.substring("penilaian_tugas_".length);
          var sheetPenilaian = ss.getSheetByName("Penilaian") || ss.getSheetByName("penilaian") || ss.getSheets()[0];
          if (sheetPenilaian) {
            var foundRowP = findRowById(sheetPenilaian, realId);
            if (foundRowP !== -1) {
              var dataP = sheetPenilaian.getDataRange().getValues();
              var headersP = dataP[0];
              var pTugasZiyadahIdx = -1, pTugasMurojaahIdx = -1, pTugasMateriIdx = -1;
              for (var h = 0; h < headersP.length; h++) {
                var headerStr = String(headersP[h]).toLowerCase().trim();
                if (headerStr.indexOf("tugas ziyadah") !== -1 || headerStr === "ziyadah") pTugasZiyadahIdx = h;
                else if (headerStr.indexOf("tugas murojaah") !== -1 || headerStr === "murojaah") pTugasMurojaahIdx = h;
                else if (headerStr === "tugas materi" || headerStr === "tugas_materi") pTugasMateriIdx = h;
              }
              
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
              
              if (pTugasZiyadahIdx !== -1) sheetPenilaian.getRange(foundRowP, pTugasZiyadahIdx + 1).setValue(zVal);
              if (pTugasMurojaahIdx !== -1) sheetPenilaian.getRange(foundRowP, pTugasMurojaahIdx + 1).setValue(mVal);
              if (pTugasMateriIdx !== -1) sheetPenilaian.getRange(foundRowP, pTugasMateriIdx + 1).setValue(tmVal);
              
              return createJsonResponse({ status: "success", message: "Alhamdulillah, tugas harian berhasil diperbarui." });
            }
          }
          return createJsonResponse({ status: "error", message: "Data tugas harian tidak ditemukan." });
        }

        var foundRow = findRowById(sheet, idToFind);
        if (foundRow !== -1) {
          var data = sheet.getDataRange().getValues();
          var headers = data[0];
          
          var standardTugasHeaders = ["ID", "Tanggal", "Grade", "Tugas Ziyadah", "Tugas Murojaah", "Tugas Materi", "Ustadz", "Keterangan", "Siswa"];
          for (var h = 0; h < standardTugasHeaders.length; h++) {
            if (h >= headers.length) {
              headers.push(standardTugasHeaders[h]);
              sheet.getRange(1, h + 1).setValue(standardTugasHeaders[h]);
            } else if (!headers[h] || String(headers[h]).trim() === "") {
              headers[h] = standardTugasHeaders[h];
              sheet.getRange(1, h + 1).setValue(standardTugasHeaders[h]);
            }
          }
          
          var idIdx = headers.findIndex(function(h) { return String(h).toLowerCase() === "id"; });
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
          if (tugasZiyadahIdx === -1) tugasZiyadahIdx = 3;
          if (tugasMurojaahIdx === -1) tugasMurojaahIdx = 4;
          if (tugasMateriIdx === -1) tugasMateriIdx = 5;
          if (ustadzIdx === -1) ustadzIdx = 6;
          if (ketIdx === -1) ketIdx = 7;
          if (siswaIdx === -1) siswaIdx = 8;
          if (legacyMateriIdx === -1) legacyMateriIdx = 5;
          
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
        var idToFind = String(postData.id || "").trim();
        if (idToFind.indexOf("penilaian_tugas_") === 0) {
          var realId = idToFind.substring("penilaian_tugas_".length);
          var sheetPenilaian = ss.getSheetByName("Penilaian") || ss.getSheetByName("penilaian") || ss.getSheets()[0];
          if (sheetPenilaian) {
            var foundRowP = findRowById(sheetPenilaian, realId);
            if (foundRowP !== -1) {
              var dataP = sheetPenilaian.getDataRange().getValues();
              var headersP = dataP[0];
              var pTugasZiyadahIdx = -1, pTugasMurojaahIdx = -1, pTugasMateriIdx = -1;
              for (var h = 0; h < headersP.length; h++) {
                var headerStr = String(headersP[h]).toLowerCase().trim();
                if (headerStr.indexOf("tugas ziyadah") !== -1 || headerStr === "ziyadah") pTugasZiyadahIdx = h;
                else if (headerStr.indexOf("tugas murojaah") !== -1 || headerStr === "murojaah") pTugasMurojaahIdx = h;
                else if (headerStr === "tugas materi" || headerStr === "tugas_materi") pTugasMateriIdx = h;
              }
              if (pTugasZiyadahIdx !== -1) sheetPenilaian.getRange(foundRowP, pTugasZiyadahIdx + 1).setValue("");
              if (pTugasMurojaahIdx !== -1) sheetPenilaian.getRange(foundRowP, pTugasMurojaahIdx + 1).setValue("");
              if (pTugasMateriIdx !== -1) sheetPenilaian.getRange(foundRowP, pTugasMateriIdx + 1).setValue("");
              
              return createJsonResponse({ status: "success", message: "Tugas harian berhasil dihapus." });
            }
          }
          return createJsonResponse({ status: "error", message: "Data tugas harian tidak ditemukan." });
        }

        var foundRow = findRowById(sheet, idToFind);
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
    
    // Ambil headers dari sheet Penilaian untuk pemetaan dinamis
    var pHeaders = [];
    if (sheet.getLastColumn() > 0) {
      pHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    var standardHeaders = ["ID", "Grade", "Nama", "Tanggal Setoran", "Surah", "Kegiatan", "Jumlah", "Nilai", "Satuan", "Status", "Tugas Ziyadah", "Tugas Murojaah", "Tugas Materi"];
    if (pHeaders.length === 0) {
      pHeaders = standardHeaders;
      sheet.appendRow(pHeaders);
    } else {
      for (var h = 0; h < standardHeaders.length; h++) {
        if (h >= pHeaders.length) {
          pHeaders.push(standardHeaders[h]);
          sheet.getRange(1, h + 1).setValue(standardHeaders[h]);
        } else if (!pHeaders[h] || String(pHeaders[h]).trim() === "") {
          pHeaders[h] = standardHeaders[h];
          sheet.getRange(1, h + 1).setValue(standardHeaders[h]);
        }
      }
    }
    
    var pIdIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "id"; });
    var pGradeIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "grade" || String(h).toLowerCase() === "kelas" || String(h).toLowerCase() === "grade/kelas"; });
    var pNamaIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "nama" || String(h).toLowerCase() === "nama siswa"; });
    var pTanggalIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase().indexOf("tanggal") !== -1 || String(h).toLowerCase() === "tgl" || String(h).toLowerCase() === "date"; });
    var pSurahIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "surah" || String(h).toLowerCase() === "surat" || String(h).toLowerCase().indexOf("surah/bab") !== -1 || String(h).toLowerCase().indexOf("surah/materi") !== -1; });
    var pKegiatanIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "kegiatan"; });
    var pBarisIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "baris" || String(h).toLowerCase() === "jumlah" || String(h).toLowerCase().indexOf("jumlah baris") !== -1 || String(h).toLowerCase().indexOf("halaman") !== -1; });
    var pCttIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "ctt" || String(h).toLowerCase() === "catatan" || String(h).toLowerCase() === "nilai"; });
    var pSatuanIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "satuan"; });
    var pStatusIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "status"; });
    
    var pTugasZiyadahIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase().indexOf("tugas ziyadah") !== -1 || String(h).toLowerCase() === "ziyadah"; });
    var pTugasMurojaahIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase().indexOf("tugas murojaah") !== -1 || String(h).toLowerCase() === "murojaah"; });
    var pTugasMateriIdx = pHeaders.findIndex(function(h) { return String(h).toLowerCase() === "tugas materi" || String(h).toLowerCase() === "tugas_materi"; });
    
    // Set standard indices if not found (fallback)
    if (pIdIdx === -1) pIdIdx = 0;
    if (pGradeIdx === -1) pGradeIdx = 1;
    if (pNamaIdx === -1) pNamaIdx = 2;
    if (pTanggalIdx === -1) pTanggalIdx = 3;
    if (pSurahIdx === -1) pSurahIdx = 4;
    if (pKegiatanIdx === -1) pKegiatanIdx = 5;
    if (pBarisIdx === -1) pBarisIdx = 6;
    if (pCttIdx === -1) pCttIdx = 7;
    if (pSatuanIdx === -1) pSatuanIdx = 8;
    if (pStatusIdx === -1) pStatusIdx = 9;
    
    if (pTugasZiyadahIdx === -1) pTugasZiyadahIdx = 10;
    if (pTugasMurojaahIdx === -1) pTugasMurojaahIdx = 11;
    if (pTugasMateriIdx === -1) pTugasMateriIdx = 12;
    
    var maxPIdx = Math.max(pIdIdx, pGradeIdx, pNamaIdx, pTanggalIdx, pSurahIdx, pKegiatanIdx, pBarisIdx, pCttIdx, pSatuanIdx, pStatusIdx, pTugasZiyadahIdx, pTugasMurojaahIdx, pTugasMateriIdx);
    if (maxPIdx < 12) maxPIdx = 12;
    
    // Pastikan header kolom K, L, M terisi di sheet jika belum ada
    if (sheet.getLastColumn() >= 10 && sheet.getLastColumn() < 13) {
      sheet.getRange(1, 11).setValue("Tugas Ziyadah");
      sheet.getRange(1, 12).setValue("Tugas Murojaah");
      sheet.getRange(1, 13).setValue("Tugas Materi");
    }
    
    if (action === "create") {
      // Tentukan nilai tanggal, default hari ini jika kosong
      var tanggal = postData.tanggalSetoran;
      if (!tanggal) {
        tanggal = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      
      var rowData = new Array(maxPIdx + 1).fill("");
      rowData[pIdIdx] = String(postData.id || "");
      rowData[pGradeIdx] = String(postData.grade || "");
      rowData[pNamaIdx] = String(postData.nama || "");
      rowData[pTanggalIdx] = tanggal;
      rowData[pSurahIdx] = String(postData.surah || "");
      rowData[pKegiatanIdx] = String(postData.kegiatan || "");
      rowData[pBarisIdx] = Number(postData.baris || 0);
      rowData[pCttIdx] = String(postData.ctt || "");
      rowData[pSatuanIdx] = String(postSatuan || "");
      rowData[pStatusIdx] = String(postData.status || "");
      
      rowData[pTugasZiyadahIdx] = String(postData.tugasZiyadah || "").trim();
      rowData[pTugasMurojaahIdx] = String(postData.tugasMurojaah || "").trim();
      rowData[pTugasMateriIdx] = String(postData.tugasMateri || "").trim();
      
      sheet.appendRow(rowData);
      
      return createJsonResponse({ 
        status: "success", 
        message: "Alhamdulillah, data penilaian berhasil disimpan ke Google Sheets." 
      });
    } else if (action === "edit") {
      var idToFind = String(postData.id || "").trim();
      var foundRow = findRowById(sheet, idToFind);
      
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
        
        var currentLength = sheet.getLastColumn();
        var arraySize = Math.max(maxPIdx + 1, currentLength);
        var rowData = new Array(arraySize).fill("");
        
        var existingRowValues = sheet.getRange(foundRow, 1, 1, arraySize).getValues()[0];
        for (var k = 0; k < existingRowValues.length; k++) {
          rowData[k] = existingRowValues[k];
        }
        
        rowData[pIdIdx] = idToFind;
        rowData[pGradeIdx] = String(postData.grade || "");
        rowData[pNamaIdx] = String(postData.nama || "");
        rowData[pTanggalIdx] = tanggal;
        rowData[pSurahIdx] = String(postData.surah || "");
        rowData[pKegiatanIdx] = String(postData.kegiatan || "");
        rowData[pBarisIdx] = Number(postData.baris || 0);
        rowData[pCttIdx] = String(postData.ctt || "");
        rowData[pSatuanIdx] = String(postSatuan || "");
        rowData[pStatusIdx] = String(postData.status || "");
        
        rowData[pTugasZiyadahIdx] = String(postData.tugasZiyadah || "").trim();
        rowData[pTugasMurojaahIdx] = String(postData.tugasMurojaah || "").trim();
        rowData[pTugasMateriIdx] = String(postData.tugasMateri || "").trim();
        
        sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
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
      var idToFind = String(postData.id || "").trim();
      var foundRow = findRowById(sheet, idToFind);
      
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
