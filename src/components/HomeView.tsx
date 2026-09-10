import React from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { NavSection } from '../types/dataPilot';

interface HomeViewProps {
  onNavigate: (section: NavSection) => void;
  onLoadSample: () => void;
  isLoadingSample: boolean;
  hasDataset: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onLoadSample,
  isLoadingSample,
  hasDataset
}) => {
  const steps = [
    { title: 'Upload CSV/XLSX', desc: 'Drag and drop tabular data files', icon: <UploadCloud className="w-5 h-5 text-blue-600" /> },
    { title: 'Data Quality Audit', desc: 'Score 0-100, outliers, duplicates', icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
    { title: 'Automated Cleaning', desc: 'Non-destructive median & mode imputation', icon: <CheckCircle2 className="w-5 h-5 text-teal-600" /> },
    { title: 'Exploratory EDA', desc: 'Numerical & categorical statistics', icon: <BarChart3 className="w-5 h-5 text-amber-600" /> },
    { title: 'Visualizations', desc: 'Histograms, boxplots, scatters & line charts', icon: <TrendingUp className="w-5 h-5 text-indigo-600" /> },
    { title: 'AutoML & Evaluation', desc: 'Train Linear/Logistic, RF & Gradient Boosting', icon: <BrainCircuit className="w-5 h-5 text-purple-600" /> },
    { title: 'AI Insights & Reports', desc: 'Gemini GenAI insights & full report download', icon: <Sparkles className="w-5 h-5 text-yellow-600" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI-Powered Analytics & Machine Learning Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            DATA PILOT AI
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
            Your Intelligent Data Analysis & ML Assistant. Upload your dataset and let DataPilot AI
            automatically analyze, visualize, predict, and generate executive insights.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-4">
            <button
              id="hero-upload-btn"
              onClick={() => onNavigate('upload')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload CSV / Excel
            </button>

            <button
              id="hero-sample-btn"
              onClick={onLoadSample}
              disabled={isLoadingSample}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              {isLoadingSample ? 'Loading Sample...' : 'Load Built-In Sample Dataset'}
            </button>
          </div>

          {hasDataset && (
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dataset is loaded and ready! You can explore Data Quality or Visualizations now.</span>
            </div>
          )}
        </div>

        {/* Decorative subtle background gradient */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Developer & Engineering Credentials */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            SV
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base">Swapna V</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Agentic AI Engineer
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                IPCET Solutions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Developed by <strong className="text-slate-700">Swapna V</strong> &bull; Role: <strong className="text-slate-700">Agentic AI Engineer</strong> &bull; Organization: <strong className="text-slate-700">IPCET Solutions</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Streamlit & GitHub Ready</span>
          <button
            onClick={() => onNavigate('code')}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            View Python Code
          </button>
        </div>
      </div>

      {/* Core Workflow Pipeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">End-to-End Analytical Pipeline</h2>
            <p className="text-xs text-slate-500">How DataPilot AI transforms raw data into decisions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {step.icon}
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-400">0{idx + 1}</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{step.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Data Quality Score (0–100)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Automatically calculates quality deductions across missingness, duplicate leakage, high cardinality,
            and IQR-based statistical outliers.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">AutoML & Real-Time Inference</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Auto-identifies Regression vs Classification problems, trains Linear/Logistic models, Random Forests,
            and Gradient Boosting with live feature-importance graphs.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Gemini GenAI Insights & Reports</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Generates business-friendly executive summaries and strategic action points via Google Gemini with
            instant rule-based fallback when offline.
          </p>
        </div>
      </div>

      {/* Engineering & Attribution Footer */}
      <footer className="pt-6 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          <span className="font-semibold text-slate-700">DataPilot AI</span> &bull; Developed by <span className="font-semibold text-slate-800">Swapna V</span> (<span className="text-blue-600 font-medium">Agentic AI Engineer</span>)
        </div>
        <div className="flex items-center gap-2">
          <span>Organization:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
            IPCET Solutions
          </span>
        </div>
      </footer>
    </div>
  );
};
