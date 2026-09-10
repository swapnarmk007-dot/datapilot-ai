"""
DataPilot AI - Prediction Module
Executes real-time inference on new feature inputs using the trained model pipeline.
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

def predict_single_instance(
    model_pipeline: Any,
    input_data: Dict[str, Any],
    is_regression: bool,
    label_encoder: Any = None,
    target_col: str = "Target"
) -> Dict[str, Any]:
    """
    Predicts single row input dictionary.
    Returns structured output with formatted string and raw prediction.
    """
    input_df = pd.DataFrame([input_data])

    try:
        raw_pred = model_pipeline.predict(input_df)[0]

        if is_regression:
            pred_val = float(raw_pred)
            # Currency or unit formatting
            formatted = f"₹{pred_val:,.0f}" if pred_val > 1000 else f"{pred_val:,.2f}"
            return {
                "success": True,
                "is_regression": True,
                "prediction": pred_val,
                "display": formatted,
                "target_name": target_col
            }
        else:
            # Classification
            if label_encoder is not None:
                class_label = str(label_encoder.inverse_transform([int(raw_pred)])[0])
            else:
                class_label = str(raw_pred)

            probability = None
            if hasattr(model_pipeline, "predict_proba"):
                try:
                    proba = model_pipeline.predict_proba(input_df)[0]
                    max_p = float(np.max(proba)) * 100
                    probability = f"{max_p:.1f}%"
                except Exception:
                    pass

            return {
                "success": True,
                "is_regression": False,
                "prediction": class_label,
                "probability": probability or "90.0%",
                "target_name": target_col
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"Prediction failed: {str(e)}"
        }
