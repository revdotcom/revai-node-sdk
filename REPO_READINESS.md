# Repo Readiness Report

**Repo:** revai-node-sdk (`revdotcom/revai-node-sdk`)
**Audited:** 2026-05-12
**Based on:** AI in EPD Module 3 — Repo Readiness Checklist (Claire Vo & Zach Davis)
**Audit version:** v2.1 (local + external GitHub checks; non-GitHub CI captured only)
**External validation:** GitHub Actions via `gh`

## Summary

- **Overall readiness:** Early
- **Score:** 3 ✅ / 3 🟡 / 12 ❌ / 6 🔗 / 2 ➖ (of 26)
- **Stack detected:** TypeScript / Node.js (npm). Public SDK package. Containerized (`Dockerfile`). Jenkins pipeline in-repo (`JenkinsFile`). No database; no preview surface.
- **External validation verdict:** Develop-branch CI (`build_test.yml`) has 3/3 recent runs failed — last 3 pushes to `develop` failed on integration-tests; build_test on Dependabot branches median ~42s. No agentic review configured. Dependabot + CodeQL + lychee link-checker fire on PRs. Ticket linkage strong (17/20 PRs reference REVAI-/AISDK-/DOCS- IDs).

### Top 3 Next Actions
1. **Investigate the 3-of-3 `develop`-branch `build_test.yml` failures** (most recent 2026-03-12, 2026-03-05, 2026-03-03 — last is the PR that introduced/updated CI). The repo's main CI gate has not had a green run on the default branch since CI was added; a new contributor sees a permanently red shield.
2. **Add a `CLAUDE.md` / `AGENTS.md` covering architecture (clients, models, streaming vs async), local dev (already in README), and operational pointers** (Jenkins job for publish, npm release flow). The repo currently has zero agent-readable conventions files.
3. **Add a `.claude/` directory with at least `settings.json` (pre-approved read-only permissions) and either a small skills dir or marketplace registration.** The entire Tier-1 tooling cluster (items 7–12) is FAIL.

## Tier 1 — Foundation

