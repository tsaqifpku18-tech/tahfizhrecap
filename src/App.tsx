import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  BookOpen, 
  Hash, 
  Search, 
  Filter, 
  RefreshCw, 
  Database, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Setoran, Settings } from './types';
import { DEMO_SETORAN } from './data';
import { StatsCard } from './components/StatsCard';
import { AppsScriptSettings } from './components/AppsScriptSettings';
import { NewAssessmentForm } from './components/NewAssessmentForm';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StatsCharts } from './components/StatsCharts';

export default function App() {
  // 1. Core States
  const [setoran, setSetoran] = useState<Setoran[]>(DEMO_SETORAN);
  const [usingDemoData, setUsingDemoData] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Default Google Apps Script URL set by the developer
  const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbylYGhvs89qRNr44hIe7WSGfVlPor-GOnZTxJtSIrYKdVisU7YH14rntr-fy9haR3eG/exec';

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
    const grades = setoran.map((s) => s.grade).filter(Boolean);
    return ['All', ...Array.from(new Set(grades))];
  }, [setoran]);

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

  // 4. Filter logic
  const filteredSetoran = useMemo(() => {
    return setoran.filter((item) => {
      const matchesSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = gradeFilter === 'All' || item.grade === gradeFilter;
      const matchesKegiatan = kegiatanFilter === 'All' || item.kegiatan === kegiatanFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      
      return matchesSearch && matchesGrade && matchesKegiatan && matchesStatus;
    });
  }, [setoran, searchQuery, gradeFilter, kegiatanFilter, statusFilter]);

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
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-extrabold tracking-widest px-3 py-1 rounded-full uppercase border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Portal Tahfizh Qur'an
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                Dashboard Penilaian Tahfizh
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">
                Sistem rekapitulasi evaluasi setoran hafalan (Tahsin & Ziyadah) terintegrasi langsung dengan Google Sheets.
              </p>
            </div>

            {/* Quick Actions & Integration Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-toggle-config-panel"
                onClick={() => setShowConfig(!showConfig)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border duration-200 shadow-sm ${
                  showConfig 
                    ? 'bg-white text-emerald-800 border-white' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                }`}
              >
                <Database className="w-4 h-4" /> 
                {showConfig ? 'Sembunyikan Integrasi' : 'Hubungkan Google Sheet'}
              </button>

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
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 space-y-6">
        
        {/* Settings and Instruction panel (visible when toggled) */}
        {showConfig && (
          <div className="animate-slide-down">
            <AppsScriptSettings
              settings={settings}
              onSaveSettings={handleSaveSettings}
              connectionStatus={connectionStatus}
              errorMessage={errorMessage}
              onTestConnection={async () => { await fetchDataFromSheets(settings.appsScriptUrl); }}
              onUseDemoData={handleUseDemoData}
              usingDemoData={usingDemoData}
            />
          </div>
        )}

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
          
          {/* Column 1: Input Assessment Form */}
          <div className="lg:col-span-1 space-y-6">
            <NewAssessmentForm
              onAddSetoran={handleAddSetoran}
              activeStudents={activeStudentsList}
              isSubmitting={isSubmitting}
            />
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
                    <option value="Tahsin">Tahsin</option>
                    <option value="Ziyadah">Ziyadah</option>
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
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Kegiatan</th>
                    <th className="py-3 px-4 text-center">Baris</th>
                    <th className="py-3 px-4">Catatan</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 italic font-medium">
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
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center border border-emerald-100 uppercase shrink-0">
                              {item.nama.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
                                {item.nama}
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono font-medium">ID: {item.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600">{item.grade}</td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(item.tanggalSetoran).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.kegiatan === 'Ziyadah'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {item.kegiatan}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700">{item.baris}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-[120px] truncate italic" title={item.ctt}>
                          "{item.ctt}"
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Boleh Lanjut'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
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

    </div>
  );
}
