# Milestone 8.5 WebKit MCP Tether Spike Report

## Status

PASS_TARGET_FOUND / dataset-eval follow-up still pending.

## Setup Target

- `ios-webkit-debug-proxy` as the local WebKit target bridge
- `iwdp-mcp` as the first MCP candidate, now verified from upstream as a Go-based binary
- `safari-web-inspector-bridge` as a secondary audit candidate

## Commands To Run

```bash
go version
go env GOPATH
brew install ios-webkit-debug-proxy
go install github.com/nnemirovsky/iwdp-mcp/cmd/...@latest
ios_webkit_debug_proxy --no-frontend
node scripts/orion-webkit-mcp-tether-probe.mjs
/Users/oflahertys/go/bin/iwdp-cli devices
/Users/oflahertys/go/bin/iwdp-cli pages
```

## Expected Pass Result

- tethered Orion / ChatGPT page is discoverable
- dataset stamps are readable
- insert-only smoke can be dispatched through a tethered inspection client
- result JSON reports `ok:true`
- `submitAttempted:false`

## Exact Evidence To Capture

- endpoint that exposed the target page
- target page title/url
- candidate websocket URL
- `document.documentElement.dataset.orionTtdBuild`
- `document.documentElement.dataset.orionTtdLoaded`
- `document.documentElement.dataset.orionTtdInsertOnlyReady`
- `document.documentElement.dataset.orionTtdInsertOnlyLastResult`

## Run Record

- date/time:
  `2026-06-12 02:06 PM EDT`
- Gemini correction received:
  `iwdp-mcp` is Go-based, not npm
- Go version:
  `go version go1.26.4 darwin/arm64`
- GOPATH:
  `/Users/oflahertys/go`
- GOPATH bin on PATH:
  no
- `iwdp-mcp` installed:
  yes, at `/Users/oflahertys/go/bin/iwdp-mcp`
- `iwdp-cli` installed:
  yes, at `/Users/oflahertys/go/bin/iwdp-cli`
- `ios_webkit_debug_proxy` installed:
  yes, at `/opt/homebrew/bin/ios_webkit_debug_proxy`
- proxy started:
  yes, started for the test and then stopped
- `9221/json` responded:
  yes
- `9222/json` responded:
  yes
- iPhone device detected:
  yes, `iPhone (6)` on `localhost:9222`
- Orion / ChatGPT page detected:
  yes
- page title/url:
  `Orion TTD Insert Test`
  `https://chatgpt.com/c/6a2c4184-f104-83ea-8205-d9ad171904f7`
- candidate websocket URL:
  `ws://localhost:9222/devtools/page/3`
- local probe output summary:
  repo probe reported one ChatGPT candidate page and printed the expected narrow next-step eval list
- `iwdp-cli devices/pages` summary:
  `devices` listed the tethered iPhone and `pages` listed the ChatGPT tab plus background/about:blank pages
- dataset eval attempted:
  yes
- dataset eval result:
  direct `iwdp-cli eval` against the ChatGPT page did not return promptly
  a raw WebSocket `Runtime.evaluate` probe also connected to `ws://localhost:9222/devtools/page/3` but timed out without returning result payloads
- insert-only smoke dispatch attempted:
  no
- proxy stopped or left running:
  stopped after the test
- next action:
  isolate the minimal eval/wrapper step in a second tiny job, starting from the known-good target page and websocket URL without broadening scope

## Milestone 8.5B — Runtime.evaluate Isolation

- date/time:
  `2026-06-12 02:14 PM EDT`
- proxy command used:
  `ios_webkit_debug_proxy --no-frontend > /tmp/orion-iwdp-8_5b-short.log 2>&1 &`
- target page title/url/websocket:
  `Orion TTD Insert Test`
  `https://chatgpt.com/c/6a2c4184-f104-83ea-8205-d9ad171904f7`
  `ws://localhost:9222/devtools/page/3`
- iwdp-cli devices/pages summary:
  device listing still found `iPhone (6)` on `localhost:9222`
  pages listing still found the same ChatGPT target at page `3`
- diagnostic script path:
  `scripts/orion-webkit-runtime-eval-probe.mjs`
