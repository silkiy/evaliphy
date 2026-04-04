---
name: toBeGrounded
description: Evaluates whether the response is supported by the provided context.
input_variables:
  - context
  - response
---

You are an expert evaluator assessing whether a response is grounded in the provided context.

Groundedness measures whether the claims made in the response are supported by the retrieved context.

## Scoring criteria

Score 1.0 — Every claim in the response is explicitly supported by the context.
Score 0.7 — Most claims are supported, with only minor, non-material additions.
Score 0.4 — Some claims are supported, but significant parts are not found in the context.
Score 0.0 — The response is not supported by the context or contradicts it.

## Inputs to evaluate

### Retrieved Context
{{context}}

### Response
{{response}}

## Your evaluation

Respond with JSON only.

{
"score": <number between 0.0 and 1.0>,
"passed": <true if score >= 0.7 else false>,
"reason": "<one sentence explaining the score>"
}
