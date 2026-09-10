"""
DataPilot AI - Data Quality Module
Computes Data Quality Score (0-100), detects anomalies, and outputs improvement recommendations.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List

def compute_data_quality(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyzes data quality across 7 dimensions and computes a score from 0 to 100.
    """
    if df is None or df.empty:
        return {"score": 0, "metrics": {}, "recommendations": ["Upload a non-empty dataset."]}

    total_cells = df.shape[0] * df.shape[1]
    total_rows = len(df)

    # 1. Missing values
    missing_total = int(df.isna().sum().sum())
    missing_pct = (missing_total / total_cells * 100) if total_cells > 0 else 0.0

    # 2. Duplicate rows
    duplicates_count = int(df.duplicated().sum())
    duplicates_pct = (duplicates_count / total_rows * 100) if total_rows > 0 else 0.0

    # 3. Constant columns (all values identical)
    constant_cols = [c for c in df.columns if df[c].nunique(dropna=False) <= 1]

    # 4. Completely empty columns
    empty_cols = [c for c in df.columns if df[c].isna().all()]

    # 5. High cardinality categorical columns (> 50 unique or > 50% rows)
    cat_cols = df.select_dtypes(include=["object", "category"]).columns
    high_card_cols = []
    for c in cat_cols:
        uniq = df[c].nunique()
        if (uniq > 50 and uniq / total_rows > 0.4) or (uniq == total_rows and total_rows > 10):
            high_card_cols.append(c)

    # 6. Potential data type issues (object columns that could be numeric)
    potential_numeric = []
    for c in cat_cols:
        sample = df[c].dropna().astype(str)
        if len(sample) > 0:
            converted = pd.to_numeric(sample.str.replace(r"[$,%₹]", "", regex=True), errors="coerce")
            if converted.notna().sum() / len(sample) > 0.8:
                potential_numeric.append(c)

    # 7. Outliers detection in numeric columns using IQR rule
    num_cols = df.select_dtypes(include=["number"]).columns
    outlier_cells = 0
    total_num_cells = 0
    outliers_by_col = {}

    for c in num_cols:
        s = df[c].dropna()
        if len(s) >= 4:
            q1 = s.quantile(0.25)
            q3 = s.quantile(0.75)
            iqr = q3 - q1
            if iqr > 0:
                lower = q1 - 1.5 * iqr
                upper = q3 + 1.5 * iqr
                col_outliers = int(((s < lower) | (s > upper)).sum())
                outlier_cells += col_outliers
                total_num_cells += len(s)
                if col_outliers > 0:
                    outliers_by_col[c] = col_outliers

    outliers_pct = (outlier_cells / total_num_cells * 100) if total_num_cells > 0 else 0.0

    # Compute Quality Score: starts at 100, penalized by deductions
    # Deductions:
    # Missing: up to 30 pts
    # Duplicates: up to 20 pts
    # Empty cols: 10 pts each up to 20 pts
    # Constant cols: 5 pts each up to 10 pts
    # Data type mismatch: 5 pts each up to 10 pts
    # Outliers: up to 10 pts

    penalty = 0.0
    penalty += min(30.0, missing_pct * 1.5)
    penalty += min(20.0, duplicates_pct * 2.0)
    penalty += min(20.0, len(empty_cols) * 10.0)
    penalty += min(10.0, len(constant_cols) * 5.0)
    penalty += min(10.0, len(potential_numeric) * 5.0)
    penalty += min(10.0, outliers_pct * 0.5)

    quality_score = max(0, min(100, int(round(100.0 - penalty))))

    # Build Recommendations
    recommendations = []
    if missing_total > 0:
        recommendations.append(f"Impute or drop {missing_total} missing values ({missing_pct:.1f}% of cells) using median for numerical and mode for categorical features.")
    if duplicates_count > 0:
        recommendations.append(f"Remove {duplicates_count} duplicate rows ({duplicates_pct:.1f}% of data) to prevent sample leakage.")
    if empty_cols:
        recommendations.append(f"Drop completely empty columns: {', '.join(empty_cols)}.")
    if constant_cols:
        recommendations.append(f"Remove zero-variance constant columns: {', '.join(constant_cols)}.")
    if potential_numeric:
        recommendations.append(f"Convert text columns with numeric values to float/int: {', '.join(potential_numeric)}.")
    if high_card_cols:
        recommendations.append(f"Review high-cardinality categorical features (e.g. {', '.join(high_card_cols[:3])}) to avoid high-dimensional one-hot explosion.")
    if outliers_pct > 2.0:
        recommendations.append(f"Examine {outlier_cells} potential outlier records across numeric features to assess measurement error or extreme business transactions.")

    if not recommendations:
        recommendations.append("Dataset exhibits pristine data hygiene with 0 missing values and no duplicates detected.")

    return {
        "score": quality_score,
        "missing_count": missing_total,
        "missing_pct": round(missing_pct, 2),
        "duplicates_count": duplicates_count,
        "duplicates_pct": round(duplicates_pct, 2),
        "empty_cols": empty_cols,
        "constant_cols": constant_cols,
        "potential_numeric": potential_numeric,
        "high_card_cols": high_card_cols,
        "outlier_cells": outlier_cells,
        "outliers_pct": round(outliers_pct, 2),
        "outliers_by_col": outliers_by_col,
        "recommendations": recommendations,
    }
