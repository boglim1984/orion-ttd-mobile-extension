# Route-Law Data Signal — 2026-06-13

Tonight's route-law casework produced usable signal, but the strongest repo-confirmed conclusion is narrower than the chat hypothesis: `active_chunk_id` is a gating floor for lawful movement, not a standalone guarantee of advancement. Across the 2026-06-13 raw runs, packets without an active chunk consistently refused to move, wrong `next_chunk_id` traps were consistently beaten by stronger route carriers, and `collect_dishes` underscore-id outputs are now scorer-confirmed. The remaining uncertainty is not whether route-law data exists, but which minimum carrier fields are sufficient under `TTD_COMMAND_V1`, and whether any PASS/FAIL edges still reflect scorer surface artifacts rather than actual obedience failures.

| Finding | Evidence pattern | Why it matters | Confidence | Follow-up needed |
| --- | --- | --- | --- | --- |
| `active_chunk_id` is the movement gate, but not by itself a full successor authority | In `route_law_sequence_only_no_active_carrier_v1`, all 12 cases replied with some form of `Cannot move_on: no active chunk is established.` or `No active chunk.` when no active chunk was present. In `route_law_protocol_activation_frame_minimum_v1`, `activation_min_015_no_active_chunk_sentinel` also held. By contrast, packets with `active_chunk_id` plus a legal route substrate advanced in `activation_min_001` through `activation_min_014` and `successor_source_002` through `successor_source_011`. | This separates refusal-to-infer behavior from successor-selection behavior. It suggests missing active state is the first hard stop. | High | Cold retest the smallest passing packet with and without `active_chunk_id`, holding all other fields constant. |
| Wrong `next_chunk` traps are useful because stronger legal carriers override them | `route_law_active_floor_007_wrong_next_conflict_late`, `successor_source_007` through `successor_source_011`, `activation_min_016_wrong_next_chunk_authority_trap`, and the label-sequence wrong-next suite all returned `collect_dishes` despite `next_chunk_id: stack_papers`. Negative controls without a legal carrier produced `stack_papers` or refusal instead of false route survival. | This makes wrong-next cases a good discriminator between true route following and shallow packet steering. | High | Keep at least one wrong-next trap in every reduced-carrier suite. |
| `legal_successor_chunk_id` beats wrong `next_chunk_id`, but the repo does not show it outranking every other authority source | `successor_source_008_successor_wrong_next` advanced to `collect_dishes` over `stack_papers`. But `successor_source_010_sequence_successor_conflict` also resolved to `collect_dishes` when `legal_successor_chunk_id` itself pointed to `stack_papers`, suggesting route sequence can override a conflicting successor field. | The next matrix should test authority ordering explicitly instead of assuming a total ranking from one field. | Medium | Add a direct counterbalanced conflict pair: route sequence correct / legal successor wrong, and legal successor correct / route sequence absent. |
| Scorer risk is lower for `collect_dishes` id-only than it was earlier, but label-vs-id sensitivity is still not fully isolated in the current repo slice | `scorer_keyword_v3_fresh_001_collect_dishes_id_only` passed with `New active chunk: collect_dishes.` The study status also records `scorer_collect_dishes_false_lost_route_001` as repaired. However, the latest reviewed runs here do not include a clean same-packet `label_only` versus `id_only` scorer A/B pair. | Some apparent failures may still be surface-evaluation artifacts, especially if output wording changes while route obedience stays constant. | Medium | Run a three-way scorer-only surface suite: `collect_dishes`, `collect dishes`, and `collect_dishes (collect dishes)` on identical legal packets. |
| The useful next study is a compact matrix, not another broad activation-frame sweep | The current study status already points to a minimum-carrier cold retest, and `activation_min_001` through `activation_min_014` show many frame-field ablations already pass. | Broad prompt-frame variation is now lower value than controlled carrier comparisons. | High | Keep the next suite to 8-12 cases and center it on discriminating axes only. |

## Scorer artifact warning

Do not treat every `FAIL_LOST_ROUTE` or `PASS_CANDIDATE` label as final ground truth when the assistant output surface changes but the route behavior may not. The repo confirms that `collect_dishes` id-only now scores correctly, and it confirms historical scorer repair work, but it does not yet contain a clean latest-run A/B/C comparison of `id_only` versus `label_only` versus `id_and_label` on an otherwise identical packet. That means any claim about scorer sensitivity to chunk id versus human label remains provisional until that surface-isolation suite exists.

## Recommended next matrix

Use four axes, but do not exhaustively cross all cells in one run:

- `active_chunk`: `present`, `missing`
- `legal_successor`: `absent`, `present_correct`, `present_wrong`
- `next_chunk`: `absent`, `correct`, `wrong`
- `output_surface`: `id_only`, `label_only`, `id_and_label`

The next run should emphasize contrastive pairs:

- active present vs missing, with the same otherwise-minimal packet
- legal successor correct vs absent, with the same wrong-next trap
- output surface variants on the same legal packet
- one conflict case where route sequence is correct and `legal_successor_chunk_id` is wrong

## Do not overclaim

- Do not claim that `active_chunk_id` alone guarantees advancement. One repo-confirmed run classified active-id-only refusal as acceptable when no successor substrate existed.
- Do not claim that `legal_successor_chunk_id` universally outranks route sequence. A repo-confirmed conflict case suggests otherwise.
- Do not claim that label-only outputs fail the scorer today. The current repo slice does not isolate that comparison.
- Do not treat no-active HOLD cases as language failures when they explicitly refuse to infer movement.

## Next run design

Keep the suite to 10 cases:

1. Minimal legal baseline: `active_chunk_id` + known route substrate, output `id_only`.
2. Same as case 1, output `label_only`.
3. Same as case 1, output `id_and_label`.
4. Same as case 1 plus wrong `next_chunk_id`.
5. Same as case 4 plus correct `legal_successor_chunk_id`.
6. Same as case 4 but with `legal_successor_chunk_id` absent.
7. Same as case 4 but with `active_chunk_id` removed.
8. Route sequence correct, `legal_successor_chunk_id` wrong, wrong `next_chunk_id` also present.
9. `legal_successor_chunk_id` correct, no route sequence, wrong `next_chunk_id` present.
10. Final known-good repeat of case 1 as a cold/late stability check.

## Repo-confirmed sources

- `tools/command-language-casework/study/CASEWORK_STUDY_STATUS.md`
- `tools/command-language-casework/study/CASEWORK_STUDY_STATUS.json`
- `tools/command-language-casework/study/raw/2026-06-13/scorer_keyword_extraction_v3_fresh_validation__20260613-142922-scorer_keyword_extraction_v3_fresh_validation.json`
- `tools/command-language-casework/study/raw/2026-06-13/route_law_active_floor_isolation_v1__20260613-170853-route_law_active_floor_isolation_v1.json`
- `tools/command-language-casework/study/raw/2026-06-13/route_law_sequence_only_no_active_carrier_v1__20260613-185251-route_law_sequence_only_no_active_carrier_v1.json`
- `tools/command-language-casework/study/raw/2026-06-13/route_law_successor_source_isolation_v1__20260613-204037-route_law_successor_source_isolation_v1.json`
- `tools/command-language-casework/study/raw/2026-06-13/route_law_protocol_activation_frame_minimum_v1__20260613-221156-route_law_protocol_activation_frame_minimum_v1.json`
- `tools/command-language-casework/study/raw/2026-06-13/route_law_cold_first_active_label_route_sequence_wrong_next_v1__20260613-181227-route_law_cold_first_active_label_route_sequence_wrong_next_v1.json`
