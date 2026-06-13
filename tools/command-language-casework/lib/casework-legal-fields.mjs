export const FAILURE_LAYERS = Object.freeze({
  NONE: "none",
  TOOL: "tool",
  TRANSPORT: "transport",
  SCORER: "scorer",
  LANGUAGE: "language"
});

export const LEGAL_VERDICTS = Object.freeze({
  PASS: "PASS",
  PASS_WITH_REPAIR: "PASS_WITH_REPAIR",
  HOLD: "HOLD",
  REPAIR: "REPAIR",
  REANCHOR: "REANCHOR",
  REJECT: "REJECT",
  FAIL: "FAIL"
});

export const ROUTE_SURVIVAL_OUTCOMES = Object.freeze({
  SURVIVED: "survived",
  SURVIVED_WITH_REPAIR: "survived_with_repair",
  BROKEN: "broken",
  UNKNOWN: "unknown"
});

export const LEGAL_EVIDENCE_TYPES = Object.freeze({
  AUDIT_LOG: "audit_log",
  VISIBLE_DOM_TEXT: "visible_dom_text",
  SCORER_OUTPUT: "scorer_output"
});

export const SMALLEST_LEGAL_REDUCTIONS = Object.freeze({
  PRESERVE_STATE: "preserve_state",
  ADVANCE_ONE_CHUNK: "advance_one_chunk",
  REPAIR_PACKET: "repair_packet",
  NO_MUTATION: "no_mutation"
});

export function deriveFailureLayer({
  classification,
  routeBehaviorCorrectWithoutKeyword,
  diagnostics,
  caseResult
}) {
  if (classification.startsWith("TOOL_FAIL_") || caseResult?.tool_failure_label) {
    return FAILURE_LAYERS.TOOL;
  }
  if (diagnostics?.sendActivationStatus && diagnostics.sendActivationStatus !== "passed") {
    return FAILURE_LAYERS.TRANSPORT;
  }
  if (/FAIL/.test(classification) && routeBehaviorCorrectWithoutKeyword) {
    return FAILURE_LAYERS.SCORER;
  }
  if (/FAIL_LOST_ROUTE|FAIL_ADVANCED_WITHOUT_PERMISSION|FAIL_INVENTED_STATE/.test(classification)) {
    return FAILURE_LAYERS.LANGUAGE;
  }
  return FAILURE_LAYERS.NONE;
}

