from fastapi import APIRouter, HTTPException
from models.schemas import EvalRequest, EvalResult
from models.database import save_eval
from services.eval_service import run_evaluation

router = APIRouter()


@router.post("/evaluate", response_model=EvalResult)
async def evaluate(request: EvalRequest):
    try:
        result = await run_evaluation(request)
        save_eval(result.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
