# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_headerless_cold_first_counterbalance_8case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Case 001 known-good TTD_COMMAND_V1 header baseline activated clear_trash and move_on advanced to collect_dishes. | Case 002 raw JSON no-header packet activated clear_trash and move_on advanced to collect_dishes. | Case 003 damaged header and case 004 lowercase variant header both preserved route law and advanced to collect_dishes. | Cases 005 through 007 showed preface plus JSON, no-header/no-command_id, and no-header/no-protocol activation wording all preserved route law. | Case 008 explicit legal_successor sanity advanced to collect_dishes. | Run completed with no warnings or errors and all eight cases were PASS_CANDIDATE.
**Current confidence**: high
**Open gap**: This suite proves header-line ablation works in a sequential run that begins with a known-good header baseline. It does not fully isolate cold-start headerless activation because later no-header cases may benefit from route-law warming or carryover from case 001.
**Test strategy**: Run an 8-case cold-first counterbalance suite where the first packets are headerless before any normal TTD_COMMAND_V1 baseline appears: raw JSON no header first, lowercase/damaged/prefaced variants early, no protocol/activation wording early, then a late known-good header baseline and explicit legal_successor sanity control.
**Avoid / do not repeat**: Do not start the next suite with a known-good TTD_COMMAND_V1 header baseline. | Do not expose route_sequence. | Do not retest JSON protocol or command_id as the main question unless they are part of cold-first counterbalancing. | Do not treat warmed sequential evidence as identical to cold-start evidence. | Do not route to tool/schema repair; the validator and runner already support non-header packet strings. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 8 cases, no-header cold-first order, with normal header baseline delayed until late in the suite and explicit legal_successor sanity at the end.
**Retirement condition**: Retire this pointer when a no-header or damaged-header packet succeeds or fails as the first cold packet, establishing whether headerless route activation is independent of prior header-warmed context.
**Next action for fresh chat**: Generate validator-ready suite JSON for route_law_headerless_cold_first_counterbalance_8case_v1. The suite should deliberately place raw JSON no-header as case 001 and delay the normal TTD_COMMAND_V1 header baseline.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_header_line_ablation_route_active_carrier_8case_v1 result 20260614-145709-route_law_header_line_ablation_route_active_carrier_8case_v1.
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

- Last tabulated at: 2026-06-14T19:03:54.890Z
- Run count: 40
- Case count: 439
- Latest suite ID: route_law_header_line_ablation_route_active_carrier_8case_v1
- Latest run ID: 20260614-145709-route_law_header_line_ablation_route_active_carrier_8case_v1
- Classification counts: {"PASS_CANDIDATE":318,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":31,"HOLD_NEEDS_REVIEW":89}
- Open findings count: 0
- Case-law matrix rows: 439

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