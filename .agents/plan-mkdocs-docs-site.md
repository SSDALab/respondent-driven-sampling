# Implementation Plan: MkDocs Documentation Website

---

**Date:** 2026-02-20
**Author:** AI Assistant
**Status:** Draft
**Related Documents:**

- [Research: Issue 178 Offboarding Checklist](research-issue-178-offboarding-checklist.md)
- [Plan: Issue 178 Offboarding Checklist](plan-issue-178-offboarding-checklist.md)

---

## Overview

This plan sets up a [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) documentation website for the RDS App, deployed to GitHub Pages, with content organized for the primary audience: **other cities and localities wanting to adopt the Respondent-Driven Sampling framework for their own homelessness surveys**. Secondary audiences are developers maintaining or extending the codebase and field coordinators running campaigns.

The docs site consolidates and expands the existing content in `docs/` (deployment, database migration), the README, and the copilot-instructions into a navigable, publicly hosted website. It adds new pages covering: what RDS is and why it works, a quickstart for a new city, how to configure the survey for a new locality, operational how-tos, and a full reference section.

**Goal:** A live GitHub Pages site (e.g. `https://uw-ssec.github.io/respondent-driven-sampling/`) that a city team can open on day one and follow step-by-step to fork, configure, deploy, and run their own RDS survey campaign.

**Motivation:** The app was built for King County but the methodology and codebase are general. Without documentation pitched at adopters, another city can't self-serve — they need a point-of-contact from SSEC. Good docs remove that bottleneck.

## Current State Analysis

**Existing docs content:**

- `docs/deployment.md` — Azure deploy (GitHub Actions and VSCode manual); complete but assumes SSEC context.
- `docs/database-migration.md` — `mongoexport`/`mongoimport` commands; minimal.
- `README.md` — Overview, tech stack, updated directory structure (Phase 1 of issue-178 plan done), setup instructions.
- `.github/copilot-instructions.md` — Detailed architecture, auth flow, gotchas; written for AI, reusable for docs.

**No MkDocs tooling exists:**

- No `mkdocs.yml` in repo root.
- No `docs/requirements.txt` or Python deps for docs.
- No `.github/workflows/docs.yml` workflow.
- No `index.md` or structured navigation.

**Existing docs/ structure:**

```
docs/
├── deployment.md
└── database-migration.md
```

**Target structure after this plan:**

```
docs/
├── index.md                      # Home: what is this, who is it for
├── about/
│   ├── rds-methodology.md        # What RDS is and why it works
│   └── project-overview.md       # App purpose, King County context, open source
├── getting-started/
│   ├── quickstart.md             # Fork → configure → deploy in < 1 hour
│   ├── prerequisites.md          # What you need before starting
│   └── configuration.md          # All env vars, survey JSON, branding
├── how-to/
│   ├── deployment.md             # (existing deployment.md, restructured)
│   ├── experimental-setup.md     # Before a campaign: users, locations, seeds
│   ├── onboarding-localities.md  # Adding new locations / localities
│   ├── debugging.md              # Enumerator + developer debugging
│   ├── database-and-security.md  # DB management and security
│   ├── analysis.md               # Post-survey data export and analysis
│   └── ci.md                     # GitHub Actions / CI overview
├── reference/
│   ├── architecture.md           # Technical architecture overview
│   ├── environment-variables.md  # All env vars with type and purpose
│   ├── cli-scripts.md            # npm run super-admin, location, seeds, coupons
│   └── api.md                    # REST API overview (v1 vs v2, main endpoints)
├── contributing/
│   ├── index.md                  # Contribution guide (mirrors CONTRIBUTING.md)
│   ├── release-process.md        # Release and tagging
│   └── operations.md             # Azure, org permissions maintainer notes
└── database-migration.md         # (existing; linked from how-to and reference)
mkdocs.yml                        # MkDocs config (repo root)
docs/requirements.txt             # MkDocs + material + plugins
.github/workflows/docs.yml        # Deploy to GitHub Pages on push to main
```

