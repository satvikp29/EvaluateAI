# EvaluateAI — LLM Evaluation Platform

Compare multiple language models side-by-side on your own test cases. A judge model scores each response on accuracy, relevance, coherence, and hallucination risk.

---

## Run in 2 Minutes

```bash
git clone <repo>
cd evaluateai
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

> **Demo mode works with zero setup.** No API key needed — the platform generates realistic mock scores with real variance between models so you can explore all features immediately.

---

## Adding an OpenAI Key (for real evaluations)

1. Copy `.env.example` to `.env`
2. Set `OPENAI_API_KEY=sk-...`
3. Run `docker-compose up --build`

---

## Sample Prompt to Try

**Prompt Template:**
```
Summarize this customer review in one sentence and label it positive, negative, or neutral. Review: {{input}}
```

**Test Cases:**

| Input | Expected Output |
|-------|----------------|
| The product arrived quickly and works perfectly. I'm very happy with my purchase! | Positive — customer is satisfied with fast delivery and product quality. |
| Terrible experience. The item broke after one day and customer service was unhelpful. | Negative — product failed quickly and support was unresponsive. |
| It's okay. Does what it says but nothing special. Packaging was a bit damaged. | Neutral — product meets basic expectations with minor packaging issue. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11), SQLite |
| Frontend | Next.js 14 (TypeScript), Tailwind CSS |
| AI | OpenAI SDK (GPT-4o as judge) |
| Infrastructure | Docker Compose |

---

## Score Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| **Accuracy** | How correct is the output compared to the expected answer? |
| **Relevance** | Does it actually answer what was asked? |
| **Coherence** | Is it well-written, logical, and well-structured? |
| **Hallucination Risk** | How likely is this to contain false information? (100 = no risk, 0 = high risk) |

**Total score** = Accuracy×0.35 + Relevance×0.25 + Coherence×0.20 + Hallucination Risk×0.20

---

## How the Judge Model Works

EvaluateAI uses the **LLM-as-a-judge** pattern. After each model generates a response, GPT-4o evaluates it against the expected output using a structured prompt. The judge scores four dimensions independently, then provides a one-sentence reasoning. Finally, a verdict prompt aggregates all scores into a plain-English summary of which model performed best and why.

This approach mirrors how leading AI labs (Anthropic, Google, OpenAI) evaluate their own models — using a capable model to assess outputs at scale without requiring human annotators for every test case.
