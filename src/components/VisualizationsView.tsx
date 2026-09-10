import React, { useState, useMemo } from 'react';
import {
  BarChart,
  LineChart as LineChartIcon,
  PieChart,
  Activity,
  Maximize2,
  Sliders,
  Sparkles
} from 'lucide-react';
import { DataRow, DatasetOverview } from '../types/dataPilot';

interface VisualizationsViewProps {
  data: DataRow[] | null;
  overview: DatasetOverview | null;
}

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({
  data,
  overview
}) => {
  const [activeTab, setActiveTab] = useState<'automated' | 'custom'>('automated');

  // Automated tab selections
  const [selectedNum, setSelectedNum] = useState<string>(overview?.numericalCols[0] || '');
  const [selectedCat, setSelectedCat] = useState<string>(overview?.categoricalCols[0] || '');

  // Custom Studio selections
  const [customType, setCustomType] = useState<'bar' | 'scatter' | 'histogram' | 'box' | 'line'>('bar');
  const [customX, setCustomX] = useState<string>(overview?.categoricalCols[0] || overview?.numericalCols[0] || '');
  const [customY, setCustomY] = useState<string>(overview?.numericalCols[0] || '');
  const [customHue, setCustomHue] = useState<string>('none');

  if (!data || !overview || data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Please upload or select a dataset first to generate interactive visualizations.
      </div>
    );
  }

  const numCols = overview.numericalCols;
  const catCols = overview.categoricalCols;
  const dateCols = overview.dateCols;

  // 1. Histogram data calculation
  const histogramData = useMemo(() => {
    const col = activeTab === 'automated' ? selectedNum : customX;
    if (!col) return [];

    const vals = data
      .map((r) => Number(r[col]))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);

    if (vals.length === 0) return [];

    const min = vals[0];
    const max = vals[vals.length - 1];
    const nBins = 10;
    const binWidth = (max - min) / nBins || 1;

    const bins = Array.from({ length: nBins }, (_, i) => ({
      binStart: min + i * binWidth,
      binEnd: min + (i + 1) * binWidth,
      count: 0
    }));

    vals.forEach((v) => {
      let bIdx = Math.floor((v - min) / binWidth);
      if (bIdx >= nBins) bIdx = nBins - 1;
      bins[bIdx].count++;
    });

    return bins;
  }, [data, selectedNum, customX, activeTab]);

  // 2. Bar Chart / Categorical data calculation
  const barChartData = useMemo(() => {
    const col = activeTab === 'automated' ? selectedCat : customX;
    const yCol = activeTab === 'automated' ? null : customY;
    if (!col) return [];

    const counts: Record<string, { sum: number; count: number }> = {};
    data.forEach((r) => {
      const cat = String(r[col] ?? 'N/A');
      const yVal = yCol ? Number(r[yCol]) || 0 : 1;

      if (!counts[cat]) counts[cat] = { sum: 0, count: 0 };
      counts[cat].sum += yVal;
      counts[cat].count += 1;
    });

    return Object.entries(counts)
      .map(([cat, val]) => ({
        category: cat,
        value: yCol ? Math.round(val.sum / Math.max(1, val.count)) : val.count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data, selectedCat, customX, customY, activeTab]);

  // 3. Scatter Plot points calculation
  const scatterPoints = useMemo(() => {
    if (!customX || !customY) return [];

    return data
      .map((r) => {
        const x = Number(r[customX]);
        const y = Number(r[customY]);
        const hue = customHue !== 'none' ? String(r[customHue] ?? '') : undefined;
        if (isNaN(x) || isNaN(y)) return null;
        return { x, y, hue };
      })
      .filter((p): p is { x: number; y: number; hue?: string } => p !== null);
  }, [data, customX, customY, customHue]);

  // Max value helper for bar chart scaling
  const maxBarVal = Math.max(...barChartData.map((d) => d.value), 1);
  const maxHistVal = Math.max(...histogramData.map((d) => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📈</span> Automated & Interactive Visualizations
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamic distribution histograms, category frequency bars, and custom cross-feature plotting.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('automated')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'automated'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ⚡ Automated Charts
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'custom'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🎨 Custom Studio Builder
        </button>
      </div>

      {/* Automated Tab */}
      {activeTab === 'automated' && (
        <div className="space-y-8">
          {/* Numerical Section */}
          {numCols.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Numerical Distribution (Histogram)</h3>
                  <p className="text-xs text-slate-400">Frequency distribution across 10 uniform intervals</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Feature:</span>
                  <select
                    value={selectedNum}
                    onChange={(e) => setSelectedNum(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-blue-500"
                  >
                    {numCols.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SVG Histogram */}
              <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 border-b border-l border-slate-200 px-4">
                {histogramData.map((bin, i) => {
                  const heightPct = Math.round((bin.count / maxHistVal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-20">
                        {bin.binStart.toFixed(1)}–{bin.binEnd.toFixed(1)}: {bin.count} items
                      </div>
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                      />
                      <span className="text-[9px] text-slate-400 mt-2 font-mono truncate w-full text-center">
                        {bin.binStart.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Categorical Section */}
          {catCols.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Categorical Frequency (Bar Chart)</h3>
                  <p className="text-xs text-slate-400">Total occurrences by category</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Category:</span>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:ring-blue-500"
                  >
                    {catCols.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizontal Bar visualization */}
              <div className="space-y-3">
                {barChartData.map((d, i) => {
                  const widthPct = Math.round((d.value / maxBarVal) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800 truncate max-w-xs">{d.category}</span>
                        <span className="text-slate-500 font-mono font-bold">{d.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.max(3, widthPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Studio Builder */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Chart Type</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as any)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="bar">Bar Chart</option>
                <option value="scatter">Scatter Plot</option>
                <option value="histogram">Histogram</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">X-Axis</label>
              <select
                value={customX}
                onChange={(e) => setCustomX(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              >
                {overview.columns > 0 &&
                  Object.keys(data[0]).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Y-Axis (Aggregation)</label>
              <select
                value={customY}
                onChange={(e) => setCustomY(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="">(Count of records)</option>
                {numCols.map((c) => (
                  <option key={c} value={c}>{c} (Average)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Color / Group By</label>
              <select
                value={customHue}
                onChange={(e) => setCustomHue(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="none">None</option>
                {catCols.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Render Custom Chart Output */}
          <div className="pt-2">
            {customType === 'scatter' ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase">
                  Scatter Plot: {customY || 'Count'} vs {customX}
                </h4>
                {scatterPoints.length > 0 ? (
                  <div className="h-72 w-full border border-slate-200 rounded-xl p-4 bg-slate-50/40 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 250">
                      {/* Gridlines */}
                      <line x1="40" y1="20" x2="40" y2="220" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="40" y1="220" x2="480" y2="220" stroke="#cbd5e1" strokeWidth="1" />

                      {/* Points */}
                      {(() => {
                        const minX = Math.min(...scatterPoints.map((p) => p.x));
                        const maxX = Math.max(...scatterPoints.map((p) => p.x)) || 1;
                        const minY = Math.min(...scatterPoints.map((p) => p.y));
                        const maxY = Math.max(...scatterPoints.map((p) => p.y)) || 1;

                        return scatterPoints.slice(0, 150).map((pt, idx) => {
                          const px = 50 + ((pt.x - minX) / (maxX - minX || 1)) * 410;
                          const py = 210 - ((pt.y - minY) / (maxY - minY || 1)) * 180;
                          return (
                            <circle
                              key={idx}
                              cx={px}
                              cy={py}
                              r="4.5"
                              className="fill-blue-600 hover:fill-amber-500 opacity-75 transition"
                            />
                          );
                        });
                      })()}
                    </svg>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Ensure both X and Y axes are numerical.</p>
                )}
              </div>
            ) : customType === 'histogram' ? (
              <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 border-b border-l border-slate-200 px-4">
                {histogramData.map((bin, i) => {
                  const heightPct = Math.round((bin.count / maxHistVal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                      <div
                        className="w-full bg-blue-600 rounded-t transition-all"
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                      />
                      <span className="text-[9px] text-slate-400 mt-2 font-mono truncate w-full text-center">
                        {bin.binStart.toFixed(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {barChartData.map((d, i) => {
                  const widthPct = Math.round((d.value / maxBarVal) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-800">{d.category}</span>
                        <span className="text-slate-500 font-mono font-bold">{d.value.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.max(3, widthPct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
