import React from 'react';
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  Archive,
  Printer,
  CheckCircle2
} from 'lucide-react';
import {
  DatasetOverview,
  DataQualityAudit,
  MlExperimentResult,
  DataRow
} from '../types/dataPilot';
import {
  buildTextReport,
  buildHTMLReport,
  downloadBlob,
  downloadCleanedCSV,
  downloadPythonRepositoryZip
} from '../utils/reportBuilder';

interface DownloadReportViewProps {
  overview: DatasetOverview | null;
  quality: DataQualityAudit | null;
  cleaningActions: string[];
  mlResult: MlExperimentResult | null;
  insights: string;
  cleanedData: DataRow[] | null;
  sampleCsvText: string;
}

export const DownloadReportView: React.FC<DownloadReportViewProps> = ({
  overview,
  quality,
  cleaningActions,
  mlResult,
  insights,
  cleanedData,
  sampleCsvText
}) => {
  if (!overview || !quality) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Please upload or select a dataset first to compile and export analytical reports.
      </div>
    );
  }

  const textReport = buildTextReport(overview, quality, cleaningActions, mlResult, insights);

  const handleDownloadTxt = () => {
    downloadBlob(textReport, `DataPilot_AI_Report_${overview.filename}.txt`, 'text/plain;charset=utf-8;');
  };

  const handleDownloadHtml = () => {
    const html = buildHTMLReport(overview, quality, cleaningActions, mlResult, insights);
    downloadBlob(html, `DataPilot_AI_Report_${overview.filename}.html`, 'text/html;charset=utf-8;');
  };

  const handleDownloadCleanedCSV = () => {
    if (cleanedData && cleanedData.length > 0) {
      downloadCleanedCSV(cleanedData, `DataPilot_Cleaned_${overview.filename}`);
    }
  };

  const handleDownloadZip = () => {
    downloadPythonRepositoryZip(sampleCsvText);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📥</span> Download Comprehensive Reports & Artifacts
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Export executive text summaries, printable HTML documents, cleaned CSVs, or the complete Python Streamlit repository.
        </p>
      </div>

      {/* Download Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={handleDownloadTxt}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Executive Report</h4>
            <p className="text-[11px] text-slate-500">Plain text (.TXT) summary</p>
          </div>
        </button>

        <button
          onClick={handleDownloadHtml}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md transition text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Printable HTML</h4>
            <p className="text-[11px] text-slate-500">Stylized web & PDF export</p>
          </div>
        </button>

        <button
          onClick={handleDownloadCleanedCSV}
          disabled={!cleanedData}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md disabled:opacity-50 transition text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Cleaned Dataset</h4>
            <p className="text-[11px] text-slate-500">Export as CSV file</p>
          </div>
        </button>

        <button
          onClick={handleDownloadZip}
          className="p-5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition text-left space-y-2 group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Streamlit Project</h4>
            <p className="text-[11px] text-slate-500">Download complete ZIP</p>
          </div>
        </button>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Report Preview
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {textReport.split('\n').length} lines compiled
          </span>
        </div>

        <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed select-all">
          <pre>{textReport}</pre>
        </div>
      </div>
    </div>
  );
};
