# Orion TTD Milestone 8.6 Witness-Observed Manual Workflow Trial V0

Status: prepared design artifact  
Scope: manual real-ChatGPT workflow trial with extension witness evidence as the primary observable route

## Purpose

Prepare the next real Orion iPhone + ChatGPT workflow trial after Milestone 8.5E witness-channel PASS.

Milestone 8.6 uses the extension witness layer to preserve low-noise evidence of inserted command packets and manual route-trial setup while Billy manually sends the packet and manually reports the assistant behavior.

## Context From Milestones 7, 8, And 8.5

- Milestone 7 proved real Orion iPhone insert-only packet transport without submit
- Milestone 8 Trial 1 showed the route trial can work, but the initial run needed a route re-anchor and ended as `PASS_WITH_REPAIR`
- Milestone 8.5 proved the WebKit bridge can discover Orion targets but still leaves `Runtime.evaluate` blocked on Orion
- Milestone 8.5E proved the extension can emit visible witness evidence through console, dataset, and hidden DOM even when arbitrary WebKit eval remains blocked

## Core Premise

If outer WebKit eval is blocked, the inner extension can still emit observable witness records.

Milestone 8.6 uses those witness records as packet-transport and setup evidence while keeping the route trial itself manual and visible.

## Scope

- manual packet insertion or paste
- manual human send by Billy
- witness-observed packet transport evidence
- small real-ChatGPT workflow trial
- post-run comparison against reducer/scorer expectations

## Non-Goals

- no auto-submit
- no click-send
- no hidden submit
- no response observer
- no repair insertion automation
- no extension route-state authority
- no reducer/scorer execution inside the page

## Safety Boundary

- witness records are evidence only
- reducer/scorer remain legal and test authority outside the page runtime
- no cookies, tokens, localStorage, sessionStorage, IndexedDB, credentials, or account internals
- no network body scraping
- no committed route state may come from console, dataset, or DOM witness alone

## Witness Channels

- console prefix:
  `[ORION_TTD]`
- `document.documentElement.dataset`:
  - `orionTtdLastWitness`
  - `orionTtdLastWitnessKind`
  - `orionTtdLastWitnessAt`
  - `orionTtdInsertOnlyLastResult`
  - `orionTtdInsertOnlyLastError`
- DOM node:
  - `#orion-ttd-witness`

## Evidence Hierarchy

- reducer/scorer expected behavior = legal/test authority
- extension witness = packet transport evidence
- assistant prose = claim
- Billy reply = user event evidence
- manual result record = trial evidence
- committed repo report = durable precedent

## Relationship To Command Protocol

Milestone 8.6 still uses a visible `TTD_COMMAND_V1` packet.

The packet carries:

- route identity
- session identity
- active chunk identity
- allowed intents
- commit policy
- response contract
- witness expectation

The packet remains a proposal surface, not committed route state.

## Relationship To Reducer/Scorer

- reducer/scorer define the lawful expected route behavior
- Milestone 8.6 compares manual assistant behavior against those expected categories after the run
- extension witness does not replace reducer/scorer judgment

## Relationship To WebKit Eval Blockage

- Orion WebKit `Runtime.evaluate` remains blocked
- Milestone 8.6 does not depend on arbitrary WebKit eval
- manual Safari Web Inspector observation of console, dataset, and DOM witness is the primary route

## Manual Trial Route

- `route_id`: `desk-reset-v0`
- `session_id`: `orion-witness-trial-001`
- `active_goal`: `reset the desk enough to choose the next work item`
- `active_chunk_id`: `clear_trash`
- `active_chunk_label`: `clear trash`

## Manual Trial Ladder

Recommended order:

- run Trial 1R first
- stop and record the result before expanding

### Trial 1R — repaired continue boundary rerun

1. Use strengthened packet wording.
2. Insert packet.
3. Confirm witness says `insert_only_smoke_result` with `ok:true` and `submitAttempted:false`.
4. Billy manually sends the packet.
5. Assistant should begin the route trial, not evaluate transport.
6. Billy replies: `continue`.
7. Assistant should preserve `active_chunk_id: clear_trash`.

### Trial 2 — done boundary

- Billy replies: `done`
- assistant may acknowledge `clear_trash` complete
- assistant must not advance unless Billy says `move_on` or `next`

### Trial 3 — move_on boundary

- Billy replies: `move_on`
- assistant may advance exactly one chunk to `collect_dishes`

### Trial 4 — side_question boundary

- Billy asks a small side question
- assistant should answer briefly and return to `active_chunk_id`

## Manual Test Script

1. Open ChatGPT in Orion iPhone with `v0.1.3`.
2. Insert or paste the Milestone 8.6 witness-trial packet.
3. Confirm witness result says `ok:true` and `submitAttempted:false`.
4. Manually press send.
5. Confirm assistant starts route trial instead of evaluating transport.
6. Reply `continue`.
7. Report whether it preserved `active_chunk_id: clear_trash`.
8. Stop after Trial 1R.

## Witness Evidence To Capture

- packet source used
- witness kind before send
- witness insert result
- `submitAttempted`
- `packetLength`
- console lines with `[ORION_TTD]`
- dataset witness fields if visible
- `#orion-ttd-witness` contents if needed
- assistant initial response summary
- Billy reply used
- assistant response after Billy reply

## Pass/Fail Categories

- `PASS`
- `PASS_WITH_REPAIR`
- `FAIL_NO_ROUTE_ENGAGEMENT`
- `FAIL_ADVANCED_WITHOUT_PERMISSION`
- `FAIL_INVENTED_STATE`
- `FAIL_LOST_ROUTE`

## Known Risks

- ChatGPT may still evaluate transport wording if the packet is too weak
- witness evidence proves transport/setup, not lawful route behavior by itself
- manual send means human timing and phrasing still matter
- side-question restoration may still be weak without a later response contract refinement

## Next Milestone After Pass/Fail

If pass:

- continue deeper manual workflow trials using the witness-observed route
- then decide whether to refine packet wording or move toward stronger manual precedent collection

If fail:

- refine the packet wording
- compare the failure against reducer/scorer expectations
- update the fail/recover and legal framing inputs before any automation expansion
