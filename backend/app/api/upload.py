from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from .. import models, database
from ..services import eda_extractor
from typing import Optional
import time

router = APIRouter(
    prefix="/api/dataset",
    tags=['Datasets']
)

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    is_public: bool = Form(False),
    # db: Session = Depends(database.get_db) # Usually we auth here and use DB, simulated for now
):
    start_time = time.time()
    try:
        content = await file.read()
        
        # Save payload statically into runtime server memory
        import os
        temp_path = os.path.join(os.getcwd(), "temp_dataset.csv")
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # 1. Parse File into DataFrame
        df = eda_extractor.parse_file(content, file.filename)
        
        # 2. Extract Autonomous EDA
        eda_results = eda_extractor.generate_eda_summary(df)

        elapsed_time = round(time.time() - start_time, 3)

        # 3. Normally we would store the actual DB records here under models.Dataset and models.AnalysisResult
        #    For this project's initial deployment validation, we return the parsed JSON immediately.
        
        return {
            "message": "Dataset Successfully Injected and Analyzed.",
            "filename": file.filename,
            "processing_time_seconds": elapsed_time,
            "eda": eda_results
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error processing dataset: {str(e)}")

@router.delete("/clear")
async def clear_dataset():
    """Remove the active dataset from server memory."""
    import os, glob
    temp_path = os.path.join(os.getcwd(), "temp_dataset.csv")
    removed = False
    if os.path.exists(temp_path):
        os.remove(temp_path)
        removed = True
    return {
        "message": "Dataset cleared successfully." if removed else "No active dataset found.",
        "cleared": removed
    }