**Current limitations:**

- No single navigable site for adopters; all content is scattered across raw markdown files.
- No "quickstart for a new city" — the biggest adoption gap.
- No reference for env vars, CLI scripts, or API in one place.
- No explanation of the RDS methodology for non-SSEC audiences.

## Desired End State

- A live GitHub Pages site at `https://uw-ssec.github.io/respondent-driven-sampling/` auto-deployed on push to `main` via GitHub Actions.
- Navigation organized by audience task: "I want to adopt this" → Getting Started; "I'm running a campaign" → How-To; "I need to know what X does" → Reference.
- New adopter cities can self-serve: fork the repo, follow "Quickstart," configure env and survey JSON, deploy to Azure, and run a campaign — without contacting SSEC.
- All existing `docs/` markdown files are included in the site with no broken links.
- README links to the live docs site.

**Success looks like:**

- `https://uw-ssec.github.io/respondent-driven-sampling/` renders the site with Material theme.
- Navigation covers: Home, About, Getting Started, How-To, Reference, Contributing.
- Quickstart page covers fork → configure → deploy end-to-end for a new city.
- All links between pages resolve correctly.

## What We're NOT Doing

- **No API auto-generation** (e.g., Swagger docs pulled into MkDocs) — the API reference will be a hand-authored overview page. Auto-generation can be added later.
- **No versioned docs** — Single `latest` version. Versioning can be added with `mike` plugin later.
- **No custom MkDocs theme or heavy CSS customization** — Use Material for MkDocs defaults with minimal config (color scheme, repo link, logo if available).
- **No translation / i18n** — English only.
- **No video embeds or heavy media** — Text, code blocks, and diagrams (Mermaid, if used) only.
- **Not replacing CONTRIBUTING.md** — The contributing doc in MkDocs mirrors CONTRIBUTING.md; CONTRIBUTING.md stays at repo root for GitHub UI integration.
- **Not removing existing docs/ markdown files** — They are the source; MkDocs renders them. No files deleted.

**Rationale:** Keeping the first version lean ensures it ships. Advanced features (versioning, auto-API, i18n) can follow once the site is live and feedback is gathered.

## Implementation Approach

**Technical strategy:** Python-based MkDocs with the `mkdocs-material` theme, deployed to GitHub Pages via a dedicated workflow. All doc source stays in `docs/`. Config (`mkdocs.yml`) lives at the repo root. Python deps go in `docs/requirements.txt` so they're isolated from the Node.js app.

**Key architectural decisions:**

1. **Theme: Material for MkDocs**
  - Industry standard; excellent navigation, search, dark mode, mobile support.
  - Free; no lock-in; plugins ecosystem.
  - Alternatives: plain MkDocs (too minimal for an adoption guide), Sphinx (Python-focused, overkill here), Docusaurus (JS-based, adds Node dependency for docs).
2. **Hosting: GitHub Pages via `gh-pages` branch**
  - Free; zero infra to manage.
  - Deploy with `mkdocs gh-deploy` or the `actions/deploy-pages` action in a workflow.
  - Workflow triggers on push to `main`; docs always reflect the latest stable state.
  - Alternative: Read the Docs (requires RTD account and config, adds external dependency; GitHub Pages keeps everything in the repo ecosystem).
3. **Docs source location: `docs/` (existing)**
  - Existing markdown files stay in place; MkDocs reads them directly.
  - No migration needed for `deployment.md` and `database-migration.md`.
  - New pages are added alongside existing ones.
4. **Nav structure: task-oriented for adopters**
  - Top-level sections map to user goals, not file structure.
  - "Getting Started" is the first thing a new city sees after Home.
  - "Reference" is for deep-dives, not primary navigation.
5. **Python deps: `docs/requirements.txt` (not root)**
  - Keeps Python/docs tooling separate from Node.js app.
  - CI installs `pip install -r docs/requirements.txt` before building.

