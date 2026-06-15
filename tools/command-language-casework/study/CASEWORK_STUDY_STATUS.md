# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: route_law_label_activation_scaffold_ablation_15case_v1
**Purpose**: Find the true minimum packet carrier set after route_law_minimal_field_ablation_v1 showed route law survives single-family ablations when alternate scaffolding remains.
**Evidence reviewed**: Cases 001-005 recognized active_chunk_label text but refused move_on because active_chunk_id or a stronger carrier was absent. | Cases 006-008 failed safely with no active chunk field, so reduced packets did not import prior state. | Cases 009-011 showed active_chunk_id-only and active_chunk_id combinations still advance to collect_dishes. | Case 012 showed active_chunk_id takes precedence over conflicting active_chunk_label by advancing stack_papers to wipe_surface. | Cases 013-014 showed active_chunk_label can advance when paired with route_id, allowed_intents, commit_policy, and legal_successor metadata.
**Current confidence**: medium
**Open gap**: Which scaffold field or minimal combination makes active_chunk_label actionable: route_id, allowed_intents, commit_policy naming active_chunk_label, legal_successor_chunk_id/label, response_contract, or some interaction among them.
**Test strategy**: Run a 15-case label-scaffold ablation suite with active_chunk_id absent from the first scaffold block. Start from active_chunk_label plus one scaffold field at a time, then pairwise combinations, then wrong-successor controls, then late active_chunk_id health baselines. The goal is to separate label recognition from legal advancement authority.
**Avoid / do not repeat**: Do not call cases 001-005 semantic passes just because the heuristic marked PASS_CANDIDATE; they failed the expected advancement behavior. | Do not retest pure label-only as unresolved; it has now failed in true case-001 cold position. | Do not expose route_sequence. | Do not let legal_successor_chunk_id become hidden route authority without wrong-successor controls. | Do not route to tool repair; this run completed cleanly. | route_law_contract_relaxation_matrix_v1 as a clone | route_law_language_expansion_v1 strict response_contract smoke behavior
**Suite shape recommendation**: 15 cases, label-scaffold ablation. Keep active_chunk_id absent until the late health block. Test active_chunk_label plus commit_policy, response_contract, allowed_intents, route_id, legal_successor fields, and wrong-successor variants, then finish with active_chunk_id-only and two-field baselines.
**Retirement condition**: Retire when the run identifies a smallest scaffold that makes active_chunk_label actionable without active_chunk_id, or shows that only the larger successor/commit-policy composite works while smaller scaffold fields fail.
**Next action for fresh chat**: Generate validator-ready suite JSON for route_law_label_activation_scaffold_ablation_15case_v1. Focus on active_chunk_label without active_chunk_id, ablate scaffold fields one at a time, include wrong-successor controls, and use move_on as the scripted reply.
**Source**: Post-run CASEWORK_REVIEW_V1 for route_law_label_singleton_true_cold_swapped_order_15case_v1 result 20260615-133127-route_law_label_singleton_true_cold_swapped_order_15case_v1.
**Set by**: Billy / ChatGPT post-run review
**Set at**: 2026-06-15

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

- Last tabulated at: 2026-06-15T19:31:00.663Z
- Run count: 45
- Case count: 507
- Latest suite ID: route_law_label_singleton_true_cold_swapped_order_15case_v1
- Latest run ID: 20260615-133127-route_law_label_singleton_true_cold_swapped_order_15case_v1
- Classification counts: {"PASS_CANDIDATE":375,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":34,"HOLD_NEEDS_REVIEW":97}
- Open findings count: 0
- Case-law matrix rows: 507

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