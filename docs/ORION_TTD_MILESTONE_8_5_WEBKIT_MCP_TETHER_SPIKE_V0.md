# Orion TTD Milestone 8.5 WebKit MCP Tether Spike V0

Status: prepared setup and capability spike  
Scope: tethered WebKit inspection only, no broad automation

## Purpose

Prepare a small but real WebKit/MCP tether spike so Codex, and AG if practical, can validate the same narrow Orion iPhone insert-only boundary Billy already validated manually through Safari Web Inspector.

## Context From Milestones 7 And 8 Trial 1

- Milestone 7 already passed manually on real Orion iPhone + ChatGPT
- Milestone 8 Trial 1 ran manually and finished as `PASS_WITH_REPAIR`
- the next useful question is whether an MCP/WebKit tether can reproduce the same dataset/result checks Billy performed manually, without jumping to broad browser automation

## Why WebKit Tether Matters

- it can validate the real Orion iPhone page instead of a desktop surrogate
- it can re-run targeted dataset/result probes without adding hidden extension authority
- it creates a path for later limited diagnostics when manual runs fail

## Candidate Stack

- `ios-webkit-debug-proxy`
  - role: expose tethered iPhone Web Inspector targets on local HTTP/WebSocket endpoints
  - documented install command:
    `brew install ios-webkit-debug-proxy`
- `iwdp-mcp`
  - first MCP candidate because it explicitly targets `ios-webkit-debug-proxy` and WebKit Inspector Protocol
  - verified from upstream README as a Go-based binary install, not an npm package
  - documented install command:
    `go install github.com/nnemirovsky/iwdp-mcp/cmd/...@latest`
  - companion CLI:
    `iwdp-cli`
- `safari-web-inspector-bridge`
  - second candidate / audit note only for this spike
  - treat as a fallback or comparative architecture reference until maturity and install path are verified

## ios-webkit-debug-proxy Setup

Expected prerequisites:

- iPhone tethered to Mac
- iPhone Web Inspector enabled
- Orion page open on the device

Expected local checks:

- `which ios_webkit_debug_proxy`
- `ios_webkit_debug_proxy --help`
- `http://localhost:9221/json`
- `http://localhost:9222/json`

Current local state on Billy's Mac at doc time:

- installed via Homebrew at `/opt/homebrew/bin/ios_webkit_debug_proxy`
- `ios_webkit_debug_proxy --help` returns normally
- probe endpoints `9221/json` and `9222/json` respond when the proxy is running

## iwdp-mcp Setup

Verified posture:

- install from Go using:
  `go install github.com/nnemirovsky/iwdp-mcp/cmd/...@latest`
- launch binaries from `$(go env GOPATH)/bin` unless that directory is already on `PATH`
- MCP server command is:
  `iwdp-mcp`
- CLI command is:
  `iwdp-cli`

Current local state on Billy's Mac at doc time:

- upstream README confirms the Go install path
- binaries were installed at:
  `/Users/oflahertys/go/bin/iwdp-mcp`
  `/Users/oflahertys/go/bin/iwdp-cli`
- `$(go env GOPATH)/bin` is not on Billy's current `PATH`, so absolute paths or a later PATH fix are required

## safari-web-inspector-bridge Audit Notes

- useful as a second candidate because it claims the right architecture
- do not treat it as the default until install path, maturity, and safe usage model are verified
- for this spike, a doc reference is enough; cloning is not required

## Codex MCP Setup Target

Goal:

- let Codex use a narrow WebKit MCP surface for:
  - device/page listing
  - dataset stamp reads
  - insert-only smoke dispatch
  - insert-only result readback

Target posture:

- no full DOM
- no storage
- no screenshots by default
- no auto-submit

## AG MCP Setup Target If Practical

Goal:

- let AG reuse the same narrow tether surface if AG supports the same MCP server safely
- same restricted-use envelope as Codex

If AG config paths or launcher conventions are not known locally, keep the doc generic and verify later.

Known config targets from upstream README:

- Codex CLI:
  `codex mcp add iwdp-mcp -- iwdp-mcp`
  or `~/.codex/config.toml`
- Antigravity:
  `~/.gemini/antigravity/mcp_config.json`

## Allowed Tool Envelope

- list tethered devices/pages
- identify Orion / ChatGPT page
- read `document.documentElement.dataset` Orion TTD values
- dispatch the known insert-only smoke event
- read insert-only result JSON
- read composer selector presence
- read composer text prefix and length
- verify `submitAttempted:false`

## Banned Tool Envelope

- no auto-submit
- no click-send
- no response observer
- no repair insertion automation
- no full DOM dumps
- no screenshots by default
- no cookies
- no localStorage
- no sessionStorage
- no IndexedDB
- no credentials/tokens/account internals
- no network body scraping

## Token Economy Rule

