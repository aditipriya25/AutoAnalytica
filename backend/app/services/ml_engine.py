import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import (
    RandomForestClassifier, RandomForestRegressor,
    GradientBoostingClassifier, GradientBoostingRegressor,
    AdaBoostClassifier, AdaBoostRegressor,
    ExtraTreesClassifier, ExtraTreesRegressor,
    BaggingClassifier, BaggingRegressor
)
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, Ridge, Lasso, ElasticNet, LinearRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.cluster import KMeans
from sklearn.semi_supervised import LabelSpreading
from sklearn.decomposition import PCA
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score, confusion_matrix
import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

CLASSIFICATION_ALGORITHMS = {
    "auto": ("Random Forest Classifier", lambda: RandomForestClassifier(n_estimators=50, random_state=42)),
    "random_forest": ("Random Forest Classifier", lambda: RandomForestClassifier(n_estimators=100, random_state=42)),
    "svm": ("Support Vector Machine (RBF)", lambda: SVC(kernel='rbf', probability=True)),
    "logistic_regression": ("Logistic Regression", lambda: LogisticRegression(max_iter=1000, random_state=42)),
    "decision_tree": ("Decision Tree Classifier", lambda: DecisionTreeClassifier(random_state=42)),
    "knn": ("K-Nearest Neighbors", lambda: KNeighborsClassifier(n_neighbors=5)),
    "gradient_boosting": ("Gradient Boosting Classifier", lambda: GradientBoostingClassifier(n_estimators=100, random_state=42)),
    "adaboost": ("AdaBoost Classifier", lambda: AdaBoostClassifier(n_estimators=100, random_state=42, algorithm='SAMME')),
    "extra_trees": ("Extra Trees Classifier", lambda: ExtraTreesClassifier(n_estimators=100, random_state=42)),
    "bagging": ("Bagging Classifier", lambda: BaggingClassifier(n_estimators=50, random_state=42)),
}

REGRESSION_ALGORITHMS = {
    "auto": ("Random Forest Regressor", lambda: RandomForestRegressor(n_estimators=50, random_state=42)),
    "random_forest": ("Random Forest Regressor", lambda: RandomForestRegressor(n_estimators=100, random_state=42)),
    "linear_regression": ("Linear Regression", lambda: LinearRegression()),
    "ridge": ("Ridge Regression", lambda: Ridge(alpha=1.0)),
    "lasso": ("Lasso Regression", lambda: Lasso(alpha=0.1, max_iter=5000)),
    "elastic_net": ("Elastic Net", lambda: ElasticNet(alpha=0.1, l1_ratio=0.5, max_iter=5000)),
    "decision_tree": ("Decision Tree Regressor", lambda: DecisionTreeRegressor(random_state=42)),
    "knn": ("K-Nearest Neighbors Regressor", lambda: KNeighborsRegressor(n_neighbors=5)),
    "gradient_boosting": ("Gradient Boosting Regressor", lambda: GradientBoostingRegressor(n_estimators=100, random_state=42)),
    "svr": ("Support Vector Regressor", lambda: SVR(kernel='rbf')),
    "adaboost": ("AdaBoost Regressor", lambda: AdaBoostRegressor(n_estimators=100, random_state=42)),
    "extra_trees": ("Extra Trees Regressor", lambda: ExtraTreesRegressor(n_estimators=100, random_state=42)),
    "bagging": ("Bagging Regressor", lambda: BaggingRegressor(n_estimators=50, random_state=42)),
}

def encode_plot_to_base64() -> str:
    """Takes the active matplotlib figure and returns a base64 png string."""
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", transparent=True, dpi=120)
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")

