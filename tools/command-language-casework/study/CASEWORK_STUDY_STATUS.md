# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_cold_start_gating_isolation_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_protocol_activation_frame_v1 result 20260613-201524 completed with 17 responded cases and no tool failures. | protocol_activation_001_active_only_baseline advanced from clear_trash to collect_dishes without legal_successor_chunk_id or route_sequence. | protocol_activation_014_wrong_next_dominance ignored wrong next_chunk stack_papers and produced collect_dishes. | protocol_activation_003_next_only_inert_control and protocol_activation_015_next_only_full_frame_control also produced clear_trash to collect_dishes despite missing active_chunk_id.
**Current confidence**: medium
**Open gap**: It is unknown whether active_chunk_id is actually the gating carrier. The model may be reconstructing the known desk-reset route from route_id, next_chunk labels, protocol framing, prior cases in the same run, or ambient learned context.
**Test strategy**: Run a cold-start gating isolation suite that places inert controls first and separates case order effects. Include no-active/no-next packet controls, route_id-only controls, next-only first controls, active-only first controls, active-only late retests, wrong-next probes, and repeated controls after successful active cases. Prefer unique session_ids per case and make the suite explicitly measure whether sequential carryover contaminates later controls.
**Avoid / do not repeat**: do not add route_sequence | do not add more activation-frame variants until gating is isolated | do not count next-only HOLD results as route-law passes | do not retire protocol activation solely because all frame variants passed | do not mix cold-start evidence with late-run carryover evidence without labeling the run position | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15 to 20 cases focused on cold-start gating and order effects: start with next-only and route_id-only inert controls, then active-only first-case probes, then active plus wrong-next dominance probes, then late inert retests to measure contamination.
**Retirement condition**: Retire when active_chunk_id-containing packets reliably advance clear_trash to collect_dishes while packets without active_chunk_id remain inert in both first-position and late-position controls.
**Next action for fresh chat**: Generate a validator-ready route_law_cold_start_gating_isolation_v1 suite that tests no-active controls before any successful active route case and records order/carryover effects explicitly.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_protocol_activation_frame_v1 result 20260613-201524-route_law_protocol_activation_frame_v1.
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

- Last tabulated at: 2026-06-14T00:21:57.580Z
- Run count: 22
- Case count: 169
- Latest suite ID: route_law_protocol_activation_frame_v1
- Latest run ID: 20260613-201524-route_law_protocol_activation_frame_v1
- Classification counts: {"PASS_CANDIDATE":108,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":19,"HOLD_NEEDS_REVIEW":41}
- Open findings count: 0
- Case-law matrix rows: 169

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