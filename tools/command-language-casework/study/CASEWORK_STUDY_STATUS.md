# Casework Study Status

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: casework_reflection_loop_v1_validation
**Purpose**: Validate the reflection loop, case-law matrix regeneration, legal interpretation fields, and GUI/server affordances before new suite design resumes.
**Next action for fresh chat**: Do not design a new scorer/language suite yet. Validate Reflection Loop v1 against current imported runs and one fresh result import, then decide whether the workflow is stable enough to resume suite design.
**Source**: Casework Reflection Loop v1 implementation
**Set by**: Billy / ChatGPT review
**Set at**: 2026-06-13

### Recommended Next Cases
- import an existing downloaded result JSON through the reflection path
- confirm Mermaid-first review completion before agenda change
- confirm case-law matrix backfill rows from existing imported runs
- confirm legal_verdict and route_survival_outcome fields stay deterministic
- confirm manual next-study pointer survives tabulation
- confirm GUI reflection affordances remain low-noise

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

- Last tabulated at: 2026-06-13T17:43:47.561Z
- Run count: 4
- Case count: 25
- Latest suite ID: scorer_keyword_extraction_v2
- Classification counts: {"PASS_CANDIDATE":22,"FAIL_INVENTED_PROGRESS":1,"FAIL_LOST_ROUTE":2}
- Open findings count: 6
- Case-law matrix rows: 25

## Open findings
Generated and/or manually curated.

- **casework_reflection_loop_missing_001** (open): Post-run follow-up is weak. Result JSON should be digested into Mermaid review, pass/failure summary, tool/scorer/language classification, an explicit next-study status update, and a cumulative case-law matrix append before any new suite is designed. Recommended next study: casework_reflection_loop_v1_validation
- **casework_window_model_miscount_001** (open): The real workflow needs three surfaces: design chat, Casework GUI, and disposable ChatGPT test tab. Startup/launcher behavior and docs should make this obvious. Recommended next study: casework_reflection_loop_v1_validation
- **casework_case_law_matrix_missing_001** (open): One-off test results should also accumulate into a single high-detail case-law/rule-design matrix for later large-scale analysis and strong rule design. Recommended next study: casework_reflection_loop_v1_validation
- **casework_legal_system_not_integrated_001** (open): The Orion TTD legal system exists but is not yet woven into the Casework test pipeline; future reflection/scoring should map evidence, claims, committed state, legal verdicts, and route-survival outcomes explicitly. Recommended next study: casework_reflection_loop_v1_validation
- **casework_artifact_overlap_risk_001** (open): Reflection loop integration may create overlapping sources of truth. During integration, test whether each artifact reduces confusion or adds maintenance; collapse/redesign overlaps before adding more machinery. Recommended next study: casework_reflection_loop_v1_validation
- **scorer_collect_dishes_false_lost_route_001** (open): Heuristic/scorer keyword extraction may miss collect_dishes even when assistant visible text contains the correct transition, causing false FAIL_LOST_ROUTE. Recommended next study: scorer_keyword_extraction_v1_after_reflection_repair