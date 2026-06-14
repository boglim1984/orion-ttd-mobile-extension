# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_fresh_context_minimum_carrier_isolation_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: order_context_001 positive-first stripped carrier advanced clear_trash -> collect_dishes. | order_context_002 wrong next_chunk_id=stack_papers was ignored and movement still went to collect_dishes. | route_id-only, no-route/no-active, label-only, and post-negative probes often advanced after prior positive examples, indicating same-chat carryover rather than clean packet authority. | order_context_010 damaged allowed_intents with move_on absent held at clear_trash. | order_context_018 explicit legal_successor sanity control advanced to collect_dishes.
**Current confidence**: medium
**Open gap**: It is still unknown which fields are truly necessary when a packet is evaluated without prior route memory in the same chat. The current suite proves order/context carryover but cannot cleanly validate no-route negatives after positive priming.
**Test strategy**: Run a fresh-context minimum-carrier isolation study. Each candidate should appear as the first meaningful route packet in its own fresh disposable chat or in separate tiny suites: no route/no active, route_id only, active_chunk_id only, label only, route_id + active_chunk_id, route_id + active label, wrong-next trap, no commit_policy, damaged allowed_intents, and explicit legal_successor sanity. Compare first-position outcomes rather than mixed same-chat outcomes.
**Avoid / do not repeat**: Do not put positive route_id + active_chunk_id examples before negative hold probes in the same chat when measuring minimum carrier. | Do not interpret later negative probes from this run as clean evidence of no-route behavior. | Do not expose route_sequence. | Do not expose legal_successor_chunk_id before the final sanity control. | Do not treat PASS_CANDIDATE as sufficient when the expected behavior was hold. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15 to 18 total cases, but split into fresh-context runs or separate first-position micro-suites so each candidate is tested before route memory can form. Include paired wrong-next traps and one final explicit legal_successor sanity control.
**Retirement condition**: Retire when first-position isolated runs show whether route_id + active_chunk_id advances, whether route_id-only/active-only/label-only/no-route packets hold, whether wrong next_chunk_id is consistently ignored, and whether explicit legal_successor still passes.
**Next action for fresh chat**: Generate route_law_fresh_context_minimum_carrier_isolation_v1 as a fresh-context or split-suite plan that prevents same-chat route memory from contaminating negative probes.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_order_context_counterbalance_v1 result 20260614-133518-route_law_order_context_counterbalance_v1.
**Set by**: Billy / ChatGPT post-run review
**Set at**: 2026-06-14

### Why these cases
- The previous pointer is satisfied because relaxed contracts preserved route law.
- The next uncertainty is the minimal field carrier, not strict versus relaxed wording.
- A late negative control remains necessary so reduced packets do not teach the scorer to accept wrong-next movement.

## Artifact roles

- Raw result JSON = evidence
- Reflection review = interpretation
- Case-law matrix = cumulative analysis
- Evidence digest = planning convenience surface
- Legal system = authority/evidence language
- Study status = agenda
- Rulebook = agent behavior

## Open integration question

- Collapse or redesign overlapping artifacts if they become duplicate sources of truth.

## Computed summary
Generated from raw result files.

- Last tabulated at: 2026-06-14T17:42:53.190Z
- Run count: 34
- Case count: 387
- Latest suite ID: route_law_order_context_counterbalance_v1
- Latest run ID: 20260614-133518-route_law_order_context_counterbalance_v1
- Classification counts: {"PASS_CANDIDATE":277,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":28,"HOLD_NEEDS_REVIEW":81}
- Open findings count: 0
- Case-law matrix rows: 387

## Open findings
Generated and/or manually curated.

*(No open findings)*

## Recently resolved findings
Generated from casework status cleanup.

- **casework_reflection_loop_missing_001** (resolved): Reflection loop validation and derived-artifact regeneration are now in place.
- **casework_window_model_miscount_001** (resolved): Casework docs and runner flow now treat design chat, local GUI, and disposable ChatGPT test tab as distinct surfaces.
- **casework_case_law_matrix_missing_001** (resolved): The cumulative case-law matrix is now generated from imported runs.
- **casework_legal_system_not_integrated_001** (resolved): Legal verdict and route-survival fields are now part of derived casework outputs.
- **casework_artifact_overlap_risk_001** (resolved): Status, matrix, review, and raw evidence roles are now explicitly separated in the study artifacts.
- **scorer_collect_dishes_false_lost_route_001** (resolved): The collect_dishes scorer repair landed and historical rows now recompute correctly.