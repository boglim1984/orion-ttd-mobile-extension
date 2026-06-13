# Casework Case-Law Matrix v1

Generated from `study/raw/` and review presence in `study/reviews/`.

## Purpose

- This matrix is cumulative analysis, not the raw evidence store.
- Raw result JSON remains the evidence artifact.
- Review Markdown remains interpretation.
- Legal-system columns are interpretation language, not runtime reducer authority.

## Current Snapshot

- Row count: 25
- Source run count: 4
- Classification counts: {"PASS_CANDIDATE":13,"FAIL_LOST_ROUTE":12}

## Legal Mapping

- `legal_verdict`: `PASS`, `PASS_WITH_REPAIR`, `HOLD`, `REPAIR`, `REANCHOR`, `REJECT`, `FAIL`.
- `legal_evidence_type`: `committed_state`, `audit_log`, `visible_dom_text`, `assistant_prose_claim`, `runner_signal`, `scorer_output`.
- `claim_vs_state_conflict`: true when prose/evidence suggests route survival but the scored classification claims loss or another contradiction.
- `smallest_legal_reduction`: `preserve_state`, `complete_current_chunk`, `advance_one_chunk`, `ask_billy`, `repair_packet`, `no_mutation`.
- `route_survival_outcome`: `survived`, `survived_with_repair`, `broken`, `unknown`.

## Field Notes

- Fields may be blank when the raw result never recorded that evidence.
- Deterministic extraction prefers visible DOM evidence, runner diagnostics, and packet payload fields.
- Manual notes belong in review Markdown and `CASEWORK_STUDY_STATUS`, not by editing generated CSV/JSONL rows directly.

## Regeneration

```bash
node tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs
```