export function deriveLegalFields({
  classification,
  failureLayer,
  routeBehaviorCorrectWithoutKeyword,
  diagnostics
}) {
  if (failureLayer === FAILURE_LAYERS.TOOL || failureLayer === FAILURE_LAYERS.TRANSPORT) {
    return {
      legalVerdict: LEGAL_VERDICTS.REPAIR,
      legalEvidenceType: LEGAL_EVIDENCE_TYPES.AUDIT_LOG,
      smallestLegalReduction:
        diagnostics?.sendActivationStatus === "passed"
          ? SMALLEST_LEGAL_REDUCTIONS.PRESERVE_STATE
          : SMALLEST_LEGAL_REDUCTIONS.REPAIR_PACKET,
      routeSurvivalOutcome: ROUTE_SURVIVAL_OUTCOMES.UNKNOWN
    };
  }
  if (failureLayer === FAILURE_LAYERS.SCORER) {
    return {
      legalVerdict: LEGAL_VERDICTS.HOLD,
      legalEvidenceType: LEGAL_EVIDENCE_TYPES.VISIBLE_DOM_TEXT,
      smallestLegalReduction: SMALLEST_LEGAL_REDUCTIONS.PRESERVE_STATE,
      routeSurvivalOutcome: routeBehaviorCorrectWithoutKeyword
        ? ROUTE_SURVIVAL_OUTCOMES.SURVIVED
        : ROUTE_SURVIVAL_OUTCOMES.UNKNOWN
    };
  }
  if (/PASS/.test(classification)) {
    return {
      legalVerdict: LEGAL_VERDICTS.PASS,
      legalEvidenceType: LEGAL_EVIDENCE_TYPES.VISIBLE_DOM_TEXT,
      smallestLegalReduction: SMALLEST_LEGAL_REDUCTIONS.ADVANCE_ONE_CHUNK,
      routeSurvivalOutcome: ROUTE_SURVIVAL_OUTCOMES.SURVIVED
    };
  }
  if (/FAIL_ADVANCED_WITHOUT_PERMISSION/.test(classification)) {
    return {
      legalVerdict: LEGAL_VERDICTS.FAIL,
      legalEvidenceType: LEGAL_EVIDENCE_TYPES.VISIBLE_DOM_TEXT,
      smallestLegalReduction: SMALLEST_LEGAL_REDUCTIONS.PRESERVE_STATE,
      routeSurvivalOutcome: ROUTE_SURVIVAL_OUTCOMES.BROKEN
    };
  }
  if (/FAIL_INVENTED_PROGRESS|FAIL_INVENTED_STATE/.test(classification)) {
    return {
      legalVerdict: LEGAL_VERDICTS.FAIL,
      legalEvidenceType: LEGAL_EVIDENCE_TYPES.VISIBLE_DOM_TEXT,
      smallestLegalReduction: SMALLEST_LEGAL_REDUCTIONS.PRESERVE_STATE,
      routeSurvivalOutcome: ROUTE_SURVIVAL_OUTCOMES.BROKEN
    };
  }
  if (/FAIL_LOST_ROUTE/.test(classification)) {
    return {
      legalVerdict: LEGAL_VERDICTS.FAIL,
      legalEvidenceType: LEGAL_EVIDENCE_TYPES.VISIBLE_DOM_TEXT,
      smallestLegalReduction: SMALLEST_LEGAL_REDUCTIONS.PRESERVE_STATE,
      routeSurvivalOutcome: ROUTE_SURVIVAL_OUTCOMES.BROKEN
    };
  }
  return {
    legalVerdict: LEGAL_VERDICTS.HOLD,
    legalEvidenceType: LEGAL_EVIDENCE_TYPES.SCORER_OUTPUT,
    smallestLegalReduction: SMALLEST_LEGAL_REDUCTIONS.NO_MUTATION,
    routeSurvivalOutcome: ROUTE_SURVIVAL_OUTCOMES.UNKNOWN
  };
}

export function deriveRunLegalVerdict(runRows) {
  const legalVerdicts = runRows.map((row) => row.legal_verdict).filter(Boolean);
  if (legalVerdicts.includes(LEGAL_VERDICTS.FAIL)) {
    return LEGAL_VERDICTS.FAIL;
  }
  if (legalVerdicts.includes(LEGAL_VERDICTS.REPAIR)) {
    return LEGAL_VERDICTS.REPAIR;
  }
  if (legalVerdicts.includes(LEGAL_VERDICTS.HOLD)) {
    return LEGAL_VERDICTS.HOLD;
  }
  if (legalVerdicts.includes(LEGAL_VERDICTS.PASS_WITH_REPAIR)) {
    return LEGAL_VERDICTS.PASS_WITH_REPAIR;
  }
  if (legalVerdicts.includes(LEGAL_VERDICTS.PASS)) {
    return LEGAL_VERDICTS.PASS;
  }
  return legalVerdicts[0] || LEGAL_VERDICTS.HOLD;
}

export function deriveRunRouteSurvivalOutcome(runRows) {
  const outcomes = runRows.map((row) => row.route_survival_outcome).filter(Boolean);
  if (outcomes.includes(ROUTE_SURVIVAL_OUTCOMES.BROKEN)) {
    return ROUTE_SURVIVAL_OUTCOMES.BROKEN;
  }
  if (outcomes.includes(ROUTE_SURVIVAL_OUTCOMES.UNKNOWN)) {
    return ROUTE_SURVIVAL_OUTCOMES.UNKNOWN;
  }
  if (outcomes.includes(ROUTE_SURVIVAL_OUTCOMES.SURVIVED_WITH_REPAIR)) {
    return ROUTE_SURVIVAL_OUTCOMES.SURVIVED_WITH_REPAIR;
  }
  if (outcomes.includes(ROUTE_SURVIVAL_OUTCOMES.SURVIVED)) {
    return ROUTE_SURVIVAL_OUTCOMES.SURVIVED;
  }
  return outcomes[0] || ROUTE_SURVIVAL_OUTCOMES.UNKNOWN;
}
