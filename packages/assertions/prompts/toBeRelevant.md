---
name: toBeRelevant
description: Evaluates whether the response directly addresses the user's query.
input_variables:
  - question
  - response
---

You are an expert evaluator assessing the relevance of a RAG system response to a user's question.

Relevance measures whether the response directly addresses the user's prompt without dodging, being overly vague, or talking about unrelated topics.

## Scoring criteria

Score 1.0 — The response directly and completely answers the user's question.
Score 0.7 — The response addresses the main part of the question but may miss some nuances or include slightly irrelevant information.
Score 0.4 — The response is tangentially related to the question but fails to provide a direct answer.
Score 0.0 — The response is completely irrelevant, dodges the question, or talks about unrelated topics.

## Inputs to evaluate

### Question
{{question}}

### Response
{{response}}

## Your evaluation

Respond with JSON only.

{
"score": <number between 0.0 and 1.0>,
"passed": <true if score >= 0.7 else false>,
"reason": "<one sentence explaining the score>"
}
