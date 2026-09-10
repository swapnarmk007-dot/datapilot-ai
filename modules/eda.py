"""
DataPilot AI - Exploratory Data Analysis (EDA) Module
Calculates descriptive statistics, frequency tables, and correlation relationships.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List

def compute_numerical_analysis(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes statistical metrics for all numerical columns:
    Mean, Median, Std Dev, Min, 25%, 50%, 75%, Max, IQR, Skewness.
    """
    num_cols = df.select_dtypes(include=["number"]).columns
    if len(num_cols) == 0:
        return pd.DataFrame()

    results = []
    for c in num_cols:
        s = df[c].dropna()
        if len(s) == 0:
            continue
        q25 = s.quantile(0.25)
        q50 = s.median()
        q75 = s.quantile(0.75)
        results.append({
            "Feature": c,
            "Count": int(s.count()),
            "Mean": round(float(s.mean()), 2),
            "Median": round(float(q50), 2),
            "Std Dev": round(float(s.std(ddof=1) if len(s) > 1 else 0.0), 2),
            "Min": round(float(s.min()), 2),
            "25% (Q1)": round(float(q25), 2),
            "50% (Q2)": round(float(q50), 2),
            "75% (Q3)": round(float(q75), 2),
            "Max": round(float(s.max()), 2),
            "IQR": round(float(q75 - q25), 2),
            "Skewness": round(float(s.skew()) if len(s) > 2 else 0.0, 2)
        })

    return pd.DataFrame(results)

def compute_categorical_analysis(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Analyzes categorical columns: unique counts, top frequency, and category distribution.
    """
    cat_cols = df.select_dtypes(include=["object", "category"]).columns
    results = []

    for c in cat_cols:
        counts = df[c].value_counts(dropna=False)
        total = len(df)
        top_cats = []
        for val, count in counts.head(5).items():
            top_cats.append({
                "category": str(val),
                "count": int(count),
                "percentage": round(float(count / total * 100), 1) if total > 0 else 0.0
            })

        results.append({
            "column": c,
            "unique_count": int(df[c].nunique()),
            "most_frequent": str(counts.index[0]) if len(counts) > 0 else "N/A",
            "frequency": int(counts.iloc[0]) if len(counts) > 0 else 0,
            "top_categories": top_cats
        })

    return results

def compute_correlation_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generates Pearson correlation matrix, strong positive, and strong negative relationships.
    """
    num_cols = df.select_dtypes(include=["number"]).columns
    if len(num_cols) < 2:
        return {"matrix": pd.DataFrame(), "strong_positive": [], "strong_negative": []}

    corr_matrix = df[num_cols].corr()

    strong_positive = []
    strong_negative = []

    cols = list(corr_matrix.columns)
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            col1 = cols[i]
            col2 = cols[j]
            val = corr_matrix.loc[col1, col2]
            if pd.isna(val):
                continue
            r = round(float(val), 3)
            if r >= 0.6:
                strong_positive.append({
                    "feature_1": col1,
                    "feature_2": col2,
                    "correlation": r,
                    "strength": "Very Strong" if r >= 0.8 else "Moderate to Strong"
                })
            elif r <= -0.6:
                strong_negative.append({
                    "feature_1": col1,
                    "feature_2": col2,
                    "correlation": r,
                    "strength": "Very Strong Negative" if r <= -0.8 else "Moderate Negative"
                })

    strong_positive.sort(key=lambda x: x["correlation"], reverse=True)
    strong_negative.sort(key=lambda x: x["correlation"])

    return {
        "matrix": corr_matrix,
        "strong_positive": strong_positive,
        "strong_negative": strong_negative
    }
