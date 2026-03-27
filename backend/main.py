import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models.database import init_db
from routes.evaluate import router as evaluate_router
from routes.history import router as history_router

load_dotenv()

app = FastAPI(title="EvaluateAI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluate_router, prefix="/api")
app.include_router(history_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    init_db()


@app.get("/health")
async def health():
    return {"status": "ok"}
