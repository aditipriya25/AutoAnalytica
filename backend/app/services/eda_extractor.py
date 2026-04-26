import pandas as pd
import numpy as np
import io

def parse_file(content: bytes, filename: str) -> pd.DataFrame:
    """Parses raw byte content into a Pandas DataFrame based on file extension."""
    if filename.endswith(".csv"):
        return pd.read_csv(io.BytesIO(content))
    elif filename.endswith(".xlsx"):
        return pd.read_excel(io.BytesIO(content))
    elif filename.endswith(".json"):
        return pd.read_json(io.BytesIO(content))
    else:
        raise ValueError("Unsupported File Type. Use CSV, XLSX, or JSON.")

def generate_eda_summary(df: pd.DataFrame) -> dict:
    """Extracts a master dictionary of EDA parameters from a given DataFrame."""
    
    # 1. Dataset Shape
    rows, cols = df.shape
    
    # 2. Schema breakdown
    schema = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        null_cnt = int(df[col].isnull().sum())
        unique_cnt = int(df[col].nunique())
        schema.append({
            "name": col,
            "type": dtype,
            "null_count": null_cnt,
            "unique_values": unique_cnt
        })

    # 3. Statistical Summary (only for numeric)
    numeric_df = df.select_dtypes(include=[np.number])
    stats_data = {}
    if not numeric_df.empty:
        desc = numeric_df.describe().to_dict()
        for col, col_stats in desc.items():
            stats_data[col] = {
                "mean": col_stats.get("mean", 0),
                "std": col_stats.get("std", 0),
                "min": col_stats.get("min", 0),
                "max": col_stats.get("max", 0),
                "skewness": numeric_df[col].skew(),
                "kurtosis": numeric_df[col].kurtosis()
            }
            # Handle NaNs from skewness/kurtosis calculations
            for k, v in stats_data[col].items():
                if pd.isna(v):
                    stats_data[col][k] = 0

    # 4. Categorical Summary (for object, string, boolean types)
    categorical_df = df.select_dtypes(exclude=[np.number])
    cat_stats_data = {}
    if not categorical_df.empty:
        try:
            # Drop datetimes since describe behaves differently
            cat_df_safe = categorical_df.select_dtypes(include=['object', 'string', 'bool', 'category'])
            if not cat_df_safe.empty:
                desc = cat_df_safe.describe().to_dict()
                for col, col_stats in desc.items():
                    cat_stats_data[col] = {
                        "count": col_stats.get("count", 0),
                        "unique": col_stats.get("unique", 0),
                        "top": str(col_stats.get("top", "")),
                        "freq": col_stats.get("freq", 0)
                    }
        except Exception:
            pass

    return {
        "overview": {
            "rows": rows,
            "columns": cols,
            "memory_usage_kb": int(df.memory_usage(deep=True).sum() / 1024)
        },
        "schema": schema,
        "statistical_summary": stats_data,
        "categorical_summary": cat_stats_data
    }
