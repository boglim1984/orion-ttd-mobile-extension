# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_active_carrier_position_generalization_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_active_carrier_floor_001 showed cold active_chunk_id-only advanced from clear_trash to collect_dishes. | route_law_active_carrier_floor_002 showed cold active_chunk_label-only advanced from clear trash to collect_dishes. | route_law_active_carrier_floor_003 showed paired active fields without route_sequence advanced to collect_dishes. | route_law_active_carrier_floor_004 through 006 showed active carrier plus route_sequence advanced to collect_dishes. | route_law_active_carrier_floor_007 showed next_chunk_id/next_chunk_label alone did not establish active state. | route_law_active_carrier_floor_008 through 011 showed wrong next_chunk_id/label stack_papers did not override active carrier and did not cause a skip. | route_law_active_carrier_floor_012 showed a late active_chunk_id-only retest still advanced to collect_dishes.
**Current confidence**: medium
**Open gap**: The floor is proven for the first route transition, but not yet for non-start active positions. It is still unknown whether active_chunk_id-only or active_chunk_label-only can carry legal move_on when the active chunk is collect_dishes, stack_papers, or wipe_surface without route_sequence.
**Test strategy**: Run a focused position-generalization suite using sparse packets and no response_contract or route_law rescue wording. Test active_chunk_id-only, active_chunk_label-only, and both-active fields at collect_dishes, stack_papers, and wipe_surface. Include route_sequence baselines and wrong-next conflicts at non-start positions, plus one no-active negative control.
**Avoid / do not repeat**: do not repeat broad clear_trash-only floor tests except as a single baseline | do not include response_contract | do not include route_law rescue wording | do not treat first-transition success as proof that the whole route map is carried | do not mix this with language expansion or side-question recovery | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15-case focused position-generalization suite: one clear_trash baseline, active_id-only and active_label-only at collect_dishes/stack_papers/wipe_surface, both-active non-start checks, route_sequence baselines, wrong-next conflicts, and one next-only negative control.
**Retirement condition**: Retire this pointer when active_chunk_id-only, active_chunk_label-only, and both-active packets are clearly classified across non-start route positions and compared against route_sequence baselines and wrong-next conflicts.
**Next action for fresh chat**: Generate a validator-ready suite for route_law_active_carrier_position_generalization_v1 focused on non-start active carrier movement across the desk-reset-v0 route.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_explicit_active_carrier_floor_confirmation_v1 result 20260613-190753-route_law_explicit_active_carrier_floor_confirmation_v1.
**Set by**: Billy / ChatGPT post-run review
**Set at**: 2026-06-13

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

- Last tabulated at: 2026-06-13T23:13:10.837Z
- Run count: 18
- Case count: 107
- Latest suite ID: route_law_explicit_active_carrier_floor_confirmation_v1
- Latest run ID: 20260613-190753-route_law_explicit_active_carrier_floor_confirmation_v1
- Classification counts: {"PASS_CANDIDATE":79,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5,"HOLD_NEEDS_REVIEW":22}
- Open findings count: 0
- Case-law matrix rows: 107

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