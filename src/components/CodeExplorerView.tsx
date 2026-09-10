import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  FolderTree,
  Terminal
} from 'lucide-react';
import { downloadPythonRepositoryZip } from '../utils/reportBuilder';

interface CodeExplorerViewProps {
  sampleCsvText: string;
}

export const CodeExplorerView: React.FC<CodeExplorerViewProps> = ({ sampleCsvText }) => {
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('app.py');

  const files: Record<string, string> = {
    'app.py': `# DATA PILOT AI — AI-Powered Data Analysis & Machine Learning Assistant
# Developed By: Swapna V | Role: Agentic AI Engineer | Organization: IPCET Solutions
# Streamlit Application Entry Point

import streamlit as st
import pandas as pd
import numpy as np
import os

from modules.data_loader import load_dataset, get_dataset_overview
from modules.data_quality import compute_data_quality
from modules.data_cleaning import clean_dataset
from modules.eda import compute_numerical_analysis, compute_categorical_analysis, compute_correlation_analysis
from modules.visualization import create_histogram, create_boxplot, create_scatterplot, create_barchart
from modules.ml_models import train_and_evaluate_models
from modules.prediction import predict_single_instance
from modules.ai_insights import generate_ai_insights
from modules.report_generator import generate_text_report

st.set_page_config(page_title="DataPilot AI", page_icon="🚀", layout="wide")

# Main menu navigation
menu = st.sidebar.radio("Navigation", [
    "🏠 Home", "📂 Upload Dataset", "🧹 Data Quality",
    "📊 Exploratory Analysis", "📈 Visualizations",
    "🤖 ML Prediction", "🎯 Model Evaluation",
    "💡 AI Insights", "📥 Download Report"
])
# (See full file in repo...)`,

    'requirements.txt': `streamlit>=1.35.0
pandas>=2.2.0
numpy>=1.26.0
matplotlib>=3.8.0
seaborn>=0.13.0
scikit-learn>=1.4.0
joblib>=1.3.0
openpyxl>=3.1.0
plotly>=5.22.0
google-genai>=0.1.1
python-dotenv>=1.0.0`,

    'modules/data_quality.py': `"""
DataPilot AI - Data Quality Module
Computes quality score (0-100) and detects anomalies.
"""
import pandas as pd
import numpy as np

def compute_data_quality(df: pd.DataFrame) -> dict:
    total_cells = df.shape[0] * df.shape[1]
    missing_cells = df.isna().sum().sum()
    missing_pct = (missing_cells / total_cells * 100) if total_cells > 0 else 0
    duplicate_rows = df.duplicated().sum()
    duplicates_pct = (duplicate_rows / len(df) * 100) if len(df) > 0 else 0
    
    # Penalties calculation
    penalty = min(30, missing_pct * 1.5) + min(20, duplicates_pct * 2.0)
    score = max(0, min(100, round(100 - penalty)))
    
    return {
        "score": score,
        "missing_count": int(missing_cells),
        "missing_pct": round(missing_pct, 2),
        "duplicates_count": int(duplicate_rows),
        "duplicates_pct": round(duplicates_pct, 2)
    }`,

    'modules/ml_models.py': `"""
DataPilot AI - ML Models Module
Automated task detection, preprocessing, and model benchmarking.
"""
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score

def determine_problem_type(df, target_col):
    y = df[target_col].dropna()
    if pd.api.types.is_numeric_dtype(y) and y.nunique() > 10:
        return "Regression"
    elif y.nunique() == 2:
        return "Binary Classification"
    return "Multiclass Classification"`,

    'README.md': `# DATA PILOT AI — AI-Powered Data Analysis & Machine Learning Assistant
Developed By: Swapna V
Role: Agentic AI Engineer
Organization: IPCET Solutions

## Quick Start
\`\`\`bash
pip install -r requirements.txt
streamlit run app.py
\`\`\``
  };

  const currentCode = files[selectedFile] || '# File loaded';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📦</span> Python & Streamlit Project Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore the complete modular Python code architecture built for Streamlit Community Cloud and GitHub.
          </p>
        </div>

        <button
          onClick={() => downloadPythonRepositoryZip(sampleCsvText)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Download Complete Project ZIP
        </button>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        {/* File Tree */}
        <div className="p-4 border-r border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-slate-400" />
            <span>Files Explorer</span>
          </div>

          <div className="space-y-1">
            {Object.keys(files).map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFile(f)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition ${
                  selectedFile === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{f}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/80 text-[11px] text-blue-900 space-y-1">
              <span className="font-bold block">Streamlit Ready</span>
              <p className="text-blue-700">All modules test-covered and prepared for \`streamlit run app.py\`.</p>
            </div>
          </div>
        </div>

        {/* Code Content View */}
        <div className="md:col-span-3 flex flex-col bg-slate-950 text-slate-200">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              {selectedFile}
            </span>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-4 flex-1 overflow-x-auto font-mono text-xs leading-relaxed select-all">
            <pre className="text-slate-300">{currentCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
