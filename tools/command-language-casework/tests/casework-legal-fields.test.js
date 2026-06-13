const test = require("node:test");
const assert = require("node:assert");

test("shared legal module preserves negative wrong-next and pass-row mappings", async () => {
  const legal = await import("../lib/casework-legal-fields.mjs");

  const negativeFailureLayer = legal.deriveFailureLayer({
    classification: "FAIL_LOST_ROUTE",
    routeBehaviorCorrectWithoutKeyword: false,
    diagnostics: { sendActivationStatus: "passed" },
    caseResult: {}
  });
  const negativeLegalFields = legal.deriveLegalFields({
    classification: "FAIL_LOST_ROUTE",
    failureLayer: negativeFailureLayer,
    routeBehaviorCorrectWithoutKeyword: false,
    diagnostics: { sendActivationStatus: "passed" }
  });

  assert.strictEqual(negativeFailureLayer, legal.FAILURE_LAYERS.LANGUAGE);
  assert.strictEqual(negativeLegalFields.legalVerdict, legal.LEGAL_VERDICTS.FAIL);
  assert.strictEqual(
    negativeLegalFields.routeSurvivalOutcome,
    legal.ROUTE_SURVIVAL_OUTCOMES.BROKEN
  );

  const passFailureLayer = legal.deriveFailureLayer({
    classification: "PASS_CANDIDATE",
    routeBehaviorCorrectWithoutKeyword: false,
    diagnostics: { sendActivationStatus: "passed" },
    caseResult: {}
  });
  const passLegalFields = legal.deriveLegalFields({
    classification: "PASS_CANDIDATE",
    failureLayer: passFailureLayer,
    routeBehaviorCorrectWithoutKeyword: false,
    diagnostics: { sendActivationStatus: "passed" }
  });

  assert.strictEqual(passFailureLayer, legal.FAILURE_LAYERS.NONE);
  assert.strictEqual(passLegalFields.legalVerdict, legal.LEGAL_VERDICTS.PASS);
  assert.strictEqual(
    passLegalFields.routeSurvivalOutcome,
    legal.ROUTE_SURVIVAL_OUTCOMES.SURVIVED
  );
});

test("shared legal module preserves run-level verdict aggregation order", async () => {
  const legal = await import("../lib/casework-legal-fields.mjs");

  assert.strictEqual(
    legal.deriveRunLegalVerdict([
      { legal_verdict: legal.LEGAL_VERDICTS.PASS },
      { legal_verdict: legal.LEGAL_VERDICTS.FAIL }
    ]),
    legal.LEGAL_VERDICTS.FAIL
  );

  assert.strictEqual(
    legal.deriveRunRouteSurvivalOutcome([
      { route_survival_outcome: legal.ROUTE_SURVIVAL_OUTCOMES.SURVIVED },
      { route_survival_outcome: legal.ROUTE_SURVIVAL_OUTCOMES.BROKEN }
    ]),
    legal.ROUTE_SURVIVAL_OUTCOMES.BROKEN
  );
});
