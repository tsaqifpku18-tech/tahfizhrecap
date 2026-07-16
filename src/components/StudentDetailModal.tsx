import React from 'react';
import { X, Calendar, BookOpen, Star, TrendingUp, Compass, Award, Heart } from 'lucide-react';
import { Setoran } from '../types';
import { getSatuanByKegiatan } from '../data';

interface StudentDetailModalProps {
  studentName: string;
  studentHistory: Setoran[];
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  studentName,
  studentHistory,
  onClose,
}) => {
  if (studentHistory.length === 0) return null;

  const firstRecord = studentHistory[0];
  const grade = firstRecord.grade;
  const studentId = firstRecord.id;

  // Compute student stats
  const totalSubmissions = studentHistory.length;
  const totalLines = studentHistory.reduce((acc, curr) => acc + curr.baris, 0);
  const avgLines = Math.round((totalLines / totalSubmissions) * 10) / 10;
  
  const totalSuccess = studentHistory.filter((s) => s.status === 'Boleh Lanjut').length;
  const successRate = Math.round((totalSuccess / totalSubmissions) * 100);

  // Activities break down
  const totalTahsin = studentHistory.filter((s) => (s.kegiatan || '').toLowerCase().includes('tahsin')).length;
  const totalZiyadah = studentHistory.filter((s) => (s.kegiatan || '').toLowerCase().includes('ziyadah')).length;

  // Generate dynamic recommendation
  let guidance = '';
  let adviceColor = '';
  if (successRate >= 80) {
    guidance = 'Maa Syaa Allah! Kelancaran setoran sangat tinggi. Siswa menunjukkan pemahaman tajwid dan makhraj yang mantap. Sangat direkomendasikan untuk melanjutkan Ziyadah hafalan baru secara konsisten.';
    adviceColor = 'text-blue-800 bg-blue-50 border-blue-100';
  } else if (successRate >= 50) {
    guidance = 'Alhamdulillah, perkembangan cukup baik. Namun, beberapa setoran perlu diulang untuk memperkuat hafalan (murojaah). Disarankan meluangkan waktu 15 menit ekstra sebelum menyetor untuk mengulang ayat.';
    adviceColor = 'text-amber-800 bg-amber-50 border-amber-100';
  } else {
    guidance = 'Siswa membutuhkan bimbingan intensif dan dukungan murojaah yang lebih sabar. Disarankan fokus penuh pada Tahsin perbaikan bacaan terlebih dahulu, serta didampingi saat menghafal di rumah.';
    adviceColor = 'text-rose-800 bg-rose-50 border-rose-100';
  }

  return (
    <div id="student-detail-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0000FE] to-blue-700 text-white p-6 relative">
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold uppercase border-2 border-white/30">
              {studentName.substring(0, 2)}
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-wider bg-white/20 uppercase px-2.5 py-0.5 rounded-full">
                SISWA #{studentId || 'N/A'}
              </span>
              <h2 className="text-2xl font-bold mt-1 tracking-tight">{studentName}</h2>
              <p className="text-blue-100 text-xs font-medium mt-0.5">Kelas/Grade: <span className="font-bold text-white">{grade}</span></p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Setoran</span>
              <p className="text-lg font-extrabold text-slate-700">{totalSubmissions}x</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Baris/Hal</span>
              <p className="text-lg font-extrabold text-slate-700">{totalLines}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Rerata Baris/Hal</span>
              <p className="text-lg font-extrabold text-slate-700">{avgLines}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tingkat Lolos</span>
              <p className={`text-lg font-extrabold ${successRate >= 80 ? 'text-[#0000FE]' : 'text-amber-600'}`}>
                {successRate}%
              </p>
            </div>
          </div>

          {/* Dynamic Recommendation Card */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${adviceColor}`}>
            <Award className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Rekomendasi Pembelajaran</h4>
              <p className="text-xs leading-relaxed">{guidance}</p>
            </div>
          </div>

          {/* Activities break down info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" /> Distribusi Kegiatan
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600">
                  <span>Tahsin</span>
                  <span>{totalTahsin} setoran ({totalSubmissions > 0 ? Math.round((totalTahsin / totalSubmissions) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalSubmissions > 0 ? (totalTahsin / totalSubmissions) * 100 : 0}%` }}></div>
                </div>

                <div className="flex justify-between text-xs font-medium text-slate-600 pt-1">
                  <span>Ziyadah</span>
                  <span>{totalZiyadah} setoran ({totalSubmissions > 0 ? Math.round((totalZiyadah / totalSubmissions) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${totalSubmissions > 0 ? (totalZiyadah / totalSubmissions) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-center space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Nilai Terakhir
              </h4>
              <p className="text-sm italic text-slate-600 font-medium">
                "{studentHistory[0]?.ctt || 'Tidak ada nilai'}"
              </p>
              <div className="text-xs text-slate-400">
                Disetor pada {studentHistory[0]?.tanggalSetoran ? new Date(studentHistory[0].tanggalSetoran).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </div>
            </div>
          </div>

          {/* Timeline of Submissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Calendar className="w-4.5 h-4.5 text-[#0000FE]" /> Riwayat Setoran Lengkap
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {studentHistory.map((item, idx) => (
                <div
                  key={idx}
                  id={`student-history-item-${idx}`}
                  className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.kegiatan === 'Ziyadah'
                          ? 'bg-blue-50 text-[#0000FE] border border-blue-100'
                          : item.kegiatan === 'Tahsin (Tilawah)'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : item.kegiatan === "Tahsin (IQRA')"
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : item.kegiatan === 'Tahsin (Qoidah)'
                          ? 'bg-violet-50 text-violet-700 border-violet-100'
                          : item.kegiatan === 'Murojaah'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-blue-50/70 text-blue-800 border border-blue-100'
                      }`}>
                        {item.kegiatan}
                      </span>
                      <span className="font-semibold text-slate-700 capitalize">{item.baris} {item.satuan || getSatuanByKegiatan(item.kegiatan)}</span>
                      {item.surah && (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold">
                          {item.surah}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">
                        {new Date(item.tanggalSetoran).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-500 italic">" {item.ctt} "</p>
                  </div>

                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'Boleh Lanjut' 
                        ? 'bg-blue-50 text-[#0000FE] border border-blue-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
          <button
            id="btn-close-modal-footer"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          >
            Tutup Riwayat
          </button>
        </div>

      </div>
    </div>
  );
};
