import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, ChevronDown, ChevronUp, Award, BookOpen, 
  Users, BarChart2, Mail, ExternalLink, RefreshCw, Star, CheckCircle2
} from 'lucide-react';
import { Setoran, UserSession, CapaianTargetZiyadah } from '../types';
import { SURAH_LIST, parseSurahString } from './NewAssessmentForm';

interface DatabaseTabProps {
  setoran: Setoran[];
  gmailAccounts: Record<string, string>;
  onSendReminder?: (studentName: string, email: string) => void;
  currentUser?: UserSession | null;
  capaianZiyadahList?: CapaianTargetZiyadah[];
}

// Custom surah ranking: An-Nas (114) is lowest, Al-Baqarah (2) is highest.
export const getSurahRank = (surahStr: string): number => {
  if (!surahStr) return -1;
  const parsed = parseSurahString(surahStr);
  const parsedName = parsed && parsed.name ? String(parsed.name) : '';
  const cleanedParsedName = parsedName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  
  const matchedSurah = SURAH_LIST.find(s => {
    if (!s || !s.nama) return false;
    const cleanedListName = s.nama.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    return cleanedListName === cleanedParsedName || cleanedListName.includes(cleanedParsedName) || cleanedParsedName.includes(cleanedListName);
  });

  if (matchedSurah) {
    if (matchedSurah.no === 2) return 1000; // Al-Baqarah is highest
    if (matchedSurah.no === 1) return 999;  // Al-Fatihah is also very high, but Al-Baqarah is the peak
    return 115 - matchedSurah.no; // An-Nas (114) -> 1, Al-Falaq (113) -> 2, etc.
  }
  return -1;
};

