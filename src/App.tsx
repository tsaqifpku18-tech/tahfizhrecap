import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  BookOpen, 
  Hash, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  HelpCircle,
  FileSpreadsheet,
  Trash2,
  Pencil,
  Loader2,
  LogOut,
  Lock,
  UserCheck,
  ClipboardList,
  Calendar,
  Plus,
  TrendingUp,
  Award,
  GraduationCap,
  Music,
  Undo2,
  Target,
  Trophy,
  ChevronDown,
  Bell,
  Menu,
  X,
  Smile,
  Frown,
  Mail,
  ExternalLink,
  ShieldCheck,
  Info,
  Newspaper
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Setoran, Settings, UserSession, TugasHarian, CapaianTargetZiyadah, UserAccount, BeritaItem } from './types';

// Inisialisasi Firebase Auth untuk integrasi Gmail Ustadz
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
import { DEMO_SETORAN, DEMO_TUGAS_HARIAN, getSatuanByKegiatan, GOOGLE_APPS_SCRIPT_CODE, DEMO_CAPAIAN_TARGET_ZIYADAH, DEMO_AKUN, DEMO_BERITA } from './data';
import { StatsCard } from './components/StatsCard';
import { NewAssessmentForm } from './components/NewAssessmentForm';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StatsCharts } from './components/StatsCharts';
import { LoginPage } from './components/LoginPage';
import { AlWildanLogo } from './components/AlWildanLogo';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { DatabaseTab } from './components/DatabaseTab';
import { BeritaTab } from './components/BeritaTab';
import { RankingModal } from './components/RankingModal';

// Helper function to format date to dd MMMM yyyy (Indonesian)
const formatTanggalIndo = (tanggalStr: string): string => {
  if (!tanggalStr) return '-';
  
  // Try directly parsing first
  let date = new Date(tanggalStr);
  
  // Fallback for custom parsing if date is invalid
  if (isNaN(date.getTime())) {
    return tanggalStr;
  }
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

// Helper to perform smart and robust name matching between student profile name (e.g., from Akun sheet) and evaluation name (e.g., from Penilaian sheet)
const isStudentNameMatched = (setoranName: string, studentProfileName: string): boolean => {
  const sName = (setoranName || '').toLowerCase().trim();
  const pName = (studentProfileName || '').toLowerCase().trim();
  
  if (!sName || !pName) return false;
  if (sName === pName) return true;
  
  // Check if one contains the other
  if (sName.includes(pName) || pName.includes(sName)) return true;
  
  // Split names into individual words and filter out small filler words (length <= 2)
  const sWords = sName.split(/\s+/).filter(w => w.length > 2);
  const pWords = pName.split(/\s+/).filter(w => w.length > 2);
  
  // If there are words in common (e.g. "Azzam Malik" and "Azzam"), it is a match
  return sWords.some(w => pWords.includes(w));
};

// Helper to perform smart grade matching (e.g. "Kelas 7A" and "7A" or "7 A")
export const isGradeMatched = (g1: string, g2: string): boolean => {
  if (!g1 || !g2) return false;
  const str1 = String(g1).trim().toLowerCase();
  const str2 = String(g2).trim().toLowerCase();
  if (str1 === 'all' || str2 === 'all' || str1 === 'semua' || str2 === 'semua') return true;
  if (str1 === str2) return true;
  const clean1 = str1.replace(/kelas|grade|\s+|-|_/g, '');
  const clean2 = str2.replace(/kelas|grade|\s+|-|_/g, '');
  return clean1 === clean2;
};

// Helper to parse the multi-column (split) task materi field
export const parseMateriField = (materi: string) => {
  try {
    const trimmed = (materi || '').trim();
    if (trimmed && (trimmed.startsWith('{') || trimmed.startsWith('{"'))) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        const ziyadah = (parsed.ziyadah || '').trim();
        const murojaah = (parsed.murojaah || '').trim();
        const tugasMateri = (parsed.tugasMateri || parsed.materi || '').trim();
        
        // Only treat as rich JSON if at least one field is non-empty
        if (ziyadah || murojaah || tugasMateri) {
          return {
            ziyadah,
            murojaah,
            tugasMateri,
            isJson: true,
          };
        }
      }
    }
  } catch (e) {
    // Fallback to plain text
  }
  return {
    ziyadah: '',
    murojaah: '',
    tugasMateri: materi || '',
    isJson: false,
  };
};

// Robust date formatting to handle different date string styles returned by Sheets
export const formatDateSafe = (dateStr: any): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  
  // Try to parse using standard Date first (e.g. if it is "YYYY-MM-DD" or standard ISO)
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Handle "DD/MM/YYYY" or "DD-MM-YYYY" or "DD.MM.YYYY"
  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    
    // Check if the third part is a year (e.g., 4 digits) and first part is a day
    if (p0 <= 31 && p1 <= 12 && p2 > 1000) {
      const d2 = new Date(p2, p1 - 1, p0);
      if (!isNaN(d2.getTime())) {
        return d2.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    }
    // Check if first part is a year (e.g. YYYY/MM/DD)
    if (p0 > 1000 && p1 <= 12 && p2 <= 31) {
      const d2 = new Date(p0, p1 - 1, p2);
      if (!isNaN(d2.getTime())) {
        return d2.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    }
  }

  // Fallback to raw string if parsing fails
  return str;
};

// Robust date parsing to milliseconds for sorting
export const parseDateToTime = (dateStr: any): number => {
  if (!dateStr) return 0;
  const str = String(dateStr).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.getTime();
  
  const parts = str.split(/[-/.]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    if (p0 <= 31 && p1 <= 12 && p2 > 1000) {
      const d2 = new Date(p2, p1 - 1, p0);
      if (!isNaN(d2.getTime())) return d2.getTime();
    }
    if (p0 > 1000 && p1 <= 12 && p2 <= 31) {
      const d2 = new Date(p0, p1 - 1, p2);
      if (!isNaN(d2.getTime())) return d2.getTime();
    }
  }
  return 0;
};


// Helper to dynamically normalize user role based on name
const normalizeUserSession = (session: UserSession | null): UserSession | null => {
  if (!session) return null;
  const nameLower = (session.nama || '').toLowerCase();
  let updatedRole = session.role;
  if (nameLower.includes('admin')) {
    updatedRole = 'admin';
  } else if (nameLower.includes('ustadz')) {
    updatedRole = 'ustadz';
  }
  if (updatedRole !== session.role) {
    return { ...session, role: updatedRole };
  }
  return session;
};

