from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine

# Automatically create all tables in the database (SQLite for local, Neon.tech for production)
models.Base.metadata.create_all(bind=engine)

from .api import auth, upload, ml, nlp, clustering, outliers, chat

app = FastAPI(
    title="AutoAnalytica API",
    description="Autonomous Data Analysis System backend powered by FastAPI, Pandas & Scikit-Learn.",
    version="1.0.0"
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(ml.router)
app.include_router(nlp.router)
app.include_router(clustering.router)
app.include_router(outliers.router)
app.include_router(chat.router)

# CORS configuration for Next.js frontend running locally or deployed on Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AutoAnalytica API. System is live and responding."}
