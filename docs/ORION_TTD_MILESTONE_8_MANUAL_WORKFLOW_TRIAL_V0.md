# Orion TTD Milestone 8 Manual Workflow Trial V0

Status: prepared design artifact  
Scope: manual real-ChatGPT workflow trial through inserted command packets only

## Purpose

Prepare the first real ChatGPT workflow trial that uses an inserted `TTD_COMMAND_V1` packet to steer a small TTD route boundary without adding automation, auto-submit, observers, or page-side state authority.

## Milestone Premise

Milestone 7 proved insert-only packet transport through the Orion / ChatGPT UI air gap.

Milestone 8 asks a narrower behavioral question:

Can a manually sent inserted command packet actually steer a real ChatGPT turn through a simple TTD route boundary while preserving lawful route behavior?

## Scope

- manual packet insertion
- manual human send by Billy
- small real-ChatGPT workflow trial
- comparison against reducer/scorer expectations after the fact
- route-boundary checks for `continue`, `done`, `move_on`, and `side_question`

## Non-goals

- no auto-submit
- no hidden submit
- no response observer
- no repair insertion automation
- no Voice Mode
- no task DOM watcher
- no background loop
- no extension state authority
- no runtime reducer inside the page

## Safety Boundary

- extension remains visible packet transport only
- reducer/scorer remain legal and test authority outside the page runtime
- no secrets, cookies, tokens, localStorage, sessionStorage, IndexedDB, credentials, or account internals
- assistant prose must not become committed route state by itself

## Relationship To Milestone 7

- Milestone 7 validated transport into the real Orion iPhone ChatGPT composer
- Milestone 8 uses that same insert-only boundary but adds a manual sent turn through the real ChatGPT UI
- no new runtime automation should be added in this milestone

## Relationship To Command Protocol

Milestone 8 uses a small `TTD_COMMAND_V1` packet with:

- route identity
- active chunk identity
- legal next-turn intents
- explicit commit and response-contract wording
- route-preservation steering language

The packet is still a visible proposal surface, not committed state authority.

## Relationship To Reducer/Scorer

- reducer/scorer define the lawful expected outcome
- manual ChatGPT behavior is compared against the fixture semantics after the run
- Milestone 8 is a manual behavioral trial, not in-page reducer execution

## Real-Phone Test Setup

- device: Billy's iPhone running Orion
- page: real ChatGPT page in Orion
- trigger source: Milestone 7 insert-only smoke or manual paste
- inspector: Safari Web Inspector on Mac when available
- extension version baseline: `0.1.2` or later Milestone 8-prepared build if no runtime changes occur

## Trial Route

- `route_id`: `desk-reset-v0`
- `session_id`: `orion-manual-trial-001`
- `active_goal`: `reset the desk enough to choose the next work item`
- `active_chunk_id`: `clear_trash`
- `active_chunk_label`: `clear trash`
- `allowed_intents`: `done | stuck | continue | move_on | pause | re_chunk`

This route is intentionally tiny and comes from the canonical `desk-reset-v0` workflow fixture.

## Trial Packet

Use:

- `test-fixtures/manual/orion-milestone-8-manual-trial-packet.txt`

The packet should be sent manually by Billy after visible insertion or paste, not auto-submitted by the extension.

## Manual Test Script For Billy

Recommended late-night order:

- run Trial 1 only if Billy is tired
- add Trials 2–4 later after the first result is recorded

### Trial 1 — continue boundary

1. Insert the Milestone 8 packet.
2. Billy manually sends the packet.
3. Assistant should ask one short check-in about `clear_trash`.
4. Billy replies: `continue`.
5. Assistant should preserve `active_chunk_id` and not advance.

### Trial 2 — done boundary

1. Insert the packet again or restate the active route manually if needed.
2. Billy manually sends the packet.
3. Billy replies: `done`.
4. Assistant may acknowledge the current chunk complete.
5. Assistant must not auto-advance to the next chunk unless Billy says `move_on` or `next`.

### Trial 3 — move_on boundary

1. Insert the packet again or use a manual follow-up packet if needed.
2. Billy replies: `move_on`.
3. Assistant may move from `clear_trash` to `collect_dishes`.
4. This is the first legal advancement test.

### Trial 4 — side_question boundary

1. Insert the packet again or use the active route context.
2. Billy asks a small side question.
3. Assistant should answer briefly, then return to `active_chunk_id`.
4. Assistant must not treat the side question as a route switch.

## Allowed Billy Replies

- `continue`
- `done`
- `move_on`
- `pause`
- `re_chunk`
- a small side question for the side-question trial

## Expected Assistant Behavior

- ask one short check-in at the current chunk
- preserve `active_chunk_id` on `continue`
- allow chunk-complete acknowledgment on `done` without advancement
- advance only on explicit `move_on` or `next`
- answer side questions briefly and restore the route
- avoid hidden progress claims

## Reducer/Scorer Comparison Method

Compare the manual trial against the existing fixture semantics:

- `continue` should map to `keep_active_chunk`
- `done` should map to `complete_chunk_no_advance`
- `move_on` should map to `advance_exactly_one_chunk`
- `side_question` should behave like a brief answer plus route restoration

Use the manual result template and classify the observed behavior against likely reducer/scorer expectations such as:

- `PASS`
- `PASS_WITH_REPAIR`
- `FAIL_ADVANCED_WITHOUT_PERMISSION`
- `FAIL_INVENTED_STATE`
- `FAIL_LOST_ROUTE`

## Pass/Fail Criteria

### Pass

- assistant asks one short check-in at the route boundary
- `continue` does not advance
- `done` does not auto-advance
- `move_on` advances exactly one chunk
- side question returns to route
- no hidden progress is invented

### Fail

- assistant advances without `move_on`
- assistant claims progress not grounded in Billy's reply
- assistant drops the route after a side question
- assistant ignores the route packet completely
- assistant asks too many questions relative to the route-preservation goal

## Evidence To Record

- inserted packet source
- whether Billy manually sent it
- assistant reply text summary
- Billy reply used
- whether `active_chunk_id` appeared stable
- whether advancement happened only on `move_on`
- screenshots or copied excerpts if useful
- expected reducer/scorer category
- observed result category

## Known Risks

- ChatGPT may ignore or partially follow packet structure
- manual send means human timing and phrasing may vary
- side-question restoration may be weak without a later response contract
- real UI behavior may differ across iPhone Orion sessions

## Next Milestone After Pass/Fail

If pass:

- Milestone 8B or 9 can expand manual trials or design a tighter response contract without adding submit automation

If fail:

- update prompt/packet wording, legal framing, or manual trial packet language
- compare failure against reducer/scorer expectations
- use the failure as new fail/recover and deference-law input before any automation expansion
