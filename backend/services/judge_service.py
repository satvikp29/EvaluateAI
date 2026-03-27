import random
from typing import List


def generate_mock_output(model_name: str, prompt_template: str, input_text: str) -> str:
    seed = hash(model_name + prompt_template + input_text) % (2**32)
    rng = random.Random(seed)

    input_lower = input_text.lower()
    prompt_lower = prompt_template.lower()

    # Detect task type from prompt template
    is_sentiment = any(w in prompt_lower for w in ["sentiment", "positive", "negative", "neutral", "label"])
    is_summary = any(w in prompt_lower for w in ["summarize", "summary", "brief", "concise"])
    is_classify = any(w in prompt_lower for w in ["classify", "categorize", "category", "class"])
    is_translate = any(w in prompt_lower for w in ["translate", "translation", "language"])
    is_qa = any(w in prompt_lower for w in ["answer", "question", "what is", "explain"])

    if model_name == "gpt-4o":
        if is_sentiment:
            sentiments = ["Positive", "Negative", "Neutral"]
            chosen = sentiments[rng.randint(0, 2)]
            explanations = [
                f"The review expresses a {chosen.lower()} sentiment, highlighting the customer's overall experience with the product.",
                f"This feedback conveys a {chosen.lower()} tone, reflecting the customer's satisfaction level clearly.",
                f"The customer's message is {chosen.lower()} in nature, indicating their emotional response to the product or service.",
            ]
            return rng.choice(explanations)
        elif is_summary:
            words = input_text.split()[:8]
            base = " ".join(words)
            return f"The text discusses {base.lower()}, presenting key information in a structured manner that addresses the core subject matter comprehensively."
        elif is_classify:
            categories = ["Category A", "Type 1", "Class Primary", "Group Main"]
            return f"Classification: {rng.choice(categories)}. The input exhibits characteristics consistent with this category based on semantic analysis of the provided content."
        elif is_translate:
            return f"[Translated content]: {input_text[:50]}... (GPT-4o translation with high fidelity to source meaning and natural target language expression)"
        else:
            return f"Based on the provided input '{input_text[:40]}...', the analysis indicates that the subject matter requires careful consideration of multiple factors. The response addresses the core question while maintaining accuracy and relevance throughout."

    elif model_name == "gpt-4o-mini":
        if is_sentiment:
            sentiments = ["Positive", "Negative", "Neutral"]
            chosen = sentiments[rng.randint(0, 2)]
            return f"{chosen} — {input_text[:30].strip()}..."
        elif is_summary:
            words = input_text.split()[:6]
            return f"Summary: {' '.join(words)}. Key points addressed concisely."
        elif is_classify:
            return f"Label: Primary Category. Confidence: High."
        else:
            return f"Response to '{input_text[:35]}': The answer is straightforward. Key insight: the main point relates directly to what was asked."

    elif model_name == "claude-3-haiku":
        if is_sentiment:
            sentiments = ["Positive", "Negative", "Neutral"]
            chosen = sentiments[rng.randint(0, 2)]
            return f"Sentiment: {chosen}. The expressed tone clearly reflects a {chosen.lower()} customer experience."
        elif is_summary:
            words = input_text.split()[:7]
            return f"In brief: {' '.join(words).lower()} — captured with precision."
        elif is_classify:
            return f"Classification result: Primary group. The input aligns with established patterns."
        else:
            return f"Concise response: '{input_text[:30]}' — analyzed and addressed. The conclusion follows logically from the given context."

    elif model_name == "llama-3-70b":
        if is_sentiment:
            sentiments = ["Positive", "Negative", "Mixed/Neutral", "Somewhat positive", "Somewhat negative"]
            chosen = rng.choice(sentiments)
            if rng.random() < 0.3:
                return f"The sentiment appears to be {chosen}. Note: there are some ambiguous signals in the text that could indicate {rng.choice(sentiments).lower()} as well."
            return f"Sentiment analysis: {chosen}. The text shows indicators consistent with this classification."
        elif is_summary:
            words = input_text.split()[:10]
            filler = rng.choice(["Furthermore, ", "Additionally, ", "It should be noted that "])
            return f"Summary: {' '.join(words)}. {filler}the content covers the main aspects of the topic."
        elif is_classify:
            return f"Category: Group A or possibly Group B depending on interpretation. The classification shows moderate confidence."
        else:
            result = f"Analysis of '{input_text[:25]}': "
            if rng.random() < 0.3:
                result += f"This is a {rng.choice(['complex', 'nuanced', 'multifaceted'])} topic. "
            result += "The primary answer addresses the question with relevant context provided."
            return result

    else:
        return f"Model response for: {input_text[:50]}"


def generate_mock_verdict(leaderboard: list, model_outputs: list) -> str:
    if not leaderboard:
        return "No models were evaluated."

    winner = leaderboard[0]
    winner_name = winner["model"]
    winner_score = winner["avg_total"]

    verdicts_by_winner = {
        "gpt-4o": [
            f"GPT-4o demonstrated the strongest overall performance with an average score of {winner_score:.1f}, excelling particularly in coherence and hallucination resistance. While GPT-4o-mini was competitive on straightforward tasks, GPT-4o's advantage became clear on cases requiring nuanced reasoning — a pattern consistent with its larger parameter count and RLHF training.",
            f"GPT-4o emerged as the top performer ({winner_score:.1f} avg), showing the most reliable accuracy and lowest hallucination risk across all test cases. The model's tendency to provide well-structured, comprehensive answers gives it an edge over faster alternatives, though this comes at higher cost per token.",
        ],
        "gpt-4o-mini": [
            f"GPT-4o-mini achieved the highest scores with an average of {winner_score:.1f}, outperforming its larger sibling GPT-4o on these particular tasks. This result highlights that for well-defined, structured tasks, the smaller model's training on efficiency and conciseness can be an advantage — it answered the question without over-explaining.",
            f"GPT-4o-mini led the evaluation at {winner_score:.1f} average score, demonstrating that cost-efficient models can outperform premium alternatives on focused tasks. The model's concise response style aligned well with the evaluation criteria, particularly on relevance and coherence dimensions.",
        ],
        "claude-3-haiku": [
            f"Claude 3 Haiku topped the leaderboard with {winner_score:.1f} average score, showing particularly strong coherence scores. Anthropic's Constitutional AI training appears to benefit structured evaluation tasks like these — the model's outputs were consistently well-organized and on-point.",
            f"Claude 3 Haiku led with {winner_score:.1f} avg, excelling at delivering clean, precise responses. The model's low hallucination risk scores stand out — it consistently stayed within the bounds of what was asked rather than generating plausible-sounding but unsupported claims.",
        ],
        "llama-3-70b": [
            f"Llama 3 70B surprisingly topped the leaderboard at {winner_score:.1f} average, though its advantage was narrow. The open-source model performed competitively on straightforward cases but showed more variance than commercial alternatives — a characteristic tradeoff of models without RLHF fine-tuning for consistency.",
            f"Llama 3 70B led this evaluation ({winner_score:.1f} avg) — a notable result for an open-source model. However, reviewers should note the higher variance in per-case scores, suggesting the model's performance is more task-dependent than commercial alternatives.",
        ],
    }

    default_verdict = f"{winner_name} achieved the highest overall score of {winner_score:.1f}, outperforming the other evaluated models. Results show meaningful variance across models, validating that LLM selection has a real impact on output quality for this task type."

    options = verdicts_by_winner.get(winner_name, [default_verdict])
    seed = hash(winner_name + str(round(winner_score))) % (2**32)
    rng = random.Random(seed)
    return rng.choice(options)
