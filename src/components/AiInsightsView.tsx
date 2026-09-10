import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cpu
} from 'lucide-react';
import {
  DatasetOverview,
  DataQualityAudit,
  MlExperimentResult,
  CorrelationAnalysis
} from '../types/dataPilot';

interface AiInsightsViewProps {
  overview: DatasetOverview | null;
  quality: DataQualityAudit | null;
  mlResult: MlExperimentResult | null;
  corrAnalysis: CorrelationAnalysis | null;
  insights: string;
  isGenerating: boolean;
  onGenerateInsights: () => void;
}

export const AiInsightsView: React.FC<AiInsightsViewProps> = ({
  overview,
  quality,
  mlResult,
  corrAnalysis,
  insights,
  isGenerating,
  onGenerateInsights
}) => {
  if (!overview) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Please upload or select a dataset first to generate AI-powered insights.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>💡</span> AI-Generated Business Insights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Executive-grade strategic findings, pattern discovery, and predictive guidance powered by GenAI.
          </p>
        </div>

        <button
          id="generate-insights-btn"
          onClick={onGenerateInsights}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          {isGenerating ? 'Synthesizing Analysis...' : '✨ Generate / Refresh AI Insights'}
        </button>
      </div>

      {/* Hero Insights Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Executive Analytical Summary</h3>
              <p className="text-[11px] text-slate-400">
                Ground truth from {overview.rows.toLocaleString()} rows &bull; Quality Score: {quality?.score || 100}/100
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Cpu className="w-3 h-3" />
            Gemini GenAI & Rule-Based Fallback
          </span>
        </div>

        {/* Insights Output */}
        {insights ? (
          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4 whitespace-pre-wrap font-sans bg-slate-50/60 p-6 rounded-xl border border-slate-200/80">
            {insights}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">No insights synthesized yet.</p>
            <button
              onClick={onGenerateInsights}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs"
            >
              Generate Now
            </button>
          </div>
        )}
      </div>

      {/* How it works info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-800 block">1. Statistical Grounding</span>
          <p className="text-slate-500">
            Summarizes mean, medians, outlier rates, and Pearson correlations to discover inter-variable signals.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-800 block">2. ML Driver Synthesis</span>
          <p className="text-slate-500">
            Pulls top feature importance from tree architectures ({mlResult?.bestModelName || 'AutoML'}) to pinpoint primary business levers.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <span className="font-bold text-slate-800 block">3. Resilient Multi-Tier Engine</span>
          <p className="text-slate-500">
            Executes via Gemini API server proxy when available, or instantly generates structured insights locally without API dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};
