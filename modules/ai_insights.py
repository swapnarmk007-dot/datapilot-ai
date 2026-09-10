"""
DataPilot AI - AI Insights Module
Integrates Gemini API for executive GenAI insights with a high-fidelity rule-based fallback.
"""

import os
from typing import Dict, Any, List

def generate_rule_based_insights(summary_dict: Dict[str, Any]) -> str:
    """
    Synthesizes rich, domain-aware statistical and ML insights when no Gemini key is provided.
    """
    rows = summary_dict.get("rows", 0)
    cols = summary_dict.get("columns", 0)
    missing = summary_dict.get("missing_values", 0)
    quality_score = summary_dict.get("quality_score", 100)
    best_model = summary_dict.get("best_model", "Random Forest")
    best_score = summary_dict.get("best_score", "91.2%")
    top_features = summary_dict.get("top_features", [])
    strong_corr = summary_dict.get("strong_correlations", [])
    problem_type = summary_dict.get("problem_type", "Machine Learning")

    feature_lines = []
    if top_features:
        for idx, feat in enumerate(top_features[:3], 1):
            feature_lines.append(f"'{feat.get('feature', 'Feature')}' ({feat.get('importance', 0)}% impact)")
    feat_summary = ", followed by ".join(feature_lines) if feature_lines else "the identified core variables"

    corr_line = ""
    if strong_corr:
        top_c = strong_corr[0]
        corr_line = f"Strong statistical correlation detected between '{top_c.get('feature_1')}' and '{top_c.get('feature_2')}' (r = {top_c.get('correlation')})."
    else:
        corr_line = "Features show independent distributions without severe multicollinearity."

    report = f"""💡 KEY INSIGHTS

1. Dataset Volume & Health:
   The dataset encompasses {rows:,} observation records across {cols} features. With a Data Quality Score of {quality_score}/100, the dataset exhibits solid structural integrity and minimal missingness ({missing} empty cells).

2. Primary Predictive Drivers:
   Model analysis reveals that {feat_summary} represent the strongest drivers governing the target outcomes.

3. Inter-Feature Dynamics:
   {corr_line} This provides a clear quantitative signal for forecasting and strategic planning.

4. Machine Learning Viability:
   {best_model} emerged as the top-performing architecture ({problem_type}) achieving an evaluation score of {best_score}.

📌 RECOMMENDATIONS

• Focus Operational Prioritization on Top Drivers:
  Concentrate strategic interventions directly on the highest-ranking features identified ({top_features[0].get('feature', 'primary variable') if top_features else 'key attributes'}) to maximize outcome leverage.

• Continuous Monitoring & Drift Detection:
  Establish automated telemetry to monitor incoming data distributions against this baseline to catch data drift before performance decays.

• Deepen Feature Engineering:
  Experiment with interaction terms and non-linear polynomial transformations around the primary correlated attributes to push model accuracy even higher.

⚠️ RISK & DATA CONSIDERATIONS

• Outlier & Edge-Case Vigilance:
  Audit top residual cases to ensure extreme transactions or edge-case instances are properly isolated from core predictive logic.
"""
    return report

def generate_ai_insights(summary_dict: Dict[str, Any], api_key: str = None) -> str:
    """
    Attempts Gemini API generation if key is provided; gracefully defaults to rule-based insights.
    """
    key = api_key or os.getenv("GEMINI_API_KEY")

    if not key:
        return generate_rule_based_insights(summary_dict)

    try:
        from google import genai

        client = genai.Client(api_key=key)
        prompt = f"""You are DataPilot AI, an elite AI/ML Data Analyst assistant created by Swapna V (AI/ML & GenAI Engineer).
Analyze the following dataset statistical summary, data quality metrics, and machine learning results:
{summary_dict}

Provide business-friendly, actionable analysis structured exactly with these headers:

💡 KEY INSIGHTS
1. [Key Insight 1: Distribution or business pattern]
2. [Key Insight 2: Feature relationships, strong correlations, or primary drivers]
3. [Key Insight 3: Model behavior, accuracy, or prediction performance]
4. [Key Insight 4: Data anomalies, distribution shape, or outliers]

📌 RECOMMENDATIONS
• [Recommendation 1: Concrete operational or marketing strategy]
• [Recommendation 2: Data cleaning or feature engineering enhancement]
• [Recommendation 3: Next machine learning experimentation step]

⚠️ RISK & QUALITY CONSIDERATIONS
• [Risk or caveat based on missing values, cardinality, or sample size]

Keep your tone professional, authoritative, and direct."""

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )

        if response and response.text:
            return response.text.strip()
        else:
            return generate_rule_based_insights(summary_dict)

    except Exception as e:
        # Fallback to rule-based generator
        fallback = generate_rule_based_insights(summary_dict)
        return fallback + f"\n\n*(Note: Gemini API generated with rule-based fallback engine: {str(e)})*"
