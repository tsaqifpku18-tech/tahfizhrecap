import React, { useState, useRef, useMemo } from 'react';
import { 
  X, Upload, Image as ImageIcon, Trash2, Camera, Check, AlertCircle, Shield, User, 
  Search, Filter, CheckSquare, Square, Users, BookOpen, Award, Sparkles, Smile, Frown, Calendar
} from 'lucide-react';
import { UserSession, Setoran } from '../types';
import { getSatuanByKegiatan } from '../data';

interface ProfileSettingsModalProps {
  currentUser: UserSession;
  profilePics: Record<string, string>;
  gmailAccounts: Record<string, string>;
  customLogo: string;
  onUpdateProfilePic: (name: string, dataUrl: string) => void;
  onUpdateCustomLogo: (dataUrl: string) => void;
  onUpdateGmail?: (name: string, gmail: string) => void;
  onClose: () => void;
  setoran: Setoran[];
  activeStudents: { id: string; nama: string; grade: string }[];
  onUpdateHalaqahStudents?: (ids: string[]) => void;
}

export function ProfileSettingsModal({
  currentUser,
  profilePics,
  gmailAccounts,
  customLogo,
  onUpdateProfilePic,
  onUpdateCustomLogo,
  onUpdateGmail,
  onClose,
  setoran,
  activeStudents,
  onUpdateHalaqahStudents
}: ProfileSettingsModalProps) {
  // Determine available tabs based on role
  // Ustadz: profile, halaqah, logo
  // Siswa: profile, academic_profile
  const defaultTab = 'profile';
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // States for Profile Tab
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    profilePics[currentUser.nama] || null
  );
  const [isProfileDragging, setIsProfileDragging] = useState(false);
  const [profileError, setProfileError] = useState<string>('');
  const [gmailInput, setGmailInput] = useState<string>(() => {
    return gmailAccounts[currentUser.nama] || currentUser.gmail || '';
  });
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // States for Logo Tab (Admin)
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogo);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [logoError, setLogoError] = useState<string>('');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // States for Kelola Halaqah Tab (Ustadz)
  const [halaqahSearch, setHalaqahSearch] = useState<string>('');
  const [halaqahGradeFilter, setHalaqahGradeFilter] = useState<string>('All');
  const [selectedHalaqahIds, setSelectedHalaqahIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(`halaqah_students_of_${currentUser.nama}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse halaqah students from localStorage in settings modal', e);
      }
    }
    return [];
  });

  // General Notification toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper function to match student names robustly
  const isStudentNameMatched = (setoranName: string, studentProfileName: string): boolean => {
    const sName = (setoranName || '').toLowerCase().trim();
    const pName = (studentProfileName || '').toLowerCase().trim();
    if (sName === pName) return true;
    if (sName.includes(pName) || pName.includes(sName)) return true;
    return false;
  };

  // --- SISWA ACADEMIC PROFILE COMPUTED DATA ---
  // 1. Ziyadah: latest setoran where kegiatan === 'Ziyadah'
  const latestZiyadah = useMemo(() => {
    if (currentUser.role !== 'siswa') return null;
    const filtered = setoran.filter(
      (s) => isStudentNameMatched(s.nama, currentUser.nama) && s.kegiatan === 'Ziyadah'
    );
    if (filtered.length === 0) return null;
    // Sort by date descending
    return [...filtered].sort((a, b) => {
      return new Date(b.tanggalSetoran).getTime() - new Date(a.tanggalSetoran).getTime();
    })[0];
  }, [setoran, currentUser]);

  // 2. Tahsin (IQRA'): latest setoran where kegiatan === "Tahsin (IQRA')" or fallback to any Tahsin
  const latestTahsin = useMemo(() => {
    if (currentUser.role !== 'siswa') return null;
    const filtered = setoran.filter(
      (s) => isStudentNameMatched(s.nama, currentUser.nama) && 
      (s.kegiatan === "Tahsin (IQRA')" || String(s.kegiatan || '').toLowerCase().includes('tahsin'))
    );
    if (filtered.length === 0) return null;
    return [...filtered].sort((a, b) => {
      return new Date(b.tanggalSetoran).getTime() - new Date(a.tanggalSetoran).getTime();
    })[0];
  }, [setoran, currentUser]);

  // 3. Murojaah list: unique surah names from all murojaah setoran records
  const murojaahList = useMemo(() => {
    if (currentUser.role !== 'siswa') return [];
    const filtered = setoran.filter(
      (s) => isStudentNameMatched(s.nama, currentUser.nama) && 
      (s.kegiatan === 'Murojaah' || String(s.kegiatan || '').toLowerCase().includes('murojaah') || String(s.kegiatan || '').toLowerCase().includes('murajaah'))
    );
    const surahs = filtered.map((s) => s.surah || '').filter(Boolean);
    return Array.from(new Set(surahs)).sort((a, b) => a.localeCompare(b));
  }, [setoran, currentUser]);

  // --- HALAQAH FILTERED & UNIQUE LISTS ---
  const halaqahGrades = useMemo(() => {
    const grades = activeStudents.map((s) => s.grade).filter(Boolean);
    return ['All', ...Array.from(new Set(grades))];
  }, [activeStudents]);

  const filteredHalaqahStudents = useMemo(() => {
    return activeStudents.filter((student) => {
      if (!student) return false;
      const studentNama = String(student.nama || '').toLowerCase();
      const searchQueryLower = String(halaqahSearch || '').toLowerCase();
      const matchesSearch = studentNama.includes(searchQueryLower) ||
                            String(student.id || '').toLowerCase().includes(searchQueryLower);
      const matchesGrade = halaqahGradeFilter === 'All' || student.grade === halaqahGradeFilter;
      return matchesSearch && matchesGrade;
    });
  }, [activeStudents, halaqahSearch, halaqahGradeFilter]);

  // Roster of currently selected students in halaqah
  const selectedHalaqahRoster = useMemo(() => {
    return activeStudents.filter((s) => selectedHalaqahIds.includes(s.id));
  }, [activeStudents, selectedHalaqahIds]);

  // Profile Picture File Processing
  const handleProfileFile = (file: File) => {
    setProfileError('');
    if (!file.type.startsWith('image/')) {
      setProfileError('Format file harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setProfileError('Ukuran gambar terlalu besar. Maksimal 2.5MB agar penyimpanan lancar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setProfilePicPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsProfileDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProfileFile(e.dataTransfer.files[0]);
    }
  };

  const handleProfileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsProfileDragging(true);
  };

  const handleProfileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsProfileDragging(false);
  };

  const handleSaveProfile = () => {
    if (profilePicPreview) {
      onUpdateProfilePic(currentUser.nama, profilePicPreview);
    } else {
      onUpdateProfilePic(currentUser.nama, '');
    }
    if (onUpdateGmail) {
      onUpdateGmail(currentUser.nama, gmailInput);
    }
    triggerToast('Profil & Akun G-Mail berhasil diperbarui!');
  };

  const handleRemoveProfile = () => {
    setProfilePicPreview(null);
  };

  // Custom Logo File Processing
  const handleLogoFile = (file: File) => {
    setLogoError('');
    if (!file.type.startsWith('image/')) {
      setLogoError('Format file harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setLogoError('Ukuran logo terlalu besar. Maksimal 2.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setLogoPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoDragging(true);
  };

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoDragging(false);
  };

  const handleSaveLogo = () => {
    if (logoPreview) {
      onUpdateCustomLogo(logoPreview);
    } else {
      onUpdateCustomLogo('https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0');
    }
    triggerToast('Logo aplikasi berhasil diperbarui!');
  };

  const handleResetLogo = () => {
    setLogoPreview('https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0');
  };

  // Halaqah Management Functions
  const handleToggleStudentHalaqah = (id: string) => {
    setSelectedHalaqahIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredHalaqahStudents.map((s) => s.id);
    setSelectedHalaqahIds((prev) => {
      // Add all filtered IDs that are not already present
      const added = filteredIds.filter((id) => !prev.includes(id));
      return [...prev, ...added];
    });
  };

  const handleDeselectAllFiltered = () => {
    const filteredIds = filteredHalaqahStudents.map((s) => s.id);
    setSelectedHalaqahIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
  };

  const handleSaveHalaqah = () => {
    localStorage.setItem(`halaqah_students_of_${currentUser.nama}`, JSON.stringify(selectedHalaqahIds));
    if (onUpdateHalaqahStudents) {
      onUpdateHalaqahStudents(selectedHalaqahIds);
    }
    triggerToast('Anggota Halaqah berhasil disimpan!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm select-none animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 font-bold text-xs px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container Card */}
      <div 
        id="profile-settings-modal-card"
        className="bg-[#0b1322] border border-slate-800 w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800/60 bg-[#0d1627]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Profil & Informasi Akademik</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Atur profil, kelola keanggotaan halaqah, atau pantau perkembangan Al-Qur'an harian</p>
            </div>
          </div>
          <button 
            id="btn-close-profile-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Tab Navigation based on Role */}
        <div className="flex border-b border-slate-800/40 bg-[#0d1627]/50 px-4">
          <button
            id="btn-tab-profile-settings"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-5 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Foto Profil Saya
          </button>

          {currentUser.role === 'ustadz' && (
            <>
              <button
                id="btn-tab-halaqah-settings"
                onClick={() => setActiveTab('halaqah')}
                className={`py-3 px-5 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'halaqah'
                    ? 'border-blue-500 text-blue-400 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Kelola Halaqah Saya
              </button>
              <button
                id="btn-tab-logo-settings"
                onClick={() => setActiveTab('logo')}
                className={`py-3 px-5 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'logo'
                    ? 'border-blue-500 text-blue-400 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Logo Instansi (Admin)
              </button>
            </>
          )}

          {currentUser.role === 'siswa' && (
            <button
              id="btn-tab-academic-profile"
              onClick={() => setActiveTab('academic_profile')}
              className={`py-3 px-5 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'academic_profile'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Data Hafalan & Tahsin Saya
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'profile' && (
            /* TAB 1: PROFILE PICTURE SETTINGS */
            <div className="space-y-6 animate-in fade-in duration-150 max-w-xl mx-auto">
              {/* Current Info Widget */}
              <div className="bg-[#070D19] p-4 rounded-2xl border border-slate-800/50 flex items-center gap-4">
                <div className="relative">
                  {profilePicPreview ? (
                    <img 
                      src={profilePicPreview} 
                      alt={currentUser.nama} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/40 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-950/40 border-2 border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-2xl uppercase">
                      {currentUser.nama.substring(0, 2)}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 p-1 bg-blue-600 border border-slate-900 rounded-full text-white cursor-pointer hover:bg-blue-500 transition-all">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white truncate leading-none">{currentUser.nama}</h4>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      {currentUser.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    {currentUser.role === 'ustadz' ? 'Akses Guru Al-Qur\'an (Ustadz / Admin)' : 'Akses Siswa / Wali Murid'}
                  </p>
                </div>
              </div>

              {/* G-Mail Account Field */}
              <div className="space-y-2 bg-[#070D19]/50 p-4 rounded-2xl border border-slate-800/50">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Akun G-Mail
                </label>
                <input
                  id="profile-gmail-input"
                  type="email"
                  placeholder="Masukkan akun G-Mail Anda (contoh: ustadz@gmail.com)"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs border border-slate-800 bg-[#070D19] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-500 font-semibold">
                  Semua jenis akun diizinkan untuk mengedit atau mengisi kolom Akun G-Mail ini.
                </p>
              </div>

              {/* Upload Drag & Drop Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Unggah Foto Profil Baru
                </label>
                
                <div 
                  onClick={() => profileFileInputRef.current?.click()}
                  onDragOver={handleProfileDragOver}
                  onDragLeave={handleProfileDragLeave}
                  onDrop={handleProfileDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    isProfileDragging 
                      ? 'border-blue-500 bg-blue-950/10' 
                      : 'border-slate-800 bg-[#070D19]/40 hover:bg-[#070D19]/80 hover:border-slate-700'
                  }`}
                >
                  <input
                    ref={profileFileInputRef}
                    id="profile-pic-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProfileFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-white">Seret & letakkan foto di sini, atau klik untuk memilih</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Format JPG, PNG, WEBP. Ukuran Maksimal 2.5MB.</p>
                  </div>
                </div>
              </div>

              {profileError && (
                <div className="bg-rose-950/30 border border-rose-900/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{profileError}</span>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
                <button
                  id="btn-remove-profile-pic"
                  type="button"
                  onClick={handleRemoveProfile}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
                  disabled={!profilePicPreview}
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Foto
                </button>

                <button
                  id="btn-save-profile-settings"
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 bg-[#0000FE] hover:bg-[#0000D0] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Foto Profil
                </button>
              </div>
            </div>
          )}

          {activeTab === 'logo' && currentUser.role === 'ustadz' && (
            /* TAB 2: SYSTEM LOGO SETTINGS */
            <div className="space-y-6 animate-in fade-in duration-150 max-w-xl mx-auto">
              <div className="bg-[#070D19] p-4 rounded-2xl border border-slate-800/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center p-2 overflow-hidden shrink-0">
                    <img 
                      src={logoPreview || 'https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0'} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">Pratinjau Logo Instansi</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Logo ini akan tampil pada halaman login dan sudut atas dashboard utama</p>
                  </div>
                </div>
              </div>

              {/* Upload Drag & Drop Area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Unggah Logo Baru
                </label>
                
                <div 
                  onClick={() => logoFileInputRef.current?.click()}
                  onDragOver={handleLogoDragOver}
                  onDragLeave={handleLogoDragLeave}
                  onDrop={handleLogoDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                    isLogoDragging 
                      ? 'border-blue-500 bg-blue-950/10' 
                      : 'border-slate-800 bg-[#070D19]/40 hover:bg-[#070D19]/80 hover:border-slate-700'
                  }`}
                >
                  <input
                    ref={logoFileInputRef}
                    id="logo-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-white">Seret & letakkan logo di sini, atau klik untuk memilih</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Format JPG, PNG, WEBP, SVG. Ukuran Maksimal 2.5MB.</p>
                  </div>
                </div>
              </div>

              {logoError && (
                <div className="bg-rose-950/30 border border-rose-900/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{logoError}</span>
                </div>
              )}

              {/* Action row */}
              <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
                <button
                  id="btn-reset-logo-default"
                  type="button"
                  onClick={handleResetLogo}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
                >
                  Reset Logo Default
                </button>

                <button
                  id="btn-save-logo-settings"
                  type="button"
                  onClick={handleSaveLogo}
                  className="px-5 py-2.5 bg-[#0000FE] hover:bg-[#0000D0] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Logo Baru
                </button>
              </div>
            </div>
          )}

          {activeTab === 'halaqah' && currentUser.role === 'ustadz' && (
            /* TAB 3: HALAQAH MANAGEMENT FOR USTADZ */
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-[#070D19] p-5 rounded-2xl border border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Siswa Halaqah Ustadz {currentUser.nama}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Pilih siswa di bawah ini untuk didata ke dalam Halaqah Anda. Siswa yang dipilih akan masuk ke daftar eksklusif halaqah Anda untuk pemantauan cepat.
                  </p>
                </div>
                <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl font-bold text-xs text-center self-start md:self-center">
                  Total Halaqah: <span className="font-black text-white">{selectedHalaqahIds.length} Siswa</span>
                </div>
              </div>

              {/* Filtering and Selecting controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Selecting Students List with search & grade filters */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[#0d1627] p-4 rounded-2xl border border-slate-800/60 flex flex-col sm:flex-row items-center gap-3">
                    {/* Search Field */}
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Search className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        type="text"
                        placeholder="Cari siswa dari spreadsheet..."
                        value={halaqahSearch}
                        onChange={(e) => setHalaqahSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-800 bg-[#070D19] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Grade Filter */}
                    <div className="relative w-full sm:w-48 shrink-0">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Filter className="w-3.5 h-3.5" />
                      </span>
                      <select
                        value={halaqahGradeFilter}
                        onChange={(e) => setHalaqahGradeFilter(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 text-xs border border-slate-800 bg-[#070D19] rounded-xl text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer font-bold"
                      >
                        <option value="All">Semua Kelas</option>
                        {halaqahGrades.filter(g => g !== 'All').map((g) => (
                          <option key={`halaqah-grade-opt-${g}`} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bulk Select Options */}
                  <div className="flex items-center justify-between text-xs font-bold px-1 text-slate-400">
                    <span>Ditemukan: {filteredHalaqahStudents.length} siswa</span>
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={handleSelectAllFiltered}
                        className="text-blue-400 hover:text-blue-300 cursor-pointer"
                      >
                        Pilih Semua yang Tampil
                      </button>
                      <span className="text-slate-700">|</span>
                      <button 
                        type="button" 
                        onClick={handleDeselectAllFiltered}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        Batal Semua yang Tampil
                      </button>
                    </div>
                  </div>

                  {/* Checkbox Grid list of students */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredHalaqahStudents.map((student) => {
                      const isChecked = selectedHalaqahIds.includes(student.id);
                      return (
                        <div 
                          key={`halaqah-pick-${student.id}`}
                          onClick={() => handleToggleStudentHalaqah(student.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-blue-950/20 border-blue-500/50 shadow-xs' 
                              : 'bg-[#070D19]/40 border-slate-800 hover:bg-[#070D19]/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Student avatar */}
                            {profilePics[student.nama] ? (
                              <img 
                                src={profilePics[student.nama]} 
                                alt={student.nama} 
                                className="w-8 h-8 rounded-full object-cover border border-slate-800"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase shrink-0">
                                {student.nama.substring(0, 2)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-white truncate leading-tight">{student.nama}</h5>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{student.grade}</span>
                            </div>
                          </div>

                          <button 
                            type="button"
                            className={`p-1 rounded-md transition-colors ${isChecked ? 'text-blue-400' : 'text-slate-600'}`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-700" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {filteredHalaqahStudents.length === 0 && (
                      <div className="col-span-2 py-8 text-center text-slate-500 font-bold text-xs italic bg-[#070D19]/20 border border-slate-800 rounded-2xl">
                        Tidak ada siswa yang cocok dengan filter pencarian.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Roster Preview "Siswa Halaqah Ustadz [Nama]" */}
                <div className="space-y-4">
                  <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-4 flex flex-col h-full min-h-[300px]">
                    <div className="pb-3 border-b border-slate-800/60">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-0.5">Daftar Halaqah Anda</span>
                      <h5 className="text-xs font-black text-white truncate">Siswa Halaqah Ustadz {currentUser.nama}</h5>
                    </div>

                    {/* Active Roster List */}
                    <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-[250px]">
                      {selectedHalaqahRoster.map((st) => (
                        <div 
                          key={`roster-row-${st.id}`} 
                          className="flex items-center justify-between bg-[#070D19]/60 p-2 rounded-xl border border-slate-800/40 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="font-extrabold text-slate-200 truncate">{st.nama}</span>
                            <span className="text-[9px] font-bold text-slate-500">({st.grade})</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleToggleStudentHalaqah(st.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Keluarkan dari halaqah"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {selectedHalaqahRoster.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500">
                          <Users className="w-8 h-8 text-slate-700 mb-2" />
                          <p className="text-xs font-bold italic">Belum ada siswa terpilih.</p>
                          <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">Pilih siswa di bagian kiri lalu tekan Simpan.</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={handleSaveHalaqah}
                        className="w-full py-2.5 bg-[#0000FE] hover:bg-[#0000D0] text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Simpan Anggota Halaqah
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'academic_profile' && currentUser.role === 'siswa' && (
            /* TAB 4: ACADEMIC PROFILE FOR SISWA */
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Top Summary Banner */}
              <div className="bg-[#070D19] p-5 rounded-2xl border border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Perkembangan Al-Qur'an {currentUser.nama}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Berikut adalah data evaluasi setoran hafalan (Ziyadah), tilawah (Tahsin) serta murojaah Anda yang terdata langsung pada database asatidzah.
                  </p>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs text-center self-start sm:self-center">
                  Status: <span className="font-black text-white uppercase tracking-wider">Aktif Terdaftar</span>
                </div>
              </div>

              {/* Grid of Ziyadah, Tahsin, Murojaah */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. CARD ZIYADAH */}
                <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        Ziyadah Terbaru
                      </span>
                      {latestZiyadah && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          {latestZiyadah.tanggalSetoran}
                        </div>
                      )}
                    </div>

                    {latestZiyadah ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Materi Hafalan (Surah/Bab)</span>
                          <span className="text-base font-black text-white block">{latestZiyadah.surah}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800/40 pt-3 text-xs">
                          <div>
                            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Setoran</span>
                            <span className="font-extrabold text-slate-200 mt-0.5 block">
                              {latestZiyadah.baris} {getSatuanByKegiatan('Ziyadah')}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nilai / Catatan</span>
                            <span className="font-extrabold text-blue-400 mt-0.5 block">
                              {latestZiyadah.ctt}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs italic font-semibold">
                        Belum ada data setoran Ziyadah yang dicatat oleh Ustadz.
                      </div>
                    )}
                  </div>

                  {latestZiyadah && (
                    <div className="border-t border-slate-800/40 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rekomendasi Status</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        latestZiyadah.status === 'Boleh Lanjut' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {latestZiyadah.status === 'Boleh Lanjut' ? (
                          <Smile className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Frown className="w-3 h-3 text-rose-400" />
                        )}
                        {latestZiyadah.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. CARD TAHSIN (IQRA') */}
                <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Tahsin (IQRA') Terbaru
                      </span>
                      {latestTahsin && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                          <Calendar className="w-3.5 h-3.5" />
                          {latestTahsin.tanggalSetoran}
                        </div>
                      )}
                    </div>

                    {latestTahsin ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Materi / Jilid & Halaman</span>
                          <span className="text-base font-black text-white block">{latestTahsin.surah || 'Tahsin Tilawah'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800/40 pt-3 text-xs">
                          <div>
                            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Halaman</span>
                            <span className="font-extrabold text-slate-200 mt-0.5 block">
                              {latestTahsin.baris} {getSatuanByKegiatan(latestTahsin.kegiatan)}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nilai / Catatan</span>
                            <span className="font-extrabold text-indigo-400 mt-0.5 block">
                              {latestTahsin.ctt}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-500 text-xs italic font-semibold">
                        Belum ada data setoran Tahsin yang dicatat oleh Ustadz.
                      </div>
                    )}
                  </div>

                  {latestTahsin && (
                    <div className="border-t border-slate-800/40 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rekomendasi Status</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        latestTahsin.status === 'Boleh Lanjut' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {latestTahsin.status === 'Boleh Lanjut' ? (
                          <Smile className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Frown className="w-3 h-3 text-rose-400" />
                        )}
                        {latestTahsin.status}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. CARD MUROJAAH LIST */}
                <div className="col-span-1 md:col-span-2 bg-[#0d1627] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-violet-500/40 transition-all">
                  <div className="border-b border-slate-800/60 pb-2">
                    <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Portofolio Murojaah Anda
                    </span>
                    <h5 className="text-xs font-bold text-slate-400 mt-2 font-medium">Daftar nama-nama surah yang telah berhasil dimurojaahkan oleh Anda kepada asatidzah</h5>
                  </div>

                  <div className="pt-2">
                    {murojaahList.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto pr-1">
                        {murojaahList.map((surahName, index) => (
                          <div 
                            key={`murojaah-item-${surahName}-${index}`} 
                            className="px-3 py-1.5 bg-[#070D19] border border-slate-800/80 hover:border-violet-500/40 rounded-xl text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
                            <span>{surahName}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-500 text-xs italic font-semibold">
                        Belum ada riwayat setoran Murojaah yang tercatat.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#0d1627] flex items-center justify-end">
          <button
            id="btn-close-modal-bottom"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Tutup Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
