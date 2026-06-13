# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_minimal_activation_scaffold_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: route_law_next_chunk_latent_001 and 002 showed no-field and allowed_intents-only packets stayed at pause and did not invent route movement. | route_law_next_chunk_latent_003 through 014 showed next_chunk_id-only, next_chunk_label-only, and paired next_chunk fields across collect_dishes, stack_papers, wipe_surface, and choose_next stayed at pause after move_on, so next_chunk-only was inert in this stripped packet style. | route_law_next_chunk_latent_015 showed explicit active_chunk clear_trash plus conflicting next_chunk stack_papers did not legally advance to collect_dishes and was classified FAIL_LOST_ROUTE, revealing an activation-scaffold gap.
**Current confidence**: medium
**Open gap**: It is now unclear what minimum wording or field scaffold is required for active_chunk_id and active_chunk_label to become actionable in a stripped packet. Prior suites showed active carriers working when other scaffolding or context was present, but this suite showed explicit active fields alone can fail after a heavily pause-oriented reduced-packet sequence.
**Test strategy**: Run a focused minimal activation scaffold suite. Keep active_chunk_id and active_chunk_label as the core carrier. Do not include route_sequence. Vary only small activation fields or phrases such as command intent, commit_policy, expected reducer semantics wording inside packet, active/current wording, and one minimal move_on rule. Include controls with active fields only, active plus wrong next, active plus next omitted, and next-only inert controls. Put explicit-active positive controls early and late to separate true scaffold effect from long-context pause contamination.
**Avoid / do not repeat**: do not repeat the full 12-case next_chunk-only matrix unless needed as a small control | do not include route_sequence in core activation-scaffold cases | do not use broad route_law rescue wording that makes the minimum field carrier ambiguous | do not treat pause-only next_chunk results as PASS without recording them as inert/non-activating | do not overinterpret case 015 as disproving active carriers globally because earlier position-generalization runs already showed active carriers can work with other scaffolding | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15-case activation-scaffold boundary suite: early active-only baseline, minimal scaffold variants, explicit active plus wrong-next dominance probes, next-only inert controls, and late active-only retest to check context/carryover.
**Retirement condition**: Retire this pointer when one or more minimal non-route_sequence scaffolds reliably make active_chunk fields actionable for exact one-step move_on advancement, and when the suite distinguishes scaffold necessity from next_chunk latent-carrier behavior.
**Next action for fresh chat**: Generate a validator-ready route_law_minimal_activation_scaffold_v1 suite focused on explicit active_chunk carriers with no route_sequence, varying only minimal activation wording or fields, with next_chunk-only inert controls and early/late active retests.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_next_chunk_latent_carrier_boundary_v1 result 20260613-192913-route_law_next_chunk_latent_carrier_boundary_v1.
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

- Last tabulated at: 2026-06-13T23:36:58.185Z
- Run count: 20
- Case count: 137
- Latest suite ID: route_law_next_chunk_latent_carrier_boundary_v1
- Latest run ID: 20260613-192913-route_law_next_chunk_latent_carrier_boundary_v1
- Classification counts: {"PASS_CANDIDATE":93,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":6,"HOLD_NEEDS_REVIEW":37}
- Open findings count: 0
- Case-law matrix rows: 137

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