- commands run:
  `node scripts/orion-webkit-runtime-eval-probe.mjs --ws ws://localhost:9222/devtools/page/3 --timeout-ms 2000 --expression '1 + 1'`
  `node scripts/orion-webkit-runtime-eval-probe.mjs --ws ws://localhost:9222/devtools/page/3 --timeout-ms 2000 --expression 'document.title'`
  `node scripts/orion-webkit-runtime-eval-probe.mjs --ws ws://localhost:9222/devtools/page/3 --timeout-ms 2000 --expression 'document.readyState'`
  `node scripts/orion-webkit-runtime-eval-probe.mjs --ws ws://localhost:9222/devtools/page/3 --timeout-ms 2000 --with-page-enable --expression '1 + 1'`
  `node scripts/orion-webkit-runtime-eval-probe.mjs --ws ws://localhost:9222/devtools/page/3 --timeout-ms 2000 --with-page-enable --expression 'document.title'`
- whether Runtime.enable responded:
  no, timed out on every probe run
- whether Page.enable responded:
  no, also timed out when explicitly added
- expression results:
  `1 + 1` timed out
  `document.title` timed out
  `document.readyState` timed out
  no event messages were observed from the target socket during these runs
- whether iwdp-cli eval worked:
  no quick success observed; comparison attempts remained hung beyond the intended short check window
- eval path result:
  `BLOCKED`
- likely cause if inferable:
  target page selection appears correct and the socket opens, so the current blocker is more likely WebKit protocol responsiveness on this Orion target than JavaScript expression choice
- proxy stopped or left running:
  stopped
- next action:
  protocol-level debugging of WebKit target responsiveness or alternate target-session handling, not browser automation

## Milestone 8.5C — Protocol Attach/Eval Repair

- date/time:
  `2026-06-12 02:17 PM EDT`
- active paint state confirmed:
  partial yes
  the Orion ChatGPT target remained visible enough to reappear at the same URL/websocket, but native Safari was not open so Safari comparison was not completed in this run
- Orion target title/url/ws:
  `Orion TTD Insert Test`
  `https://chatgpt.com/c/6a2c4184-f104-83ea-8205-d9ad171904f7`
  `ws://localhost:9222/devtools/page/3`
- Safari target:
  not tested in this run
  `iwdp-cli eval --help` itself reported `no Safari tabs found`
- proxy command:
  `ios_webkit_debug_proxy --no-frontend > /tmp/orion-iwdp-8_5c.log 2>&1 &`
- iwdp-cli devices/pages summary:
  `devices` still found `iPhone (6)` on `localhost:9222`
  `pages` still found the Orion ChatGPT target at page `3`
- raw protocol sequences tested:
  runtime handshake:
  `Runtime.enable` -> `Runtime.evaluate("1+1")`
  inspector-runtime handshake:
  `Inspector.enable` -> `Runtime.enable` -> `Runtime.evaluate("1+1")`
  page-runtime handshake:
  `Page.enable` -> `Runtime.enable` -> `Runtime.evaluate("1+1")`
  target-domain control checks:
  `Target.getTargets`
  `Target.setAutoAttach`
- diagnostic script command outputs summarized:
  on the Orion ChatGPT target, the socket opened cleanly and closed with code `1000`, but every handshake command timed out with no event traffic
  on control targets `page/1`, `page/2`, and `page/4`, the socket returned immediate `-32601` protocol errors instead of blackholing
- whether Inspector.enable changed behavior:
  no
  it also timed out on the Orion ChatGPT target
- whether Safari differed from Orion:
  not tested in this run because no native Safari page was open
- whether eval path passed or remains blocked:
  `BLOCKED`
- likely next hypothesis:
  the Orion ChatGPT target is exposing a discoverable page socket but not an actively commandable Runtime/Page/Target session through this bridge
  the most likely branches now are Orion-specific WKWebView inspector limitation, claimed-session behavior, or a bridge mismatch for this target type
- proxy stopped or left running:
  stopped

## Milestone 8.5D — Unhobbled WebKit Inspector Diagnostics

- date/time:
  `2026-06-12 02:31 PM EDT`
- proxy command and lifecycle:
  `ios_webkit_debug_proxy --no-frontend > /tmp/orion-iwdp.log 2>&1 &`
  started for this run and stopped afterward
- current Orion target:
  title `ChatGPT`
  URL `https://chatgpt.com/`
  websocket `ws://localhost:9222/devtools/page/3`
