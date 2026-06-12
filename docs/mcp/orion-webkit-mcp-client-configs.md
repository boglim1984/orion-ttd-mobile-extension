# Orion WebKit MCP Client Configs

## Purpose

Provide example MCP client setup snippets for the Orion WebKit tether spike.

These are examples only. Verify local config paths before writing permanent client config.

## Generic MCP Server Example

```json
{
  "mcpServers": {
    "iwdp-mcp": {
      "command": "iwdp-mcp"
    }
  }
}
```

## Verified Install Path

`iwdp-mcp` is Go-based, not an npm package.

Install with:

```bash
brew install ios-webkit-debug-proxy
go install github.com/nnemirovsky/iwdp-mcp/cmd/...@latest
```

Current local notes on Billy's Mac:

- `ios_webkit_debug_proxy` is installed at `/opt/homebrew/bin/ios_webkit_debug_proxy`
- `iwdp-mcp` and `iwdp-cli` are installed at:
  - `/Users/oflahertys/go/bin/iwdp-mcp`
  - `/Users/oflahertys/go/bin/iwdp-cli`
- `$(go env GOPATH)/bin` is not currently on `PATH`
- for now, use absolute paths or add that directory to `PATH` later by explicit choice

## Codex Setup Target

Candidate path / verify locally:

- use the local Codex MCP configuration location that Billy normally uses for custom MCP servers
- if no stable local path is known, apply the server block through the Codex client’s normal MCP settings flow rather than guessing a file path

Upstream README example:

```toml
[mcp_servers.iwdp-mcp]
command = "iwdp-mcp"
```

## AG Setup Target

Candidate path / verify locally:

- use the AG MCP configuration location if AG has one
- if AG uses a repo-local or home-directory MCP config file, verify the actual path before editing

Upstream README example:

```json
{
  "mcpServers": {
    "iwdp-mcp": {
      "command": "iwdp-mcp"
    }
  }
}
```

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

## Candidate Commands To Verify Later

```bash
/opt/homebrew/bin/ios_webkit_debug_proxy --no-frontend
node scripts/orion-webkit-mcp-tether-probe.mjs
/Users/oflahertys/go/bin/iwdp-cli devices
/Users/oflahertys/go/bin/iwdp-cli pages
```
