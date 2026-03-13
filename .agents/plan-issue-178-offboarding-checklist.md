# Implementation Plan: Address issue 178 (Offboarding Checklist)

---
**Date:** 2026-02-20
**Author:** AI Assistant
**Status:** Draft
**Related Documents:**
- [Research: Issue 178 Offboarding Checklist](research-issue-178-offboarding-checklist.md)
- [Plan: MkDocs Documentation Site](plan-mkdocs-docs-site.md)

---

## Overview

This plan addresses GitHub issue 178 (“[Docs]: Offboarding Checklist”) by implementing the documentation and repo-level changes needed for maintainability and contributor onboarding. The work is scoped to items that can be done without team policy decisions: updating the README for accuracy, adding CONTRIBUTING.md, fixing issue templates, adding CITATION.cff and release documentation, and creating new docs for architecture, debugging, experimental setup, onboarding, analysis, and CI. Items that require team decisions (which GH Actions to remove, whether to remove Terraform, Azure org permissions policy) are limited to documentation of current state and a short “consider” note rather than code/template removal.

**Goal:** Complete the documentation and repo-level checklist items from issue 178 so the repo is accurate, contributor-friendly, and ready for handoff.

**Motivation:** The checklist exists to reduce reliance on a single developer and make the project maintainable; accurate docs and contribution guidelines are the foundation.

## Current State Analysis

**Existing implementation:**

- `README.md:23-156` — “Directory (old)” describes client with `build/`, `static/`, and server with `routes/auth.js`, `surveys.js`, `database/` (generic), `models/Survey.js`, `utils/generateReferralCode.js`. Actual layout: client uses Vite (output `dist/`), server uses TypeScript under `server/src/` with `routes/*.ts`, `database/<domain>/mongoose/`, `database/<domain>/zod/`, no top-level `server/models/` in src.
- `README.md:158-175` — Setup says root `npm install`, then “npm start” for backend, then “cd client” and “npm run dev”. Server dev is actually `cd server && npm run dev` (tsx watch); production server is `cd server && npm run build && npm start`. Typo “neccessary” at 166.
- `CONTRIBUTING.md` — Does not exist. Referenced in `.github/ISSUE_TEMPLATE/bug_report.yml:14-16` (“I have read the contributing guidelines” required).
- `.github/ISSUE_TEMPLATE/config.yml:3-5` — `contact_links` points to `https://github.com/uw-ssec/project-template/discussions` instead of this repo.
- `docs/` — Contains only `deployment.md` and `database-migration.md`. No architecture, debugging, experimental-setup, onboarding, analysis, or CI docs.
- Repo root — No `CITATION.cff`. `LICENSE` and `CODE_OF_CONDUCT.md` exist.
- `.github/release.yml` — Exists (changelog config); no written release process for maintainers.

**Current limitations:**

- New contributors cannot run the app by following README setup (wrong commands and outdated tree).
- Issue template requires contributing guidelines that don’t exist; discussions link goes to wrong repo.
- No single place describing architecture, debugging, or how to run scripts for experimental setup.
- No citation or release process documentation.

## Desired End State

- README directory reflects current client (Vite, `dist/`) and server (`server/src/` with TypeScript routes, database modules). Setup steps use correct commands: install in both workspaces (or document root install if added), server dev `npm run dev` in server/, client dev `npm run dev` in client/, and optional production build steps.
- CONTRIBUTING.md exists and covers how to run the app, run tests, open issues/PRs, and links to Code of Conduct.
- Issue template config points to this repo’s Discussions (or contact_links removed if Discussions are disabled). Bug report “contributing guidelines” checkbox remains required now that CONTRIBUTING exists.
- CITATION.cff exists with title, authors, repository URL, and license. Release process is documented (short doc or README subsection).
- New docs: `docs/architecture.md`, `docs/debugging.md` (enumerators + developers), `docs/database-and-security.md`, `docs/experimental-setup.md`, `docs/onboarding-surveys-localities.md`, `docs/analysis.md`, `docs/ci.md`; optional `docs/operations.md` for Azure/maintainer note.
- All checklist items that are “add docs” or “fix existing docs” are done; “GH Actions cleanup” and “Terraform consider removing” are documented as team decisions with no file deletions in this plan.

