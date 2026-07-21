import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, Loader2, Sparkles, Smile, Frown, Users, Pencil, X } from 'lucide-react';
import { Setoran } from '../types';
import { getSatuanByKegiatan } from '../data';

export const SURAH_LIST = [
  { no: 1, nama: "Al-Fatihah", ayat: 7 },
  { no: 2, nama: "Al-Baqarah", ayat: 286 },
  { no: 3, nama: "Ali 'Imran", ayat: 200 },
  { no: 4, nama: "An-Nisa'", ayat: 176 },
  { no: 5, nama: "Al-Ma'idah", ayat: 120 },
  { no: 6, nama: "Al-An'am", ayat: 165 },
  { no: 7, nama: "Al-A'raf", ayat: 206 },
  { no: 8, nama: "Al-Anfal", ayat: 75 },
  { no: 9, nama: "At-Tawbah", ayat: 129 },
  { no: 10, nama: "Yunus", ayat: 109 },
  { no: 11, nama: "Hud", ayat: 123 },
  { no: 12, nama: "Yusuf", ayat: 111 },
  { no: 13, nama: "Ar-Ra'd", ayat: 43 },
  { no: 14, nama: "Ibrahim", ayat: 52 },
  { no: 15, nama: "Al-Hijr", ayat: 99 },
  { no: 16, nama: "An-Nahl", ayat: 128 },
  { no: 17, nama: "Al-Isra'", ayat: 111 },
  { no: 18, nama: "Al-Kahf", ayat: 110 },
  { no: 19, nama: "Maryam", ayat: 98 },
  { no: 20, nama: "Ta Ha", ayat: 135 },
  { no: 21, nama: "Al-Anbiya'", ayat: 112 },
  { no: 22, nama: "Al-Hajj", ayat: 78 },
  { no: 23, nama: "Al-Mu'minun", ayat: 118 },
  { no: 24, nama: "An-Nur", ayat: 64 },
  { no: 25, nama: "Al-Furqan", ayat: 77 },
  { no: 26, nama: "Ash-Shu'ara'", ayat: 227 },
  { no: 27, nama: "An-Naml", ayat: 93 },
  { no: 28, nama: "Al-Qasas", ayat: 88 },
  { no: 29, nama: "Al-Ankabut", ayat: 69 },
  { no: 30, nama: "Ar-Rum", ayat: 60 },
  { no: 31, nama: "Luqman", ayat: 34 },
  { no: 32, nama: "As-Sajdah", ayat: 30 },
  { no: 33, nama: "Al-Ahzab", ayat: 73 },
  { no: 34, nama: "Saba'", ayat: 54 },
  { no: 35, nama: "Fatir", ayat: 45 },
  { no: 36, nama: "Ya Sin", ayat: 83 },
  { no: 37, nama: "As-Saffat", ayat: 182 },
  { no: 38, nama: "Sad", ayat: 88 },
  { no: 39, nama: "Az-Zumar", ayat: 75 },
  { no: 40, nama: "Ghafir", ayat: 85 },
  { no: 41, nama: "Fussilat", ayat: 54 },
  { no: 42, nama: "Ash-Shura", ayat: 53 },
  { no: 43, nama: "Az-Zukhruf", ayat: 89 },
  { no: 44, nama: "Ad-Dukhan", ayat: 59 },
  { no: 45, nama: "Al-Jathiyah", ayat: 37 },
  { no: 46, nama: "Al-Ahqaf", ayat: 35 },
  { no: 47, nama: "Muhammad", ayat: 38 },
  { no: 48, nama: "Al-Fath", ayat: 29 },
  { no: 49, nama: "Al-Hujurat", ayat: 18 },
  { no: 50, nama: "Qaf", ayat: 45 },
  { no: 51, nama: "Adh-Dhariyat", ayat: 60 },
  { no: 52, nama: "At-Tur", ayat: 49 },
  { no: 53, nama: "An-Najm", ayat: 62 },
  { no: 54, nama: "Al-Qamar", ayat: 55 },
  { no: 55, nama: "Ar-Rahman", ayat: 78 },
  { no: 56, nama: "Al-Waqi'ah", ayat: 96 },
  { no: 57, nama: "Al-Hadid", ayat: 29 },
  { no: 58, nama: "Al-Mujadilah", ayat: 22 },
  { no: 59, nama: "Al-Hashr", ayat: 24 },
  { no: 60, nama: "Al-Mumtahanah", ayat: 13 },
  { no: 61, nama: "As-Saff", ayat: 14 },
  { no: 62, nama: "Al-Jumu'ah", ayat: 11 },
  { no: 63, nama: "Al-Munafiqun", ayat: 11 },
  { no: 64, nama: "At-Taghabun", ayat: 18 },
  { no: 65, nama: "At-Talaq", ayat: 12 },
  { no: 66, nama: "At-Tahrim", ayat: 12 },
  { no: 67, nama: "Al-Mulk", ayat: 30 },
  { no: 68, nama: "Al-Qalam", ayat: 52 },
  { no: 69, nama: "Al-Haqqah", ayat: 52 },
  { no: 70, nama: "Al-Ma'arij", ayat: 44 },
  { no: 71, nama: "Nuh", ayat: 28 },
  { no: 72, nama: "Al-Jinn", ayat: 28 },
  { no: 73, nama: "Al-Muzzammil", ayat: 20 },
  { no: 74, nama: "Al-Muddaththir", ayat: 56 },
  { no: 75, nama: "Al-Qiyamah", ayat: 40 },
  { no: 76, nama: "Al-Insan", ayat: 31 },
  { no: 77, nama: "Al-Mursalat", ayat: 50 },
  { no: 78, nama: "An-Naba'", ayat: 40 },
  { no: 79, nama: "An-Nazi'at", ayat: 46 },
  { no: 80, nama: "'Abasa", ayat: 42 },
  { no: 81, nama: "At-Takwir", ayat: 29 },
  { no: 82, nama: "Al-Infitar", ayat: 19 },
  { no: 83, nama: "Al-Mutaffifin", ayat: 36 },
  { no: 84, nama: "Al-Inshiqaq", ayat: 25 },
  { no: 85, nama: "Al-Buruj", ayat: 22 },
  { no: 86, nama: "At-Tariq", ayat: 17 },
  { no: 87, nama: "Al-A'la", ayat: 19 },
  { no: 88, nama: "Al-Ghashiyah", ayat: 26 },
  { no: 89, nama: "Al-Fajr", ayat: 30 },
  { no: 90, nama: "Al-Balad", ayat: 20 },
  { no: 91, nama: "Ash-Shams", ayat: 15 },
  { no: 92, nama: "Al-Layl", ayat: 21 },
  { no: 93, nama: "Ad-Duha", ayat: 11 },
  { no: 94, nama: "Ash-Sharh", ayat: 8 },
  { no: 95, nama: "At-Tin", ayat: 8 },
  { no: 96, nama: "Al-'Alaq", ayat: 19 },
  { no: 97, nama: "Al-Qadr", ayat: 5 },
  { no: 98, nama: "Al-Bayyinah", ayat: 8 },
  { no: 99, nama: "Az-Zalzalah", ayat: 8 },
  { no: 100, nama: "Al-'Adiyat", ayat: 11 },
  { no: 101, nama: "Al-Qari'ah", ayat: 11 },
  { no: 102, nama: "At-Takathur", ayat: 8 },
  { no: 103, nama: "Al-'Asr", ayat: 3 },
  { no: 104, nama: "Al-Humazah", ayat: 9 },
  { no: 105, nama: "Al-Fil", ayat: 5 },
  { no: 106, nama: "Quraysh", ayat: 4 },
  { no: 107, nama: "Al-Ma'un", ayat: 7 },
  { no: 108, nama: "Al-Kawthar", ayat: 3 },
  { no: 109, nama: "Al-Kafirun", ayat: 6 },
  { no: 110, nama: "An-Nasr", ayat: 3 },
  { no: 111, nama: "Al-Masad", ayat: 5 },
  { no: 112, nama: "Al-Ikhlas", ayat: 4 },
  { no: 113, nama: "Al-Falaq", ayat: 5 },
  { no: 114, nama: "An-Nas", ayat: 6 }
];

