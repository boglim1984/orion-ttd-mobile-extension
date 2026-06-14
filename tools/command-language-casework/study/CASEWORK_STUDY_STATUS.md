# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_protocol_activation_frame_minimum_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_semantic_001 showed desk-reset-v0 + active_chunk_id + commit_policy advanced clear_trash to collect_dishes before explicit successor exposure. | route_semantic_002 through route_semantic_005 showed synthetic, malformed, omitted, and conflicting route_id variants did not infer collect_dishes and held clear_trash. | route_semantic_006 through route_semantic_010 showed explicit no-successor guard wording blocked inferred movement, including for known desk-reset-v0. | route_semantic_011 showed known desk-reset-v0 plus wrong next_chunk_id=stack_papers still moved to collect_dishes, so next_chunk_id was not treated as authority. | route_semantic_012 and route_semantic_013 showed unknown/conflicting route ids plus wrong next_chunk_id held clear_trash rather than using stack_papers. | route_semantic_014 and route_semantic_015 returned no active chunk when active_chunk_id was absent, preserving the no-active sentinel boundary. | route_semantic_016 through route_semantic_018 confirmed explicit route_sequence, explicit legal_successor, and late known-route minimal repeat all advanced to collect_dishes.
**Current confidence**: high
**Open gap**: The study now knows inferred movement depends on known desk-reset-v0 semantic memory, but not the minimum packet/frame wording required for the assistant to treat TTD_COMMAND_V1 as active route state rather than text to summarize.
**Test strategy**: Run a focused protocol activation-frame suite that keeps the known semantic route ingredients controlled while ablating or varying protocol marker, route-holder framing, packet-interpretation framing, readiness contract, response contract, allowed_intents, state_version, session_id, command_id, and minimal response requirements. Measure whether the assistant engages as route holder, preserves active_chunk_id, applies move_on only when allowed, and avoids summarizing the packet.
**Avoid / do not repeat**: Do not retest route_id semantic memory as the main question. | Do not expose route_sequence or legal_successor early unless used as late positive controls. | Do not treat next_chunk_id as authority. | Do not confuse scorer HOLD on no-active sentinels with language failure when the assistant says no active chunk. | Do not make the next suite a broad ablation matrix; isolate protocol activation framing. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 18 cases. Start with stripped known-route minimal packets that vary only activation framing. Include plain TTD_COMMAND_V1 marker, no protocol marker, protocol field only, route-holder frame, packet-interpretation frame, readiness contract, response-contract variants, allowed_intents omission, and no-active sentinels. End with explicit route_sequence/legal_successor positives and one late minimal known-route repeat.
**Retirement condition**: Retire when the study can state the smallest activation frame that reliably causes the assistant to treat TTD_COMMAND_V1 as active route state, preserve the active chunk, and apply move_on without summarizing or inventing route progress.
**Next action for fresh chat**: Generate a validator-ready route_law_protocol_activation_frame_minimum_v1 suite focused on minimum activation framing for TTD_COMMAND_V1 route-state behavior, using the known desk-reset-v0 semantic carrier only as a controlled substrate and avoiding early explicit successor exposure.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_known_route_id_semantic_memory_isolation_v1 result 20260613-214944-route_law_known_route_id_semantic_memory_isolation_v1.
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

- Last tabulated at: 2026-06-14T01:59:00.154Z
- Run count: 29
- Case count: 297
- Latest suite ID: route_law_known_route_id_semantic_memory_isolation_v1
- Latest run ID: 20260613-214944-route_law_known_route_id_semantic_memory_isolation_v1
- Classification counts: {"PASS_CANDIDATE":203,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":21,"HOLD_NEEDS_REVIEW":72}
- Open findings count: 0
- Case-law matrix rows: 297

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