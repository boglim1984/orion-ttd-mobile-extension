# Fail/Recover Map v1 Summary

## Purpose
The Fail/Recover Map v1 serves as the foundational artifact predicting and cataloguing expected failures across the Orion TTD system's "three-body" dynamic (User ↔ LLM ↔ Harness).

## Metrics role
- Each failure row can become a test case or scenario seed.
- Each failure class can become a coverage category.
- Recovery mechanism fields can become expected repair behavior.
- Skill logic block fields can become candidate TTD skill-library blocks.
- Reducer guard fields can become invariant tests.
- Severity and detectability can support prioritization.
- Test results should update status fields such as:
  - untested
  - simulated
  - observed
  - repaired
  - unresolved
  - deprecated
- The map should support counts like:
  - total failure cases;
  - cases covered by fixtures;
  - cases observed in real runs;
  - cases with a defined recovery mechanism;
  - cases with passing repair tests;
  - cases still unresolved;
  - failures by layer / source / severity / cadence mode / skill block.

The legal synthesis layer that treats this map as case law now lives in `legal-framework/README.md`.