export default function App() {
  // 1. Core States
  const [setoran, setSetoran] = useState<Setoran[]>(DEMO_SETORAN);
  const [tugasHarian, setTugasHarian] = useState<TugasHarian[]>(DEMO_TUGAS_HARIAN);
  const [capaianZiyadah, setCapaianZiyadah] = useState<CapaianTargetZiyadah[]>(DEMO_CAPAIAN_TARGET_ZIYADAH);
  const [activeTab, setActiveTab] = useState<'rekap' | 'tugas' | 'statistik' | 'capaian_ziyadah' | 'database' | 'berita'>('rekap');
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);

  // Berita State
  const [beritaList, setBeritaList] = useState<BeritaItem[]>(() => {
    try {
      const saved = localStorage.getItem('alwildan_berita');
      return saved ? JSON.parse(saved) : DEMO_BERITA;
    } catch {
      return DEMO_BERITA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('alwildan_berita', JSON.stringify(beritaList));
    } catch (e) {
      console.error('Failed to save berita to localStorage', e);
    }
  }, [beritaList]);

  const handleAddBerita = (newBerita: Omit<BeritaItem, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const item: BeritaItem = {
      ...newBerita,
      id: `berita_${Date.now()}`,
      createdAt: new Date().toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: [],
      comments: []
    };
    setBeritaList((prev) => [item, ...prev]);
  };

  const handleDeleteBerita = (id: string) => {
    setBeritaList((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleLikeBerita = (beritaId: string) => {
    if (!currentUser) return;
    setBeritaList((prev) =>
      prev.map((item) => {
        if (item.id === beritaId) {
          const isLiked = item.likes.includes(currentUser.nama);
          const newLikes = isLiked
            ? item.likes.filter((n) => n !== currentUser.nama)
            : [...item.likes, currentUser.nama];
          return { ...item, likes: newLikes };
        }
        return item;
      })
    );
  };

  const handleAddCommentBerita = (beritaId: string, commentText: string) => {
    if (!currentUser || !commentText.trim()) return;
    const commentObj = {
      id: `comm_${Date.now()}`,
      userName: currentUser.nama,
      userRole: currentUser.role,
      comment: commentText.trim(),
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setBeritaList((prev) =>
      prev.map((item) => {
        if (item.id === beritaId) {
          return { ...item, comments: [...item.comments, commentObj] };
        }
        return item;
      })
    );
  };

  const [editingTugas, setEditingTugas] = useState<TugasHarian | null>(null);
  const [lastCreatedRecord, setLastCreatedRecord] = useState<{
    studentName: string;
    type: 'setoran' | 'tugas';
    timestamp: number;
  } | null>(null);
  const [manualForwardEmail, setManualForwardEmail] = useState<string>('');
  const [manualForwardStudentName, setManualForwardStudentName] = useState<string>('');
  
  // Google Auth & Gmail Sync States
  const [ustadzGmailUser, setUstadzGmailUser] = useState<User | null>(null);
  const [ustadzGmailToken, setUstadzGmailToken] = useState<string | null>(null);
  const [isGmailSyncing, setIsGmailSyncing] = useState<boolean>(false);
  
  const [isSubmittingTugas, setIsSubmittingTugas] = useState<boolean>(false);
  const [confirmDeleteTugas, setConfirmDeleteTugas] = useState<TugasHarian | null>(null);
  
  const [usingDemoData, setUsingDemoData] = useState<boolean>(true);
  
  // Capaian Target Ziyadah local edits and inline editing states
  const [capaianLocalEdits, setCapaianLocalEdits] = useState<{ [key: string]: { capaian: number, target: number } }>(() => {
    const saved = localStorage.getItem('capaian_local_edits');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse capaian_local_edits', e);
      }
    }
    return {};
  });
  const [editingCapaianStudent, setEditingCapaianStudent] = useState<string | null>(null);
  const [editCapaianValue, setEditCapaianValue] = useState<number>(0);
  const [editTargetValue, setEditTargetValue] = useState<number>(0);
  
  // Tugas Harian Form state
  const [tugasFormTanggal, setTugasFormTanggal] = useState<string>(() => {
    return new Date().toISOString().substring(0, 10);
  });
  const [tugasFormGrade, setTugasFormGrade] = useState<string>('All');
  const [tugasFormSiswa, setTugasFormSiswa] = useState<string>('All');
  const [tugasFormMateri, setTugasFormMateri] = useState<string>('');
  const [tugasFormZiyadah, setTugasFormZiyadah] = useState<string>('');
  const [tugasFormMurojaah, setTugasFormMurojaah] = useState<string>('');
  const [tugasFormTugasMateri, setTugasFormTugasMateri] = useState<string>('');
  const [tugasFormUstadz, setTugasFormUstadz] = useState<string>('');
  const [tugasFormKeterangan, setTugasFormKeterangan] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingSetoran, setEditingSetoran] = useState<Setoran | null>(null);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState<Setoran | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // G-Mail Accounts State (Loaded from localStorage)
  const [gmailAccounts, setGmailAccounts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('tahfizh_gmail_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tahfizh_gmail_accounts', e);
      }
    }
    return {};
  });

  // Derived state for forward notifications
  const forwardStudentName = useMemo(() => {
    if (manualForwardStudentName) return manualForwardStudentName;
    if (lastCreatedRecord?.studentName) return lastCreatedRecord.studentName;
    if (manualForwardEmail) {
      const emailLower = manualForwardEmail.toLowerCase().trim();
      for (const [name, email] of Object.entries(gmailAccounts)) {
        if (typeof email === 'string' && email.toLowerCase().trim() === emailLower) {
          return name;
        }
      }
    }
    return '';
  }, [manualForwardStudentName, lastCreatedRecord, manualForwardEmail, gmailAccounts]);

  const getStudentGmail = (nama: string) => {
    if (!nama) return '';
    const nameLower = nama.toLowerCase().trim();
    for (const key of Object.keys(gmailAccounts)) {
      if (key.toLowerCase().trim() === nameLower) {
        return gmailAccounts[key];
      }
    }
    for (const key of Object.keys(gmailAccounts)) {
      const kLower = key.toLowerCase().trim();
      if (kLower.includes(nameLower) || nameLower.includes(kLower)) {
        return gmailAccounts[key];
      }
    }
    return '';
  };

  const forwardEmail = useMemo(() => {
    if (manualForwardEmail) return manualForwardEmail;
    return getStudentGmail(forwardStudentName);
  }, [forwardStudentName, gmailAccounts, manualForwardEmail]);

  const handleSyncGmail = async () => {
    setIsGmailSyncing(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setUstadzGmailToken(credential.accessToken);
        setUstadzGmailUser(result.user);
        alert(`Alhamdulillah, berhasil menyinkronkan akun Gmail Ustadz: ${result.user.email}`);
      } else {
        throw new Error("Gagal memperoleh token akses Gmail dari Google Auth.");
      }
    } catch (err: any) {
      console.error("Gmail synchronization failed:", err);
      
      const errCode = String(err?.code || '');
      const errMsg = String(err?.message || err || '');
      const isUnauthorizedDomain = 
        errCode.includes('unauthorized-domain') || 
        errCode.includes('unauthorized-client-domain') ||
        errMsg.toLowerCase().includes('unauthorized-domain') ||
        errMsg.toLowerCase().includes('unauthorized domain') ||
        errMsg.toLowerCase().includes('authorized-domain') ||
        errMsg.toLowerCase().includes('authorized domain');

      if (isUnauthorizedDomain) {
        const currentDomain = window.location.hostname;
        const pId = firebaseConfig.projectId || 'red-ripple-k6ppv';
        alert(
          `⚠️ SINKRONISASI DIBLOKIR OLEH FIREBASE (UNAUTHORIZED DOMAIN) ⚠️\n\n` +
          `Sistem mendeteksi bahwa domain URL yang dipublish belum didaftarkan sebagai domain tepercaya di Firebase Console Anda.\n\n` +
          `Silakan ikuti langkah-langkah mudah berikut untuk mengizinkannya:\n` +
          `1. Buka halaman pengaturan Firebase Auth Anda melalui link berikut:\n` +
          `   https://console.firebase.google.com/project/${pId}/authentication/settings\n\n` +
          `2. Cari bagian "Authorized Domains" (Domain resmi).\n\n` +
          `3. Klik tombol "Add Domain" (Tambah Domain) lalu masukkan domain berikut:\n` +
          `   ${currentDomain}\n\n` +
          `4. Klik "Add" (Simpan).\n\n` +
          `Setelah ditambahkan, tunggu sekitar 1 menit dan coba klik tombol sinkronisasi kembali. Insya Allah sinkronisasi akan berhasil!`
        );
      } else {
        alert(`Gagal sinkronisasi Gmail: ${err?.message || err}`);
      }
    } finally {
      setIsGmailSyncing(false);
    }
  };

  const handleDisconnectGmail = async () => {
    try {
      await signOut(firebaseAuth);
      setUstadzGmailToken(null);
      setUstadzGmailUser(null);
      alert("Koneksi Gmail Ustadz berhasil diputus.");
    } catch (err: any) {
      console.error("Gmail logout failed:", err);
    }
  };

  const buildGmailRaw = (to: string, subject: string, message: string) => {
    const emailParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      message
    ];
    const email = emailParts.join('\r\n');
    return btoa(unescape(encodeURIComponent(email)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleSendForwardMessage = async () => {
    if (!forwardEmail) return;
    const messageBody = `[REMINDER] Alhamdulillah, homework has been shared to your Tahfizh Recap Account. Please check now, and thank you. Baarokallahu Fiykum.`;
    const subject = `[REMINDER] Tahfizh Al-Wildan`;
    
    // Jika token Gmail Ustadz tersedia, kirim langsung via Gmail API
    if (ustadzGmailToken) {
      try {
        const rawMessage = buildGmailRaw(forwardEmail, subject, messageBody);
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ustadzGmailToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: rawMessage })
        });

        if (response.ok) {
          alert(`Alhamdulillah, notifikasi berhasil dikirim langsung via Gmail Anda ke ${forwardStudentName || 'Siswa'} (${forwardEmail})!`);
          setLastCreatedRecord(null);
          setManualForwardEmail('');
          setManualForwardStudentName('');
          return;
        } else {
          const errData = await response.json();
          console.error('Failed to send email via Gmail API:', errData);
          if (response.status === 401) {
            alert('Sesi Gmail Anda telah kedaluwarsa. Silakan sinkronkan ulang akun Gmail Anda.');
            setUstadzGmailToken(null);
            setUstadzGmailUser(null);
            return;
          }
          throw new Error(errData?.error?.message || 'Gagal mengirim email.');
        }
      } catch (err: any) {
        console.error('Error sending email via Gmail API:', err);
        alert(`Gagal mengirim via Gmail API (${err.message}). Menggunakan metode fallback mailto...`);
      }
    }

    // Fallback ke metode pengiriman background via Apps Script dan mailto client
    if (settings.appsScriptUrl) {
      try {
        await fetch(settings.appsScriptUrl, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'sendEmail',
            email: forwardEmail,
            subject: subject,
            body: messageBody,
            siswa: forwardStudentName
          }),
        });
      } catch (err) {
        console.error('Failed to send background email:', err);
      }
    }

    const mailtoUrl = `mailto:${forwardEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageBody)}`;
    window.open(mailtoUrl, '_blank');
    
    alert(`Alhamdulillah, notifikasi berhasil di-forward untuk ${forwardStudentName || 'Siswa'} (${forwardEmail})!`);
    setLastCreatedRecord(null);
    setManualForwardEmail('');
    setManualForwardStudentName('');
  };

  // Undo States
  const [lastAction, setLastAction] = useState<{
    type: 'add' | 'edit' | 'delete';
    data: Setoran;
    prevData?: Setoran;
  } | null>(null);
  const [isUndoing, setIsUndoing] = useState<boolean>(false);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);

  // Session State (Loaded from localStorage)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const savedSession = localStorage.getItem('tahfizh_user_session');
    if (savedSession) {
      try {
        return normalizeUserSession(JSON.parse(savedSession));
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    return null;
  });

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tahfizh_user_session');
    localStorage.removeItem('tahfizh_admin_original_session');
    setOriginalAdminSession(null);
  };

  const handleLoginSuccess = (session: UserSession) => {
    const normalized = normalizeUserSession(session);
    setCurrentUser(normalized);
    localStorage.setItem('tahfizh_user_session', JSON.stringify(normalized));
    if (normalized && normalized.role === 'admin') {
      localStorage.setItem('tahfizh_admin_original_session', JSON.stringify(normalized));
      setOriginalAdminSession(normalized);
    }
    if (normalized && normalized.gmail) {
      setGmailAccounts(prev => {
        const updated = { ...prev, [normalized.nama]: normalized.gmail || '' };
        localStorage.setItem('tahfizh_gmail_accounts', JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Profile Picture States (Loaded from localStorage)
  const [profilePics, setProfilePics] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('tahfizh_profile_pics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse tahfizh_profile_pics', e);
      }
    }
    return {};
  });

  // Custom Logo State (Loaded from localStorage)
  const [customLogo, setCustomLogo] = useState<string>(() => {
    return localStorage.getItem('tahfizh_custom_logo') || "https://lh3.googleusercontent.com/d/1ZViH5e-ooEl4MW1MxrSF0Qu6jdfHlYw0";
  });

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  const handleUpdateProfilePic = (name: string, dataUrl: string) => {
    const updated = { ...profilePics };
    if (dataUrl) {
      updated[name] = dataUrl;
    } else {
      delete updated[name];
    }
    setProfilePics(updated);
    localStorage.setItem('tahfizh_profile_pics', JSON.stringify(updated));
  };

  const handleUpdateGmail = async (name: string, gmail: string) => {
    const updated = { ...gmailAccounts };
    if (gmail) {
      updated[name] = gmail;
    } else {
      delete updated[name];
    }
    setGmailAccounts(updated);
    localStorage.setItem('tahfizh_gmail_accounts', JSON.stringify(updated));

    // Also update current user session if the logged-in user changed their own email
    if (currentUser && currentUser.nama === name) {
      const updatedSession = { ...currentUser, gmail };
      setCurrentUser(updatedSession);
      localStorage.setItem('tahfizh_user_session', JSON.stringify(updatedSession));
    }

    // Synchronize with Google Sheets
    if (!usingDemoData && settings.appsScriptUrl) {
      try {
        const userId = currentUser?.id || name;
        await fetch(settings.appsScriptUrl, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            id: userId,
            nama: name,
            gmail: gmail,
            targetTab: 'akun',
            action: 'edit'
          }),
        });
      } catch (err) {
        console.error('Failed to sync gmail to spreadsheet:', err);
      }
    }
  };

  const handleUpdateCustomLogo = (dataUrl: string) => {
    setCustomLogo(dataUrl);
    localStorage.setItem('tahfizh_custom_logo', dataUrl);
  };

  // Default Google Apps Script URL set by the developer
  const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzcP6YvgV66Z4x_i7mw8UDNYermPPhd3W1INWCUISoK9z3FR9lJb8Ixu4lnWezMHz7B/exec';

  // Settings state (Loaded from localStorage with fallback to default Apps Script URL)
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('tahfizh_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          appsScriptUrl: DEFAULT_APPS_SCRIPT_URL, // Always override/use the default URL set by the developer
          sheetName: parsed.sheetName || 'Sheet1',
        };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return { appsScriptUrl: DEFAULT_APPS_SCRIPT_URL, sheetName: 'Sheet1' };
  });

  // Modal State for Individual Student History Drill-down
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  // UI / Navigation / Tab State
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // Changed to false by default for all accounts on initial load
  const [showLatestInfoPopup, setShowLatestInfoPopup] = useState<boolean>(true);

  // Administrative simulation and list of accounts
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('tahfizh_all_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(acc => acc && acc.id && acc.nama);
        }
      } catch (e) {
        console.error('Failed to parse all accounts from localStorage', e);
      }
    }
    return DEMO_AKUN;
  });

  const [originalAdminSession, setOriginalAdminSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('tahfizh_admin_original_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse original admin session', e);
      }
    }
    return null;
  });

  const handleSimulateUser = (userId: string) => {
    const targetAccount = allAccounts.find(a => a.id === userId);
    if (targetAccount) {
      const simulatedSession: UserSession = {
        id: targetAccount.id,
        nama: targetAccount.nama,
        role: targetAccount.role,
        gmail: targetAccount.gmail || '',
        grade: targetAccount.grade || ''
      };
      setCurrentUser(simulatedSession);
      localStorage.setItem('tahfizh_user_session', JSON.stringify(simulatedSession));
    }
  };

  const handleReturnToAdmin = () => {
    if (originalAdminSession) {
      setCurrentUser(originalAdminSession);
      localStorage.setItem('tahfizh_user_session', JSON.stringify(originalAdminSession));
    }
  };

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [adminAccountSearchQuery, setAdminAccountSearchQuery] = useState<string>('');
  const [tugasSearchQuery, setTugasSearchQuery] = useState<string>('');

  // Filtered accounts for administrative simulation dropdown
  const filteredSimulationAccounts = useMemo(() => {
    if (!adminAccountSearchQuery.trim()) return allAccounts;
    const query = adminAccountSearchQuery.toLowerCase().trim();
    return allAccounts.filter((acc) => {
      if (!acc) return false;
      const nama = String(acc.nama || '').toLowerCase();
      const id = String(acc.id || '').toLowerCase();
      const isUstadzByName = nama.includes('ustadz');
      const roleLabel = acc.role === 'admin' ? 'admin' : (acc.role === 'ustadz' || isUstadzByName) ? 'ustadz' : 'siswa';
      return (
        nama.includes(query) ||
        roleLabel.includes(query) ||
        id.includes(query)
      );
    });
  }, [allAccounts, adminAccountSearchQuery]);
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [kegiatanFilter, setKegiatanFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const [halaqahStudentIds, setHalaqahStudentIds] = useState<string[]>(() => {
    if (currentUser && currentUser.role === 'ustadz') {
      const saved = localStorage.getItem(`halaqah_students_of_${currentUser.nama}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse halaqah_students', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (currentUser && currentUser.role === 'ustadz') {
      const saved = localStorage.getItem(`halaqah_students_of_${currentUser.nama}`);
      if (saved) {
        try {
          setHalaqahStudentIds(JSON.parse(saved));
          return;
        } catch (e) {
          console.error('Failed to parse halaqah_students in effect', e);
        }
      }
      setHalaqahStudentIds([]);
    } else {
      setHalaqahStudentIds([]);
    }
  }, [currentUser]);

  // Efek untuk mendengarkan status autentikasi Firebase Google/Gmail
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setUstadzGmailUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Capaian Ziyadah Target States
  const [capaianSearch, setCapaianSearch] = useState<string>('');
  const [capaianGradeFilter, setCapaianGradeFilter] = useState<string>('All');
  const [capaianSortBy, setCapaianSortBy] = useState<'name' | 'percentage_desc' | 'percentage_asc'>('percentage_desc');
  
  // Table Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // 3. Dynamic Filtering Lists
  const uniqueGrades = useMemo(() => {
    const isStudent = currentUser && currentUser.role === 'siswa';
    const sourceData = isStudent
      ? setoran.filter((s) => isStudentNameMatched(s.nama, currentUser.nama))
      : setoran;
    const grades = sourceData.map((s) => s.grade).filter(Boolean);
    return ['All', ...Array.from(new Set(grades))];
  }, [setoran, currentUser]);

  // List of active students with ID & Grade for dropdown auto-population
  const activeStudentsList = useMemo(() => {
    const map: { [key: string]: { id: string; nama: string; grade: string } } = {};
    setoran.forEach((s) => {
      if (s.nama && !map[(s.nama || '').toLowerCase()]) {
        map[(s.nama || '').toLowerCase()] = {
          id: s.id || '',
          nama: s.nama,
          grade: s.grade || '',
        };
      }
    });
    return Object.values(map).sort((a, b) => {
      const gradeA = a.grade || '';
      const gradeB = b.grade || '';
      const gradeCompare = gradeA.localeCompare(gradeB);
      if (gradeCompare !== 0) return gradeCompare;
      return (a.nama || '').localeCompare(b.nama || '');
    });
  }, [setoran]);

  const mergedCapaianZiyadah = useMemo(() => {
    // Collect all student entities from database accounts, active student lists, capaian_ziyadah table, and setoran logs
    const studentMap = new Map<string, {
      id: string;
      nama: string;
      grade: string;
      sheetCapaian: number;
      target: number;
    }>();

    // First seed from allAccounts (role: 'siswa')
    allAccounts.forEach((acc) => {
      if (acc && acc.nama && acc.role === 'siswa') {
        const key = acc.nama.toLowerCase().trim();
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            id: acc.id || `acc_${key}`,
            nama: acc.nama,
            grade: acc.grade || '7A',
            sheetCapaian: 0,
            target: 300,
          });
        }
      }
    });

    // Seed from activeStudentsList
    activeStudentsList.forEach((st) => {
      if (st && st.nama) {
        const key = st.nama.toLowerCase().trim();
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            id: st.id || `st_${key}`,
            nama: st.nama,
            grade: st.grade || '7A',
            sheetCapaian: 0,
            target: 300,
          });
        }
      }
    });

    // Seed from capaianZiyadah tab
    capaianZiyadah.forEach((cz) => {
      if (cz && cz.nama) {
        const key = cz.nama.toLowerCase().trim();
        const existing = studentMap.get(key);
        if (existing) {
          existing.sheetCapaian = cz.capaian || 0;
          existing.target = cz.target || existing.target || 300;
          if (cz.grade) existing.grade = cz.grade;
        } else {
          studentMap.set(key, {
            id: cz.id || `cz_${key}`,
            nama: cz.nama,
            grade: cz.grade || '7A',
            sheetCapaian: cz.capaian || 0,
            target: cz.target || 300,
          });
        }
      }
    });

    // Calculate total Ziyadah setoran lines from setoran database for each student
    const result: CapaianTargetZiyadah[] = [];

    studentMap.forEach((stData, key) => {
      // Find all setoran entries from database for this student with kegiatan 'ziyadah'
      const studentSetorans = setoran.filter(
        (s) => s && isStudentNameMatched(s.nama, stData.nama) && s.kegiatan && s.kegiatan.toLowerCase().includes('ziyadah')
      );
      const totalSetoranBaris = studentSetorans.reduce((acc, curr) => acc + (Number(curr.baris) || 0), 0);

      // Total capaian = max of sheet specified base capaian or sum of Ziyadah setoran entries
      let finalCapaian = Math.max(stData.sheetCapaian, totalSetoranBaris);
      let finalTarget = stData.target > 0 ? stData.target : 300;

      // Check for local overrides if user manually edited
      const localEdit = capaianLocalEdits[key];
      if (localEdit) {
        finalCapaian = localEdit.capaian;
        finalTarget = localEdit.target;
      }

      const percentage = finalTarget > 0 ? Math.round((finalCapaian / finalTarget) * 100) : 0;

      result.push({
        id: stData.id,
        nama: stData.nama,
        grade: stData.grade,
        capaian: finalCapaian,
        target: finalTarget,
        persentase: percentage,
      });
    });

    return result;
  }, [allAccounts, activeStudentsList, capaianZiyadah, setoran, capaianLocalEdits]);

  const uniqueCapaianGrades = useMemo(() => {
    const grades = mergedCapaianZiyadah.map((c) => c?.grade).filter(Boolean);
    return ['All', ...Array.from(new Set(grades))];
  }, [mergedCapaianZiyadah]);

  // Student Rank Info for Sidebar Icon & Quick View
  const studentRankInfo = useMemo(() => {
    if (!currentUser || currentUser.role !== 'siswa') return null;

    const myGrade = currentUser.grade || '7A';
    const targetGrade = myGrade;

    const studentMap = new Map<string, { nama: string; totalBaris: number; totalSetoran: number }>();

    // Seed active students
    activeStudentsList.forEach((st) => {
      if (!st.grade || isGradeMatched(st.grade, targetGrade)) {
        const key = st.nama.toLowerCase().trim();
        if (!studentMap.has(key)) {
          studentMap.set(key, { nama: st.nama, totalBaris: 0, totalSetoran: 0 });
        }
      }
    });

    // Seed capaian Ziyadah
    capaianZiyadah.forEach((cz) => {
      if (isGradeMatched(cz.grade, targetGrade)) {
        const key = cz.nama.toLowerCase().trim();
        const existing = studentMap.get(key) || { nama: cz.nama, totalBaris: 0, totalSetoran: 0 };
        existing.totalBaris = Math.max(existing.totalBaris, cz.capaian || 0);
        studentMap.set(key, existing);
      }
    });

    // Sum setoran
    setoran.forEach((s) => {
      if (isGradeMatched(s.grade, targetGrade)) {
        const key = s.nama.toLowerCase().trim();
        const existing = studentMap.get(key) || { nama: s.nama, totalBaris: 0, totalSetoran: 0 };
        existing.totalSetoran += 1;
        if (s.kegiatan && s.kegiatan.toLowerCase().includes('ziyadah')) {
          existing.totalBaris += Number(s.baris) || 0;
        }
        studentMap.set(key, existing);
      }
    });

    const myKey = currentUser.nama.toLowerCase().trim();
    if (!studentMap.has(myKey)) {
      studentMap.set(myKey, { nama: currentUser.nama, totalBaris: 0, totalSetoran: 0 });
    }

    const sorted = Array.from(studentMap.values()).sort((a, b) => {
      if (b.totalBaris !== a.totalBaris) return b.totalBaris - a.totalBaris;
      return b.totalSetoran - a.totalSetoran;
    });

    const myIndex = sorted.findIndex((item) => isStudentNameMatched(item.nama, currentUser.nama));
    const rank = myIndex !== -1 ? myIndex + 1 : 1;
    const myData = myIndex !== -1 ? sorted[myIndex] : { totalBaris: 0, totalSetoran: 0 };

    return {
      rank,
      totalStudents: sorted.length,
      totalBaris: myData.totalBaris,
      totalSetoran: myData.totalSetoran
    };
  }, [currentUser, setoran, capaianZiyadah, activeStudentsList]);

  const processedCapaianList = useMemo(() => {
    let list = mergedCapaianZiyadah;
    
    // If the logged in user is a student (role: 'siswa'), strictly restrict only to their own data
    if (currentUser && currentUser.role === 'siswa') {
      const myItem = list.find((item) => item && isStudentNameMatched(item.nama, currentUser.nama));
      if (myItem) {
        return [myItem];
      }
      const studentSetoran = setoran.filter((s) => isStudentNameMatched(s.nama, currentUser.nama));
      const studentZiyadah = studentSetoran.filter((s) => s.kegiatan?.toLowerCase().includes('ziyadah'));
      const totalZiyadahBaris = studentZiyadah.reduce((acc, curr) => acc + (Number(curr.baris) || 0), 0);
      const defaultTarget = 300;
      const remTarget = Math.max(0, defaultTarget - totalZiyadahBaris);
      const pct = Math.round((totalZiyadahBaris / defaultTarget) * 100);
      return [{
        id: `synthetic_${currentUser.id}`,
        nama: currentUser.nama,
        grade: currentUser.grade || '7A',
        capaian: totalZiyadahBaris,
        target: remTarget,
        persentase: pct
      }];
    }
    
    // If user filtered by grade:
    if (capaianGradeFilter !== 'All') {
      list = list.filter((item) => item && item.grade === capaianGradeFilter);
    }
    
    // If user searched for name:
    if (capaianSearch.trim() !== '') {
      const query = capaianSearch.toLowerCase();
      list = list.filter((item) => item && String(item.nama || '').toLowerCase().includes(query));
    }
    
    // Sort
    return [...list].sort((a, b) => {
      if (!a || !b) return 0;
      const pctA = a.persentase !== undefined && a.persentase !== null
        ? a.persentase / 100
        : (a.target > 0 ? (a.capaian / a.target) : 0);
      const pctB = b.persentase !== undefined && b.persentase !== null
        ? b.persentase / 100
        : (b.target > 0 ? (b.capaian / b.target) : 0);
      
      if (capaianSortBy === 'name') {
        return String(a.nama || '').localeCompare(String(b.nama || ''));
      } else if (capaianSortBy === 'percentage_desc') {
        return pctB - pctA;
      } else if (capaianSortBy === 'percentage_asc') {
        return pctA - pctB;
      }
      return 0;
    });
  }, [mergedCapaianZiyadah, capaianGradeFilter, capaianSearch, capaianSortBy, currentUser, setoran]);

  const capaianStats = useMemo(() => {
    const list = currentUser && currentUser.role === 'siswa'
      ? mergedCapaianZiyadah.filter((item) => isStudentNameMatched(item.nama, currentUser.nama))
      : mergedCapaianZiyadah;

    const total = list.length;
    if (total === 0) return { total: 0, avgPercentage: 0, reachedTarget: 0, highestPct: 0 };
    
    let sumPct = 0;
    let reached = 0;
    let maxPct = 0;
    
    list.forEach((item) => {
      const pct = item.persentase !== undefined && item.persentase !== null
        ? item.persentase
        : (item.target > 0 ? (item.capaian / item.target) * 100 : 0);
      sumPct += pct;
      if (pct >= 100) reached++;
      if (pct > maxPct) maxPct = pct;
    });
    
    return {
      total,
      avgPercentage: Math.round(sumPct / total),
      reachedTarget: reached,
      highestPct: Math.round(maxPct),
    };
  }, [mergedCapaianZiyadah, currentUser]);

  // Fetch Tugas Harian data from Google Apps Script Web App
  const fetchTugasHarian = async (url: string): Promise<void> => {
    if (!url) return;
    try {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}tab=tugas`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const res = await response.json();
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          // Sort tasks descending by date safely
          const sortedTasks = res.data.sort((a: TugasHarian, b: TugasHarian) => {
            return parseDateToTime(b.tanggal) - parseDateToTime(a.tanggal);
          });
          setTugasHarian((prev) => {
            // Keep local tasks if server hasn't returned them yet
            const serverIds = new Set(sortedTasks.map((t: TugasHarian) => String(t.id)));
            const localOnly = prev.filter((t) => !serverIds.has(String(t.id)));
            const merged = [...localOnly, ...sortedTasks];
            return merged.sort((a, b) => parseDateToTime(b.tanggal) - parseDateToTime(a.tanggal));
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch Tugas Harian:', err);
    }
  };

  // Fetch Capaian Target Ziyadah data from Google Apps Script Web App
  const fetchCapaianZiyadah = async (url: string): Promise<void> => {
    if (!url) return;
    try {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}tab=capaian_ziyadah`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const res = await response.json();
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          const cleanCapaian = res.data.filter((item: any) => item && item.nama);
          setCapaianZiyadah(cleanCapaian);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Capaian Target Ziyadah:', err);
    }
  };

  // Fetch Accounts list from Google Sheets database
  const fetchAccounts = async (url: string): Promise<void> => {
    if (!url) return;
    try {
      const separator = url.includes('?') ? '&' : '?';
      const response = await fetch(`${url}${separator}tab=akun`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const res = await response.json();
        if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
          const cleanAccounts = res.data.filter((acc: any) => acc && acc.id && acc.nama);
          setAllAccounts(cleanAccounts);
          localStorage.setItem('tahfizh_all_accounts', JSON.stringify(cleanAccounts));

          // Sync database G-MAIL column with local profile gmailAccounts
          setGmailAccounts(prev => {
            const updated = { ...prev };
            cleanAccounts.forEach((acc: any) => {
              if (acc.nama && acc.gmail) {
                updated[acc.nama] = acc.gmail;
              }
            });
            localStorage.setItem('tahfizh_gmail_accounts', JSON.stringify(updated));
            return updated;
          });

          // Sync current logged-in/simulated user session's gmail with the database value
          setCurrentUser(prevUser => {
            if (!prevUser) return null;
            const matchedAccount = cleanAccounts.find((acc: any) => 
              (acc && acc.nama && prevUser.nama && acc.nama === prevUser.nama) || 
              (acc && acc.id && prevUser.id && acc.id === prevUser.id)
            );
            if (matchedAccount && matchedAccount.gmail && matchedAccount.gmail !== prevUser.gmail) {
              const updatedSession = { ...prevUser, gmail: matchedAccount.gmail };
              localStorage.setItem('tahfizh_user_session', JSON.stringify(updatedSession));
              return updatedSession;
            }
            return prevUser;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch accounts from sheet database:', err);
    }
  };

  // Fetch data from Google Apps Script Web App
  const fetchDataFromSheets = async (url: string): Promise<boolean> => {
    if (!url) {
      setConnectionStatus('disconnected');
      return false;
    }
    
    setConnectionStatus('connecting');
    setErrorMessage('');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const res = await response.json();
      if (res && res.status === 'success' && Array.isArray(res.data)) {
        // Sort setoran descending by date
        const sortedData = res.data.sort((a: Setoran, b: Setoran) => {
          return new Date(b.tanggalSetoran).getTime() - new Date(a.tanggalSetoran).getTime();
        });
        
        setSetoran(sortedData);
        await fetchTugasHarian(url);
        await fetchCapaianZiyadah(url);
        await fetchAccounts(url);
        setConnectionStatus('connected');
        setUsingDemoData(false);
        return true;
      } else {
        throw new Error(res.message || 'Format data dari Apps Script tidak valid.');
      }
    } catch (err: any) {
      console.error('Failed to connect to Google Sheets:', err);
      setConnectionStatus('error');
      setErrorMessage(err.toString() || 'Koneksi gagal. Pastikan URL Apps Script benar dan di-deploy sebagai "Anyone".');
      return false;
    }
  };

  // On mount: try connecting with saved URL, else stay on demo
  useEffect(() => {
    if (settings.appsScriptUrl) {
      fetchDataFromSheets(settings.appsScriptUrl);
    } else {
      setUsingDemoData(true);
      setConnectionStatus('disconnected');
    }
  }, []);

  // Save Settings handler
  const handleSaveSettings = async (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('tahfizh_settings', JSON.stringify(newSettings));
    
    if (newSettings.appsScriptUrl) {
      const connected = await fetchDataFromSheets(newSettings.appsScriptUrl);
      if (connected) {
        setShowConfig(false); // Close instructions panel automatically on success
      }
    } else {
      setSetoran(DEMO_SETORAN);
      setTugasHarian(DEMO_TUGAS_HARIAN);
      setCapaianZiyadah(DEMO_CAPAIAN_TARGET_ZIYADAH);
      setAllAccounts(DEMO_AKUN);
      setUsingDemoData(true);
      setConnectionStatus('disconnected');
    }
  };

  // Sync data manually (handles both live Google Sheets and local demo database simulation)
  const handleManualSync = async () => {
    setIsSyncing(true);
    if (usingDemoData || !settings.appsScriptUrl) {
      // Simulate real latency of database sync/refresh for demo mode
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Trigger a state reload
      setSetoran((prev) => [...prev]);
      setTugasHarian((prev) => [...prev]);
      setCapaianZiyadah((prev) => [...prev]);
      setAllAccounts(DEMO_AKUN);
    } else {
      await fetchDataFromSheets(settings.appsScriptUrl);
    }
    setIsSyncing(false);
  };

  // Use Demo Data Offline
  const handleUseDemoData = () => {
    setSetoran(DEMO_SETORAN);
    setTugasHarian(DEMO_TUGAS_HARIAN);
    setCapaianZiyadah(DEMO_CAPAIAN_TARGET_ZIYADAH);
    setAllAccounts(DEMO_AKUN);
    setUsingDemoData(true);
    setConnectionStatus('disconnected');
    setErrorMessage('');
  };

  const updateCapaianZiyadahFromSetoran = (studentName: string, grade: string, barisAdded: number) => {
    if (!studentName || barisAdded <= 0) return;
    setCapaianZiyadah((prev) => {
      const existingIdx = prev.findIndex((item) => item && isStudentNameMatched(item.nama, studentName));
      if (existingIdx !== -1) {
        const updated = [...prev];
        const cur = updated[existingIdx];
        const newCapaian = (cur.capaian || 0) + barisAdded;
        const newTarget = Math.max(0, (cur.target || 0) - barisAdded);
        const totalOrig = (cur.capaian || 0) + (cur.target || 0);
        const newPct = totalOrig > 0 ? Math.round((newCapaian / totalOrig) * 100) : 100;
        updated[existingIdx] = {
          ...cur,
          capaian: newCapaian,
          target: newTarget,
          persentase: newPct
        };
        return updated;
      } else {
        const initialTarget = 300;
        const newCapaian = barisAdded;
        const newTarget = Math.max(0, initialTarget - barisAdded);
        const newPct = Math.round((newCapaian / initialTarget) * 100);
        return [
          ...prev,
          {
            id: `capaian_${Date.now()}_${Math.random()}`,
            nama: studentName,
            grade: grade || '7A',
            capaian: newCapaian,
            target: newTarget,
            persentase: newPct
          }
        ];
      }
    });
  };

  // Add new assessment
  const handleAddSetoran = async (newSetoran: Omit<Setoran, 'id'> & { id?: string }): Promise<boolean> => {
    setIsSubmitting(true);
    
    // Auto populate student ID if not entered
    const finalId = newSetoran.id || String(Math.floor(1000000 + Math.random() * 9000000));
    const recordWithId: Setoran = {
      ...newSetoran,
      id: finalId,
    };

    // Requirement 4: Auto update capaian target ziyadah if setoran is Ziyadah
    if (recordWithId.kegiatan && recordWithId.kegiatan.toLowerCase().includes('ziyadah')) {
      updateCapaianZiyadahFromSetoran(recordWithId.nama, recordWithId.grade, Number(recordWithId.baris) || 1);
    }

    if (usingDemoData || !settings.appsScriptUrl) {
      // Offline Demo Mode: Append locally in memory
      setSetoran((prev) => [recordWithId, ...prev]);
      setIsSubmitting(false);
      setLastAction({
        type: 'add',
        data: recordWithId,
      });
      setLastCreatedRecord({
        studentName: recordWithId.nama,
        type: 'setoran',
        timestamp: Date.now()
      });
      setManualForwardEmail('');
      setManualForwardStudentName('');
      setShowUndoToast(true);
      return true;
    }

    // Live Web App Mode: Submit via POST request
    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          // Bypasses CORS preflight failure by using text/plain.
          // Google Apps Script can still parse it using JSON.parse(e.postData.contents).
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(recordWithId),
      });

      const res = await response.json();
      if (res && res.status === 'success') {
        // If there is Tugas Selanjutnya filled, also automatically post it to the Tugas Harian sheet
        if (settings.appsScriptUrl && (recordWithId.tugasZiyadah || recordWithId.tugasMurojaah || recordWithId.tugasMateri)) {
          const materiObj = {
            ziyadah: recordWithId.tugasZiyadah || '',
            murojaah: recordWithId.tugasMurojaah || '',
            tugasMateri: recordWithId.tugasMateri || '',
          };
          try {
            await fetch(settings.appsScriptUrl, {
              method: 'POST',
              mode: 'cors',
              redirect: 'follow',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
              },
              body: JSON.stringify({
                id: `penilaian_tugas_${recordWithId.id}`,
                tanggal: recordWithId.tanggalSetoran,
                grade: recordWithId.grade,
                materi: JSON.stringify(materiObj),
                ustadz: currentUser?.nama || 'Ustadz',
                keterangan: 'Tugas otomatis dari Penilaian',
                siswa: recordWithId.nama,
                targetTab: 'tugas',
                action: 'create'
              }),
            });
          } catch (tugasErr) {
            console.error('Failed to sync automatic tugas harian:', tugasErr);
          }
        }

        // Refresh dashboard statistics from Google Sheets
        await fetchDataFromSheets(settings.appsScriptUrl);
        setIsSubmitting(false);
        setLastAction({
          type: 'add',
          data: recordWithId,
        });
        setLastCreatedRecord({
          studentName: recordWithId.nama,
          type: 'setoran',
          timestamp: Date.now()
        });
        setManualForwardEmail('');
        setManualForwardStudentName('');
        setShowUndoToast(true);
        return true;
      } else {
        throw new Error(res.message || 'Gagal menyimpan data.');
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setIsSubmitting(false);
      return false;
    }
  };

  // Update existing assessment
  const handleUpdateSetoran = async (updatedRecord: Setoran): Promise<boolean> => {
    setIsSubmitting(true);
    const originalRecord = setoran.find((s) => s.id === updatedRecord.id);
    
    if (usingDemoData || !settings.appsScriptUrl) {
      // Offline Demo Mode: Update locally in memory
      setSetoran((prev) => prev.map((s) => s.id === updatedRecord.id ? updatedRecord : s));
      setIsSubmitting(false);
      setEditingSetoran(null);
      if (originalRecord) {
        setLastAction({
          type: 'edit',
          data: updatedRecord,
          prevData: originalRecord,
        });
        setShowUndoToast(true);
      }
      return true;
    }

    // Live Web App Mode: Submit via POST request with action: "edit"
    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...updatedRecord,
          action: 'edit'
        }),
      });

      const res = await response.json();
      if (res && res.status === 'success') {
        // Automatically sync or delete the associated Tugas Harian record
        if (settings.appsScriptUrl) {
          const hasTugas = !!(updatedRecord.tugasZiyadah || updatedRecord.tugasMurojaah || updatedRecord.tugasMateri);
          const materiObj = {
            ziyadah: updatedRecord.tugasZiyadah || '',
            murojaah: updatedRecord.tugasMurojaah || '',
            tugasMateri: updatedRecord.tugasMateri || '',
          };
          
          try {
            if (hasTugas) {
              const hadTugas = !!(originalRecord?.tugasZiyadah || originalRecord?.tugasMurojaah || originalRecord?.tugasMateri);
              await fetch(settings.appsScriptUrl, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: {
                  'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                  id: `penilaian_tugas_${updatedRecord.id}`,
                  tanggal: updatedRecord.tanggalSetoran,
                  grade: updatedRecord.grade,
                  materi: JSON.stringify(materiObj),
                  ustadz: currentUser?.nama || 'Ustadz',
                  keterangan: 'Tugas otomatis dari Penilaian',
                  siswa: updatedRecord.nama,
                  targetTab: 'tugas',
                  action: hadTugas ? 'edit' : 'create'
                }),
              });
            } else {
              const hadTugas = !!(originalRecord?.tugasZiyadah || originalRecord?.tugasMurojaah || originalRecord?.tugasMateri);
              if (hadTugas) {
                await fetch(settings.appsScriptUrl, {
                  method: 'POST',
                  mode: 'cors',
                  redirect: 'follow',
                  headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                  },
                  body: JSON.stringify({
                    id: `penilaian_tugas_${updatedRecord.id}`,
                    targetTab: 'tugas',
                    action: 'delete'
                  }),
                });
              }
            }
          } catch (tugasErr) {
            console.error('Failed to sync automatic tugas harian edit:', tugasErr);
          }
        }

        // Refresh dashboard statistics from Google Sheets
        await fetchDataFromSheets(settings.appsScriptUrl);
        setIsSubmitting(false);
        setEditingSetoran(null);
        if (originalRecord) {
          setLastAction({
            type: 'edit',
            data: updatedRecord,
            prevData: originalRecord,
          });
          setShowUndoToast(true);
        }
        return true;
      } else {
        throw new Error(res.message || 'Gagal memperbarui data.');
      }
    } catch (err) {
      console.error('Error updating assessment:', err);
      setIsSubmitting(false);
      return false;
    }
  };

  // Delete assessment
  const handleDeleteSetoran = async (recordToDelete: Setoran): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ustadz' && currentUser.role !== 'admin')) {
      console.error('Unauthorized deletion attempt.');
      return false;
    }

    if (usingDemoData || !settings.appsScriptUrl) {
      // Offline Demo Mode: Delete locally in memory
      setSetoran((prev) => prev.filter((s) => s.id !== recordToDelete.id));
      if (editingSetoran?.id === recordToDelete.id) {
        setEditingSetoran(null);
      }
      setLastAction({
        type: 'delete',
        data: recordToDelete,
      });
      setShowUndoToast(true);
      return true;
    }

    // Live Web App Mode: Submit via POST request with action: "delete"
    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          id: recordToDelete.id,
          action: 'delete'
        }),
      });

      const res = await response.json();
      if (res && res.status === 'success') {
        // Also delete the associated Tugas Harian record if it existed
        if (settings.appsScriptUrl && (recordToDelete.tugasZiyadah || recordToDelete.tugasMurojaah || recordToDelete.tugasMateri)) {
          try {
            await fetch(settings.appsScriptUrl, {
              method: 'POST',
              mode: 'cors',
              redirect: 'follow',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
              },
              body: JSON.stringify({
                id: `penilaian_tugas_${recordToDelete.id}`,
                targetTab: 'tugas',
                action: 'delete'
              }),
            });
          } catch (tugasErr) {
            console.error('Failed to delete associated automatic tugas harian:', tugasErr);
          }
        }

        // Refresh dashboard statistics from Google Sheets
        await fetchDataFromSheets(settings.appsScriptUrl);
        if (editingSetoran?.id === recordToDelete.id) {
          setEditingSetoran(null);
        }
        setLastAction({
          type: 'delete',
          data: recordToDelete,
        });
        setShowUndoToast(true);
        return true;
      } else if (res && res.status === 'error' && String(res.message || '').toLowerCase().includes('tidak ditemukan')) {
        // Jika data sudah tidak ditemukan di Sheets, hapus dari state lokal agar tidak menyangkut di UI
        setSetoran((prev) => prev.filter((s) => s.id !== recordToDelete.id));
        if (editingSetoran?.id === recordToDelete.id) {
          setEditingSetoran(null);
        }
        return true;
      } else {
        throw new Error(res.message || 'Gagal menghapus data.');
      }
    } catch (err) {
      console.error('Error deleting assessment:', err);
      return false;
    }
  };

  // Handle Undo (Urungkan)
  const handleUndo = async (): Promise<boolean> => {
    if (!lastAction || isUndoing) return false;
    setIsUndoing(true);
    
    const { type, data, prevData } = lastAction;
    let success = false;
    
    try {
      if (type === 'add') {
        // Undo an "add" action by deleting the newly created record
        if (usingDemoData || !settings.appsScriptUrl) {
          setSetoran((prev) => prev.filter((s) => s.id !== data.id));
          success = true;
        } else {
          const response = await fetch(settings.appsScriptUrl, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
              id: data.id,
              action: 'delete'
            }),
          });
          const res = await response.json();
          if (res && res.status === 'success') {
            await fetchDataFromSheets(settings.appsScriptUrl);
            success = true;
          } else {
            throw new Error(res.message || 'Gagal membatalkan penambahan.');
          }
        }
      } else if (type === 'edit' && prevData) {
        // Undo an "edit" action by writing the original data back
        if (usingDemoData || !settings.appsScriptUrl) {
          setSetoran((prev) => prev.map((s) => s.id === prevData.id ? prevData : s));
          success = true;
        } else {
          const response = await fetch(settings.appsScriptUrl, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({
              ...prevData,
              action: 'edit'
            }),
          });
          const res = await response.json();
          if (res && res.status === 'success') {
            await fetchDataFromSheets(settings.appsScriptUrl);
            success = true;
          } else {
            throw new Error(res.message || 'Gagal membatalkan pembaruan.');
          }
        }
      } else if (type === 'delete') {
        // Undo a "delete" action by re-adding the deleted record
        if (usingDemoData || !settings.appsScriptUrl) {
          setSetoran((prev) => [data, ...prev]);
          success = true;
        } else {
          const response = await fetch(settings.appsScriptUrl, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data), // Save record normally
          });
          const res = await response.json();
          if (res && res.status === 'success') {
            await fetchDataFromSheets(settings.appsScriptUrl);
            success = true;
          } else {
            throw new Error(res.message || 'Gagal membatalkan penghapusan.');
          }
        }
      }
      
      if (success) {
        setLastAction(null);
        setShowUndoToast(false);
      }
    } catch (err) {
      console.error('Error executing undo:', err);
    } finally {
      setIsUndoing(false);
    }
    return success;
  };

  // Add new Tugas Harian
  const handleAddTugas = async (newTugas: Omit<TugasHarian, 'id'> & { id?: string }): Promise<boolean> => {
    setIsSubmittingTugas(true);
    const finalId = newTugas.id || String(Math.floor(1000000 + Math.random() * 9000000));
    const recordWithId: TugasHarian = {
      ...newTugas,
      id: finalId,
    };

    // Optimistically update local state so task shows on dashboard immediately!
    setTugasHarian((prev) => [recordWithId, ...prev.filter((t) => String(t.id) !== String(recordWithId.id))]);
    setGradeFilter('All');

    if (usingDemoData || !settings.appsScriptUrl) {
      setIsSubmittingTugas(false);
      setLastCreatedRecord({
        studentName: recordWithId.siswa || 'Semua Siswa',
        type: 'tugas',
        timestamp: Date.now()
      });
      setManualForwardEmail('');
      setManualForwardStudentName('');
      return true;
    }

    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...recordWithId,
          targetTab: 'tugas',
          action: 'create'
        }),
      });

      const res = await response.json();
      if (res && res.status === 'success') {
        await fetchTugasHarian(settings.appsScriptUrl);
        setIsSubmittingTugas(false);
        setLastCreatedRecord({
          studentName: recordWithId.siswa || 'Semua Siswa',
          type: 'tugas',
          timestamp: Date.now()
        });
        setManualForwardEmail('');
        setManualForwardStudentName('');
        return true;
      } else {
        throw new Error(res.message || 'Gagal menyimpan tugas harian.');
      }
    } catch (err) {
      console.error('Error submitting tugas harian:', err);
      setIsSubmittingTugas(false);
      return true; // Return true as task is saved locally
    }
  };

  // Update existing Tugas Harian
  const handleUpdateTugas = async (updatedTugas: TugasHarian): Promise<boolean> => {
    setIsSubmittingTugas(true);
    if (usingDemoData || !settings.appsScriptUrl) {
      setTugasHarian((prev) => prev.map((t) => t.id === updatedTugas.id ? updatedTugas : t));
      setIsSubmittingTugas(false);
      setEditingTugas(null);
      return true;
    }

    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          ...updatedTugas,
          targetTab: 'tugas',
          action: 'edit'
        }),
      });

      const res = await response.json();
      if (res && res.status === 'success') {
        await fetchTugasHarian(settings.appsScriptUrl);
        setIsSubmittingTugas(false);
        setEditingTugas(null);
        return true;
      } else {
        throw new Error(res.message || 'Gagal memperbarui tugas harian.');
      }
    } catch (err) {
      console.error('Error updating tugas harian:', err);
      setIsSubmittingTugas(false);
      return false;
    }
  };

  // Delete Tugas Harian
  const handleDeleteTugas = async (tugasToDelete: TugasHarian): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'ustadz' && currentUser.role !== 'admin')) {
      console.error('Unauthorized deletion attempt.');
      return false;
    }

    if (usingDemoData || !settings.appsScriptUrl) {
      setTugasHarian((prev) => prev.filter((t) => t.id !== tugasToDelete.id));
      if (editingTugas?.id === tugasToDelete.id) {
        setEditingTugas(null);
      }
      return true;
    }

    try {
      const response = await fetch(settings.appsScriptUrl, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          id: tugasToDelete.id,
          targetTab: 'tugas',
          action: 'delete'
        }),
      });

      const res = await response.json();
      if (res && res.status === 'success') {
        await fetchTugasHarian(settings.appsScriptUrl);
        if (editingTugas?.id === tugasToDelete.id) {
          setEditingTugas(null);
        }
        return true;
      } else if (res && res.status === 'error' && String(res.message || '').toLowerCase().includes('tidak ditemukan')) {
        // Jika data sudah tidak ditemukan di Sheets, hapus dari state lokal agar tidak menyangkut di UI
        setTugasHarian((prev) => prev.filter((t) => t.id !== tugasToDelete.id));
        if (editingTugas?.id === tugasToDelete.id) {
          setEditingTugas(null);
        }
        return true;
      } else {
        throw new Error(res.message || 'Gagal menghapus tugas harian.');
      }
    } catch (err) {
      console.error('Error deleting tugas harian:', err);
      return false;
    }
  };

  // Helper to check if current logged-in ustadz/admin can edit/manage a student's data
  const canCurrentUserEditStudent = (studentId: string | undefined, studentNama: string | undefined): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'ustadz') {
      const sId = studentId || '';
      const sNama = studentNama || '';
      const sNamaLower = sNama.toLowerCase();

      // Check if student's name contains 'ustadz' or 'admin'
      if (sNamaLower.includes('ustadz') || sNamaLower.includes('admin')) {
        return false;
      }

      // Must be in their halaqah list
      // 1. Check by ID
      if (sId && halaqahStudentIds.includes(sId)) {
        return true;
      }
      
      // 2. Also try to find ID from student name
      const studentObj = activeStudentsList.find(s => isStudentNameMatched(s.nama, sNama));
      if (studentObj && halaqahStudentIds.includes(studentObj.id)) {
        return true;
      }

      // 3. Check by Name
      const halaqahStudents = activeStudentsList.filter(s => halaqahStudentIds.includes(s.id));
      if (sNama && halaqahStudents.some(s => isStudentNameMatched(s.nama, sNama))) {
        return true;
      }

      return false;
    }
    return false;
  };

  // Helper to find which Ustadz selected a student as their halaqah member
  const getUstadzForStudent = (studentId: string | undefined, studentNama: string | undefined): string | null => {
    const sId = studentId || '';
    const sNamaLower = (studentNama || '').toLowerCase();
    
    // Find the student object in activeStudentsList if studentId is missing
    let targetId = sId;
    if (!targetId && sNamaLower) {
      const studentObj = activeStudentsList.find(s => (s.nama || '').toLowerCase() === sNamaLower);
      if (studentObj) {
        targetId = studentObj.id;
      }
    }

    // Iterate localStorage to find who selected this student
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('halaqah_students_of_')) {
        try {
          const ustadzName = key.replace('halaqah_students_of_', '');
          const selectedIds = JSON.parse(localStorage.getItem(key) || '[]');
          
          if (Array.isArray(selectedIds)) {
            // Check if selected by ID
            if (targetId && selectedIds.includes(targetId)) {
              return ustadzName;
            }
            // Check by matching name inside the selected IDs
            if (sNamaLower) {
              const matchesByName = activeStudentsList.some(s => 
                s.nama.toLowerCase() === sNamaLower && selectedIds.includes(s.id)
              );
              if (matchesByName) {
                return ustadzName;
              }
            }
          }
        } catch (e) {
          console.error("Error parsing halaqah students storage:", e);
        }
      }
    }
    return null;
  };

  // 4. Filter logic
  const filteredSetoran = useMemo(() => {
    const halaqahStudentNames = activeStudentsList
      .filter(s => halaqahStudentIds.includes(s.id))
      .map(s => s.nama.toLowerCase());

    return setoran.filter((item) => {
      const isStudent = currentUser && currentUser.role === 'siswa';
      if (isStudent && !isStudentNameMatched(item.nama, currentUser.nama)) {
        return false;
      }

      const matchesSearch = (item.nama || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                            (item.id || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      
      let matchesGrade = true;
      if (gradeFilter === 'halaqah_saya') {
        const itemId = item.id || '';
        const itemNama = (item.nama || '').toLowerCase();
        matchesGrade = halaqahStudentIds.includes(itemId) || halaqahStudentNames.includes(itemNama);
      } else {
        matchesGrade = gradeFilter === 'All' || item.grade === gradeFilter;
      }

      const matchesKegiatan = kegiatanFilter === 'All' || 
                              (kegiatanFilter === 'Tahsin'
                                ? item.kegiatan === 'Tahsin' || (item.kegiatan || '').toLowerCase().includes('tahsin (')
                                : item.kegiatan === kegiatanFilter);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesGrade && matchesKegiatan && matchesStatus;
    });
  }, [setoran, searchQuery, gradeFilter, halaqahStudentIds, activeStudentsList, kegiatanFilter, statusFilter, currentUser]);

  const filteredTugasHarian = useMemo(() => {
    const halaqahStudentNames = activeStudentsList
      .filter(s => halaqahStudentIds.includes(s.id))
      .map(s => s.nama.toLowerCase());

    return tugasHarian.filter((t) => {
      const isStudent = currentUser && currentUser.role === 'siswa';
      
      // If user is a student, by default we can show tasks for their grade OR "All"
      // But we also let them filter. Let's see what grade is associated with this student in setoran
      let studentGrade = '';
      if (isStudent) {
        studentGrade = currentUser.grade || '';
        if (!studentGrade) {
          const matchingRecord = setoran.find((s) => isStudentNameMatched(s.nama, currentUser.nama));
          if (matchingRecord) {
            studentGrade = matchingRecord.grade;
          }
        }
      }

      const matchesSearch = (t.materi || '').toLowerCase().includes((tugasSearchQuery || '').toLowerCase()) || 
                            (t.ustadz || '').toLowerCase().includes((tugasSearchQuery || '').toLowerCase()) ||
                            (t.keterangan || '').toLowerCase().includes((tugasSearchQuery || '').toLowerCase()) ||
                            (t.siswa || '').toLowerCase().includes((tugasSearchQuery || '').toLowerCase());
                             
      const isSpecificSiswa = t.siswa && t.siswa.toLowerCase() !== 'all' && t.siswa.toLowerCase() !== 'semua' && t.siswa.toLowerCase() !== 'semua siswa';

      let matchesGrade = true;
      if (gradeFilter === 'halaqah_saya') {
        if (isSpecificSiswa) {
          const tSiswaLower = (t.siswa || '').toLowerCase();
          const studentObj = activeStudentsList.find((st) => isStudentNameMatched(st.nama, t.siswa || ''));
          matchesGrade = (studentObj && halaqahStudentIds.includes(studentObj.id)) || halaqahStudentNames.includes(tSiswaLower);
        } else {
          const halaqahGrades = activeStudentsList
            .filter((st) => halaqahStudentIds.includes(st.id))
            .map((st) => st.grade);
          matchesGrade = t.grade === 'All' || halaqahGrades.some((hg) => isGradeMatched(t.grade, hg));
        }
      } else {
        matchesGrade = gradeFilter === 'All' || t.grade === 'All' || isGradeMatched(t.grade, gradeFilter);
      }
      
      // For student view, if grade filter is 'All', they should see tasks for 'All' or their own grade
      if (isStudent && gradeFilter === 'All' && studentGrade) {
        matchesGrade = t.grade === 'All' || isGradeMatched(t.grade, studentGrade);
      }

      // If the task is specific to a single student
      if (isSpecificSiswa) {
        if (isStudent) {
          return matchesSearch && isStudentNameMatched(t.siswa, currentUser.nama);
        } else {
          // For teachers, display specific student tasks along with the grade
          return matchesSearch && matchesGrade;
        }
      }

      return matchesSearch && matchesGrade;
    });
  }, [tugasHarian, tugasSearchQuery, gradeFilter, halaqahStudentIds, activeStudentsList, setoran, currentUser]);

  // Selected Student Drill-down History
  const studentHistory = useMemo(() => {
    if (!selectedStudentName) return [];
    return setoran
      .filter((s) => (s.nama || '').toLowerCase() === (selectedStudentName || '').toLowerCase())
      .sort((a, b) => new Date(b.tanggalSetoran).getTime() - new Date(a.tanggalSetoran).getTime());
  }, [selectedStudentName, setoran]);

  // Latest assessment for the student
  const latestAssessmentForStudent = useMemo(() => {
    if (!currentUser || currentUser.role !== 'siswa') return null;
    const studentAssessments = setoran.filter(s => isStudentNameMatched(s.nama, currentUser.nama));
    if (studentAssessments.length === 0) return null;
    return [...studentAssessments].sort((a, b) => {
      const dateA = new Date(a.tanggalSetoran).getTime();
      const dateB = new Date(b.tanggalSetoran).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return setoran.indexOf(b) - setoran.indexOf(a);
    })[0];
  }, [setoran, currentUser]);

  // Latest tugas harian for the student (strictly personal or matching class, avoiding other students' records)
  const latestTugasForStudent = useMemo(() => {
    if (!currentUser || currentUser.role !== 'siswa') return null;
    const studentTasks = tugasHarian.filter(t => {
      // If the task specifies a student, it must match this student's name
      if (t.siswa && t.siswa.toLowerCase() !== 'all' && t.siswa.toLowerCase() !== 'semua' && t.siswa.toLowerCase() !== 'semua siswa') {
        return isStudentNameMatched(t.siswa, currentUser.nama);
      }
      
      // If it is a generic/class task, resolve student's current active grade
      let studentGrade = currentUser.grade || '';
      if (!studentGrade) {
        const matchingRecord = setoran.find((s) => isStudentNameMatched(s.nama, currentUser.nama));
        if (matchingRecord) {
          studentGrade = matchingRecord.grade;
        }
      }
      
      const matchesGrade = t.grade === 'All' || (studentGrade && isGradeMatched(t.grade, studentGrade));
      return matchesGrade;
    });
    if (studentTasks.length === 0) return null;
    return [...studentTasks].sort((a, b) => {
      const dateA = parseDateToTime(a.tanggal);
      const dateB = parseDateToTime(b.tanggal);
      if (dateB !== dateA) return dateB - dateA;
      return tugasHarian.indexOf(b) - tugasHarian.indexOf(a);
    })[0];
  }, [tugasHarian, currentUser, setoran]);

  // Stats Calculations for Dashboard overview widgets
  const dashboardStats = useMemo(() => {
    const totalSetoran = filteredSetoran.length;
    
    // Distinct students
    const uniqueStudents = new Set(filteredSetoran.map((s) => (s.nama || '').toLowerCase()));
    const totalSiswa = uniqueStudents.size;

    // Avg lines disetor
    const totalLines = filteredSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgBaris = totalSetoran > 0 ? Math.round((totalLines / totalSetoran) * 10) / 10 : 0;

    // Persentase "Boleh Lanjut"
    const totalLancar = filteredSetoran.filter((s) => (s.status || '').toLowerCase().includes('lanjut')).length;
    const lancarRate = totalSetoran > 0 ? Math.round((totalLancar / totalSetoran) * 100) : 0;

    // Ziyadah average
    const ziyadahSetoran = filteredSetoran.filter(s => (s.kegiatan || '').toLowerCase().includes('ziyadah'));
    const totalZiyadahLines = ziyadahSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgZiyadah = ziyadahSetoran.length > 0 ? Math.round((totalZiyadahLines / ziyadahSetoran.length) * 10) / 10 : 0;

    // Murojaah average
    const murojaahSetoran = filteredSetoran.filter(s => (s.kegiatan || '').toLowerCase().includes('murojaah') || (s.kegiatan || '').toLowerCase().includes('murajaah'));
    const totalMurojaahLines = murojaahSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgMurojaah = murojaahSetoran.length > 0 ? Math.round((totalMurojaahLines / murojaahSetoran.length) * 10) / 10 : 0;

    // Tahsin (IQRA') average
    const tahsinIqraSetoran = filteredSetoran.filter(s => (s.kegiatan || '').toLowerCase().includes('iqra'));
    const totalTahsinIqraLines = tahsinIqraSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgTahsinIqra = tahsinIqraSetoran.length > 0 ? Math.round((totalTahsinIqraLines / tahsinIqraSetoran.length) * 10) / 10 : 0;

    // Tahsin (Qoidah) average
    const tahsinQoidahSetoran = filteredSetoran.filter(s => (s.kegiatan || '').toLowerCase().includes('qoidah') || (s.kegiatan || '').toLowerCase().includes('qaidah'));
    const totalTahsinQoidahLines = tahsinQoidahSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgTahsinQoidah = tahsinQoidahSetoran.length > 0 ? Math.round((totalTahsinQoidahLines / tahsinQoidahSetoran.length) * 10) / 10 : 0;

    // Tahsin (Tilawah) average
    const tahsinTilawahSetoran = filteredSetoran.filter(s => (s.kegiatan || '').toLowerCase().includes('tilawah'));
    const totalTahsinTilawahLines = tahsinTilawahSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgTahsinTilawah = tahsinTilawahSetoran.length > 0 ? Math.round((totalTahsinTilawahLines / tahsinTilawahSetoran.length) * 10) / 10 : 0;

    return {
      totalSetoran,
      totalSiswa,
      lancarRate,
      avgBaris,
      avgZiyadah,
      avgMurojaah,
      avgTahsinIqra,
      avgTahsinQoidah,
      avgTahsinTilawah,
      ziyadahCount: ziyadahSetoran.length,
      murojaahCount: murojaahSetoran.length,
      tahsinIqraCount: tahsinIqraSetoran.length,
      tahsinQoidahCount: tahsinQoidahSetoran.length,
      tahsinTilawahCount: tahsinTilawahSetoran.length,
    };
  }, [filteredSetoran]);

  const allowedStudentsForForm = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return activeStudentsList;
    if (currentUser.role === 'ustadz') {
      return activeStudentsList.filter(student => canCurrentUserEditStudent(student.id, student.nama));
    }
    return [];
  }, [currentUser, activeStudentsList, halaqahStudentIds]);

  const handleSaveCapaianEdit = async (studentName: string, capaian: number, target: number) => {
    const key = String(studentName || '').toLowerCase();
    const updatedEdits = {
      ...capaianLocalEdits,
      [key]: { capaian, target }
    };
    setCapaianLocalEdits(updatedEdits);
    localStorage.setItem('capaian_local_edits', JSON.stringify(updatedEdits));
    setEditingCapaianStudent(null);

    // If connected to Google Sheets, send POST to persist in spreadsheet
    if (!usingDemoData && settings.appsScriptUrl) {
      setIsSyncing(true);
      try {
        const response = await fetch(settings.appsScriptUrl, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            nama: studentName,
            capaian,
            target,
            targetTab: 'capaian_ziyadah',
            action: 'edit'
          }),
        });

        const res = await response.json();
        if (res && res.status === 'success') {
          // Fetch the latest data to confirm synchronization
          await fetchCapaianZiyadah(settings.appsScriptUrl);
        } else {
          console.warn('Gagal sinkronisasi ke Google Sheets:', res.message);
        }
      } catch (err) {
        console.error('Error saving capaian to Sheets:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleResetCapaianEdit = (studentName: string) => {
    const key = String(studentName || '').toLowerCase();
    const updatedEdits = { ...capaianLocalEdits };
    delete updatedEdits[key];
    setCapaianLocalEdits(updatedEdits);
    localStorage.setItem('capaian_local_edits', JSON.stringify(updatedEdits));
    setEditingCapaianStudent(null);
  };

  // Pagination bounds
  const totalPages = Math.ceil(filteredSetoran.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSetoran.slice(start, start + itemsPerPage);
  }, [filteredSetoran, currentPage]);

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, gradeFilter, kegiatanFilter, statusFilter]);

  if (!currentUser) {
    return (
      <LoginPage
        appsScriptUrl={settings.appsScriptUrl}
        usingDemoData={usingDemoData}
        onLoginSuccess={handleLoginSuccess}
        customLogo={customLogo}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* Dynamic Student Detail Drilldown modal */}
      {selectedStudentName && (
        <StudentDetailModal
          studentName={selectedStudentName}
          studentHistory={studentHistory}
          onClose={() => setSelectedStudentName(null)}
          profilePics={profilePics}
        />
      )}

      {/* Top persistent white Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10 shrink-0">
        {/* Left Section (Brand/Logo Group) */}
        <div className="flex items-center gap-2">
          {/* Menu Toggle Button */}
          <button
            id="btn-toggle-menu"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center"
            title={isSidebarOpen ? "Tutup Menu" : "Buka Menu"}
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
            <AlWildanLogo size={28} customUrl={customLogo} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-[#0000FE] leading-tight tracking-wide uppercase">
              Tahfizh Dashboard
            </h1>
            <span className="text-[10px] font-black text-[#0000FE] uppercase tracking-wider bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded w-fit">
              AL-WILDAN 10
            </span>
          </div>
        </div>

        {/* Center Section */}
        <div className="text-xs font-bold text-slate-400 tracking-wider uppercase hidden md:block">
          Portal Guru Al-Qur'an & Wali Murid
        </div>

        {/* Right Section (Controls & Status Indicators) */}
        <div className="flex items-center gap-3">
          {/* Mode Indicator Pill */}
          {usingDemoData ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-amber-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              Mode Simulasi (Demo)
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-blue-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0000FE] animate-pulse shrink-0"></span>
              Sheets Terkoneksi
            </div>
          )}

          {/* Notification Bell Icon */}
          <div className="relative p-2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-full hover:bg-slate-100">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
              1
            </span>
          </div>

          {/* Administrative Simulation Control Panel */}
          {originalAdminSession && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
              <span className="hidden lg:inline text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Simulasi Sesi:</span>
              <input
                type="text"
                id="admin-account-search-input"
                placeholder="Search Akun..."
                value={adminAccountSearchQuery}
                onChange={(e) => setAdminAccountSearchQuery(e.target.value)}
                className="bg-white border border-amber-200 text-amber-950 px-2 py-1 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-amber-400 w-28 md:w-36 transition-all"
              />
              <select
                id="admin-sim-select"
                value={currentUser?.id || ''}
                onChange={(e) => handleSimulateUser(e.target.value)}
                className="bg-transparent border-none text-amber-950 font-black focus:outline-hidden cursor-pointer text-xs pr-1"
              >
                {filteredSimulationAccounts.map((acc) => {
                  const nama = String(acc.nama || '');
                  const isUstadzByName = nama.toLowerCase().includes('ustadz');
                  const roleLabel = acc.role === 'admin' ? 'Admin' : (acc.role === 'ustadz' || isUstadzByName) ? 'Ustadz' : 'Siswa';
                  return (
                    <option key={acc.id || ''} value={acc.id || ''} className="text-slate-800 bg-white font-semibold">
                      {nama} ({roleLabel})
                    </option>
                  );
                })}
              </select>
              {currentUser?.id !== originalAdminSession.id && (
                <button
                  id="btn-restore-admin"
                  onClick={handleReturnToAdmin}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black px-2 py-1 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-3xs scale-95"
                  title="Kembali ke Akun Administrator Utama"
                >
                  Selesai
                </button>
              )}
            </div>
          )}

          {/* MASUK GOOGLE / SHEET URL (Config Trigger) */}
          <button
            id="btn-toggle-config-guide"
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              showConfig 
                ? 'bg-[#0000FE] border border-[#0000FE] text-white' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Konfigurasi</span>
          </button>
        </div>
      </header>

      {/* Main split-screen section */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-[76px] p-3 opacity-100 border-r border-slate-200' : 'w-0 p-0 opacity-0 overflow-hidden border-r-0'
        } bg-white text-slate-800 flex flex-col justify-between shrink-0 shadow-xs z-20 select-none overflow-y-auto`}>
          <div className="flex flex-col gap-5 items-center">
            {/* Active Role Indicator */}
            <div className="relative group/role flex justify-center mt-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-3xs ${
                currentUser.role === 'admin'
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : currentUser.role === 'ustadz'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-blue-50 border-blue-200 text-[#0000FE]'
              }`}>
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : currentUser.role === 'ustadz' ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/role:opacity-100 group-hover/role:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                Hak Akses: {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'ustadz' ? "Guru (Ustadz)" : 'Siswa'}
              </div>
            </div>

            {/* Profile Widget */}
            <div className="relative group/profile flex justify-center">
              <div 
                onClick={() => setShowProfileModal(true)}
                className="w-11 h-11 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center border border-slate-200 overflow-hidden shadow-3xs bg-white shrink-0"
              >
                {profilePics[currentUser.nama] ? (
                  <img 
                    src={profilePics[currentUser.nama]} 
                    alt={currentUser.nama} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center text-[#0000FE] font-black text-xs uppercase">
                    {currentUser.nama.substring(0, 2)}
                  </div>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/profile:opacity-100 group-hover/profile:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50 flex flex-col gap-0.5">
                <span className="font-extrabold">{currentUser.nama}</span>
                <span className="text-[10px] text-slate-300">
                  {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'ustadz' ? "Guru Al-Qur'an" : "Siswa / Wali Murid"}
                </span>
              </div>
            </div>

            {/* Ranking Widget Icon - Posisi tepat di bawah icon profile */}
            <div className="relative group/ranking flex justify-center">
              <button 
                id="btn-ranking-modal"
                onClick={() => setShowRankingModal(true)}
                className={`rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center border shadow-2xs shrink-0 ${
                  currentUser.role === 'siswa'
                    ? 'w-11 h-11 border-amber-400 bg-amber-400 text-slate-900 shadow-amber-200/50'
                    : 'w-11 h-11 border-amber-300 bg-amber-50 text-amber-600'
                }`}
              >
                {currentUser.role === 'siswa' ? (
                  <div className="flex flex-col items-center justify-center leading-none">
                    <Trophy className="w-3.5 h-3.5 text-slate-900 mb-0.5" />
                    <span className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">
                      #{studentRankInfo?.rank || 1}
                    </span>
                  </div>
                ) : (
                  <Trophy className="w-5 h-5 text-amber-500" />
                )}
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/ranking:opacity-100 group-hover/ranking:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50 flex flex-col gap-0.5">
                <span className="font-extrabold">
                  {currentUser.role === 'siswa' ? `Peringkat Saya: #${studentRankInfo?.rank || 1}` : 'Ranking Santri'}
                </span>
                <span className="text-[10px] text-slate-300">
                  {currentUser.role === 'siswa' ? `Kelas ${currentUser.grade || '7A'}` : 'Berdasarkan Kelas'}
                </span>
              </div>
            </div>

            {/* Navigation vertical list */}
            <div className="flex flex-col gap-2.5 items-center w-full">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase text-center block mb-1">Menu</span>
              
              {/* Tab: Rekap */}
              <div className="relative group/menu w-full flex justify-center">
                <button
                  id="tab-rekap-btn"
                  onClick={() => { setActiveTab('rekap'); setShowConfig(false); }}
                  className={`flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-11 h-11 border ${
                    activeTab === 'rekap'
                      ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-sm scale-105'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-[#0000FE]" />
                </button>
                {/* Tooltip Description */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                  Rekap Penilaian Tahfizh
                </div>
              </div>

              {/* Tab: Tugas Harian */}
              <div className="relative group/menu w-full flex justify-center">
                <button
                  id="tab-tugas-btn"
                  onClick={() => { setActiveTab('tugas'); setShowConfig(false); }}
                  className={`relative flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-11 h-11 border ${
                    activeTab === 'tugas'
                      ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-sm scale-105'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                >
                  <ClipboardList className="w-5 h-5 text-[#0000FE]" />
                  {tugasHarian.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#0000FE] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full scale-90 border border-white">
                      {tugasHarian.length}
                    </span>
                  )}
                </button>
                {/* Tooltip Description */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                  Tugas Harian
                </div>
              </div>

              {/* Tab: Statistik */}
              <div className="relative group/menu w-full flex justify-center">
                <button
                  id="tab-statistik-btn"
                  onClick={() => { setActiveTab('statistik'); setShowConfig(false); }}
                  className={`flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-11 h-11 border ${
                    activeTab === 'statistik'
                      ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-sm scale-105'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 text-[#0000FE]" />
                </button>
                {/* Tooltip Description */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                  Statistik & Grafik
                </div>
              </div>

              {/* Tab: Capaian Target */}
              <div className="relative group/menu w-full flex justify-center">
                <button
                  id="tab-capaian-ziyadah-btn"
                  onClick={() => { setActiveTab('capaian_ziyadah'); setShowConfig(false); }}
                  className={`flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-11 h-11 border ${
                    activeTab === 'capaian_ziyadah'
                      ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-sm scale-105'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                >
                  <Award className="w-5 h-5 text-[#0000FE]" />
                </button>
                {/* Tooltip Description */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                  Capaian Target Ziyadah
                </div>
              </div>

              {/* Tab: Berita */}
              <div className="relative group/menu w-full flex justify-center">
                <button
                  id="tab-berita-btn"
                  onClick={() => { setActiveTab('berita'); setShowConfig(false); }}
                  className={`relative flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-11 h-11 border ${
                    activeTab === 'berita'
                      ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-sm scale-105'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                  }`}
                >
                  <Newspaper className="w-5 h-5 text-[#0000FE]" />
                  {beritaList.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded-full scale-90 border border-white">
                      {beritaList.length}
                    </span>
                  )}
                </button>
                {/* Tooltip Description */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                  Berita & Pengumuman
                </div>
              </div>

              {/* Tab: Database (only for ustadz/admin) */}
              {(currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
                <div className="relative group/menu w-full flex justify-center">
                  <button
                    id="tab-database-btn"
                    onClick={() => { setActiveTab('database'); setShowConfig(false); }}
                    className={`flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-11 h-11 border ${
                      activeTab === 'database'
                        ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-sm scale-105'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-[#0000FE]" />
                  </button>
                  {/* Tooltip Description */}
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                    Database Ziyadah
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer with Class Info & Log Out */}
          <div className="flex flex-col gap-3.5 mt-auto items-center">
            {/* Class Information Plate */}
            <div className="relative group/info flex justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0000FE] transition-colors cursor-help">
                <Info className="w-4.5 h-4.5" />
              </div>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 bottom-0 bg-slate-900/95 text-white text-[10px] p-3 rounded-2xl shadow-lg opacity-0 pointer-events-none group-hover/info:opacity-100 group-hover/info:translate-x-1.5 transition-all duration-200 w-56 z-50 space-y-1">
                <p className="font-black text-amber-400 border-b border-white/10 pb-1 uppercase tracking-wider text-[9px]">Informasi Kelas</p>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Kelas:</span>
                  <span className="font-bold text-white">AL-WILDAN 10</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Guru Al-Qur'an:</span>
                  <span className="font-bold text-white truncate max-w-[110px]" title="Ust. Tsaqif/Ust. Syuja/Ust. Salman">Ust. Tsaqif/Syuja/Salman</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Tahun Ajaran:</span>
                  <span className="font-bold text-white">2026/2027</span>
                </div>
              </div>
            </div>

            {/* Sync / Refresh Button */}
            <div className="relative group/sync flex justify-center">
              <button
                id="btn-sync-sidebar"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all disabled:opacity-50 cursor-pointer shadow-3xs"
              >
                <RefreshCw className={`w-4 h-4 text-[#0000FE] ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/sync:opacity-100 group-hover/sync:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                {isSyncing ? 'Mengupdate...' : 'Sinkronkan Data'}
              </div>
            </div>

            {/* Log Out Button */}
            <div className="relative group/logout flex justify-center">
              <button
                id="btn-logout-sidebar"
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors cursor-pointer shadow-3xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900/95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover/logout:opacity-100 group-hover/logout:translate-x-1.5 transition-all duration-200 whitespace-nowrap z-50">
                Keluar Sesi
              </div>
            </div>
          </div>
        </aside>

        {/* Main scrollable content view */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 space-y-6">
          
          {/* Form & Forward Widgets - Pindah ke paling atas persis setelah kolom sambutan */}
          {(currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
            <div className="space-y-6">
              <div className={activeTab === 'rekap' ? 'block' : 'hidden'}>
                <NewAssessmentForm
                  onAddSetoran={handleAddSetoran}
                  activeStudents={allowedStudentsForForm}
                  isSubmitting={isSubmitting}
                  editingRecord={editingSetoran}
                  onUpdateSetoran={handleUpdateSetoran}
                  onCancelEdit={() => setEditingSetoran(null)}
                />
              </div>

              <div className={activeTab === 'tugas' ? 'block' : 'hidden'}>
                <div id="tugas-form-container" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#0000FE]" />
                      {editingTugas ? 'Edit Tugas Harian' : 'Tambah Tugas Baru'}
                    </h3>
                    {editingTugas && (
                      <button
                        onClick={() => {
                          setEditingTugas(null);
                          setTugasFormMateri('');
                          setTugasFormZiyadah('');
                          setTugasFormMurojaah('');
                          setTugasFormTugasMateri('');
                          setTugasFormUstadz('');
                          setTugasFormKeterangan('');
                          setTugasFormSiswa('All');
                        }}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const isAnyMateriFilled = tugasFormZiyadah.trim() || tugasFormMurojaah.trim() || tugasFormTugasMateri.trim();
                      if (!isAnyMateriFilled) {
                        alert('Harap isi minimal salah satu tugas (Ziyadah, Murojaah, atau Materi)!');
                        return;
                      }
                      
                      const ustadzName = tugasFormUstadz.trim() || currentUser.nama;
                      const combinedMateri = JSON.stringify({
                        ziyadah: tugasFormZiyadah.trim(),
                        murojaah: tugasFormMurojaah.trim(),
                        tugasMateri: tugasFormTugasMateri.trim()
                      });
                      
                      const payload = {
                        tanggal: tugasFormTanggal,
                        grade: tugasFormGrade,
                        siswa: tugasFormSiswa,
                        materi: combinedMateri,
                        ustadz: ustadzName,
                        keterangan: tugasFormKeterangan.trim(),
                      };

                      let success = false;
                      if (editingTugas) {
                        success = await handleUpdateTugas({
                          ...editingTugas,
                          ...payload,
                        });
                      } else {
                        success = await handleAddTugas(payload);
                      }

                      if (success) {
                        // Reset form
                        setTugasFormMateri('');
                        setTugasFormZiyadah('');
                        setTugasFormMurojaah('');
                        setTugasFormTugasMateri('');
                        setTugasFormKeterangan('');
                        setTugasFormSiswa('All');
                      }
                    }}
                    className="space-y-4 text-xs font-sans"
                  >
                    {/* Tanggal */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold">Tanggal Tugas</label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-medium"
                        value={tugasFormTanggal}
                        onChange={(e) => setTugasFormTanggal(e.target.value)}
                      />
                    </div>

                    {/* Grade/Kelas */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold">Untuk Kelas / Grade</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none bg-white"
                        value={tugasFormGrade}
                        onChange={(e) => setTugasFormGrade(e.target.value)}
                      >
                        <option value="All">Semua Kelas (All)</option>
                        {uniqueGrades.filter(g => g !== 'All' && g !== 'halaqah_saya').map((g, idx) => (
                          <option key={`tugas-form-grade-${g}-${idx}`} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Siswa Spesifik (Opsional) */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold flex items-center justify-between">
                        <span>Untuk Siswa Spesifik (Opsional)</span>
                        <span className="text-[10px] text-[#0000FE] font-black">Dari Spreadsheet</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none bg-white"
                        value={tugasFormSiswa}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTugasFormSiswa(val);
                          if (val && val !== 'All') {
                            const foundStudent = activeStudentsList.find(s => s.nama === val);
                            if (foundStudent && foundStudent.grade) {
                              setTugasFormGrade(foundStudent.grade);
                            }
                          }
                        }}
                      >
                        <option value="All">Semua Siswa (All)</option>
                        {(currentUser.role === 'admin' ? activeStudentsList : allowedStudentsForForm).map((st, idx) => (
                          <option key={`student-opt-${st.nama}-${idx}`} value={st.nama}>
                            {st.nama} {st.grade ? `(${st.grade})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tugas Ziyadah */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold flex items-center justify-between">
                        <span>Tugas Ziyadah</span>
                        <span className="text-[10px] text-[#0000FE] font-black">Ziyadah</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Juz 30 An-Naba' 1-15"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold"
                        value={tugasFormZiyadah}
                        onChange={(e) => setTugasFormZiyadah(e.target.value)}
                      />
                    </div>

                    {/* Tugas Murojaah */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold flex items-center justify-between">
                        <span>Tugas Murojaah</span>
                        <span className="text-[10px] text-blue-600 font-black">Murojaah</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Al-Mulk s/d Al-Qolam"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold"
                        value={tugasFormMurojaah}
                        onChange={(e) => setTugasFormMurojaah(e.target.value)}
                      />
                    </div>

                    {/* Tugas Materi */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold flex items-center justify-between">
                        <span>Tugas Materi</span>
                        <span className="text-[10px] text-indigo-600 font-black font-semibold">Teori / Hafalan Baru</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Contoh: Pelajari hukum tajwid nun sukun & tanwin"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold"
                        value={tugasFormTugasMateri}
                        onChange={(e) => setTugasFormTugasMateri(e.target.value)}
                      />
                    </div>

                    {/* Ustadz */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold">Ustadz / Guru Pemberi</label>
                      <input
                        type="text"
                        placeholder={currentUser.nama}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-medium"
                        value={tugasFormUstadz}
                        onChange={(e) => setTugasFormUstadz(e.target.value)}
                      />
                    </div>

                    {/* Keterangan */}
                    <div className="space-y-1">
                      <label className="block text-slate-500 font-bold">Keterangan / Catatan Tambahan</label>
                      <textarea
                        rows={3}
                        placeholder="Catatan tambahan bagi siswa..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700"
                        value={tugasFormKeterangan}
                        onChange={(e) => setTugasFormKeterangan(e.target.value)}
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmittingTugas}
                      className="w-full py-3 bg-[#0000FE] hover:bg-[#0000D0] text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 text-xs cursor-pointer"
                    >
                      {isSubmittingTugas ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          {editingTugas ? 'Simpan Perubahan' : 'Publish Tugas'}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Forward Message Widget */}
              {(activeTab === 'rekap' || activeTab === 'tugas') && (
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-[#0000FE] rounded-xl border border-blue-100">
                        <Mail className="w-4 h-4 text-[#0000FE]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">Forward Reminder ke G-MAIL Siswa</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Kirim notifikasi email instan ke akun G-mail terdaftar milik siswa.</p>
                      </div>
                    </div>
                    {lastCreatedRecord ? (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                        Berhasil Menyimpan: {lastCreatedRecord.studentName || 'Semua'} ({lastCreatedRecord.type === 'setoran' ? 'Penilaian' : 'Tugas'})
                      </span>
                    ) : (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide font-sans">
                        Menunggu Input Data
                      </span>
                    )}
                  </div>

                  {/* Bagian Sinkronisasi Gmail Ustadz */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-3.5 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${ustadzGmailUser && ustadzGmailToken ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        <div>
                          <span className="text-slate-500 font-bold">Sinkronisasi Gmail Ustadz: </span>
                          {ustadzGmailUser && ustadzGmailToken ? (
                            <span className="text-emerald-600 font-black">{ustadzGmailUser.email} (Aktif)</span>
                          ) : (
                            <span className="text-slate-400 font-black">Belum Terhubung</span>
                          )}
                        </div>
                      </div>
                      {ustadzGmailUser && ustadzGmailToken ? (
                        <button
                          type="button"
                          onClick={handleDisconnectGmail}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer"
                        >
                          Putuskan Koneksi
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isGmailSyncing}
                          onClick={handleSyncGmail}
                          className="px-4 py-2 bg-[#0000FE] hover:bg-[#0000D0] text-white rounded-xl text-[10px] font-black transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isGmailSyncing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                          <span>Hubungkan Gmail Ustadz</span>
                        </button>
                      )}
                    </div>
                    
                    {!ustadzGmailToken && (
                      <div className="p-3 bg-blue-50/50 border border-blue-100/60 rounded-xl text-[10px] leading-relaxed text-blue-700/90 font-medium space-y-1">
                        <p className="font-bold">💡 Tips Sinkronisasi:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Jika tombol diklik namun popup tidak muncul, silakan izinkan popup/pop-up blockers pada browser Anda.</li>
                          <li>Karena preview berjalan di dalam frame (iFrame), beberapa browser membatasi Google Login. Jika gagal, silakan <strong>buka aplikasi ini di Tab Baru (Open in New Tab)</strong> menggunakan tombol di sudut kanan atas AI Studio.</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Nama Siswa</label>
                      <input
                        type="text"
                        placeholder="Ketik nama siswa atau otomatis terisi dari email..."
                        value={forwardStudentName}
                        onChange={(e) => setManualForwardStudentName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider font-sans">Alamat G-MAIL Siswa</label>
                      <input
                        type="email"
                        placeholder="Auto-populated atau isi manual jika kosong..."
                        value={forwardEmail}
                        onChange={(e) => setManualForwardEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">Isi Pesan Notifikasi</label>
                    <textarea
                      readOnly
                      rows={2}
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 leading-relaxed cursor-not-allowed focus:outline-none"
                      value={`[REMINDER] Alhamdulillah, homework has been shared to your Tahfizh Recap Account. Please check now, and thank you. Baarokallahu Fiykum.`}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!lastCreatedRecord || !forwardEmail}
                    onClick={handleSendForwardMessage}
                    className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      lastCreatedRecord && forwardEmail
                        ? 'bg-[#0000FE] hover:bg-[#0000D0] text-white active:scale-98'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>
                      {!lastCreatedRecord 
                        ? 'Selesaikan Pengisian Form untuk Mengirim' 
                        : ustadzGmailToken 
                          ? `Kirim Langsung via Gmail (${ustadzGmailUser?.email || ''})` 
                          : 'Kirim Notifikasi (Metode Manual)'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Spreadsheet Config Guide / Panel (Renders inside the main content view if toggled) */}
          {showConfig && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-blue-900/5 p-6 space-y-4 animate-in fade-in slide-in-from-top duration-300">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-5 h-5 text-[#0000FE]" />
                    Panduan Hubungan Google Sheets
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Ikuti langkah-langkah di bawah ini untuk menghubungkan aplikasi Anda ke spreadsheet real-time.</p>
                </div>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-slate-500 hover:text-rose-600 text-xs font-bold p-1 px-2.5 bg-slate-100 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed font-sans">
                <div className="space-y-3">
                  <h4 className="font-bold text-[#0000FE]">1. Langkah Penyusunan Spreadsheet</h4>
                  <ol className="list-decimal pl-4 space-y-2 font-semibold">
                    <li>Buat spreadsheet baru di Google Sheets.</li>
                    <li>Beri nama tab pertama <strong className="text-slate-800">Penilaian</strong>, tab kedua <strong className="text-slate-800">Akun</strong>, and tab ketiga <strong className="text-slate-800">Tugas Harian</strong>.</li>
                    <li>Masukkan header kolom persis sesuai panduan di file <code className="font-mono bg-slate-50 px-1 py-0.5 rounded text-[#0000FE]">src/data.ts</code>.</li>
                    <li>Klik menu <strong>Ekstensi</strong> di baris atas Google Sheets, lalu pilih <strong>Apps Script</strong>.</li>
                    <li>Tempel (Paste) seluruh kode Apps Script yang kami sediakan di tab sebelah ke dalam editor, lalu klik simpan.</li>
                    <li>Klik tombol <strong>Terapkan</strong> (Deploy) &gt; <strong>Penerapan Baru</strong> (New Deployment). Pilih jenis penerapan <strong>Aplikasi Web</strong> (Web App). Konfigurasi: <i>Execute as: Me</i> dan <i>Who has access: Anyone</i>.</li>
                    <li>Salin URL Aplikasi Web yang dihasilkan ke dalam file <code className="font-mono bg-slate-50 px-1 py-0.5 rounded text-[#0000FE]">src/App.tsx</code> sebagai URL default.</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-white">2. Kode Google Apps Script Backend</h4>
                  <p className="text-slate-400">Salin kode di bawah ini untuk ditaruh di editor Apps Script Google Sheets Anda:</p>
                  <div className="relative">
                    <pre className="p-3 bg-slate-950 text-slate-100 rounded-xl overflow-x-auto text-[10px] max-h-52 font-mono whitespace-pre select-all">
                      {GOOGLE_APPS_SCRIPT_CODE}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                          alert("Alhamdulillah, kode Apps Script berhasil disalin ke clipboard!");
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px] shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        Salin Kode
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Siswa Aktif Selector / Info */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-[#0000FE] border border-blue-100 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  {currentUser.role === 'admin' ? 'Pengawasan & Penilaian Kelas (Admin)' : currentUser.role === 'ustadz' ? 'Pengawasan & Penilaian Kelas' : 'Status Akun Terkunci'}
                </h4>
                <p className="text-xs text-slate-500">
                  {currentUser.role === 'admin'
                    ? 'Anda masuk sebagai Administrator dengan hak akses penuh untuk memantau dan mengedit seluruh siswa.'
                    : currentUser.role === 'ustadz'
                    ? 'Anda memiliki hak akses penuh untuk melakukan penilaian dan memantau seluruh siswa.'
                    : `Sesi terkunci pada nama ananda: ${currentUser.nama}. Hanya menampilkan data milik ananda.`}
                </p>
              </div>
            </div>

            {/* If Ustadz or Admin, show an indicator / select quick help */}
            {(currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
              <div className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 self-start sm:self-center">
                Siswa Aktif: {dashboardStats.totalSiswa} orang
              </div>
            )}
          </div>

          {/* Stats Cards Section (Unified metrics display) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Kehadiran Setoran */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-blue-900/5 flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Total Bimbingan</span>
                <h3 className="text-2xl font-extrabold text-slate-900 my-0.5">{dashboardStats.totalSetoran} setoran</h3>
                <span className="text-xs text-slate-500 font-medium">Log aktivitas terdaftar</span>
              </div>
            </div>

            {/* Card 2: Kelancaran Hafalan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-blue-900/5 flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Rata-rata Kelancaran</span>
                <h3 className="text-2xl font-extrabold text-slate-900 my-0.5">{dashboardStats.lancarRate}%</h3>
                <span className="text-xs text-emerald-600 font-semibold">Sangat Baik</span>
              </div>
            </div>

            {/* Card 3: Rata-rata Nilai / Aktif Siswa */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xl shadow-blue-900/5 flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">Informasi Grade</span>
                <h3 className="text-2xl font-extrabold text-slate-900 my-0.5">AL-WILDAN 10</h3>
                <span className="text-xs text-slate-500 font-medium">Tahun Ajaran Aktif</span>
              </div>
            </div>
          </div>

          {/* Active Tab Content Panel */}
          <div className="space-y-6">
            <div className={activeTab === 'rekap' ? 'block space-y-6' : 'hidden'}>
          <>
            {/* "Lihat Informasi Terbaru" Quick Button/Banner for Student Account */}
            {currentUser?.role === 'siswa' && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#0000FE]/10 text-[#0000FE]">
                    <Sparkles className="w-5 h-5 text-[#0000FE]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Ada update penilaian atau tugas baru?</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Lihat rekapitulasi data penilaian & tugas harian terakhir Anda secara terpadu.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLatestInfoPopup(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#0000FE] hover:bg-[#0000D0] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                >
                  Buka Pop-up Informasi
                </button>
              </div>
            )}

            {/* Content Bento Grid: Form & Student Table with search/filters */}
            <div className={currentUser.role === 'ustadz' || currentUser.role === 'admin' ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
          
              {/* Column 1: Student Profile Progress Card (Only for Student) */}
              {currentUser.role !== 'ustadz' && currentUser.role !== 'admin' && (
                <div className="lg:col-span-1 space-y-6 order-2">
                  <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-5 text-center flex flex-col items-center">
                      <div className="inline-flex bg-blue-50 text-[#0000FE] p-4 rounded-full mb-3 border-4 border-blue-100">
                        <UserCheck className="w-8 h-8 text-[#0000FE]" />
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900">{currentUser.nama}</h3>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#0000FE] border border-blue-100 mt-2 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-[#0000FE]" /> Akun Siswa Aktif
                      </span>
                      {(() => {
                        const ustadzName = getUstadzForStudent(currentUser.id, currentUser.nama);
                        return ustadzName ? (
                          <div className="mt-3 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700">
                            <Users className="w-3.5 h-3.5 text-blue-500" />
                            Guru Al-Qur'an: Ustadz {ustadzName}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Hafalan Anda</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                          <span className="block text-2xl font-black text-slate-900">{dashboardStats.totalSetoran}</span>
                          <span className="text-[10px] text-slate-500 font-bold">Total Setoran</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                          <span className="block text-2xl font-black text-[#0000FE]">{dashboardStats.lancarRate}%</span>
                          <span className="text-[10px] text-slate-500 font-bold font-sans">Kelancaran</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2 text-xs text-[#0000FE]">
                      <h5 className="font-bold text-[#0000FE]">Motivasi Hari Ini:</h5>
                      <p className="italic leading-relaxed text-slate-700">
                        "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya." (HR. Bukhari)
                      </p>
                      <p className="leading-relaxed pt-2 border-t border-blue-100 text-[11px] text-slate-500">
                        Tetap istiqomah dalam memelihara hafalanmu. Pastikan setiap bimbingan ustadz dicatat & dipelajari kembali dengan baik.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Column 2 & 3: Table and Filters */}
              <div className={currentUser.role === 'ustadz' || currentUser.role === 'admin' ? "bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 p-6 space-y-6 flex flex-col justify-between" : "lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200 p-6 space-y-6 flex flex-col justify-between order-1"}>
            
            {/* Table Control Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daftar Penilaian Siswa</h2>
                  <p className="text-xs text-slate-500">Mencakup rekapitulasi penilaian dan kelancaran siswa</p>
                </div>

                {/* Action Controls & Display Mode Indicator */}
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  {/* Undo Button for Ustadz/Admin */}
                  {currentUser && (currentUser.role === 'ustadz' || currentUser.role === 'admin') && lastAction && (
                    <button
                      id="btn-undo-header"
                      onClick={handleUndo}
                      disabled={isUndoing}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold text-rose-800 transition-all shadow-xs disabled:opacity-50 animate-pulse cursor-pointer"
                      title={`Urungkan aksi terakhir: ${
                        lastAction.type === 'add' ? 'Tambah Penilaian' : 
                        lastAction.type === 'edit' ? 'Ubah Penilaian' : 'Hapus Penilaian'
                      }`}
                    >
                      <Undo2 className={`w-3.5 h-3.5 text-rose-600 ${isUndoing ? 'animate-spin' : ''}`} />
                      {isUndoing ? 'Mengurungkan...' : 'Urungkan Aksi'}
                    </button>
                  )}

                  {/* Refresh Database Button */}
                  <button
                    id="btn-refresh-database-table"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    title={usingDemoData ? "Refresh database contoh lokal" : "Sinkronisasi data ulang dengan Google Sheets"}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#0000FE] ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Refreshing...' : 'Refresh Database'}
                  </button>

                  {/* Display Mode Indicator */}
                  <div className="text-xs font-bold">
                    {usingDemoData ? (
                      <span className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                        Data Contoh
                      </span>
                    ) : (
                      <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#0000FE] border border-blue-200 shadow-2xs">
                        Real-time Sheets
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Search & Filtering Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search query input */}
                <div className="sm:col-span-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="search-students-input"
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white placeholder-slate-500 font-medium"
                    placeholder="Cari nama / ID siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Grade filter */}
                <div className="relative">
                  <select
                    id="filter-grade-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-semibold appearance-none cursor-pointer"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <option value="All">Semua Grade</option>
                    {currentUser && currentUser.role === 'ustadz' && (
                      <option value="halaqah_saya">⭐ Siswa Halaqah Saya</option>
                    )}
                    {uniqueGrades.filter(g => g !== 'All').map((g, idx) => (
                      <option key={`filter-grade-${g}-${idx}`} value={g}>{g}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter className="w-3 h-3" />
                  </span>
                </div>

                {/* Kegiatan Filter */}
                <div className="relative">
                  <select
                    id="filter-activity-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-semibold appearance-none cursor-pointer"
                    value={kegiatanFilter}
                    onChange={(e) => setKegiatanFilter(e.target.value)}
                  >
                    <option value="All">Semua Kegiatan</option>
                    <option value="Ziyadah">Ziyadah</option>
                    <option value="Tahsin (Tilawah)">Tahsin (Tilawah)</option>
                    <option value="Tahsin (IQRA')">Tahsin (IQRA')</option>
                    <option value="Tahsin (Qoidah)">Tahsin (Qoidah)</option>
                    <option value="Murojaah">Murojaah</option>
                    <option value="Tahsin">Semua Tahsin</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter className="w-3 h-3" />
                  </span>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    id="filter-status-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-semibold appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">Semua Status</option>
                    <option value="Boleh Lanjut">Boleh Lanjut</option>
                    <option value="Ulangi">Ulangi</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Records Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-2xl mt-4 bg-[#070D19]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0b1322] text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                    <th className="py-3 px-4 text-center">ID</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Tanggal Setoran</th>
                    <th className="py-3 px-4">Surah</th>
                    <th className="py-3 px-4">Kegiatan</th>
                    <th className="py-3 px-4 text-center">Jumlah</th>
                    <th className="py-3 px-4">Nilai</th>
                    <th className="py-3 px-4 text-center">Satuan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    {(currentUser.role === 'ustadz' || currentUser.role === 'admin') && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={(currentUser.role === 'ustadz' || currentUser.role === 'admin') ? 11 : 10} className="py-12 text-center text-slate-500 italic font-medium">
                        Tidak ada data penilaian yang cocok dengan filter pencarian
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <tr 
                        key={idx} 
                        id={`assessment-row-${idx}`}
                        className="hover:bg-slate-800/30 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudentName(item.nama)}
                        title="Klik untuk melihat riwayat siswa"
                      >
                        <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-500 font-medium">{item.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-400">{item.grade}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            {profilePics[item.nama] ? (
                              <img 
                                src={profilePics[item.nama]} 
                                alt={item.nama} 
                                className="w-8 h-8 rounded-full object-cover border border-blue-500/20 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-950/40 text-blue-400 font-extrabold flex items-center justify-center border border-blue-900/40 uppercase shrink-0 text-xs">
                                {item.nama.substring(0, 2)}
                              </div>
                            )}
                            <div className="font-bold text-white flex items-center gap-1 group-hover:text-blue-400 transition-colors">
                              {item.nama}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-400 transition-opacity" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {formatTanggalIndo(item.tanggalSetoran)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-300 truncate max-w-[140px]" title={item.surah}>
                          {item.surah || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.kegiatan === 'Ziyadah'
                              ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                              : item.kegiatan === 'Tahsin (Tilawah)'
                              ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                              : item.kegiatan === "Tahsin (IQRA')"
                              ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/30'
                              : item.kegiatan === 'Tahsin (Qoidah)'
                              ? 'bg-violet-950/40 text-violet-300 border-violet-900/30'
                              : item.kegiatan === 'Murojaah'
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-900/30'
                              : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                          }`}>
                            {item.kegiatan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-white">{item.baris}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-[150px] truncate font-medium" title={item.ctt}>
                          {item.ctt || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-400 capitalize whitespace-nowrap">{item.satuan || getSatuanByKegiatan(item.kegiatan)}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Boleh Lanjut'
                              ? 'bg-blue-950/40 text-blue-400 border border-blue-900/40'
                              : 'bg-rose-950/40 text-rose-300 border border-rose-900/40'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        {(currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center space-x-1.5">
                              {currentUser && (currentUser.role === 'admin' || canCurrentUserEditStudent(undefined, item.nama)) ? (
                                <>
                                  <button
                                    id={`btn-edit-setoran-${item.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSetoran(item);
                                      const formEl = document.getElementById('new-assessment-form');
                                      if (formEl) {
                                        formEl.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                    className="p-1.5 hover:bg-amber-950/30 text-slate-500 hover:text-amber-400 rounded-lg transition-colors border border-transparent hover:border-amber-900/40"
                                    title="Edit Penilaian"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-delete-setoran-${item.id}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteRecord(item);
                                    }}
                                    className="p-1.5 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
                                    title="Hapus Penilaian"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-600 animate-pulse" title="Terkunci - Bukan siswa halaqah Anda" />
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-5 mt-4 text-xs font-semibold text-slate-400">
                <span>
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSetoran.length)} dari {filteredSetoran.length} penilaian
                </span>
                
                <div className="flex gap-2">
                  <button
                    id="btn-prev-page"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 border border-slate-800 rounded-xl hover:bg-slate-800 bg-[#070D19] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="flex items-center px-3 py-1.5 bg-slate-800 rounded-xl text-slate-300">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    id="btn-next-page"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 border border-slate-800 rounded-xl hover:bg-slate-800 bg-[#070D19] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
        </>
        </div>

        <div className={activeTab === 'statistik' ? 'block' : 'hidden'}>
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            {/* Header info bar */}
            <div className="bg-[#0000FE] text-white rounded-3xl p-6 shadow-sm border border-blue-700 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-200" />
                    Analisis & Statistik Hafalan Qur'an
                  </h2>
                  <p className="text-blue-50 text-xs mt-1 font-semibold">
                    Visualisasi dinamika setoran, persentase kelancaran, tren mingguan, dan sebaran jenis pembelajaran Qur'an.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-center min-w-[90px]">
                    <span className="block text-2xl font-black">{dashboardStats.totalSetoran}</span>
                    <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Total Setoran</span>
                  </div>
                  <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-center min-w-[90px]">
                    <span className="block text-2xl font-black">{dashboardStats.lancarRate}%</span>
                    <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Kelancaran</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Row specifically for statistical analysis */}
            <div className="bg-[#0b1322] rounded-3xl shadow-sm border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-3 gap-2">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Filter Analisis Statistik</h3>
                  <p className="text-[11px] text-slate-400">Atur filter di bawah untuk menyesuaikan data grafik dan pencapaian secara interaktif</p>
                </div>
                
                {/* Reset Filters button */}
                {(searchQuery || gradeFilter !== 'All' || kegiatanFilter !== 'All' || statusFilter !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setGradeFilter('All');
                      setKegiatanFilter('All');
                      setStatusFilter('All');
                    }}
                    className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Reset Semua Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Search query input */}
                <div className="sm:col-span-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="search-stats-input"
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white placeholder-slate-500 font-medium"
                    placeholder="Cari nama / ID siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Grade filter */}
                <div className="relative">
                  <select
                    id="filter-stats-grade-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-semibold appearance-none cursor-pointer"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <option value="All">Semua Grade</option>
                    {uniqueGrades.filter(g => g !== 'All').map((g, idx) => (
                      <option key={`stats-grade-${g}-${idx}`} value={g}>{g}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter className="w-3 h-3" />
                  </span>
                </div>

                {/* Kegiatan Filter */}
                <div className="relative">
                  <select
                    id="filter-stats-activity-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-semibold appearance-none cursor-pointer"
                    value={kegiatanFilter}
                    onChange={(e) => setKegiatanFilter(e.target.value)}
                  >
                    <option value="All">Semua Kegiatan</option>
                    <option value="Ziyadah">Ziyadah</option>
                    <option value="Tahsin (Tilawah)">Tahsin (Tilawah)</option>
                    <option value="Tahsin (IQRA')">Tahsin (IQRA')</option>
                    <option value="Tahsin (Qoidah)">Tahsin (Qoidah)</option>
                    <option value="Murojaah">Murojaah</option>
                    <option value="Tahsin">Semua Tahsin</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter className="w-3 h-3" />
                  </span>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <select
                    id="filter-stats-status-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-800 rounded-xl bg-[#070D19] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-white font-semibold appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">Semua Status</option>
                    <option value="Boleh Lanjut">Boleh Lanjut</option>
                    <option value="Ulangi">Ulangi</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Filter className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Overview KPI widgets card row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatsCard
                title="Total Setoran"
                value={dashboardStats.totalSetoran}
                description="Rekaman setoran terkumpul"
                icon={<Hash className="w-5 h-5" />}
                colorClass="text-blue-400"
                bgColorClass="bg-slate-800"
                theme="dark"
              />
              <StatsCard
                title={currentUser.role === 'siswa' ? "Keaktifan Akun" : "Siswa Aktif"}
                value={currentUser.role === 'siswa' ? "Aktif" : dashboardStats.totalSiswa}
                description={currentUser.role === 'siswa' ? "Status keanggotaan aktif" : "Siswa terdaftar aktif"}
                icon={<Users className="w-5 h-5" />}
                colorClass="text-slate-600"
                bgColorClass="bg-slate-100"
                theme="white"
              />
              <StatsCard
                title="Tingkat Kelancaran"
                value={`${dashboardStats.lancarRate}%`}
                description="Rata-rata status 'Boleh Lanjut'"
                icon={<CheckCircle2 className="w-5 h-5" />}
                colorClass="text-[#0000FE]"
                bgColorClass="bg-blue-100"
                theme="blue"
              />
            </div>

            {/* Averages by activity card */}
            <div className="bg-[#0b1322] rounded-3xl shadow-sm border border-slate-800 p-6 space-y-4">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-400" /> Rata-Rata Setoran per Jenis Kegiatan
                </h3>
                <p className="text-[11px] text-slate-400">Rincian rata-rata baris atau halaman yang disetorkan berdasarkan kategori pembelajaran</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Ziyadah */}
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Ziyadah</span>
                    <div className="p-2 bg-emerald-900/30 text-emerald-400 rounded-xl">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-emerald-300">
                      {dashboardStats.avgZiyadah} <span className="text-xs font-bold text-emerald-500">baris</span>
                    </h4>
                    <p className="text-[10px] text-emerald-500 font-semibold mt-1">
                      {dashboardStats.ziyadahCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 2. Murojaah */}
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Murojaah</span>
                    <div className="p-2 bg-amber-900/30 text-amber-400 rounded-xl">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-amber-300">
                      {dashboardStats.avgMurojaah} <span className="text-xs font-bold text-amber-500">hal</span>
                    </h4>
                    <p className="text-[10px] text-amber-500 font-semibold mt-1">
                      {dashboardStats.murojaahCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 3. Tahsin IQRA */}
                <div className="bg-blue-950/20 border border-blue-900/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Tahsin (IQRA')</span>
                    <div className="p-2 bg-blue-900/30 text-blue-400 rounded-xl">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-blue-300">
                      {dashboardStats.avgTahsinIqra} <span className="text-xs font-bold text-blue-500">hal</span>
                    </h4>
                    <p className="text-[10px] text-blue-500 font-semibold mt-1">
                      {dashboardStats.tahsinIqraCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 4. Tahsin Qoidah */}
                <div className="bg-purple-950/20 border border-purple-900/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Tahsin (Qoidah)</span>
                    <div className="p-2 bg-purple-900/30 text-purple-400 rounded-xl">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-purple-300">
                      {dashboardStats.avgTahsinQoidah} <span className="text-xs font-bold text-purple-500">hal</span>
                    </h4>
                    <p className="text-[10px] text-purple-500 font-semibold mt-1">
                      {dashboardStats.tahsinQoidahCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 5. Tahsin Tilawah */}
                <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Tahsin (Tilawah)</span>
                    <div className="p-2 bg-rose-900/30 text-rose-400 rounded-xl">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-rose-300">
                      {dashboardStats.avgTahsinTilawah} <span className="text-xs font-bold text-rose-500">hal</span>
                    </h4>
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">
                      {dashboardStats.tahsinTilawahCount} setoran aktif
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Visual Analytics section */}
            <StatsCharts data={filteredSetoran} />
          </div>
        </div>

        <div className={activeTab === 'tugas' ? 'block' : 'hidden'}>
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            {/* Header info bar */}
            <div className="bg-[#0000FE] text-white rounded-3xl p-6 shadow-sm border border-blue-700 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-200" />
                    Daftar Tugas & Materi Harian
                  </h2>
                  <p className="text-blue-50 text-xs mt-1 font-semibold">
                    Berisi instruksi, materi ziyadah, murojaah, dan pengumuman harian dari para ustadz.
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-center min-w-[90px]">
                    <span className="block text-2xl font-black">{filteredTugasHarian.length}</span>
                    <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Terfilter</span>
                  </div>
                  <div className="bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-center min-w-[90px]">
                    <span className="block text-2xl font-black">{tugasHarian.length}</span>
                    <span className="text-[10px] text-blue-100 font-bold uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>
            </div>            {/* "Lihat Informasi Terbaru" Quick Button/Banner for Student Account */}
            {currentUser?.role === 'siswa' && (
              <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#0000FE]/10 text-[#0000FE]">
                    <Sparkles className="w-5 h-5 text-[#0000FE]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Ada update penilaian atau tugas baru?</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Lihat rekapitulasi data penilaian & tugas harian terakhir Anda secara terpadu.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLatestInfoPopup(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#0000FE] hover:bg-[#0000D0] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                >
                  Buka Pop-up Informasi
                </button>
              </div>
            )}

            {/* Sub content grid */}
            <div className={currentUser?.role === 'ustadz' || currentUser?.role === 'admin' ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
              
              {/* Form Column - Only for Student motivation card */}
              {currentUser?.role !== 'ustadz' && currentUser?.role !== 'admin' && (
                <div className="lg:col-span-1 space-y-6 order-2">
                  {/* Student View Motivation & Instructions */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4 text-center">
                      <div className="inline-flex bg-blue-50 text-blue-800 p-4 rounded-full mb-2 border-4 border-blue-100">
                        <ClipboardList className="w-8 h-8 text-[#0000FE]" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800">Tugas Harian Anda</h3>
                      <p className="text-xs text-slate-400 mt-1">Harap perhatikan & hafalkan materi harian di samping</p>
                    </div>

                    <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-sans font-medium">
                      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2 text-blue-800">
                        <h4 className="font-bold text-blue-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Tips Ziyadah Efektif:
                        </h4>
                        <ul className="list-disc pl-4 space-y-1.5 font-semibold">
                          <li>Membaca ayat baru secara berulang 15-20 kali dari mushaf sebelum menghafalkannya.</li>
                          <li>Sambungkan satu ayat dengan ayat berikutnya agar ingatan mengalir lancar.</li>
                          <li>Mintalah bimbingan mandiri (talaqqi) dari teman sebaya sebelum menyetorkan ke Ustadz.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks List Column */}
              <div className={currentUser?.role === 'ustadz' || currentUser?.role === 'admin' ? "space-y-4" : "lg:col-span-2 space-y-4 order-1"}>
                {/* Search & Filters for Tasks */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold"
                      placeholder="Cari materi, ustadz, atau siswa..."
                      value={tugasSearchQuery}
                      onChange={(e) => setTugasSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-48">
                      <select
                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 appearance-none cursor-pointer font-bold"
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                      >
                        <option value="All">Semua Grade/Kelas</option>
                        {currentUser && currentUser.role === 'ustadz' && (
                          <option value="halaqah_saya">⭐ Siswa Halaqah Saya</option>
                        )}
                        {uniqueGrades.filter(g => g !== 'All').map((g, idx) => (
                          <option key={`tugas-filter-grade-${g}-${idx}`} value={g}>{g}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Filter className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks loop */}
                <div className="space-y-4">
                  {filteredTugasHarian.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 shadow-xs">
                      <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="italic font-bold text-xs">Tidak ada tugas harian yang terbit saat ini.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan pilihan filter pencarian atau hubungi Ustadz Anda.</p>
                    </div>
                  ) : (
                    filteredTugasHarian.map((t, idx) => (
                      <div
                        key={`tugas-${t.id || ''}-${idx}`}
                        className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 hover:border-blue-300 transition-all space-y-4 relative group"
                      >
                        {/* Task Card Header */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-blue-50 text-[#0000FE] border border-blue-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {t.grade === 'All' ? 'Semua Kelas' : `Kelas: ${t.grade}`}
                              </span>
                              {t.siswa && t.siswa.toLowerCase() !== 'all' && t.siswa.toLowerCase() !== 'semua' && t.siswa.toLowerCase() !== 'semua siswa' && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  Khusus Siswa: {t.siswa}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-bold font-mono flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {formatDateSafe(t.tanggal)}
                              </span>
                            </div>
                            {(() => {
                              const parsed = parseMateriField(t.materi);
                              if (parsed.isJson) {
                                return (
                                  <div className="space-y-2.5 pt-2 border-t border-slate-100/50 mt-1">
                                    {parsed.ziyadah && (
                                      <div className="flex items-start gap-2">
                                        <span className="bg-blue-50 text-[#0000FE] text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shrink-0 mt-0.5 border border-blue-100">
                                          Ziyadah
                                        </span>
                                        <span className="text-xs text-slate-700 font-bold">{parsed.ziyadah}</span>
                                      </div>
                                    )}
                                    {parsed.murojaah && (
                                      <div className="flex items-start gap-2">
                                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shrink-0 mt-0.5 border border-blue-100">
                                          Murojaah
                                        </span>
                                        <span className="text-xs text-slate-700 font-bold">{parsed.murojaah}</span>
                                      </div>
                                    )}
                                    {parsed.tugasMateri && (
                                      <div className="flex items-start gap-2">
                                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-lg uppercase tracking-wider shrink-0 mt-0.5 border border-indigo-100">
                                          Materi
                                        </span>
                                        <span className="text-xs text-slate-700 font-bold">{parsed.tugasMateri}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return (
                                <h3 className="text-sm font-black text-slate-800 leading-snug pt-1.5">
                                  {t.materi}
                                </h3>
                              );
                            })()}
                          </div>
 
                          {/* Ustadz/Admin Controls */}
                          {(currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
                            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                              {currentUser && (currentUser.role === 'admin' || !t.siswa || t.siswa.toLowerCase() === 'all' || t.siswa.toLowerCase() === 'semua' || t.siswa.toLowerCase() === 'semua siswa' || canCurrentUserEditStudent(undefined, t.siswa)) ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingTugas(t);
                                      setTugasFormTanggal(t.tanggal || '');
                                      setTugasFormGrade(t.grade || 'All');
                                      setTugasFormSiswa(t.siswa || 'All');
                                      
                                      const parsed = parseMateriField(t.materi);
                                      setTugasFormZiyadah(parsed.ziyadah || '');
                                      setTugasFormMurojaah(parsed.murojaah || '');
                                      setTugasFormTugasMateri(parsed.tugasMateri || '');
                                      setTugasFormMateri(t.materi || '');
                                      
                                      setTugasFormUstadz(t.ustadz || '');
                                      setTugasFormKeterangan(t.keterangan || '');
                                      const formEl = document.getElementById('tugas-form-container');
                                      if (formEl) {
                                        formEl.scrollIntoView({ behavior: 'smooth' });
                                      }
                                    }}
                                    className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                    title="Edit Tugas"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteTugas(t)}
                                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                    title="Hapus Tugas"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-400" title="Terkunci - Bukan siswa halaqah Anda" />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Description block */}
                        {t.keterangan && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-sans font-semibold whitespace-pre-wrap">
                            {t.keterangan}
                          </div>
                        )}

                        {/* Footer details */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          <span>Pemberi Tugas: <strong className="text-slate-600 font-extrabold">{t.ustadz || 'Ustadz'}</strong></span>
                          <span className="font-mono text-[9px]">ID: {t.id}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className={activeTab === 'capaian_ziyadah' ? 'block' : 'hidden'}>
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-300">
            
            {/* Header info bar */}
            <div className="bg-[#0000FE] text-white rounded-3xl p-6 shadow-sm border border-blue-700 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-200 animate-bounce" />
                    Capaian Target Ziyadah Siswa
                  </h2>
                  <p className="text-blue-50 text-xs mt-1 font-semibold">
                    Pantau target hafalan (ziyadah) baris siswa dalam satu tahun secara presisi dan objektif.
                  </p>
                </div>
                {currentUser && (currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
                  <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/20">
                    {currentUser.role === 'admin' ? 'Mode Administrator' : 'Mode Ustadz'}
                  </span>
                )}
              </div>
            </div>

            {/* Key Stats Cards Grid */}
            {currentUser?.role === 'siswa' ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Total</span>
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
                      <Target className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-slate-800">
                      {processedCapaianList[0]?.target ? (processedCapaianList[0].target + processedCapaianList[0].capaian) : 300} Baris
                    </h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Target hafalan setahun</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Capaian Ziyadah</span>
                    <div className="p-2 bg-blue-50 text-[#0000FE] rounded-xl">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-[#0000FE]">{processedCapaianList[0]?.capaian || 0} Baris</h4>
                    <p className="text-[9px] text-blue-600 font-semibold mt-0.5">Total baris ziyadah</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-extrabold">Persentase</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-emerald-700">{processedCapaianList[0]?.persentase || 0}%</h4>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(processedCapaianList[0]?.persentase || 0, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-extrabold">Sisa Target</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-amber-700">{processedCapaianList[0]?.target || 0} Baris</h4>
                    <p className="text-[9px] text-amber-600 font-semibold mt-0.5">Sisa baris ke target</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-xl">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-slate-800">{capaianStats.total}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Siswa terdaftar target</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Rata-rata Capaian</span>
                    <div className="p-2 bg-blue-50 text-[#0000FE] rounded-xl">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-[#0000FE]">{capaianStats.avgPercentage}%</h4>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-[#0000FE] h-full" style={{ width: `${Math.min(capaianStats.avgPercentage, 100)}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-extrabold">Mencapai Target</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-emerald-700">{capaianStats.reachedTarget}</h4>
                    <p className="text-[9px] text-emerald-600 font-bold mt-0.5 font-sans">Lulus Target 100% 🎉</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-extrabold">Capaian Tertinggi</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xl font-black text-amber-700">{capaianStats.highestPct}%</h4>
                    <p className="text-[9px] text-amber-600 font-semibold mt-0.5">Skor persentase tertinggi</p>
                  </div>
                </div>
              </div>
            )}

            {/* Filter controls panel - ONLY shown for Ustadz/Admin */}
            {currentUser && currentUser.role !== 'siswa' && (
              <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="input-capaian-search"
                    type="text"
                    placeholder="Cari nama siswa..."
                    value={capaianSearch}
                    onChange={(e) => setCapaianSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0000FE] focus:ring-1 focus:ring-[#0000FE]"
                  />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Kelas:</span>
                    <select
                      id="select-capaian-grade-filter"
                      value={capaianGradeFilter}
                      onChange={(e) => setCapaianGradeFilter(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0000FE]"
                    >
                      {uniqueCapaianGrades.map((grade, idx) => (
                        <option key={`capaian-grade-${grade}-${idx}`} value={grade}>{grade === 'All' ? 'Semua Kelas' : grade}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Urutan:</span>
                    <select
                      id="select-capaian-sort-filter"
                      value={capaianSortBy}
                      onChange={(e) => setCapaianSortBy(e.target.value as any)}
                      className="w-full sm:w-auto px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0000FE]"
                    >
                      <option value="percentage_desc">Capaian Tertinggi</option>
                      <option value="percentage_asc">Capaian Terendah</option>
                      <option value="name">Nama Siswa (A-Z)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Students list cards/grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedCapaianList.length === 0 ? (
                <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-xs font-bold font-sans">Tidak ada data capaian target yang cocok.</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Silakan ganti kata kunci pencarian atau filter kelas Anda.</p>
                </div>
              ) : (
                processedCapaianList.map((item, idx) => {
                  const percentage = item.persentase !== undefined && item.persentase !== null
                    ? item.persentase
                    : (item.target > 0 ? Math.round((item.capaian / item.target) * 100) : 0);
                  
                  // Color configuration based on percentage tier
                  let colorTheme = {
                    bg: 'bg-rose-50 border-rose-100',
                    text: 'text-rose-700',
                    bar: 'bg-rose-500',
                    badge: 'bg-rose-100 text-rose-800 border-rose-200',
                    label: 'Perlu Bimbingan'
                  };
                  if (percentage >= 100) {
                    colorTheme = {
                      bg: 'bg-sky-50 border-sky-100 border',
                      text: 'text-[#0000FE]',
                      bar: 'bg-gradient-to-r from-blue-500 to-indigo-600',
                      badge: 'bg-blue-100 text-[#0000FE] border-blue-200 border',
                      label: 'Melampaui Target 🎉'
                    };
                  } else if (percentage >= 71) {
                    colorTheme = {
                      bg: 'bg-emerald-50/50 border-emerald-100 border',
                      text: 'text-emerald-700',
                      bar: 'bg-emerald-500',
                      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 border',
                      label: 'Mendekati Target'
                    };
                  } else if (percentage >= 36) {
                    colorTheme = {
                      bg: 'bg-amber-50/50 border-amber-100 border',
                      text: 'text-amber-700',
                      bar: 'bg-amber-500',
                      badge: 'bg-amber-100 text-amber-800 border-amber-200 border',
                      label: 'Sedang Berjalan Baik'
                    };
                  }

                  const isMe = currentUser && isStudentNameMatched(item.nama, currentUser.nama);

                  return (
                    <div
                      key={`capaian-${item.id || ''}-${idx}`}
                      className={`bg-white rounded-3xl p-5 shadow-xs border transition-all duration-300 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 ${
                        isMe ? 'ring-2 ring-[#0000FE] border-[#0000FE]/20' : 'border-slate-100'
                      }`}
                    >
                      {/* Highlight label for logged in student */}
                      {isMe && (
                        <div className="absolute top-0 right-0 bg-[#0000FE] text-white text-[8px] font-black uppercase tracking-wider px-3.5 py-1 rounded-bl-xl shadow-xs font-sans">
                          Hafalan Saya
                        </div>
                      )}

                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {profilePics[item.nama] ? (
                            <img 
                              src={profilePics[item.nama]} 
                              alt={item.nama} 
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs uppercase shrink-0">
                              {item.nama.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-[#0000FE] transition-colors">
                              {item.nama}
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.grade}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${colorTheme.badge}`}>
                            {percentage}%
                          </span>
                          {currentUser && (currentUser.role === 'admin' || (currentUser.role === 'ustadz' && canCurrentUserEditStudent(item.id, item.nama))) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCapaianStudent(item.nama);
                                setEditCapaianValue(item.capaian);
                                setEditTargetValue(item.target);
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-[#0000FE] rounded-lg transition-colors border border-transparent hover:border-slate-200"
                              title="Edit Target & Capaian"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {editingCapaianStudent === item.nama ? (
                        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Capaian (Baris)</label>
                              <input
                                type="number"
                                min="0"
                                value={editCapaianValue}
                                onChange={(e) => setEditCapaianValue(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0000FE]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target (Baris)</label>
                              <input
                                type="number"
                                min="0"
                                value={editTargetValue}
                                onChange={(e) => setEditTargetValue(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#0000FE]"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-1.5 pt-1.5">
                            {capaianLocalEdits[String(item.nama || '').toLowerCase()] ? (
                              <button
                                onClick={() => handleResetCapaianEdit(item.nama)}
                                className="px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] py-1 font-bold flex items-center gap-1 transition-all border border-rose-100"
                                title="Reset ke nilai default spreadsheet"
                              >
                                <RefreshCw className="w-2.5 h-2.5" />
                                Reset
                              </button>
                            ) : (
                              <div />
                            )}
                            <div className="flex gap-1">
                              <button
                                onClick={() => setEditingCapaianStudent(null)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold transition-all border border-slate-200"
                              >
                                Batal
                              </button>
                              <button
                                onClick={() => handleSaveCapaianEdit(item.nama, editCapaianValue, editTargetValue)}
                                className="px-2 py-1 bg-[#0000FE] hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold transition-all shadow-2xs"
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Visual Progress gauge */}
                          <div className="mt-5 space-y-2">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1 font-sans">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                Capaian: <strong className="text-slate-700 font-extrabold">{item.capaian}</strong> baris
                              </span>
                              <span className="flex items-center gap-1 font-sans">
                                <Target className="w-3.5 h-3.5 text-slate-400" />
                                Target: <strong className="text-slate-700 font-extrabold">{item.target}</strong> baris
                              </span>
                            </div>

                            {/* Progress Bar background and fill */}
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ${colorTheme.bar}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Bottom status badge */}
                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-400 uppercase tracking-wider">Status Capaian:</span>
                            <span className={`px-2 py-0.5 rounded-md ${colorTheme.bg} ${colorTheme.text} border text-[9px] font-black uppercase tracking-wide font-sans`}>
                              {colorTheme.label}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {(currentUser?.role === 'ustadz' || currentUser?.role === 'admin') && (
          <div className={activeTab === 'database' ? 'block' : 'hidden'}>
            <DatabaseTab
              setoran={setoran}
              gmailAccounts={gmailAccounts}
              onSendReminder={(studentName, email) => {
                setLastCreatedRecord({
                  studentName,
                  type: 'setoran',
                  timestamp: Date.now()
                });
                setManualForwardEmail(email);
                setManualForwardStudentName('');
                // scroll up to form/widget container if needed
                document.getElementById('tugas-form-container')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>
        )}

        <div className={activeTab === 'berita' ? 'block' : 'hidden'}>
          <BeritaTab
            currentUser={currentUser}
            beritaList={beritaList}
            onAddBerita={handleAddBerita}
            onDeleteBerita={handleDeleteBerita}
            onToggleLike={handleToggleLikeBerita}
            onAddComment={handleAddCommentBerita}
          />
        </div>

          </div>

      </main>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteRecord && (
        <div id="modal-delete-confirmation" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Hapus Penilaian</h3>
                <p className="text-xs text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600 font-sans">
              <div className="flex justify-between"><span className="font-semibold text-slate-400">Nama Siswa:</span> <span className="font-bold text-slate-800">{confirmDeleteRecord.nama}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-400">Kegiatan:</span> <span className="font-bold text-slate-800">{confirmDeleteRecord.kegiatan}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-400">Tanggal:</span> <span className="font-bold text-slate-800">{new Date(confirmDeleteRecord.tanggalSetoran).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              {confirmDeleteRecord.surah && <div className="flex justify-between"><span className="font-semibold text-slate-400">Surah/Bab:</span> <span className="font-bold text-slate-800">{confirmDeleteRecord.surah}</span></div>}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus data penilaian ini? Jika terhubung dengan Google Sheets, baris data ini juga akan terhapus dari spreadsheet Anda.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                id="btn-confirm-delete-cancel"
                onClick={() => setConfirmDeleteRecord(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors text-xs disabled:opacity-50 font-sans"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-submit"
                onClick={async () => {
                  setIsDeleting(true);
                  const success = await handleDeleteSetoran(confirmDeleteRecord);
                  setIsDeleting(false);
                  if (success) {
                    setConfirmDeleteRecord(null);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 disabled:bg-rose-400 font-sans"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menghapus...
                  </>
                ) : (
                  'Ya, Hapus Data'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tugas Harian Confirmation Modal */}
      {confirmDeleteTugas && (
        <div id="modal-delete-tugas-confirmation" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="p-3 bg-rose-50 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Hapus Tugas Harian</h3>
                <p className="text-xs text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-600 font-sans">
              <div className="flex justify-between"><span className="font-semibold text-slate-400">Kelas:</span> <span className="font-bold text-slate-800">{confirmDeleteTugas.grade}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-400">Materi:</span> <span className="font-bold text-slate-800 truncate max-w-[200px]">{confirmDeleteTugas.materi}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-400">Tanggal:</span> <span className="font-bold text-slate-800">{new Date(confirmDeleteTugas.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus tugas harian ini? Jika terhubung dengan Google Sheets, baris data ini juga akan terhapus dari sheet "Tugas Harian".
            </p>

            <div className="flex gap-3 pt-2">
              <button
                id="btn-confirm-delete-tugas-cancel"
                onClick={() => setConfirmDeleteTugas(null)}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors text-xs font-sans"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-tugas-submit"
                onClick={async () => {
                  const success = await handleDeleteTugas(confirmDeleteTugas);
                  if (success) {
                    setConfirmDeleteTugas(null);
                  }
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 font-sans"
              >
                Ya, Hapus Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Undo Toast Notification */}
      {showUndoToast && lastAction && currentUser && (currentUser.role === 'ustadz' || currentUser.role === 'admin') && (
        <div id="toast-undo" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-6 max-w-sm animate-in slide-in-from-bottom duration-300">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-100">
              {lastAction.type === 'add' && 'Penilaian berhasil ditambahkan'}
              {lastAction.type === 'edit' && 'Penilaian berhasil diperbarui'}
              {lastAction.type === 'delete' && 'Penilaian berhasil dihapus'}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              Siswa: <span className="font-bold text-slate-200">{lastAction.data.nama}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-undo-toast"
              onClick={handleUndo}
              disabled={isUndoing}
              className="flex items-center gap-1 bg-[#0000FE] hover:bg-[#0000FE]/80 active:scale-95 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Undo2 className={`w-3.5 h-3.5 ${isUndoing ? 'animate-spin' : ''}`} />
              {isUndoing ? 'Mengurungkan...' : 'Urungkan'}
            </button>
            <button
              id="btn-close-undo-toast"
              onClick={() => setShowUndoToast(false)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Informasi Data Penilaian & Tugas Terbaru (di akun siswa) */}
      {showLatestInfoPopup && currentUser && currentUser.role === 'siswa' && (
        <div id="latest-info-popup" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#0000FE] to-blue-700 text-white relative">
              <button
                onClick={() => setShowLatestInfoPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 rounded-xl border border-white/10">
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-blue-100">Informasi Terbaru Anda</h3>
                  <h2 className="text-lg font-black text-white mt-0.5 leading-tight">Update Penilaian & Tugas Harian</h2>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* SECTION 1: PENILAIAN TERAKHIR */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#0000FE]" />
                  Penilaian Terakhir Anda
                </h4>

                {latestAssessmentForStudent ? (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4 hover:border-blue-200 transition-all shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 text-[#0000FE] border border-blue-100 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {latestAssessmentForStudent.kegiatan}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">{latestAssessmentForStudent.tanggalSetoran}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        latestAssessmentForStudent.status === 'Boleh Lanjut' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {latestAssessmentForStudent.status === 'Boleh Lanjut' ? (
                          <Smile className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Frown className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        {latestAssessmentForStudent.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Materi Hafalan</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5 block">
                          {latestAssessmentForStudent.surah}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah {getSatuanByKegiatan(latestAssessmentForStudent.kegiatan)}</span>
                        <span className="text-sm font-black text-slate-800 mt-0.5 block">
                          {latestAssessmentForStudent.baris} {getSatuanByKegiatan(latestAssessmentForStudent.kegiatan)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai</span>
                        <span className="text-sm font-black text-[#0000FE] mt-0.5 block">
                          {latestAssessmentForStudent.nilai}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Guru Al-Qur'an</span>
                        <span className="text-xs font-extrabold text-slate-600 mt-0.5 block font-sans">
                          Ust. Tsaqif/Ust. Syuja/Ust. Salman
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs italic font-semibold">
                    Belum ada data penilaian terbaru yang dicatat oleh Ustadz.
                  </div>
                )}
              </div>

              {/* SECTION 2: TUGAS HARIAN TERBARU */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-[#0000FE]" />
                  Tugas Harian Terbaru Anda
                </h4>

                {latestTugasForStudent ? (() => {
                  const parsed = parseMateriField(latestTugasForStudent.materi);
                  return (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4 hover:border-blue-200 transition-all shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          Grade: {latestTugasForStudent.grade || 'Semua'}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {latestTugasForStudent.tanggal}
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-slate-200/60 pt-3 text-xs">
                        {parsed.isJson ? (
                          <div className="grid grid-cols-1 gap-2">
                            {parsed.ziyadah && (
                              <div className="p-2.5 bg-emerald-50/50 border border-emerald-100/60 rounded-xl">
                                <span className="block text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Target Ziyadah</span>
                                <span className="font-extrabold text-slate-800 mt-0.5 block text-xs">{parsed.ziyadah}</span>
                              </div>
                            )}
                            {parsed.murojaah && (
                              <div className="p-2.5 bg-blue-50/50 border border-blue-100/60 rounded-xl">
                                <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wider">Target Murojaah</span>
                                <span className="font-extrabold text-slate-800 mt-0.5 block text-xs">{parsed.murojaah}</span>
                              </div>
                            )}
                            {parsed.tugasMateri && (
                              <div className="p-2.5 bg-purple-50/50 border border-purple-100/60 rounded-xl">
                                <span className="block text-[9px] font-bold text-purple-700 uppercase tracking-wider font-sans">Materi / Pengumuman Lain</span>
                                <span className="font-extrabold text-slate-800 mt-0.5 block text-xs">{parsed.tugasMateri}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-100/50 rounded-xl font-semibold text-slate-700 leading-relaxed">
                            {latestTugasForStudent.materi}
                          </div>
                        )}

                        {latestTugasForStudent.keterangan && (
                          <div className="p-3 bg-amber-50/30 border border-amber-100/40 rounded-xl text-[11px] text-slate-600 font-medium italic leading-relaxed whitespace-pre-wrap">
                            Keterangan: {latestTugasForStudent.keterangan}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Pemberi Tugas: <strong className="text-slate-600 font-extrabold">{latestTugasForStudent.ustadz || 'Ustadz'}</strong></span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs italic font-semibold">
                    Belum ada tugas harian terbaru untuk kelas Anda.
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setShowLatestInfoPopup(false)}
                className="w-full py-3 bg-[#0000FE] hover:bg-[#0000D0] text-white font-black rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer text-center text-xs"
              >
                Alhamdulillah, Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Logo Settings Modal */}
      {showProfileModal && (
        <ProfileSettingsModal
          currentUser={currentUser}
          profilePics={profilePics}
          gmailAccounts={gmailAccounts}
          customLogo={customLogo}
          onUpdateProfilePic={handleUpdateProfilePic}
          onUpdateCustomLogo={handleUpdateCustomLogo}
          onUpdateGmail={handleUpdateGmail}
          onClose={() => setShowProfileModal(false)}
          setoran={setoran}
          activeStudents={activeStudentsList}
          onUpdateHalaqahStudents={(ids) => setHalaqahStudentIds(ids)}
        />
      )}

      {/* Ranking Santri per Kelas Modal */}
      {showRankingModal && (
        <RankingModal
          currentUser={currentUser}
          setoran={setoran}
          capaianZiyadah={capaianZiyadah}
          activeStudents={activeStudentsList}
          onClose={() => setShowRankingModal(false)}
        />
      )}

    </div>
  );
}
