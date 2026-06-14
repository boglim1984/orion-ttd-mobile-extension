# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_protocol_activation_frame_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_minimal_activation_scaffold_v1 result 20260613-194343 showed 13 FAIL_LOST_ROUTE and 2 HOLD_NEEDS_REVIEW across 15 cases. | Active-only early and late retests both failed, so active_chunk_id and active_chunk_label alone are not actionable in this stripped packet style. | Small scaffold fields including command_intent, current_chunk/current_task wording, commit_policy, reducer_semantics, move_on_rule, and legal_successor_chunk_id did not activate the route. | Wrong-next dominance probes did not prove active-route dominance because the model did not engage the route at all. | Next-only controls remained non-activating and should be preserved as inert controls, not counted as successful route movement.
**Current confidence**: medium
**Open gap**: It is still unknown what minimal protocol/instruction frame makes the assistant interpret TTD_COMMAND_V1 as active route state instead of echoing the allowed intent text. The next test must separate field-carrier failure from packet-activation failure.
**Test strategy**: Run a focused protocol activation frame suite with active_chunk_id and active_chunk_label fixed to clear_trash / clear trash and no route_sequence. Vary only tiny instruction-frame additions: a route-holder identity sentence, an explicit packet interpretation sentence, a before-reply readiness contract, a minimal response_contract, and a minimal state-transition instruction. Include active-only controls early and late, next-only inert controls, and active plus wrong-next probes after an activation frame appears to work.
**Avoid / do not repeat**: do not add route_sequence in the core cases | do not repeat broad synonym scaffolds that already failed | do not treat next-only HOLD results as route-law passes | do not clone route_law_minimal_activation_scaffold_v1 with only field-name changes | do not use a strict output-only smoke contract that hides whether route state was actually understood | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15-case protocol activation frame suite: active-only baseline, minimal route-holder frame variants, minimal packet-interpretation variants, readiness/response-contract variants, wrong-next dominance probes only after activation frames, next-only inert controls, and late active-frame retest.
**Retirement condition**: Retire this pointer when one or more minimal instruction-frame patterns reliably make active clear_trash advance exactly one legal step to collect_dishes without route_sequence, and when next-only controls remain inert.
**Next action for fresh chat**: Generate a validator-ready route_law_protocol_activation_frame_v1 suite focused on the smallest non-route_sequence instruction frame that makes active_chunk fields executable route state.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_minimal_activation_scaffold_v1 result 20260613-194343-route_law_minimal_activation_scaffold_v1.
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

- Last tabulated at: 2026-06-14T00:02:06.554Z
- Run count: 21
- Case count: 152
- Latest suite ID: route_law_minimal_activation_scaffold_v1
- Latest run ID: 20260613-194343-route_law_minimal_activation_scaffold_v1
- Classification counts: {"PASS_CANDIDATE":93,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":19,"HOLD_NEEDS_REVIEW":39}
- Open findings count: 0
- Case-law matrix rows: 152

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