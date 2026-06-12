# Orion TTD Legal Framework

This folder holds the legal synthesis layer for the Orion TTD state harness.

- Fail/Recover Map v1 is case law / failure precedent.
- Pre-Collapse Steering Language Matrix v1 is language law / skill-argument map.
- LLM Legal Deference Map v1 is deference law / interpretive authority map.
- Constitution v1 is the shared legal framework tying authority, evidence, claims, legal moves, default rulings, and amendment process together.

## Authority Boundaries

- The Constitution does not override reducer code or tests.
- The reducer remains committed-state authority.
- The scorer remains outcome judge.
- The extension remains actuator/witness, not court.
- The Judge is a narrow ambiguity-reduction role that remains subordinate to reducer commits.
- LLM Legal Deference Map v1 defines when LLM interpretation deserves legal weight before reducer commit, but it does not make LLM output committed state.

## Read This Before

Agents should read this folder before modifying:

- reducer law or reducer guards
- scorer categories or fixture-runner verdict logic
- Judge packets or legal reduction language
- command-protocol legal moves
- fail/recover metrics or precedent handling
- pre-collapse steering rules or skill-language packets

Read alongside:

- `legal-framework/v1/ORION_TTD_STATE_HARNESS_CONSTITUTION_V1.md`
- `legal-framework/v1/ORION_TTD_FAIL_GRACEFULLY_HUMAN_WITNESS_ESCALATION_V1.md`
- `fail-recover-map/README.md`
- `precollapse-steering-language/README.md`
- `llm-legal-deference/README.md`

## Relationship To Existing Artifacts

- Fail/Recover Map v1 stores precedent, recovery patterns, guard seeds, and test seeds.
- Pre-Collapse Steering Language Matrix v1 stores the language layer that biases the model before collapse.
- LLM Legal Deference Map v1 defines when semantic interpretation deserves legal weight before reducer commit.
- Fail Gracefully / Human Witness Escalation is the live-witness escalation rule: when the system cannot safely reduce ambiguity through reducer rules, Script Judge, or role-play Judge, it preserves state and asks Billy one direct question.
- The Constitution defines how those artifacts relate to authority, evidence, claims, default HOLD behavior, smallest legal reduction, Judge scope, and amendment flow.