**Patterns to follow:**

- Existing `docs/deployment.md` style: clear headings, numbered steps, code blocks.
- Material for MkDocs [Getting Started](https://squidfunk.github.io/mkdocs-material/getting-started/) for config patterns.

## Implementation Phases

### Phase 1: MkDocs infrastructure

**Objective:** MkDocs installed, site builds locally, deploys to GitHub Pages on push to `main`.

**Tasks:**

- Add `docs/requirements.txt`
  - Files: create `docs/requirements.txt`
  - Changes:
    ```
    mkdocs>=1.6
    mkdocs-material>=9.5
    ```
    (Pin to latest stable at time of implementation. `mkdocs-material` includes `mkdocs` as a dep but explicit version floor prevents drift.)
- Add `mkdocs.yml` at repo root
  - Files: create `mkdocs.yml`
  - Changes: Minimal config:
    ```yaml
    site_name: RDS App Documentation
    site_url: https://uw-ssec.github.io/respondent-driven-sampling/
    repo_url: https://github.com/uw-ssec/respondent-driven-sampling
    repo_name: uw-ssec/respondent-driven-sampling
    docs_dir: docs
    theme:
      name: material
      palette:
        - scheme: default
          primary: indigo
          accent: indigo
          toggle:
            icon: material/brightness-7
            name: Switch to dark mode
        - scheme: slate
          primary: indigo
          accent: indigo
          toggle:
            icon: material/brightness-4
            name: Switch to light mode
      features:
        - navigation.tabs
        - navigation.sections
        - navigation.top
        - search.highlight
        - content.code.copy
    markdown_extensions:
      - admonition
      - pymdownx.details
      - pymdownx.superfences
      - pymdownx.highlight:
          anchor_linenums: true
      - pymdownx.tabbed:
          alternate_style: true
      - toc:
          permalink: true
    nav:
      - Home: index.md
      - About:
          - RDS Methodology: about/rds-methodology.md
          - Project Overview: about/project-overview.md
      - Getting Started:
          - Prerequisites: getting-started/prerequisites.md
          - Quickstart: getting-started/quickstart.md
          - Configuration: getting-started/configuration.md
      - How-To:
          - Deployment: how-to/deployment.md
          - Experimental Setup: how-to/experimental-setup.md
          - Onboarding Localities: how-to/onboarding-localities.md
          - Debugging: how-to/debugging.md
          - Database & Security: how-to/database-and-security.md
          - Post-Survey Analysis: how-to/analysis.md
          - CI / Workflows: how-to/ci.md
      - Reference:
          - Architecture: reference/architecture.md
          - Environment Variables: reference/environment-variables.md
          - CLI Scripts: reference/cli-scripts.md
          - API Overview: reference/api.md
          - Database Migration: reference/database-migration.md
      - Contributing:
          - How to Contribute: contributing/index.md
          - Release Process: contributing/release-process.md
          - Operations: contributing/operations.md
    ```
- Add `.github/workflows/docs.yml`
  - Files: create `.github/workflows/docs.yml`
  - Changes:
    ```yaml
    name: Deploy MkDocs to GitHub Pages

    on:
      push:
        branches:
          - main
      workflow_dispatch:

    permissions:
      contents: write

    jobs:
      deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0
          - uses: actions/setup-python@v5
            with:
              python-version: '3.x'
          - run: pip install -r docs/requirements.txt
          - run: mkdocs gh-deploy --force
    ```
- Create placeholder `docs/index.md`
  - Files: create `docs/index.md`
  - Changes: Brief home page: project name, one-line description, "Is this for you?" section (adopter vs. contributor), links to Getting Started and Contributing. Will be expanded in Phase 2.
- Create stub files for all pages in nav
  - Files: create all directories and stub `.md` files listed in the nav (`about/`, `getting-started/`, `how-to/`, `reference/`, `contributing/`).
  - Changes: Each stub has a `# Title` heading and one line "Coming soon" so the build doesn't fail. Stubs are replaced in subsequent phases.
- Relocate existing docs to nav locations
  - Files: `docs/deployment.md` → `docs/how-to/deployment.md`; `docs/database-migration.md` → `docs/reference/database-migration.md`.
  - Changes: Move files (git mv). Update any README or CONTRIBUTING links that pointed to the old paths.
- Verify `mkdocs build` succeeds locally
  - Files: `mkdocs.yml` (if any issues)
  - Changes: Fix any nav/file-not-found errors.

**Dependencies:** Python 3.x installed locally to test.

**Verification:**

- `pip install -r docs/requirements.txt && mkdocs build` exits 0 with no warnings.
- `mkdocs serve` renders the site at `http://127.0.0.1:8000`.
- After pushing to `main`, GitHub Actions workflow completes and site is accessible at `https://uw-ssec.github.io/respondent-driven-sampling/`.

---

### Phase 2: Home, About, and Getting Started content

**Objective:** A new city can open the site and have a clear, motivating starting point and a complete adoption quickstart path.

**Tasks:**

- Write `docs/index.md` (Home)
  - Files: `docs/index.md`
  - Changes: Sections:
    - **What is the RDS App?** — 2-3 sentence pitch: open-source app for RDS-based homelessness surveys; used by King County; designed for reuse.
    - **Is this for my city?** — Checklist: do you run Point-in-Time or RDS surveys? Do you have a MongoDB/Azure stack or are open to one? Can a developer set it up?
    - **Quick links:** Getting Started, How-To, Reference, Contributing.
    - **Project status/deployment:** mention KC PIT Count usage, link to GitHub.
- Write `docs/about/rds-methodology.md`
  - Files: `docs/about/rds-methodology.md`
  - Changes: Sections:
    - What is Respondent-Driven Sampling (definition, brief history, why it works for hidden populations).
    - How the app implements RDS (referral chain → QR codes → 3 child codes per survey → network structure).
    - Link to relevant academic references (Heckathorn et al.).
    - How population estimates are produced from RDS data (high-level; point to analysis docs).
- Write `docs/about/project-overview.md`
  - Files: `docs/about/project-overview.md`
  - Changes: Sections:
    - Project history (UW iSchool + KCRHA + SSEC).
    - App purpose: volunteer survey collection, admin oversight, QR referral, gift card distribution.
    - Tech stack table (from README).
    - Contributors list (from README).
    - License (BSD 3-Clause) and citation (link to CITATION.cff once added by issue-178 plan).
- Write `docs/getting-started/prerequisites.md`
  - Files: `docs/getting-started/prerequisites.md`
  - Changes: What a new city needs before starting:
    - A GitHub account and ability to fork the repo.
    - A MongoDB instance (e.g. MongoDB Atlas — free tier works; or Azure Cosmos DB for MongoDB API).
    - A Twilio account for OTP auth (free trial covers testing).
    - An Azure account (or any Node.js hosting) for deployment.
    - Node.js 22 for local development.
    - A brief description of the survey they want to run (to customize the survey JSON).
- Write `docs/getting-started/quickstart.md`
  - Files: `docs/getting-started/quickstart.md`
  - Changes: Step-by-step "Fork to first campaign" for a new city:
    1. Fork the repo on GitHub.
    2. Clone locally.
    3. Set up MongoDB (Atlas free tier walkthrough).
    4. Configure `server/.env` (each variable with a one-line note; link to `reference/environment-variables.md` for full detail).
    5. Install dependencies and run locally.
    6. Run the setup scripts in order: `npm run location` → `npm run super-admin` → `npm run generate-seeds` → `npm run generate-coupons` (link to `reference/cli-scripts.md`).
    7. Log in as super admin, approve the admin user, verify the app.
    8. Deploy to Azure (link to `how-to/deployment.md`).
    9. Run your first test survey end-to-end.
- Write `docs/getting-started/configuration.md`
  - Files: `docs/getting-started/configuration.md`
  - Changes: How to customize the app for a new city:
    - Environment variables (summary, link to `reference/environment-variables.md`).
    - Survey JSON customization: where the survey definition lives (`client/src/pages/Survey/utils/survey.json`), how to edit questions, pages, and logic; note that changes require a client rebuild and redeploy.
    - Branding / theming: MUI theme at `client/src/theme/muiTheme.ts`; app title in client HTML.
    - Locations YAML: format of `server/src/scripts/locations.yaml`; how to import via `npm run location`.

**Dependencies:** Phase 1 must complete (stubs exist and build succeeds).

**Verification:**

- `mkdocs build` still passes after all content is added.
- Home page has at least 3 sections with content (not stubs).
- Quickstart page has at least 9 numbered steps that a developer could follow.
- Configuration page covers survey JSON and env vars.

---

### Phase 3: How-To content

**Objective:** Operational how-tos cover everything a campaign organizer or developer needs to run and maintain the app.

**Tasks:**

- Restructure `docs/how-to/deployment.md` from existing `deployment.md`
  - Files: `docs/how-to/deployment.md` (moved in Phase 1)
  - Changes: Keep existing content; add a short intro explaining that this covers deploying to Azure (both CI and manual). Add link back to Quickstart for first-time setup. Add note on deploying to non-Azure environments (e.g. any Node.js host). Fix minor Azure link ("Downloan" → "Download" typo on line 71 of original).
- Write `docs/how-to/experimental-setup.md`
  - Files: `docs/how-to/experimental-setup.md`
  - Changes: Sections covering the scripts to run before a new campaign, in order:
    1. Prerequisites (`.env` configured, MongoDB reachable).
    2. Create locations: `cd server && npm run location -- import locations.yaml`.
    3. Create super admin: `npm run super-admin -- create ...`.
    4. Generate seeds: `npm run generate-seeds`.
    5. Generate coupons: `npm run generate-coupons`.
    Each script section: what it does, example command, what to verify. Link to `reference/cli-scripts.md` for full options.
- Write `docs/how-to/onboarding-localities.md`
  - Files: `docs/how-to/onboarding-localities.md`
  - Changes: Sections:
    - Adding a new location via `npm run location -- create ...`.
    - Bulk-importing locations from a YAML file (`locations.yaml` format with example).
    - Where location data appears in the app (auth middleware, survey location-scoping).
    - Customizing survey content for a locality (point to `getting-started/configuration.md`).
- Write `docs/how-to/debugging.md`
  - Files: `docs/how-to/debugging.md`
  - Changes: Two sections:
    - **For field enumerators:** Can't log in (approval flow, phone OTP), survey not loading (network, URL), QR not scanning, referral code issues. Contact point.
    - **For developers/maintainers:** Running locally (link README), server logs (console output, `npm run dev` watch), common env issues (`TWILIO_VERIFY_SID`, `MONGO_URI`), running tests, running lint. Known gotchas (from copilot-instructions: survey code uniqueness, SWR cache, Mongoose hooks).
- Write `docs/how-to/database-and-security.md`
  - Files: `docs/how-to/database-and-security.md`
  - Changes: Sections:
    - Database overview: MongoDB; collections (`surveys`, `users`, `seeds`, `locations`).
    - Exporting/importing data (link to `reference/database-migration.md`).
    - Security: what's in `.env` and why it must never be committed (AUTH_SECRET, Twilio, MongoDB URI). HIPAA/HUD compliance note from README. Security headers in `server/src/index.ts` — do not modify without team review. CORS setting (currently `'*'`; change before production).
- Write `docs/how-to/analysis.md`
  - Files: `docs/how-to/analysis.md`
  - Changes: Current state: analysis is done outside the app. How to export data (point to `reference/database-migration.md`). What's in the `surveys` collection (fields: surveyCode, parentSurveyCode, childSurveyCodes, responses, createdAt). RDS-specific analysis note: population estimates require RDS-specific software (e.g. RDS Analyst or the `RDS` R package); link externally. Future: a dedicated analysis folder in-repo is planned.
- Write `docs/how-to/ci.md`
  - Files: `docs/how-to/ci.md`
  - Changes: List each workflow with one-line purpose:
    - `quality-checks.yml` — ESLint + TypeScript check on client and server; runs on push/PR to `main`.
    - `pre-commit-simple.yml` — Runs all pre-commit hooks; runs on push/PR to `main`.
    - `azure-webapp-deploy-rds-app-kc-test.yml` — Deploys `kc-pit-2026-test` branch to Azure test slot.
    - `azure-webapp-deploy-rds-app-kc-prod.yml` — Deploys production branch to Azure prod slot.
    - `docs.yml` (new) — Deploys MkDocs to GitHub Pages on push to `main`.
    Team note: quality-checks and pre-commit are required for all PRs; Azure deploy workflows are King County-specific and other cities should adapt them.

**Dependencies:** Phase 1 (stubs exist and `how-to/` directory is created).

**Verification:**

- `mkdocs build` passes after all how-to pages are written.
- `docs/how-to/deployment.md` link from Quickstart resolves correctly.
- Debugging page has distinct sections for enumerators and developers.

---

### Phase 4: Reference content

**Objective:** Complete technical reference so developers and adopters can look up any detail without reading source code.

**Tasks:**

- Write `docs/reference/architecture.md`
  - Files: `docs/reference/architecture.md`
  - Changes: Sections (drawing from `.github/copilot-instructions.md`):
    - High-level: monorepo, React SPA (Vite/TypeScript/MUI) + Express API (TypeScript/MongoDB).
    - Backend architecture: domain-driven structure (`database/{domain}/mongoose/`, `zod/`, `controller.ts`). How routes call controllers. v1 vs v2 API versioning.
    - Auth flow: Twilio Verify OTP → JWT → Zustand store. CASL permissions (role + attribute-based). Approval flow (PENDING → APPROVED).
    - Survey referral chain: surveyCode / parentSurveyCode / childSurveyCodes. QR workflow.
    - Deployment architecture: static files served from Express; Azure App Service.
- Write `docs/reference/environment-variables.md`
  - Files: `docs/reference/environment-variables.md`
  - Changes: Table of all variables from `server/.env.example`:

    | Variable              | Required | Purpose                                           |
    | --------------------- | -------- | ------------------------------------------------- |
    | `NODE_ENV`            | Yes      | `development` or `production`                     |
    | `MONGO_URI`           | Yes      | MongoDB connection string                         |
    | `MONGO_DB_NAME`       | Yes      | Database name                                     |
    | `TWILIO_ACCOUNT_SID`  | Yes      | Twilio account identifier                         |
    | `TWILIO_AUTH_TOKEN`   | Yes      | Twilio API token                                  |
    | `TWILIO_VERIFY_SID`   | Yes      | Twilio Verify service SID (starts with `VA`)      |
    | `TWILIO_PHONE_NUMBER` | For SMS  | From number for outbound SMS (E.164 format)       |
    | `AUTH_SECRET`         | Yes      | JWT signing secret; keep secret                   |
    | `TIMEZONE`            | Yes      | tz database timezone (e.g. `America/Los_Angeles`) |

    Plus where each is obtained and a note on keeping them out of version control.
- Write `docs/reference/cli-scripts.md`
  - Files: `docs/reference/cli-scripts.md`
  - Changes: One section per script, each with: purpose, usage, all operations and examples (drawing from the JSDoc at the top of each script):
    - `npm run super-admin` (`server/src/scripts/superAdminCRUD.ts`): create, list, get, update, delete, restore.
    - `npm run location` (`server/src/scripts/locationCRUD.ts`): create, import, list, get, update, delete.
    - `npm run generate-seeds` (`server/src/scripts/generateSeeds.ts`): what it does.
    - `npm run generate-coupons` (`server/src/scripts/generateCoupons.ts`): what it does.
- Write `docs/reference/api.md`
  - Files: `docs/reference/api.md`
  - Changes: High-level REST API overview:
    - Base URL.
    - v1 routes (legacy, being deprecated): `/api/auth`, `/api/surveys`.
    - v2 routes (current): `/api/v2/users`, `/api/v2/surveys`, `/api/v2/seeds`, `/api/v2/locations`.
    - Auth header: `Authorization: Bearer <JWT>`.
    - Table of main v2 endpoints with method, path, and purpose.
    - Note: Swagger UI is available at `/api-docs` (from `server/src/config/swagger.ts`) for interactive exploration.
- Verify `docs/reference/database-migration.md` is in place (moved from Phase 1)
  - Files: `docs/reference/database-migration.md`
  - Changes: No content changes; verify it renders in nav.

**Dependencies:** Phase 1.

**Verification:**

- `mkdocs build` passes.
- Environment variables table covers all vars from `server/.env.example`.
- CLI scripts page covers all four scripts.
- API page mentions Swagger UI path.

---

### Phase 5: Contributing section and polish

**Objective:** Contributing section mirrors CONTRIBUTING.md; README links to docs site; all pages cross-link correctly.

**Tasks:**

- Write `docs/contributing/index.md` (mirrors CONTRIBUTING.md)
  - Files: `docs/contributing/index.md`
  - Changes: Same content as `CONTRIBUTING.md` (run app, run tests, pre-commit, open issues/PRs, link to CoC). Add a MkDocs-formatted link to Code of Conduct (GitHub URL since CODE_OF_CONDUCT.md is at root).
- Write `docs/contributing/release-process.md`
  - Files: `docs/contributing/release-process.md`
  - Changes: How releases are created: tag (`v1.x.x`), publish GitHub Release, changelog auto-generated by `.github/release.yml` (excludes dependabot/pre-commit).
- Write `docs/contributing/operations.md`
  - Files: `docs/contributing/operations.md`
  - Changes: Short note on Azure access and org-wide permissions being managed by the SSEC team. Contact info or issue link for access requests.
- Add docs site link to README.md
  - Files: `README.md` — add a line near the top after the project description
  - Changes: Add: `> **Documentation:** [uw-ssec.github.io/respondent-driven-sampling](https://uw-ssec.github.io/respondent-driven-sampling/)`
- Enable GitHub Pages on the repo
  - Files: N/A (GitHub UI action)
  - Changes: In GitHub repo Settings → Pages, set Source to "Deploy from a branch" → `gh-pages` branch → `/ (root)`. (Or use `actions/deploy-pages` approach — `mkdocs gh-deploy` creates and pushes to `gh-pages` automatically, so the branch will appear after first deploy.)
- Final link check
  - Files: all `docs/**/*.md`
  - Changes: Scan for broken internal links (e.g. old path `docs/deployment.md` after file move); fix any that reference old locations.

**Dependencies:** Phases 1–4.

**Verification:**

- `mkdocs build --strict` passes (strict mode fails on broken links and warnings).
- Live site at `https://uw-ssec.github.io/respondent-driven-sampling/` is accessible.
- README docs link resolves to live site.
- All nav sections have real content (no "Coming soon" stubs remain).

---

## Success Criteria

### Automated Verification

- `pip install -r docs/requirements.txt && mkdocs build --strict` exits 0.
- File `mkdocs.yml` exists at repo root.
- File `docs/requirements.txt` exists.
- File `.github/workflows/docs.yml` exists.
- All nav page files exist (check with `ls docs/index.md docs/about/rds-methodology.md docs/getting-started/quickstart.md docs/reference/environment-variables.md` etc.)
- README.md contains `uw-ssec.github.io/respondent-driven-sampling`.

### Manual Verification

- Visit `https://uw-ssec.github.io/respondent-driven-sampling/` and confirm site loads with Material theme.
- Navigate: Home → Getting Started → Quickstart → step 6 (CLI scripts) → links to Reference/CLI Scripts page and it resolves.
- Search bar in MkDocs site finds "environment variables" and returns the reference page.
- A person unfamiliar with the project can follow Quickstart from fork to local running app (test with a fresh team member or simulate step-by-step).
- Dark mode toggle works.
- Mobile view (or browser DevTools responsive mode) shows readable nav.
- All nav links resolve (no 404s).

## Testing Strategy

- **No code changes:** Only docs files, MkDocs config, and one GitHub Actions workflow. No unit/integration tests needed.
- **Build test:** `mkdocs build --strict` is the automated test.
- **Manual:** Follow Quickstart end-to-end; navigate all sections.

## Migration Strategy

**Moving existing docs:**

- `docs/deployment.md` → `docs/how-to/deployment.md` via `git mv`.
- `docs/database-migration.md` → `docs/reference/database-migration.md` via `git mv`.
- Update any links in README or CONTRIBUTING that pointed to old paths.

**Rollback:** GitHub Pages can be disabled in repo Settings. The `docs/` markdown files remain valid even without MkDocs; the only risk is the moved files breaking old direct GitHub links (e.g. `https://github.com/uw-ssec/.../.../docs/deployment.md`). Mitigation: add redirect stubs or just accept the link change since docs were not widely linked externally.

## Risk Assessment

- **Risk:** GitHub Pages is not enabled for the org/repo. **Likelihood:** Low (public repos can use Pages for free). **Impact:** Medium (site won't be live). **Mitigation:** Enable in repo Settings; or fall back to hosting on RTD.
- **Risk:** `mkdocs gh-deploy` requires `contents: write` permission in Actions. **Likelihood:** Low. **Impact:** Medium. **Mitigation:** Workflow already includes `permissions: contents: write`.
- **Risk:** Moving `deployment.md` and `database-migration.md` breaks existing links in README/CONTRIBUTING. **Likelihood:** Low (we control these files). **Impact:** Low. **Mitigation:** Update links in same commit.
- **Risk:** Quickstart becomes outdated as app evolves. **Likelihood:** High (long-term). **Impact:** Medium. **Mitigation:** Keep Quickstart short and link to canonical reference pages rather than duplicating content.

## Open Questions

None. All decisions are made above.

---

## References

**Research documents:**

- [Research: Issue 178 Offboarding Checklist](research-issue-178-offboarding-checklist.md)

**Related plans:**

- [Plan: Issue 178 Offboarding Checklist](plan-issue-178-offboarding-checklist.md) — Phases 2–7 of that plan write the docs content that this plan renders in MkDocs; coordinate sequencing.

**Files analyzed:**

- `README.md`
- `docs/deployment.md`
- `docs/database-migration.md`
- `.github/copilot-instructions.md`
- `server/.env.example`
- `server/src/scripts/superAdminCRUD.ts`
- `server/src/scripts/locationCRUD.ts`
- `client/src/pages/Survey/utils/survey.json` (survey content)
- `.github/workflows/*.yml`

**External documentation:**

- [Material for MkDocs Getting Started](https://squidfunk.github.io/mkdocs-material/getting-started/)
- [MkDocs nav configuration](https://www.mkdocs.org/user-guide/configuration/#nav)
- [mkdocs gh-deploy](https://www.mkdocs.org/user-guide/deploying-your-docs/)
- [RDS methodology — Heckathorn (1997)](https://doi.org/10.1177/0049124197025003001)

---

## Review History

### Version 1.0 — 2026-02-20

- Initial plan created.

