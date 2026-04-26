import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def encode_plot_to_base64() -> str:
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", transparent=True, dpi=120)
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

def execute_kmeans(content: bytes, filename: str, n_clusters: int = 3, cleaning_strategy: str = "none") -> dict:
    """Executes K-Means clustering, returning cluster centroids and a PCA 2D reduction for plotting."""
    
    # 1. Parse File
    if filename.endswith(".csv"):
         df = pd.read_csv(io.BytesIO(content))
    elif filename.endswith(".xlsx"):
         df = pd.read_excel(io.BytesIO(content))
    else:
         raise ValueError("Unsupported format for clustering.")
         
    # 2. Preprocess (Only numeric for basic K-Means)
    df_numeric = df.select_dtypes(include=[np.number])
    
    null_count = df_numeric.isnull().any(axis=1).sum()
    if null_count > 0:
        if cleaning_strategy == "none":
            raise ValueError(f"REQUIRES_CLEANING:{null_count}")
        elif cleaning_strategy == "drop":
            df_numeric = df_numeric.dropna()
        elif cleaning_strategy == "impute":
            df_numeric = df_numeric.fillna(df_numeric.mean())
    if df_numeric.empty:
         raise ValueError("Dataset must contain numeric columns for clustering.")
         
    scaler = StandardScaler()
    scaled_data = scaler.fit_transform(df_numeric)

    # 3. K-Means
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init='auto')
    labels = kmeans.fit_predict(scaled_data)

    # 4. PCA for 2D visualization
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(scaled_data)
    
    # 5. Package results (take subset to prevent massive payload sizes)
    sample_size = min(len(labels), 1000)
    
    # Generate Matplotlib Base64 Graph
    plt.style.use("dark_background")
    plt.figure(figsize=(8, 6))
    
    x = pca_result[:sample_size, 0].tolist()
    y = pca_result[:sample_size, 1].tolist()
    color = labels[:sample_size].tolist()
    
    plt.scatter(x, y, c=color, cmap='plasma', alpha=0.8, edgecolors='w')
    plt.title(f"K-Means Clustering (K={n_clusters})")
    plt.xlabel("Principal Component 1")
    plt.ylabel("Principal Component 2")
    graph_b64 = encode_plot_to_base64()
    
    return {
        "n_clusters": n_clusters,
        "inertia": round(kmeans.inertia_, 2),
        "centroids": kmeans.cluster_centers_.tolist(),
        "x": x,
        "y": y,
        "color": color,
        "graphs": [
            {"title": f"K-Means PCA Scatter (K={n_clusters})", "base64": graph_b64}
        ]
    }
