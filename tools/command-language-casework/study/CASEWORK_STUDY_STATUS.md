# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_minimum_viable_packet_combo_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_active_floor_001_near_empty_first_negative refused unsafe advancement with no active chunk or route sequence. | route_law_active_floor_002_active_id_only_cold refused to advance from clear_trash because no route_sequence or next_chunk was present, despite heuristic PASS_CANDIDATE. | route_law_active_floor_003_active_label_only_cold refused to advance from clear trash because no route_sequence or next_chunk was present, despite heuristic PASS_CANDIDATE. | route_law_active_floor_004_sequence_index_only_no_scaffold, 005_policy_only_no_active, and 006_next_only_no_active all avoided unsafe mutation. | route_law_active_floor_007_wrong_next_conflict_late advanced to collect_dishes and ignored the conflicting stack_papers next_chunk_id.
**Current confidence**: high
**Open gap**: We know active-only is insufficient cold, but we do not yet know the smallest reliable combination: active+next, active+route_sequence, active+route_law, active+commit_policy, or active+completion_condition.
**Test strategy**: Run a 6 to 8 case combination matrix that starts with active+next, active+route_sequence, active+route_law, active+commit_policy, and active+completion_condition. Include one near-empty or active-only regression first only if needed, and include a wrong-next conflict late to confirm route_sequence authority over bad next fields.
**Avoid / do not repeat**: do not treat heuristic PASS_CANDIDATE on active-only as a clean pass when assistant prose says Cannot advance | do not repeat active-only as the main proof | do not introduce a full baseline before combination candidates | do not let exact response_contract wording rescue the cases | do not move to broad language expansion until the minimum viable packet combo is identified | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: Use 6 to 8 cases. Test active+next, active+route_sequence, active+route_law, active+commit_policy, active+completion_condition, and active+route_sequence+wrong-next conflict. Put combination candidates before any full baseline.
**Retirement condition**: Retire this pointer when one or two minimal combinations reliably advance clear_trash to collect_dishes without prior scaffold exposure, while underpowered carriers still HOLD and wrong-next conflict still rejects stack_papers.
**Next action for fresh chat**: Enter research-planning mode and design route_law_minimum_viable_packet_combo_v1. Treat route_law_active_floor_isolation_v1 as retired because active-only collapsed in cold order.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_active_floor_isolation_v1 result 20260613-170853-route_law_active_floor_isolation_v1.
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

- Last tabulated at: 2026-06-13T21:13:27.855Z
- Run count: 11
- Case count: 65
- Latest suite ID: route_law_active_floor_isolation_v1
- Latest run ID: 20260613-170853-route_law_active_floor_isolation_v1
- Classification counts: {"PASS_CANDIDATE":51,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5,"HOLD_NEEDS_REVIEW":8}
- Open findings count: 0
- Case-law matrix rows: 65

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