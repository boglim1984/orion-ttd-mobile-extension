# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_header_line_ablation_route_active_carrier_8case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Case 001 known-good carrier baseline advanced clear_trash to collect_dishes. | Case 002 removed the JSON protocol field and still advanced to collect_dishes. | Case 003 removed command_id and still advanced to collect_dishes. | Case 004 removed protocol and command_id while adding activation wording and still advanced to collect_dishes. | Case 005 missing active_chunk_id correctly refused movement; heuristic HOLD_NEEDS_REVIEW should be treated as semantic negative-control pass. | Case 006 ignored wrong next_chunk_id stack_papers and advanced to collect_dishes. | Case 007 missing move_on in allowed_intents blocked movement. | Case 008 explicit legal_successor sanity advanced to collect_dishes.
**Current confidence**: high
**Open gap**: The TTD_COMMAND_V1 header line itself has not been isolated. Current runner/schema habits prefer packet strings that start with TTD_COMMAND_V1, so a true header ablation may require either a runner-supported exception or a deliberate header-variant suite.
**Test strategy**: Design an 8-case header-line ablation around route_id plus active_chunk_id: known-good TTD_COMMAND_V1 header baseline, raw JSON without header, damaged header, lowercase/variant header, natural-language preface plus JSON, JSON protocol-only activation without header, activation wording without header, and final explicit legal_successor sanity. If the current GUI validator rejects non-header packets, pause and treat that as a tool/schema capability gap before running.
**Avoid / do not repeat**: Do not retest JSON protocol or command_id as the main question. | Do not expose route_sequence. | Do not let next_chunk_id become authority. | Do not count case 005 HOLD_NEEDS_REVIEW as language failure because the assistant correctly refused movement. | Do not keep every case starting with TTD_COMMAND_V1 if the research question is header-line ablation. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: Use a validator-ready 8-case header-line ablation suite if the runner permits non-header packet strings; otherwise create a small tool-capability follow-up before language testing.
**Retirement condition**: Retire this pointer when the run shows whether the first-line TTD_COMMAND_V1 header is required for activation, whether raw JSON route_id plus active_chunk_id can activate without the header, and whether damaged or variant headers fail gracefully.
**Next action for fresh chat**: Check whether the current Casework GUI validator permits packet strings that do not start with TTD_COMMAND_V1. If yes, generate route_law_header_line_ablation_route_active_carrier_8case_v1. If no, route to a tool/schema capability repair before designing the suite.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_protocol_activation_frame_ablation_route_active_carrier_8case_v1 result 20260614-144052-route_law_protocol_activation_frame_ablation_route_active_carrier_8case_v1.
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

- Last tabulated at: 2026-06-14T18:45:15.266Z
- Run count: 38
- Case count: 429
- Latest suite ID: route_law_protocol_activation_frame_ablation_route_active_carrier_8case_v1
- Latest run ID: 20260614-144052-route_law_protocol_activation_frame_ablation_route_active_carrier_8case_v1
- Classification counts: {"PASS_CANDIDATE":308,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":31,"HOLD_NEEDS_REVIEW":89}
- Open findings count: 0
- Case-law matrix rows: 429

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