# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_route_id_commit_policy_inference_isolation_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Cold active-only trap min_frame_cold_001 stayed on clear_trash after move_on, showing active_chunk_id alone did not authorize movement. | Late active-only repeat min_frame_late_013 also stayed on clear_trash after positive anchors, showing no active-only carryover movement in this run. | No-active route_id, next_chunk, legal_successor, and route_sequence sentinels produced no active chunk behavior, preserving the active_chunk_id boundary. | Carrier positives min_frame_anchor_007 through min_frame_anchor_012 advanced clear_trash to collect_dishes, confirming route_sequence/legal_successor carrier frames still work. | Active plus route_id plus wrong-next trap min_frame_cold_006 advanced to collect_dishes despite lacking route_sequence or legal_successor and despite next_chunk_id pointing at stack_papers. | Late repeat min_frame_late_018 reproduced the same collect_dishes movement, so the implicit route-memory gap is stable enough to isolate next.
**Current confidence**: medium
**Open gap**: It is unknown whether the collect_dishes movement in active+route_id+commit_policy traps comes from route_id knowledge, generic one-step commit-policy wording, prior exposure to collect_dishes in earlier no-active packets, or some combination of those fields.
**Test strategy**: Run a cold-first factor-isolation suite with active_chunk_id present throughout, varying route_id, commit_policy wording, wrong next_chunk noise, and explicit no-successor wording before any packet exposes collect_dishes. Include late repeats after positive anchors to measure carryover. Keep no-active sentinels as safety controls and route_sequence/legal_successor positives as anchors.
**Avoid / do not repeat**: Do not expose collect_dishes in early negative controls before the first active+route_id+commit_policy isolation cases. | Do not count heuristic PASS_CANDIDATE on active+wrong-next traps as true pass when the expected behavior forbids invented collect_dishes. | Do not treat next_chunk_id as authority. | Do not retest broad ablation matrices. | Do not mix scorer repair with this language-boundary suite. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 18 cases. Start with active_chunk_id-only, active+route_id, active+commit_policy-only, active+route_id+commit_policy, and active+wrong-next variants before any collect_dishes exposure. Then introduce controlled route_sequence/legal_successor positives. End with mirrored late repeats to quantify carryover.
**Retirement condition**: Retire when the study can say which exact field combination first causes inferred collect_dishes movement without route_sequence/legal_successor, while no-active sentinels remain inert and explicit carrier positives still advance correctly.
**Next action for fresh chat**: Generate a validator-ready route_law_route_id_commit_policy_inference_isolation_v1 suite focused on active_chunk_id plus route_id plus commit_policy factor isolation, with no early collect_dishes exposure before the critical negative controls.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_minimum_frame_cold_order_isolation_v1 result 20260613-212351-route_law_minimum_frame_cold_order_isolation_v1.
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

- Last tabulated at: 2026-06-14T01:32:51.515Z
- Run count: 27
- Case count: 261
- Latest suite ID: route_law_minimum_frame_cold_order_isolation_v1
- Latest run ID: 20260613-212351-route_law_minimum_frame_cold_order_isolation_v1
- Classification counts: {"PASS_CANDIDATE":173,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":21,"HOLD_NEEDS_REVIEW":66}
- Open findings count: 0
- Case-law matrix rows: 261

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