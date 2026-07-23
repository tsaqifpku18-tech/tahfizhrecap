import React, { useState } from 'react';
import { 
  Newspaper, 
  Upload, 
  Image as ImageIcon, 
  Heart, 
  MessageSquare, 
  Download, 
  Trash2, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Megaphone,
  User
} from 'lucide-react';
import { BeritaItem, UserSession } from '../types';

interface BeritaTabProps {
  beritaList: BeritaItem[];
  currentUser: UserSession;
  onAddBerita: (newBerita: Omit<BeritaItem, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  onDeleteBerita: (id: string) => void;
  onToggleLike: (beritaId: string) => void;
  onAddComment: (beritaId: string, commentText: string) => void;
}

export const BeritaTab: React.FC<BeritaTabProps> = ({
  beritaList,
  currentUser,
  onAddBerita,
  onDeleteBerita,
  onToggleLike,
  onAddComment,
}) => {
  const isUstadzOrAdmin = currentUser.role === 'ustadz' || currentUser.role === 'admin';

  // Form states for creating news
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment input state per berita post id
  const [commentInputs, setCommentInputs] = useState<{ [beritaId: string]: string }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size <= 10MB (10 * 1024 * 1024 bytes)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`Ukuran file terlalu besar (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maksimum 10 MB.`);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    // Check format PNG, JPG, JPEG, HEIC
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['png', 'jpg', 'jpeg', 'heic'];
    if (!ext || !validExts.includes(ext)) {
      setFileError('Format file harus berupa PNG, JPG, JPEG, atau HEIC.');
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFileError('');
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    setIsSubmitting(true);
    onAddBerita({
      title: title.trim() || undefined,
      caption: caption.trim(),
      imageUrl: imagePreview || undefined,
      imageFileName: imageFile ? imageFile.name : undefined,
      authorName: currentUser.nama,
    });

    // Reset form
    setTitle('');
    setCaption('');
    setImageFile(null);
    setImagePreview(null);
    setFileError('');
    setIsSubmitting(false);
  };

  const handleDownloadFile = (imageUrl: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || `berita-alwildan-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommentSubmit = (beritaId: string) => {
    const text = commentInputs[beritaId]?.trim();
    if (!text) return;
    onAddComment(beritaId, text);
    setCommentInputs((prev) => ({ ...prev, [beritaId]: '' }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
      {/* Header Info Bar */}
      <div className="bg-[#0000FE] text-white rounded-3xl p-6 shadow-sm border border-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-200 animate-bounce" />
              Berita & Pengumuman Sekolah
            </h2>
            <p className="text-blue-50 text-xs mt-1 font-semibold">
              Seputar kabar terbaru, utasan kegiatan, dan informasi penting Al-Wildan Islamic School.
            </p>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/20">
            {isUstadzOrAdmin ? 'Akses Tambah & Kelola' : 'Akses Lihat, Like & Komen'}
          </span>
        </div>
      </div>

      {/* Form Tambah Berita (Hanya untuk Ustadz / Admin) */}
      {isUstadzOrAdmin && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Newspaper className="w-4 h-4 text-[#0000FE]" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Buat Utasan / Berita Baru
            </h3>
          </div>

          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Judul Berita / Pengumuman <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Misal: Pengumuman Jadwal Tasmi' Perdana"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0000FE] focus:ring-1 focus:ring-[#0000FE]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Isi Utasan / Caption <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan kabar, pengumuman, atau utasan kegiatan di sini..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-[#0000FE] focus:ring-1 focus:ring-[#0000FE]"
              />
            </div>

            {/* Upload Upload Photo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Upload Foto / Dokumen Gambar <span className="text-slate-400 font-normal">(PNG, JPG, HEIC - Maks. 10 MB)</span>
              </label>
              
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 hover:border-[#0000FE] rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50/30 transition-colors p-4 group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#0000FE] mb-1 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-[#0000FE]">Klik untuk memilih foto</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Format PNG, JPG, JPEG, HEIC (Maksimal 10MB)</span>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.heic,image/png,image/jpeg,image/heic"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 group max-w-md">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover" />
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={clearImage}
                      className="p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 text-white text-[11px] font-bold flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{imageFile?.name}</span>
                    <span className="text-[10px] text-slate-300">{(imageFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              )}

              {fileError && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !caption.trim()}
                className="px-6 py-2.5 bg-[#0000FE] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bagikan Berita</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed Berita List */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#0000FE]" />
          Daftar Kabar & Utasan ({beritaList.length})
        </h3>

        {beritaList.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-xs font-bold">Belum ada berita atau pengumuman yang dipublikasikan.</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Ustadz atau admin dapat menambahkan pengumuman baru melalui form di atas.</p>
          </div>
        ) : (
          beritaList.map((item) => {
            const isLikedByMe = item.likes.includes(currentUser.nama);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                {/* Author & Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-[#0000FE] font-black text-xs flex items-center justify-center uppercase shadow-2xs">
                      {item.authorName.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {item.authorName}
                        <span className="bg-blue-100 text-[#0000FE] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                          Penulis
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">{item.createdAt}</p>
                    </div>
                  </div>

                  {/* Delete button for ustadz/admin */}
                  {isUstadzOrAdmin && (
                    <button
                      onClick={() => onDeleteBerita(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus berita ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-4">
                  {item.title && (
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                  )}

                  <p className="text-xs text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    {item.caption}
                  </p>

                  {/* Attached Photo */}
                  {item.imageUrl && (
                    <div className="space-y-2 mt-3">
                      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 max-h-[420px] flex items-center justify-center">
                        <img
                          src={item.imageUrl}
                          alt={item.title || 'Foto berita'}
                          className="max-h-[420px] w-auto max-w-full object-contain"
                        />
                      </div>

                      {/* Download Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDownloadFile(item.imageUrl!, item.imageFileName)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-[#0000FE] text-slate-700 font-bold text-[11px] rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Foto / File</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Bar (Like & Comment stats) */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Like button */}
                    <button
                      onClick={() => onToggleLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isLikedByMe
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{item.likes.length} Suka</span>
                    </button>

                    {/* Comments count */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{item.comments.length} Komentar</span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="p-6 bg-slate-50/80 border-t border-slate-100 space-y-4">
                  {/* List of comments */}
                  {item.comments.length > 0 && (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {item.comments.map((c) => (
                        <div key={c.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                              {c.userName}
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                c.userRole === 'admin' || c.userRole === 'ustadz'
                                  ? 'bg-blue-100 text-[#0000FE]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {c.userRole}
                              </span>
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium">{c.createdAt}</span>
                          </div>
                          <p className="text-slate-700 font-medium text-[11px] leading-snug">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input form for comment */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tuliskan komentar Anda..."
                      value={commentInputs[item.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCommentSubmit(item.id);
                      }}
                      className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0000FE] focus:ring-1 focus:ring-[#0000FE]"
                    />
                    <button
                      onClick={() => handleCommentSubmit(item.id)}
                      disabled={!commentInputs[item.id]?.trim()}
                      className="px-4 py-2 bg-[#0000FE] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
