const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");

async function loadServerModule() {
  const modulePath = path.resolve(
    __dirname,
    "..",
    "server",
    "casework-server.mjs"
  );
  return import(modulePath);
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
      })
      .on("error", reject);
  });
}

test("parseCli accepts env PORT and explicit --port override", async () => {
  const serverModule = await loadServerModule();

  process.env.PORT = "4318";
  assert.equal(serverModule.parseCli([]).port, 4318);
  assert.equal(serverModule.parseCli(["--port", "4319"]).port, 4319);
  delete process.env.PORT;
});

test("root route, index route, and api/state are served on the selected port", async () => {
  const serverModule = await loadServerModule();
  const started = await serverModule.startServer({
    host: "127.0.0.1",
    port: 0
  });

  try {
    const rootResponse = await requestText(`${started.guiUrl}/`);
    assert.equal(rootResponse.statusCode, 200);
    assert.match(rootResponse.headers["content-type"], /text\/html/);
    assert.match(rootResponse.body, /Command Language Casework Runner/);

    const indexResponse = await requestText(`${started.guiUrl}/index.html`);
    assert.equal(indexResponse.statusCode, 200);
    assert.match(indexResponse.headers["content-type"], /text\/html/);
    assert.match(indexResponse.body, /casework-ui\.js/);

    const stateResponse = await requestText(`${started.guiUrl}/api/state`);
    assert.equal(stateResponse.statusCode, 200);
    assert.match(stateResponse.headers["content-type"], /application\/json/);
    const statePayload = JSON.parse(stateResponse.body);
    assert.equal(statePayload.ok, true);
    assert.equal(statePayload.tool_version, "command-language-casework-runner-v1");
  } finally {
    await new Promise((resolve, reject) => {
      started.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});

test("self-contained payload endpoint returns inline suite data without bootstrap dependency", async () => {
  const serverModule = await loadServerModule();
  const started = await serverModule.startServer({
    host: "127.0.0.1",
    port: 0
  });

  try {
    const payloadText = JSON.stringify({
      suite_text: JSON.stringify({
        suite_id: "self-contained-suite",
        suite_title: "Self-contained Suite",
        suite_goal: "Validate payload generation",
        created_for_tool: "command-language-casework-runner-v1",
        route_id: "desk-reset-v0",
        run_config: {
          target_chat: "visible_current_chatgpt_page",
          send_mode: "explicit_casework_run_button",
          turn_timeout_ms: 1000,
          stability_wait_ms: 250,
          stop_on_case_failure: false,
          stop_after_each_case: false
        },
        cases: [
          {
            case_id: "case-001",
            title: "Case",
            research_question: "Question",
            packet: "TTD_COMMAND_V1\\n{}",
            scripted_user_replies: [],
            expected_behavior: [
              "behavior"
            ],
            forbidden_behavior: [
              "forbidden"
            ],
            expected_reducer_semantics: "continue -> keep_active_chunk",
            classification_targets: [
              "PASS"
            ]
          }
        ]
      })
    });

    const response = await new Promise((resolve, reject) => {
      const request = http.request(
        `${started.guiUrl}/api/runner/self-contained-payload`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(payloadText)
          }
        },
        (result) => {
          const chunks = [];
          result.on("data", (chunk) => chunks.push(chunk));
          result.on("end", () => {
            resolve({
              statusCode: result.statusCode,
              headers: result.headers,
              body: Buffer.concat(chunks).toString("utf8")
            });
          });
        }
      );
      request.on("error", reject);
      request.write(payloadText);
      request.end();
    });

    assert.equal(response.statusCode, 200);
    const payload = JSON.parse(response.body);
    assert.equal(payload.ok, true);
    assert.match(payload.payload, /installSelfContained/);
    assert.match(payload.payload, /self-contained-suite/);
    assert.doesNotMatch(payload.payload, /\/api\/runner\/bootstrap\.js/);
    assert.doesNotMatch(payload.payload, /fetch\("http:\/\/127\.0\.0\.1/);
    assert.match(payload.payload, /orion-casework-result-/);
  } finally {
    await new Promise((resolve, reject) => {
      started.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});

test("example suite endpoint returns the baseline suite text", async () => {
  const serverModule = await loadServerModule();
  const started = await serverModule.startServer({
    host: "127.0.0.1",
    port: 0
  });

  try {
    const response = await requestText(`${started.guiUrl}/api/example-suite?name=desk-reset-baseline-suite.json`);
    assert.equal(response.statusCode, 200);
    assert.match(response.headers["content-type"], /application\/json/);
    const payload = JSON.parse(response.body);
    assert.equal(payload.ok, true);
    assert.equal(payload.name, "desk-reset-baseline-suite.json");
    assert.match(payload.suite_text, /"suite_id":/);
  } finally {
    await new Promise((resolve, reject) => {
      started.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});

test("occupied port handling rejects cleanly with EADDRINUSE", async () => {
  const serverModule = await loadServerModule();
  const occupiedServer = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("occupied");
  });

  await new Promise((resolve, reject) => {
    occupiedServer.listen(0, "127.0.0.1", (error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  const address = occupiedServer.address();
  const occupiedPort = typeof address === "object" && address ? address.port : 0;

  try {
    await assert.rejects(
      serverModule.startServer({
        host: "127.0.0.1",
        port: occupiedPort
      }),
      /already in use/
    );
  } finally {
    await new Promise((resolve, reject) => {
      occupiedServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
