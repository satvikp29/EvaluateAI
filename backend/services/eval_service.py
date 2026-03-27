import os
import uuid
import random
import asyncio
import json
from datetime import datetime, timezone
from typing import List

from models.schemas import (
    EvalRequest,
    EvalResult,
    ModelOutput,
    DimensionScore,
    TestCase,
)
from services.judge_service import generate_mock_output, generate_mock_verdict


# Weighted scoring formula
def compute_total(accuracy: float, relevance: float, coherence: float, hallucination_risk: float) -> float:
    return round(accuracy * 0.35 + relevance * 0.25 + coherence * 0.20 + hallucination_risk * 0.20, 2)


def generate_mock_scores(model_name: str, prompt_template: str, input_text: str, test_case_index: int, expected_output: str = "") -> DimensionScore:
    seed = hash(model_name + prompt_template + input_text + str(test_case_index)) % (2**32)
    rng = random.Random(seed)

    # Detect task complexity: short expected output = factual / closed-ended question
    # e.g. "amaravati", "positive", "Paris" — all models score similarly tight
    expected_stripped = expected_output.strip()
    expected_words = expected_stripped.split()
    is_short_factual = len(expected_words) <= 5 and len(expected_stripped) <= 60

    if is_short_factual:
        # Factual/closed-ended: scores cluster together, only Llama dips meaningfully
        # Real-world: GPT-4o and GPT-4o-mini are both trained on this; Llama is less reliable
        profiles = {
            "gpt-4o": {
                "accuracy": (87, 95),
                "relevance": (88, 96),
                "coherence": (85, 93),
                "hallucination_risk": (86, 94),
            },
            "gpt-4o-mini": {
                "accuracy": (84, 93),
                "relevance": (85, 94),
                "coherence": (82, 91),
                "hallucination_risk": (83, 92),
            },
            "claude-3-haiku": {
                "accuracy": (83, 92),
                "relevance": (84, 93),
                "coherence": (83, 92),
                "hallucination_risk": (83, 92),
            },
            "llama-3-70b": {
                "accuracy": (74, 85),
                "relevance": (75, 86),
                "coherence": (74, 84),
                "hallucination_risk": (73, 83),
            },
        }
        case_modifier = rng.uniform(-2, 2)  # Much tighter per-case swing for factual tasks
    else:
        # Complex / open-ended output: wider divergence between models
        profiles = {
            "gpt-4o": {
                "accuracy": (88, 97),
                "relevance": (86, 95),
                "coherence": (90, 98),
                "hallucination_risk": (88, 97),
            },
            "gpt-4o-mini": {
                "accuracy": (85, 95),
                "relevance": (84, 94),
                "coherence": (80, 91),
                "hallucination_risk": (83, 93),
            },
            "claude-3-haiku": {
                "accuracy": (80, 92),
                "relevance": (83, 93),
                "coherence": (87, 95),
                "hallucination_risk": (85, 95),
            },
            "llama-3-70b": {
                "accuracy": (70, 88),
                "relevance": (68, 86),
                "coherence": (72, 87),
                "hallucination_risk": (70, 86),
            },
        }
        case_modifier = rng.uniform(-5, 5)

    profile = profiles.get(model_name, {"accuracy": (70, 90), "relevance": (68, 88), "coherence": (70, 88), "hallucination_risk": (70, 88)})

    accuracy = round(min(100, max(0, rng.uniform(*profile["accuracy"]) + case_modifier * 0.4)), 1)
    relevance = round(min(100, max(0, rng.uniform(*profile["relevance"]) + case_modifier * 0.3)), 1)
    coherence = round(min(100, max(0, rng.uniform(*profile["coherence"]) + case_modifier * 0.2)), 1)
    hallucination_risk = round(min(100, max(0, rng.uniform(*profile["hallucination_risk"]) + case_modifier * 0.3)), 1)

    total = compute_total(accuracy, relevance, coherence, hallucination_risk)

    return DimensionScore(
        accuracy=accuracy,
        relevance=relevance,
        coherence=coherence,
        hallucination_risk=hallucination_risk,
        total=total,
    )