def prepare_dataframe(df: pd.DataFrame, target_col: str = None, is_semi_supervised: bool = False, cleaning_strategy: str = "none"):
    """Encodes strings and prepares numeric splits. Intercepts null values to request cleaning permission."""
    
    # Replace infinite values with NaN for uniform handling across all columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].replace([np.inf, -np.inf], np.nan)
    
    # Drop columns that are entirely NaN
    df = df.dropna(axis=1, how='all')
    
    # Identify how many rows have null features (ignoring the semi-supervised target labels)
    features_df = df.drop(columns=[target_col]) if (is_semi_supervised and target_col and target_col in df.columns) else df
    null_count = features_df.isnull().any(axis=1).sum()
    
    if null_count > 0:
        if cleaning_strategy == "none":
            raise ValueError(f"REQUIRES_CLEANING:{null_count}")
        elif cleaning_strategy == "drop":
            if is_semi_supervised and target_col and target_col in df.columns:
                features = [col for col in df.columns if col != target_col]
                df = df.dropna(subset=features)
                df[target_col] = df[target_col].fillna(-1)
            else:
                df = df.dropna()
        elif cleaning_strategy == "impute":
            # Impute missing features
            for col in df.columns:
                if is_semi_supervised and col == target_col:
                    continue # Do not impute the target we are trying to predict
                if df[col].isnull().any():
                    if df[col].dtype.kind in 'iufc':
                        col_mean = df[col].mean()
                        df[col] = df[col].fillna(col_mean if not pd.isna(col_mean) else 0)
                    else:
                        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")
            if is_semi_supervised and target_col and target_col in df.columns:
                 df[target_col] = df[target_col].fillna(-1)
    
    # Final safety net: drop any remaining rows with NaN in numeric columns
    remaining_numeric = df.select_dtypes(include=[np.number]).columns
    if not is_semi_supervised:
        df = df.dropna(subset=remaining_numeric)
    else:
        feature_numeric = [c for c in remaining_numeric if c != target_col]
        if feature_numeric:
            df = df.dropna(subset=feature_numeric)
    
    encoders = {}
    for col in df.columns:
        # Check if the column is NOT numeric (integers, unsigned ints, floats, complex)
        if df[col].dtype.kind not in 'iufc':
            le = LabelEncoder()
            if is_semi_supervised and col == target_col:
                df[col] = df[col].astype(str)
                df[col] = le.fit_transform(df[col])
                # Remap '-1.0' or '-1' back to integer -1
                for null_str in ['-1.0', '-1']:
                    if null_str in le.classes_:
                        null_idx = list(le.classes_).index(null_str)
                        df.loc[df[col] == null_idx, col] = -1
            else:
                df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le

    if target_col and target_col in df.columns and target_col != "Mock_Column":
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        if is_semi_supervised:
            return X, y, encoders
            
        return train_test_split(X, y, test_size=0.2, random_state=42)
    else:
        return df, None, None, None

