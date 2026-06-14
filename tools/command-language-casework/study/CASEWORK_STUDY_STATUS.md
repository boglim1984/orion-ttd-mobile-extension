# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_headerless_minimum_carrier_field_matrix_15case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Case 001 raw JSON no-header packet succeeded as the first cold packet and advanced clear_trash to collect_dishes. | Case 002 no-header/no-command_id also succeeded. | Case 003 no-header/no-protocol with activation_frame and packet_interpretation succeeded. | Cases 004 through 006 showed damaged header, lowercase header, and prefaced JSON still preserved route law before the late normal-header baseline. | Cases 007 and 008 confirmed late known-good header and explicit legal_successor sanity controls still advanced to collect_dishes. | Run completed on the real ChatGPT page with the self-contained runner and no observed tool failure.
**Current confidence**: high
**Open gap**: We now know the header line is unnecessary, but we do not yet know which fields are actually necessary when the packet is headerless and cold. Current passing packets still contain overlapping scaffolds such as route_id, active_chunk_id, active_chunk_label, allowed_intents, commit_policy, protocol, command_id, or activation wording.
**Test strategy**: Run a 15-case headerless cold-start minimum-carrier matrix. Start with the smallest plausible positive carrier, such as route_id plus active_chunk_id plus commit_policy, then ablate label, allowed_intents, commit_policy, protocol, command_id, activation_frame, and packet_interpretation. Include negative controls such as label-only, route_id-only, active_chunk_id-only, missing active_chunk_id, wrong active_chunk_id, and explicit wrong successor to ensure the scorer does not accept vague route-ish behavior.
**Avoid / do not repeat**: Do not spend another suite on exact TTD_COMMAND_V1 header spelling. | Do not begin with a normal TTD_COMMAND_V1 header baseline. | Do not expose route_sequence. | Do not rely only on positive cases; include negative controls for label-only and wrong-next behavior. | Do not treat warmed sequential evidence as identical to first-case cold-start evidence. | Do not route to tool/schema repair; this result shows the runner can handle non-header packet strings. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15 cases, headerless first, minimum-carrier field matrix, with at least 10 positive/ablation contrasts and 5 negative or sanity controls. Keep scripted replies literal: move_on.
**Retirement condition**: Retire this pointer when the field matrix identifies a smallest reliable headerless carrier or shows that multiple field families are jointly required, and when negative controls remain rejected or clearly fail route engagement.
**Next action for fresh chat**: Generate validator-ready suite JSON for route_law_headerless_minimum_carrier_field_matrix_15case_v1. The suite should test the smallest headerless carrier field sets and include explicit negative controls for label-only, missing active_chunk_id, wrong active_chunk_id, and wrong successor.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_headerless_cold_first_counterbalance_8case_v1 result 20260614-150648-route_law_headerless_cold_first_counterbalance_8case_v1.
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

- Last tabulated at: 2026-06-14T19:11:21.304Z
- Run count: 41
- Case count: 447
- Latest suite ID: route_law_headerless_cold_first_counterbalance_8case_v1
- Latest run ID: 20260614-150648-route_law_headerless_cold_first_counterbalance_8case_v1
- Classification counts: {"PASS_CANDIDATE":326,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":31,"HOLD_NEEDS_REVIEW":89}
- Open findings count: 0
- Case-law matrix rows: 447

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