export function DatabaseTab({ setoran, gmailAccounts, onSendReminder, currentUser, capaianZiyadahList }: DatabaseTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'baris' | 'surah'>('baris');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Helper to find a student's Gmail robustly
  const getStudentGmail = (nama: string) => {
    if (!nama) return '';
    const nameLower = String(nama).toLowerCase().trim();
    
    for (const key of Object.keys(gmailAccounts)) {
      if (String(key).toLowerCase().trim() === nameLower) {
        return gmailAccounts[key];
      }
    }
    for (const key of Object.keys(gmailAccounts)) {
      const kLower = String(key).toLowerCase().trim();
      if (kLower.includes(nameLower) || nameLower.includes(kLower)) {
        return gmailAccounts[key];
      }
    }
    return '';
  };

  // Process and aggregate student ziyadah data (including weekly and monthly calculations)
  const studentStats = useMemo(() => {
    const map: Record<string, {
      nama: string;
      grade: string;
      totalBaris: number;
      weeklyBaris: number;
      monthlyBaris: number;
      highestSurah: string;
      highestSurahRank: number;
      surahs: Set<string>;
      records: Setoran[];
    }> = {};

    const now = new Date();

    setoran.forEach((record) => {
      if (!record || !record.nama) return;
      const isZiyadah = record.kegiatan && String(record.kegiatan).toLowerCase() === 'ziyadah';
      if (!isZiyadah) return;

      const studentKey = record.nama.trim();
      if (!map[studentKey]) {
        map[studentKey] = {
          nama: record.nama,
          grade: record.grade || '',
          totalBaris: 0,
          weeklyBaris: 0,
          monthlyBaris: 0,
          highestSurah: '-',
          highestSurahRank: -1,
          surahs: new Set<string>(),
          records: []
        };
      }

      const sData = map[studentKey];
      const barisVal = Number(record.baris) || 0;
      
      // Accumulate lines
      sData.totalBaris += barisVal;

      // Check weekly / monthly period
      if (record.tanggalSetoran) {
        const recDate = new Date(record.tanggalSetoran);
        if (!isNaN(recDate.getTime())) {
          const diffDays = (now.getTime() - recDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays >= -1 && diffDays <= 7) {
            sData.weeklyBaris += barisVal;
          }
          if (recDate.getMonth() === now.getMonth() && recDate.getFullYear() === now.getFullYear()) {
            sData.monthlyBaris += barisVal;
          }
        }
      }
      
      // Store record
      sData.records.push(record);

      if (record.surah) {
        const parsed = parseSurahString(record.surah);
        if (parsed && parsed.name) {
          sData.surahs.add(parsed.name);
        }

        const currentRank = getSurahRank(record.surah);
        if (currentRank > sData.highestSurahRank) {
          sData.highestSurahRank = currentRank;
          sData.highestSurah = record.surah;
        }
      }
    });

    return Object.values(map);
  }, [setoran]);

  // Unique Grades for filtering
  const uniqueGrades = useMemo(() => {
    const grades = studentStats.map(s => s.grade).filter(Boolean);
    return ['All', ...Array.from(new Set(grades))];
  }, [studentStats]);

  // Filter students based on grade & search query
  const filteredStudents = useMemo(() => {
    return studentStats.filter(student => {
      const studentNama = student && student.nama ? String(student.nama) : '';
      const matchesSearch = studentNama.toLowerCase().includes(String(searchQuery || '').toLowerCase());
      
      let matchesGrade = true;
      if (gradeFilter === 'Halaqah Saya') {
        const userGrade = currentUser?.grade || '';
        const userName = (currentUser?.nama || '').toLowerCase().trim();
        const matchesUserGrade = userGrade && student.grade.toLowerCase() === userGrade.toLowerCase();
        const matchesUstadzRecord = student.records.some(r => (r.nama || '').toLowerCase().includes(userName));
        matchesGrade = matchesUserGrade || matchesUstadzRecord;
      } else if (gradeFilter !== 'All') {
        matchesGrade = student.grade === gradeFilter;
      }

      return matchesSearch && matchesGrade;
    });
  }, [studentStats, searchQuery, gradeFilter, currentUser]);

  // Filter and sort the aggregated list for rendering table
  const filteredAndSortedStudents = useMemo(() => {
    const result = [...filteredStudents];

    result.sort((a, b) => {
      if (sortBy === 'baris') {
        const diff = a.totalBaris - b.totalBaris;
        return sortOrder === 'desc' ? -diff : diff;
      } else {
        const diff = a.highestSurahRank - b.highestSurahRank;
        return sortOrder === 'desc' ? -diff : diff;
      }
    });

    return result;
  }, [filteredStudents, sortBy, sortOrder]);

  // Key Statistics computed STRICTLY on filteredStudents (so when class/grade filter changes, stats reflect selected class)
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const totalBaris = filteredStudents.reduce((sum, s) => sum + s.totalBaris, 0);
    const avgBaris = totalStudents > 0 ? Math.round(totalBaris / totalStudents) : 0;
    
    let topBarisStudent = '-';
    let maxBaris = 0;
    let completedTargetCount = 0;

    filteredStudents.forEach(s => {
      if (s.totalBaris > maxBaris) {
        maxBaris = s.totalBaris;
        topBarisStudent = s.nama;
      }

      // Calculate target completion (100% completed target)
      const cz = capaianZiyadahList?.find(c => c && c.nama && c.nama.toLowerCase().trim() === s.nama.toLowerCase().trim());
      const targetVal = cz?.target && cz.target > 0 ? cz.target : 300;
      const capaianVal = cz?.capaian !== undefined ? cz.capaian : s.totalBaris;
      
      if (capaianVal >= targetVal || (targetVal > 0 && Math.round((capaianVal / targetVal) * 100) >= 100)) {
        completedTargetCount++;
      }
    });

    return {
      totalStudents,
      totalBaris,
      avgBaris,
      topBarisStudent,
      maxBaris,
      completedTargetCount
    };
  }, [filteredStudents, capaianZiyadahList]);

  const toggleSort = (field: 'baris' | 'surah') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleExpand = (nama: string) => {
    setExpandedStudent(prev => prev === nama ? null : nama);
  };

  return (
    <div className="space-y-6" id="database-ziyadah-panel">
      {/* Header */}
      <div className="bg-[#0000FE] text-white rounded-3xl p-6 shadow-sm border border-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-200" />
              Database Hafalan Ziyadah Siswa
            </h2>
            <p className="text-blue-50 text-xs mt-1 font-semibold">
              Rekapitulasi progres hafalan baru (Ziyadah) seluruh siswa, diurutkan secara objektif dan sistematis.
            </p>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider border border-white/20">
            Akses Guru & Admin
          </span>
        </div>
      </div>

      {/* Summary Cards - Now 5 cards responsive grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Siswa */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Siswa Ziyadah</span>
            <div className="p-2 bg-blue-50 text-[#0000FE] rounded-xl">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-slate-800">{stats.totalStudents}</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Siswa terekam Ziyadah</p>
          </div>
        </div>

        {/* Total Baris */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Baris</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-slate-800">{stats.totalBaris}</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Seluruh baris disetorkan</p>
          </div>
        </div>

        {/* Rata-rata Baris */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rata-rata Baris</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-slate-800">{stats.avgBaris}</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Baris per siswa</p>
          </div>
        </div>

        {/* Completed Target */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Target</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-xl font-black text-emerald-700">{stats.completedTargetCount}</h4>
            <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">Target 100% Tercapai 🎉</p>
          </div>
        </div>

        {/* Setoran Tertinggi */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hafalan Terbanyak</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Star className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <h4 className="text-xs font-black text-slate-800 truncate" title={stats.topBarisStudent}>
              {stats.topBarisStudent}
            </h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
              Dengan <strong className="text-[#0000FE]">{stats.maxBaris} baris</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Control Area */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] transition-all"
            />
          </div>

          {/* Controls: Grade Filter & Sort Actions */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Grade */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">Semua Kelas</option>
                <option value="Halaqah Saya">Siswa Halaqah Saya</option>
                {uniqueGrades.filter(g => g !== 'All').map(g => (
                  <option key={`db-grade-filter-${g}`} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Sort Category 1: Total Lines */}
            <button
              onClick={() => toggleSort('baris')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                sortBy === 'baris'
                  ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Total Baris</span>
              {sortBy === 'baris' && (
                <span className="text-[10px] font-black">{sortOrder === 'desc' ? '▼' : '▲'}</span>
              )}
            </button>

            {/* Sort Category 2: Highest Surah */}
            <button
              onClick={() => toggleSort('surah')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                sortBy === 'surah'
                  ? 'bg-blue-50 border-blue-200 text-[#0000FE] shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Urutkan surah tertinggi (Urutan: An-Nas s/d Al-Baqarah)"
            >
              <span>Surah Tertinggi (An Nas-Al Baqarah)</span>
              {sortBy === 'surah' && (
                <span className="text-[10px] font-black">{sortOrder === 'desc' ? '▼' : '▲'}</span>
              )}
            </button>
          </div>

        </div>

        {/* Database Grid Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4 text-center">Total Baris Ziyadah</th>
                <th className="py-3.5 px-4">Surah Tertinggi</th>
                <th className="py-3.5 px-4 text-center">Periode Perminggu</th>
                <th className="py-3.5 px-4 text-center">Periode Perbulan</th>
                <th className="py-3.5 px-4 text-center">Hafalan Unik</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredAndSortedStudents.map((student, index) => {
                const isExpanded = expandedStudent === student.nama;
                const email = getStudentGmail(student.nama);
                return (
                  <React.Fragment key={`db-row-${student.nama}`}>
                    <tr className={`hover:bg-slate-50/65 transition-all ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black ${
                          index === 0 ? 'bg-amber-100 text-amber-800' :
                          index === 1 ? 'bg-slate-200 text-slate-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0000FE] font-black text-xs uppercase">
                            {student.nama.substring(0, 2)}
                          </div>
                          <div>
                            <span className="block">{student.nama}</span>
                            {email && (
                              <span className="text-[9px] text-slate-400 font-bold block">{email}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-bold">{student.grade}</td>
                      <td className="py-4 px-4 text-center font-black text-slate-900">
                        <div className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <span className="text-[#0000FE]">{student.totalBaris}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">baris</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-[#0000FE]">
                        {student.highestSurah !== '-' ? (
                          <span className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                            {student.highestSurah}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-blue-700">
                        <span className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                          {student.weeklyBaris} baris
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-indigo-700">
                        <span className="bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                          {student.monthlyBaris} baris
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-500">
                        {student.surahs.size} surah
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleExpand(student.nama)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Detail</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {email && onSendReminder && (
                            <button
                              onClick={() => onSendReminder(student.nama, email)}
                              className="p-1.5 text-blue-600 hover:text-white hover:bg-[#0000FE] rounded-lg border border-blue-200 transition-all cursor-pointer"
                              title={`Forward Notifikasi ke ${email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable History details */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={9} className="py-4 px-6 bg-slate-50/40 border-t border-b border-slate-100">
                          <div className="space-y-3">
                            <h5 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4 text-[#0000FE]" />
                              Histori Setoran Ziyadah {student.nama}
                            </h5>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {student.records.map((rec) => (
                                <div 
                                  key={`db-history-${rec.id}`}
                                  className="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-2xs space-y-2.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="bg-blue-50 text-[#0000FE] text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wide">
                                      {rec.surah}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{rec.tanggalSetoran}</span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[11px] pt-1.5 border-t border-slate-100">
                                    <div>
                                      <span className="text-slate-400 font-bold block">Setoran</span>
                                      <strong className="text-slate-800 font-black mt-0.5 block">{rec.baris} baris</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 font-bold block">Status</span>
                                      <span className={`inline-block font-bold mt-0.5 ${rec.status === 'Boleh Lanjut' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {rec.status}
                                      </span>
                                    </div>
                                  </div>

                                  {rec.ctt && (
                                    <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-500 italic leading-relaxed font-medium">
                                      Catatan: {rec.ctt}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {student.records.length === 0 && (
                                <div className="col-span-2 text-center text-slate-400 italic py-6">
                                  Belum ada setoran Ziyadah.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredAndSortedStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic text-xs font-semibold">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Tidak ada data siswa yang terekam untuk pencarian atau filter saat ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
