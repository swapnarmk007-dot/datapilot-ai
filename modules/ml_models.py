"""
DataPilot AI - Machine Learning Module
Handles automated task detection, preprocessing pipelines, model training, comparison, and evaluation.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional, List

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)

def determine_problem_type(df: pd.DataFrame, target_col: str) -> str:
    """
    Determines whether the target is Regression, Binary Classification, or Multiclass Classification.
    """
    y = df[target_col].dropna()
    unique_count = y.nunique()

    if pd.api.types.is_numeric_dtype(y) and unique_count > 10:
        return "Regression"
    elif unique_count == 2:
        return "Binary Classification"
    else:
        return "Multiclass Classification"

def train_and_evaluate_models(
    df: pd.DataFrame,
    target_col: str,
    feature_cols: Optional[List[str]] = None,
    test_size: float = 0.2,
    random_state: int = 42
) -> Dict[str, Any]:
    """
    Trains 3 relevant models, evaluates metrics, extracts feature importance, and picks best model.
    """
    if feature_cols is None:
        feature_cols = [c for c in df.columns if c != target_col]

    if not feature_cols:
        raise ValueError("At least one feature column must be selected.")

    # Drop rows where target is missing
    clean_df = df.dropna(subset=[target_col]).copy()
    if len(clean_df) < 10:
        raise ValueError("Dataset has fewer than 10 valid rows with non-null target values.")

    X = clean_df[feature_cols]
    y_raw = clean_df[target_col]

    problem_type = determine_problem_type(df, target_col)
    is_regression = problem_type == "Regression"

    # Encoding target for classification if needed
    label_encoder = None
    if not is_regression:
        label_encoder = LabelEncoder()
        y = label_encoder.fit_transform(y_raw.astype(str))
    else:
        y = y_raw.values.astype(float)

    # Split features
    num_features = X.select_dtypes(include=["number"]).columns.tolist()
    cat_features = X.select_dtypes(include=["object", "category"]).columns.tolist()

    # Create preprocessing pipelines
    transformers = []
    if num_features:
        num_transformer = Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ])
        transformers.append(("num", num_transformer, num_features))

    if cat_features:
        cat_transformer = Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
        ])
        transformers.append(("cat", cat_transformer, cat_features))

    preprocessor = ColumnTransformer(transformers=transformers, remainder="drop")

    # Train / Test split
    stratify = y if not is_regression and np.min(np.bincount(y)) >= 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=stratify
    )

    models_to_train = {}
    if is_regression:
        models_to_train = {
            "Linear Regression": LinearRegression(),
            "Random Forest Regressor": RandomForestRegressor(n_estimators=100, random_state=random_state, max_depth=6),
            "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=100, random_state=random_state, max_depth=4)
        }
    else:
        models_to_train = {
            "Logistic Regression": LogisticRegression(max_iter=1000, random_state=random_state),
            "Random Forest Classifier": RandomForestClassifier(n_estimators=100, random_state=random_state, max_depth=6),
            "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=100, random_state=random_state, max_depth=4)
        }

    comparison_results = []
    trained_pipelines = {}
    best_model_name = ""
    best_score = -float("inf")

    for name, model_inst in models_to_train.items():
        pipe = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model_inst)
        ])

        try:
            pipe.fit(X_train, y_train)
            y_pred = pipe.predict(X_test)
            trained_pipelines[name] = pipe

            if is_regression:
                mae = float(mean_absolute_error(y_test, y_pred))
                mse = float(mean_squared_error(y_test, y_pred))
                rmse = float(np.sqrt(mse))
                r2 = float(r2_score(y_test, y_pred))
                score_pct = max(0.0, r2 * 100)

                comparison_results.append({
                    "Model": name,
                    "Score": f"{score_pct:.1f}%",
                    "R² Score": round(r2, 4),
                    "MAE": round(mae, 2),
                    "MSE": round(mse, 2),
                    "RMSE": round(rmse, 2),
                    "primary_metric": r2
                })

                if r2 > best_score:
                    best_score = r2
                    best_model_name = name
            else:
                acc = float(accuracy_score(y_test, y_pred))
                prec = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
                rec = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
                f1 = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
                score_pct = acc * 100

                cm = confusion_matrix(y_test, y_pred).tolist()

                comparison_results.append({
                    "Model": name,
                    "Score": f"{score_pct:.1f}%",
                    "Accuracy": round(acc, 4),
                    "Precision": round(prec, 4),
                    "Recall": round(rec, 4),
                    "F1 Score": round(f1, 4),
                    "Confusion Matrix": cm,
                    "primary_metric": acc
                })

                if acc > best_score:
                    best_score = acc
                    best_model_name = name

        except Exception as e:
            comparison_results.append({
                "Model": name,
                "Score": "Error",
                "Error": str(e),
                "primary_metric": -999
            })

    # Extract feature importance from the best tree-based model
    feature_importance = []
    tree_model_name = "Random Forest Regressor" if is_regression else "Random Forest Classifier"
    if tree_model_name not in trained_pipelines:
        tree_model_name = "Gradient Boosting Regressor" if is_regression else "Gradient Boosting Classifier"

    if tree_model_name in trained_pipelines:
        tree_pipe = trained_pipelines[tree_model_name]
        try:
            fitted_prep = tree_pipe.named_steps["preprocessor"]
            feature_names = []
            if hasattr(fitted_prep, "get_feature_names_out"):
                raw_names = fitted_prep.get_feature_names_out()
                feature_names = [n.replace("num__", "").replace("cat__", "") for n in raw_names]
            else:
                feature_names = num_features + cat_features

            importances = tree_pipe.named_steps["model"].feature_importances_
            total_imp = sum(importances) if sum(importances) > 0 else 1.0

            fi_list = []
            for fn, imp in zip(feature_names, importances):
                pct = round((imp / total_imp) * 100, 1)
                fi_list.append({"feature": fn, "importance": pct})

            fi_list.sort(key=lambda x: x["importance"], reverse=True)
            feature_importance = fi_list[:10]
        except Exception:
            pass

    return {
        "problem_type": problem_type,
        "is_regression": is_regression,
        "comparison_table": comparison_results,
        "best_model_name": best_model_name,
        "best_score_formatted": f"{max(0.0, best_score * 100):.1f}%" if best_score != -float("inf") else "N/A",
        "feature_importance": feature_importance,
        "trained_pipelines": trained_pipelines,
        "feature_cols": feature_cols,
        "target_col": target_col,
        "label_encoder": label_encoder,
        "train_size": len(X_train),
        "test_size": len(X_test)
    }
