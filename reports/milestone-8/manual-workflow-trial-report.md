# Milestone 8 Manual Workflow Trial Report

## Status

Trial 1 complete / PASS_WITH_REPAIR.

## Milestone 7 Dependency

Passed. Real Orion iPhone + ChatGPT insert-only smoke is already validated.

## Files Added

- `docs/ORION_TTD_MILESTONE_8_MANUAL_WORKFLOW_TRIAL_V0.md`
- `test-fixtures/manual/orion-milestone-8-manual-trial-packet.txt`
- `reports/milestone-8/manual-trial-result-template.md`
- `reports/milestone-8/manual-workflow-trial-report.md`
- `reports/milestone-8/trial-1-continue-boundary-result.md`

## Trial 1 Result

- status: Trial 1 complete / PASS_WITH_REPAIR
- result record:
  `reports/milestone-8/trial-1-continue-boundary-result.md`
- initial failure:
  `FAIL_NO_ROUTE_ENGAGEMENT`
- recovery used:
  route re-anchor / trial clarification prompt
- final behavior:
  assistant preserved `clear_trash` on `continue`
- next recommended action:
  patch Milestone 8 packet wording before Trial 2, or use strengthened route-start wording that explicitly says not to evaluate transport and to begin the route trial immediately

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
- refine packet wording before Trial 2 so the assistant starts the route trial directly instead of evaluating transport

## Runtime Change Confirmation

No runtime code changed in this milestone preparation job.
