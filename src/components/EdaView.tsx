import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  NumericalMetric,
  CategoricalMetric,
  CorrelationAnalysis,
  DatasetOverview
} from '../types/dataPilot';

interface EdaViewProps {
  overview: DatasetOverview | null;
  numMetrics: NumericalMetric[];
  catMetrics: CategoricalMetric[];
  corrAnalysis: CorrelationAnalysis;
}

export const EdaView: React.FC<EdaViewProps> = ({
  overview,
  numMetrics,
  catMetrics,
  corrAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'numerical' | 'categorical' | 'correlation'>('numerical');

  if (!overview) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Please upload or select a dataset first to view Exploratory Data Analysis.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📊</span> Exploratory Data Analysis (EDA)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Comprehensive descriptive statistics, frequency tables, and statistical correlation matrix.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('numerical')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'numerical'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          1. Numerical Statistics ({numMetrics.length})
        </button>
        <button
          onClick={() => setActiveTab('categorical')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'categorical'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Categorical Frequencies ({catMetrics.length})
        </button>
        <button
          onClick={() => setActiveTab('correlation')}
          className={`pb-3 px-4 text-xs font-bold transition border-b-2 ${
            activeTab === 'correlation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Correlation Heatmap
        </button>
      </div>

      {/* 1. Numerical Statistics Table */}
      {activeTab === 'numerical' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Descriptive Statistical Parameters
              </span>
              <span className="text-xs text-slate-400">Calculated across valid non-null rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3 text-right">Count</th>
                    <th className="py-2.5 px-3 text-right">Mean</th>
                    <th className="py-2.5 px-3 text-right">Std Dev</th>
                    <th className="py-2.5 px-3 text-right">Min</th>
                    <th className="py-2.5 px-3 text-right">25% (Q1)</th>
                    <th className="py-2.5 px-3 text-right">Median (Q2)</th>
                    <th className="py-2.5 px-3 text-right">75% (Q3)</th>
                    <th className="py-2.5 px-3 text-right">Max</th>
                    <th className="py-2.5 px-3 text-right">IQR</th>
                    <th className="py-2.5 px-3 text-right">Skewness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {numMetrics.map((row) => (
                    <tr key={row.feature} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{row.feature}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">{row.count}</td>
                      <td className="py-2.5 px-3 text-right text-slate-800 font-bold">{row.mean}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.stdDev}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.min}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.q25}</td>
                      <td className="py-2.5 px-3 text-right text-blue-600 font-semibold">{row.median}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.q75}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.max}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{row.iqr}</td>
                      <td className={`py-2.5 px-3 text-right ${Math.abs(row.skewness) > 1 ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                        {row.skewness}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Categorical Frequencies */}
      {activeTab === 'categorical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catMetrics.map((cat) => (
            <div key={cat.column} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{cat.column}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {cat.uniqueCount} unique categories &bull; Mode: <span className="font-semibold text-slate-700">'{cat.mostFrequent}'</span>
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {cat.frequency} hits
                </span>
              </div>

              <div className="space-y-2.5">
                {cat.topCategories.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.category}</span>
                      <span className="text-slate-500 font-mono">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Statistical Correlation Analysis */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          {/* Heatmap Matrix */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm overflow-x-auto space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pearson Correlation Matrix (r)
            </h4>
            <div className="min-w-[600px]">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-400 font-medium"></th>
                    {corrAnalysis.features.map((f) => (
                      <th key={f} className="p-2 font-semibold text-slate-700 max-w-[90px] truncate" title={f}>
                        {f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corrAnalysis.features.map((fRow, rIdx) => (
                    <tr key={fRow} className="border-t border-slate-100">
                      <td className="p-2 text-left font-medium text-slate-800 whitespace-nowrap">{fRow}</td>
                      {corrAnalysis.matrix[rIdx]?.map((val, cIdx) => {
                        // Correlation color scale
                        let bgClass = 'bg-slate-50 text-slate-700';
                        if (val >= 0.8) bgClass = 'bg-blue-600 text-white font-bold';
                        else if (val >= 0.5) bgClass = 'bg-blue-400 text-white font-semibold';
                        else if (val >= 0.2) bgClass = 'bg-blue-100 text-blue-900';
                        else if (val <= -0.5) bgClass = 'bg-rose-500 text-white font-semibold';
                        else if (val <= -0.2) bgClass = 'bg-rose-100 text-rose-900';

                        return (
                          <td key={cIdx} className="p-2 font-mono">
                            <span className={`inline-block w-12 py-1 rounded text-center text-[11px] ${bgClass}`}>
                              {val.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Strong Positive Correlations (r ≥ 0.60)
                </h4>
              </div>

              {corrAnalysis.strongPositive.length > 0 ? (
                <ul className="space-y-2 text-xs divide-y divide-slate-100">
                  {corrAnalysis.strongPositive.map((pair, idx) => (
                    <li key={idx} className="pt-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {pair.feature1} &bull; {pair.feature2}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        r = +{pair.correlation} ({pair.strength})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No strong positive correlations found.</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Strong Negative Correlations (r ≤ -0.60)
                </h4>
              </div>

              {corrAnalysis.strongNegative.length > 0 ? (
                <ul className="space-y-2 text-xs divide-y divide-slate-100">
                  {corrAnalysis.strongNegative.map((pair, idx) => (
                    <li key={idx} className="pt-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {pair.feature1} &bull; {pair.feature2}
                      </span>
                      <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        r = {pair.correlation} ({pair.strength})
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No strong negative correlations found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
