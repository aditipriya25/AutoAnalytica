from fastapi import APIRouter, HTTPException
import os
import pandas as pd
from ..services import insight_generator

router = APIRouter(
    prefix="/api/nlp",
    tags=['NLP Insights']
)

@router.post("/generate")
async def get_nlp_insights(eda_summary: dict):
    try:
        # Agentic Loop Injection
        temp_path = os.path.join(os.getcwd(), "temp_dataset.csv")
        if os.path.exists(temp_path):
            df = pd.read_csv(temp_path)
            eda_summary = insight_generator.run_agentic_loop(df, eda_summary)
            
        insights = insight_generator.generate_business_insights(eda_summary)
        return {
            "message": "NLP Generation Securely Executed",
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NLP Engine Error: {str(e)}")

@router.post("/comprehensive")
async def get_comprehensive_report(payload: dict):
    try:
        eda = payload.get("eda", {})
        ml = payload.get("ml", None)
        outliers = payload.get("outliers", None)
        clustering = payload.get("clustering", None)
        markdown_text = insight_generator.generate_comprehensive_report(eda, ml, outliers, clustering)
        return {
            "message": "Comprehensive Report Generated",
            "markdown": markdown_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive Engine Error: {str(e)}")


def _make_chart(fig):
    """Helper: render a matplotlib figure to base64 PNG string."""
    import io, base64
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=120, bbox_inches='tight', facecolor='#0f172a')
    import matplotlib.pyplot as plt
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode('utf-8')


def _style_ax(ax):
    """Helper: apply dark theme to an axis."""
    ax.set_facecolor('#0f172a')
    ax.tick_params(colors='#94a3b8')
    for spine in ['bottom', 'left']:
        ax.spines[spine].set_color('#334155')
    for spine in ['top', 'right']:
        ax.spines[spine].set_visible(False)


@router.post("/report")
async def get_nlp_report(eda_summary: dict):
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import numpy as np

        # Extract user graph preferences
        selected_graphs = eda_summary.pop("selected_graphs", [])

        # Agentic Loop Injection
        temp_path = os.path.join(os.getcwd(), "temp_dataset.csv")
        df = None
        if os.path.exists(temp_path):
            df = pd.read_csv(temp_path)
            eda_summary = insight_generator.run_agentic_loop(df, eda_summary)

        markdown_report = insight_generator.generate_nlp_report(eda_summary)

        # Generate graphs as separate array
        graphs = []
        if df is not None and len(selected_graphs) > 0:
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            cat_cols = df.select_dtypes(include=['object', 'string']).columns.tolist()

            # 1. Histogram
            if "histogram" in selected_graphs and len(numeric_cols) > 0:
                cols = numeric_cols[:4]
                fig, axes = plt.subplots(1, len(cols), figsize=(5 * len(cols), 4))
                if len(cols) == 1: axes = [axes]
                for ax, col in zip(axes, cols):
                    ax.hist(df[col].dropna(), bins=20, color='#3b82f6', edgecolor='#1e3a5f', alpha=0.85)
                    ax.set_title(col, fontsize=12, fontweight='bold', color='#e2e8f0')
                    _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                fig.suptitle('Numeric Feature Distributions', fontsize=14, fontweight='bold', color='#e2e8f0')
                plt.tight_layout()
                graphs.append({"title": "Numeric Feature Distributions", "base64": _make_chart(fig)})

            # 2. Correlation Heatmap
            if "correlation" in selected_graphs and len(numeric_cols) >= 2:
                corr = df[numeric_cols].corr()
                fig, ax = plt.subplots(figsize=(max(6, len(numeric_cols)), max(5, len(numeric_cols) * 0.8)))
                cax = ax.matshow(corr, cmap='coolwarm', vmin=-1, vmax=1)
                fig.colorbar(cax, ax=ax, fraction=0.046, pad=0.04)
                ax.set_xticks(range(len(numeric_cols)))
                ax.set_yticks(range(len(numeric_cols)))
                ax.set_xticklabels(numeric_cols, rotation=45, ha='left', fontsize=8, color='#94a3b8')
                ax.set_yticklabels(numeric_cols, fontsize=8, color='#94a3b8')
                ax.set_title('Feature Correlation Heatmap', fontsize=14, fontweight='bold', color='#e2e8f0', pad=20)
                fig.patch.set_facecolor('#0f172a')
                ax.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Feature Correlation Heatmap", "base64": _make_chart(fig)})

            # 3. Categorical Bar Chart
            if "categorical" in selected_graphs and len(cat_cols) > 0:
                target_cat = cat_cols[0]
                vc = df[target_cat].value_counts().head(10)
                fig, ax = plt.subplots(figsize=(8, 4))
                ax.barh(vc.index.astype(str), vc.values, color='#3b82f6', edgecolor='#1e3a5f')
                ax.set_xlabel('Frequency', color='#94a3b8')
                ax.set_title(f'Top Values: "{target_cat}"', fontsize=13, fontweight='bold', color='#e2e8f0')
                _style_ax(ax)
                ax.invert_yaxis()
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": f'Categorical Distribution: "{target_cat}"', "base64": _make_chart(fig)})

            # 4. Box Plot
            if "boxplot" in selected_graphs and len(numeric_cols) >= 2:
                cols = numeric_cols[:5]
                fig, ax = plt.subplots(figsize=(8, 4))
                ax.boxplot([df[c].dropna().values for c in cols], labels=cols, patch_artist=True,
                           boxprops=dict(facecolor='#3b82f6', color='#60a5fa'),
                           medianprops=dict(color='#f59e0b', linewidth=2),
                           whiskerprops=dict(color='#94a3b8'), capprops=dict(color='#94a3b8'),
                           flierprops=dict(marker='o', markerfacecolor='#ef4444', markersize=4))
                ax.set_title('Feature Value Spread', fontsize=13, fontweight='bold', color='#e2e8f0')
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Feature Value Spread (Box Plot)", "base64": _make_chart(fig)})

            # 5. Scatter Plot (top correlated pair)
            if "scatter" in selected_graphs and len(numeric_cols) >= 2:
                corr = df[numeric_cols].corr().abs()
                corr_arr = corr.to_numpy(copy=True)
                np.fill_diagonal(corr_arr, 0)
                corr_df = pd.DataFrame(corr_arr, index=corr.index, columns=corr.columns)
                mp = corr_df.unstack().sort_values(ascending=False)
                if not mp.empty:
                    f1, f2 = mp.index[0]
                    fig, ax = plt.subplots(figsize=(7, 5))
                    ax.scatter(df[f1], df[f2], c='#3b82f6', alpha=0.6, edgecolors='#1e3a5f', s=30)
                    ax.set_xlabel(f1, color='#94a3b8', fontsize=11)
                    ax.set_ylabel(f2, color='#94a3b8', fontsize=11)
                    ax.set_title(f'Scatter: {f1} vs {f2} (r={corr_df.loc[f1,f2]:.2f})', fontsize=13, fontweight='bold', color='#e2e8f0')
                    _style_ax(ax)
                    fig.patch.set_facecolor('#0f172a')
                    plt.tight_layout()
                    graphs.append({"title": f"Scatter: {f1} vs {f2}", "base64": _make_chart(fig)})

            # 6. Pie Chart (first categorical)
            if "pie" in selected_graphs and len(cat_cols) > 0:
                target = cat_cols[0]
                vc = df[target].value_counts().head(8)
                fig, ax = plt.subplots(figsize=(6, 6))
                colors = ['#3b82f6','#60a5fa','#93c5fd','#1e40af','#2563eb','#1d4ed8','#dbeafe','#bfdbfe']
                ax.pie(vc.values, labels=vc.index.astype(str), autopct='%1.1f%%', colors=colors[:len(vc)],
                       textprops={'color': '#e2e8f0', 'fontsize': 9})
                ax.set_title(f'Distribution: "{target}"', fontsize=13, fontweight='bold', color='#e2e8f0')
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": f'Pie Chart: "{target}"', "base64": _make_chart(fig)})

            # 7. KDE Density Plot
            if "kde" in selected_graphs and len(numeric_cols) > 0:
                fig, ax = plt.subplots(figsize=(8, 4))
                for col in numeric_cols[:4]:
                    df[col].dropna().plot.kde(ax=ax, label=col, linewidth=2)
                ax.set_title('Kernel Density Estimation', fontsize=13, fontweight='bold', color='#e2e8f0')
                ax.legend(fontsize=9, facecolor='#0f172a', edgecolor='#334155', labelcolor='#94a3b8')
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "KDE Density Plot", "base64": _make_chart(fig)})

            # 8. Violin Plot
            if "violin" in selected_graphs and len(numeric_cols) >= 2:
                cols = numeric_cols[:5]
                fig, ax = plt.subplots(figsize=(8, 4))
                parts = ax.violinplot([df[c].dropna().values for c in cols], showmeans=True, showmedians=True)
                for pc in parts['bodies']:
                    pc.set_facecolor('#3b82f6')
                    pc.set_alpha(0.7)
                ax.set_xticks(range(1, len(cols)+1))
                ax.set_xticklabels(cols, fontsize=9, color='#94a3b8')
                ax.set_title('Violin Plot', fontsize=13, fontweight='bold', color='#e2e8f0')
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Violin Plot", "base64": _make_chart(fig)})

            # 9. Bar Chart: Mean per Numeric Feature
            if "mean_bar" in selected_graphs and len(numeric_cols) > 0:
                means = df[numeric_cols].mean()
                fig, ax = plt.subplots(figsize=(8, 4))
                ax.bar(means.index, means.values, color='#3b82f6', edgecolor='#1e3a5f')
                ax.set_title('Mean Value per Feature', fontsize=13, fontweight='bold', color='#e2e8f0')
                ax.tick_params(axis='x', rotation=30)
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Mean Value per Feature", "base64": _make_chart(fig)})

            # 10. Standard Deviation Bar
            if "std_bar" in selected_graphs and len(numeric_cols) > 0:
                stds = df[numeric_cols].std()
                fig, ax = plt.subplots(figsize=(8, 4))
                ax.bar(stds.index, stds.values, color='#f59e0b', edgecolor='#b45309')
                ax.set_title('Standard Deviation per Feature', fontsize=13, fontweight='bold', color='#e2e8f0')
                ax.tick_params(axis='x', rotation=30)
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Std Deviation per Feature", "base64": _make_chart(fig)})

            # 11. Missing Values Heatmap
            if "missing" in selected_graphs:
                fig, ax = plt.subplots(figsize=(8, 4))
                nulls = df.isnull().sum()
                colors = ['#ef4444' if v > 0 else '#22c55e' for v in nulls.values]
                ax.bar(nulls.index, nulls.values, color=colors)
                ax.set_title('Missing Values per Feature', fontsize=13, fontweight='bold', color='#e2e8f0')
                ax.tick_params(axis='x', rotation=45)
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Missing Values per Feature", "base64": _make_chart(fig)})

            # 12. Pair-wise scatter matrix (top 3)
            if "pairplot" in selected_graphs and len(numeric_cols) >= 2:
                cols = numeric_cols[:3]
                n = len(cols)
                fig, axes = plt.subplots(n, n, figsize=(4*n, 4*n))
                for i, c1 in enumerate(cols):
                    for j, c2 in enumerate(cols):
                        ax = axes[i][j] if n > 1 else axes
                        if i == j:
                            ax.hist(df[c1].dropna(), bins=15, color='#3b82f6', alpha=0.7)
                        else:
                            ax.scatter(df[c2], df[c1], alpha=0.4, s=15, c='#3b82f6')
                        _style_ax(ax)
                        if i == n-1: ax.set_xlabel(c2, fontsize=8, color='#94a3b8')
                        if j == 0: ax.set_ylabel(c1, fontsize=8, color='#94a3b8')
                fig.suptitle('Pair Plot Matrix', fontsize=14, fontweight='bold', color='#e2e8f0')
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Pair Plot Matrix", "base64": _make_chart(fig)})

            # 13. Cumulative distribution
            if "cdf" in selected_graphs and len(numeric_cols) > 0:
                fig, ax = plt.subplots(figsize=(8, 4))
                for col in numeric_cols[:4]:
                    sorted_vals = np.sort(df[col].dropna())
                    cdf = np.arange(1, len(sorted_vals)+1) / len(sorted_vals)
                    ax.plot(sorted_vals, cdf, label=col, linewidth=2)
                ax.set_title('Cumulative Distribution', fontsize=13, fontweight='bold', color='#e2e8f0')
                ax.set_ylabel('CDF', color='#94a3b8')
                ax.legend(fontsize=9, facecolor='#0f172a', edgecolor='#334155', labelcolor='#94a3b8')
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Cumulative Distribution (CDF)", "base64": _make_chart(fig)})

            # 14. Categorical count for ALL cat columns
            if "cat_all" in selected_graphs and len(cat_cols) > 1:
                for ccat in cat_cols[:4]:
                    vc = df[ccat].value_counts().head(8)
                    fig, ax = plt.subplots(figsize=(8, 3.5))
                    ax.barh(vc.index.astype(str), vc.values, color='#60a5fa', edgecolor='#1e3a5f')
                    ax.set_title(f'Distribution: "{ccat}"', fontsize=13, fontweight='bold', color='#e2e8f0')
                    _style_ax(ax)
                    ax.invert_yaxis()
                    fig.patch.set_facecolor('#0f172a')
                    plt.tight_layout()
                    graphs.append({"title": f'Category: "{ccat}"', "base64": _make_chart(fig)})

            # 15. Area Chart
            if "area" in selected_graphs and len(numeric_cols) > 0:
                fig, ax = plt.subplots(figsize=(8, 4))
                for col in numeric_cols[:3]:
                    ax.fill_between(range(len(df)), df[col].values, alpha=0.3, label=col)
                    ax.plot(df[col].values, linewidth=1)
                ax.set_title('Area Chart (Feature Values)', fontsize=13, fontweight='bold', color='#e2e8f0')
                ax.legend(fontsize=9, facecolor='#0f172a', edgecolor='#334155', labelcolor='#94a3b8')
                _style_ax(ax)
                fig.patch.set_facecolor('#0f172a')
                plt.tight_layout()
                graphs.append({"title": "Area Chart", "base64": _make_chart(fig)})

            # 16. Individual histograms for ALL numeric
            if "hist_all" in selected_graphs:
                for ncol in numeric_cols:
                    fig, ax = plt.subplots(figsize=(6, 3.5))
                    ax.hist(df[ncol].dropna(), bins=25, color='#3b82f6', edgecolor='#1e3a5f', alpha=0.85)
                    ax.set_title(f'Distribution: {ncol}', fontsize=13, fontweight='bold', color='#e2e8f0')
                    _style_ax(ax)
                    fig.patch.set_facecolor('#0f172a')
                    plt.tight_layout()
                    graphs.append({"title": f"Histogram: {ncol}", "base64": _make_chart(fig)})

        return {
            "message": "NLP Report Generated",
            "markdown": markdown_report,
            "graphs": graphs
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"NLP Report Error: {str(e)}")
