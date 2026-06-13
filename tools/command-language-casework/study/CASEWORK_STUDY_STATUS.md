# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_next_chunk_latent_carrier_boundary_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_position_generalization_002 through 010 showed active_chunk_id-only, active_chunk_label-only, and paired active fields all advanced legally at collect_dishes, stack_papers, and wipe_surface. | route_law_position_generalization_011 through 013 showed route_sequence baselines preserved legal one-step movement from non-start positions. | route_law_position_generalization_014 showed a wrong next_chunk target did not override an explicit active carrier. | route_law_position_generalization_015 showed next_chunk_id/label stack_papers without any active carrier or route_sequence produced Ready on stack papers and then move_on advanced to wipe_surface, creating a HOLD_NEEDS_REVIEW latent-carrier finding.
**Current confidence**: high
**Open gap**: The active carrier floor is now generalized across non-start positions, but next_chunk-only packets may still create inferred active state. It is unknown whether this requires both next_chunk_id and next_chunk_label, whether id-only or label-only are sufficient, whether it depends on non-start route positions, and whether the model is treating next_chunk as current state or as a legal preview target.
**Test strategy**: Run a focused next-chunk latent-carrier boundary suite. Use no active_chunk fields and no route_sequence in the core cases. Test next_chunk_id-only, next_chunk_label-only, and both next fields for collect_dishes, stack_papers, wipe_surface, and choose_next. Include one or two explicit-active controls showing that active carrier still dominates wrong next fields. Include no-field and allowed_intents-only negatives to confirm the model is not advancing from generic route memory alone.
**Avoid / do not repeat**: do not repeat active carrier position-generalization cases except as minimal controls | do not include response_contract | do not include route_law rescue wording | do not include route_sequence in the core next-only cases | do not treat next_chunk-only advancement as a PASS without separate legal interpretation | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15-case next-chunk latent-carrier boundary suite: next_chunk_id-only, next_chunk_label-only, and paired next fields across several route positions; no-field negative controls; explicit-active wrong-next dominance controls; classify whether next fields preview, seed active state, or cause unsafe advancement.
**Retirement condition**: Retire this pointer when next_chunk_id-only, next_chunk_label-only, and paired next_chunk fields are clearly classified as inert, preview-only, or latent-active carriers across route positions, and when explicit active fields are confirmed to dominate conflicting next fields.
**Next action for fresh chat**: Generate a validator-ready suite for route_law_next_chunk_latent_carrier_boundary_v1 focused on next_chunk-only packets with no active_chunk and no route_sequence, plus minimal explicit-active controls.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_active_carrier_position_generalization_v1 result 20260613-191805-route_law_active_carrier_position_generalization_v1.
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

- Last tabulated at: 2026-06-13T23:23:59.684Z
- Run count: 19
- Case count: 122
- Latest suite ID: route_law_active_carrier_position_generalization_v1
- Latest run ID: 20260613-191805-route_law_active_carrier_position_generalization_v1
- Classification counts: {"PASS_CANDIDATE":93,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5,"HOLD_NEEDS_REVIEW":23}
- Open findings count: 0
- Case-law matrix rows: 122

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