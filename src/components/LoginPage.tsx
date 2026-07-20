import React, { useState, useEffect } from 'react';
import { KeyRound, User, Eye, EyeOff, AlertCircle, Sparkles, Loader2, BookOpen, ShieldCheck } from 'lucide-react';
import { UserAccount, UserSession } from '../types';
import { DEMO_AKUN } from '../data';
import { AlWildanLogo } from './AlWildanLogo';
// @ts-ignore
import alWildanBuilding from '../assets/al_wildan_building.jpg';

interface LoginPageProps {
  appsScriptUrl: string | null;
  usingDemoData: boolean;
  onLoginSuccess: (session: UserSession) => void;
  customLogo?: string;
}

export function LoginPage({ appsScriptUrl, usingDemoData, onLoginSuccess, customLogo }: LoginPageProps) {
  const [idInput, setIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [accounts, setAccounts] = useState<UserAccount[]>(DEMO_AKUN);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);

  // Fetch accounts from live Sheets if available
  useEffect(() => {
    const fetchAccounts = async () => {
      if (usingDemoData || !appsScriptUrl) {
        setAccounts(DEMO_AKUN);
        return;
      }

      setIsFetchingAccounts(true);
      try {
        // Try to fetch from the Google Apps Script Web App
        const response = await fetch(`${appsScriptUrl}?tab=akun`, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const res = await response.json();
          if (res && res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
            setAccounts(res.data);
            console.log('Loaded accounts from Google Sheets:', res.data.length);
          } else {
            console.warn('Apps Script returned no accounts or empty data, falling back to local demo accounts');
            setAccounts(DEMO_AKUN);
          }
        } else {
          setAccounts(DEMO_AKUN);
        }
      } catch (err) {
        console.error('Failed to fetch accounts from sheet, falling back to local accounts:', err);
        setAccounts(DEMO_AKUN);
      } finally {
        setIsFetchingAccounts(false);
      }
    };

    fetchAccounts();
  }, [appsScriptUrl, usingDemoData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!idInput.trim()) {
      setErrorMsg('Silakan masukkan ID Pengguna.');
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMsg('Silakan masukkan Password.');
      return;
    }

    setIsLoading(true);

    // Simulate small delay for natural UX
    setTimeout(() => {
      const enteredId = idInput.trim().toLowerCase();
      const enteredPass = passwordInput.trim();

      // Find account
      const matchedAccount = accounts.find(
        (acc) => (acc.id || '').toLowerCase() === enteredId && acc.password === enteredPass
      );

      // Fallback matching to DEMO_AKUN if live didn't find and we are in online mode but user wanted to login with demo
      const account = matchedAccount || DEMO_AKUN.find(
        (acc) => (acc.id || '').toLowerCase() === enteredId && acc.password === enteredPass
      );

      if (account) {
        // Determine role based on name or ID
        const namaLower = (account.nama || '').toLowerCase();
        let finalRole: 'admin' | 'ustadz' | 'siswa' = 'siswa';
        if (namaLower.includes('admin')) {
          finalRole = 'admin';
        } else if (namaLower.includes('ustadz')) {
          finalRole = 'ustadz';
        } else if (enteredId.includes('ustadz')) {
          finalRole = 'ustadz';
        }

        const session: UserSession = {
          id: account.id,
          nama: account.nama, // "namaa" column
          role: finalRole,
        };

        setIsLoading(false);
        onLoginSuccess(session);
      } else {
        setIsLoading(false);
        setErrorMsg('ID Pengguna atau Password salah. Silakan coba lagi.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden text-slate-800">
      
      {/* LEFT SIDE: School Photo Backdrop (Visible on lg/xl screen sizes) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0000FE] items-center justify-center overflow-hidden">
        {/* Full bleed school building image */}
        <img 
          src={alWildanBuilding} 
          alt="Al-Wildan School Building" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25 transform hover:scale-105 transition-transform duration-10000 ease-out"
        />
        
        {/* Sleek Gradient Overlay for maximum readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-[#0000FE]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-[#0000FE]/35 mix-blend-multiply"></div>
        
        {/* Floating welcome message */}
        <div className="relative z-10 p-12 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-md text-white">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Tahfizh Recap Online System</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
            AL-WILDAN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
              INTERNATIONAL ISLAMIC SCHOOL 10
            </span>
          </h1>

          <p className="text-sm text-blue-100 leading-relaxed">
            Selamat datang di sistem rekapitulasi hafalan Quran terintegrasi. Membantu orang tua siswa memantau progres hafalan putra-putri secara akurat, dinamis, dan berkala.
          </p>

          <div className="pt-4 flex items-center gap-6 border-t border-white/20 text-xs text-blue-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span>Sistem Terenkripsi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-white" />
              <span>Kurikulum Internasional</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE / MAIN CONTENT: Pure modern login panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 relative bg-white">
        
        {/* Subtle decorative layout gradients (for mobile fallback style) */}
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none lg:hidden"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none lg:hidden"></div>
        
        {/* Underlay of the photo building on mobile/tablet for atmospheric backdrop */}
        <div className="absolute inset-0 bg-slate-100 opacity-20 mix-blend-overlay pointer-events-none lg:hidden">
          <img src={alWildanBuilding} alt="back" className="w-full h-full object-cover" />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          {/* Circular Al-Wildan Logo Recreated Vectorially */}
          <div className="flex justify-center transition-all duration-300 transform hover:scale-105">
            <AlWildanLogo size={140} customUrl={customLogo} className="filter drop-shadow-[0_8px_16px_rgba(0,0,254,0.08)]" />
          </div>
          
          <h2 className="mt-5 text-center text-2xl font-black tracking-tight text-slate-900 flex flex-col items-center gap-0.5">
            <span className="text-[#0000FE] text-xs font-black tracking-widest uppercase">PORTAL AKADEMIK</span>
            <span className="text-[#0000FE] font-black text-2xl tracking-wide uppercase">
              TAHFIZH RECAP SYSTEM
            </span>
          </h2>
          
          <p className="mt-2 text-xs font-semibold text-slate-500 max-w-xs mx-auto lg:hidden">
            Al-Wildan International Islamic School 10 Jakarta
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="bg-white border border-slate-200/80 py-8 px-6 shadow-xl shadow-blue-900/5 rounded-[32px] space-y-6 sm:px-10">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-950 tracking-wide">Masuk ke Sistem</h3>
              <p className="text-xs text-slate-500 mt-0.5">Silakan masukkan kredensial yang terdaftar di lembar Akun</p>
            </div>

            {errorMsg && (
              <div id="login-error-alert" className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              {/* ID Input */}
              <div className="space-y-1.5">
                <label htmlFor="user-id-input" className="block text-xs font-bold text-slate-500 tracking-wider uppercase">
                  ID Pengguna (Siswa / Ustadz)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="user-id-input"
                    name="userId"
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: ustadz1 atau student_kean"
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] focus:bg-white transition-all font-sans font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="password-input" className="block text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Kata Sandi (Password)
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi Anda"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0000FE] focus:bg-white transition-all font-sans font-medium"
                  />
                  <button
                    type="button"
                    id="btn-toggle-password-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Show Password Checkbox */}
              <div className="flex items-center">
                <input
                  id="checkbox-show-password"
                  name="show-password-cb"
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4 text-[#0000FE] focus:ring-[#0000FE]/20 border-slate-300 bg-slate-50 rounded cursor-pointer"
                />
                <label htmlFor="checkbox-show-password" className="ml-2 block text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer select-none transition-colors">
                  Perlihatkan password
                </label>
              </div>

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  id="btn-submit-login"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold uppercase tracking-wider text-white bg-[#0000FE] hover:bg-blue-700 active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#0000FE] transition-all disabled:opacity-75 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Memeriksa Kredensial...
                    </span>
                  ) : (
                    'Masuk Aplikasi'
                  )}
                </button>
              </div>
            </form>

            {/* Account Source Indicator */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-4">
              <span>Mode Sumber Data Akun:</span>
              {isFetchingAccounts ? (
                <span className="flex items-center gap-1 text-[#0000FE]">
                  <Loader2 className="w-3 h-3 animate-spin" /> Menghubungkan...
                </span>
              ) : usingDemoData ? (
                <span className="font-bold text-amber-700 bg-amber-50 border border-amber-150 px-2.5 py-0.5 rounded-full">
                  Akun Demo Lokal
                </span>
              ) : (
                <span className="font-bold text-blue-700 bg-blue-50 border border-blue-150 px-2.5 py-0.5 rounded-full">
                  Akun Google Sheets
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

