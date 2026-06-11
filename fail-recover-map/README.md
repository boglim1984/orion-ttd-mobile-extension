# Orion TTD Harness: Fail/Recover Map v1

This is the v1 fail/recover map for the Orion TTD harness.

- The `orion_ttd_failure_latent_map.xlsx` file is retained for human spreadsheet editing.
- The `v1/csv/`, `v1/json/`, and `v1/jsonl/` directories contain the same data converted into preferred agent-ingest formats.
- The map is a design, testing, and metrics artifact; it is not runtime code.
- The map should be updated after workflow tests and real failures.
- The map feeds:
  - command protocol design;
  - workflow fixtures;
  - invariant scorer;
  - repair packet library;
  - skill logic library;
  - metrics and coverage reporting.

## Conversion Notes
The original XLSX has been successfully extracted into distinct CSV and JSON/JSONL chunks for each sheet (Dashboard, Failure_Map, Skill_Blocks, Workflow_Tests, Scoring_Rubric, Sources) with stable, human-readable column names preserved. All rows and columns are retained. No data was dropped during conversion.
