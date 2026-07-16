import React from 'react';
import { BookOpen, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { Setoran } from '../types';

interface StatsChartsProps {
  data: Setoran[];
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ data }) => {
  // 1. Calculate Kegiatan (Tahsin, Ziyadah, Murojaah)
  const total = data.length;
  const tahsinCount = data.filter((x) => (x.kegiatan || '').toLowerCase().includes('tahsin')).length;
  const ziyadahCount = data.filter((x) => (x.kegiatan || '').toLowerCase().includes('ziyadah')).length;
  const murojaahCount = data.filter((x) => (x.kegiatan || '').toLowerCase().includes('murojaah')).length;

  const tahsinPct = total > 0 ? Math.round((tahsinCount / total) * 100) : 0;
  const ziyadahPct = total > 0 ? Math.round((ziyadahCount / total) * 100) : 0;
  const murojaahPct = total > 0 ? Math.round((murojaahCount / total) * 100) : 0;

  // 2. Calculate Status (Boleh Lanjut vs Ulangi)
  const lanjutCount = data.filter((x) => (x.status || '').toLowerCase().includes('lanjut')).length;
  const ulangiCount = data.filter((x) => (x.status || '').toLowerCase().includes('ulangi')).length;

  const lanjutPct = total > 0 ? Math.round((lanjutCount / total) * 100) : 0;
  const ulangiPct = total > 0 ? Math.round((ulangiCount / total) * 100) : 0;

  // 3. Weekly Trend (Aggregate submissions by date for the last 7 distinct dates)
  const dateMap: { [key: string]: number } = {};
  data.forEach((x) => {
    const d = x.tanggalSetoran;
    if (d) {
      dateMap[d] = (dateMap[d] || 0) + 1;
    }
  });

  const sortedDates = Object.keys(dateMap).sort().slice(-7);
  const trendData = sortedDates.map((date) => ({
    date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    count: dateMap[date],
  }));

  // Render SVG Area Chart coordinates
  const chartHeight = 120;
  const chartWidth = 500;
  const paddingX = 40;
  const paddingY = 20;

  const maxCount = trendData.length > 0 ? Math.max(...trendData.map((d) => d.count), 1) : 4;
  const maxYValue = maxCount + 1; // leave room above

  const points = trendData.map((d, index) => {
    const x = paddingX + (index * (chartWidth - paddingX * 2)) / (trendData.length - 1 || 1);
    const y = chartHeight - paddingY - (d.count * (chartHeight - paddingY * 2)) / maxYValue;
    return { x, y, label: d.date, value: d.count };
  });

  // Create SVG path strings
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div id="stats-charts-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Weekly Submission Area Chart */}
      <div id="chart-weekly-trend" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0000FE]" /> Statistik Mingguan
            </h3>
            <p className="text-xs text-slate-500">Frekuensi setoran harian (7 sesi aktif terakhir)</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5" /> Berdasarkan Tanggal
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400 italic">
            Belum ada data setoran terkini
          </div>
        ) : (
          <div className="relative">
            {/* Custom Responsive SVG Chart */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0000FE" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0000FE" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.5, 1].map((r, i) => {
                const y = paddingY + r * (chartHeight - paddingY * 2);
                const countVal = Math.round(maxYValue * (1 - r));
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      textAnchor="end"
                    >
                      {countVal}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              {areaPath && <path d={areaPath} fill="url(#chart-glow)" />}

              {/* Smooth Trend Line */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#0000FE"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Circles & Labels */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  {/* Vertical dotted help lines */}
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2={chartHeight - paddingY}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  {/* Point circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#0000FE"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="transition-all duration-200 group-hover:r-6"
                  />
                  {/* Tooltip text showing value on top */}
                  <text
                    x={p.x}
                    y={p.y - 8}
                    fill="#0f172a"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 py-0.5"
                  >
                    {p.value}x
                  </text>
                  {/* X axis labels */}
                  <text
                    x={p.x}
                    y={chartHeight - 4}
                    fill="#64748b"
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="middle"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* 2. Comparative Assessment breakdowns (Kegiatan & Status) */}
      <div id="chart-assessments-breakdown" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        
        {/* 2A. Kegiatan Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" /> Distribusi Kegiatan
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Tahsin ({tahsinCount} setoran)</span>
              <span className="text-blue-600">{tahsinPct}%</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Ziyadah ({ziyadahCount} setoran)</span>
              <span className="text-indigo-600">{ziyadahPct}%</span>
            </div>
            {murojaahCount > 0 && (
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-500">Murojaah ({murojaahCount} setoran)</span>
                <span className="text-amber-600">{murojaahPct}%</span>
              </div>
            )}
            
            {/* Split Bar Chart */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${tahsinPct}%` }}
                title={`Tahsin: ${tahsinPct}%`}
              ></div>
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${ziyadahPct}%` }}
                title={`Ziyadah: ${ziyadahPct}%`}
              ></div>
              <div
                className="bg-amber-500 h-full transition-all duration-500"
                style={{ width: `${murojaahPct}%` }}
                title={`Murojaah: ${murojaahPct}%`}
              ></div>
            </div>
          </div>
        </div>

        {/* 2B. Status: Boleh Lanjut vs Ulangi */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0000FE]" /> Hasil Evaluasi
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Boleh Lanjut ({lanjutCount} setoran)</span>
              <span className="text-[#0000FE]">{lanjutPct}%</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-500">Ulangi ({ulangiCount} setoran)</span>
              <span className="text-rose-600">{ulangiPct}%</span>
            </div>
            
            {/* Split Bar Chart */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-[#0000FE] h-full transition-all duration-500"
                style={{ width: `${lanjutPct}%` }}
                title={`Boleh Lanjut: ${lanjutPct}%`}
              ></div>
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${ulangiPct}%` }}
                title={`Ulangi: ${ulangiPct}%`}
              ></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
