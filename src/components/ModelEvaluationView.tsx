import React, { useState, useEffect } from 'react';
import {
  Target,
  Trophy,
  BarChart3,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  MlExperimentResult,
  PredictionResult,
  DataRow,
  NavSection
} from '../types/dataPilot';
import { runSinglePrediction } from '../utils/mlEngine';

interface ModelEvaluationViewProps {
  mlResult: MlExperimentResult | null;
  data: DataRow[] | null;
  onNavigate: (section: NavSection) => void;
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({
  mlResult,
  data,
  onNavigate
}) => {
  const [inputData, setInputData] = useState<Record<string, any>>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  // Initialize prediction inputs with median or first category from data
  useEffect(() => {
    if (mlResult && data && data.length > 0) {
      const initial: Record<string, any> = {};
      mlResult.featureCols.forEach((feat) => {
        const vals = data.map((r) => r[feat]).filter((v) => v !== null && v !== undefined && v !== '');
        if (vals.length > 0 && typeof vals[0] === 'number') {
          const sorted = [...vals].sort((a, b) => a - b);
          initial[feat] = sorted[Math.floor(sorted.length / 2)] || 0;
        } else {
          initial[feat] = vals[0] || 'Default';
        }
      });
      setInputData(initial);
    }
  }, [mlResult, data]);

  if (!mlResult) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
          <Target className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Trained Models Available</h3>
        <p className="text-xs text-slate-500">
          Please train machine learning models in the ML Prediction module first.
        </p>
        <button
          onClick={() => onNavigate('ml')}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-500 transition"
        >
          Go to ML Training
        </button>
      </div>
    );
  }

  const handleInputChange = (feat: string, val: any) => {
    setInputData({ ...inputData, [feat]: val });
  };

  const handlePredict = () => {
    const res = runSinglePrediction(mlResult, inputData);
    setPrediction(res);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>🎯</span> Model Evaluation & Real-Time Prediction
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Benchmark model performance metrics, analyze top feature importance, and execute live inference.
        </p>
      </div>

      {/* 🏆 Best Model Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 sm:p-7 border border-emerald-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                Top Performing Architecture
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{mlResult.bestModelName}</h3>
            <p className="text-xs text-emerald-200 mt-0.5">
              Target: <span className="font-mono font-semibold">{mlResult.targetCol}</span> &bull; {mlResult.problemType}
            </p>
          </div>
        </div>

        <div className="bg-emerald-950/60 border border-emerald-800/80 px-6 py-3 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-300">Evaluation Score</span>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
            {mlResult.bestScoreFormatted}
          </p>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Model Comparison Matrix (80% Train / 20% Test)
          </h4>
          <span className="text-xs text-slate-400 font-medium">Sorted by Primary Performance Metric</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4 text-center">Score</th>
                {mlResult.isRegression ? (
                  <>
                    <th className="py-3 px-4 text-right">R² Score</th>
                    <th className="py-3 px-4 text-right">MAE</th>
                    <th className="py-3 px-4 text-right">MSE</th>
                    <th className="py-3 px-4 text-right">RMSE</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-right">Accuracy</th>
                    <th className="py-3 px-4 text-right">Precision</th>
                    <th className="py-3 px-4 text-right">Recall</th>
                    <th className="py-3 px-4 text-right">F1 Score</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {mlResult.comparisonTable.map((row, idx) => {
                const isBest = row.model === mlResult.bestModelName;
                return (
                  <tr key={row.model} className={isBest ? 'bg-emerald-50/50 font-bold' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900 flex items-center gap-2">
                      {isBest && <Trophy className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{row.model}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isBest ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {row.score}
                      </span>
                    </td>
                    {mlResult.isRegression ? (
                      <>
                        <td className="py-3 px-4 text-right">{row.r2}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.mae}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.mse}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.rmse}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-right">{row.accuracy}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.precision}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.recall}</td>
                        <td className="py-3 px-4 text-right text-slate-600">{row.f1}</td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Features (Feature Importance) */}
      {mlResult.featureImportance.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Top Features (Predictive Importance)
            </h4>
          </div>

          <div className="space-y-3">
            {mlResult.featureImportance.map((fi, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-800">{fi.feature}</span>
                  <span className="font-mono font-bold text-slate-600">{fi.importance}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.max(4, fi.importance)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Prediction Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Real-Time Prediction Engine
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            Enter feature values below to generate instant predictions using <strong className="text-slate-700">{mlResult.bestModelName}</strong>.
          </p>
        </div>

        {/* Dynamic Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mlResult.featureCols.map((feat) => {
            const isNum = data && data.length > 0 && typeof data[0][feat] === 'number';
            const val = inputData[feat] ?? '';

            // Get unique options if categorical
            const options = !isNum && data ? Array.from(new Set(data.map((r) => String(r[feat] ?? '')))).slice(0, 10) : [];

            return (
              <div key={feat} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 truncate block" title={feat}>
                  {feat}
                </label>
                {isNum ? (
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => handleInputChange(feat, Number(e.target.value))}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    value={val}
                    onChange={(e) => handleInputChange(feat, e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-blue-500"
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
        </div>

        {/* Predict Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <button
            id="predict-instance-btn"
            onClick={handlePredict}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            🔮 Generate Prediction
          </button>

          {prediction && prediction.success && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-4 w-full sm:w-auto">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  DataPilot AI Prediction
                </span>
                <div className="text-xl font-extrabold text-blue-950 font-mono mt-0.5">
                  {prediction.isRegression ? (
                    <span>{prediction.display}</span>
                  ) : (
                    <span>
                      {prediction.display}{' '}
                      <span className="text-xs font-semibold text-blue-600">({prediction.probability} confidence)</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
