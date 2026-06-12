# Milestone 8 Manual Workflow Trial Report

## Status

Prepared / pending Billy manual run.

## Milestone 7 Dependency

Passed. Real Orion iPhone + ChatGPT insert-only smoke is already validated.

## Files Added

- `docs/ORION_TTD_MILESTONE_8_MANUAL_WORKFLOW_TRIAL_V0.md`
- `test-fixtures/manual/orion-milestone-8-manual-trial-packet.txt`
- `reports/milestone-8/manual-trial-result-template.md`
- `reports/milestone-8/manual-workflow-trial-report.md`

## How To Run

1. Insert or paste the Milestone 8 manual trial packet.
2. Billy manually sends it through the real ChatGPT UI.
3. Run Trial 1 first: `continue` boundary.
4. Record the result with `reports/milestone-8/manual-trial-result-template.md`.
5. Only then expand to `done`, `move_on`, and `side_question`.

## What Counts As Pass

- assistant asks one short check-in
- `continue` preserves the active chunk
- `done` does not auto-advance
- `move_on` advances exactly one chunk
- side question returns to route

## What Counts As Fail

- route advances without `move_on`
- progress is invented
- side question becomes a route switch
- route boundary is ignored completely

## Next Action After Billy Reports Result

- compare the observed ChatGPT behavior against reducer/scorer expectations
- classify the result
- decide whether to refine packet wording, manual trial structure, or later response-contract design

## Runtime Change Confirmation

No runtime code changed in this milestone preparation job.
