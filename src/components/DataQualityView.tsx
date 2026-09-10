import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Trash2,
  ListChecks,
  Table as TableIcon
} from 'lucide-react';
import {
  DataQualityAudit,
  DataRow,
  CleaningOptions,
  DatasetOverview
} from '../types/dataPilot';

interface DataQualityViewProps {
  quality: DataQualityAudit | null;
  overview: DatasetOverview | null;
  originalData: DataRow[] | null;
  cleanedData: DataRow[] | null;
  cleaningActions: string[];
  onApplyCleaning: (options: CleaningOptions) => void;
  onResetCleaning: () => void;
}

export const DataQualityView: React.FC<DataQualityViewProps> = ({
  quality,
  overview,
  originalData,
  cleanedData,
  cleaningActions,
  onApplyCleaning,
  onResetCleaning
}) => {
  const [options, setOptions] = useState<CleaningOptions>({
    removeDuplicates: true,
    fillNumericMedian: true,
    fillCategoricalMode: true,
    convertNumeric: true,
    convertDates: true,
    dropEmptyColumns: true
  });

  const [activeTab, setActiveTab] = useState<'cleaned' | 'original'>('cleaned');

  if (!quality || !overview || !originalData) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Dataset Available</h3>
        <p className="text-xs text-slate-500">
          Please upload a dataset or load the sample dataset first to run the Data Quality Audit.
        </p>
      </div>
    );
  }

  const score = quality.score;
  const scoreColor =
    score >= 85 ? 'text-emerald-600' : score >= 65 ? 'text-amber-600' : 'text-rose-600';
  const scoreBg =
    score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500';

  const currentDisplayData = cleanedData && activeTab === 'cleaned' ? cleanedData : originalData;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🧹</span> Data Quality Audit & Automated Cleaning
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Algorithmic data health score, anomaly detection, and non-destructive cleaning pipeline.
        </p>
      </div>

      {/* Quality Score Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          {/* Circular Score Badge */}
          <div className="relative w-28 h-28 rounded-full border-8 border-slate-100 flex items-center justify-center shadow-inner flex-shrink-0">
            <div
              className={`absolute inset-0 rounded-full border-8 ${scoreColor.replace('text', 'border')} opacity-20`}
            />
            <div className="text-center">
              <span className={`text-3xl font-extrabold font-mono ${scoreColor}`}>{score}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Data Quality Score</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  score >= 85
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : score >= 65
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {score >= 85 ? '🌟 High Quality' : score >= 65 ? '⚠️ Needs Cleaning' : '❌ Severe Issues'}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Assessed across 6 dimensions: cell completeness, duplicate integrity, column variance,
              cardinality distributions, and IQR-based statistical outliers.
            </p>
          </div>
        </div>

        {/* Mini stats breakdown */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Missing %</span>
            <p className="text-base font-extrabold text-slate-800 font-mono mt-0.5">{quality.missingPct}%</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Duplicates</span>
            <p className="text-base font-extrabold text-slate-800 font-mono mt-0.5">{quality.duplicatesPct}%</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Outliers</span>
            <p className="text-base font-extrabold text-slate-800 font-mono mt-0.5">{quality.outliersPct}%</p>
          </div>
        </div>
      </div>

      {/* Recommendations Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Automated Audit Recommendations
          </h4>
        </div>
        <ul className="space-y-2 text-xs text-slate-700">
          {quality.recommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Automated Cleaning Configuration */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Automated Cleaning Pipeline
            </h4>
          </div>
          {cleanedData && (
            <button
              onClick={onResetCleaning}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to Original
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={options.removeDuplicates}
              onChange={(e) => setOptions({ ...options, removeDuplicates: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-slate-800 font-medium">Remove duplicate records</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={options.fillNumericMedian}
              onChange={(e) => setOptions({ ...options, fillNumericMedian: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-slate-800 font-medium">Impute missing numbers with Median</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={options.fillCategoricalMode}
              onChange={(e) => setOptions({ ...options, fillCategoricalMode: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-slate-800 font-medium">Impute missing categories with Mode</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={options.convertNumeric}
              onChange={(e) => setOptions({ ...options, convertNumeric: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-slate-800 font-medium">Auto-convert string numbers to numeric</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={options.convertDates}
              onChange={(e) => setOptions({ ...options, convertDates: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-slate-800 font-medium">Detect and parse Date/Time columns</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={options.dropEmptyColumns}
              onChange={(e) => setOptions({ ...options, dropEmptyColumns: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-slate-800 font-medium">Drop completely empty columns</span>
          </label>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            id="apply-cleaning-btn"
            onClick={() => onApplyCleaning(options)}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Apply Automated Cleaning
          </button>

          {cleanedData && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Cleaned dataset active ({cleanedData.length} records)
            </span>
          )}
        </div>

        {/* Cleaning Action Log */}
        {cleaningActions.length > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              Transformation Audit Log
            </span>
            <ul className="text-xs text-slate-700 space-y-1">
              {cleaningActions.map((act, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dataset Comparison Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('cleaned')}
              disabled={!cleanedData}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'cleaned' && cleanedData
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60 disabled:opacity-40'
              }`}
            >
              Cleaned Dataset {cleanedData && `(${cleanedData.length} rows)`}
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'original' || !cleanedData
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Original Raw Dataset ({originalData.length} rows)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3 font-mono font-bold text-slate-400 w-12 text-center">#</th>
                {Object.keys(currentDisplayData[0] || {}).map((col) => (
                  <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentDisplayData.slice(0, 10).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/80">
                  <td className="py-2 px-3 text-center font-mono text-slate-400">{rIdx + 1}</td>
                  {Object.keys(currentDisplayData[0] || {}).map((col) => {
                    const val = row[col];
                    const isNull = val === null || val === undefined || val === '';
                    return (
                      <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-700">
                        {isNull ? (
                          <span className="text-[10px] italic text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            null
                          </span>
                        ) : typeof val === 'number' ? (
                          <span className="font-mono text-slate-900">{val.toLocaleString()}</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
