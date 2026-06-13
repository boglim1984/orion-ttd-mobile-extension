const fs = require("node:fs");
const path = require("node:path");

const CASEWORK_TOOL_VERSION = "command-language-casework-runner-v1";

const REQUIRED_SUITE_FIELDS = [
  "suite_id",
  "suite_title",
  "suite_goal",
  "route_id",
  "run_config",
  "cases"
];

const REQUIRED_CASE_FIELDS = [
  "case_id",
  "title",
  "research_question",
  "packet",
  "scripted_user_replies",
  "expected_behavior",
  "forbidden_behavior",
  "expected_reducer_semantics",
  "classification_targets"
];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseSuiteText(suiteText) {
  if (typeof suiteText !== "string" || !suiteText.trim()) {
    return {
      ok: false,
      errors: ["Suite JSON is empty."]
    };
  }

  try {
    return {
      ok: true,
      suite: JSON.parse(suiteText)
    };
  } catch (error) {
    return {
      ok: false,
      errors: [`Suite JSON could not be parsed: ${error.message}`]
    };
  }
}

function validateCaseworkSuite(suite) {
  const errors = [];

  if (!isPlainObject(suite)) {
    return {
      ok: false,
      errors: ["Suite must be a JSON object."]
    };
  }

  for (const field of REQUIRED_SUITE_FIELDS) {
    if (!Object.hasOwn(suite, field)) {
      errors.push(`Missing required suite field: ${field}`);
    }
  }

  if (typeof suite.suite_id !== "string" || !suite.suite_id.trim()) {
    errors.push("suite_id must be a non-empty string.");
  }

  const warnings = [];
  if (!suite.created_for_tool) {
    warnings.push(`created_for_tool was missing. Normalized to ${CASEWORK_TOOL_VERSION}.`);
    suite.created_for_tool = CASEWORK_TOOL_VERSION;
  } else if (suite.created_for_tool === "command-language-casework") {
    warnings.push(`created_for_tool was legacy "command-language-casework". Normalized to ${CASEWORK_TOOL_VERSION}.`);
    suite.created_for_tool = CASEWORK_TOOL_VERSION;
  } else if (suite.created_for_tool !== CASEWORK_TOOL_VERSION) {
    warnings.push(`created_for_tool does not match ${CASEWORK_TOOL_VERSION}. Received: ${suite.created_for_tool}. Treated as metadata.`);
  }

  if (!isPlainObject(suite.run_config)) {
    errors.push("run_config must be an object.");
  } else {
    if (suite.run_config.send_mode !== "explicit_casework_run_button") {
      errors.push("run_config.send_mode must be explicit_casework_run_button.");
    }

    for (const numericField of ["turn_timeout_ms", "stability_wait_ms"]) {
      if (!Number.isFinite(suite.run_config[numericField])) {
        errors.push(`run_config.${numericField} must be a finite number.`);
      }
    }
  }

  if (!Array.isArray(suite.cases) || suite.cases.length === 0) {
    errors.push("cases must be a non-empty array.");
  } else {
    suite.cases.forEach((caseItem, index) => {
      const prefix = `cases[${index}]`;
      if (!isPlainObject(caseItem)) {
        errors.push(`${prefix} must be an object.`);
        return;
      }

      for (const field of REQUIRED_CASE_FIELDS) {
        if (!Object.hasOwn(caseItem, field)) {
          errors.push(`${prefix} missing required field: ${field}`);
        }
      }

      if (typeof caseItem.case_id !== "string" || !caseItem.case_id.trim()) {
        errors.push(`${prefix}.case_id must be a non-empty string.`);
      }

      if (typeof caseItem.packet !== "string" || !caseItem.packet.trim()) {
        errors.push(`${prefix}.packet must be a non-empty string containing the TTD_COMMAND_V1 packet text, not a nested object.`);
      }

      if (typeof caseItem.expected_reducer_semantics !== "string" || !caseItem.expected_reducer_semantics.trim()) {
        errors.push(`${prefix}.expected_reducer_semantics must be a non-empty string.`);
      }

      for (const listField of [
        "scripted_user_replies",
        "expected_behavior",
        "forbidden_behavior",
        "classification_targets"
      ]) {
        if (!Array.isArray(caseItem[listField])) {
          errors.push(`${prefix}.${listField} must be an array.`);
          continue;
        }
        if (caseItem[listField].some((item) => typeof item !== "string")) {
          errors.push(`${prefix}.${listField} must contain strings only.`);
        }
      }
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

function validateSuiteText(suiteText) {
  const parsed = parseSuiteText(suiteText);
  if (!parsed.ok) {
    return parsed;
  }

  const validation = validateCaseworkSuite(parsed.suite);
  return {
    ok: validation.ok,
    errors: validation.errors || [],
    warnings: validation.warnings || [],
    suite: parsed.suite
  };
}

function loadSuiteFromFile(filePath) {
  const absolutePath = path.resolve(filePath);
  const suiteText = fs.readFileSync(absolutePath, "utf8");
  return {
    absolutePath,
    suiteText,
    ...validateSuiteText(suiteText)
  };
}

module.exports = {
  CASEWORK_TOOL_VERSION,
  REQUIRED_CASE_FIELDS,
  REQUIRED_SUITE_FIELDS,
  loadSuiteFromFile,
  parseSuiteText,
  validateCaseworkSuite,
  validateSuiteText
};