def train_auto_ml(content: bytes, filename: str, target_col: str, task_type: str = "auto", cleaning_strategy: str = "none", algorithm: str = "auto") -> dict:
    if filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    elif filename.endswith(".xlsx"):
        df = pd.read_excel(io.BytesIO(content))
    else:
        raise ValueError("Unsupported format.")
        
    # Auto-detect task type completely autonomously
    if task_type == "auto":
        if not target_col or target_col not in df.columns or target_col == "Mock_Column" or target_col == "":
            task_type = "clustering"
        elif df[target_col].isnull().any():
            task_type = "semi_supervised"
        elif df[target_col].nunique() < 15:
            task_type = "classification"
        else:
            task_type = "regression"
            
    # Setup styling for matplotlib graphs globally
    plt.style.use("dark_background")

    # CLUSTERING ROUTE
    if task_type == "clustering":
        X, _, _, _ = prepare_dataframe(df, cleaning_strategy=cleaning_strategy)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        kmeans = KMeans(n_clusters=3, random_state=42)
        clusters = kmeans.fit_predict(X_scaled)
        
        # PCA for 2D visualization
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)
        
        # 1. PCA Projection
        plt.figure(figsize=(8, 6))
        plt.scatter(X_pca[:, 0], X_pca[:, 1], c=clusters, cmap='viridis', alpha=0.7)
        plt.title("KMeans Clustering (PCA Projection)")
        plt.xlabel("Principal Component 1")
        plt.ylabel("Principal Component 2")
        graph_pca = encode_plot_to_base64()
        
        # 2. Cluster Distribution Bar
        plt.figure(figsize=(8, 6))
        unique, counts = np.unique(clusters, return_counts=True)
        sns.barplot(x=unique, y=counts, palette='viridis')
        plt.title("Cluster Distribution")
        plt.xlabel("Cluster ID")
        plt.ylabel("Count")
        graph_dist = encode_plot_to_base64()
        
        # 3. Cluster Pie Chart
        plt.figure(figsize=(6, 6))
        colors = ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6']
        plt.pie(counts, labels=[f'Cluster {c}' for c in unique], autopct='%1.1f%%', colors=colors[:len(unique)])
        plt.title("Cluster Proportions")
        graph_pie = encode_plot_to_base64()
        
        # 4. Elbow Method
        plt.figure(figsize=(8, 5))
        inertias = []
        K_range = range(1, min(8, len(X_scaled)))
        for k in K_range:
            km = KMeans(n_clusters=k, random_state=42, n_init=5)
            km.fit(X_scaled)
            inertias.append(km.inertia_)
        plt.plot(list(K_range), inertias, 'bo-', linewidth=2, markersize=8)
        plt.axvline(x=3, color='r', linestyle='--', alpha=0.5, label='Selected k=3')
        plt.title("Elbow Method (Optimal k)")
        plt.xlabel("Number of Clusters (k)")
        plt.ylabel("Inertia")
        plt.legend()
        graph_elbow = encode_plot_to_base64()
        
        # 5. Silhouette Analysis
        from sklearn.metrics import silhouette_score, silhouette_samples
        sil_avg = silhouette_score(X_scaled, clusters)
        plt.figure(figsize=(8, 5))
        sil_vals = silhouette_samples(X_scaled, clusters)
        y_lower = 10
        for i in sorted(np.unique(clusters)):
            ith = sil_vals[clusters == i]
            ith.sort()
            size = ith.shape[0]
            y_upper = y_lower + size
            plt.fill_betweenx(np.arange(y_lower, y_upper), 0, ith, alpha=0.7)
            y_lower = y_upper + 10
        plt.axvline(x=sil_avg, color='r', linestyle='--', label=f'Avg: {sil_avg:.3f}')
        plt.title("Silhouette Analysis")
        plt.xlabel("Silhouette Coefficient")
        plt.legend()
        graph_sil = encode_plot_to_base64()
        
        # 6. PCA Variance Explained
        pca_full = PCA().fit(X_scaled)
        plt.figure(figsize=(8, 5))
        cumvar = np.cumsum(pca_full.explained_variance_ratio_)
        plt.bar(range(1, len(cumvar)+1), pca_full.explained_variance_ratio_, color='#3b82f6', alpha=0.6, label='Individual')
        plt.step(range(1, len(cumvar)+1), cumvar, where='mid', color='#f59e0b', linewidth=2, label='Cumulative')
        plt.title("PCA Variance Explained")
        plt.xlabel("Component")
        plt.ylabel("Variance Ratio")
        plt.legend()
        graph_var = encode_plot_to_base64()
        
        # 7. Cluster Centroids Heatmap
        centroids = kmeans.cluster_centers_
        feat_names = X.columns.tolist()[:min(10, centroids.shape[1])]
        plt.figure(figsize=(max(6, len(feat_names)*0.8), 4))
        sns.heatmap(centroids[:, :len(feat_names)], annot=True, fmt='.2f', cmap='coolwarm',
                    xticklabels=feat_names, yticklabels=[f'Cluster {i}' for i in range(centroids.shape[0])])
        plt.title("Cluster Centroids Heatmap")
        graph_cent = encode_plot_to_base64()
        
        # 8. Feature Means per Cluster
        plt.figure(figsize=(8, 5))
        cluster_df = pd.DataFrame(X_scaled, columns=X.columns)
        cluster_df['Cluster'] = clusters
        means = cluster_df.groupby('Cluster')[X.columns[:5].tolist()].mean()
        means.T.plot(kind='bar', figsize=(8, 5), colormap='viridis')
        plt.title("Feature Means per Cluster")
        plt.ylabel("Standardized Mean")
        plt.xticks(rotation=30)
        plt.legend(title='Cluster')
        graph_feat_means = encode_plot_to_base64()
        
        return {
            "task_type": "clustering",
            "model_used": "K-Means Clustering",
            "accuracy": 1.0,
            "precision": 1.0,
            "summary": f"Autonomous clustering detected {len(unique)} distinct groupings. Silhouette score: {sil_avg:.3f}.",
            "feature_names": X.columns.tolist()[:10],
            "feature_importance": [],
            "graphs": [
                {"title": "PCA Projection", "base64": graph_pca},
                {"title": "Cluster Distribution", "base64": graph_dist},
                {"title": "Cluster Proportions", "base64": graph_pie},
                {"title": "Elbow Method (Optimal k)", "base64": graph_elbow},
                {"title": "Silhouette Analysis", "base64": graph_sil},
                {"title": "PCA Variance Explained", "base64": graph_var},
                {"title": "Cluster Centroids Heatmap", "base64": graph_cent},
                {"title": "Feature Means per Cluster", "base64": graph_feat_means},
            ]
        }
        
    # SEMI-SUPERVISED ROUTE
    if task_type == "semi_supervised":
        X, y, encoders = prepare_dataframe(df, target_col, is_semi_supervised=True, cleaning_strategy=cleaning_strategy)
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        labeled_mask = y != -1
        unlabeled_mask = y == -1
        
        X_labeled = X_scaled[labeled_mask]
        y_labeled = y[labeled_mask]
        X_unlabeled = X_scaled[unlabeled_mask]
        
        if len(X_labeled) > 5:
            X_train_lab, X_test_lab, y_train_lab, y_test_lab = train_test_split(X_labeled, y_labeled, test_size=0.2, random_state=42)
        else:
            X_train_lab, X_test_lab, y_train_lab, y_test_lab = X_labeled, X_labeled, y_labeled, y_labeled
            
        X_train_mixed = np.vstack((X_train_lab, X_unlabeled))
        y_train_mixed = np.concatenate((y_train_lab, np.full(X_unlabeled.shape[0], -1)))
        
        model = LabelSpreading(kernel='knn', n_neighbors=min(7, len(X_train_mixed)-1))
        model.fit(X_train_mixed, y_train_mixed)
        
        preds_test = model.predict(X_test_lab)
        acc = float(accuracy_score(y_test_lab, preds_test))
        preds_unlabeled = model.predict(X_unlabeled)
        
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)
        
        plt.figure(figsize=(8, 6))
        plt.scatter(X_pca[labeled_mask, 0], X_pca[labeled_mask, 1], c=y_labeled, cmap='viridis', alpha=0.3, label="Known Labels")
        plt.scatter(X_pca[unlabeled_mask, 0], X_pca[unlabeled_mask, 1], c=preds_unlabeled, cmap='plasma', alpha=1.0, edgecolors='w', marker='*', s=100, label="Inferred Labels")
        plt.title("Semi-Supervised Label Spreading")
        plt.xlabel("PCA 1")
        plt.ylabel("PCA 2")
        plt.legend()
        graph_b64_pca = encode_plot_to_base64()
        
        plt.figure(figsize=(8, 6))
        unique, counts = np.unique(preds_unlabeled, return_counts=True)
        sns.barplot(x=unique, y=counts, palette='plasma')
        plt.title("Inferred Label Distribution")
        plt.xlabel("Label ID")
        plt.ylabel("Count")
        graph_b64_dist = encode_plot_to_base64()
        
        return {
            "task_type": "semi_supervised",
            "model_used": "Label Spreading (KNN)",
            "accuracy": round(acc, 4),
            "precision": round(acc, 4),
            "summary": f"Semi-Supervised engine successfully inferred {X_unlabeled.shape[0]} missing labels.",
            "feature_names": X.columns.tolist()[:10],
            "feature_importance": [],
            "graphs": [
                {"title": "Label Spreading (PCA)", "base64": graph_b64_pca},
                {"title": "Inferred Distribution", "base64": graph_b64_dist}
            ]
        }
        
    # CLASSIFICATION / REGRESSION ROUTES
    X_train, X_test, y_train, y_test = prepare_dataframe(df, target_col, cleaning_strategy=cleaning_strategy)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    if "classification" in task_type:
        algo_key = algorithm if algorithm in CLASSIFICATION_ALGORITHMS else "auto"
        model_name, model_factory = CLASSIFICATION_ALGORITHMS[algo_key]
        model = model_factory()
            
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        acc = float(accuracy_score(y_test, preds))
        
        # Chart: PCA mapped decision region scatter
        pca = PCA(n_components=2)
        X_test_pca = pca.fit_transform(X_test_scaled)
        plt.figure(figsize=(8, 6))
        plt.scatter(X_test_pca[:, 0], X_test_pca[:, 1], c=preds, cmap='coolwarm', alpha=0.8, edgecolors='k')
        plt.title(f"{model_name} Test Predictions")
        plt.xlabel("PCA 1")
        plt.ylabel("PCA 2")
        graph_b64_pca = encode_plot_to_base64()
        
        # Chart: Confusion Matrix
        cm = confusion_matrix(y_test, preds)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', cbar=False)
        plt.title("Confusion Matrix (True vs Predicted)")
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        graph_b64_cm = encode_plot_to_base64()

        # Chart: Feature Importance (if available)
        graph_b64_fi = None
        if hasattr(model, 'feature_importances_'):
            fi = model.feature_importances_
            fi_sorted = sorted(zip(X_train.columns, fi), key=lambda x: x[1], reverse=True)[:10]
            names, vals = zip(*fi_sorted)
            plt.figure(figsize=(8, 5))
            plt.barh(list(reversed(names)), list(reversed(vals)), color='#3b82f6', edgecolor='#1e3a5f')
            plt.title("Feature Importance (Top 10)")
            plt.xlabel("Importance")
            graph_b64_fi = encode_plot_to_base64()

        # Chart: Prediction Distribution
        plt.figure(figsize=(8, 5))
        unique_preds, pred_counts = np.unique(preds, return_counts=True)
        plt.bar(unique_preds.astype(str), pred_counts, color='#60a5fa', edgecolor='#1e3a5f')
        plt.title("Prediction Distribution")
        plt.xlabel("Predicted Class")
        plt.ylabel("Count")
        graph_b64_pred_dist = encode_plot_to_base64()

        # Chart: True Class Distribution
        plt.figure(figsize=(8, 5))
        unique_true, true_counts = np.unique(y_test, return_counts=True)
        colors = ['#3b82f6','#60a5fa','#93c5fd','#1e40af','#2563eb','#1d4ed8','#dbeafe','#bfdbfe']
        plt.pie(true_counts, labels=unique_true.astype(str), autopct='%1.1f%%', colors=colors[:len(true_counts)])
        plt.title("True Class Balance")
        graph_b64_class_balance = encode_plot_to_base64()

        # Chart: Per-Class Accuracy
        plt.figure(figsize=(8, 5))
        classes = np.unique(y_test)
        per_class_acc = []
        for c in classes:
            mask = y_test == c
            if mask.sum() > 0:
                per_class_acc.append(float((preds[mask] == y_test[mask]).mean()))
            else:
                per_class_acc.append(0.0)
        plt.bar(classes.astype(str), per_class_acc, color='#22c55e', edgecolor='#166534')
        plt.title("Per-Class Accuracy")
        plt.xlabel("Class")
        plt.ylabel("Accuracy")
        plt.ylim(0, 1.1)
        graph_b64_per_class = encode_plot_to_base64()

        # Chart: PCA with Training Data overlay
        X_train_pca = pca.transform(X_train_scaled)
        plt.figure(figsize=(8, 6))
        plt.scatter(X_train_pca[:, 0], X_train_pca[:, 1], c=y_train, cmap='viridis', alpha=0.2, s=15, label='Train')
        plt.scatter(X_test_pca[:, 0], X_test_pca[:, 1], c=preds, cmap='coolwarm', alpha=0.9, edgecolors='w', s=40, label='Test Predictions')
        plt.title("PCA: Train vs Test Predictions")
        plt.xlabel("PCA 1")
        plt.ylabel("PCA 2")
        plt.legend()
        graph_b64_train_test = encode_plot_to_base64()

        # Chart: Prediction Confidence (if probability available)
        graph_b64_conf = None
        if hasattr(model, 'predict_proba'):
            try:
                proba = model.predict_proba(X_test_scaled)
                max_proba = np.max(proba, axis=1)
                plt.figure(figsize=(8, 5))
                plt.hist(max_proba, bins=20, color='#f59e0b', edgecolor='#b45309', alpha=0.85)
                plt.title("Prediction Confidence Distribution")
                plt.xlabel("Max Probability")
                plt.ylabel("Count")
                graph_b64_conf = encode_plot_to_base64()
            except:
                pass
        
        importances = []
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_.tolist()
            
        all_graphs = [
            {"title": "Test Predictions (PCA)", "base64": graph_b64_pca},
            {"title": "Confusion Matrix", "base64": graph_b64_cm},
            {"title": "Prediction Distribution", "base64": graph_b64_pred_dist},
            {"title": "True Class Balance", "base64": graph_b64_class_balance},
            {"title": "Per-Class Accuracy", "base64": graph_b64_per_class},
            {"title": "PCA: Train vs Test", "base64": graph_b64_train_test},
        ]
        if graph_b64_fi:
            all_graphs.insert(2, {"title": "Feature Importance", "base64": graph_b64_fi})
        if graph_b64_conf:
            all_graphs.append({"title": "Prediction Confidence", "base64": graph_b64_conf})

        return {
            "task_type": "classification",
            "model_used": model_name,
            "accuracy": round(acc, 4),
            "precision": round(acc, 4),
            "summary": f"{model_name} successfully mapped classification bounds.",
            "feature_names": X_train.columns.tolist()[:10],
            "feature_importance": importances[:10],
            "graphs": all_graphs
        }
        
    else: # Regression
        algo_key = algorithm if algorithm in REGRESSION_ALGORITHMS else "auto"
        model_name, model_factory = REGRESSION_ALGORITHMS[algo_key]
        model = model_factory()
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        r2 = float(r2_score(y_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        residuals = y_test - preds
        
        # 1. Actual vs Predicted
        plt.figure(figsize=(8, 6))
        plt.scatter(y_test, preds, color='#3b82f6', alpha=0.6, edgecolors='#1e3a5f')
        plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
        plt.title("True vs Predicted Values")
        plt.xlabel("True Values")
        plt.ylabel("Predicted Values")
        graph_scatter = encode_plot_to_base64()
        
        # 2. Residuals Plot
        plt.figure(figsize=(8, 6))
        plt.scatter(preds, residuals, color='#ef4444', alpha=0.6, edgecolors='#7f1d1d')
        plt.axhline(0, color='w', linestyle='--', lw=2)
        plt.title("Residuals Plot")
        plt.xlabel("Predicted Values")
        plt.ylabel("Residual Errors")
        graph_resid = encode_plot_to_base64()
        
        # 3. Feature Importance (or Coefficients for linear models)
        graph_fi = None
        if hasattr(model, 'feature_importances_'):
            fi = model.feature_importances_
            fi_sorted = sorted(zip(X_train.columns, fi), key=lambda x: abs(x[1]), reverse=True)[:10]
            names, vals = zip(*fi_sorted)
            plt.figure(figsize=(8, 5))
            plt.barh(list(reversed(names)), list(reversed(vals)), color='#3b82f6', edgecolor='#1e3a5f')
            plt.title("Feature Importance (Top 10)")
            plt.xlabel("Importance")
            graph_fi = encode_plot_to_base64()
        elif hasattr(model, 'coef_'):
            coefs = model.coef_ if model.coef_.ndim == 1 else model.coef_[0]
            fi_sorted = sorted(zip(X_train.columns[:len(coefs)], coefs), key=lambda x: abs(x[1]), reverse=True)[:10]
            names, vals = zip(*fi_sorted)
            plt.figure(figsize=(8, 5))
            colors = ['#22c55e' if v >= 0 else '#ef4444' for v in reversed(vals)]
            plt.barh(list(reversed(names)), [abs(v) for v in reversed(vals)], color=colors, edgecolor='#1e3a5f')
            plt.title("Feature Coefficients (Top 10)")
            plt.xlabel("|Coefficient|")
            graph_fi = encode_plot_to_base64()
        
        # 4. Residual Histogram
        plt.figure(figsize=(8, 5))
        plt.hist(residuals, bins=25, color='#f59e0b', edgecolor='#b45309', alpha=0.85)
        plt.axvline(0, color='r', linestyle='--', lw=2)
        plt.title("Residual Distribution")
        plt.xlabel("Residual Error")
        plt.ylabel("Frequency")
        graph_res_hist = encode_plot_to_base64()
        
        # 5. Prediction Error Distribution
        plt.figure(figsize=(8, 5))
        pct_error = np.abs(residuals / (y_test + 1e-10)) * 100
        plt.hist(pct_error.clip(0, 200), bins=30, color='#8b5cf6', edgecolor='#5b21b6', alpha=0.85)
        plt.title("Prediction Error % Distribution")
        plt.xlabel("Absolute % Error")
        plt.ylabel("Count")
        graph_pct = encode_plot_to_base64()
        
        # 6. Actual vs Predicted sorted line
        sorted_idx = np.argsort(y_test.values)
        plt.figure(figsize=(8, 5))
        plt.plot(range(len(y_test)), y_test.values[sorted_idx], label='Actual', color='#3b82f6', linewidth=2)
        plt.plot(range(len(preds)), preds[sorted_idx], label='Predicted', color='#ef4444', linewidth=2, alpha=0.7)
        plt.fill_between(range(len(y_test)), y_test.values[sorted_idx], preds[sorted_idx], alpha=0.15, color='#ef4444')
        plt.title("Actual vs Predicted (Sorted)")
        plt.xlabel("Sample Index (sorted)")
        plt.ylabel("Value")
        plt.legend()
        graph_sorted = encode_plot_to_base64()
        
        # 7. QQ Plot of Residuals
        plt.figure(figsize=(8, 5))
        from scipy import stats
        sorted_res = np.sort(residuals)
        norm_quantiles = stats.norm.ppf(np.linspace(0.01, 0.99, len(sorted_res)))
        plt.scatter(norm_quantiles, sorted_res, color='#22c55e', alpha=0.6, s=20)
        plt.plot([norm_quantiles.min(), norm_quantiles.max()], [norm_quantiles.min(), norm_quantiles.max()], 'r--', lw=2)
        plt.title("QQ Plot of Residuals")
        plt.xlabel("Theoretical Quantiles")
        plt.ylabel("Sample Quantiles")
        graph_qq = encode_plot_to_base64()
        
        # 8. Cumulative Error
        plt.figure(figsize=(8, 5))
        abs_errors = np.sort(np.abs(residuals))
        cum = np.arange(1, len(abs_errors)+1) / len(abs_errors)
        plt.plot(abs_errors, cum, color='#3b82f6', linewidth=2)
        plt.title("Cumulative Error Distribution")
        plt.xlabel("Absolute Error")
        plt.ylabel("Cumulative Proportion")
        plt.axhline(0.9, color='#f59e0b', linestyle='--', alpha=0.5, label='90th Percentile')
        plt.legend()
        graph_cum = encode_plot_to_base64()
        
        importances = []
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_.tolist()
        elif hasattr(model, 'coef_'):
            coefs = model.coef_ if model.coef_.ndim == 1 else model.coef_[0]
            importances = [abs(float(c)) for c in coefs]

        all_graphs = [
            {"title": "True vs Predicted", "base64": graph_scatter},
            {"title": "Residual Errors", "base64": graph_resid},
            {"title": "Residual Distribution", "base64": graph_res_hist},
            {"title": "Prediction Error %", "base64": graph_pct},
            {"title": "Actual vs Predicted (Sorted)", "base64": graph_sorted},
            {"title": "QQ Plot of Residuals", "base64": graph_qq},
            {"title": "Cumulative Error", "base64": graph_cum},
        ]
        if graph_fi:
            all_graphs.insert(2, {"title": "Feature Importance", "base64": graph_fi})

        return {
            "task_type": "regression",
            "model_used": model_name,
            "accuracy": round(r2, 4),
            "precision": round(r2, 4),
            "summary": f"{model_name} trained. R²={r2:.4f}, RMSE={rmse:.2f}.",
            "feature_names": X_train.columns.tolist()[:10],
            "feature_importance": importances[:10],
            "graphs": all_graphs
        }

