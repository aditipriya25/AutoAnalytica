from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from ..services import outlier_engine
import time

router = APIRouter(
    prefix="/api/outliers",
    tags=['Anomaly Detection']
)

@router.post("/scan")
async def scan_dataset(
    contamination: float = Form(0.05),
    cleaning_strategy: str = Form("none")
):
    start_time = time.time()
    try:
        import os
        temp_path = os.path.join(os.getcwd(), "temp_dataset.csv")
        if not os.path.exists(temp_path):
             raise ValueError("No master dataset deployed inside cluster.")
             
        with open(temp_path, "rb") as f:
            content = f.read()
            
        results = outlier_engine.detect_outliers(content, "temp_dataset.csv", contamination, cleaning_strategy)

        return {
            "message": "Dataset accurately scanned for anomaly nodes.",
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
