import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon,
  Layers,
  Hash,
  Type,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DatasetOverview, DataRow } from '../types/dataPilot';

interface UploadViewProps {
  overview: DatasetOverview | null;
  data: DataRow[] | null;
  onFileUpload: (file: File) => void;
  onLoadSample: () => void;
  isLoading: boolean;
}

export const UploadView: React.FC<UploadViewProps> = ({
  overview,
  data,
  onFileUpload,
  onLoadSample,
  isLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTypesTable, setShowTypesTable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📂</span> Dataset Upload & Ingestion
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload any tabular dataset in CSV, Excel (XLSX, XLS) format or load our sample retail data.
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        id="file-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60 shadow-inner'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Drag and drop your file here, or{' '}
              <span className="text-blue-600 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports CSV, XLSX, XLS up to 200MB</p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLoadSample();
              }}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Load Retail Sales Sample
            </button>
          </div>
        </div>
      </div>

      {/* Active Dataset Overview Cards */}
      {overview && data && data.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Active Dataset: <span className="font-mono text-blue-600">{overview.filename}</span>
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Memory: {overview.memoryUsage}
            </span>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Total Rows</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono">{overview.rows.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Columns</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono">{overview.columns}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Numerical</span>
              <p className="text-xl font-extrabold text-blue-600 font-mono">{overview.numCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Categorical</span>
              <p className="text-xl font-extrabold text-indigo-600 font-mono">{overview.catCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Missing Cells</span>
              <p className={`text-xl font-extrabold font-mono ${overview.missingValues > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {overview.missingValues}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold uppercase text-slate-400">Duplicate Rows</span>
              <p className={`text-xl font-extrabold font-mono ${overview.duplicateRows > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {overview.duplicateRows}
              </p>
            </div>
          </div>

          {/* Dataset Preview Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dataset Preview (First 10 Rows)
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Displaying 10 of {overview.rows.toLocaleString()} records
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-mono font-bold text-slate-400 w-12 text-center">#</th>
                    {Object.keys(data[0]).map((col) => (
                      <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {overview.numericalCols.includes(col) ? (
                            <Hash className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Type className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{col}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.slice(0, 10).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{rIdx + 1}</td>
                      {Object.keys(data[0]).map((col) => {
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

          {/* Collapsible Column Data Types & Non-Null Audit */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setShowTypesTable(!showTypesTable)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/60 transition"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Column Schema & Missing Analysis
                </span>
              </div>
              {showTypesTable ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            {showTypesTable && (
              <div className="p-4 border-t border-slate-200 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                      <th className="pb-2">Column Name</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Non-Null Count</th>
                      <th className="pb-2">Null Count</th>
                      <th className="pb-2">Null %</th>
                      <th className="pb-2">Unique Values</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.keys(data[0]).map((col) => {
                      const nonNull = data.filter((r) => r[col] !== null && r[col] !== undefined && r[col] !== '').length;
                      const nullCount = data.length - nonNull;
                      const nullPct = ((nullCount / data.length) * 100).toFixed(1);
                      const unique = new Set(data.map((r) => r[col])).size;
                      const isNum = overview.numericalCols.includes(col);

                      return (
                        <tr key={col} className="py-2">
                          <td className="py-2 font-medium text-slate-900">{col}</td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${isNum ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                              {isNum ? 'numeric (float/int)' : 'categorical (string)'}
                            </span>
                          </td>
                          <td className="py-2 font-mono text-slate-600">{nonNull}</td>
                          <td className="py-2 font-mono text-slate-600">{nullCount}</td>
                          <td className="py-2 font-mono text-slate-600">{nullPct}%</td>
                          <td className="py-2 font-mono text-slate-600">{unique}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
