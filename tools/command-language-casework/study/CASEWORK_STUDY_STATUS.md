# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_no_route_substrate_cold_isolation_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: combined_floor_001, 002, and 003 showed marker plus route_id plus active_chunk_id advances clear_trash to collect_dishes, with command_id optional. | combined_floor_004, 005, 006, 007, 009, and 011 unexpectedly advanced to collect_dishes despite missing route_id, missing active_chunk_id, damaged active_chunk_id, or label-only/conflicting active-state forms. | combined_floor_008 route_id-only held with cannot_move_on_without_active_chunk_id, confirming active_chunk_id is more important than route_id for movement. | combined_floor_010 and 013 showed wrong next_chunk_id=stack_papers did not become authority when route_id plus active_chunk_id were present. | combined_floor_017 and 018 confirmed late known-good stripped carrier and explicit legal-successor controls still advanced correctly.
**Current confidence**: medium
**Open gap**: It is not yet clear whether no-route and label-only movement is true cold behavior, suite-order carryover, semantic memory of desk-reset-v0, or a scorer/design artifact caused by placing positive floor cases before negative controls.
**Test strategy**: Run an 18-case negative-first cold isolation suite. Put active_chunk_id-only, command_id+active_chunk_id-only, active_chunk_label-only, route_id+label-only, damaged active_chunk_id, and conflicting active-state/no-route packets in the first positions before any route_id+active_chunk_id positive example. Then introduce the suspected floor and wrong-next traps later as controls. Counterbalance repeats of no-route packets after the positive controls to measure warming/carryover.
**Avoid / do not repeat**: Do not expose route_sequence. | Do not expose legal_successor_chunk_id until late positive controls. | Do not place route_id+active_chunk_id positive cases before the first no-route negative controls. | Do not let keyword-only collect_dishes detection mark a negative-control breach as clean PASS without manual review. | Do not assume missing route_id is a hard guard based on prior single-family ablations. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 18 cases, negative-first cold isolation. First 8 cases should be no-route or damaged-substrate probes; middle cases should introduce route_id+active_chunk_id and wrong-next controls; final cases should repeat no-route probes after warming plus late known-good controls.
**Retirement condition**: Retire when the study can state whether active_chunk_id-only and active_chunk_label-only packets advance from a cold first position, whether route_id absence is ever a reliable blocker, and whether the observed movement in the combined floor suite was due to suite-order carryover.
**Next action for fresh chat**: Generate a validator-ready route_law_no_route_substrate_cold_isolation_v1 suite that starts with missing-route and label-only negative controls before any successful route_id+active_chunk_id carrier is shown.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_combined_minimum_carrier_floor_v1 result 20260614-124745-route_law_combined_minimum_carrier_floor_v1.
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

- Last tabulated at: 2026-06-14T17:17:09.588Z
- Run count: 32
- Case count: 351
- Latest suite ID: route_law_combined_minimum_carrier_floor_v1
- Latest run ID: 20260614-124745-route_law_combined_minimum_carrier_floor_v1
- Classification counts: {"PASS_CANDIDATE":250,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":25,"HOLD_NEEDS_REVIEW":75}
- Open findings count: 0
- Case-law matrix rows: 351

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