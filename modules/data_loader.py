"""
DataPilot AI - Data Loader Module
Handles multi-format dataset ingestion (CSV, XLSX, XLS) with robust error checks.
"""

import pandas as pd
import io
from typing import Tuple, Dict, Any, Optional

def load_dataset(file_obj, filename: str) -> Tuple[Optional[pd.DataFrame], Optional[str]]:
    """
    Loads uploaded CSV, XLSX, or XLS file into a pandas DataFrame.
    Returns (df, error_message).
    """
    if file_obj is None:
        return None, "No file uploaded. Please upload a CSV or Excel file."

    try:
        fname = filename.lower()
        if fname.endswith(".csv"):
            # Try utf-8 then latin-1 fallback
            try:
                df = pd.read_csv(file_obj)
            except UnicodeDecodeError:
                if hasattr(file_obj, "seek"):
                    file_obj.seek(0)
                df = pd.read_csv(file_obj, encoding="latin-1")
        elif fname.endswith(".xlsx") or fname.endswith(".xls"):
            df = pd.read_excel(file_obj)
        else:
            return None, "Unsupported file format. Please upload .csv, .xlsx, or .xls"

        if df.empty:
            return None, "The uploaded file contains an empty dataset (0 rows)."

        return df, None
    except Exception as e:
        return None, f"Failed to read dataset: {str(e)}"

def get_dataset_overview(df: pd.DataFrame, filename: str = "Dataset") -> Dict[str, Any]:
    """
    Computes statistical and structural overview of the dataset.
    """
    if df is None or df.empty:
        return {}

    num_cols = df.select_dtypes(include=["number"]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    date_cols = df.select_dtypes(include=["datetime"]).columns.tolist()

    # Memory in KB or MB
    mem_bytes = df.memory_usage(deep=True).sum()
    if mem_bytes > 1024 * 1024:
        mem_str = f"{mem_bytes / (1024 * 1024):.2f} MB"
    else:
        mem_str = f"{mem_bytes / 1024:.1f} KB"

    missing_count = int(df.isna().sum().sum())
    dup_count = int(df.duplicated().sum())

    return {
        "filename": filename,
        "rows": len(df),
        "columns": len(df.columns),
        "numerical_cols": num_cols,
        "categorical_cols": cat_cols,
        "date_cols": date_cols,
        "num_count": len(num_cols),
        "cat_count": len(cat_cols),
        "missing_values": missing_count,
        "duplicate_rows": dup_count,
        "memory_usage": mem_str,
    }