def generate_mock_reasoning(model_name: str, scores: DimensionScore, input_text: str) -> str:
    seed = hash(model_name + input_text + str(scores.total)) % (2**32)
    rng = random.Random(seed)

    if scores.total >= 90:
        options = [
            f"The response accurately addressed the input with high precision and minimal ambiguity.",
            f"Output was well-structured and closely aligned with the expected answer.",
            f"Strong performance — the model captured the key elements correctly and coherently.",
        ]
    elif scores.total >= 80:
        options = [
            f"Mostly accurate response with minor deviations from the expected output format.",
            f"The model addressed the core question well, though some nuance was missed.",
            f"Good overall response; coherence was solid but accuracy had slight gaps.",
        ]
    elif scores.total >= 70:
        options = [
            f"Adequate response but missed some key aspects of the expected output.",
            f"The answer was relevant but lacked precision on important details.",
            f"Moderate performance — the structure was acceptable but accuracy could improve.",
        ]
    else:
        options = [
            f"The response had notable inaccuracies and did not fully address the expected output.",
            f"Output showed inconsistencies and deviated significantly from the expected answer.",
            f"Low confidence in this response — multiple dimensions scored below expectations.",
        ]

    return rng.choice(options)


async def run_mock_evaluation(request: EvalRequest) -> EvalResult:
    model_outputs: List[ModelOutput] = []

    for model in request.models:
        for idx, test_case in enumerate(request.test_cases):
            prompt_filled = request.prompt_template.replace("{{input}}", test_case.input)
            actual_output = generate_mock_output(model, request.prompt_template, test_case.input)
            scores = generate_mock_scores(model, request.prompt_template, test_case.input, idx, expected_output=test_case.expected_output)
            reasoning = generate_mock_reasoning(model, scores, test_case.input)

            model_outputs.append(
                ModelOutput(
                    model=model,
                    test_case_index=idx,
                    input=test_case.input,
                    expected=test_case.expected_output,
                    actual_output=actual_output,
                    scores=scores,
                    judge_reasoning=reasoning,
                )
            )

    leaderboard = compute_leaderboard(model_outputs, request.models)
    verdict = generate_mock_verdict(leaderboard, [o.dict() for o in model_outputs])

    return EvalResult(
        eval_id=str(uuid.uuid4()),
        name=request.name,
        prompt_template=request.prompt_template,
        model_outputs=model_outputs,
        leaderboard=leaderboard,
        judge_verdict=verdict,
        created_at=datetime.now(timezone.utc).isoformat(),
        mode="mock",
    )


def compute_leaderboard(model_outputs: List[ModelOutput], models: List[str]) -> List[dict]:
    model_totals = {}
    model_counts = {}

    for output in model_outputs:
        if output.model not in model_totals:
            model_totals[output.model] = 0.0
            model_counts[output.model] = 0
        model_totals[output.model] += output.scores.total
        model_counts[output.model] += 1

    leaderboard = []
    for model in models:
        if model in model_totals and model_counts[model] > 0:
            avg = round(model_totals[model] / model_counts[model], 2)
            leaderboard.append({"model": model, "avg_total": avg})
        else:
            leaderboard.append({"model": model, "avg_total": 0.0, "failed": True})

    leaderboard.sort(key=lambda x: x["avg_total"], reverse=True)
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1

    return leaderboard


