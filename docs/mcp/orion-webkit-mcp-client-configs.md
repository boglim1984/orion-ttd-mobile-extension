# Orion WebKit MCP Client Configs

## Purpose

Provide example MCP client setup snippets for the Orion WebKit tether spike.

These are examples only. Verify package names, repo launch commands, and local config paths before writing permanent client config.

## Generic MCP Server Example

```json
{
  "mcpServers": {
    "iwdp-mcp": {
      "command": "npx",
      "args": ["iwdp-mcp"]
    }
  }
}
```

## Codex Setup Target

Candidate path / verify locally:

- use the local Codex MCP configuration location that Billy normally uses for custom MCP servers
- if no stable local path is known, apply the server block through the Codex client’s normal MCP settings flow rather than guessing a file path

## AG Setup Target

Candidate path / verify locally:

- use the AG MCP configuration location if AG has one
- if AG uses a repo-local or home-directory MCP config file, verify the actual path before editing

## Generic Restricted-Use Instruction Block

Paste this into Codex or AG prompts when using the WebKit tether server:

```text
Use only targeted evals against the Orion iPhone ChatGPT page.
Allowed:
- dataset stamp reads
- insert-only smoke dispatch
- insert-only result JSON read
- composer selector presence
- composer text prefix/length

Not allowed:
- full DOM dumps
- screenshots by default
- cookies
- localStorage
- sessionStorage
- IndexedDB
- credentials/tokens/account internals
- auto-submit
- broad browser automation
```

## Current Local Notes

- `ios_webkit_debug_proxy` was not found in `PATH`
- `brew list ios-webkit-debug-proxy` did not find a local install
- `npm view iwdp-mcp version` returned `404`, so repo-based verification is still needed

## Candidate Commands To Verify Later

```bash
brew install ios-webkit-debug-proxy
ios_webkit_debug_proxy --help
node scripts/orion-webkit-mcp-tether-probe.mjs
```
