from pydantic import BaseModel
from typing import List, Optional


class TestCase(BaseModel):
    input: str
    expected_output: str


class EvalRequest(BaseModel):
    prompt_template: str
    test_cases: List[TestCase]
    models: List[str]
    name: str


class DimensionScore(BaseModel):
    accuracy: float
    relevance: float
    coherence: float
    hallucination_risk: float
    total: float


class ModelOutput(BaseModel):
    model: str
    test_case_index: int
    input: str
    expected: str
    actual_output: str
    scores: DimensionScore
    judge_reasoning: str


class EvalResult(BaseModel):
    eval_id: str
    name: str
    prompt_template: str
    model_outputs: List[ModelOutput]
    leaderboard: List[dict]
    judge_verdict: str
    created_at: str
    mode: str
