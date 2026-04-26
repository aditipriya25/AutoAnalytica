from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from ..services import clustering_engine
import time

router = APIRouter(
    prefix="/api/clustering",
    tags=['Unsupervised Learning']
)

@router.post("/kmeans")
async def run_kmeans(
    clusters: int = Form(3),
    cleaning_strategy: str = Form("none")
):
    start_time = time.time()
    try:
        import os
        temp_path = os.path.join(os.getcwd(), "temp_dataset.csv")
        if not os.path.exists(temp_path):
             raise ValueError("No active dataset detected in cluster. Upload data first.")
             
        with open(temp_path, "rb") as f:
            content = f.read()
        
        # Execute Clustering
        results = clustering_engine.execute_kmeans(content, "temp_dataset.csv", clusters, cleaning_strategy)

        return {
            "message": "K-Means execution successfully plotted.",
            "processing_time_seconds": round(time.time() - start_time, 3),
            "results": results
        }
    except ValueError as e:
        if str(e).startswith("REQUIRES_CLEANING:"):
            null_count = str(e).split(":")[1]
            raise HTTPException(status_code=428, detail=f"REQUIRES_CLEANING:{null_count}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
