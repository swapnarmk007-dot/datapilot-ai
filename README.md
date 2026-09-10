# DATA PILOT AI — AI-Powered Data Analysis & Machine Learning Assistant

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://datapilot-ai.streamlit.app)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-green.svg)](https://opensource.org/licenses/Apache-2.0)
[![Author](https://img.shields.io/badge/Author-Swapna%20V-purple.svg)](https://github.com/Swapnarmk007)

## 📌 Project Overview

**DataPilot AI** is an intelligent, end-to-end web application that transforms raw CSV or Excel datasets into actionable insights, robust machine learning models, and executive-grade analytical reports. Designed with a modular architecture and built using **Python, Streamlit, Scikit-learn, and Google Gemini AI**, DataPilot AI automates data auditing, automated cleaning, exploratory analysis, model selection, live inference, and GenAI synthesis.

---

## 👩‍💻 Project Ownership & Engineering

* **Developed By:** Swapna V
* **Role:** Agentic AI Engineer
* **Organization:** IPCET Solutions
* **Email:** Swapnarmk007@gmail.com
```

---

## 🏗️ System Architecture & Workflow

```text
       ┌────────────────────────┐
       │   Upload CSV / XLSX    │
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │  Data Quality Audit    │ ─── Score (0-100), Anomalies & Recommendations
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │ Non-Destructive Clean  │ ─── Remove Dups, Median/Mode Imputation, Conversions
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │    Exploratory EDA     │ ─── Numerical Stats, Frequencies & Correlations
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │ Automatic Visualizer   │ ─── Histograms, Boxplots, Scatters, Timeseries
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │ AutoML & Pipelines     │ ─── Regression / Binary / Multiclass Detection
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │ Model Evaluation & FI  │ ─── Metrics (R², RMSE, Acc, F1) & Top Drivers
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │ Live Prediction Engine │ ─── Interactive Inference for New Data Inputs
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │ Gemini GenAI Insights  │ ─── Executive Findings & Strategic Actions
       └───────────┬────────────┘
                   ▼
       ┌────────────────────────┐
       │  Downloadable Reports  │ ─── TXT, CSV, JSON & Structured Artifacts
       └────────────────────────┘
```

---

## ✨ Key Features

1. **Multi-Format Ingestion:** Instant parsing of CSV, XLSX, and XLS with automated schema detection.
2. **Data Quality Score (0–100):** Algorithmic audit assessing missingness, duplicate leakage, empty columns, constant variance, and IQR-based outliers.
3. **Automated Cleaning Pipeline:** Non-destructive median imputation for numerical data, mode imputation for categories, deduplication, and datetime parsing.
4. **Exploratory Data Analysis (EDA):** Mean, median, standard deviation, quartiles, skewness, frequency distribution tables, and Pearson correlation matrices.
5. **Dynamic Visualizations:** Plotly-powered interactive charts: histograms, box plots, scatter plots with OLS trendlines, bar charts, and time series.
6. **Automatic Problem Detection:** Auto-classifies the target variable into Regression, Binary Classification, or Multiclass Classification.
7. **Model Comparison & Selection:** Benchmarks Linear/Logistic Regression, Random Forests, and Gradient Boosting algorithms on an 80/20 train/test split.
8. **Feature Importance:** Highlights top predictive drivers with percentage impact.
9. **Interactive Prediction Form:** Form to enter arbitrary feature values and compute immediate forecasts.
10. **Gemini GenAI Insights:** Synthesizes complex mathematical findings into executive-ready business insights and recommendations (with full rule-based fallback).
11. **Exportable Reports:** Download comprehensive reports in TXT or export cleaned datasets in CSV.

---

## 🛠️ Technology Stack

* **Language:** Python 3.11+
* **Application Framework:** Streamlit
* **Data Processing:** Pandas, NumPy, OpenPyXL
* **Machine Learning:** Scikit-learn, Joblib
* **Visualization:** Plotly, Matplotlib, Seaborn
* **Generative AI:** Google Gemini API (`@google/genai` / `google-genai`)
* **Environment:** Python-dotenv

---

## 📁 Repository Structure

```text
DataPilot-AI/
│
├── app.py                      # Main Streamlit application entry point
├── requirements.txt            # Production Python dependencies
├── README.md                   # Project documentation & deployment guide
├── .gitignore                  # Git ignore specifications
├── .env.example                # Environment variable configuration template
│
├── data/
│   └── sample_data.csv         # Retail sales & customer metrics sample dataset
│
├── modules/
│   ├── __init__.py             # Module initializer
│   ├── data_loader.py          # CSV/XLSX loading & overview calculation
│   ├── data_cleaning.py        # Non-destructive data cleaning engine
│   ├── data_quality.py         # Quality scoring & anomaly detection
│   ├── eda.py                  # Descriptive stats, frequencies & correlations
│   ├── visualization.py        # Interactive Plotly chart builders
│   ├── ml_models.py            # AutoML training, evaluation & comparison
│   ├── prediction.py           # Single-record inference engine
│   ├── ai_insights.py          # Gemini API integration & fallback logic
│   └── report_generator.py     # Executive report compiler
│
└── models/
    └── .gitkeep                # Directory for serialized joblib models
```

---

## ⚡ Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Swapnarmk007/DataPilot-AI.git
cd DataPilot-AI
```

### 2. Create and Activate a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your optional Gemini API key:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(Note: DataPilot AI works 100% out of the box even without an API key using its built-in rule-based AI engine!)*

### 5. Launch the Application
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## ☁️ Deployment on Streamlit Community Cloud

1. Push this repository to your GitHub account.
2. Sign in to [share.streamlit.io](https://share.streamlit.io).
3. Click **"New app"**, select your repository, branch (`main`), and set the main file path to `app.py`.
4. (Optional) In **Advanced settings > Secrets**, add:
   ```toml
   GEMINI_API_KEY = "your-api-key"
   ```
5. Click **Deploy!** Your app will be live with a public URL in seconds.

---

## 🛡️ License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.
## 🚀 Live Demo

You can try DataPilot AI live directly in this workspace or deploy it to Streamlit Community Cloud:

```text
[Open DataPilot AI Live Application]
 [![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-DataPilot%20AI-success)](https://datapilot-ai-bbcmstjjvkjnyfsd4xbcwv.streamlit.app/)

---

**Developed with ❤️ by Swapna V — Agentic AI Engineer**
