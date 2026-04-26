# AutoAnalytica — Autonomous Data Intelligence Platform

An enterprise-grade, full-stack Business Intelligence platform that autonomously analyzes datasets using **Machine Learning**, **NLP Reporting**, **Clustering**, **Outlier Detection**, and **Advanced Visualizations** — all with a premium dark-mode glassmorphism UI.

---

## Features

### Exploratory Data Analysis (EDA)
- Automatic schema detection and statistical profiling
- Distribution analysis, correlation matrices, and data quality checks

### Machine Learning Pipeline
- **Auto-detection** of Classification vs Regression tasks
- **13+ algorithms**: Random Forest, SVM, Logistic Regression, KNN, Decision Tree, Gradient Boosting, AdaBoost, Extra Trees, Ridge, Lasso, Elastic Net, SVR, Bagging
- **8 diagnostic graphs per model**: PCA projections, confusion matrices, residual plots, QQ plots, feature importance, prediction confidence, and more
- Algorithm selection dropdown with task-aware filtering

### NLP Report Engine
- **16 visualization types**: Heatmaps, scatter matrices, violin plots, CDFs, category distributions, and more
- Configurable graph selection grid with Select/Deselect All
- Markdown-based executive summaries

### Clustering and Outlier Detection
- K-Means with Elbow Method and Silhouette Analysis
- Automated outlier identification and scoring

### Advanced Visualizations
- Interactive chart builder with 15+ graph types
- Dark-mode styled matplotlib outputs

### Enterprise Features
- JWT-based authentication
- Dataset history management with per-entry delete
- Model download (.pkl) and Live Predict API
- PDF/report export capabilities

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Backend** | Python, FastAPI, Uvicorn |
| **ML/Data** | scikit-learn, pandas, numpy, matplotlib, seaborn, scipy |
| **Auth** | JWT (PyJWT), bcrypt, SQLAlchemy |
| **Database** | SQLite (dev) / PostgreSQL (prod) |

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## Project Structure

```
AutoAnalytica/
├── backend/
│   ├── app/
│   │   ├── api/           # FastAPI route handlers
│   │   │   ├── auth.py    # Authentication endpoints
│   │   │   ├── ml.py      # ML training pipeline
│   │   │   ├── nlp.py     # NLP report generation
│   │   │   ├── upload.py  # Dataset upload and management
│   │   │   └── ...
│   │   ├── services/      # Business logic engines
│   │   │   ├── ml_engine.py      # 13+ ML algorithms
│   │   │   ├── eda_extractor.py  # Statistical analysis
│   │   │   └── ...
│   │   ├── main.py        # FastAPI app entry
│   │   └── database.py    # SQLAlchemy setup
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── ml/    # ML Pipeline page
│   │   │   │   ├── nlp/   # NLP Reports page
│   │   │   │   ├── eda/   # EDA Dashboard
│   │   │   │   ├── upload/# Dataset management
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── components/    # Reusable UI components
│   └── package.json
└── README.md
```

---

## Screenshots

> Upload your dataset → Auto-analyze → Train ML models → Generate reports

---

## Author

**Aditi Priya** — [GitHub](https://github.com/aditipriya25)
