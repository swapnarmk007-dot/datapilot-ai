"""
DataPilot AI - Visualization Module
Produces interactive charts using Plotly and Matplotlib/Seaborn for Streamlit.
"""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional, List

def create_histogram(df: pd.DataFrame, col: str, nbins: int = 25) -> go.Figure:
    """Creates a stylized histogram with marginal box plot."""
    fig = px.histogram(
        df,
        x=col,
        nbins=nbins,
        marginal="box",
        title=f"Distribution of {col}",
        template="plotly_white",
        color_discrete_sequence=["#3b82f6"]
    )
    fig.update_layout(bargap=0.08, margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_boxplot(df: pd.DataFrame, col: str, group_by: Optional[str] = None) -> go.Figure:
    """Creates box plot to inspect median, quartiles, and outliers."""
    fig = px.box(
        df,
        x=group_by,
        y=col,
        color=group_by,
        title=f"Box Plot: {col}" + (f" grouped by {group_by}" if group_by else ""),
        template="plotly_white",
        points="outliers"
    )
    fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_scatterplot(df: pd.DataFrame, x_col: str, y_col: str, hue: Optional[str] = None) -> go.Figure:
    """Creates scatter plot with optional trendline and category hue."""
    fig = px.scatter(
        df,
        x=x_col,
        y=y_col,
        color=hue,
        trendline="ols" if len(df.dropna(subset=[x_col, y_col])) > 5 and hue is None else None,
        title=f"{y_col} vs {x_col}",
        template="plotly_white"
    )
    fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_barchart(df: pd.DataFrame, cat_col: str, num_col: Optional[str] = None, agg: str = "mean") -> go.Figure:
    """Creates aggregate bar chart or count plot."""
    if num_col:
        agg_df = df.groupby(cat_col)[num_col].agg(agg).reset_index()
        fig = px.bar(
            agg_df,
            x=cat_col,
            y=num_col,
            title=f"{agg.capitalize()} of {num_col} by {cat_col}",
            template="plotly_white",
            color_discrete_sequence=["#2563eb"]
        )
    else:
        counts = df[cat_col].value_counts().reset_index()
        counts.columns = [cat_col, "Count"]
        fig = px.bar(
            counts,
            x=cat_col,
            y="Count",
            title=f"Frequency Count of {cat_col}",
            template="plotly_white",
            color_discrete_sequence=["#4f46e5"]
        )
    fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_timeseries(df: pd.DataFrame, date_col: str, val_col: str) -> go.Figure:
    """Creates chronological line chart for date trends."""
    sorted_df = df.dropna(subset=[date_col, val_col]).sort_values(by=date_col)
    fig = px.line(
        sorted_df,
        x=date_col,
        y=val_col,
        title=f"Time Series Trend: {val_col} over {date_col}",
        template="plotly_white",
        color_discrete_sequence=["#059669"]
    )
    fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    return fig

def create_correlation_heatmap(corr_df: pd.DataFrame) -> go.Figure:
    """Creates an annotated correlation matrix heatmap."""
    fig = px.imshow(
        corr_df,
        text_auto=".2f",
        aspect="auto",
        color_continuous_scale="Blues",
        title="Pearson Correlation Matrix"
    )
    fig.update_layout(margin=dict(l=20, r=20, t=40, b=20))
    return fig
