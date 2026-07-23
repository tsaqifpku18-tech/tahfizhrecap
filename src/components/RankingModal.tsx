import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  X, 
  Award, 
  Medal, 
  Crown, 
  UserCheck, 
  Users, 
  Sparkles,
  TrendingUp,
  Search
} from 'lucide-react';
import { Setoran, CapaianTargetZiyadah, UserSession, UserAccount } from '../types';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  setoran: Setoran[];
  capaianZiyadah: CapaianTargetZiyadah[];
  activeStudentsList: UserAccount[];
}

interface StudentRankItem {
  id: string;
  nama: string;
  grade: string;
  totalBaris: number;
  totalSetoran: number;
  rank: number;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setoran,
  capaianZiyadah,
  activeStudentsList,
}) => {
  if (!isOpen) return null;

  const isSiswa = currentUser.role === 'siswa';

  // Get user's grade or default available grades
  const availableGrades = useMemo(() => {
    const gradesFromList = activeStudentsList.map((s) => s.grade).filter(Boolean);
    const gradesFromCapaian = capaianZiyadah.map((c) => c.grade).filter(Boolean);
    const gradesFromSetoran = setoran.map((s) => s.grade).filter(Boolean);
    const set = new Set([...gradesFromList, ...gradesFromCapaian, ...gradesFromSetoran]);
    return Array.from(set).sort();
  }, [activeStudentsList, capaianZiyadah, setoran]);

  // Default selected grade
  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    if (currentUser.grade && availableGrades.includes(currentUser.grade)) {
      return currentUser.grade;
    }
    return availableGrades[0] || '7A';
  });

  // Search filter for ustadz/admin
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate ranking for a specific grade
  const classLeaderboard = useMemo(() => {
    const targetGrade = isSiswa && currentUser.grade ? currentUser.grade : selectedGrade;

    // Collect all students for this grade
    const studentMap = new Map<string, { nama: string; grade: string; totalBaris: number; totalSetoran: number }>();

    // Seed from activeStudentsList for this grade
    activeStudentsList.forEach((st) => {
      if (!st.grade || st.grade === targetGrade) {
        const key = st.nama.toLowerCase().trim();
        if (!studentMap.has(key)) {
          studentMap.set(key, { nama: st.nama, grade: st.grade || targetGrade, totalBaris: 0, totalSetoran: 0 });
        }
      }
    });

    // Seed from capaianZiyadah for this grade
    capaianZiyadah.forEach((cz) => {
      if (cz.grade === targetGrade) {
        const key = cz.nama.toLowerCase().trim();
        const existing = studentMap.get(key) || { nama: cz.nama, grade: targetGrade, totalBaris: 0, totalSetoran: 0 };
        existing.totalBaris = Math.max(existing.totalBaris, cz.capaian || 0);
        studentMap.set(key, existing);
      }
    });

    // Sum setoran for this grade
    setoran.forEach((s) => {
      if (s.grade === targetGrade) {
        const key = s.nama.toLowerCase().trim();
        const existing = studentMap.get(key) || { nama: s.nama, grade: targetGrade, totalBaris: 0, totalSetoran: 0 };
        existing.totalSetoran += 1;
        // if setoran is ziyadah, sum baris
        if (s.kegiatan && s.kegiatan.toLowerCase().includes('ziyadah')) {
          existing.totalBaris += Number(s.baris) || 0;
        }
        studentMap.set(key, existing);
      }
    });

    // Convert map to array & sort descending by totalBaris, then totalSetoran
    const list: StudentRankItem[] = Array.from(studentMap.values())
      .map((item, index) => ({
        id: `rank-${index}`,
        nama: item.nama,
        grade: item.grade,
        totalBaris: item.totalBaris,
        totalSetoran: item.totalSetoran,
        rank: 0,
      }))
      .sort((a, b) => {
        if (b.totalBaris !== a.totalBaris) return b.totalBaris - a.totalBaris;
        return b.totalSetoran - a.totalSetoran;
      });

    // Assign rank numbers
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [selectedGrade, activeStudentsList, capaianZiyadah, setoran, isSiswa, currentUser]);

  // Helper for flexible name matching
  const isNameMatch = (n1: string, n2: string): boolean => {
    const s1 = (n1 || '').toLowerCase().trim();
    const s2 = (n2 || '').toLowerCase().trim();
    if (!s1 || !s2) return false;
    if (s1 === s2) return true;
    if (s1.includes(s2) || s2.includes(s1)) return true;
    const w1 = s1.split(/\s+/).filter(w => w.length > 2);
    const w2 = s2.split(/\s+/).filter(w => w.length > 2);
    return w1.some(w => w2.includes(w));
  };

  // Find logged in student's rank
  const myRank = useMemo(() => {
    if (!isSiswa) return null;
    return classLeaderboard.find((item) => isNameMatch(item.nama, currentUser.nama)) || null;
  }, [classLeaderboard, currentUser, isSiswa]);

  // Filtered leaderboard for ustadz/admin search
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return classLeaderboard;
    const q = searchQuery.toLowerCase();
    return classLeaderboard.filter((item) => item.nama.toLowerCase().includes(q));
  }, [classLeaderboard, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#0000FE] text-white p-6 relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <Trophy className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                Peringkat Hafalan Santri
                <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Per Kelas
                </span>
              </h2>
              <p className="text-blue-100 text-xs font-medium mt-0.5">
                {isSiswa
                  ? `Hasil peringkat prestasi Anda di Kelas ${currentUser.grade || selectedGrade}`
                  : `Papan peringkat capaian hafalan santri berdasarkan kelas`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* SISWA VIEW: ONLY SHOW HIS/HER OWN RANKING */}
          {isSiswa ? (
            <div className="space-y-6">
              {myRank ? (
                <div className="bg-linear-to-br from-blue-50 via-white to-amber-50/40 rounded-3xl p-8 border border-blue-100 shadow-sm text-center relative overflow-hidden space-y-4">
                  <div className="inline-flex p-4 bg-amber-400/20 text-amber-600 rounded-full border border-amber-300/50 mb-1">
                    {myRank.rank === 1 ? (
                      <Crown className="w-12 h-12 text-amber-500 animate-bounce" />
                    ) : myRank.rank <= 3 ? (
                      <Trophy className="w-12 h-12 text-amber-500" />
                    ) : (
                      <Award className="w-12 h-12 text-[#0000FE]" />
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      Peringkat Anda di Kelas {currentUser.grade || selectedGrade}
                    </span>
                    <h3 className="text-4xl font-black text-slate-900 mt-1 flex items-center justify-center gap-1">
                      <span className="text-[#0000FE]">#{myRank.rank}</span>
                      <span className="text-sm text-slate-400 font-bold font-sans">
                        dari {classLeaderboard.length} santri
                      </span>
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 max-w-sm mx-auto grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Capaian</span>
                      <span className="text-base font-black text-blue-700">{myRank.totalBaris} Baris</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Setoran</span>
                      <span className="text-base font-black text-emerald-700">{myRank.totalSetoran} Kali</span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-blue-900 pt-2 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Maa Syaa Allah! Terus tingkatkan muraja'ah dan ziyadah hafalanmu!</span>
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-200 text-center">
                  <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Data peringkat Anda belum tersedia untuk kelas ini.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Silakan lakukan setoran ziyadah pertama Anda untuk masuk ke sistem peringkat kelas.</p>
                </div>
              )}
            </div>
          ) : (
            /* USTADZ / ADMIN VIEW: SELECT CLASS & FULL LEADERBOARD */
            <div className="space-y-5">
              {/* Controls Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-extrabold text-slate-600 uppercase shrink-0">Pilih Kelas:</span>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0000FE]"
                  >
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>
                        Kelas {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative w-full sm:w-60">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari santri..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0000FE]"
                  />
                </div>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-4">
                  <span>Santri & Peringkat</span>
                  <span>Capaian Ziyadah</span>
                </div>

                {filteredLeaderboard.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-2xl text-center border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-500">Tidak ada santri ditemukan untuk kelas ini.</p>
                  </div>
                ) : (
                  filteredLeaderboard.map((item) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                          isTop1
                            ? 'bg-amber-50/60 border-amber-200 shadow-2xs'
                            : isTop2
                            ? 'bg-slate-50 border-slate-200'
                            : isTop3
                            ? 'bg-amber-50/30 border-amber-100'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Rank badge */}
                          <div
                            className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                              isTop1
                                ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-2xs'
                                : isTop2
                                ? 'bg-slate-200 text-slate-800 border-slate-300'
                                : isTop3
                                ? 'bg-amber-200 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            #{item.rank}
                          </div>

                          <div>
                            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                              {item.nama}
                              {isTop1 && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Total Setoran: {item.totalSetoran} kali
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#0000FE] block">
                            {item.totalBaris} Baris
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            Capaian Ziyadah
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