- Safari static target:
  not tested in this run
  no native Safari page was open
- iwdp-cli findings:
  `iwdp-cli` supports explicit target selection by passing `<ws-url>` as the final argument
  `devices --help`, `pages --help`, and `eval --help` are not real help surfaces in this build; they attempt live device/page access instead
  `eval --help` reported `no Safari tabs found`, which confirms the CLI expects an active Safari-facing target context
- iwdp-mcp findings:
  direct `--help` did not print useful output
  source inspection in `/Users/oflahertys/go/pkg/mod/github.com/nnemirovsky/iwdp-mcp@v0.5.3` succeeded
  the MCP server exposes explicit page-selection tools:
  `list_devices`, `list_pages`, `select_page`, `evaluate_script`, `take_screenshot`, `get_document`, `query_selector`, and many others
  `select_page` uses `webkit.NewClient(ctx, input.WebSocketURL)` and relies on the shared WebKit client for attach behavior
- whether MCP tool enumeration succeeded:
  yes, by source enumeration rather than a live MCP inspector client
- raw protocol findings:
  upstream `scripts/ws-debug/main.go` on the Orion ChatGPT target received no initial messages at all
  no `Target.targetCreated` event arrived within 3 seconds
  direct `Runtime.evaluate` then timed out
  on a control socket (`page/1`), `Target.targetCreated` events did arrive, proving the bridge can emit them on other targets
  the enhanced local probe also confirmed that the Orion target socket opens, all tested commands time out, no events arrive, and the socket closes cleanly with code `1000`
- whether screenshot/DOM/AX was used, and why:
  no
  not required yet because the attach/session failure is already observable at socket/protocol level
- whether any eval returned:
  no
- comparison table:

| target | socket opens | commands respond | eval 1+1 | document.title | conclusion |
| --- | --- | --- | --- | --- | --- |
| Orion ChatGPT home (`page/3`) | yes | no, blackholes `Runtime`, `Page`, `Inspector`, `Target.*` | no | no | Orion target is discoverable but not commandable through the current attach path |
| Control socket (`page/1`) | yes | yes, but only as explicit `-32601` errors | no | not attempted | bridge and socket layer are alive; Orion target behavior is distinct |
| Native Safari static | not tested | not tested | not tested | not tested | still needed for clean Orion-vs-Safari branch |

- current classification:
  `ORION_EVAL_BLOCKED`
- next action:
  open native Safari on the iPhone to `example.com` or `chatgpt.com` and run the same probe there
  if Safari static works, treat the blocker as Orion-specific WKWebView / inspector limitation or target-session behavior
  if Safari static also fails, treat the blocker as iwdp/WebKit attach-session behavior and consider alternate bridge logic

## Safari Static Page Eval Comparison

- date/time:
  `2026-06-12 02:37 PM EDT`
- target:
  native Safari foregrounded on `https://example.com/`
- iwdp-cli pages result:
  Safari exposed one page target:
  `Example Domain`
  `https://example.com/`
  `ws://localhost:9222/devtools/page/1`
- eval probe results:
  socket opened successfully on the Safari target
  `Target.targetCreated` arrived
  `Runtime.enable` returned immediate `-32601`
  `Inspector.enable` returned immediate `-32601`
  `Page.enable` returned immediate `-32601`
  `Runtime.evaluate("1+1")` returned immediate `-32601`
  `Runtime.evaluate("document.title")` returned immediate `-32601`
  `Runtime.evaluate("document.readyState")` returned immediate `-32601`
- comparison against Orion:
  Orion ChatGPT target blackholes commands with no `Target.targetCreated`
  Safari static target does not blackhole; it responds immediately, but reports the tested domains as unavailable on that socket
- interpretation:
  this is not a totally dead proxy/bridge
  Safari and Orion differ
  Orion appears to have a target/session attach problem or WKWebView-specific inspector limitation
  Safari static still does not yet prove a working `Runtime.evaluate` route through the current socket shape
- proxy stopped:
  yes

## Runtime Change Confirmation

No runtime code changed in this milestone preparation job.

## Next Action After Codex/AG Setup Is Attempted

- record whether `ios_webkit_debug_proxy` can see the Orion iPhone page
- record whether an MCP client can run the targeted dataset/result probes
- decide whether to proceed to limited visible excerpt capture or stop and fix tether setup
