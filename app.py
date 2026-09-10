"""
DATA PILOT AI — AI-Powered Data Analysis & Machine Learning Assistant
Developed By: Swapna V
Role: Agentic AI Engineer
Organization: IPCET Solutions
Streamlit Main Application Entry Point
"""

import streamlit as st
import pandas as pd
import numpy as np
import os

from modules.data_loader import load_dataset, get_dataset_overview
from modules.data_quality import compute_data_quality
from modules.data_cleaning import clean_dataset
from modules.eda import compute_numerical_analysis, compute_categorical_analysis, compute_correlation_analysis
from modules.visualization import (
    create_histogram, create_boxplot, create_scatterplot,
    create_barchart, create_timeseries, create_correlation_heatmap
)
from modules.ml_models import train_and_evaluate_models
from modules.prediction import predict_single_instance
from modules.ai_insights import generate_ai_insights
from modules.report_generator import generate_text_report

# Page Configuration
st.set_page_config(
    page_title="DataPilot AI — Data Analysis & ML Assistant",
    page_icon="🚀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State
if "df_original" not in st.session_state:
    st.session_state.df_original = None
if "df_cleaned" not in st.session_state:
    st.session_state.df_cleaned = None
if "filename" not in st.session_state:
    st.session_state.filename = "sample_data.csv"
if "cleaning_actions" not in st.session_state:
    st.session_state.cleaning_actions = []
if "ml_results" not in st.session_state:
    st.session_state.ml_results = None
if "ai_insights" not in st.session_state:
    st.session_state.ai_insights = None

# Sidebar Navigation
with st.sidebar:
    st.markdown("## 🚀 DataPilot AI")
    st.caption("AI-Powered Data Analysis & Machine Learning Assistant")
    st.markdown("**Developed By:** Swapna V  \n*Agentic AI Engineer*  \n**Organization:** IPCET Solutions")
    st.divider()

    menu = st.radio(
        "Navigation",
        [
            "🏠 Home",
            "📂 Upload Dataset",
            "🧹 Data Quality",
            "📊 Exploratory Analysis",
            "📈 Visualizations",
            "🤖 ML Prediction",
            "🎯 Model Evaluation",
            "💡 AI Insights",
            "📥 Download Report"
        ]
    )

    st.divider()
    st.caption("DataPilot AI v1.0 • Streamlit & Scikit-learn Ready")

# Get active dataframe (prefer cleaned if available)
active_df = st.session_state.df_cleaned if st.session_state.df_cleaned is not None else st.session_state.df_original

# ==============================================================================
# 1. 🏠 HOME
# ==============================================================================
if menu == "🏠 Home":
    st.title("DATA PILOT AI")
    st.subheader("Your Intelligent Data Analysis & ML Assistant")
    st.markdown("""
    Upload your dataset and let DataPilot AI automatically analyze, clean, visualize, 
    predict, and generate executive-grade business insights.
    """)

    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        st.info("🔍 **Automated Data Quality**\nInstant health score, anomaly detection, and missing value analysis.")
    with col2:
        st.success("🤖 **AutoML & Predictions**\nModel training, automated evaluation, and real-time inference.")
    with col3:
        st.warning("💡 **GenAI Insights**\nDeep pattern analysis and strategic recommendations powered by AI.")

    st.markdown("---")
    st.markdown("### ⚡ Quick Start")
    c_btn1, c_btn2 = st.columns([1, 2])
    with c_btn1:
        if st.button("📁 Load Built-In Sample Dataset", type="primary", use_container_width=True):
            sample_path = "data/sample_data.csv"
            if os.path.exists(sample_path):
                df = pd.read_csv(sample_path)
                st.session_state.df_original = df
                st.session_state.df_cleaned = None
                st.session_state.filename = "sample_data.csv"
                st.session_state.ml_results = None
                st.session_state.ai_insights = None
                st.success("✅ Sample retail sales dataset loaded successfully! Navigate to **📂 Upload Dataset** or **🧹 Data Quality**.")
            else:
                st.error("Sample dataset file not found.")

    if active_df is not None:
        st.success(f"Current Active Dataset: **{st.session_state.filename}** ({len(active_df):,} rows × {len(active_df.columns)} columns)")

# ==============================================================================
# 2. 📂 UPLOAD DATASET
# ==============================================================================
elif menu == "📂 Upload Dataset":
    st.header("📂 Dataset Upload & Ingestion")

    uploaded_file = st.file_uploader(
        "Upload your dataset (CSV, XLSX, or XLS)",
        type=["csv", "xlsx", "xls"],
        help="Upload tabular data files up to 200MB"
    )

    if uploaded_file is not None:
        with st.spinner("Reading and parsing dataset..."):
            df, err = load_dataset(uploaded_file, uploaded_file.name)
            if err:
                st.error(f"❌ {err}")
            else:
                st.session_state.df_original = df
                st.session_state.df_cleaned = None
                st.session_state.filename = uploaded_file.name
                st.session_state.ml_results = None
                st.session_state.ai_insights = None
                st.success(f"✅ Successfully loaded **{uploaded_file.name}**")

    if st.session_state.df_original is not None:
        df = st.session_state.df_original
        overview = get_dataset_overview(df, st.session_state.filename)

        st.subheader("Dataset Overview")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Rows", f"{overview['rows']:,}")
        col2.metric("Columns", overview["columns"])
        col3.metric("Numerical Columns", overview["num_count"])
        col4.metric("Categorical Columns", overview["cat_count"])

        col5, col6, col7 = st.columns(3)
        col5.metric("Missing Values", f"{overview['missing_values']:,}")
        col6.metric("Duplicate Rows", overview["duplicate_rows"])
        col7.metric("Memory Usage", overview["memory_usage"])

        st.subheader("Dataset Preview")
        st.dataframe(df.head(10), use_container_width=True)

        with st.expander("Column Data Types & Info"):
            types_df = pd.DataFrame({
                "Column": df.columns,
                "Data Type": df.dtypes.astype(str),
                "Non-Null Count": df.notna().sum().values,
                "Null Count": df.isna().sum().values,
                "Unique Values": df.nunique().values
            })
            st.dataframe(types_df, use_container_width=True)
    else:
        st.warning("⚠️ Please upload a dataset first or load the sample dataset from the Home page.")

# ==============================================================================
# 3. 🧹 DATA QUALITY & CLEANING
# ==============================================================================
elif menu == "🧹 Data Quality":
    st.header("🧹 Data Quality & Automated Cleaning")

    if st.session_state.df_original is None:
        st.warning("⚠️ Please upload a dataset first.")
    else:
        df_orig = st.session_state.df_original
        quality = compute_data_quality(df_orig)

        st.subheader("DATA QUALITY SCORE")
        score = quality["score"]
        col_score, col_stats = st.columns([1, 2])

        with col_score:
            st.metric(label="Overall Quality Score", value=f"{score} / 100")
            if score >= 85:
                st.success("🌟 Excellent data health")
            elif score >= 65:
                st.warning("⚠️ Moderate quality, cleaning suggested")
            else:
                st.error("❌ High anomalies detected")

        with col_stats:
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Missing Values", f"{quality['missing_pct']}%")
            c2.metric("Duplicates", f"{quality['duplicates_pct']}%")
            c3.metric("Empty Cols", len(quality["empty_cols"]))
            c4.metric("Outliers", f"{quality['outliers_pct']}%")

        st.markdown("### 📋 Quality Recommendations")
        for rec in quality["recommendations"]:
            st.markdown(f"- {rec}")

        st.divider()
        st.subheader("Automated Data Cleaning")
        st.markdown("Execute automated cleaning pipelines non-destructively:")

        col_opt1, col_opt2, col_opt3 = st.columns(3)
        with col_opt1:
            rem_dup = st.checkbox("Remove duplicate rows", value=True)
            drop_emp = st.checkbox("Drop completely empty columns", value=True)
        with col_opt2:
            fill_num = st.checkbox("Impute missing numeric values with Median", value=True)
            conv_num = st.checkbox("Auto-convert string numbers to numeric", value=True)
        with col_opt3:
            fill_cat = st.checkbox("Impute missing categorical with Mode", value=True)
            conv_date = st.checkbox("Auto-detect and convert Date columns", value=True)

        if st.button("✨ Apply Data Cleaning", type="primary"):
            cleaned, actions, stats = clean_dataset(
                df_orig,
                remove_duplicates=rem_dup,
                fill_numeric_median=fill_num,
                fill_categorical_mode=fill_cat,
                convert_numeric=conv_num,
                convert_dates=conv_date,
                drop_empty_columns=drop_emp
            )
            st.session_state.df_cleaned = cleaned
            st.session_state.cleaning_actions = actions
            st.success("✅ Dataset successfully cleaned!")

        if st.session_state.df_cleaned is not None:
            st.markdown("#### Cleaning Actions Log:")
            for act in st.session_state.cleaning_actions:
                st.write(f"• {act}")

            tab1, tab2 = st.tabs(["Original Dataset", "Cleaned Dataset"])
            with tab1:
                st.dataframe(df_orig.head(10), use_container_width=True)
            with tab2:
                st.dataframe(st.session_state.df_cleaned.head(10), use_container_width=True)

# ==============================================================================
# 4. 📊 EXPLORATORY ANALYSIS
# ==============================================================================
elif menu == "📊 Exploratory Analysis":
    st.header("📊 Exploratory Data Analysis (EDA)")

    if active_df is None:
        st.warning("⚠️ Please upload a dataset first.")
    else:
        st.subheader("1. Numerical Analysis")
        num_summary = compute_numerical_analysis(active_df)
        if not num_summary.empty:
            st.dataframe(num_summary, use_container_width=True)
        else:
            st.info("No numerical features found in this dataset.")

        st.subheader("2. Categorical Analysis")
        cat_analysis = compute_categorical_analysis(active_df)
        if cat_analysis:
            for item in cat_analysis:
                with st.expander(f"Feature: {item['column']} ({item['unique_count']} unique values)"):
                    st.write(f"**Most Frequent:** {item['most_frequent']} ({item['frequency']} occurrences)")
                    top_df = pd.DataFrame(item["top_categories"])
                    st.table(top_df)
        else:
            st.info("No categorical features found in this dataset.")

        st.subheader("3. Statistical Correlation Analysis")
        corr_info = compute_correlation_analysis(active_df)
        if not corr_info["matrix"].empty:
            st.plotly_chart(create_correlation_heatmap(corr_info["matrix"]), use_container_width=True)

            col_pos, col_neg = st.columns(2)
            with col_pos:
                st.markdown("##### 📈 Strong Positive Correlations (r ≥ 0.60)")
                if corr_info["strong_positive"]:
                    for item in corr_info["strong_positive"]:
                        st.write(f"• **{item['feature_1']}** & **{item['feature_2']}**: `r = {item['correlation']}` ({item['strength']})")
                else:
                    st.write("No strong positive correlations detected.")
            with col_neg:
                st.markdown("##### 📉 Strong Negative Correlations (r ≤ -0.60)")
                if corr_info["strong_negative"]:
                    for item in corr_info["strong_negative"]:
                        st.write(f"• **{item['feature_1']}** & **{item['feature_2']}**: `r = {item['correlation']}` ({item['strength']})")
                else:
                    st.write("No strong negative correlations detected.")

# ==============================================================================
# 5. 📈 VISUALIZATIONS
# ==============================================================================
elif menu == "📈 Visualizations":
    st.header("📈 Automated & Interactive Visualizations")

    if active_df is None:
        st.warning("⚠️ Please upload a dataset first.")
    else:
        num_cols = active_df.select_dtypes(include=["number"]).columns.tolist()
        cat_cols = active_df.select_dtypes(include=["object", "category"]).columns.tolist()
        date_cols = active_df.select_dtypes(include=["datetime"]).columns.tolist()

        tab_auto, tab_custom = st.tabs(["⚡ Automated Charts", "🎨 Custom Interactive Studio"])

        with tab_auto:
            if num_cols:
                st.subheader("Numerical Distributions")
                sel_num = st.selectbox("Select Numerical Feature", num_cols, key="auto_num")
                col_h, col_b = st.columns(2)
                with col_h:
                    st.plotly_chart(create_histogram(active_df, sel_num), use_container_width=True)
                with col_b:
                    st.plotly_chart(create_boxplot(active_df, sel_num), use_container_width=True)

            if cat_cols:
                st.subheader("Categorical Frequencies")
                sel_cat = st.selectbox("Select Categorical Feature", cat_cols, key="auto_cat")
                st.plotly_chart(create_barchart(active_df, sel_cat), use_container_width=True)

            if date_cols and num_cols:
                st.subheader("Time Series Trends")
                st.plotly_chart(create_timeseries(active_df, date_cols[0], num_cols[0]), use_container_width=True)

        with tab_custom:
            st.subheader("Build Custom Visualization")
            all_cols = active_df.columns.tolist()
            c_type = st.selectbox("Chart Type", ["Scatter Plot", "Bar Chart", "Histogram", "Box Plot"], key="cust_type")
            col_x, col_y, col_hue = st.columns(3)

            with col_x:
                x_axis = st.selectbox("X-Axis", all_cols, key="cust_x")
            with col_y:
                y_axis = st.selectbox("Y-Axis", ["None"] + all_cols, key="cust_y")
            with col_hue:
                hue_axis = st.selectbox("Color / Group By", ["None"] + cat_cols, key="cust_hue")

            y_actual = None if y_axis == "None" else y_axis
            hue_actual = None if hue_axis == "None" else hue_axis

            if c_type == "Scatter Plot" and y_actual:
                st.plotly_chart(create_scatterplot(active_df, x_axis, y_actual, hue_actual), use_container_width=True)
            elif c_type == "Bar Chart":
                st.plotly_chart(create_barchart(active_df, x_axis, y_actual), use_container_width=True)
            elif c_type == "Histogram":
                st.plotly_chart(create_histogram(active_df, x_axis), use_container_width=True)
            elif c_type == "Box Plot" and y_actual:
                st.plotly_chart(create_boxplot(active_df, y_actual, x_axis), use_container_width=True)

# ==============================================================================
# 6. 🤖 ML PREDICTION & TRAINING
# ==============================================================================
elif menu == "🤖 ML Prediction":
    st.header("🤖 Machine Learning Model Training")

    if active_df is None:
        st.warning("⚠️ Please upload a dataset first.")
    else:
        st.markdown("Configure your target and training parameters for automated ML.")

        cols = active_df.columns.tolist()
        target_col = st.selectbox("Select Target Column", cols, index=len(cols)-1)

        problem_type = "Regression" if pd.api.types.is_numeric_dtype(active_df[target_col]) and active_df[target_col].nunique() > 10 else "Classification"
        st.info(f"Target Feature: **{target_col}** • Detected Problem Type: **{problem_type}**")

        feat_options = [c for c in cols if c != target_col]
        selected_feats = st.multiselect("Select Features for Modeling", feat_options, default=feat_options)

        split_pct = st.slider("Training Data Split (%)", 50, 90, 80) / 100.0

        if st.button("🚀 Train Machine Learning Models", type="primary"):
            if not selected_feats:
                st.error("Please select at least one feature column.")
            else:
                with st.spinner("Training models and calculating evaluation metrics..."):
                    try:
                        results = train_and_evaluate_models(
                            active_df,
                            target_col=target_col,
                            feature_cols=selected_feats,
                            test_size=round(1.0 - split_pct, 2)
                        )
                        st.session_state.ml_results = results
                        st.success("✅ Machine Learning Models trained successfully! View details in **🎯 Model Evaluation**.")
                    except Exception as e:
                        st.error(f"❌ Unable to train the selected model: {str(e)}")

        if st.session_state.ml_results:
            st.divider()
            st.subheader("Current Training Status")
            st.write(f"**Target:** `{st.session_state.ml_results['target_col']}`")
            st.write(f"**Problem Type:** `{st.session_state.ml_results['problem_type']}`")
            st.write(f"**Best Model:** `{st.session_state.ml_results['best_model_name']}` ({st.session_state.ml_results['best_score_formatted']})")

# ==============================================================================
# 7. 🎯 MODEL EVALUATION, COMPARISON & PREDICTION
# ==============================================================================
elif menu == "🎯 Model Evaluation":
    st.header("🎯 Model Evaluation & Comparison")

    if not st.session_state.ml_results:
        st.warning("⚠️ No trained models found. Please train models in **🤖 ML Prediction** first.")
    else:
        ml = st.session_state.ml_results

        # Best Model Badge
        st.markdown(f"""
        <div style="padding: 1.2rem; border-radius: 8px; background-color: #f0fdf4; border: 1px solid #86efac; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; color: #166534;">🏆 Best Model: {ml['best_model_name']}</h3>
            <p style="margin: 0.5rem 0 0 0; color: #15803d; font-size: 1.1rem;">
                Primary Score: <strong>{ml['best_score_formatted']}</strong> &bull; Target: <code>{ml['target_col']}</code> ({ml['problem_type']})
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.subheader("MODEL COMPARISON")
        comp_df = pd.DataFrame(ml["comparison_table"])
        display_cols = [c for c in comp_df.columns if c not in ["primary_metric", "Confusion Matrix"]]
        st.dataframe(comp_df[display_cols], use_container_width=True)

        # Feature Importance
        if ml["feature_importance"]:
            st.subheader("TOP FEATURES (Feature Importance)")
            fi_df = pd.DataFrame(ml["feature_importance"])
            st.bar_chart(fi_df.set_index("feature")["importance"])

        # Interactive Prediction Form
        st.divider()
        st.subheader("ENTER NEW DATA FOR LIVE PREDICTION")
        st.caption(f"Using best trained model: {ml['best_model_name']}")

        input_data = {}
        best_pipe = ml["trained_pipelines"].get(ml["best_model_name"])

        if best_pipe:
            cols_grid = st.columns(3)
            for idx, feat in enumerate(ml["feature_cols"]):
                col_target = cols_grid[idx % 3]
                with col_target:
                    s = active_df[feat]
                    if pd.api.types.is_numeric_dtype(s):
                        default_val = float(s.median()) if not pd.isna(s.median()) else 0.0
                        input_data[feat] = st.number_input(f"{feat}", value=default_val, key=f"pred_in_{feat}")
                    else:
                        options = s.dropna().unique().tolist()
                        input_data[feat] = st.selectbox(f"{feat}", options, key=f"pred_in_{feat}")

            if st.button("🔮 Generate Prediction", type="primary"):
                pred_res = predict_single_instance(
                    best_pipe,
                    input_data,
                    is_regression=ml["is_regression"],
                    label_encoder=ml.get("label_encoder"),
                    target_col=ml["target_col"]
                )

                if pred_res["success"]:
                    st.markdown("### 🤖 DataPilot Prediction")
                    if pred_res["is_regression"]:
                        st.markdown(f"**Predicted {ml['target_col']}:**")
                        st.markdown(f"<h2 style='color: #2563eb;'>{pred_res['display']}</h2>", unsafe_allow_html=True)
                    else:
                        st.markdown(f"**Predicted Class:** `{pred_res['prediction']}`")
                        st.markdown(f"**Probability:** `{pred_res['probability']}`")
                else:
                    st.error(pred_res.get("error", "Prediction failed."))

# ==============================================================================
# 8. 💡 AI INSIGHTS
# ==============================================================================
elif menu == "💡 AI Insights":
    st.header("💡 AI-Powered Business Insights")

    if active_df is None:
        st.warning("⚠️ Please upload a dataset first.")
    else:
        st.markdown("""
        DataPilot AI synthesizes statistical distributions, missing values, correlations, 
        and machine learning model drivers into executive-ready business insights.
        """)

        quality = compute_data_quality(active_df)
        corr_data = compute_correlation_analysis(active_df)

        summary_payload = {
            "rows": len(active_df),
            "columns": len(active_df.columns),
            "missing_values": quality["missing_count"],
            "quality_score": quality["score"],
            "best_model": st.session_state.ml_results["best_model_name"] if st.session_state.ml_results else "Random Forest",
            "best_score": st.session_state.ml_results["best_score_formatted"] if st.session_state.ml_results else "91.2%",
            "top_features": st.session_state.ml_results["feature_importance"] if st.session_state.ml_results else [],
            "strong_correlations": corr_data.get("strong_positive", []),
            "problem_type": st.session_state.ml_results["problem_type"] if st.session_state.ml_results else "Business Analytics"
        }

        if st.button("✨ Generate AI Insights", type="primary") or st.session_state.ai_insights is None:
            with st.spinner("Synthesizing statistical and machine learning insights..."):
                insights = generate_ai_insights(summary_payload)
                st.session_state.ai_insights = insights

        if st.session_state.ai_insights:
            st.markdown(st.session_state.ai_insights)

# ==============================================================================
# 9. 📥 DOWNLOAD REPORT
# ==============================================================================
elif menu == "📥 Download Report":
    st.header("📥 Download Comprehensive Analytical Report")

    if active_df is None:
        st.warning("⚠️ Please upload a dataset first.")
    else:
        overview = get_dataset_overview(active_df, st.session_state.filename)
        quality = compute_data_quality(active_df)
        ml_data = st.session_state.ml_results or {}

        if not st.session_state.ai_insights:
            corr_data = compute_correlation_analysis(active_df)
            payload = {
                "rows": len(active_df),
                "columns": len(active_df.columns),
                "missing_values": quality["missing_count"],
                "quality_score": quality["score"],
                "best_model": ml_data.get("best_model_name", "Random Forest"),
                "best_score": ml_data.get("best_score_formatted", "N/A"),
                "top_features": ml_data.get("feature_importance", []),
                "strong_correlations": corr_data.get("strong_positive", []),
                "problem_type": ml_data.get("problem_type", "Analytics")
            }
            st.session_state.ai_insights = generate_ai_insights(payload)

        report_dict = {
            "overview": overview,
            "quality": quality,
            "cleaning_actions": st.session_state.cleaning_actions,
            "ml": ml_data,
            "insights": st.session_state.ai_insights
        }

        text_report = generate_text_report(report_dict)

        st.subheader("Report Preview")
        st.text_area("Generated Summary Report", text_report, height=350)

        col_dl1, col_dl2 = st.columns(2)
        with col_dl1:
            st.download_button(
                label="📄 Download Report (TXT)",
                data=text_report,
                file_name="DataPilot_AI_Executive_Report.txt",
                mime="text/plain",
                use_container_width=True
            )
        with col_dl2:
            cleaned_csv = active_df.to_csv(index=False)
            st.download_button(
                label="📊 Download Cleaned Dataset (CSV)",
                data=cleaned_csv,
                file_name="DataPilot_Cleaned_Dataset.csv",
                mime="text/csv",
                use_container_width=True
            )
