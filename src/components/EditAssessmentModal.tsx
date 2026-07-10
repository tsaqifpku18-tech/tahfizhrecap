import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles, Smile, Frown } from 'lucide-react';
import { Setoran } from '../types';

interface EditAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Setoran | null;
  onSave: (original: Setoran, updated: Setoran) => Promise<boolean>;
}

export const EditAssessmentModal: React.FC<EditAssessmentModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSave,
}) => {
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [grade, setGrade] = useState('');
  const [tanggalSetoran, setTanggalSetoran] = useState('');
  const [kegiatan, setKegiatan] = useState<'Tahsin' | 'Ziyadah' | string>('Ziyadah');
  const [baris, setBaris] = useState<number>(1);
  const [ctt, setCtt] = useState('');
  const [status, setStatus] = useState<'Boleh Lanjut' | 'Ulangi' | string>('Boleh Lanjut');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Quick feedback templates
  const feedbackOptions = [
    'Lancar',
    'Kurang Lancar',
    'Sangat Lancar',
    'Terbata-bata',
    'Tajwid Perlu Diperbaiki',
    'Makhorijul Huruf Baik'
  ];

  // Initialize fields when assessment changes
  useEffect(() => {
    if (assessment) {
      setId(assessment.id);
      setNama(assessment.nama);
      setGrade(assessment.grade);
      setTanggalSetoran(assessment.tanggalSetoran);
      setKegiatan(assessment.kegiatan);
      setBaris(assessment.baris);
      setCtt(assessment.ctt);
      setStatus(assessment.status);
      setFormError('');
      setFormSuccess(false);
    }
  }, [assessment, isOpen]);

  if (!isOpen || !assessment) return null;

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

    setIsSubmitting(true);

    const updatedRecord: Setoran = {
      id: id.trim(),
      nama: nama.trim(),
      grade: grade.trim(),
      tanggalSetoran,
      kegiatan,
      baris,
      ctt: ctt.trim(),
      status,
    };

    const success = await onSave(assessment, updatedRecord);
    setIsSubmitting(false);

    if (success) {
      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        onClose();
      }, 1500);
    } else {
      setFormError('Gagal memperbarui data penilaian. Periksa koneksi atau database Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300">
      <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/75">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
              Edit Penilaian Setoran
            </h3>
            <p className="text-xs text-slate-500 mt-1">Ubah atau perbaiki riwayat setoran siswa</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Form Messages */}
          {formSuccess && (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex items-start gap-3 border border-emerald-100 text-xs font-semibold animate-slide-down">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>Alhamdulillah, data penilaian siswa berhasil diperbarui!</span>
            </div>
          )}

          {formError && (
            <div className="bg-rose-50 text-rose-800 p-4 rounded-2xl flex items-start gap-3 border border-rose-100 text-xs font-semibold animate-slide-down">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Student ID & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ID Siswa
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-600 bg-slate-50"
                placeholder="0000000"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-slate-800"
                placeholder="Contoh: Azzam Syahputra"
              />
            </div>
          </div>

          {/* Grade & Tanggal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Grade / Kelas
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                placeholder="Contoh: 2 Inter 1"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Setoran
              </label>
              <input
                type="date"
                value={tanggalSetoran}
                onChange={(e) => setTanggalSetoran(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
              />
            </div>
          </div>

          {/* Kegiatan Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Jenis Kegiatan
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setKegiatan('Ziyadah')}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all ${
                  kegiatan === 'Ziyadah'
                    ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                📖 Ziyadah
              </button>
              <button
                type="button"
                onClick={() => setKegiatan('Murojaah')}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all ${
                  kegiatan === 'Murojaah'
                    ? 'border-indigo-500 bg-indigo-50/60 text-indigo-800 ring-2 ring-indigo-500/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                🔁 Murojaah
              </button>
              <button
                type="button"
                onClick={() => setKegiatan("Tahsin (IQRA')")}
                className={`py-2 px-1 rounded-xl border text-[11px] font-bold transition-all ${
                  kegiatan === "Tahsin (IQRA')" || kegiatan === 'Tahsin'
                    ? 'border-blue-500 bg-blue-50/60 text-blue-800 ring-2 ring-blue-500/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                ✍️ Tahsin (IQRA')
              </button>
            </div>
          </div>

          {/* Jumlah Baris */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Jumlah Baris Setoran
              </label>
              <span className="text-xs font-bold text-slate-600">{baris} Baris</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="20"
                value={baris}
                onChange={(e) => setBaris(Number(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={baris}
                onChange={(e) => setBaris(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-1 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Catatan Feedback */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan Penilaian
            </label>
            <input
              type="text"
              value={ctt}
              onChange={(e) => setCtt(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 mb-2 font-medium"
              placeholder="Contoh: Lancar, tajwid baik..."
            />
            {/* Quick selectors */}
            <div className="flex flex-wrap gap-1.5">
              {feedbackOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleCttSelect(opt)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    ctt === opt
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Status Kelayakan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Kelayakan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Boleh Lanjut')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'Boleh Lanjut'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smile className={`w-4 h-4 ${status === 'Boleh Lanjut' ? 'text-emerald-600' : 'text-slate-400'}`} />
                Boleh Lanjut
              </button>
              <button
                type="button"
                onClick={() => setStatus('Ulangi')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  status === 'Ulangi'
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/10'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Frown className={`w-4 h-4 ${status === 'Ulangi' ? 'text-rose-600' : 'text-slate-400'}`} />
                Ulangi
              </button>
            </div>
          </div>

          {/* Actions Footer inside modal */}
          <div className="flex gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:bg-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
