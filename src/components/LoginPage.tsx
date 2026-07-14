import React, { useState, useEffect } from 'react';
import { KeyRound, User, Eye, EyeOff, BookOpen, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { UserAccount, UserSession } from '../types';
import { DEMO_AKUN } from '../data';

interface LoginPageProps {
  appsScriptUrl: string | null;
  usingDemoData: boolean;
  onLoginSuccess: (session: UserSession) => void;
}

export function LoginPage({ appsScriptUrl, usingDemoData, onLoginSuccess }: LoginPageProps) {
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
        (acc) => acc.id.toLowerCase() === enteredId && acc.password === enteredPass
      );

      // Fallback matching to DEMO_AKUN if live didn't find and we are in online mode but user wanted to login with demo
      const account = matchedAccount || DEMO_AKUN.find(
        (acc) => acc.id.toLowerCase() === enteredId && acc.password === enteredPass
      );

      if (account) {
        // Determine role based on ID containing "ustadz" (case-insensitive)
        const isUstadz = enteredId.includes('ustadz');
        const session: UserSession = {
          id: account.id,
          nama: account.nama, // "namaa" column
          role: isUstadz ? 'ustadz' : 'siswa',
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-emerald-600 p-3 rounded-3xl shadow-md text-white flex items-center justify-center">
            <BookOpen className="w-10 h-10 animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-emerald-600" /> Ahlan wa Sahlan Abu/Ummu..
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-500 font-medium">
          Tahfizh Recap Online. Terupadate. Tersistematis. Terbaik di Indonesia
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-100 rounded-3xl space-y-6 sm:px-10">
          <div className="border-b border-slate-150 pb-4">
            <h3 className="text-lg font-bold text-slate-700">Masuk ke Sistem</h3>
            <p className="text-xs text-slate-400">Silakan masukkan kredensial yang terdaftar di lembar Akun</p>
          </div>

          {errorMsg && (
            <div id="login-error-alert" className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-medium animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* ID Input */}
            <div className="space-y-1.5">
              <label htmlFor="user-id-input" className="block text-xs font-bold text-slate-600">
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
                  className="block w-full pl-10 pr-3 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-800 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password-input" className="block text-xs font-bold text-slate-600">
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
                  className="block w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-800 transition-all font-sans"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Show Password Checkbox (As requested: "terakhir dibawah kolom password pada halaman login sediakan ceklist box perlihatkan password agar memudahkan pengetikan password") */}
            <div className="flex items-center">
              <input
                id="checkbox-show-password"
                name="show-password-cb"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="checkbox-show-password" className="ml-2 block text-xs font-medium text-slate-500 cursor-pointer select-none">
                Perlihatkan password
              </label>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                id="btn-submit-login"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa Kredensial...
                  </span>
                ) : (
                  'Masuk Aplikasi'
                )}
              </button>
            </div>
          </form>

          {/* Account Source Indicator */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            <span>Mode Sumber Data Akun:</span>
            {isFetchingAccounts ? (
              <span className="flex items-center gap-1 text-amber-500">
                <Loader2 className="w-3 h-3 animate-spin" /> Menghubungkan...
              </span>
            ) : usingDemoData ? (
              <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                Akun Demo Lokal
              </span>
            ) : (
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Akun Google Sheets (Tab Akun)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
