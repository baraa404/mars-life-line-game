# AI agents: Cursor, Codex and Antigravity

All three harnesses work on this project with the same rules, skills, Kiln tools and Kiln store.

## What each one reads

| Thing | Cursor | Codex | Antigravity |
| --- | --- | --- | --- |
| Kiln workspace instructions | `AGENTS.md` / `CLAUDE.md` (Kiln-managed) | `AGENTS.md` (Kiln-managed) | `AGENTS.md` (always on; no frontmatter) |
| Project rules | `.cursor/rules/*.mdc` | Same files, via `developer_instructions` in `.codex/config.toml` | `.agents/rules/*.md`, which inline those same `.mdc` files |
| Kiln MCP server `kiln_workspace` | `.cursor/mcp.json` (Kiln-managed) | Kiln block in `.codex/config.toml` (Kiln-managed) | `.agents/mcp_config.json` |
| Kiln skills | `skills/` and `.agents/skills/` | `.agents/skills/` | `.agents/skills/` (one level deep; already in place) |
| Image generation | Cursor image generation | Codex image generation | Antigravity image generation, if the session has it |

**The rule files under `.cursor/rules/` are the single source of truth.** Do not copy rule
text into Codex or Antigravity. Codex has no glob-matched rules, so `developer_instructions`
tells it to always read `project-core.mdc` and `docs-protocol.mdc`, and to read
`asset-creation.mdc` and `visual-style.mdc` when the task matches. Antigravity cannot read
`.mdc` files on its own. Each `.agents/rules/*.md` file only sets a trigger and inlines the
matching `.mdc` with `@[label](../../.cursor/rules/….mdc)`. Edit a rule in its `.mdc` file
only. When you add, rename or remove a rule file, update `developer_instructions` and add or
remove the matching `.agents/rules/` file.

## Codex setup

- Added with `kiln-init <project> --adopt --harness codex`. The workspace now lists the
  harnesses `codex` and `cursor-agent` (`.kiln/workspace.json`).
- `.codex/config.toml`: our `developer_instructions` sit at the top. The block between
  `# BEGIN KILN` and `# END KILN` belongs to Kiln; do not edit it.
- Codex loads a project `.codex/config.toml` only for trusted projects. This project is
  already trusted in `~/.codex/config.toml`.
- `codex.mjs` (Kiln-managed) starts Codex with the same MCP values passed as `-c` overrides.
  Use it if the project is ever untrusted: `node codex.mjs`.
- Verify: `codex mcp list` run in the project should show `kiln_workspace` as `enabled`. The
  Codex CLI ships with the desktop app at `/usr/lib/chatgpt/resources/codex`.

## Antigravity setup

Open this repository as an Antigravity project (App: New Project → Add Folder; CLI: `agy`
from this directory). Antigravity rereads rules before each turn. No install step beyond
the files in this repo.

- Always on: `.agents/rules/project-core.md`, `.agents/rules/docs-protocol.md`.
- On demand (`model_decision`): `.agents/rules/asset-creation.md`, `.agents/rules/visual-style.md`.
- MCP: `.agents/mcp_config.json` launches the same `kiln_workspace` server as Cursor. Use
  only that server name. A server named `kiln` is another installation; do not use it.
- Skills already live in `.agents/skills/` (`kiln-author-asset`, `kiln-refine-asset`,
  `kiln-qa-asset`, `kiln-compose-scene`). Those folders are Kiln-managed; do not edit them.
- There is no `GEMINI.md`. `AGENTS.md` is the always-on Kiln brief. Game rules stay in
  `.cursor/rules/` so the three harnesses cannot drift.
- After a Kiln upgrade, if `.cursor/mcp.json` changes its node path or server args, copy
  the same `command`, `args` and `env` into `.agents/mcp_config.json`. Kiln does not own
  that file.
- Check: Antigravity Settings → project → Customizations should list the four rules, the
  four Kiln skills, and `kiln_workspace`. CLI: `/skills` and `/mcp`.

## After a Kiln upgrade

`kiln-init . --check`, then `--upgrade`. Upgrade refreshes the Kiln block in
`.codex/config.toml` and keeps our `developer_instructions` outside it. Re-run
`codex mcp list` afterwards.
