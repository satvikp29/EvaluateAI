from fastapi import APIRouter, HTTPException
from models.database import get_recent_evals, get_eval_by_id

router = APIRouter()


@router.get("/history")
async def get_history():
    return get_recent_evals(limit=10)


@router.get("/history/{eval_id}")
async def get_eval(eval_id: str):
    result = get_eval_by_id(eval_id)
    if not result:
        raise HTTPException(status_code=404, detail="Eval not found")
    return result
