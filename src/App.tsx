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
  Music
} from 'lucide-react';
import { Setoran, Settings, UserSession, TugasHarian } from './types';
import { DEMO_SETORAN, DEMO_TUGAS_HARIAN, getSatuanByKegiatan, GOOGLE_APPS_SCRIPT_CODE } from './data';
import { StatsCard } from './components/StatsCard';
import { NewAssessmentForm } from './components/NewAssessmentForm';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StatsCharts } from './components/StatsCharts';
import { LoginPage } from './components/LoginPage';

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


export default function App() {
  // 1. Core States
  const [setoran, setSetoran] = useState<Setoran[]>(DEMO_SETORAN);
  const [tugasHarian, setTugasHarian] = useState<TugasHarian[]>(DEMO_TUGAS_HARIAN);
  const [activeTab, setActiveTab] = useState<'rekap' | 'tugas' | 'statistik'>('rekap');
  const [editingTugas, setEditingTugas] = useState<TugasHarian | null>(null);
  const [isSubmittingTugas, setIsSubmittingTugas] = useState<boolean>(false);
  const [confirmDeleteTugas, setConfirmDeleteTugas] = useState<TugasHarian | null>(null);
  
  const [usingDemoData, setUsingDemoData] = useState<boolean>(true);
  
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

  // Session State (Loaded from localStorage)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const savedSession = localStorage.getItem('tahfizh_user_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        console.error('Failed to parse user session', e);
      }
    }
    return null;
  });

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tahfizh_user_session');
  };

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    localStorage.setItem('tahfizh_user_session', JSON.stringify(session));
  };

  // Default Google Apps Script URL set by the developer
  const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwK0a1doiZQ2LA4MimqLdgdNO_bifCyOBkSQDfIAZSluRLyG_beHXp6e_AY_EHHGM28/exec';

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

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [kegiatanFilter, setKegiatanFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
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
          setTugasHarian(sortedTasks);
        }
      }
    } catch (err) {
      console.error('Failed to fetch Tugas Harian:', err);
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
    } else {
      await fetchDataFromSheets(settings.appsScriptUrl);
    }
    setIsSyncing(false);
  };

  // Use Demo Data Offline
  const handleUseDemoData = () => {
    setSetoran(DEMO_SETORAN);
    setTugasHarian(DEMO_TUGAS_HARIAN);
    setUsingDemoData(true);
    setConnectionStatus('disconnected');
    setErrorMessage('');
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

    if (usingDemoData || !settings.appsScriptUrl) {
      // Offline Demo Mode: Append locally in memory
      setSetoran((prev) => [recordWithId, ...prev]);
      setIsSubmitting(false);
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
        // Refresh dashboard statistics from Google Sheets
        await fetchDataFromSheets(settings.appsScriptUrl);
        setIsSubmitting(false);
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
    
    if (usingDemoData || !settings.appsScriptUrl) {
      // Offline Demo Mode: Update locally in memory
      setSetoran((prev) => prev.map((s) => s.id === updatedRecord.id ? updatedRecord : s));
      setIsSubmitting(false);
      setEditingSetoran(null);
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
        // Refresh dashboard statistics from Google Sheets
        await fetchDataFromSheets(settings.appsScriptUrl);
        setIsSubmitting(false);
        setEditingSetoran(null);
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
    if (!currentUser || !(currentUser.nama || '').toLowerCase().includes('ustadz')) {
      console.error('Unauthorized deletion attempt.');
      return false;
    }

    if (usingDemoData || !settings.appsScriptUrl) {
      // Offline Demo Mode: Delete locally in memory
      setSetoran((prev) => prev.filter((s) => s.id !== recordToDelete.id));
      if (editingSetoran?.id === recordToDelete.id) {
        setEditingSetoran(null);
      }
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
        // Refresh dashboard statistics from Google Sheets
        await fetchDataFromSheets(settings.appsScriptUrl);
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

  // Add new Tugas Harian
  const handleAddTugas = async (newTugas: Omit<TugasHarian, 'id'> & { id?: string }): Promise<boolean> => {
    setIsSubmittingTugas(true);
    const finalId = newTugas.id || String(Math.floor(1000000 + Math.random() * 9000000));
    const recordWithId: TugasHarian = {
      ...newTugas,
      id: finalId,
    };

    if (usingDemoData || !settings.appsScriptUrl) {
      setTugasHarian((prev) => [recordWithId, ...prev]);
      setIsSubmittingTugas(false);
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
        return true;
      } else {
        throw new Error(res.message || 'Gagal menyimpan tugas harian.');
      }
    } catch (err) {
      console.error('Error submitting tugas harian:', err);
      setIsSubmittingTugas(false);
      return false;
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
    if (!currentUser || !(currentUser.nama || '').toLowerCase().includes('ustadz')) {
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
      } else {
        throw new Error(res.message || 'Gagal menghapus tugas harian.');
      }
    } catch (err) {
      console.error('Error deleting tugas harian:', err);
      return false;
    }
  };

  // 4. Filter logic
  const filteredSetoran = useMemo(() => {
    return setoran.filter((item) => {
      const isStudent = currentUser && currentUser.role === 'siswa';
      if (isStudent && !isStudentNameMatched(item.nama, currentUser.nama)) {
        return false;
      }

      const matchesSearch = (item.nama || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                            (item.id || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchesGrade = gradeFilter === 'All' || item.grade === gradeFilter;
      const matchesKegiatan = kegiatanFilter === 'All' || 
                              (kegiatanFilter === 'Tahsin'
                                ? item.kegiatan === 'Tahsin' || (item.kegiatan || '').toLowerCase().includes('tahsin (')
                                : item.kegiatan === kegiatanFilter);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesGrade && matchesKegiatan && matchesStatus;
    });
  }, [setoran, searchQuery, gradeFilter, kegiatanFilter, statusFilter, currentUser]);

  const filteredTugasHarian = useMemo(() => {
    return tugasHarian.filter((t) => {
      const isStudent = currentUser && currentUser.role === 'siswa';
      
      // If user is a student, by default we can show tasks for their grade OR "All"
      // But we also let them filter. Let's see what grade is associated with this student in setoran
      let studentGrade = '';
      if (isStudent) {
        const matchingRecord = setoran.find((s) => isStudentNameMatched(s.nama, currentUser.nama));
        if (matchingRecord) {
          studentGrade = matchingRecord.grade;
        }
      }

      const matchesSearch = (t.materi || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                            (t.ustadz || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                            (t.keterangan || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                            (t.siswa || '').toLowerCase().includes((searchQuery || '').toLowerCase());
                             
      let matchesGrade = gradeFilter === 'All' || t.grade === 'All' || t.grade === gradeFilter;
      
      // For student view, if grade filter is 'All', they should see tasks for 'All' or their own grade
      if (isStudent && gradeFilter === 'All' && studentGrade) {
        matchesGrade = t.grade === 'All' || t.grade === studentGrade;
      }

      // If the task is specific to a single student
      if (t.siswa && t.siswa !== 'All') {
        if (isStudent) {
          return matchesSearch && isStudentNameMatched(t.siswa, currentUser.nama);
        } else {
          // For teachers, display specific student tasks along with the grade
          return matchesSearch && matchesGrade;
        }
      }

      return matchesSearch && matchesGrade;
    });
  }, [tugasHarian, searchQuery, gradeFilter, setoran, currentUser]);

  // Selected Student Drill-down History
  const studentHistory = useMemo(() => {
    if (!selectedStudentName) return [];
    return setoran
      .filter((s) => (s.nama || '').toLowerCase() === (selectedStudentName || '').toLowerCase())
      .sort((a, b) => new Date(b.tanggalSetoran).getTime() - new Date(a.tanggalSetoran).getTime());
  }, [selectedStudentName, setoran]);

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
    return Object.values(map).sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
  }, [setoran]);

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
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-16">
      
      {/* Dynamic Student Detail Drilldown modal */}
      {selectedStudentName && (
        <StudentDetailModal
          studentName={selectedStudentName}
          studentHistory={studentHistory}
          onClose={() => setSelectedStudentName(null)}
        />
      )}

      {/* Modern Banner Header */}
      <header id="dashboard-header" className="bg-gradient-to-r from-[#0000FE] to-[#FFFFFF] text-slate-900 shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/25 text-white text-xs font-extrabold tracking-widest px-3 py-1 rounded-full uppercase border border-white/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Portal Tahfizh Qur'an
                </span>
                
                {/* Active User Session Indicator */}
                <span className="bg-white/30 text-[#0000FE] text-[11px] font-bold px-3 py-1 rounded-full border border-[#0000FE]/20 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#0000FE]" />
                  Profil: <strong className="text-slate-900 font-bold">{currentUser.nama}</strong> ({currentUser.role === 'ustadz' ? 'Ustadz' : 'Siswa'})
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white drop-shadow-sm">
                Dashboard Tahfizh Recap 2 INTER 3
              </h1>
              <p className="text-blue-50 text-xs sm:text-sm font-semibold max-w-2xl">
                Sistem rekapitulasi evaluasi setoran hafalan (Tahsin & Ziyadah) terintegrasi langsung dengan Google Sheets.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-sync-sheets"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="bg-[#0000FE] hover:bg-[#0000D0] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                title={usingDemoData ? "Refresh database contoh lokal" : "Sinkronisasi data ulang dengan Google Sheets"}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Refreshing...' : usingDemoData ? 'Refresh Database Contoh' : 'Refresh Database'}
              </button>

              {/* Log Out Button */}
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                title="Keluar dari Akun Anda"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 space-y-6">

        {/* Navigation Tabs Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 self-start sm:self-auto">
            <button
              id="tab-rekap-btn"
              onClick={() => setActiveTab('rekap')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-[#0000FE] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Rekap Penilaian Tahfizh
            </button>
            <button
              id="tab-tugas-btn"
              onClick={() => setActiveTab('tugas')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tugas'
                  ? 'bg-[#0000FE] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Tugas Harian
              {tugasHarian.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'tugas' ? 'bg-white text-[#0000FE] font-extrabold' : 'bg-slate-200 text-slate-600 font-extrabold'}`}>
                  {tugasHarian.length}
                </span>
              )}
            </button>
            <button
              id="tab-statistik-btn"
              onClick={() => setActiveTab('statistik')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'statistik'
                  ? 'bg-[#0000FE] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Statistik & Grafik
            </button>
          </div>
          
          {/* Settings Config Option Trigger */}
          <button
            id="btn-toggle-config-guide"
            onClick={() => setShowConfig(!showConfig)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all self-end sm:self-auto ${
              showConfig 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Panduan & Spreadsheet Config
          </button>
        </div>

        {/* Spreadsheet Config / Guide Panel */}
        {showConfig && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 animate-in fade-in slide-in-from-top duration-300">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-5 h-5 text-[#0000FE]" />
                  Panduan Hubungan Google Sheets
                </h3>
                <p className="text-xs text-slate-500 mt-1">Ikuti langkah-langkah di bawah ini untuk menghubungkan aplikasi Anda ke spreadsheet real-time.</p>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-rose-600 text-xs font-black p-1 px-2.5 bg-slate-50 hover:bg-rose-50 rounded-lg"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed font-sans">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800">1. Langkah Penyusunan Spreadsheet</h4>
                <ol className="list-decimal pl-4 space-y-2 font-medium">
                  <li>Buat spreadsheet baru di Google Sheets.</li>
                  <li>Beri nama tab pertama <strong className="text-slate-800">Penilaian</strong>, tab kedua <strong className="text-slate-800">Akun</strong>, dan tab ketiga <strong className="text-slate-800">Tugas Harian</strong>.</li>
                  <li>Masukkan header kolom persis sesuai panduan di file <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-rose-600">src/data.ts</code>.</li>
                  <li>Klik menu <strong>Ekstensi</strong> di baris atas Google Sheets, lalu pilih <strong>Apps Script</strong>.</li>
                  <li>Tempel (Paste) seluruh kode Apps Script yang kami sediakan di tab sebelah ke dalam editor, lalu klik simpan.</li>
                  <li>Klik tombol <strong>Terapkan</strong> (Deploy) &gt; <strong>Penerapan Baru</strong> (New Deployment). Pilih jenis penerapan <strong>Aplikasi Web</strong> (Web App). Konfigurasi: <i>Execute as: Me</i> dan <i>Who has access: Anyone</i>.</li>
                  <li>Salin URL Aplikasi Web yang dihasilkan ke dalam file <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-rose-600">src/App.tsx</code> sebagai URL default.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-800">2. Kode Google Apps Script Backend</h4>
                <p className="text-slate-500">Salin kode di bawah ini untuk ditaruh di editor Apps Script Google Sheets Anda:</p>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[10px] max-h-52 font-mono whitespace-pre select-all">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
                        alert("Alhamdulillah, kode Apps Script berhasil disalin ke clipboard!");
                      }}
                      className="px-2.5 py-1 bg-[#0000FE] hover:bg-[#0000D0] text-white font-bold rounded-lg text-[10px] shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      Salin Kode
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rekap' && (
          <>
            {/* Content Bento Grid: Form & Student Table with search/filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Input Assessment Form or Student Profile Progress Card */}
          <div className="lg:col-span-1 space-y-6">
            {currentUser.role === 'ustadz' ? (
              <NewAssessmentForm
                onAddSetoran={handleAddSetoran}
                activeStudents={activeStudentsList}
                isSubmitting={isSubmitting}
                editingRecord={editingSetoran}
                onUpdateSetoran={handleUpdateSetoran}
                onCancelEdit={() => setEditingSetoran(null)}
              />
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6">
                <div className="border-b border-slate-100 pb-5 text-center">
                  <div className="inline-flex bg-blue-100 text-blue-800 p-4 rounded-full mb-3 border-4 border-blue-50">
                    <UserCheck className="w-8 h-8 text-[#0000FE]" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">{currentUser.nama}</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#0000FE] border border-blue-100 mt-2 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#0000FE]" /> Akun Siswa Aktif
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Hafalan Anda</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="block text-2xl font-black text-slate-800">{dashboardStats.totalSetoran}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Total Setoran</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                      <span className="block text-2xl font-black text-[#0000FE]">{dashboardStats.lancarRate}%</span>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">Kelancaran</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl space-y-2 text-xs text-blue-800">
                  <h5 className="font-bold text-blue-900">Motivasi Hari Ini:</h5>
                  <p className="italic leading-relaxed">
                    "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya." (HR. Bukhari)
                  </p>
                  <p className="leading-relaxed pt-2 border-t border-blue-100/30 text-[11px]">
                    Tetap istiqomah dalam memelihara hafalanmu. Pastikan setiap bimbingan ustadz dicatat & dipelajari kembali dengan baik.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Column 2 & 3: Table and Filters */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-6 flex flex-col justify-between">
            
            {/* Table Control Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Daftar Penilaian Siswa</h2>
                  <p className="text-xs text-slate-500">Mencakup rekapitulasi penilaian dan kelancaran siswa</p>
                </div>

                {/* Action Controls & Display Mode Indicator */}
                <div className="flex items-center gap-2.5 self-start sm:self-center">
                  {/* Refresh Database Button */}
                  <button
                    id="btn-refresh-database-table"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 transition-all shadow-xs disabled:opacity-50"
                    title={usingDemoData ? "Refresh database contoh lokal" : "Sinkronisasi data ulang dengan Google Sheets"}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Refreshing...' : 'Refresh Database'}
                  </button>

                  {/* Display Mode Indicator */}
                  <div className="text-xs font-semibold">
                    {usingDemoData ? (
                      <span className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                        Data Contoh
                      </span>
                    ) : (
                      <span className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-[#0000FE] border border-blue-200">
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
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-medium"
                    placeholder="Cari nama / ID siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Grade filter */}
                <div className="relative">
                  <select
                    id="filter-grade-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none cursor-pointer"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <option value="All">Semua Grade</option>
                    {uniqueGrades.filter(g => g !== 'All').map((g) => (
                      <option key={g} value={g}>{g}</option>
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
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none cursor-pointer"
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
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none cursor-pointer"
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
            <div className="overflow-x-auto border border-slate-200 rounded-2xl mt-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
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
                    {currentUser.role === 'ustadz' && <th className="py-3 px-4 text-center">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={currentUser.role === 'ustadz' ? 11 : 10} className="py-12 text-center text-slate-400 italic font-medium">
                        Tidak ada data penilaian yang cocok dengan filter pencarian
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((item, idx) => (
                      <tr 
                        key={idx} 
                        id={`assessment-row-${idx}`}
                        className="hover:bg-slate-50/75 transition-colors group cursor-pointer"
                        onClick={() => setSelectedStudentName(item.nama)}
                        title="Klik untuk melihat riwayat siswa"
                      >
                        <td className="py-3 px-4 text-center font-mono text-[10px] text-slate-400 font-medium">{item.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-600">{item.grade}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0000FE] font-extrabold flex items-center justify-center border border-blue-100 uppercase shrink-0 text-xs">
                              {item.nama.substring(0, 2)}
                            </div>
                            <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-[#0000FE] transition-colors">
                              {item.nama}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#0000FE] transition-opacity" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatTanggalIndo(item.tanggalSetoran)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 truncate max-w-[140px]" title={item.surah}>
                          {item.surah || '-'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{item.baris}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-[150px] truncate font-medium" title={item.ctt}>
                          {item.ctt || '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-slate-500 capitalize whitespace-nowrap">{item.satuan || getSatuanByKegiatan(item.kegiatan)}</td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Boleh Lanjut'
                              ? 'bg-blue-50 text-[#0000FE] border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        {currentUser.role === 'ustadz' && (
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center space-x-1.5">
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
                                className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                title="Edit Penilaian"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              {currentUser?.nama?.toLowerCase().includes('ustadz') && (
                                <button
                                  id={`btn-delete-setoran-${item.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteRecord(item);
                                  }}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                  title="Hapus Penilaian"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
              <div className="flex items-center justify-between border-t border-slate-200 pt-5 mt-4 text-xs font-semibold text-slate-500">
                <span>
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSetoran.length)} dari {filteredSetoran.length} penilaian
                </span>
                
                <div className="flex gap-2">
                  <button
                    id="btn-prev-page"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="flex items-center px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <button
                    id="btn-next-page"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
        </>
        )}

        {activeTab === 'statistik' && (
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Filter Analisis Statistik</h3>
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
                    className="text-xs font-bold text-[#0000FE] hover:underline flex items-center gap-1 cursor-pointer"
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
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-medium"
                    placeholder="Cari nama / ID siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Grade filter */}
                <div className="relative">
                  <select
                    id="filter-stats-grade-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none cursor-pointer"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <option value="All">Semua Grade</option>
                    {uniqueGrades.filter(g => g !== 'All').map((g) => (
                      <option key={`stats-grade-${g}`} value={g}>{g}</option>
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
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none cursor-pointer"
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
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 font-semibold appearance-none cursor-pointer"
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#0000FE]" /> Rata-Rata Setoran per Jenis Kegiatan
                </h3>
                <p className="text-[11px] text-slate-400">Rincian rata-rata baris atau halaman yang disetorkan berdasarkan kategori pembelajaran</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Ziyadah */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Ziyadah</span>
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-emerald-950">
                      {dashboardStats.avgZiyadah} <span className="text-xs font-bold text-emerald-700">baris</span>
                    </h4>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                      {dashboardStats.ziyadahCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 2. Murojaah */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Murojaah</span>
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-amber-950">
                      {dashboardStats.avgMurojaah} <span className="text-xs font-bold text-amber-700">hal</span>
                    </h4>
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">
                      {dashboardStats.murojaahCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 3. Tahsin IQRA */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Tahsin (IQRA')</span>
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-blue-950">
                      {dashboardStats.avgTahsinIqra} <span className="text-xs font-bold text-blue-700">hal</span>
                    </h4>
                    <p className="text-[10px] text-blue-600 font-semibold mt-1">
                      {dashboardStats.tahsinIqraCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 4. Tahsin Qoidah */}
                <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">Tahsin (Qoidah)</span>
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-purple-950">
                      {dashboardStats.avgTahsinQoidah} <span className="text-xs font-bold text-purple-700">hal</span>
                    </h4>
                    <p className="text-[10px] text-purple-600 font-semibold mt-1">
                      {dashboardStats.tahsinQoidahCount} setoran aktif
                    </p>
                  </div>
                </div>

                {/* 5. Tahsin Tilawah */}
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Tahsin (Tilawah)</span>
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                      <Music className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-2xl font-black text-rose-950">
                      {dashboardStats.avgTahsinTilawah} <span className="text-xs font-bold text-rose-700">hal</span>
                    </h4>
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">
                      {dashboardStats.tahsinTilawahCount} setoran aktif
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Visual Analytics section */}
            <StatsCharts data={filteredSetoran} />
          </div>
        )}

        {activeTab === 'tugas' && (
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
            </div>

            {/* Sub content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form Column - Only for Ustadz, else Motivation card */}
              <div className="lg:col-span-1 space-y-6">
                {currentUser?.nama?.toLowerCase().includes('ustadz') ? (
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
                          <option value="2 Inter 1">2 Inter 1</option>
                          <option value="2 Inter 2">2 Inter 2</option>
                          <option value="2 Inter 3">2 Inter 3</option>
                          <option value="1 Inter 1">1 Inter 1</option>
                          <option value="1 Inter 2">1 Inter 2</option>
                          <option value="3 Inter 1">3 Inter 1</option>
                          <option value="3 Inter 2">3 Inter 2</option>
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
                          {activeStudentsList.map((st, idx) => (
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
                ) : (
                  // Student View Motivation & Instructions
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
                )}
              </div>

              {/* Tasks List Column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Search & Filters for Tasks */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700"
                      placeholder="Cari materi / ustadz..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-40">
                      <select
                        className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0000FE]/20 focus:border-[#0000FE] text-slate-700 appearance-none cursor-pointer"
                        value={gradeFilter}
                        onChange={(e) => setGradeFilter(e.target.value)}
                      >
                        <option value="All">Semua Grade/Kelas</option>
                        <option value="2 Inter 1">2 Inter 1</option>
                        <option value="2 Inter 2">2 Inter 2</option>
                        <option value="2 Inter 3">2 Inter 3</option>
                        <option value="1 Inter 1">1 Inter 1</option>
                        <option value="1 Inter 2">1 Inter 2</option>
                        <option value="3 Inter 1">3 Inter 1</option>
                        <option value="3 Inter 2">3 Inter 2</option>
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
                              {t.siswa && t.siswa !== 'All' && (
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
 
                          {/* Ustadz Controls */}
                          {currentUser.role === 'ustadz' && (
                            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
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
                              {currentUser?.nama?.toLowerCase().includes('ustadz') && (
                                <button
                                  onClick={() => setConfirmDeleteTugas(t)}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                  title="Hapus Tugas"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
        )}

      </main>

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

    </div>
  );
}
