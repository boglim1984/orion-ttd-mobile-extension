import {
  CASEWORK_SKILL_PROMPT,
  CASEWORK_SKILL_USAGE,
  buildSkillBookmarklet
} from "./casework-skill-setup.js";

const suiteInput = document.querySelector("#suite-input");
const loaderOutput = document.querySelector("#loader-output");
const statusLogPanel = document.querySelector("#status-log-panel");
const currentCasePanel = document.querySelector("#current-case-panel");
const resultLinksPanel = document.querySelector("#result-links-panel");
const validationSummary = document.querySelector("#validation-summary");
const overlayStatus = document.querySelector("#overlay-status");
const skillSetupStatus = document.querySelector("#skill-setup-status");

const serverStateLabel = document.querySelector("#server-state");
const suiteStateLabel = document.querySelector("#suite-state");
const caseCountStateLabel = document.querySelector("#case-count-state");
const runnerStateLabel = document.querySelector("#runner-state");
const resultStateLabel = document.querySelector("#result-state");

const openTestChatButton = document.querySelector("#open-test-chat-button");
const copyConsoleStepsButton = document.querySelector("#copy-console-steps-button");
const loadExampleButton = document.querySelector("#load-example-button");
const validateButton = document.querySelector("#validate-button");
const copySelfContainedButton = document.querySelector("#copy-self-contained-button");
const runButton = document.querySelector("#run-button");
const stopButton = document.querySelector("#stop-button");
const saveDraftButton = document.querySelector("#save-draft-button");
const copyStatusLogButton = document.querySelector("#copy-status-log-button");
const openResultsButton = document.querySelector("#open-results-button");
const copySummaryButton = document.querySelector("#copy-summary-button");
const copyLoaderButton = document.querySelector("#copy-loader-button");
const copyResultInstructionsButton = document.querySelector("#copy-result-instructions-button");
const copySkillBookmarkletButton = document.querySelector("#copy-skill-bookmarklet-button");
const copySkillPromptButton = document.querySelector("#copy-skill-prompt-button");
const skillHowToUseButton = document.querySelector("#skill-how-to-use-button");

const uiState = {
  suiteDirty: false,
  suiteValid: false,
  suiteId: null,
  caseCount: null,
  runnerCopied: false,
  copiedRunId: null,
  serverState: null
};

function appendStatusLine(message) {
  statusLogPanel.textContent = `${statusLogPanel.textContent}\n${message}`.trim();
}

function setValidationSummary(message, variant = "muted") {
  validationSummary.textContent = message;
  validationSummary.className = `inline-status ${variant}`;
}

function setOverlayStatus(message) {
  overlayStatus.textContent = message;
}

function setSkillSetupStatus(message) {
  skillSetupStatus.textContent = message;
}

function markSuiteDirty() {
  uiState.suiteDirty = true;
  uiState.suiteValid = false;
  uiState.runnerCopied = false;
  uiState.copiedRunId = null;
  setValidationSummary("Suite edited. Validate again before copying a runner for this version.", "muted");
  setOverlayStatus("Waiting for suite validation.");
  renderStateStrip();
}

function renderStateStrip() {
  const origin = window.location.origin;
  serverStateLabel.textContent = uiState.serverState ? `Running on ${origin}` : `Checking ${origin}`;
  suiteStateLabel.textContent = uiState.suiteId || "None";
  caseCountStateLabel.textContent = uiState.caseCount ?? "Unknown";
  runnerStateLabel.textContent = uiState.runnerCopied ? "Copied" : "Not copied";

  if (uiState.serverState?.last_result?.result_json_path) {
    resultStateLabel.textContent = "Latest server result available";
  } else {
    resultStateLabel.textContent = "No server result";
  }
}

async function readJson(response) {
  const payload = await response.json();
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.errors?.join("\n") || payload.error || `Request failed: ${response.status}`);
  }
  return payload;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return readJson(response);
}

