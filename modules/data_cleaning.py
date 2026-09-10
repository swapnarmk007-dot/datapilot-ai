"""
DataPilot AI - Data Cleaning Module
Performs automated and non-destructive cleaning, preserving original and cleaned datasets.
"""

import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

def clean_dataset(
    df: pd.DataFrame,
    remove_duplicates: bool = True,
    fill_numeric_median: bool = True,
    fill_categorical_mode: bool = True,
    convert_numeric: bool = True,
    convert_dates: bool = True,
    drop_empty_columns: bool = True
) -> Tuple[pd.DataFrame, List[str], Dict[str, Any]]:
    """
    Executes automated data cleaning pipeline while leaving original untouched.
    Returns (cleaned_df, actions_log, cleaning_stats).
    """
    if df is None:
        return df, ["No dataset provided."], {}

    cleaned = df.copy()
    actions: List[str] = []
    initial_rows = len(cleaned)
    initial_cols = len(cleaned.columns)

    # 1. Remove completely empty columns
    if drop_empty_columns:
        empty_cols = [c for c in cleaned.columns if cleaned[c].isna().all()]
        if empty_cols:
            cleaned = cleaned.drop(columns=empty_cols)
            actions.append(f"Dropped {len(empty_cols)} completely empty columns: {', '.join(empty_cols)}")

    # 2. Remove duplicate rows
    if remove_duplicates:
        dups = int(cleaned.duplicated().sum())
        if dups > 0:
            cleaned = cleaned.drop_duplicates().reset_index(drop=True)
            actions.append(f"Removed {dups} duplicate rows ({initial_rows} -> {len(cleaned)})")

    # 3. Convert suitable string columns to numeric
    if convert_numeric:
        for c in cleaned.select_dtypes(include=["object"]).columns:
            # Check if majority of non-null values look numeric
            series_str = cleaned[c].dropna().astype(str).str.strip()
            if len(series_str) > 0:
                cleaned_str = series_str.str.replace(r"[$,%₹,]", "", regex=True)
                converted = pd.to_numeric(cleaned_str, errors="coerce")
                if converted.notna().sum() / len(series_str) > 0.85:
                    cleaned[c] = pd.to_numeric(cleaned[c].astype(str).str.replace(r"[$,%₹,]", "", regex=True), errors="coerce")
                    actions.append(f"Converted column '{c}' to numeric")

    # 4. Convert date columns
    if convert_dates:
        for c in cleaned.select_dtypes(include=["object"]).columns:
            if "date" in c.lower() or "time" in c.lower() or "day" in c.lower():
                try:
                    converted_dt = pd.to_datetime(cleaned[c], errors="coerce")
                    if converted_dt.notna().sum() / len(cleaned[c].dropna()) > 0.7:
                        cleaned[c] = converted_dt
                        actions.append(f"Parsed column '{c}' into standard DateTime")
                except Exception:
                    pass

    # 5. Handle missing numerical values using median
    if fill_numeric_median:
        num_cols = cleaned.select_dtypes(include=["number"]).columns
        for c in num_cols:
            missing_num = int(cleaned[c].isna().sum())
            if missing_num > 0:
                med_val = cleaned[c].median()
                cleaned[c] = cleaned[c].fillna(med_val)
                actions.append(f"Filled {missing_num} missing values in '{c}' with median ({med_val:.2f})")

    # 6. Handle missing categorical values using mode
    if fill_categorical_mode:
        cat_cols = cleaned.select_dtypes(include=["object", "category"]).columns
        for c in cat_cols:
            missing_cat = int(cleaned[c].isna().sum())
            if missing_cat > 0:
                mode_series = cleaned[c].mode()
                mode_val = mode_series.iloc[0] if not mode_series.empty else "Unknown"
                cleaned[c] = cleaned[c].fillna(mode_val)
                actions.append(f"Filled {missing_cat} missing values in '{c}' with mode ('{mode_val}')")

    if not actions:
        actions.append("No cleaning modifications were required; dataset already clean.")

    stats = {
        "initial_rows": initial_rows,
        "final_rows": len(cleaned),
        "initial_cols": initial_cols,
        "final_cols": len(cleaned.columns),
        "removed_rows": initial_rows - len(cleaned),
        "actions_count": len(actions),
    }

    return cleaned, actions, stats
