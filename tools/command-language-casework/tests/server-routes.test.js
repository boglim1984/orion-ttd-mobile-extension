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
