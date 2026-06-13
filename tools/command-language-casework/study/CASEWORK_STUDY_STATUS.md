# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: casework_status_pointer_cleanup_v1
**Purpose**: Close the completed scorer_keyword_extraction_v3_fresh_validation agenda and harden the manual next-study workflow so satisfied manual pointers do not keep reappearing in fresh chats, launch bundles, or Command Center mirrored study-status context.
**Next action for fresh chat**: Do not design a new language suite yet. First confirm that the scorer v3 validation result is recorded as completed, then update the manual next-study pointer away from scorer validation. Verify that Casework Start / TTD TESTS fresh-chat context no longer routes back to the completed scorer v3 agenda. After this cleanup, resume command-language research with route_law_language_expansion_v1.
**Source**: scorer_keyword_extraction_v3_fresh_validation imported result, run 20260613-142922-scorer_keyword_extraction_v3_fresh_validation; TTD TESTS post-run review; main dev/design closeout decision.
**Set by**: Billy / ChatGPT main dev-design review
**Set at**: 2026-06-13

### Recommended Next Cases
- confirm CASEWORK_STUDY_STATUS.md and CASEWORK_STUDY_STATUS.json no longer point to scorer_keyword_extraction_v3_fresh_validation as the active next study
- confirm the v3 scorer validation result remains recorded as completed and durable
- confirm CASEWORK_OPEN_FINDINGS.md still reports no open findings
- confirm Casework Start / TTD TESTS launch context surfaces the updated pointer
- confirm Command Center mirrored study-status skill is refreshed after the pointer change
- document or patch the closeout rule: completed manual next-study agendas must be explicitly retired before the next fresh-chat design cycle
- set the following research pointer to route_law_language_expansion_v1 once cleanup is verified

## Artifact roles

- Raw result JSON = evidence
- Reflection review = interpretation
- Case-law matrix = cumulative analysis
- Legal system = authority/evidence language
- Study status = agenda
- Rulebook = agent behavior

## Open integration question

- Collapse or redesign overlapping artifacts if they become duplicate sources of truth.

## Computed summary
Generated from raw result files.

- Last tabulated at: 2026-06-13T18:38:14.347Z
- Run count: 6
- Case count: 29
- Latest suite ID: scorer_keyword_extraction_v3_fresh_validation
- Classification counts: {"PASS_CANDIDATE":24,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":4}
- Open findings count: 0
- Case-law matrix rows: 29

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