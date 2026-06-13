# Casework Study Status

*Generated artifact. Do not hand-edit; regenerate via casework tabulation.*

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: scorer_keyword_extraction_v3_fresh_validation
**Purpose**: Run a small fresh scorer keyword validation suite against the real ChatGPT browser surface to prove the repaired v3 scorer classifies new evidence correctly, while preserving the stack_papers negative control.
**Next action for fresh chat**: Do not redesign the scorer yet. Run a small fresh browser-surface validation of the repaired scorer, import the result, and confirm the negative stack_papers control still fails cleanly.
**Source**: Post-scorer-repair status cleanup
**Set by**: Codex tabulation repair
**Set at**: 2026-06-13

### Recommended Next Cases
- run one fresh collect_dishes advancement case on the real browser surface
- run one wrong-next stack_papers negative control on the real browser surface
- confirm repaired scorer rows still produce deterministic legal_verdict and route_survival_outcome values
- confirm imported fresh runs leave wrong-next negatives classified as lost-route rather than survived

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

- Last tabulated at: 2026-06-13T18:31:00.781Z
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