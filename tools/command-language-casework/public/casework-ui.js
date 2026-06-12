const suiteInput = document.querySelector("#suite-input");
const loaderOutput = document.querySelector("#loader-output");
const statusLogPanel = document.querySelector("#status-log-panel");
const currentCasePanel = document.querySelector("#current-case-panel");
const resultLinksPanel = document.querySelector("#result-links-panel");

const validateButton = document.querySelector("#validate-button");
const copySelfContainedButton = document.querySelector("#copy-self-contained-button");
const runButton = document.querySelector("#run-button");
const stopButton = document.querySelector("#stop-button");
const saveDraftButton = document.querySelector("#save-draft-button");
const copyStatusLogButton = document.querySelector("#copy-status-log-button");
const openResultsButton = document.querySelector("#open-results-button");
const copySummaryButton = document.querySelector("#copy-summary-button");
const copyLoaderButton = document.querySelector("#copy-loader-button");

function appendStatusLine(message) {
  statusLogPanel.textContent = `${statusLogPanel.textContent}\n${message}`.trim();
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

function renderStatus(state) {
  statusLogPanel.textContent = (state.status_log || []).join("\n") || "No status yet.";

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
  } else if (state.pending_run) {
    currentCasePanel.textContent = JSON.stringify(
      {
        pending_run_id: state.pending_run.run_id,
        suite_id: state.pending_run.suite.suite_id,
        waiting_for_runner: true
      },
      null,
      2
    );
  } else {
    currentCasePanel.textContent = "No active case.";
  }

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
    resultLinksPanel.textContent = "No completed run yet.";
    openResultsButton.disabled = true;
    copySummaryButton.disabled = true;
  }
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

async function copySelfContainedRunner() {
  const payload = await postJson("/api/runner/self-contained-payload", {
    suite_text: suiteInput.value
  });
  await navigator.clipboard.writeText(payload.payload);
  appendStatusLine(`Copied self-contained runner for ${payload.run_id}`);
}

async function withAction(action) {
  try {
    await action();
    await refreshState();
  } catch (error) {
    appendStatusLine(error.message);
  }
}

validateButton.addEventListener("click", () =>
  withAction(async () => {
    await postJson("/api/validate", {
      suite_text: suiteInput.value
    });
  })
);

copySelfContainedButton.addEventListener("click", () =>
  withAction(async () => {
    await copySelfContainedRunner();
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

saveDraftButton.addEventListener("click", () =>
  withAction(async () => {
    const response = await postJson("/api/save-draft", {
      suite_text: suiteInput.value
    });
    appendStatusLine(`Saved draft suite: ${response.draft_path}`);
  })
);

copyStatusLogButton.addEventListener("click", () =>
  withAction(async () => {
    await navigator.clipboard.writeText(statusLogPanel.textContent);
    appendStatusLine("Copied status log.");
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
    await navigator.clipboard.writeText(text);
    appendStatusLine("Copied latest server-side result summary.");
  })
);

copyLoaderButton.addEventListener("click", () =>
  withAction(async () => {
    await navigator.clipboard.writeText(loaderOutput.value);
    appendStatusLine("Copied legacy loader snippet.");
  })
);

setInterval(refreshState, 2000);

await refreshLoader();
await refreshState();
