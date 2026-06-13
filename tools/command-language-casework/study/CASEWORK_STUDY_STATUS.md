# Casework Study Status

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: scorer_keyword_extraction_v1
**Purpose**: Verify and/or patch recognition of canonical chunk ids and labels from visible_turn_text, latest_assistant_text_excerpt, and assistant response records.
**Next action for fresh chat**: Do not design a new language-boundary suite until the scorer recognition issue is checked or Billy explicitly asks to move on. Design a small scorer-recognition suite or ask whether the scorer patch has already landed.
**Source**: live done-vs-move_on result review
**Set by**: Billy / ChatGPT review
**Set at**: 2026-06-12

### Recommended Next Cases
- collect_dishes exact id
- collect dishes human label
- New active chunk: collect_dishes
- Advanced exactly one chunk to collect_dishes
- collect_dishes mentioned in latest_assistant_text_excerpt only
- collect_dishes mentioned in visible_turn_text only

## Computed summary
Generated from raw result files.

- Last tabulated at: 2026-06-13T00:02:16.456Z
- Run count: 0
- Case count: 0
- Latest suite ID: null
- Classification counts: {}
- Open findings count: 1

## Open findings
Generated and/or manually curated.

- **scorer_collect_dishes_false_lost_route_001** (open): Heuristic/scorer keyword extraction may miss collect_dishes even when assistant visible text contains the correct transition, causing false FAIL_LOST_ROUTE. Recommended next study: scorer_keyword_extraction_v1