async function fetchJson(url) {
  const response = await fetch(url);
  return readJson(response);
}

function renderCurrentCase(state) {
  if (state.active_run) {
    currentCasePanel.textContent = JSON.stringify(
      {
        run_id: state.active_run.run_id,
        suite_id: state.active_run.suite.suite_id,
        current_case_id: state.active_run.current_case_id || null,
        runner_id: state.active_run.runner_id || null,
        stop_requested: Boolean(state.stop_requested)
      },
      null,
      2
    );
    return;
  }

  if (state.pending_run) {
    currentCasePanel.textContent = JSON.stringify(
      {
        pending_run_id: state.pending_run.run_id,
        suite_id: state.pending_run.suite.suite_id,
        waiting_for_runner: true
      },
      null,
      2
    );
    return;
  }

  currentCasePanel.textContent = "No active case.";
}

function renderResults(state) {
  if (state.last_result) {
    const links = [];
    if (state.last_result.summary_path) {
      links.push(`<p><strong>Summary:</strong> <code>${state.last_result.summary_path}</code></p>`);
    }
    if (state.last_result.result_json_path) {
      links.push(`<p><strong>JSON:</strong> <code>${state.last_result.result_json_path}</code></p>`);
    }
    if (state.last_result.output_dir) {
      links.push(`<p><strong>Folder:</strong> <code>${state.last_result.output_dir}</code></p>`);
    }
    resultLinksPanel.innerHTML = links.join("");
    openResultsButton.disabled = false;
    copySummaryButton.disabled = false;
  } else {
    resultLinksPanel.textContent =
      "Self-contained runs download JSON from the ChatGPT tab. Server result buttons stay disabled until a legacy/server run writes local artifacts.";
    openResultsButton.disabled = true;
    copySummaryButton.disabled = true;
  }
}

function renderStatus(state) {
  uiState.serverState = state;
  statusLogPanel.textContent = (state.status_log || []).join("\n") || "No status yet.";
  renderCurrentCase(state);
  renderResults(state);
  renderStateStrip();
}

async function refreshState() {
  try {
    const state = await fetchJson("/api/state");
    renderStatus(state);
  } catch (error) {
    statusLogPanel.textContent = `State refresh failed:\n${error.message}`;
  }
}

async function refreshLoader() {
  const response = await fetch("/api/runner/loader-snippet");
  loaderOutput.value = await response.text();
}

async function loadExampleSuite() {
  const response = await fetchJson("/api/example-suite?name=desk-reset-baseline-suite.json");
  suiteInput.value = response.suite_text;
  uiState.suiteDirty = true;
  uiState.suiteValid = false;
  uiState.runnerCopied = false;
  uiState.suiteId = null;
  uiState.caseCount = null;
  setValidationSummary(`Loaded example: ${response.name}. Validate before copying a runner.`, "muted");
  setOverlayStatus("Example loaded. Validate the suite next.");
  renderStateStrip();
}

async function copySelfContainedRunner() {
  const payload = await postJson("/api/runner/self-contained-payload", {
    suite_text: suiteInput.value
  });
  await navigator.clipboard.writeText(payload.payload);
  uiState.runnerCopied = true;
  uiState.copiedRunId = payload.run_id;
  setOverlayStatus("Runner copied. Paste it into the ChatGPT console, then click Run in the overlay.");
  appendStatusLine(`Copied self-contained runner for ${payload.run_id}`);
  renderStateStrip();
}

async function copyToClipboard(text, successMessage) {
  await navigator.clipboard.writeText(text);
  appendStatusLine(successMessage);
}

async function withAction(action) {
  try {
    await action();
    await refreshState();
  } catch (error) {
    appendStatusLine(error.message);
  }
}

openTestChatButton.addEventListener("click", () => {
  window.open("https://chatgpt.com/", "_blank", "noopener");
  appendStatusLine("Opened ChatGPT in a new tab.");
});

copyConsoleStepsButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(
      [
        "Command Language Casework setup",
        "1. Open a disposable ChatGPT test chat.",
        "2. Open DevTools with Option + Command + I.",
        "3. Validate the suite and copy the self-contained runner.",
        "4. Paste the runner into the ChatGPT console.",
        "5. Click Run in the black overlay on the ChatGPT page."
      ].join("\n"),
      "Copied setup note."
    );
  })
);

copySkillBookmarkletButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(buildSkillBookmarklet(), "Copied skill injection bookmarklet.");
    setSkillSetupStatus("Bookmarklet copied. Save it in the browser bookmarks bar, then click it from the current ChatGPT dev chat.");
  })
);

copySkillPromptButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(CASEWORK_SKILL_PROMPT, "Copied skill prompt.");
    setSkillSetupStatus("Skill prompt copied. Paste it directly if you do not want to save the bookmarklet first.");
  })
);

skillHowToUseButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(CASEWORK_SKILL_USAGE, "Copied skill setup note.");
    setSkillSetupStatus(CASEWORK_SKILL_USAGE);
  })
);

loadExampleButton.addEventListener("click", () =>
  withAction(async () => {
    await loadExampleSuite();
  })
);

suiteInput.addEventListener("input", () => {
  markSuiteDirty();
});

validateButton.addEventListener("click", () =>
  withAction(async () => {
    const response = await postJson("/api/validate", {
      suite_text: suiteInput.value
    });
    uiState.suiteDirty = false;
    uiState.suiteValid = true;
    uiState.suiteId = response.suite.suite_id;
    uiState.caseCount = Array.isArray(response.suite.cases) ? response.suite.cases.length : 0;
    setValidationSummary(`Valid suite: ${uiState.suiteId} (${uiState.caseCount} cases).`, "success");
    setOverlayStatus("Suite valid. Copy the self-contained runner next.");
    renderStateStrip();
  })
);

copySelfContainedButton.addEventListener("click", () =>
  withAction(async () => {
    await copySelfContainedRunner();
  })
);

saveDraftButton.addEventListener("click", () =>
  withAction(async () => {
    const response = await postJson("/api/save-draft", {
      suite_text: suiteInput.value
    });
    appendStatusLine(`Saved draft suite: ${response.draft_path}`);
  })
);

copyResultInstructionsButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(
      [
        "Casework result handling",
        "1. After the self-contained run finishes, use the JSON downloaded by the ChatGPT tab.",
        "2. Drag that JSON result back into ChatGPT for analysis.",
        "3. Server result buttons in the GUI apply only to the legacy server-run path."
      ].join("\n"),
      "Copied result instructions."
    );
  })
);

runButton.addEventListener("click", () =>
  withAction(async () => {
    await postJson("/api/run", {
      suite_text: suiteInput.value
    });
  })
);

stopButton.addEventListener("click", () =>
  withAction(async () => {
    await postJson("/api/stop", {});
  })
);

copyStatusLogButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(statusLogPanel.textContent, "Copied status log.");
  })
);

openResultsButton.addEventListener("click", () =>
  withAction(async () => {
    await postJson("/api/open-latest-result", {});
  })
);

copySummaryButton.addEventListener("click", () =>
  withAction(async () => {
    const response = await fetch("/api/latest-summary");
    const text = await response.text();
    await copyToClipboard(text, "Copied latest server-side result summary.");
  })
);

copyLoaderButton.addEventListener("click", () =>
  withAction(async () => {
    await copyToClipboard(loaderOutput.value, "Copied legacy loader snippet.");
  })
);

setInterval(refreshState, 2000);

await refreshLoader();
renderStateStrip();
setValidationSummary("Load or paste a suite, then validate it.", "muted");
setOverlayStatus("Open a disposable ChatGPT chat to begin.");
setSkillSetupStatus("Dev chat designs the suite. Casework GUI validates JSON. Disposable ChatGPT runs the test. Result JSON comes back here for Mermaid review.");
await refreshState();
