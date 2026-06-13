# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_min_combo_cold_first_sequence_wrong_next_control_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_cold_active_route_sequence_001 was run as a one-case cold-first suite in a fresh disposable chat. | The assistant first held for move_on, then after move_on answered exactly: New active chunk: collect_dishes. | The result was classified PASS_CANDIDATE and the diagnostics show no tool failure.
**Current confidence**: medium
**Open gap**: We know active+route_sequence can carry legal advancement cold, but we do not yet know whether route_sequence defeats a conflicting wrong next_chunk_id when both are present in a cold first packet.
**Test strategy**: Run one fresh disposable chat with a single cold case containing active_chunk_id, active_chunk_label, route_sequence, and a conflicting next_chunk_id/next_chunk_label pointing to stack_papers. The legal result should still be collect_dishes.
**Avoid / do not repeat**: do not run the next control in the already warmed chat | do not bundle multiple cold cards into one warmed suite | do not add response_contract wording that rescues the route | do not treat active+route_sequence as fully retired until the wrong-next conflict control passes | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: One-case cold-first suite in a fresh disposable chat.
**Retirement condition**: Retire this control when a cold packet with active+route_sequence plus conflicting wrong next_chunk_id advances to collect_dishes rather than stack_papers.
**Next action for fresh chat**: Generate only the validator-ready one-case JSON suite for route_law_min_combo_cold_first_sequence_wrong_next_control_v1.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_min_combo_cold_first_active_route_sequence_v1 result 20260613-172912-route_law_min_combo_cold_first_active_route_sequence_v1.
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

- Last tabulated at: 2026-06-13T21:33:45.958Z
- Run count: 13
- Case count: 73
- Latest suite ID: route_law_min_combo_cold_first_active_route_sequence_v1
- Latest run ID: 20260613-172912-route_law_min_combo_cold_first_active_route_sequence_v1
- Classification counts: {"PASS_CANDIDATE":59,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5,"HOLD_NEEDS_REVIEW":8}
- Open findings count: 0
- Case-law matrix rows: 73

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