## What We're NOT Doing

- **Removing or changing any GitHub Actions workflow files** — We will document what each workflow does in `docs/ci.md` and add a note that the team may audit which to keep. No edits to `.github/workflows/*.yml`.
- **Removing or modifying Terraform** — We will note in docs that Terraform is optional and the team may consider removing. No edits to `terraform/` or removal.
- **Adding MkDocs site infrastructure** — MkDocs config, GitHub Pages workflow, and site navigation are handled in a separate plan ([Plan: MkDocs Documentation Site](plan-mkdocs-docs-site.md)). This plan writes the doc content in `docs/`; the MkDocs plan wires it into a hosted site.
- **Implementing post-survey analysis code** — We will add `docs/analysis.md` describing current state (data in MongoDB, export via `docs/database-migration.md`, API usage) and that analysis is done externally. No new scripts or packages.
- **Defining org-wide Azure permissions policy** — We will add a short operations/maintainer note (e.g. in CONTRIBUTING or `docs/operations.md`) that Azure and deployment access are managed by the team; no policy content.
- **DOI/Zenodo integration** — Out of scope; CITATION.cff enables future DOI citation.

**Rationale:** Issue 178 mixes “add docs” with “consider removing” and org policy. This plan completes all additive documentation and fixes; removals and policy stay as documented decisions for the team.

## Implementation Approach

**Technical strategy:** Add and edit only documentation and repo-level config (README, CONTRIBUTING, ISSUE_TEMPLATE, CITATION.cff). All new content lives under `docs/` or repo root. Follow existing style in `docs/deployment.md` and `docs/database-migration.md` (clear headings, code blocks where needed).

**Decisions:**

1. **Design docs in `docs/`** — Use `docs/architecture.md` (and related) so all project docs stay in `docs/`; `.github/copilot-instructions.md` remains for AI context only.
2. **One debugging doc** — Single `docs/debugging.md` with sections for field enumerators and for developers/maintainers to avoid fragmentation.
3. **Single experimental/onboarding doc** — `docs/experimental-setup.md` for scripts and env; `docs/onboarding-surveys-localities.md` for adding surveys/locations (or one file with two sections if preferred; plan uses two files for clarity).
4. **Issue template contact_links** — Update URL to this repo’s Discussions: `https://github.com/uw-ssec/respondent-driven-sampling/discussions`. If Discussions are not enabled, remove the `contact_links` entry (or set to repo issues URL).

**Patterns to follow:**

- Doc structure and tone: `docs/deployment.md` (sections, steps, code blocks).
- Repo root docs: `CODE_OF_CONDUCT.md` (link from CONTRIBUTING).
- Issue template structure: existing `.github/ISSUE_TEMPLATE/*.yml` (only config and one checkbox change).

## Implementation Phases

### Phase 1: README validity and CONTRIBUTING

**Objective:** New contributors can run the app from README; CONTRIBUTING exists so the bug report template is valid.

**Tasks:**

