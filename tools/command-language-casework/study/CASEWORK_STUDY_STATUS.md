# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_sequence_only_no_active_carrier_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_label_sequence_wrong_next_001_cold_wrong_next_id advanced to collect_dishes despite next_chunk_id stack_papers. | route_law_label_sequence_wrong_next_004_cold_wrong_next_id_and_label advanced to collect_dishes despite both wrong next fields. | route_law_label_sequence_wrong_next_005_cold_base_no_next_fields showed active_chunk_label plus route_sequence works even without any next_chunk fields. | route_law_label_sequence_wrong_next_007_negative_wrong_next_only_no_route moved to stack_papers, showing wrong next fields are still dangerous when no route carrier is present. | route_law_label_sequence_wrong_next_008_final_retest_core_conflict repeated collect_dishes late in the suite.
**Current confidence**: high
**Open gap**: We still do not know whether route_sequence by itself implicitly anchors the active chunk to the first route item, or whether an explicit active carrier is required for legal move_on advancement.
**Test strategy**: Run a focused cold-first suite centered on route_sequence-only packets with no active_chunk_id and no active_chunk_label. Include wrong next_chunk_id, wrong next_chunk_label, both wrong next fields, and no-next-field variants. Add controls showing that next_chunk-only movement is not legal route evidence. The suite should decide whether route_sequence alone produces reliable collect_dishes movement from the first listed chunk or should be treated as under-specified/repair-needed.
**Avoid / do not repeat**: do not include active_chunk_id | do not include active_chunk_label | do not include response_contract or route_law rescue wording | do not treat stack_papers movement from wrong-next-only packets as route survival | do not run the first route_sequence-only case in an already warmed chat | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 8-case minimum cold-first boundary suite; prefer 12 to 15 cases if adding route_sequence-only endurance and late wrong-next carryover checks.
**Retirement condition**: Retire this pointer when route_sequence-only cold packets are clearly characterized: either they reliably infer clear_trash as the first active route item and advance to collect_dishes, or they are shown to be under-specified and require an explicit active carrier.
**Next action for fresh chat**: Generate a validator-ready suite for route_law_sequence_only_no_active_carrier_v1 focused on route_sequence-only packets, wrong-next conflict behavior, and whether first-item route inference is reliable without active_chunk_id or active_chunk_label.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_cold_first_active_label_route_sequence_wrong_next_v1 result 20260613-181227-route_law_cold_first_active_label_route_sequence_wrong_next_v1.
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

- Last tabulated at: 2026-06-13T22:38:52.484Z
- Run count: 16
- Case count: 83
- Latest suite ID: route_law_cold_first_active_label_route_sequence_wrong_next_v1
- Latest run ID: 20260613-181227-route_law_cold_first_active_label_route_sequence_wrong_next_v1
- Classification counts: {"PASS_CANDIDATE":68,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5,"HOLD_NEEDS_REVIEW":9}
- Open findings count: 0
- Case-law matrix rows: 83

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