Start with the smallest probe that proves the boundary:

1. list device/page
2. read dataset stamps
3. trigger insert-only smoke
4. read result JSON
5. stop

Only escalate to broader diagnostics when a concrete failure requires it.

## Exact Targeted JS Probes

Dataset stamps:

```js
document.documentElement.dataset.orionTtdBuild
document.documentElement.dataset.orionTtdLoaded
document.documentElement.dataset.orionTtdInsertOnlyReady
```

Trigger:

```js
document.dispatchEvent(new CustomEvent("orion-ttd-run-insert-only-smoke"))
```

Result:

```js
document.documentElement.dataset.orionTtdInsertOnlyLastResult
document.documentElement.dataset.orionTtdInsertOnlyLastError
```

Composer visibility checks:

```js
Boolean(document.querySelector("#prompt-textarea"))
Boolean(document.querySelector("div[contenteditable='true'][id='prompt-textarea']"))
```

Composer prefix/length checks:

```js
(() => {
  const el = document.querySelector("#prompt-textarea") || document.querySelector("div[contenteditable='true'][id='prompt-textarea']");
  const text = el && typeof el.value === "string" ? el.value : (el?.textContent || "");
  return { length: text.length, prefix: text.slice(0, 32) };
})()
```

## Pass/Fail Criteria

### Pass

- tethered page listing works
- Orion / ChatGPT page is identifiable
- dataset stamps are readable
- insert-only event dispatch works
- result JSON reports `ok:true`
- `submitAttempted:false`

### Fail

- no tethered page appears
- Orion / ChatGPT page cannot be identified
- targeted evals fail consistently
- insert-only event cannot be triggered
- result reports unexpected submit or illegal mutation posture

## Troubleshooting

- verify iPhone Web Inspector is enabled
- verify the iPhone is trusted and tethered
- verify Orion is open to a live ChatGPT page
- verify `ios_webkit_debug_proxy` is installed and running
- if `9221/json` is empty, try `9222/json`
- if dataset eval hangs even though page discovery works, treat discovery as passed and isolate eval/wrapper work in a second tiny job rather than escalating to broad automation

## Milestone 8.5B Runtime.evaluate Isolation

Current protocol boundary:

- page discovery passed
- target websocket was identified
- WebSocket connection opens successfully
- `Runtime.enable` currently times out on the real Orion ChatGPT target
- adding `Page.enable` first does not currently unblock the target
- no insert dispatch should be attempted until a tiny eval returns

Safe eval ladder for isolation:

1. `1 + 1`
2. `document.title`
3. `document.readyState`
4. `document.location.href`
5. `document.documentElement.dataset.orionTtdBuild`
6. `document.documentElement.dataset.orionTtdLoaded`
7. `document.documentElement.dataset.orionTtdInsertOnlyReady`

## Milestone 8.5C Protocol Attach/Eval Repair

- active paint state matters: keep the iPhone unlocked, Orion foregrounded, the target tab visible, and the screen awake during the probe
- Orion vs native Safari remains the next clean isolation branch
- test `Inspector.enable` before declaring Runtime/Page eval impossible
- if non-target sockets return immediate protocol errors but the Orion ChatGPT socket only blackholes, treat that as a target/session behavior clue rather than proof that every message shape is wrong
- do not attempt insert dispatch until `1+1` returns on the chosen target

## Milestone 8.5D Unhobbled Inspector Diagnostics

- at the protocol-debugging stage, broad diagnostic tool discovery is allowed
- the hard boundaries remain private state access and ChatGPT mutation
- source/tool inspection of `iwdp-mcp` is valid when CLI help is insufficient
- the current key discriminator is whether the target emits `Target.targetCreated`
- if the Orion ChatGPT socket opens but emits no `Target.targetCreated`, the wrapped attach path may never activate

## Extension Witness Channels

Why this exists:

- the Orion inspector bridge may fail before arbitrary `Runtime.evaluate` is usable
- the extension can still expose low-noise witness evidence inside the page
- this reduces dependence on remote eval for manual Safari Web Inspector checks

Witness policy:

- console is useful for human Safari Web Inspector, but it is not canonical state
- dataset fields and `#orion-ttd-witness` are the canonical low-noise witness channels
- witness evidence does not make the extension state authority
- witness evidence does not mutate committed route state
- witness evidence must stay clear of private storage, cookies, tokens, and account internals

## Next Expansion Ladder

### Phase 1

- list device/page
- read dataset stamps
- dispatch insert-only smoke
- read result JSON
- verify `submitAttempted:false`

### Phase 2

- limited visible assistant reply excerpt capture
- limited AX/accessibility or specific selector queries
- no full DOM

### Phase 3

- controlled composer focus/insert
- manual send remains default
- trusted-mode send only in a later explicit milestone

### Phase 4

- broader diagnostics only when a failure requires it
