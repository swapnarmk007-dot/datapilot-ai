import React from 'react';
import {
  Home,
  UploadCloud,
  CheckCircle2,
  BarChart3,
  LineChart,
  BrainCircuit,
  Target,
  Sparkles,
  FileDown,
  Code2,
  Database,
  ExternalLink
} from 'lucide-react';
import { NavSection, DatasetOverview } from '../types/dataPilot';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  overview: DatasetOverview | null;
  hasCleanedData: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  overview,
  hasCleanedData
}) => {
  const navItems: { id: NavSection; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: '🏠 Home', icon: <Home className="w-4 h-4 text-slate-500" /> },
    { id: 'upload', label: '📂 Upload Dataset', icon: <UploadCloud className="w-4 h-4 text-blue-500" /> },
    { id: 'quality', label: '🧹 Data Quality', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
    { id: 'eda', label: '📊 Exploratory Analysis', icon: <BarChart3 className="w-4 h-4 text-amber-500" /> },
    { id: 'visualizations', label: '📈 Visualizations', icon: <LineChart className="w-4 h-4 text-indigo-500" /> },
    { id: 'ml', label: '🤖 ML Prediction', icon: <BrainCircuit className="w-4 h-4 text-purple-500" /> },
    { id: 'evaluation', label: '🎯 Model Evaluation', icon: <Target className="w-4 h-4 text-rose-500" /> },
    { id: 'insights', label: '💡 AI Insights', icon: <Sparkles className="w-4 h-4 text-yellow-500" /> },
    { id: 'report', label: '📥 Download Report', icon: <FileDown className="w-4 h-4 text-teal-500" /> },
    { id: 'code', label: '📦 Python Code & Repo', icon: <Code2 className="w-4 h-4 text-cyan-500" /> }
  ];

  return (
    <aside
      id="datapilot-sidebar"
      className="w-72 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 flex-shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
            🚀
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              DataPilot AI
            </h1>
            <p className="text-xs text-slate-400 font-medium">Intelligent Analytics & ML</p>
          </div>
        </div>

        {/* Developer & Organization Badge */}
        <div className="mt-4 p-2.5 rounded-md bg-slate-800/70 border border-slate-700/80 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Developed By</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              IPCET
            </span>
          </div>
          <div className="font-bold text-slate-100 mt-1">Swapna V</div>
          <div className="text-[11px] text-blue-400 font-medium">Agentic AI Engineer</div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
            <span>🏢</span> IPCET Solutions
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>{item.label}</span>
              </div>
              {item.id === 'quality' && hasCleanedData && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Dataset Status Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs">
        {overview ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Active Dataset
              </span>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                Ready
              </span>
            </div>
            <p className="font-medium text-slate-200 truncate" title={overview.filename}>
              {overview.filename}
            </p>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{overview.rows.toLocaleString()} rows &bull; {overview.columns} cols</span>
              <span>{overview.memoryUsage}</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-400 text-center py-1">
            <p className="text-[11px]">No active dataset loaded</p>
            <button
              onClick={() => onSelectSection('upload')}
              className="mt-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2"
            >
              Upload CSV or Excel
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
