# Casework Study Status

## Manual next-study pointer
This is the human/LLM-reviewed next move. Tabulation must not overwrite it by default.

**Next Study Needed**: casework_reflection_loop_v1
**Purpose**: Fix the post-run follow-up loop before designing more scorer or language suites. The Casework system must reliably turn a result JSON into reflection, classification, study-status update, cumulative case-law mapping, and a next-test recommendation.
**Next action for fresh chat**: Do not design another scorer/language suite first. Help Billy define or implement Casework Reflection Loop v1: after every run, import/save the result, review with Mermaid first, classify tool vs scorer vs language failure, append detailed normalized rows to a cumulative case-law matrix, apply the Orion TTD legal-system frame where relevant, update CASEWORK_STUDY_STATUS.md/json, and only then design the next suite.
**Source**: Billy / ChatGPT review after scorer keyword extraction v2 and Casework workflow critique
**Set by**: Billy / ChatGPT review
**Set at**: 2026-06-13

### Follow-up repair note
- Current concern: messy tests pile up without enough reflection, planning, ownership of the next-test status, or cumulative analysis surface.
- Required repair: make the post-run digest mandatory before the next suite is designed.
- Ownership rule: the design/review chat proposes the next study from the result; the import/tabulation/status layer records the current next-study pointer; fresh chats must read this status before creating new suites.
- Window model to preserve: design chat creates/reviews JSON, Casework GUI validates/runs setup, disposable ChatGPT test tab executes the runner.
- Cumulative map rule: one-off result reviews should guide the immediate next move, but every case should also append high-detail normalized data to a single case-law/rule-design matrix for later analysis.
- Legal integration rule: tomorrow's follow-up should weave the Orion TTD legal system into the test pipeline so results can be read through committed state, evidence, prose-as-claim, signals, smallest legal reduction, HOLD/REPAIR/REANCHOR, and PASS/FAIL route-survival language.

### Recommended Next Cases / Checks
- Verify the launcher/window model opens or clearly instructs the three required surfaces: design chat, Casework GUI, disposable ChatGPT test tab.
- Add or document a required post-run review step: Mermaid first, most important pass, most important failure, tool/scorer/language classification, next-study recommendation.
- Add a cumulative case-law/rule-design matrix target, likely `CASEWORK_CASE_LAW_MATRIX_V1`, with high-detail fields for later pattern mining.
- Preserve raw result JSON separately; the matrix should normalize and append rows, not replace raw evidence.
- Include fields such as suite_id, case_id, date, route_id, active_chunk_id, boundary_type, packet_style, steering_language, scripted_user_reply, expected_behavior, observed_behavior, classification, failure_layer, failure_class, repair_needed, repair_worked, important_excerpt, legal_verdict, legal_evidence_type, candidate_rule, candidate_skill_block, and next_status.
- Confirm import/tabulation updates or preserves the manual next-study pointer correctly.
- Confirm fresh skill-loaded chats refuse to design a new suite when the status says follow-up repair comes first.
- Add a tomorrow task to update `ttdmobile_coding_rulebook.md` so agents know how to use the reflection loop, cumulative case-law matrix, and legal-system test interpretation.

## Computed summary
Generated from raw result files.

- Last tabulated at: 2026-06-13T05:06:52.170Z
- Run count: 4
- Case count: 25
- Latest suite ID: scorer_keyword_extraction_v2
- Classification counts: {"PASS_CANDIDATE":13,"FAIL_LOST_ROUTE":12}
- Open findings count: 4

## Open findings
Generated and/or manually curated.

- **casework_reflection_loop_missing_001** (open): Post-run follow-up is weak. Result JSON should be digested into Mermaid review, pass/failure summary, tool/scorer/language classification, an explicit next-study status update, and a cumulative case-law matrix append before any new suite is designed. Recommended next study: casework_reflection_loop_v1
- **casework_window_model_miscount_001** (open): The real workflow needs three surfaces: design chat, Casework GUI, and disposable ChatGPT test tab. Startup/launcher behavior and docs should make this obvious.
- **casework_case_law_matrix_missing_001** (open): One-off test results should also accumulate into a single high-detail case-law/rule-design matrix for later large-scale analysis and strong rule design.
- **casework_legal_system_not_integrated_001** (open): The Orion TTD legal system exists but is not yet woven into the Casework test pipeline; future reflection/scoring should map evidence, claims, committed state, legal verdicts, and route-survival outcomes explicitly.
- **scorer_collect_dishes_false_lost_route_001** (open): Heuristic/scorer keyword extraction may miss collect_dishes even when assistant visible text contains the correct transition, causing false FAIL_LOST_ROUTE. Recommended next study after reflection repair: scorer_keyword_extraction_v1
