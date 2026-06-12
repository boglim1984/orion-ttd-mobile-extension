# Milestone 8 Trial 1 Continue Boundary Result

- date/time: 2026-06-12 01:31 PM EDT
- device/browser: Orion iPhone + real ChatGPT page
- extension version: 0.1.2
- route_id: desk-reset-v0
- session_id: orion-manual-trial-001
- starting active_chunk_id: clear_trash
- inserted packet source: Milestone 8 manual packet / Orion inserted command-packet route
- sent manually yes/no: yes, per Billy's report
- Billy reply: continue
- assistant behavior summary: initial assistant response evaluated Milestone 7 transport success instead of beginning the route trial; after a route re-anchor clarification prompt, the assistant asked one short check-in about clear trash and then preserved the route correctly on `continue`
- did assistant ask one short question: no initially, yes after recovery
- did active_chunk_id remain stable: yes after recovery
- did assistant invent progress: no
- did assistant advance without move_on: no
- did side question return to route: not tested
- reducer/scorer expected category: continue -> keep_active_chunk
- observed result category: PASS_WITH_REPAIR
- pass/fail: PASS_WITH_REPAIR
- notes: initial `FAIL_NO_ROUTE_ENGAGEMENT` repaired by route re-anchor; recovered assistant response was `Still on clear trash — do you want to continue?`; after Billy replied `continue`, the assistant said `Okay — stay on clear trash. Keep going; reply done when it’s actually clear, or stuck if blocked.`
- screenshot/log references if any: none recorded in repo

## Initial Failure

Initial assistant response:

> "What this confirms from my side:
>
> The deterministic TTD_COMMAND_V1 packet reached the ChatGPT conversation.
> The packet structure is readable and intact.
> The safety posture is correctly declared as:
> insert_only
> no_submit
> user_review_required
> The command is framed as proposal-only, not runtime mutation.
>
> Important boundary: I can confirm the packet arrived here, but I cannot independently prove whether Orion submitted it or whether you reviewed and manually sent it. If the extension only inserted it into the composer and you manually submitted, then Milestone 7 insert-only smoke passes.
>
> Suggested result label:
>
> M7 PASS — Orion extension can insert deterministic TTD packet into ChatGPT composer under user-review boundary."

Classification:

- `FAIL_NO_ROUTE_ENGAGEMENT`

Reason:

- the assistant treated the packet as Milestone 7 transport validation instead of beginning the Milestone 8 desk-reset route trial
- it did not ask one short check-in about `clear_trash`

## Recovery Used

Recovery prompt:

> "Continue Milestone 8 Trial 1.
>
> Do not evaluate Milestone 7 transport.
>
> Treat the packet as already manually sent and accepted for this trial.
>
> Current route:
> route_id: desk-reset-v0
> active_chunk_id: clear_trash
> active_chunk_label: clear trash
>
> Your task:
> Ask one short check-in about clear_trash.
> Do not advance.
> Do not claim progress.
> Wait for Billy’s reply.
>
> Billy reply for this trial will be:
> continue"

Recovered assistant response:

> "Still on clear trash — do you want to continue?"

Billy reply:

> continue

Assistant response after `continue`:

> "Okay — stay on clear trash. Keep going; reply done when it’s actually clear, or stuck if blocked."

## Packet Wording Correction For Next Run

The packet must explicitly say the assistant should not evaluate transport and should begin the route trial.

Suggested wording:

> "Do not evaluate this packet as a transport test. Treat transport as already validated. Begin the route trial by asking one short check-in about active_chunk_id."