- [x] Update README directory and setup
  - Files: `README.md:23-156`, `README.md:158-175`
  - Changes: Replace “Directory (old)” with a current tree: client with `dist/` (Vite build), `public/`, `src/` (pages, components, types, etc.), `vite.config.ts`; server with `server/src/` (index.ts, routes/*.ts, database/, middleware/, permissions/, scripts/, config/, utils/, types/). Remove references to `auth.js`, `surveys.js`, `models/Survey.js`; reference `routes/auth.ts`, `routes/surveys.ts`, `database/*/mongoose/*.model.ts`. Fix setup: (1) “Set Environment Variables” — copy `server/.env.example` to `server/.env`; fix typo “neccessary” → “necessary”. (2) “Install Packages” — install in both workspaces, e.g. `cd client && npm install` and `cd server && npm install` (or single root install if root package.json is added; otherwise keep two steps). (3) “Start Backend Server” — for local dev use `cd server && npm run dev`; optionally note production `npm run build && npm start`. (4) “Start Frontend Dev Server” — keep `cd client && npm run dev`; note app URL (e.g. Vite default port if different from 3000). (5) Add “Documentation” line linking to `docs/` (e.g. “See the [docs/](docs/) folder for deployment, database, and more.”).
- [x] Add CONTRIBUTING.md
  - Files: create `CONTRIBUTING.md` at repo root
  - Changes: Short sections: How to run the app (point to README Setup); How to run tests (client: `cd client && npm test`, server: `cd server && npm test`); How to open issues (link to issue templates) and PRs (link to PR template); Code of Conduct (link to CODE_OF_CONDUCT.md). Mention pre-commit: “We use pre-commit; run `pre-commit run --all-files` before pushing.”

**Dependencies:** None.

**Verification:**

- [ ] README setup steps, when followed verbatim, result in backend and frontend running and app reachable in browser.
- [x] File `CONTRIBUTING.md` exists and contains links to README, CODE_OF_CONDUCT, and issue/PR flow.

---

### Phase 2: Issue template cleanup

**Objective:** Issue template config points to this repo; bug report “contributing guidelines” checkbox is valid (CONTRIBUTING exists after Phase 1).

**Tasks:**

- [x] Fix contact_links in issue template config
  - Files: `.github/ISSUE_TEMPLATE/config.yml:3-5`
  - Changes: Set `url` to `https://github.com/uw-ssec/respondent-driven-sampling/discussions`. If Discussions are disabled for the repo, replace with `https://github.com/uw-ssec/respondent-driven-sampling/issues` and set `about` to “For questions, open an issue with the question label.” (or remove the contact_links block if blank issues are not desired).
- [x] No change to bug_report.yml required
  - Files: `.github/ISSUE_TEMPLATE/bug_report.yml:14-16`
  - Changes: Leave “I have read the contributing guidelines” as `required: true`; CONTRIBUTING.md now exists (Phase 1).

**Dependencies:** Phase 1 (CONTRIBUTING.md must exist).

**Verification:**

- [x] Opening a new issue shows the correct link or no misleading project-template link.
- [x] Bug report template still shows the contributing guidelines checkbox.

---

### Phase 3: Repo-level citation and release

**Objective:** Repo is citable and release process is documented.

**Tasks:**

- [x] Add CITATION.cff
  - Files: create `CITATION.cff` at repo root
  - Changes: Minimal CFF: `cff-version`, `title` (e.g. “RDS App” or “Respondent-Driven Sampling Application”), `authors` (list from README Contributors or “University of Washington SSEC”), `repository-code` (repo URL), `license` (BSD-3-Clause), `version` (e.g. 1.0.0 or “https://github.com/uw-ssec/respondent-driven-sampling”).
- [x] Document release process
  - Files: create `docs/release-process.md` or add “Releases” subsection to README
  - Changes: Short description: releases are created from tags; changelog is driven by `.github/release.yml`; maintainers create a tag (e.g. `v1.2.3`) and publish a GitHub Release. Link to `.github/release.yml` for config.

**Dependencies:** None.

**Verification:**

- [x] File `CITATION.cff` exists and parses (e.g. with `cffconvert` or manual check).
- [x] Release process is documented and points to existing release config.

---

### Phase 4: Design and architecture doc

**Objective:** Single place describing app architecture for maintainers and new contributors.

**Tasks:**

- [x] Add docs/architecture.md
  - Files: create `docs/architecture.md`
  - Changes: Sections: high-level (client React app, server Express/Node, MongoDB, Twilio auth); client structure (pages, routing, survey flow); server structure (routes, database layer, permissions, scripts); auth flow (Twilio Verify, JWT); deployment (link to docs/deployment.md). Reuse or adapt high-level points from `.github/copilot-instructions.md` where useful; keep copilot-instructions as-is for AI context.

**Dependencies:** None.

**Verification:**

- [x] File `docs/architecture.md` exists and covers client, server, auth, and deployment at a high level. (Created at `docs/reference/architecture.md` via MkDocs plan.)

---

### Phase 5: Supplementary docs (debugging, database/security)

**Objective:** Debugging workflow for enumerators and developers; database and security in one place.

**Tasks:**

- [x] Add docs/debugging.md
  - Files: create `docs/debugging.md`
  - Changes: Section “For field enumerators”: common issues (login, survey not loading, QR/referral), how to check app URL/network, who to contact. Section “For developers and maintainers”: how to run locally (link README), where to see logs (server console, browser devtools), common env issues (.env in server), running tests and lint.
- [x] Add docs/database-and-security.md
  - Files: create `docs/database-and-security.md`
  - Changes: Database: MongoDB; export/import (link to docs/database-migration.md); where survey and user data live (collections). Security: env vars (no secrets in repo), Twilio credentials, AUTH_SECRET; reference HIPAA/HUD from README; no in-depth threat model—just “what to protect and where it’s configured.”

**Dependencies:** None.

**Verification:**

- [x] `docs/debugging.md` and `docs/database-and-security.md` exist. (Created at `docs/how-to/` via MkDocs plan.)

---

### Phase 6: Experimental setup and onboarding

**Objective:** One place for “what to do before a survey campaign” and “how to add surveys/localities.”

**Tasks:**

- [x] Add docs/experimental-setup.md
  - Files: create `docs/experimental-setup.md`
  - Changes: Prerequisites (server .env, MongoDB). Scripts: `npm run super-admin` (create admin users), `npm run location` (create/import locations), `npm run generate-seeds` (seeds), `npm run generate-coupons` (coupons). Point to in-script JSDoc for each (`server/src/scripts/superAdminCRUD.ts`, etc.). Order of operations for a new campaign (e.g. locations → seeds → users).
- [x] Add docs/onboarding-surveys-localities.md
  - Files: create `docs/onboarding-surveys-localities.md`
  - Changes: Adding locations: use `npm run location` and YAML import (reference `server/src/scripts/locations.yaml` or sample); adding seeds/coupons and linking to experimental-setup; survey content (where survey JSON lives—e.g. client survey definition); no code changes, just steps and file references.

**Dependencies:** None.

**Verification:**

- [x] Both docs exist; experimental-setup references the four server scripts; onboarding references locations and survey content locations. (Created at `docs/how-to/experimental-setup.md` and `docs/how-to/onboarding-localities.md` via MkDocs plan.)

---

### Phase 7: Analysis, CI, and operations notes

**Objective:** Post-survey analysis and CI are documented; operations/maintainer note exists.

**Tasks:**

- [x] Add docs/analysis.md
  - Files: create `docs/analysis.md`
  - Changes: State that post-survey analysis is currently done outside the app. Point to: exporting data (docs/database-migration.md), survey and user collections, and any relevant API endpoints if documented. “For analysis scripts or notebooks, consider a separate repo or analysis/ folder in the future.”
- [x] Add docs/ci.md
  - Files: create `docs/ci.md`
  - Changes: List each workflow: quality-checks (lint + TS on client and server), pre-commit-simple (pre-commit run on all files), azure-webapp-deploy-rds-app-kc-test, azure-webapp-deploy-rds-app-kc-prod. One-line purpose each. Note: “The team may audit which workflows to keep; quality-checks and pre-commit are recommended for all PRs.”
- [x] Add operations/maintainer note
  - Files: either `CONTRIBUTING.md` (new subsection) or create `docs/operations.md`
  - Changes: Short note: “Azure deployment and org-wide permissions are managed by the team. For deployment access or Azure integration, contact the maintainers.” Link from CONTRIBUTING if in operations.md.

**Dependencies:** Phase 1 (CONTRIBUTING exists).

**Verification:**

- [x] `docs/analysis.md`, `docs/ci.md` exist; operations/maintainer note is in CONTRIBUTING or docs/operations.md. (Created at `docs/how-to/analysis.md`, `docs/how-to/ci.md`, `docs/contributing/operations.md` via MkDocs plan.)

---

## Success Criteria

### Automated Verification

- [x] `cd server && npm run build` succeeds (no TS/layout regressions from plan).
- [x] `cd client && npm run build` succeeds (or `npm run dev` starts).
- [x] File `CONTRIBUTING.md` exists at repo root.
- [x] File `CITATION.cff` exists at repo root.
- [x] Files exist: `docs/architecture.md`, `docs/debugging.md`, `docs/database-and-security.md`, `docs/experimental-setup.md`, `docs/onboarding-surveys-localities.md`, `docs/analysis.md`, `docs/ci.md`, and either `docs/release-process.md` or README has a “Releases” subsection.
- [x] `.github/ISSUE_TEMPLATE/config.yml` no longer points to `project-template` discussions.

### Manual Verification

- [ ] Follow README “Setup Instructions” from a clean clone (install, env, start server, start client) and open the app in the browser.
- [ ] CONTRIBUTING.md is readable and links (README, CoC, issues/PRs) work.
- [ ] New issue page shows correct Discussions/issues link (or no wrong link).
- [ ] docs/ folder has a clear set of topics (architecture, debugging, database/security, experimental setup, onboarding, analysis, CI, release) and a new contributor can find “how to run” and “how to debug.”

## Testing Strategy

- **No new code:** Only markdown, YAML config, and CFF. No unit/integration test changes.
- **Manual:** Follow README setup on a clean clone; click through doc links; open “New issue” and confirm template/config.

## Migration Strategy

Not applicable (docs and config only). No rollback beyond reverting commits. Backward compatibility: existing links to README and docs remain valid; new docs are additive.

## Risk Assessment

- **Risk:** README directory becomes outdated again as code evolves. **Likelihood:** Medium. **Impact:** Low. **Mitigation:** Keep directory high-level; point to “see client/ and server/src/ for current layout.”
- **Risk:** Discussions URL 404 if Discussions are disabled. **Likelihood:** Low. **Impact:** Low. **Mitigation:** Use issues URL or remove contact_links as specified in Phase 2.

## Edge Cases and Error Handling

N/A for documentation-only changes.

## Documentation Updates

This plan is the documentation update: README, CONTRIBUTING, issue template config, CITATION.cff, and new docs under docs/ as listed in phases.

## Open Questions

None. All scope and placement decisions are defined above.

---

## References

**Research documents:**  
- [Research: Issue 178 Offboarding Checklist](research-issue-178-offboarding-checklist.md)

**Files analyzed:**  
- `README.md`  
- `.github/ISSUE_TEMPLATE/config.yml`  
- `.github/ISSUE_TEMPLATE/bug_report.yml`  
- `docs/deployment.md`  
- `docs/database-migration.md`  
- `client/package.json`  
- `server/package.json`  
- `CODE_OF_CONDUCT.md`  
- `LICENSE`  

**External:**  
- [Issue 178](https://github.com/uw-ssec/respondent-driven-sampling/issues/178)  
- [CFF spec](https://citation-file-format.github.io/)

---

## Review History

### Version 1.0 — 2026-02-20
- Initial plan created from research-issue-178-offboarding-checklist.md

### Version 1.1 — 2026-02-20
- Updated "What We're NOT Doing" to reflect that MkDocs site infrastructure is covered in a separate plan (`plan-mkdocs-docs-site.md`). The content written by this plan (Phases 2–7) feeds directly into that site.
- Added `plan-mkdocs-docs-site.md` to Related Documents.
