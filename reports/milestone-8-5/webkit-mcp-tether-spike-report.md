# Milestone 8.5 WebKit MCP Tether Spike Report

## Status

Prepared / pending tethered-device run.

## Setup Target

- `ios-webkit-debug-proxy` as the local WebKit target bridge
- `iwdp-mcp` as the first MCP candidate if package/repo launch is confirmed
- `safari-web-inspector-bridge` as a secondary audit candidate

## Commands To Run

```bash
which ios_webkit_debug_proxy || true
ios_webkit_debug_proxy --help
node scripts/orion-webkit-mcp-tether-probe.mjs
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

## Runtime Change Confirmation

No runtime code changed in this milestone preparation job.

## Next Action After Codex/AG Setup Is Attempted

- record whether `ios_webkit_debug_proxy` can see the Orion iPhone page
- record whether an MCP client can run the targeted dataset/result probes
- decide whether to proceed to limited visible excerpt capture or stop and fix tether setup
