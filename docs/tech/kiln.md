# Kiln (procedural asset generation)

[Kiln](https://github.com/instruktlabs/kiln) by Instrukt Labs, v**1.7.0**. The coding agent
writes JavaScript using Kiln's geometry/material helpers; Kiln runs it, returns rendered
views and structural QA, and saves editable source plus GLB. No model API key: Cursor's
agent is the model.

## Where things live

| Path | What |
| --- | --- |
| `~/Developer/kiln-install/` | Engine installation (npm package `@instruktlabs/kiln`). Keep it in place. |
| `.cursor/mcp.json` | Project MCP server `kiln_workspace` (absolute paths to the engine and Node) |
| `.codex/config.toml` (Kiln block), `codex.mjs` | Same server for Codex; see [agents.md](agents.md) |
| `kiln.mjs` | Workspace CLI launcher, pinned to the same engine/store as MCP |
| `AGENTS.md`, `CLAUDE.md`, `START.md`, `.kiln/AGENTS.md`, `.kiln/START.md` | Kiln-managed agent instructions |
| `skills/`, `.agents/skills/` | Kiln-managed skills: author, refine, QA, compose-scene |
| `.kiln/workspace.json` | Managed-file manifest (runtime path, hashes) |
| `.kiln/programs/` | Draft source store (gitignored, disposable) |
| `.kiln/projects/` | Kiln project records (`mars-life-line`) |
| `assets/kiln/` | Saved asset collection `project`: source, GLB, preview per revision |

**Do not edit the Kiln-managed files** (`AGENTS.md`, `skills/`, `.agents/skills/`, `.kiln/*.md`,
`kiln.mjs`, `.cursor/mcp.json`). `--upgrade` refuses to overwrite customized files. Put our
own instructions in `.cursor/rules/` and `docs/` instead.

## How it was installed

```sh
mkdir -p ~/Developer/kiln-install && cd ~/Developer/kiln-install
npm init -y && npm install @instruktlabs/kiln
npx --offline --no -- kiln-init "<project>" --adopt --harness cursor-agent --skills compose
```

`--adopt` adds Kiln to an existing project without touching unrelated files. The npm
`webgpu` install-script warning is expected on Linux (it only matters on macOS).

## MCP server

`kiln_workspace` exposes 18 tools: `kiln_discover`, `kiln_renderer_status`, `kiln_renderer`,
`kiln_validate`, `kiln_render`, `kiln_screenshot_animation`, `kiln_view_interior`,
`kiln_inspect`, `kiln_edit`, `kiln_source`, `kiln_project`, `kiln_material`, `kiln_review`,
`kiln_save`, `kiln_assets`, `kiln_present`, `kiln_export`, `kiln_import`.

In Cursor: Settings → MCP → make sure `kiln_workspace` is enabled, then open a new chat.
A server named plain `kiln` would be a different installation; don't use it.

## Rendering

- `KILN_RENDER=auto`: CPU views for flat scenes, GPU service for emissive/metal/textured.
- GPU verified on this machine: `dawn-vulkan` on AMD Radeon Vega 8 (Mesa RADV),
  `materialFaithful: true`.
- `npm run kiln:status` shows capabilities and the render service.

## Common commands

```sh
npm run kiln -- discover --query "chamfered panel" --json
npm run kiln -- render my.kiln.js --project mars-life-line --out /tmp/a.glb --views /tmp/a.png --render gpu
npm run kiln -- project get mars-life-line
npm run kiln:view                      # local dashboard: Live Review, Library, Projects
npm run style:sync                     # push tokens.json into the Kiln project
```

## Upgrading Kiln

Stop Cursor chats using the MCP server first.

```sh
cd ~/Developer/kiln-install && npm install @instruktlabs/kiln@latest
npx --offline --no -- kiln-init "<project>" --check     # read-only, exits 1 if update needed
npx --offline --no -- kiln-init "<project>" --upgrade
```

Read the Kiln `CHANGELOG.md`/migration notes first. After moving the project or Node:
`node ~/Developer/kiln-install/node_modules/@instruktlabs/kiln/scripts/create-workspace.mjs "<project>" --repair`.

## Limits worth knowing

Build deadline 60 s, GLB cap 16 MiB, Node heap 512 MiB per evaluation (env-configurable).
Validation and QA describe structure, not visual quality; style review is ours.
