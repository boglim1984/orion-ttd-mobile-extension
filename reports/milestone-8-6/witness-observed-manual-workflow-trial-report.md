# Milestone 8.6 Witness-Observed Manual Workflow Trial Report

## Status

Trial 1R complete / PASS, including the `move_on` boundary.

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

## Trial 1R Result

- result record:
  `reports/milestone-8-6/trial-1r-clear-trash-continue-done-result.md`
- status:
  Trial 1R complete / PASS
- assistant entered the route trial directly
- assistant stayed on `clear_trash`
- done boundary held until `move_on` or `next`
- no hidden progress was invented

## Move On Boundary Result

- result record:
  `reports/milestone-8-6/trial-1r-move-on-boundary-result.md`
- status:
  PASS
- `continue` preserved `active_chunk_id: clear_trash`
- `done` completed only `clear_trash` and held
- `move_on` advanced exactly one chunk to `collect_dishes`
- assistant did not skip to `stack_papers`
- assistant did not restart the route
- assistant did not invent unrelated progress
- next trial:
  record the next boundary only after the `collect_dishes` step is exercised cleanly

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

## Why MCP Still Matters

The witness-observed manual trial is a bridge step, not the destination. The WebKit/MCP lane exists so Codex/agents can eventually run these trials directly: trigger or insert packets, read extension witness evidence, capture visible assistant behavior, compare against reducer/scorer expectations, and write trial records. Billy is currently serving as the manual bridge because Orion `Runtime.evaluate` remains blocked, but the system should continue toward agent-run witness-observed testing.

## Safety Boundary

- no auto-submit
- no observer
- no automation
