import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Setoran } from '../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Setoran | null;
  onConfirm: (assessment: Setoran) => Promise<boolean>;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !assessment) return null;

  const handleConfirm = async () => {
    setError('');
    setIsDeleting(true);
    const success = await onConfirm(assessment);
    setIsDeleting(false);
    if (success) {
      onClose();
    } else {
      setError('Gagal menghapus data penilaian. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in">
      <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col p-6 space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Visual */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">
              Hapus Penilaian Siswa
            </h3>
            <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Nama Siswa</span>
            <span className="font-bold text-slate-800">{assessment.nama}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Grade / Kelas</span>
            <span className="font-semibold text-slate-700">{assessment.grade}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Tanggal Setoran</span>
            <span className="text-slate-700 font-mono">
              {new Date(assessment.tanggalSetoran).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Jenis Kegiatan</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              assessment.kegiatan === 'Ziyadah'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-blue-50 text-blue-700 border border-blue-100'
            }`}>
              {assessment.kegiatan}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Jumlah Baris</span>
            <span className="font-bold text-slate-800">{assessment.baris} Baris</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <p className="text-xs text-rose-600 font-semibold text-center mt-1">
            ⚠️ {error}
          </p>
        )}

        <p className="text-xs text-slate-500 leading-relaxed text-center">
          Apakah Anda yakin ingin menghapus data penilaian untuk <strong className="text-slate-700">{assessment.nama}</strong>? Data ini juga akan terhapus dari server Google Sheets secara otomatis.
        </p>

        {/* Actions Footer */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-rose-600 hover:bg-rose-750 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 disabled:bg-rose-400"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghapus...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
