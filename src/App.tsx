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
  UserCheck
} from 'lucide-react';
import { Setoran, Settings, UserSession } from './types';
import { DEMO_SETORAN, getSatuanByKegiatan } from './data';
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


export default function App() {
  // 1. Core States
  const [setoran, setSetoran] = useState<Setoran[]>(DEMO_SETORAN);
  const [usingDemoData, setUsingDemoData] = useState<boolean>(true);
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
  const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6P7dfuAD3AleS7yvK7ce5YagAaDKm8mLBKOLZgBuhPujlHlSJZxTkMDZEf-PV_6Lz/exec';

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
    } else {
      await fetchDataFromSheets(settings.appsScriptUrl);
    }
    setIsSyncing(false);
  };

  // Use Demo Data Offline
  const handleUseDemoData = () => {
    setSetoran(DEMO_SETORAN);
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

  // 4. Filter logic
  const filteredSetoran = useMemo(() => {
    return setoran.filter((item) => {
      const isStudent = currentUser && currentUser.role === 'siswa';
      if (isStudent && !isStudentNameMatched(item.nama, currentUser.nama)) {
        return false;
      }

      const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'All' || item.grade === gradeFilter;
      const matchesKegiatan = kegiatanFilter === 'All' || 
                              (kegiatanFilter === 'Tahsin'
                                ? item.kegiatan === 'Tahsin' || item.kegiatan.toLowerCase().includes('tahsin (')
                                : item.kegiatan === kegiatanFilter);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesGrade && matchesKegiatan && matchesStatus;
    });
  }, [setoran, searchQuery, gradeFilter, kegiatanFilter, statusFilter, currentUser]);

  // Selected Student Drill-down History
  const studentHistory = useMemo(() => {
    if (!selectedStudentName) return [];
    return setoran
      .filter((s) => s.nama.toLowerCase() === selectedStudentName.toLowerCase())
      .sort((a, b) => new Date(b.tanggalSetoran).getTime() - new Date(a.tanggalSetoran).getTime());
  }, [selectedStudentName, setoran]);

  // List of active students with ID & Grade for dropdown auto-population
  const activeStudentsList = useMemo(() => {
    const map: { [key: string]: { id: string; nama: string; grade: string } } = {};
    setoran.forEach((s) => {
      if (s.nama && !map[s.nama.toLowerCase()]) {
        map[s.nama.toLowerCase()] = {
          id: s.id,
          nama: s.nama,
          grade: s.grade,
        };
      }
    });
    return Object.values(map).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [setoran]);

  // Stats Calculations for Dashboard overview widgets
  const dashboardStats = useMemo(() => {
    const totalSetoran = filteredSetoran.length;
    
    // Distinct students
    const uniqueStudents = new Set(filteredSetoran.map((s) => s.nama.toLowerCase()));
    const totalSiswa = uniqueStudents.size;

    // Avg lines disetor
    const totalLines = filteredSetoran.reduce((acc, curr) => acc + curr.baris, 0);
    const avgBaris = totalSetoran > 0 ? Math.round((totalLines / totalSetoran) * 10) / 10 : 0;

    // Persentase "Boleh Lanjut"
    const totalLancar = filteredSetoran.filter((s) => s.status.toLowerCase().includes('lanjut')).length;
    const lancarRate = totalSetoran > 0 ? Math.round((totalLancar / totalSetoran) * 100) : 0;

    return {
      totalSetoran,
      totalSiswa,
      lancarRate,
      avgBaris,
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
      <header id="dashboard-header" className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Portal Tahfizh Qur'an
                </span>
                
                {/* Active User Session Indicator */}
                <span className="bg-white/10 text-emerald-100 text-[11px] font-semibold px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  Profil: <strong className="text-white font-bold">{currentUser.nama}</strong> ({currentUser.role === 'ustadz' ? 'Ustadz' : 'Siswa'})
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Dashboard Penilaian Tahfizh
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Sistem rekapitulasi evaluasi setoran hafalan (Tahsin & Ziyadah) terintegrasi langsung dengan Google Sheets.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-sync-sheets"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                title={usingDemoData ? "Refresh database contoh lokal" : "Sinkronisasi data ulang dengan Google Sheets"}
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Refreshing...' : usingDemoData ? 'Refresh Database Contoh' : 'Refresh Database'}
              </button>

              {/* Log Out Button */}
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2"
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

        {/* Overview KPI widgets card row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Setoran"
            value={dashboardStats.totalSetoran}
            description="Rekaman setoran terkumpul"
            icon={<Hash className="w-5 h-5" />}
            colorClass="text-emerald-400"
            bgColorClass="bg-slate-800"
            theme="dark"
          />
          <StatsCard
            title="Siswa Aktif"
            value={dashboardStats.totalSiswa}
            description="Siswa terdaftar aktif"
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
            colorClass="text-emerald-700"
            bgColorClass="bg-emerald-100"
            theme="emerald"
          />
          <StatsCard
            title="Rata-rata Baris"
            value={dashboardStats.avgBaris}
            description="Baris terbaca per setoran"
            icon={<BookOpen className="w-5 h-5" />}
            colorClass="text-amber-700"
            bgColorClass="bg-amber-100"
            theme="amber"
          />
        </div>

        {/* Live Visual Analytics section */}
        <StatsCharts data={filteredSetoran} />

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
                  <div className="inline-flex bg-emerald-150 text-emerald-800 p-4 rounded-full mb-3 border-4 border-emerald-50">
                    <UserCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">{currentUser.nama}</h3>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 mt-2 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> Akun Siswa Aktif
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
                      <span className="block text-2xl font-black text-emerald-600">{dashboardStats.lancarRate}%</span>
                      <span className="text-[10px] text-slate-400 font-medium font-sans">Kelancaran</span>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-2 text-xs text-emerald-800">
                  <h5 className="font-bold text-emerald-900">Motivasi Hari Ini:</h5>
                  <p className="italic leading-relaxed">
                    "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya." (HR. Bukhari)
                  </p>
                  <p className="leading-relaxed pt-2 border-t border-emerald-100/30 text-[11px]">
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
                      <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
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
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700"
                    placeholder="Cari nama / ID siswa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Grade filter */}
                <div className="relative">
                  <select
                    id="filter-grade-select"
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 appearance-none cursor-pointer"
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
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 appearance-none cursor-pointer"
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
                    className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-700 appearance-none cursor-pointer"
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
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center border border-emerald-100 uppercase shrink-0 text-xs">
                              {item.nama.substring(0, 2)}
                            </div>
                            <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
                              {item.nama}
                              <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
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
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
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
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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

    </div>
  );
}
