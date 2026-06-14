# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_header_line_ablation_route_active_carrier_8case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Case 001 known-good TTD_COMMAND_V1 header packet activated clear_trash and move_on advanced to collect_dishes. | Case 002 raw JSON packet without the first-line TTD_COMMAND_V1 header activated clear_trash and move_on advanced to collect_dishes. | Run completed with no warnings or errors and both cases were PASS_CANDIDATE.
**Current confidence**: medium
**Open gap**: We know raw JSON without the header is runnable and worked in a minimal probe, but we have not yet isolated damaged headers, lowercase/variant headers, natural-language prefaces, protocol-only no-header packets, activation wording without header, or explicit legal_successor sanity inside a balanced suite.
**Test strategy**: Generate and run the 8-case header-line ablation suite around route_id plus active_chunk_id: known-good header baseline, raw JSON no header, damaged header, lowercase or variant header, natural-language preface plus JSON, JSON protocol-only activation without header, activation wording without header, and final explicit legal_successor sanity.
**Avoid / do not repeat**: Do not pause for tool/schema repair; Gate 1 passed. | Do not retest JSON protocol or command_id as the main question. | Do not expose route_sequence. | Do not let next_chunk_id become authority. | Do not keep every case starting with TTD_COMMAND_V1 if the research question is header-line ablation. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 8 cases, focused header-line ablation, with raw JSON and damaged/variant header contrasts plus one final explicit legal_successor sanity control.
**Retirement condition**: Retire this pointer when the 8-case run shows whether the first-line TTD_COMMAND_V1 header is required for activation, whether raw JSON route_id plus active_chunk_id reliably activates without the header, and whether damaged or variant headers fail gracefully or preserve route law.
**Next action for fresh chat**: Generate validator-ready suite JSON for route_law_header_line_ablation_route_active_carrier_8case_v1 using the current runner schema. Gate 1 is already passed, so proceed to Gate 2.
**Source**: Post-run CASEWORK_REVIEW_V1 for validator_header_capability_probe_v1 result 20260614-144844-validator_header_capability_probe_v1.
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

- Last tabulated at: 2026-06-14T18:54:25.963Z
- Run count: 39
- Case count: 431
- Latest suite ID: validator_header_capability_probe_v1
- Latest run ID: 20260614-144844-validator_header_capability_probe_v1
- Classification counts: {"PASS_CANDIDATE":310,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":31,"HOLD_NEEDS_REVIEW":89}
- Open findings count: 0
- Case-law matrix rows: 431

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