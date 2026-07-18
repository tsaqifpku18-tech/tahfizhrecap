import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Trash2, Camera, Check, AlertCircle, Shield, User } from 'lucide-react';
import { UserSession } from '../types';

interface ProfileSettingsModalProps {
  currentUser: UserSession;
  profilePics: Record<string, string>;
  customLogo: string;
  onUpdateProfilePic: (name: string, dataUrl: string) => void;
  onUpdateCustomLogo: (dataUrl: string) => void;
  onClose: () => void;
}

export function ProfileSettingsModal({
  currentUser,
  profilePics,
  customLogo,
  onUpdateProfilePic,
  onUpdateCustomLogo,
  onClose
}: ProfileSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'logo'>(
    currentUser.role === 'ustadz' ? 'profile' : 'profile'
  );

  // States for Profile Tab
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    profilePics[currentUser.nama] || null
  );
  const [isProfileDragging, setIsProfileDragging] = useState(false);
  const [profileError, setProfileError] = useState<string>('');
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // States for Logo Tab
  const [logoPreview, setLogoPreview] = useState<string | null>(customLogo);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [logoError, setLogoError] = useState<string>('');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // General Notification toast
  const [toastMessage, setToastMessage] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Profile Picture File Processing
  const handleProfileFile = (file: File) => {
    setProfileError('');
    if (!file.type.startsWith('image/')) {
      setProfileError('Format file harus berupa gambar (JPG, PNG, WEBP, dll).');
      return;
    }
    // Limit to 2.5MB to stay within safe localStorage bounds
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
    triggerToast('Foto profil berhasil diperbarui!');
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
    // Limit to 2.5MB
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
      // Revert to default URL
      onUpdateCustomLogo('https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0');
    }
    triggerToast('Logo aplikasi berhasil diperbarui!');
  };

  const handleResetLogo = () => {
    setLogoPreview('https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0');
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
        className="bg-[#0b1322] border border-slate-800 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-100"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800/60 bg-[#0d1627]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Pengaturan Profil & Tampilan</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Atur foto profil Anda dan kustomisasi logo aplikasi</p>
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

        {/* Tab Headers (Only show if ustadz/admin) */}
        {currentUser.role === 'ustadz' && (
          <div className="flex border-b border-slate-800/40 bg-[#0d1627]/50 px-4">
            <button
              id="btn-tab-profile-settings"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Foto Profil Saya
            </button>
            <button
              id="btn-tab-logo-settings"
              onClick={() => setActiveTab('logo')}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'logo'
                  ? 'border-blue-500 text-blue-400 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Logo Instansi (Admin)
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' ? (
            /* TAB 1: PROFILE PICTURE SETTINGS */
            <div className="space-y-6 animate-in fade-in duration-150">
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
                  <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    {currentUser.role === 'ustadz' ? 'Akses Guru Al-Qur\'an (Ustadz / Admin)' : 'Akses Siswa / Wali Murid'}
                  </p>
                </div>
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
                  Hapus Foto Profil
                </button>

                <button
                  id="btn-save-profile-settings"
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: SYSTEM LOGO SETTINGS */
            <div className="space-y-6 animate-in fade-in duration-150">
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Simpan Logo Baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
