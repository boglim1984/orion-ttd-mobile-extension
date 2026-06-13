# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_minimal_field_ablation_v1
**Purpose**: Find the smallest command packet field set that still preserves route law after route_law_contract_relaxation_matrix_v1 showed relaxed packets can preserve continue, done, move_on, and side-question return behavior.
**Evidence reviewed**: route_law_contract_relaxation_matrix_v1 imported result showed relaxed route-law packets preserved continue, done, move_on, and side-question return behavior | the relaxed move_on case advanced exactly one chunk to collect_dishes without exact response_contract transition wording | the late wrong-next stack_papers negative control remained protective and was not flattened into a false pass
**Current confidence**: Confidence is now high that route law can survive relaxed response_contract wording, but medium/limited on which packet fields are actually carrying that behavior.
**Open gap**: The current evidence does not yet isolate whether route survival depends on active_chunk_id, active_chunk_label, next_chunk_id, next_chunk_label, route_sequence, allowed_intents, or free-text route_law wording.
**Test strategy**: Use a focused ablation matrix. Remove or weaken one field family at a time while keeping the route behavior observable. Preserve a strict control, relaxed baseline, minimal active-chunk-only variant, next-chunk removal variant, label-only variant, route_sequence-only variant, side-question variant, and late wrong-next negative control.
**Avoid / do not repeat**: do not repeat strict-versus-relaxed response_contract testing as the main agenda | do not run another scorer-validation suite unless a scorer dispute reopens | do not remove multiple field families in the same case before a baseline ablation is established | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: Use 6 to 8 cases in one disposable chat. Mark the suite as ablation/matrix, preserve case order, and keep one late negative control.
**Retirement condition**: Retire this pointer after an imported result identifies the smallest packet field set that still preserves legal continue/done/move_on behavior, or isolates the first removed field family that breaks route survival.
**Next action for fresh chat**: Enter research-planning mode first. Inspect the imported route_law_contract_relaxation_matrix_v1 result, confirm the strict-versus-relaxed agenda is satisfied, then design a minimal-field ablation suite. Only emit runnable JSON when Billy explicitly asks for the suite.
**Source**: Post-import review of route_law_contract_relaxation_matrix_v1 result 20260613-153256.
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

- Last tabulated at: 2026-06-13T19:42:52.828Z
- Run count: 8
- Case count: 41
- Latest suite ID: route_law_contract_relaxation_matrix_v1
- Latest run ID: 20260613-153256-route_law_contract_relaxation_matrix_v1
- Classification counts: {"PASS_CANDIDATE":35,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":5}
- Open findings count: 0
- Case-law matrix rows: 41

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