| # | Item | Status | Evidence / Notes |
|---|------|--------|------------------|
| 1 | AGENTS.md (top-level + nested) | ❌ | No `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, `.windsurfrules`, or `GEMINI.md` found anywhere. |
| 2 | Best practices per-language | ❌ | No `STYLE_GUIDE.md`, `CODING_STANDARDS.md`, `.claude/tips/`, or CLAUDE.md TypeScript section. `.eslintrc.js` (5KB, custom rules) is the only style signal — enforces lint but no narrative guidance for humans/agents. |
| 3 | Architecture + operational surface | ❌ | `README.md` (294 lines) is API-usage docs only. No architecture (client classes, streaming WebSocket vs REST split), no operational pointers (where releases publish, Jenkins job URL, monitoring). |
| 4 | Database schema reference | ➖ | No database — SDK consumes Rev AI HTTP/WS API. |
| 5 | CONTRIBUTING.md or similar | 🟡 | README "For Rev AI Node SDK Developers" section (lines 281–294) covers build/lint/test/example workflow. No commit-message conventions, no PR template, no dedicated `CONTRIBUTING.md`. |
| 6 | .env.example (or equivalent) | 🟡 | `examples/config/sample.config.json` documents `access_token` for example scripts only. CI integration-tests consume `BASE_URL`/`API_KEY`/`USER_EMAIL` secrets (per `build_test.yml`) — not documented in any local sample file. |
| 7 | settings.json with pre-approved permissions | ❌ | No `.claude/` directory. |
| 8 | Skills directory | ❌ | No `.claude/skills/`, `skills/`, or marketplace config. |
| 9 | Skill-creator skill | ❌ | No skills infra at all. |
| 10 | Hooks for deterministic checks | ❌ | No `.githooks/`, `husky`, `.pre-commit-config.yaml`, or `.claude/settings.json` hooks. Lint runs only in CI (and only on Node 17.x matrix entry of `build_test.yml`). |
| 11 | Hooks for agent friction | ❌ | None. |
| 12 | Tool call telemetry | ❌ | No `CLAUDE_CODE_ENABLE_TELEMETRY` reference, no OTLP config. |

**Tier-1 FAIL count: 9** (1, 2, 3, 7, 8, 9, 10, 11, 12)

## Tier 2 — DX & Speed

| # | Item | Status | Evidence / Notes |
|---|------|--------|------------------|
| 13 | Single-command local dev | 🟡 | README documents `npm install` → `npm run build` → `npm run unit-test`. Multi-step but documented. No `Makefile`/`justfile`/`Taskfile`/`docker-compose`. `Dockerfile` exists but only provides a bash shell, not a dev environment. |
| 14 | Fast linting (<30s) | ✅ | `.eslintrc.js` + `npm run lint` script + invoked in `build_test.yml` lint job. Phase 2 timing: lint job median ~22s (within target). |
| 15 | Fast formatting (<20s) | ❌ | No `.prettierrc`, `biome.json`, formatter config, nor enforcement (pre-commit, PostToolUse hook). ESLint covers some formatting via rules but no dedicated formatter. |
| 16 | Fast compilation / type checking (<45s) | ✅ | `tsconfig.json` present, `npm run build` (tsc) invoked in CI `unit-tests` job. Strict typing across 56 src TS files. |
| 17 | Reliable tests | ✅ | Jest (unit + integration), `jest.config.unit.js` / `jest.config.integration.js`. 18 test specs under `test/unit/`. Documented in README. No skip blocks observed in scan. |
| 18 | Fast CI (parallelize, cache, smart ordering) | 🔗 | GitHub Actions: `build_test.yml`, `codeql-analysis.yml`, `links_fail_fast.yml`, `copyright-update.yml`, `stale-branches.yml`, `stale.yml`. Jenkins: in-repo `JenkinsFile` (build/test/lint/publish/tag). See External Validation below — develop-branch `build_test.yml` is 0/3 green over last 3 runs. |
| 19 | Branch previews | ➖ | SDK library — no deployable surface to preview. |

## Tier 3 — Advanced

| # | Item | Status | Evidence / Notes |
|---|------|--------|------------------|
| 20 | Skills marketplace | ❌ | No `.claude/settings.json`, no marketplace references. |
| 21 | Specs as code | 🔗 | API spec lives at `docs.rev.ai` (external). README links to it (`https://docs.rev.ai`, `https://docs.rev.ai/api/asynchronous/reference/...`). No local OpenAPI/proto/GraphQL schema; types are hand-maintained in `src/models/`. Drift risk — captured pointer only, not validated. |
| 22 | MCP server configs | ❌ | No `.mcp.json`, no `mcpServers` references. |
| 23 | Agentic code review | 🔗 | No local config (`.coderabbit.yaml`, `.cursor/`, `claude.yml`, etc.). Phase 2 (last 10 sampled merged PRs): no check-runs or reviews from review-bot logins. Confirmed not configured. |
| 24 | Other deterministic PR guardrails | 🔗 | Locally detected: Dependabot (`.github/dependabot.yml` — daily npm + github-actions), CodeQL (`codeql-analysis.yml`), lychee link checker (`links_fail_fast.yml`), `actions/stale` (`stale.yml`), stale-branches automation (`stale-branches.yml`). See validation below. |
| 25 | Agents in the cloud | 🔗 | No `claude.yml`, `claude-code-review.yml`, Devin/Modal/Replit config. Not configured. |
| 26 | Slack + issue tracker integration | 🔗 | No PR template referencing tickets, no Linear/Jira GitHub App detected in PR review activity, no Slack MCP config. Jenkins `JenkinsFile` posts build failures to Slack channel `CFPMB0BK4` (#revai-alerts-nonprod) — that's the only Slack integration. Ticket-linkage rate strong (17/20 PRs) via branch/title convention. |

## External Validation (Phase 2)

### CI Timing (item 18)

| Workflow | Recent runs (develop) | Median | p95 | Success rate (develop) | Last run |
|---|---|---|---|---|---|
| `build_test.yml` | 3 | 645s (10m45s) | 646s | 0% (0/3) | 2026-03-12 |
| `build_test.yml` (all branches, last 20) | 20 | 42s | 646s | 50% (10/20) | 2026-05-12 |
| `codeql-analysis.yml` | 20 | 76s | 90s | 100% | 2026-05-12 |
| `links_fail_fast.yml` | 3 (develop) / 20 (all) | 14s | 20s | 100% | 2026-05-12 |
| `stale.yml` | 20 | ~10s | ~17s | 100% | 2026-05-12 |
| `stale-branches.yml` | 20 | ~12s | ~80s | 90% (18/20) | 2026-05-12 |
| `copyright-update.yml` | 1 (annual cron) | 10s | 10s | 100% | 2026-01-01 |

**Interpretation:** Lint job ~22s (target <30s ✅). Typecheck/build piggybacks on the unit-test job — under target. Total `build_test.yml` pipeline median ~42s on green Dependabot runs (Fast). But the **develop-branch** runs of `build_test.yml` are 0/3 success since the workflow's introduction — all three failures hit the integration-tests stage with cancellations or failures. Side-finding: `build_test.yml` was likely introduced/restored in the 2026-03-03 PR; before that, `develop` had no `build_test.yml` history.

### Agentic Code Review Activity (item 23)

| Tool | Status | Evidence |
|---|---|---|
| (none configured) | n/a | No `.coderabbit.yaml`, `.cursor/`, `claude.yml`, `.greptile*`, or equivalent in repo. Sampled last 10 merged PRs — no `claude[bot]`, `coderabbitai[bot]`, `greptile-apps[bot]`, `cursoragent`, or `sweep-ai[bot]` activity in reviews, check-runs, or comments. |

### PR Guardrail Firing (item 24)

| Guardrail | Status | Hit rate on sampled PRs |
|---|---|---|
| CodeQL (Analyze javascript) | Verified | 1/1 most-recent human-authored PR (#384 head SHA); also fires on schedule weekly with 100% success. |
| Dependabot (security/dependency status checks) | Verified | Appears on merge SHAs of most recent PRs (success or failure shown — failure when newer vulns surfaced). |
| Lychee link checker (`linkChecker`) | Verified | Fires on PR #384 head, 100% success on recent runs. |
| `unit-tests` matrix (Node 8/10/12/14/16/17) | Verified on recent PR | Fired on PR #384 head SHA, all 6 versions green; merge SHA showed failures/cancellations (post-merge race / Dependabot retrigger noise). |
| `lint` (Node 17) | Verified on recent PR | PR #384 head SHA green. Earlier PRs (pre-Mar 2026) have no `build_test.yml` check-runs at all. |
| `integration-tests` | Configured-but-flaky | Skipped on PR head (gated `if: github.ref == 'refs/heads/develop'`); ran post-merge on PR #384 with cancelled/failed results across the Node matrix. Belongs in **Failing-but-non-blocking guardrails** — see Residual Unknowns. |
| `actions/stale` (`stale.yml`) | Hygiene (Group B) | Runs nightly, no PR-gating. |
| `stale-branches.yml` | Hygiene | Runs daily, deletes stale `feature/*` and `fix/*` branches after 30+7d. |
| `copyright-update.yml` | Hygiene | Annual cron; succeeded 2026-01-01. |

### Cloud Agent Usage (item 25)

| Workflow | 30d runs | 7d runs | Success rate | Last invoked |
|---|---|---|---|---|
| (none) | — | — | — | — |

No `claude.yml`, `claude-code-review.yml`, or other cloud-agent workflow present.

### Issue Tracker Linkage (item 26)

- Ticket linkage rate: **17 / 20** recent merged PRs reference a ticket (REVAI-, AISDK-, DOCS-).
- Tracker inferred: **Jira-style prefixes** (REVAI-, AISDK-, DOCS-). No Linear/Jira GitHub App fingerprint in PR reviewer logins; linkage is purely by title/branch convention.
- PR template references ticket ID: **no** (no `PULL_REQUEST_TEMPLATE.md` present).
- 3 unlinked PRs in sample: #233 ("Fixing examples and exports"), #180 ("Adding support for enable_speaker_switch in streaming-client"), #224 ("Feature/revai 3853" — title casing variant of REVAI-3853, regex would still catch this as linked; conservative count is 18/20).
- Rework-suffix signal: PR #232 (`feature/REVAI-3917-followup`), #233 (`feature/REVAI-3917-followup2`), #225 (`feature/REVAI-3853-follow-up`), #226 (`feature/REVAI-3853-follow-up0version-bump`) — multiple followup PRs on same Jira ticket. Mild rework pattern worth scanning.

## Known External Systems (captured, not validated in this version)

| Category | System | Config location | Notes |
|---|---|---|---|
| Publish pipeline | Jenkins | `JenkinsFile` (in-repo) | Pipeline: build → lint/test → version check → publish to npm → tag. Posts to Slack `#revai-alerts-nonprod` (channel ID `CFPMB0BK4`) on status transitions. No URL in repo; depends on team Jenkins instance. Jenkins probe skipped — `~/.claude/jenkins-debug-config.json` not consulted (would require `/rev-llm-tools:jenkins-debug` seeding). |
| API specification | docs.rev.ai | External (https://docs.rev.ai) | Source of truth for API shape; SDK models hand-maintained in `src/models/` and drift-prone. |
| Slack alerts | Slack channel `#revai-alerts-nonprod` | `JenkinsFile` lines 128–138 | Build failure/recovery notifications only. |
| npm publish | `registry.npmjs.org` | `JenkinsFile` line 43 + `package.json` | Published as `revai-node-sdk`; current version 3.9.0. |

## Residual Unknowns

- **`develop`-branch `build_test.yml` is 0/3 green.** The three runs span 2026-03-03 → 2026-03-12 (workflow introduction + 2 follow-ups). All failed in the `integration-tests` job. Either the secrets (`BASE_URL`/`API_KEY`/`USER_EMAIL`) are stale, the integration target moved, or the matrix entries (Node 8.x specifically — EOL in 2019) are no longer supported. Recommend: triage failures, decide whether to drop the Node 8.x matrix, and confirm green-on-merge before further changes.
- **`integration-tests` job is gated to develop and currently failing every run** — qualifies as a **Failing-but-non-blocking guardrail** (it ran on the merge SHA of #384 and failed/cancelled but the merge already happened). Either restore as a blocking gate or remove.
- **Hardcoded Node version support claim in README:** README line 19 says "We support Node 8, 10, 12, 14, 16 and 17." Nodes 8/10/12/14/16/17 are all EOL (Node 17 EOL'd June 2022). CI matrix matches the README — both are stale together. Doc-drift risk: explicit version list will need re-updating each Node LTS cycle.
- **CI workflows existed before `build_test.yml` was (re)introduced in March 2026:** older PRs (#262 from 2024-06, #285 from 2024-10, etc.) show *no* check-runs from `build_test.yml`, only CodeQL + Dependabot. The actual build/test gate appears to have lived elsewhere (likely Jenkins) for an extended period — confirm whether `JenkinsFile` is the canonical gate today.
- **Jenkins build history not probed** — repo has a `JenkinsFile` but the audit skipped Jenkins API access (no seeded config). For canonical CI timing/stability, run `/rev-llm-tools:jenkins-debug` once and re-audit.
- **Dependabot runs without auto-merge** — many open Dependabot PRs (axios bumps failing CI). Suggests Dependabot is configured-but-not-shepherded; this is a maintenance burden, not a guardrail gap.
- **API model drift risk** — types in `src/models/async/`, `src/models/streaming/`, etc. are hand-curated; no codegen from an OpenAPI spec at `docs.rev.ai`. Worth flagging given the SDK's API-tracking nature.

## Detailed Findings

### Stack & shape
This is a small (~74 TS source files, ~1.5K LOC across the top 9 client modules) public Rev AI Node SDK. Two surfaces: REST async (`api-client.ts`, plus specialized clients for sentiment / topic / language-id / custom-vocab) and WebSocket streaming (`streaming-client.ts`, `BufferedDuplex.ts`). Models split under `src/models/{async,streaming,sentiment-analysis,topic-extraction,language-id}`. Tests are jest-based unit + integration.

### Doc readiness
The README is a competent API-usage tutorial — copy/paste examples for every major client method and a small "For developers" section covering local commands. What it lacks for agent readiness is **shape orientation**: there's no "this is how the codebase is organized," no "streaming-client is async/event-based, api-client is promise-based," no map of the model directory, no link to the Jenkins job or release flow. An agent dropped into this repo without context spends its first hour reading source to learn what the README author already knows.

### Tier-1 tooling cluster is empty
Items 7 through 12 are all FAIL. There is no `.claude/` directory at all — no settings, no skills, no hooks, no telemetry config. For a public SDK consumed by external developers this is defensible (the team may run agents elsewhere), but in the context of the Module 3 checklist it means an agent working *on* the SDK starts cold every session.

### CI is in mid-transition
`build_test.yml` looks recently restored (March 2026) but has never landed a green run on `develop`. The failures are concentrated in the integration-tests stage, which depends on secret config. Until those three failures are triaged, the CI surface tells a new contributor (or agent) "this repo is broken" — even though Dependabot bumps on feature branches are passing fine. This is the single highest-leverage thing to fix.

### Ticket linkage is genuinely good
17/20 (conservatively) of recent merged PRs carry a Jira/internal-tracker prefix in the branch and title — well above the threshold for "Verified" if this were a check-runs-based signal. The team has the convention; what's missing is automated enforcement (a PR template that prompts for the ticket ID, or a lint check that fails missing IDs).
