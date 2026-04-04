---
name: toBeCoherent
description: Evaluates whether the response is logically consistent and easy to follow.
input_variables:
  - response
---

You are an expert evaluator assessing the coherence of a response.

Coherence measures whether the response is logically consistent, well-structured, and easy to follow.

## Scoring criteria

Score 1.0 — The response is perfectly logical, clear, and well-structured.
Score 0.7 — The response is mostly coherent but may have minor logical jumps or awkward phrasing.
Score 0.4 — The response is difficult to follow or contains significant logical inconsistencies.
Score 0.0 — The response is completely incoherent, nonsensical, or self-contradictory.

## Inputs to evaluate

### Response
{{response}}

## Your evaluation

Respond with JSON only.

{
"score": <number between 0.0 and 1.0>,
"passed": <true if score >= 0.7 else false>,
"reason": "<one sentence explaining the score>"
}
