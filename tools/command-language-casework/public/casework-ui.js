import {
  CASEWORK_SKILL_PROMPT,
  CASEWORK_SKILL_USAGE,
  buildSnapshotBookmarklet
} from "./casework-skill-setup.js";


document.addEventListener("DOMContentLoaded", init);

async function init() {
  const suiteInput = document.querySelector("#suite-input");
  const loaderOutput = document.querySelector("#loader-output");
  const statusLogPanel = document.querySelector("#status-log-panel");
  const currentCasePanel = document.querySelector("#current-case-panel");
  const resultLinksPanel = document.querySelector("#result-links-panel");
  const validationSummary = document.querySelector("#validation-summary");
  const overlayStatus = document.querySelector("#overlay-status");
  const skillSetupStatus = document.querySelector("#skill-setup-status");
  const reflectionStatus = document.querySelector("#reflection-status");

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
  const copyStartNoteButton = document.querySelector("#copy-start-note-button");
  const copySkillSnapshotButton = document.querySelector("#copy-skill-snapshot-button");
  const copyStatusButton = document.getElementById("copy-status-button");
  const skillHowToUseButton = document.querySelector("#skill-how-to-use-button");
  const copyImportCommandButton = document.querySelector("#copy-import-command-button");
  const updateCaseLawMatrixButton = document.querySelector("#update-case-law-matrix-button");
  const openStudyStatusButton = document.querySelector("#open-study-status-button");
  const copyReflectionChecklistButton = document.querySelector("#copy-reflection-checklist-button");

  const missingControls = [
    ["suiteInput", suiteInput],
    ["validateButton", validateButton],
    ["copySelfContainedButton", copySelfContainedButton],
    ["validationSummary", validationSummary]
  ].filter(([, node]) => !node);

  if (missingControls.length) {
    console.error("Casework GUI core controls missing:", missingControls.map(([name]) => name).join(", "));
    if (validationSummary) {
      validationSummary.textContent = "Error: core controls missing: " + missingControls.map(([name]) => name).join(", ");
    }
    return;
  }

  copySelfContainedButton.disabled = true;

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

  function setReflectionStatus(message) {
    reflectionStatus.textContent = message;
  }

  function markSuiteDirty() {
    uiState.suiteDirty = true;
    uiState.suiteValid = false;
    uiState.runnerCopied = false;
    uiState.copiedRunId = null;
    if (copySelfContainedButton) copySelfContainedButton.disabled = true;
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
    setOverlayStatus(
      `Fresh no-localhost runner copied at ${payload.generated_at}. Paste it into the ChatGPT console, then click Run in the overlay.`
    );
    setValidationSummary(
      `Fresh runner copied: ${payload.payload_version} (${payload.run_id}). Re-copy after any suite or tool change.`,
      "valid"
    );
    appendStatusLine(
      `Copied fresh self-contained runner for ${payload.run_id} (${payload.payload_version}, localhost upload ${payload.localhost_upload_default}).`
    );
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
    appendStatusLine("Opened disposable generic ChatGPT in a new tab.");
  });

  copyConsoleStepsButton.addEventListener("click", () =>
    withAction(async () => {
      await copyToClipboard(
        [
          "Command Language Casework setup",
          "1. Open a disposable generic ChatGPT test tab.",
          "2. Open DevTools with Option + Command + I.",
          "3. Validate the suite and copy the self-contained runner.",
          "4. Paste the runner into the ChatGPT console.",
          "5. Click Run in the black overlay on the ChatGPT page."
        ].join("\n"),
        "Copied setup note."
      );
    })
  );

  copyStartNoteButton.addEventListener("click", () =>
    withAction(async () => {
      await copyToClipboard(
        [
          "Casework Start local mirror bundle",
          "1. Run ~/Desktop/Casework Start.command",
          "2. Paste the copied bundle into the TTD TESTS Project chat.",
          "3. Part 1 = Designer Skill",
          "4. Part 2 = Runner Schema Skill",
          "5. Part 3 = Study Status",
          "6. Ask that chat to design the next suite."
        ].join("\n"),
        "Copied local mirror start note."
      );
      setSkillSetupStatus("Start note copied. Use the TTD TESTS Project chat for design/review, not a broad Orion chat or the disposable runner tab.");
    })
  );

  copySkillSnapshotButton.addEventListener("click", () =>
    withAction(async () => {
      await copyToClipboard(buildSnapshotBookmarklet(), "Copied skill snapshot bookmarklet.");
      setSkillSetupStatus("Skill snapshot copied. This is an experimental static fallback and may become stale.");
    })
  );

  if (copyStatusButton) {
    copyStatusButton.addEventListener("click", () =>
      withAction(async () => {
        const response = await fetchJson("/api/study-status");
        await copyToClipboard(response.status_text, "Copied Casework Study Status.");
        setSkillSetupStatus("Status copied. Study status guides the next suite inside the TTD TESTS Project chat.");
      })
    );
  }

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

  validateButton.addEventListener("click", async () => {
    try {
      const val = suiteInput.value.trim();
      if (!val) {
        setValidationSummary("Validation failed: Textarea is empty.", "danger");
        appendStatusLine("Validation failed: Textarea is empty.");
        return;
      }
      setValidationSummary("Validating...", "muted");
      const response = await postJson("/api/validate", {
        suite_text: val
      });
      uiState.suiteDirty = false;
      uiState.suiteValid = true;
      uiState.suiteId = response.suite.suite_id;
      uiState.caseCount = Array.isArray(response.suite.cases) ? response.suite.cases.length : 0;
      if (copySelfContainedButton) copySelfContainedButton.disabled = false;
      let summaryText = `Valid suite: ${uiState.suiteId} (${uiState.caseCount} cases).`;
      if (response.warnings && response.warnings.length) {
        summaryText += ` Warnings: ${response.warnings.join(" ")}`;
      }
      setValidationSummary(summaryText, response.warnings && response.warnings.length ? "warning" : "success");
      setOverlayStatus("Suite valid. Copy the self-contained runner next.");
      renderStateStrip();
      await refreshState();
    } catch (error) {
      let message = `Validation failed: ${error.message}`;
      if (error.message.includes("Suite JSON could not be parsed")) {
        message += " If the parse error happens near a packet field, check for unescaped inner packet JSON. Packet should look like \"packet\": \"TTD_COMMAND_V1\\n{\\\"protocol\\\":\\\"TTD_COMMAND_V1\\\"}\".";
      }
      if (error.message.includes("packet must be a non-empty string")) {
        message += " Packet must be a string like \"TTD_COMMAND_V1\\n{...}\", not a JSON object.";
      }
      setValidationSummary(message, "danger");
      appendStatusLine(message);
      if (copySelfContainedButton) copySelfContainedButton.disabled = true;
    }
  });

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
          "1. Test done. Result downloaded.",
          "2. Casework End should open automatically.",
          "3. If it does not, double-click: ~/Desktop/Casework End.command",
          "4. When prompted, paste the CASEWORK_REVIEW_V1 block from the test chat."
        ].join("\n"),
        "Copied result instructions."
      );
    })
  );

  copyImportCommandButton.addEventListener("click", () =>
    withAction(async () => {
      const resultPath = uiState.serverState?.last_result?.result_json_path;
      const command = resultPath
        ? `node tools/command-language-casework/scripts/import-casework-result.mjs "${resultPath}"`
        : "node tools/command-language-casework/scripts/import-casework-result.mjs <path-to-downloaded-result.json>";
      await copyToClipboard(command, "Copied import command.");
      setReflectionStatus("Import command copied. Raw result JSON stays evidence; review and next-suite selection belong back in the TTD TESTS Project chat.");
    })
  );

  updateCaseLawMatrixButton.addEventListener("click", () =>
    withAction(async () => {
      const response = await postJson("/api/update-case-law-matrix", {});
      appendStatusLine(`Updated case-law matrix: ${response.row_count} rows`);
      setReflectionStatus(`Case-law matrix updated. Rows: ${response.row_count}. Update study status only after review decisions are made.`);
    })
  );

  openStudyStatusButton.addEventListener("click", () =>
    withAction(async () => {
      await postJson("/api/open-study-status", {});
      setReflectionStatus("Study status opened. Check the manual next-study pointer before designing another suite.");
    })
  );

  copyReflectionChecklistButton.addEventListener("click", () =>
    withAction(async () => {
      await copyToClipboard(
        [
          "Casework Reflection Loop v1",
          "1. Preserve raw result JSON.",
          "2. Import/save result into study/raw and study/reviews.",
          "3. Add Mermaid-first review.",
          "4. Name most important pass and failure.",
          "5. Classify tool vs scorer vs language vs transport.",
          "6. Decide whether the run is usable evidence.",
          "7. Regenerate the case-law matrix.",
          "8. Apply legal interpretation fields.",
          "9. Update CASEWORK_STUDY_STATUS.",
          "10. Only then design the next suite."
        ].join("\n"),
        "Copied reflection checklist."
      );
      setReflectionStatus("Reflection checklist copied. Keep raw JSON separate from matrix rows.");
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
  setOverlayStatus("Open a disposable generic ChatGPT test tab to begin.");
  setSkillSetupStatus("Use the TTD TESTS Project chat to design and review suites. Use this GUI only to validate JSON and copy the runner. Use the disposable ChatGPT test tab only to execute the runner.");
  setReflectionStatus("TTD TESTS Project chat reviews JSON and sets agenda. Casework GUI handles validation/import affordances. Disposable ChatGPT test tab runs the self-contained runner.");
  await refreshState();

}
