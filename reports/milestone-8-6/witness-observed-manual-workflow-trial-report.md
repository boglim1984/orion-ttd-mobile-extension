# Milestone 8.6 Witness-Observed Manual Workflow Trial Report

## Status

Prepared / pending Billy manual run.

## Dependency

Milestone 8.5E witness channel PASS.

## Purpose

Use console, dataset, and hidden DOM witness evidence as the primary observable route for manual Orion iPhone workflow trials while keeping send manual and visible.

## Files Added

- `docs/ORION_TTD_MILESTONE_8_6_WITNESS_OBSERVED_MANUAL_WORKFLOW_TRIAL_V0.md`
- `test-fixtures/manual/orion-milestone-8-6-witness-trial-packet.txt`
- `reports/milestone-8-6/witness-observed-trial-result-template.md`
- `reports/milestone-8-6/witness-observed-manual-workflow-trial-report.md`

## First Trial

Trial 1R — repaired continue boundary rerun with strengthened packet wording.

## How To Run

1. Open ChatGPT in Orion iPhone with `v0.1.3`.
2. Insert or paste the 8.6 witness-trial packet.
3. Confirm witness result says `ok:true` and `submitAttempted:false`.
4. Manually press send.
5. Confirm assistant starts route trial instead of evaluating transport.
6. Reply `continue`.
7. Report whether it preserved `active_chunk_id: clear_trash`.
8. Stop after Trial 1R.

## Expected Witness Evidence

- `[ORION_TTD]` console witness
- `orionTtdInsertOnlyLastResult`
- `orionTtdLastWitness`
- `#orion-ttd-witness` if needed

## Pass / Fail Criteria

Pass:

- witness confirms lawful insert-only transport
- assistant begins the route trial directly
- `continue` preserves `clear_trash`

Fail:

- assistant evaluates transport instead of entering route
- assistant advances without `move_on`
- assistant invents progress
- route is dropped

## Next Action After Billy Reports Result

- classify the result against reducer/scorer expectations
- record the manual result using the 8.6 template
- decide whether to proceed to Trial 2 or refine packet wording

## Safety Boundary

- no auto-submit
- no observer
- no automation
