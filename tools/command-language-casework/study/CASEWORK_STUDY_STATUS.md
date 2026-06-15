# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_singleton_cold_start_order_effect_15case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Cases 001, 002, and 009 showed route_id + active_chunk_id alone loads clear_trash and advances to collect_dishes on move_on. | Cases 003 through 008 showed one-field additions were unnecessary once route_id + active_chunk_id were present. | Case 010 unexpectedly showed active_chunk_label-only advanced to collect_dishes after prior route-state exposure. | Case 012 unexpectedly showed active_chunk_id-only advanced to collect_dishes after prior route-state exposure. | Case 011 showed route_id-only did not supply active state and returned active_chunk_id missing. | Case 013 should be manually reviewed as a negative-control success despite heuristic PASS_CANDIDATE because the assistant said Cannot advance: active_chunk_id missing. | Case 014 confirmed active_chunk_id outranks conflicting label text by moving stack_papers to wipe_surface. | Case 015 confirmed wrong explicit successor did not poison route law; clear_trash still advanced to collect_dishes.
**Current confidence**: medium
**Open gap**: Whether singleton fields are true route-state carriers in cold or near-cold context. The current run proves two-field sufficiency but does not prove two-field minimality because singleton controls passed only after earlier successful route-state packets.
**Test strategy**: Run a 15-case order-effect suite with singleton packets before any route_id + active_chunk_id positive. Put active_chunk_id-only or label-only as the first cold case, keep the first block free of two-field positives, then introduce two-field positives later to test whether later singleton behavior changes after warming. Include route_id-only, label-only, active_chunk_id-only, missing-active, conflicting label, and wrong-successor controls. If possible, follow with a swapped-order companion run where the other singleton is case 001 cold.
**Avoid / do not repeat**: Do not place singleton negatives after many route_id + active_chunk_id positives if the goal is cold sufficiency. | Do not call route_id + active_chunk_id the true minimum until singleton cold-start behavior is resolved. | Do not treat heuristic PASS_CANDIDATE on missing-active cases as a clean pass when the assistant text says it cannot advance. | Do not expose route_sequence. | Do not route to tool repair; this run completed cleanly. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15 cases, singleton cold-start/order-effect matrix. Start with singleton probes before any two-field positive, then add two-field baseline and repeat singleton probes after warming to measure carryover.
**Retirement condition**: Retire this pointer when active_chunk_id-only and label-only either pass in cold/near-cold positions or fail there but pass only after route-state warming. That will distinguish true singleton carrier sufficiency from same-chat carryover.
**Next action for fresh chat**: Generate validator-ready suite JSON for route_law_singleton_cold_start_order_effect_15case_v1. Put singleton probes before any route_id + active_chunk_id positive and use move_on as the scripted reply.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_headerless_two_field_minimum_confirmation_15case_v1 result 20260614-161439-route_law_headerless_two_field_minimum_confirmation_15case_v1.
**Set by**: Billy / ChatGPT post-run review
**Set at**: 2026-06-15

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

- Last tabulated at: 2026-06-15T15:00:36.145Z
- Run count: 43
- Case count: 477
- Latest suite ID: route_law_headerless_two_field_minimum_confirmation_15case_v1
- Latest run ID: 20260614-161439-route_law_headerless_two_field_minimum_confirmation_15case_v1
- Classification counts: {"PASS_CANDIDATE":351,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":34,"HOLD_NEEDS_REVIEW":91}
- Open findings count: 0
- Case-law matrix rows: 477

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