export const parseSurahString = (surahStr: string) => {
  if (!surahStr) return { name: 'Al-Fatihah', dari: 1, sampai: 7 };
  const rangeRegex = /(\d+)(?:-(\d+))?$/;
  const match = surahStr.match(rangeRegex);
  if (match) {
    const dari = parseInt(match[1]) || 1;
    const sampai = match[2] ? parseInt(match[2]) : dari;
    const namePart = surahStr.replace(rangeRegex, '').trim();
    return { name: namePart, dari, sampai };
  }
  return { name: surahStr, dari: 1, sampai: 1 };
};

interface NewAssessmentFormProps {
  onAddSetoran: (newSetoran: Omit<Setoran, 'id'> & { id?: string }) => Promise<boolean>;
  activeStudents: { id: string; nama: string; grade: string }[];
  isSubmitting: boolean;
  editingRecord?: Setoran | null;
  onUpdateSetoran?: (updatedSetoran: Setoran) => Promise<boolean>;
  onCancelEdit?: () => void;
}

export const NewAssessmentForm: React.FC<NewAssessmentFormProps> = ({
  onAddSetoran,
  activeStudents,
  isSubmitting,
  editingRecord,
  onUpdateSetoran,
  onCancelEdit,
}) => {
  const [isNewStudent, setIsNewStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Form fields
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [grade, setGrade] = useState('');
  const [tanggalSetoran, setTanggalSetoran] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [kegiatan, setKegiatan] = useState<string>('Ziyadah');
  const [surah, setSurah] = useState('');
  
  // Dropdown-specific Surah & Verse states
  const [selectedSurahName, setSelectedSurahName] = useState('Al-Fatihah');
  const [ayatDari, setAyatDari] = useState(1);
  const [ayatSampai, setAyatSampai] = useState(7);
  const currentTotalAyat = SURAH_LIST.find(s => s.nama === selectedSurahName)?.ayat || 1;

  const [baris, setBaris] = useState<number>(3);
  const [ctt, setCtt] = useState('Lancar');
  const [status, setStatus] = useState<'Boleh Lanjut' | 'Ulangi'>('Boleh Lanjut');
  
  // Optional task fields directly assigned to students during assessment
  const [tugasZiyadah, setTugasZiyadah] = useState('');
  const [tugasMurojaah, setTugasMurojaah] = useState('');
  const [tugasMateri, setTugasMateri] = useState('');

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Predefined options for Catatan
  const feedbackOptions = [
    'Lancar',
    'Kurang Lancar',
    'Sangat Lancar',
    'Terbata-bata',
    'Tajwid Perlu Diperbaiki',
    'Makhorijul Huruf Baik'
  ];

  // Auto fill when editing a record
  useEffect(() => {
    if (editingRecord) {
      setId(editingRecord.id || '');
      setNama(editingRecord.nama || '');
      setGrade(editingRecord.grade || '');
      setTanggalSetoran(editingRecord.tanggalSetoran || '');
      setKegiatan(editingRecord.kegiatan || '');
      setSurah(editingRecord.surah || '');
      setBaris(editingRecord.baris !== undefined ? editingRecord.baris : 3);
      setCtt(editingRecord.ctt || '');
      setStatus((editingRecord.status || 'Boleh Lanjut') as 'Boleh Lanjut' | 'Ulangi');
      setTugasZiyadah(editingRecord.tugasZiyadah || '');
      setTugasMurojaah(editingRecord.tugasMurojaah || '');
      setTugasMateri(editingRecord.tugasMateri || '');
      setIsNewStudent(false);
      setSelectedStudentId(editingRecord.id || '');

      // Parse surah, dari, sampai
      const parsed = parseSurahString(editingRecord.surah || '');
      const foundSurah = SURAH_LIST.find(s => s.nama.toLowerCase().trim() === parsed.name.toLowerCase().trim());
      if (foundSurah) {
        setSelectedSurahName(foundSurah.nama);
        setAyatDari(parsed.dari);
        setAyatSampai(parsed.sampai);
      } else {
        setSelectedSurahName(parsed.name || 'Al-Fatihah');
        setAyatDari(parsed.dari || 1);
        setAyatSampai(parsed.sampai || 1);
      }
    } else {
      setSelectedStudentId('');
      setIsNewStudent(false);
      setId('');
      setNama('');
      setGrade('');
      setSurah('Al-Fatihah 1-7');
      setSelectedSurahName('Al-Fatihah');
      setAyatDari(1);
      setAyatSampai(7);
      setBaris(3);
      setCtt('Lancar');
      setStatus('Boleh Lanjut');
      setTugasZiyadah('');
      setTugasMurojaah('');
      setTugasMateri('');
    }
  }, [editingRecord]);

  const isInputMode = kegiatan === "Tahsin (IQRA')" || kegiatan === "Tahsin (IQRA)" || kegiatan === "Tahsin (Qoidah)" || kegiatan === "Tahsin (Qaidah)" || kegiatan === "Murojaah";

  useEffect(() => {
    if (!isInputMode) {
      setSurah(`${selectedSurahName} ${ayatDari}-${ayatSampai}`);
    }
  }, [kegiatan, selectedSurahName, ayatDari, ayatSampai, isInputMode]);


  // Adjust Status based on Catatan selection
  const handleCttSelect = (val: string) => {
    setCtt(val);
    if (val.toLowerCase().includes('kurang') || val.toLowerCase().includes('bata') || val.toLowerCase().includes('perlu')) {
      setStatus('Ulangi');
    } else {
      setStatus('Boleh Lanjut');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!nama.trim()) {
      setFormError('Nama siswa wajib diisi');
      return;
    }
    if (!grade.trim()) {
      setFormError('Grade/Kelas wajib diisi');
      return;
    }
    if (baris <= 0) {
      setFormError('Jumlah baris setoran harus lebih dari 0');
      return;
    }

    const payload = {
      id,
      nama: nama.trim(),
      grade: grade.trim(),
      tanggalSetoran,
      kegiatan,
      baris,
      ctt,
      status,
      surah: surah.trim(),
      satuan: getSatuanByKegiatan(kegiatan),
      tugasZiyadah: tugasZiyadah.trim(),
      tugasMurojaah: tugasMurojaah.trim(),
      tugasMateri: tugasMateri.trim(),
    };

    if (editingRecord && onUpdateSetoran) {
      const success = await onUpdateSetoran({ ...payload, id: editingRecord.id });
      if (success) {
        setFormSuccess(true);
        if (onCancelEdit) onCancelEdit();
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        setFormError('Gagal memperbarui data penilaian. Periksa koneksi Anda.');
      }
    } else {
      const success = await onAddSetoran(payload);
      if (success) {
        setFormSuccess(true);
        // Reset form variables
        if (isNewStudent) {
          setNama('');
          setGrade('');
        } else {
          setSelectedStudentId('');
        }
        setSurah('');
        setBaris(3);
        setCtt('Lancar');
        setStatus('Boleh Lanjut');
        setTugasZiyadah('');
        setTugasMurojaah('');
        setTugasMateri('');
        
        // Clear success notification after 4s
        setTimeout(() => setFormSuccess(false), 4000);
      } else {
        setFormError('Gagal mengirimkan data ke Google Sheets. Periksa koneksi Anda.');
      }
    }
  };

  return (
    <div id="new-assessment-form" className={`bg-white rounded-3xl p-6 shadow-xl shadow-blue-900/5 border transition-all duration-300 ${editingRecord ? 'border-amber-500 shadow-md ring-2 ring-amber-500/10' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl ${editingRecord ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-blue-50 text-[#0000FE]'}`}>
            {editingRecord ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingRecord ? 'Ubah Penilaian Siswa' : 'Catat Penilaian Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              {editingRecord ? `Mengubah setoran untuk ${editingRecord.nama}` : 'Input setoran hafalan siswa hari ini'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Toggle Student Source */}
        <div className="grid grid-cols-2 p-1 bg-slate-50 rounded-xl mb-2 border border-slate-100">
          <button
            id="toggle-existing-student"
            type="button"
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              !isNewStudent ? 'bg-white text-[#0000FE] border border-slate-200 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setIsNewStudent(false);
              setSelectedStudentId('');
              setId('');
              setNama('');
              setGrade('');
            }}
          >
            Siswa Terdaftar
          </button>
          <button
            id="toggle-new-student"
            type="button"
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              isNewStudent ? 'bg-white text-[#0000FE] border border-slate-200 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => {
              setIsNewStudent(true);
              setSelectedStudentId('');
              const randomId = String(Math.floor(1000000 + Math.random() * 9000000));
              setId(randomId);
              setNama('');
              setGrade('');
            }}
          >
            Siswa Baru (+)
          </button>
        </div>

        {/* Student Selector / Form Fields */}
        {!isNewStudent ? (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Pilih Siswa
            </label>
            <select
              id="select-registered-student"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE]"
              value={selectedStudentId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedStudentId(val);
                if (val) {
                  const student = activeStudents.find((s) => s.id === val);
                  if (student) {
                    setId(student.id);
                    setNama(student.nama);
                    setGrade(student.grade);
                  }
                } else {
                  setId('');
                  setNama('');
                  setGrade('');
                }
              }}
            >
              <option value="">-- Pilih Nama Siswa --</option>
              {activeStudents.map((student, idx) => (
                <option key={`student-form-opt-${student.nama}-${idx}`} value={student.id}>
                  {student.nama} ({student.grade})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* ID, Nama, Grade Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ID Siswa
            </label>
            <input
              id="input-student-id"
              type="text"
              readOnly={!isNewStudent}
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] ${
                !isNewStudent ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'
              }`}
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. 0000001"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              id="input-student-name"
              type="text"
              readOnly={!isNewStudent}
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] ${
                !isNewStudent ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'
              }`}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="e.g. Fatih"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Grade / Kelas
            </label>
            <input
              id="input-student-grade"
              type="text"
              readOnly={!isNewStudent}
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] ${
                !isNewStudent ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50'
              }`}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 2 Inter 1"
            />
          </div>
        </div>

        {/* Date and Surah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tanggal Setoran
            </label>
            <input
              id="input-submission-date"
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE]"
              value={tanggalSetoran}
              onChange={(e) => setTanggalSetoran(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Surah / Bab & Ayat
            </label>
            {isInputMode ? (
              <input
                id="input-submission-surah"
                type="text"
                placeholder="Contoh: IQRA 3 Halaman 10 / Juz 30 Murojaah"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] text-xs font-semibold"
                value={surah}
                onChange={(e) => setSurah(e.target.value)}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Surah Dropdown */}
                <div className="sm:col-span-1">
                  <select
                    id="select-submission-surah"
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] text-xs font-semibold"
                    value={selectedSurahName}
                    onChange={(e) => {
                      const surahName = e.target.value;
                      setSelectedSurahName(surahName);
                      const foundSurah = SURAH_LIST.find(s => s.nama === surahName);
                      if (foundSurah) {
                        setAyatDari(1);
                        setAyatSampai(foundSurah.ayat);
                        setSurah(`${surahName} 1-${foundSurah.ayat}`);
                      } else {
                        setAyatDari(1);
                        setAyatSampai(1);
                        setSurah(surahName);
                      }
                    }}
                  >
                    <option value="">-- Pilih Surah --</option>
                    {SURAH_LIST.map((s) => (
                      <option key={`surah-opt-${s.no}`} value={s.nama}>
                        {s.no}. {s.nama} ({s.ayat} Ayat)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ayat Dari Dropdown */}
                <div>
                  <select
                    id="select-submission-ayat-dari"
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] text-xs font-semibold"
                    value={ayatDari}
                    onChange={(e) => {
                      const dari = parseInt(e.target.value) || 1;
                      setAyatDari(dari);
                      // Ensure 'sampai' is not less than 'dari'
                      const newSampai = Math.max(dari, ayatSampai);
                      setAyatSampai(newSampai);
                      setSurah(`${selectedSurahName} ${dari}-${newSampai}`);
                    }}
                  >
                    {Array.from({ length: currentTotalAyat }, (_, i) => i + 1).map((val) => (
                      <option key={`dari-opt-${val}`} value={val}>
                        Dari {val}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ayat Sampai Dropdown */}
                <div>
                  <select
                    id="select-submission-ayat-sampai"
                    className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] text-xs font-semibold"
                    value={ayatSampai}
                    onChange={(e) => {
                      const sampai = parseInt(e.target.value) || 1;
                      setAyatSampai(sampai);
                      setSurah(`${selectedSurahName} ${ayatDari}-${sampai}`);
                    }}
                  >
                    {Array.from({ length: currentTotalAyat - ayatDari + 1 }, (_, i) => i + ayatDari).map((val) => (
                      <option key={`sampai-opt-${val}`} value={val}>
                        Sampai {val}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jenis Kegiatan */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Jenis Kegiatan
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <button
              id="btn-activity-ziyadah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                kegiatan === 'Ziyadah'
                  ? 'bg-blue-50 text-[#0000FE] border-blue-200 ring-2 ring-blue-500/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => setKegiatan('Ziyadah')}
            >
              Ziyadah (Hafalan Baru)
            </button>
            <button
              id="btn-activity-tahsin-tilawah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                kegiatan === 'Tahsin (Tilawah)'
                  ? 'bg-blue-50 text-[#0000FE] border-blue-200 ring-2 ring-blue-500/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => setKegiatan('Tahsin (Tilawah)')}
            >
              Tahsin (Tilawah)
            </button>
            <button
              id="btn-activity-tahsin-iqra"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                kegiatan === "Tahsin (IQRA')"
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => setKegiatan("Tahsin (IQRA')")}
            >
              Tahsin (IQRA')
            </button>
            <button
              id="btn-activity-tahsin-qoidah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                kegiatan === 'Tahsin (Qoidah)'
                  ? 'bg-violet-50 text-violet-700 border-violet-200 ring-2 ring-violet-500/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => setKegiatan('Tahsin (Qoidah)')}
            >
              Tahsin (Qoidah)
            </button>
            <button
              id="btn-activity-murojaah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all col-span-2 sm:col-span-1 lg:col-span-1 cursor-pointer ${
                kegiatan === 'Murojaah'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-500/10'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              onClick={() => setKegiatan('Murojaah')}
            >
              Murojaah
            </button>
          </div>
        </div>

        {/* Baris and Custom Catatan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Jumlah {getSatuanByKegiatan(kegiatan) === 'halaman' ? 'Halaman' : 'Baris'}
            </label>
            <div className="flex items-center gap-2">
              <button
                id="btn-decrement-baris"
                type="button"
                onClick={() => setBaris(Math.max(1, baris - 1))}
                className="w-10 h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                -
              </button>
              <input
                id="input-baris-count"
                type="number"
                min="1"
                className="w-16 h-10 text-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={baris}
                onChange={(e) => setBaris(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                id="btn-increment-baris"
                type="button"
                onClick={() => setBaris(baris + 1)}
                className="w-10 h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                +
              </button>
              <span className="text-xs text-slate-500 font-bold capitalize">{getSatuanByKegiatan(kegiatan)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Rekomendasi Status
            </label>
            <div className="flex gap-2">
              <button
                id="btn-status-continue"
                type="button"
                onClick={() => setStatus('Boleh Lanjut')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'Boleh Lanjut'
                    ? 'bg-blue-50 text-[#0000FE] border-blue-200 shadow-xs ring-2 ring-blue-500/10'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Smile className="w-3.5 h-3.5" /> Boleh Lanjut
              </button>
              <button
                id="btn-status-repeat"
                type="button"
                onClick={() => setStatus('Ulangi')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'Ulangi'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs ring-2 ring-rose-500/10'
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Frown className="w-3.5 h-3.5" /> Ulangi
              </button>
            </div>
          </div>
        </div>

        {/* Catatan Field with Quick Shortcuts */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Nilai / Catatan (Ctt)
          </label>
          <input
            id="input-notes-text"
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] mb-2"
            value={ctt}
            onChange={(e) => setCtt(e.target.value)}
            placeholder="Tulis nilai kelancaran atau tajwid..."
          />
          <div className="flex flex-wrap gap-1.5">
            {feedbackOptions.map((opt) => (
              <button
                key={opt}
                id={`btn-feedback-shortcut-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => handleCttSelect(opt)}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  ctt === opt
                    ? 'bg-blue-50 text-[#0000FE] border border-blue-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Tugas Selanjutnya Section (Optional) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 mt-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tugas Selanjutnya (Opsional)</span>
            <span className="text-[10px] bg-blue-50 text-[#0000FE] font-bold px-1.5 py-0.5 border border-blue-100 rounded-full uppercase">Sinkron Sheets</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Tugas Ziyadah
              </label>
              <input
                id="input-tugas-ziyadah"
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE]"
                value={tugasZiyadah}
                onChange={(e) => setTugasZiyadah(e.target.value)}
                placeholder="e.g. Al-Mulk 1-10"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Tugas Murojaah
              </label>
              <input
                id="input-tugas-murojaah"
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE]"
                value={tugasMurojaah}
                onChange={(e) => setTugasMurojaah(e.target.value)}
                placeholder="e.g. Juz 30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Tugas Materi
              </label>
              <input
                id="input-tugas-materi"
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE]"
                value={tugasMateri}
                onChange={(e) => setTugasMateri(e.target.value)}
                placeholder="e.g. Tajwid Mad Jaiz"
              />
            </div>
          </div>
        </div>

        {/* Notifications and Submission */}
        <div className="pt-3 border-t border-slate-100">
          {formSuccess && (
            <div id="form-success-alert" className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs flex items-start gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Alhamdulillah!</span> Data setoran hafalan berhasil {editingRecord ? 'diperbarui' : 'dicatat'} dan disinkronisasikan ke database.
              </div>
            </div>
          )}

          {formError && (
            <div id="form-error-alert" className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Submisi gagal:</span> {formError}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {editingRecord && (
              <button
                id="btn-cancel-edit-assessment"
                type="button"
                onClick={onCancelEdit}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors duration-200 flex items-center justify-center gap-2 border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" /> Batal
              </button>
            )}
            <button
              id="btn-submit-assessment"
              type="submit"
              disabled={isSubmitting}
              className={`font-bold py-3 rounded-xl text-sm transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                editingRecord 
                  ? 'flex-[2] bg-amber-600 hover:bg-amber-700 text-white disabled:bg-amber-400' 
                  : 'w-full bg-[#0000FE] hover:bg-[#0000D0] text-white disabled:bg-blue-300'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {editingRecord ? 'Memperbarui...' : 'Sedang Mengirim ke Google Sheets...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> {editingRecord ? 'Simpan Perubahan' : 'Simpan Penilaian Tahfizh'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
