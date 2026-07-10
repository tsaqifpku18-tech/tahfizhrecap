import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle, Loader2, Sparkles, Smile, Frown, Users } from 'lucide-react';
import { Setoran } from '../types';

interface NewAssessmentFormProps {
  onAddSetoran: (newSetoran: Omit<Setoran, 'id'> & { id?: string }) => Promise<boolean>;
  activeStudents: { id: string; nama: string; grade: string }[];
  isSubmitting: boolean;
}

export const NewAssessmentForm: React.FC<NewAssessmentFormProps> = ({
  onAddSetoran,
  activeStudents,
  isSubmitting,
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
  const [kegiatan, setKegiatan] = useState<'Tahsin (IQRA\')' | 'Ziyadah' | 'Murojaah' | string>('Ziyadah');
  const [baris, setBaris] = useState<number>(3);
  const [ctt, setCtt] = useState('Lancar');
  const [status, setStatus] = useState<'Boleh Lanjut' | 'Ulangi'>('Boleh Lanjut');

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

  // Auto fill when choosing an existing student
  useEffect(() => {
    if (!isNewStudent && selectedStudentId) {
      const student = activeStudents.find((s) => s.id === selectedStudentId);
      if (student) {
        setId(student.id);
        setNama(student.nama);
        setGrade(student.grade);
      }
    } else if (isNewStudent) {
      // Auto generate ID for new student
      const randomId = String(Math.floor(1000000 + Math.random() * 9000000));
      setId(randomId);
      setNama('');
      setGrade('');
    }
  }, [selectedStudentId, isNewStudent, activeStudents]);

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
    };

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
      setBaris(3);
      setCtt('Lancar');
      setStatus('Boleh Lanjut');
      
      // Clear success notification after 4s
      setTimeout(() => setFormSuccess(false), 4000);
    } else {
      setFormError('Gagal mengirimkan data ke Google Sheets. Periksa koneksi Anda.');
    }
  };

  return (
    <div id="new-assessment-form" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Catat Penilaian Baru</h2>
            <p className="text-xs text-slate-500">Input setoran hafalan siswa hari ini</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Toggle Student Source */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-2">
          <button
            id="toggle-existing-student"
            type="button"
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
              !isNewStudent ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setIsNewStudent(false)}
          >
            Siswa Terdaftar
          </button>
          <button
            id="toggle-new-student"
            type="button"
            className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
              isNewStudent ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setIsNewStudent(true)}
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Pilih Nama Siswa --</option>
              {activeStudents.map((student) => (
                <option key={student.id} value={student.id}>
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
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
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
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
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
              className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                !isNewStudent ? 'bg-slate-50 text-slate-500' : 'bg-white'
              }`}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. 2 Inter 1"
            />
          </div>
        </div>

        {/* Date and Activity Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Tanggal Setoran
            </label>
            <input
              id="input-submission-date"
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              value={tanggalSetoran}
              onChange={(e) => setTanggalSetoran(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Jenis Kegiatan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-activity-ziyadah"
                type="button"
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all ${
                  kegiatan === 'Ziyadah'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-500/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setKegiatan('Ziyadah')}
              >
                📖 Ziyadah
              </button>
              <button
                id="btn-activity-murojaah"
                type="button"
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all ${
                  kegiatan === 'Murojaah'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setKegiatan('Murojaah')}
              >
                🔁 Murojaah
              </button>
              <button
                id="btn-activity-tahsin"
                type="button"
                className={`py-2 px-1 text-[11px] font-bold rounded-xl border transition-all ${
                  kegiatan === "Tahsin (IQRA')" || kegiatan === 'Tahsin'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-500/10'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setKegiatan("Tahsin (IQRA')")}
              >
                ✍️ Tahsin (IQRA')
              </button>
            </div>
          </div>
        </div>

        {/* Baris and Custom Catatan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Jumlah Baris
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
                className="w-16 h-10 text-center rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={baris}
                onChange={(e) => setBaris(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <button
                id="btn-increment-baris"
                type="button"
                onClick={() => setBaris(baris + 1)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                +
              </button>
              <span className="text-xs text-slate-400 font-medium">Baris</span>
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
                className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  status === 'Boleh Lanjut'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-2 ring-emerald-500/10'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smile className="w-3.5 h-3.5" /> Boleh Lanjut
              </button>
              <button
                id="btn-status-repeat"
                type="button"
                onClick={() => setStatus('Ulangi')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
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
            Catatan Penilaian (Ctt)
          </label>
          <input
            id="input-notes-text"
            type="text"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 mb-2"
            value={ctt}
            onChange={(e) => setCtt(e.target.value)}
            placeholder="Tulis catatan kelancaran atau tajwid..."
          />
          <div className="flex flex-wrap gap-1.5">
            {feedbackOptions.map((opt) => (
              <button
                key={opt}
                id={`btn-feedback-shortcut-${opt.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => handleCttSelect(opt)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  ctt === opt
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications and Submission */}
        <div className="pt-3 border-t border-slate-100">
          {formSuccess && (
            <div id="form-success-alert" className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-start gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Alhamdulillah!</span> Data setoran hafalan berhasil dicatat dan disinkronisasikan ke database.
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

          <button
            id="btn-submit-assessment"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 disabled:bg-emerald-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sedang Mengirim ke Google Sheets...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Simpan Penilaian Tahfizh
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
