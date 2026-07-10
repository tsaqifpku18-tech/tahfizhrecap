import React, { useState } from 'react';
import { Database, Copy, CheckCircle2, AlertCircle, Info, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Settings } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE, APPS_SCRIPT_INSTRUCTIONS } from '../data';

interface AppsScriptSettingsProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
  onTestConnection: () => Promise<void>;
  onUseDemoData: () => void;
  usingDemoData: boolean;
}

export const AppsScriptSettings: React.FC<AppsScriptSettingsProps> = ({
  settings,
  onSaveSettings,
  connectionStatus,
  errorMessage,
  onTestConnection,
  onUseDemoData,
  usingDemoData,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instructions' | 'code'>('instructions');

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div id="app-script-settings" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Hubungkan Google Sheets</h2>
            <p className="text-xs text-slate-500">Gunakan Google Apps Script sebagai API Real-time Anda</p>
          </div>
        </div>

        <div>
          {usingDemoData ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
              <Info className="w-3.5 h-3.5 mr-1" /> Mode Demo Aktif
            </span>
          ) : connectionStatus === 'connected' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Terhubung Ke Sheets
            </span>
          ) : connectionStatus === 'error' ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Koneksi Gagal
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              Belum Terhubung
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Link Web App Google Apps Script (Dikelola oleh Developer)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="apps-script-url-input"
                type="url"
                readOnly
                className="w-full pl-3 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-mono cursor-not-allowed outline-none"
                value={settings.appsScriptUrl}
              />
            </div>
            <button
              id="btn-test-connection"
              type="button"
              onClick={() => onTestConnection()}
              disabled={connectionStatus === 'connecting'}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm flex items-center justify-center gap-2 disabled:bg-emerald-400"
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Menghubungkan...
                </>
              ) : (
                'Tes Koneksi'
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            🔒 Konfigurasi URL Google Apps Script telah dikunci oleh developer agar sistem selalu terhubung dengan database utama yang aman.
          </p>
          {errorMessage && (
            <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMessage}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          {!usingDemoData && (
            <button
              id="btn-use-demo-data"
              type="button"
              onClick={onUseDemoData}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline transition-colors"
            >
              Gunakan Data Demo (Offline)
            </button>
          )}
          {usingDemoData && settings.appsScriptUrl && (
            <button
              id="btn-switch-live"
              type="button"
              onClick={() => onTestConnection()}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 underline transition-colors"
            >
              Coba Hubungkan Ulang Live Data
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Guide and Script Code */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
        <div className="flex border-b border-slate-200 bg-slate-100/80">
          <button
            id="tab-setup-instructions"
            type="button"
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
              activeTab === 'instructions'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('instructions')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> 1. Cara Setup Sheet
            </span>
          </button>
          <button
            id="tab-apps-script-code"
            type="button"
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center transition-colors ${
              activeTab === 'code'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setActiveTab('code')}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Copy className="w-3.5 h-3.5" /> 2. Kode Apps Script
            </span>
          </button>
        </div>

        <div className="p-5 max-h-80 overflow-y-auto text-slate-600">
          {activeTab === 'instructions' ? (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg flex items-start gap-2 border border-emerald-100">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Aplikasi ini berjalan penuh di browser Anda. Dengan memasukkan tautan Apps Script Google Sheet, Anda dapat membaca dan menambahkan data penilaian secara langsung secara real-time!
                </p>
              </div>
              <div className="prose prose-xs max-w-none text-slate-600 space-y-3">
                {APPS_SCRIPT_INSTRUCTIONS.split('\n').map((line, index) => {
                  if (line.startsWith('###')) {
                    return (
                      <h4 key={index} className="text-xs font-bold text-slate-800 uppercase mt-4 first:mt-0">
                        {line.replace('###', '').trim()}
                      </h4>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    const match = line.match(/^(\d+\.)(.*)/);
                    if (match) {
                      return (
                        <div key={index} className="pl-1 flex gap-2">
                          <span className="font-bold text-emerald-600 shrink-0">{match[1]}</span>
                          <span dangerouslySetInnerHTML={{ __html: match[2].replace(/`([^`]+)`/g, '<code class="bg-slate-200 px-1 rounded text-emerald-700 font-mono text-[10px]">$1</code>') }} />
                        </div>
                      );
                    }
                  }
                  return <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/`([^`]+)`/g, '<code class="bg-slate-200 px-1 rounded text-emerald-700 font-mono text-[10px]">$1</code>') }} />;
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-200 p-2 rounded-lg">
                <span className="text-[10px] font-mono text-slate-500">Code: Code.gs</span>
                <button
                  id="btn-copy-script-code"
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded shadow-xs transition-colors"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Salin Kode GS
                    </>
                  )}
                </button>
              </div>
              <pre className="text-[10px] font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto leading-normal">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
