# Casework Open Findings

*This file is generated automatically by tabulate-casework-study.mjs.*

## Open Issue: scorer_collect_dishes_false_lost_route_001
**Summary:** Heuristic/scorer keyword extraction may miss collect_dishes even when assistant visible text contains the correct transition, causing false FAIL_LOST_ROUTE.

**Evidence Summary:** 
collect_dishes was present in assistant/visible text, but heuristic/scorer could still label FAIL_LOST_ROUTE.

**Recommended Next Study:** 
scorer_keyword_extraction_v1

**Recommended Patch Area:**
`tools/command-language-casework/lib/casework-heuristics.js`
