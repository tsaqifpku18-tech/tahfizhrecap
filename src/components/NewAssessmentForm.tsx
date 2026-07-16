import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, Loader2, Sparkles, Smile, Frown, Users, Pencil, X } from 'lucide-react';
import { Setoran } from '../types';
import { getSatuanByKegiatan } from '../data';

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
    } else {
      setSelectedStudentId('');
      setIsNewStudent(false);
      setId('');
      setNama('');
      setGrade('');
      setSurah('');
      setBaris(3);
      setCtt('Lancar');
      setStatus('Boleh Lanjut');
      setTugasZiyadah('');
      setTugasMurojaah('');
      setTugasMateri('');
    }
  }, [editingRecord]);


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
    <div id="new-assessment-form" className={`bg-white rounded-3xl p-6 shadow-sm border transition-all duration-300 ${editingRecord ? 'border-amber-300 shadow-md ring-2 ring-amber-500/5' : 'border-slate-200'}`}>
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl ${editingRecord ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-blue-50 text-[#0000FE]'}`}>
            {editingRecord ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">
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
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-2">
          <button
            id="toggle-existing-student"
            type="button"
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              !isNewStudent ? 'bg-white text-[#0000FE] shadow-xs' : 'text-slate-500 hover:text-slate-700'
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
              isNewStudent ? 'bg-white text-[#0000FE] shadow-xs' : 'text-slate-500 hover:text-slate-700'
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
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
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] ${
                !isNewStudent ? 'bg-slate-50 text-slate-500' : 'bg-white'
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
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] ${
                !isNewStudent ? 'bg-slate-50 text-slate-500' : 'bg-white'
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
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] ${
                !isNewStudent ? 'bg-slate-50 text-slate-500' : 'bg-white'
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
              value={tanggalSetoran}
              onChange={(e) => setTanggalSetoran(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Surah / Bab
            </label>
            <input
              id="input-submission-surah"
              type="text"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
              placeholder="e.g. An-Naba' 1-10, Iqra 4"
            />
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
                  ? 'bg-blue-50 text-[#0000FE] border-blue-200 ring-2 ring-[#0000FE]/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setKegiatan('Ziyadah')}
            >
              Ziyadah (Hafalan Baru)
            </button>
            <button
              id="btn-activity-tahsin-tilawah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                kegiatan === 'Tahsin (Tilawah)'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setKegiatan('Tahsin (Tilawah)')}
            >
              Tahsin (Tilawah)
            </button>
            <button
              id="btn-activity-tahsin-iqra"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                kegiatan === "Tahsin (IQRA')"
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setKegiatan("Tahsin (IQRA')")}
            >
              Tahsin (IQRA')
            </button>
            <button
              id="btn-activity-tahsin-qoidah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                kegiatan === 'Tahsin (Qoidah)'
                  ? 'bg-violet-50 text-violet-700 border-violet-200 ring-2 ring-violet-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setKegiatan('Tahsin (Qoidah)')}
            >
              Tahsin (Qoidah)
            </button>
            <button
              id="btn-activity-murojaah"
              type="button"
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all col-span-2 sm:col-span-1 lg:col-span-1 ${
                kegiatan === 'Murojaah'
                  ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
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
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                -
              </button>
              <input
                id="input-baris-count"
                type="number"
                min="1"
                className="w-16 h-10 text-center rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20"
                value={baris}
                onChange={(e) => setBaris(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                id="btn-increment-baris"
                type="button"
                onClick={() => setBaris(baris + 1)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                +
              </button>
              <span className="text-xs text-slate-400 font-medium capitalize">{getSatuanByKegiatan(kegiatan)}</span>
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
                    ? 'bg-blue-50 text-[#0000FE] border-blue-300 shadow-xs ring-2 ring-[#0000FE]/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs ring-2 ring-rose-500/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] mb-2"
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
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  ctt === opt
                    ? 'bg-blue-100 text-[#0000FE] border-blue-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Tugas Selanjutnya Section (Optional) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 mt-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 mb-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tugas Selanjutnya (Opsional)</span>
            <span className="text-[10px] bg-blue-100 text-[#0000FE] font-bold px-1.5 py-0.5 rounded-full uppercase">Sinkron Sheets</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Tugas Ziyadah
              </label>
              <input
                id="input-tugas-ziyadah"
                type="text"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
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
            <div id="form-success-alert" className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-xs flex items-start gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#0000FE] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Alhamdulillah!</span> Data setoran hafalan berhasil {editingRecord ? 'diperbarui' : 'dicatat'} dan disinkronisasikan ke database.
              </div>
            </div>
          )}

          {formError && (
            <div id="form-error-alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start gap-2 mb-3">
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
