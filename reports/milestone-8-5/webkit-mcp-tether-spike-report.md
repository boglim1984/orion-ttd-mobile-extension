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

## Runtime Change Confirmation

No runtime code changed in this milestone preparation job.

## Next Action After Codex/AG Setup Is Attempted

- record whether `ios_webkit_debug_proxy` can see the Orion iPhone page
- record whether an MCP client can run the targeted dataset/result probes
- decide whether to proceed to limited visible excerpt capture or stop and fix tether setup
