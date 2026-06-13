# Casework Reflection Loop v1

This document defines the required post-run flow for Orion TTD command-language Casework.

It is infrastructure for what happens after a test run, not a new suite design lane.

## Required order

1. Preserve the raw result JSON as evidence.
2. Import/save the result into `study/raw/` and create or update the paired review in `study/reviews/`.
3. Generate or complete a Mermaid-first review before advancing the study.
4. Identify:
   - the most important pass
   - the most important failure
   - tool vs scorer vs language vs transport layer
   - whether the result is usable evidence
   - whether the run should update next-study status
5. Append normalized rows to the cumulative case-law matrix.
6. Apply the Orion TTD legal-system frame where relevant.
7. Update `CASEWORK_STUDY_STATUS.md` and `CASEWORK_STUDY_STATUS.json`.
8. Only then design the next suite.

## Three-surface workflow

- Design chat:
  creates/reviews suite JSON, performs Mermaid-first review, proposes next study, and decides whether overlapping artifacts should stay separate or collapse.
- Casework GUI:
  validates suite JSON, copies the self-contained runner, exposes import/review affordances, and can trigger matrix refresh.
- Disposable ChatGPT test tab:
  runs the visible self-contained runner in a dedicated test chat.

Current launcher reality:

- `launch-casework.command` opens the GUI and a disposable ChatGPT tab.
- The design chat is this current review/design chat or another chat Billy opens separately.
- The launcher does not claim reliable ChatGPT project-chat focus control.

## Artifact roles

- `CASEWORK_STUDY_STATUS.*` = agenda
- raw result JSON = evidence
- reflection review Markdown = interpretation
- case-law matrix = cumulative analysis
- legal system = authority/evidence language
- coding rulebook = agent behavior

Open simplification question:

- During integration, decide whether each part should stay separate, collapse into another artifact, or be redesigned because it overlaps or adds too much maintenance.
- Do not create a second dashboard/source of truth to avoid that question.

## Import and review path

Import command:

```bash
node tools/command-language-casework/scripts/import-casework-result.mjs <path-to-result.json>
```

Matrix/tabulation commands:

```bash
node tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs
node tools/command-language-casework/scripts/tabulate-casework-study.mjs
```

Recommended sync order after meaningful review:

```bash
node tools/command-language-casework/scripts/import-casework-result.mjs <path-to-result.json>
node tools/command-language-casework/scripts/update-casework-case-law-matrix.mjs
node tools/command-language-casework/scripts/tabulate-casework-study.mjs
```

## Mermaid-first review requirement

Every imported run should have a review Markdown file. The review should start with a Mermaid-first summary of the route outcome before freeform interpretation expands.

Minimum review questions:

- What is the most important pass?
- What is the most important failure?
- Was the result usable evidence?
- What layer actually failed?
- Does the run change the manual next-study pointer?
- What legal verdict best describes route survival?

## Deterministic layer classification

Use deterministic extraction first. Do not overbuild semantic AI classification in this job.

- Tool failure:
  send/runner/setup failed.
- Scorer failure:
  visible text shows lawful route behavior but classification says the route was lost.
- Language failure:
  assistant genuinely lost the route, advanced without permission, or otherwise broke legal route survival.
- Transport failure:
  packet insertion/submission mechanics failed even if the suite definition was fine.

If evidence is mixed, mark the ambiguity and HOLD.

## Legal-system mapping

Use the legal frame as interpretation language:

- committed state is law
- logs/evidence are admissible evidence
- assistant prose is a claim
- signals are not state
- if ambiguous, HOLD
- choose the smallest legal reduction
- PASS/FAIL describes route survival, not exact wording perfection

Recommended legal fields:

- `legal_verdict`: `PASS`, `PASS_WITH_REPAIR`, `HOLD`, `REPAIR`, `REANCHOR`, `REJECT`, `FAIL`
- `legal_evidence_type`: `committed_state`, `audit_log`, `visible_dom_text`, `assistant_prose_claim`, `runner_signal`, `scorer_output`
- `claim_vs_state_conflict`: `true`, `false`, `unknown`
- `smallest_legal_reduction`: `preserve_state`, `complete_current_chunk`, `advance_one_chunk`, `ask_billy`, `repair_packet`, `no_mutation`
- `route_survival_outcome`: `survived`, `survived_with_repair`, `broken`, `unknown`

These fields are interpretation aids for review and matrix work. They are not runtime reducer authority.

## Status update rule

Before a new suite is designed:

- check the current manual next-study pointer
- keep the pointer human/LLM-owned
- do not let tabulation overwrite that pointer by default
- update status only after raw evidence, review, matrix, and legal interpretation are in place

If the reflection-loop work itself still needs validation, the next pointer should stay on a reflection-loop target rather than jumping back to new scorer/language design.

## Allowed next-step gate

The next suite is allowed only when all of the following are true:

- raw result JSON is preserved
- the review exists and has Mermaid-first interpretation
- the case-law matrix has been regenerated
- legal-system interpretation has been applied where relevant
- `CASEWORK_STUDY_STATUS` has been checked and updated if needed

If one of those is missing, the next study is reflection work, not new suite design.
