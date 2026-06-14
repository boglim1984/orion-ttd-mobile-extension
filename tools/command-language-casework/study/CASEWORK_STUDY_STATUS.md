# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_headerless_two_field_minimum_confirmation_15case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Case 001 passed cold with only route_id, active_chunk_id, and commit_policy, loading clear_trash and advancing to collect_dishes on move_on. | Cases 002 through 008 showed extra fields such as active_chunk_label, allowed_intents, activation_frame, packet_interpretation, protocol, and command_id are not necessary when route_id, active_chunk_id, and commit_policy are present or equivalent scaffold remains. | Cases 009 through 012 showed label-only, route_id-only, active_chunk_id-only, and missing active_chunk_id controls did not produce a clean legal clear_trash to collect_dishes pass. | Case 013 showed active_chunk_id outranks conflicting label text: stack_papers was loaded and moved to wipe_surface. | Case 014 showed an explicit wrong successor did not override route law; the assistant still advanced clear_trash to collect_dishes. | Case 015 confirmed explicit legal successor sanity still passes in a headerless packet.
**Current confidence**: high
**Open gap**: The exact two-field threshold remains untested. The completed suite proves route_id + active_chunk_id + commit_policy is sufficient, and proves each singleton or missing-active state is not sufficient, but it did not directly test route_id + active_chunk_id without commit_policy as the first cold packet or across repetitions.
**Test strategy**: Run a 15-case confirmatory threshold suite. Put route_id + active_chunk_id with no commit_policy as case 001 cold. Repeat that two-field packet in multiple positions to check endurance and warmed-context effects. Contrast against route_id + active_chunk_id + commit_policy, route_id + active_chunk_id + activation_frame, route_id + active_chunk_id + packet_interpretation, route_id + active_chunk_id + allowed_intents, and direct negative controls. Include conflict cases where label disagrees with active_chunk_id and where commit_policy is absent.
**Avoid / do not repeat**: Do not repeat header spelling or normal TTD_COMMAND_V1 header baselines. | Do not expose route_sequence. | Do not over-scaffold every positive case with activation_frame or packet_interpretation. | Do not treat PASS_CANDIDATE on a conflict case as proof of clear_trash to collect_dishes unless the movement is actually legal for the stated active_chunk_id. | Do not route to tool repair; this run completed cleanly. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15 cases, headerless cold-start threshold confirmation. Use literal move_on. Include at least three direct route_id + active_chunk_id only trials, several one-field additions, and negative controls for each singleton, missing active_chunk_id, wrong active_chunk_id, and wrong successor.
**Retirement condition**: Retire this pointer when route_id + active_chunk_id alone either passes reliably across cold and repeated positions, or fails clearly enough to show commit_policy or activation wording is required. Negative controls must continue to reject singleton and missing-active packets.
**Next action for fresh chat**: Generate validator-ready suite JSON for route_law_headerless_two_field_minimum_confirmation_15case_v1, centered on direct route_id + active_chunk_id only packets with no commit_policy.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_headerless_minimum_carrier_field_matrix_15case_v1 result 20260614-152243-route_law_headerless_minimum_carrier_field_matrix_15case_v1.
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

- Last tabulated at: 2026-06-14T19:28:45.844Z
- Run count: 42
- Case count: 462
- Latest suite ID: route_law_headerless_minimum_carrier_field_matrix_15case_v1
- Latest run ID: 20260614-152243-route_law_headerless_minimum_carrier_field_matrix_15case_v1
- Classification counts: {"PASS_CANDIDATE":337,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":34,"HOLD_NEEDS_REVIEW":90}
- Open findings count: 0
- Case-law matrix rows: 462

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