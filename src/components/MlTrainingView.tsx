import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { DataRow, DatasetOverview, MlExperimentResult, NavSection } from '../types/dataPilot';
import { determineProblemType } from '../utils/mlEngine';

interface MlTrainingViewProps {
  data: DataRow[] | null;
  overview: DatasetOverview | null;
  mlResult: MlExperimentResult | null;
  onTrainModels: (targetCol: string, featureCols: string[], splitPct: number) => void;
  onNavigate: (section: NavSection) => void;
  isTraining: boolean;
}

export const MlTrainingView: React.FC<MlTrainingViewProps> = ({
  data,
  overview,
  mlResult,
  onTrainModels,
  onNavigate,
  isTraining
}) => {
  const [targetCol, setTargetCol] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [splitPct, setSplitPct] = useState<number>(80);

  // Initialize defaults
  useEffect(() => {
    if (data && data.length > 0 && overview) {
      const allCols = Object.keys(data[0]);
      // Default to last numeric or last column
      const defaultTarget = overview.numericalCols[overview.numericalCols.length - 1] || allCols[allCols.length - 1];
      setTargetCol(defaultTarget);

      const features = allCols.filter((c) => c !== defaultTarget);
      setSelectedFeatures(features);
    }
  }, [data, overview]);

  if (!data || !overview || data.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Please upload or select a dataset first to configure Machine Learning models.
      </div>
    );
  }

  const allCols = Object.keys(data[0]);
  const detectedProblem = targetCol ? determineProblemType(data, targetCol) : 'Regression';

  const handleTargetChange = (newTarget: string) => {
    setTargetCol(newTarget);
    setSelectedFeatures(allCols.filter((c) => c !== newTarget));
  };

  const handleToggleFeature = (col: string) => {
    if (selectedFeatures.includes(col)) {
      setSelectedFeatures(selectedFeatures.filter((c) => c !== col));
    } else {
      setSelectedFeatures([...selectedFeatures, col]);
    }
  };

  const handleSelectAllFeatures = () => {
    setSelectedFeatures(allCols.filter((c) => c !== targetCol));
  };

  const handleDeselectAllFeatures = () => {
    setSelectedFeatures([]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🤖</span> Machine Learning Model Training
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated problem type detection, preprocessing pipelines, and multi-model benchmarking.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          {/* Target Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              1. Select Target Column (To Predict)
            </label>
            <select
              value={targetCol}
              onChange={(e) => handleTargetChange(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-blue-500"
            >
              {allCols.map((c) => (
                <option key={c} value={c}>
                  {c} {overview.numericalCols.includes(c) ? '(Numerical)' : '(Categorical)'}
                </option>
              ))}
            </select>
          </div>

          {/* Problem Type Banner */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Detected Problem Type
            </span>
            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-blue-900 block">{detectedProblem}</span>
                <span className="text-[11px] text-blue-700">
                  {detectedProblem === 'Regression'
                    ? 'Continuous numerical target (evaluates R², RMSE, MAE)'
                    : 'Discrete classification target (evaluates Accuracy, F1)'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">Auto-detected</span>
            </div>
          </div>
        </div>

        {/* Feature Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              3. Select Predictor Features ({selectedFeatures.length} of {allCols.length - 1} selected)
            </label>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAllFeatures}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">&bull;</span>
              <button
                type="button"
                onClick={handleDeselectAllFeatures}
                className="text-slate-500 hover:text-slate-700 font-semibold"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
            {allCols
              .filter((c) => c !== targetCol)
              .map((col) => {
                const isChecked = selectedFeatures.includes(col);
                return (
                  <label
                    key={col}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleFeature(col)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="truncate" title={col}>{col}</span>
                  </label>
                );
              })}
          </div>
        </div>

        {/* Train/Test Split Slider */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700">
              4. Train / Test Data Split
            </span>
            <span className="font-mono font-bold text-blue-600">
              {splitPct}% Train &bull; {100 - splitPct}% Test
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="90"
            step="5"
            value={splitPct}
            onChange={(e) => setSplitPct(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            id="train-models-btn"
            onClick={() => onTrainModels(targetCol, selectedFeatures, splitPct / 100)}
            disabled={isTraining || selectedFeatures.length === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            <BrainCircuit className="w-4 h-4" />
            {isTraining ? 'Training Models & Preprocessing...' : '🚀 Train Machine Learning Models'}
          </button>

          {mlResult && (
            <button
              onClick={() => onNavigate('evaluation')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Model Evaluation & Feature Importance
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Model Summary Banner */}
      {mlResult && (
        <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-emerald-900">
                Models Successfully Trained: {mlResult.bestModelName} ({mlResult.bestScoreFormatted})
              </h4>
            </div>
            <p className="text-xs text-emerald-700">
              Evaluated on {mlResult.testSize} test instances across {mlResult.comparisonTable.length} distinct architectures.
            </p>
          </div>

          <button
            onClick={() => onNavigate('evaluation')}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm whitespace-nowrap"
          >
            Inspect Comparison & Make Predictions
          </button>
        </div>
      )}
    </div>
  );
};