async def run_ai_evaluation(request: EvalRequest) -> EvalResult:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    model_outputs: List[ModelOutput] = []

    # Map frontend model names to OpenAI model IDs
    model_map = {
        "gpt-4o": "gpt-4o",
        "gpt-4o-mini": "gpt-4o-mini",
        "claude-3-haiku": "gpt-4o-mini",  # fallback to mini for non-OpenAI
        "llama-3-70b": "gpt-4o-mini",     # fallback to mini for non-OpenAI
    }

    judge_prompt_template = """You are an expert AI evaluator. Score the following model output.

Task: {prompt_template}
Input: {input}
Expected output: {expected}
Model output: {actual}

Score each dimension from 0-100:
- accuracy: how correct is the output compared to expected?
- relevance: does it answer what was asked?
- coherence: is it well-written and logical?
- hallucination_risk: how likely is this to contain false information? (100 = no risk, 0 = high risk)

Return ONLY valid JSON:
{{"accuracy": 85, "relevance": 90, "coherence": 88, "hallucination_risk": 95, "reasoning": "one sentence explanation"}}"""

    async def evaluate_one(model: str, idx: int, test_case: TestCase):
        api_model = model_map.get(model, "gpt-4o-mini")
        prompt_filled = request.prompt_template.replace("{{input}}", test_case.input)

        try:
            response = await client.chat.completions.create(
                model=api_model,
                messages=[{"role": "user", "content": prompt_filled}],
                max_tokens=500,
                temperature=0.7,
            )
            actual_output = response.choices[0].message.content or ""
        except Exception as e:
            actual_output = f"[Error: {str(e)}]"

        judge_prompt = judge_prompt_template.format(
            prompt_template=request.prompt_template,
            input=test_case.input,
            expected=test_case.expected_output,
            actual=actual_output,
        )

        try:
            judge_response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": judge_prompt}],
                max_tokens=200,
                temperature=0,
            )
            judge_text = judge_response.choices[0].message.content or "{}"
            judge_text = judge_text.strip()
            if judge_text.startswith("```"):
                judge_text = judge_text.split("```")[1]
                if judge_text.startswith("json"):
                    judge_text = judge_text[4:]
            judge_data = json.loads(judge_text)
            accuracy = float(judge_data.get("accuracy", 75))
            relevance = float(judge_data.get("relevance", 75))
            coherence = float(judge_data.get("coherence", 75))
            hallucination_risk = float(judge_data.get("hallucination_risk", 75))
            reasoning = judge_data.get("reasoning", "Evaluated by judge model.")
        except Exception as e:
            accuracy = relevance = coherence = hallucination_risk = 75.0
            reasoning = f"Judge evaluation failed: {str(e)}"

        total = compute_total(accuracy, relevance, coherence, hallucination_risk)
        scores = DimensionScore(
            accuracy=accuracy,
            relevance=relevance,
            coherence=coherence,
            hallucination_risk=hallucination_risk,
            total=total,
        )

        return ModelOutput(
            model=model,
            test_case_index=idx,
            input=test_case.input,
            expected=test_case.expected_output,
            actual_output=actual_output,
            scores=scores,
            judge_reasoning=reasoning,
        )

    tasks = []
    for model in request.models:
        for idx, test_case in enumerate(request.test_cases):
            tasks.append(evaluate_one(model, idx, test_case))

    results = await asyncio.gather(*tasks, return_exceptions=True)
    for result in results:
        if isinstance(result, ModelOutput):
            model_outputs.append(result)

    leaderboard = compute_leaderboard(model_outputs, request.models)

    # Generate verdict with GPT-4o
    scores_summary = json.dumps(leaderboard, indent=2)
    verdict_prompt = f"""You evaluated multiple LLM models on a task. Here are the leaderboard results:
{scores_summary}

Write a 2-3 sentence plain English verdict on which model won and why, and any notable patterns in the results. Be specific about scores."""

    try:
        verdict_response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": verdict_prompt}],
            max_tokens=200,
            temperature=0.7,
        )
        verdict = verdict_response.choices[0].message.content or "Evaluation complete."
    except Exception:
        verdict = f"{leaderboard[0]['model']} achieved the highest score of {leaderboard[0]['avg_total']:.1f} across all test cases."

    return EvalResult(
        eval_id=str(uuid.uuid4()),
        name=request.name,
        prompt_template=request.prompt_template,
        model_outputs=model_outputs,
        leaderboard=leaderboard,
        judge_verdict=verdict,
        created_at=datetime.now(timezone.utc).isoformat(),
        mode="ai",
    )


async def run_evaluation(request: EvalRequest) -> EvalResult:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if api_key and api_key.startswith("sk-"):
        return await run_ai_evaluation(request)
    else:
        return await run_mock_evaluation(request)
