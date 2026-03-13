# Implementation: MkDocs Documentation Website

---
**Date:** 2026-02-20
**Plan:** [plan-mkdocs-docs-site.md](plan-mkdocs-docs-site.md)
**Status:** Complete (automated verification pending `mkdocs build`; manual verification pending)

---

## Steps completed

### Phase 1: MkDocs infrastructure

- Created `docs/requirements.txt` (`mkdocs>=1.6`, `mkdocs-material>=9.5`)
- Created `mkdocs.yml` at repo root with Material theme, light/dark toggle, navigation tabs, search highlight, code copy; full nav
- Created `.github/workflows/docs.yml` — deploys to GitHub Pages on push to `main` via `mkdocs gh-deploy --force`
- Moved `docs/deployment.md` → `docs/how-to/deployment.md` via `git mv`
- Moved `docs/database-migration.md` → `docs/reference/database-migration.md` via `git mv`
- Created all directory structure: `docs/about/`, `docs/getting-started/`, `docs/how-to/`, `docs/reference/`, `docs/contributing/`
- Created all 21 content files (no stub-only files — all phases implemented in one pass)

### Phase 2: Home, About, Getting Started

- `docs/index.md` — Home page with pitch, "Is this for my city?" checklist, quick links grid, project status
- `docs/about/rds-methodology.md` — What RDS is, how it works, why it beats snowball sampling, how the app implements it, population estimation tools, references
- `docs/about/project-overview.md` — Project history, capabilities table, tech stack table, contributors, license/citation
- `docs/getting-started/prerequisites.md` — GitHub, MongoDB Atlas, Twilio, Azure, Node.js 22, survey planning
- `docs/getting-started/quickstart.md` — 10-step "Fork to first campaign" guide
- `docs/getting-started/configuration.md` — Env vars, survey JSON, MUI theme, app title, locations YAML format

### Phase 3: How-To content

- `docs/how-to/deployment.md` — Updated existing file: added intro paragraph, fixed "Downloan" → "Download" typo, added link to Quickstart
- `docs/how-to/experimental-setup.md` — 4-step campaign init: import locations → create super admin → generate seeds → generate coupons; pre-campaign checklist
- `docs/how-to/onboarding-localities.md` — Single and bulk location creation, YAML format with example, update/delete, how locations appear in app
- `docs/how-to/debugging.md` — Two sections: field enumerators (login, survey load, QR, referral codes) and developers (env issues, tests, known gotchas)
- `docs/how-to/database-and-security.md` — Collections overview, export/import pointer, secrets security, CORS warning, Helmet note, HUD/HIPAA compliance
- `docs/how-to/analysis.md` — Export methods, survey data structure, RDS Analyst, R package, Python approach, future plans
- `docs/how-to/ci.md` — All 5 workflows with purpose, required checks, how to add a new city's deploy workflow

### Phase 4: Reference content

- `docs/reference/architecture.md` — High-level diagram, monorepo layout, backend domain structure, API versioning, auth flow, CASL permissions, referral chain diagram, deployment architecture, path aliases
- `docs/reference/environment-variables.md` — Full table of all vars, detailed per-variable sections with format, where to get values, rotation guidance, production setup (Azure Application settings)
- `docs/reference/cli-scripts.md` — All 4 scripts: super-admin (create/list/get/update/delete/restore), location (create/import/list/get/update/delete), generate-seeds, generate-coupons
- `docs/reference/api.md` — Swagger UI pointer, base URLs, auth flow, v1/v2 versioning, main endpoint tables, error response format, CASL summary
- `docs/reference/database-migration.md` — Expanded from 14-line stub to full page: export/import with examples, CSV export, per-collection script, upsert mode, PII warning

### Phase 5: Contributing and polish

- `docs/contributing/index.md` — Mirrors CONTRIBUTING.md with MkDocs formatting
- `docs/contributing/release-process.md` — Tag, GitHub Release, changelog config, versioning guidelines
- `docs/contributing/operations.md` — Azure access, GitHub org permissions, monitoring, guidance for other cities
- `README.md` — Added docs site link at top of Overview section

---

## Files created

| File | Type |
|---|---|
| `mkdocs.yml` | Created |
| `docs/requirements.txt` | Created |
| `.github/workflows/docs.yml` | Created |
| `docs/index.md` | Created |
| `docs/about/rds-methodology.md` | Created |
| `docs/about/project-overview.md` | Created |
| `docs/getting-started/prerequisites.md` | Created |
| `docs/getting-started/quickstart.md` | Created |
| `docs/getting-started/configuration.md` | Created |
| `docs/how-to/deployment.md` | Moved + updated |
| `docs/how-to/experimental-setup.md` | Created |
| `docs/how-to/onboarding-localities.md` | Created |
| `docs/how-to/debugging.md` | Created |
| `docs/how-to/database-and-security.md` | Created |
| `docs/how-to/analysis.md` | Created |
| `docs/how-to/ci.md` | Created |
| `docs/reference/architecture.md` | Created |
| `docs/reference/environment-variables.md` | Created |
| `docs/reference/cli-scripts.md` | Created |
| `docs/reference/api.md` | Created |
| `docs/reference/database-migration.md` | Moved + expanded |
| `docs/contributing/index.md` | Created |
| `docs/contributing/release-process.md` | Created |
| `docs/contributing/operations.md` | Created |
| `README.md` | Updated (docs link added) |

**Total:** 22 new/modified files, 2 moved files (deployment.md, database-migration.md).

---

## Tests run

- **Structural check:** All 21 nav entries in `mkdocs.yml` verified against `docs/` filesystem — all `OK`.
- **README link:** `grep "uw-ssec.github.io" README.md` → link confirmed present.
- **Infra files:** `mkdocs.yml`, `docs/requirements.txt`, `.github/workflows/docs.yml` all confirmed present.
- **`mkdocs build --strict`:** Could not run locally (sandbox pip install restriction). Must be verified by user.

---

## Verification results

### Automated (completed)

- [x] File `mkdocs.yml` exists at repo root
- [x] File `docs/requirements.txt` exists
- [x] File `.github/workflows/docs.yml` exists
- [x] All 21 nav page files exist (structural check passed)
- [x] README.md contains `uw-ssec.github.io/respondent-driven-sampling`
- [ ] `pip install -r docs/requirements.txt && mkdocs build --strict` exits 0 — **pending user verification**

### Manual (pending)

- [ ] Visit `https://uw-ssec.github.io/respondent-driven-sampling/` and confirm site loads with Material theme
- [ ] Navigate: Home → Getting Started → Quickstart → step 6 (CLI scripts) → Reference/CLI Scripts page
- [ ] Search bar finds "environment variables" and returns the reference page
- [ ] Dark mode toggle works
- [ ] Mobile view shows readable nav
- [ ] All nav links resolve (no 404s)

---

## Issues encountered

1. **`pip` not in sandbox PATH** — used `pip3`; sandbox filesystem write restrictions prevented `pip3 install`. User must run `pip3 install -r docs/requirements.txt && mkdocs build --strict` locally to verify build.
2. **`git mv` for existing docs** — used shell one-liner to handle both `git mv` and fallback `mkdir + mv`. Both files moved successfully.

---

## Next steps

1. Run `pip3 install -r docs/requirements.txt && mkdocs build --strict` locally to confirm clean build.
2. Enable GitHub Pages on the repository: Settings → Pages → Source: `gh-pages` branch → `/ (root)`.
3. Push this branch to `main` (or merge PR) — the `docs.yml` workflow will auto-deploy on merge to `main`.
4. Visit `https://uw-ssec.github.io/respondent-driven-sampling/` to confirm live site.
5. Customize PDF templates in `generateSeeds.ts` and `generateCoupons.ts` with your city's campaign details before generating production seeds.

---

## Summary

The RDS App now has a complete MkDocs documentation website with Material for MkDocs theme, covering all five planned phases:

- **Infrastructure:** `mkdocs.yml`, `docs/requirements.txt`, GitHub Actions deploy workflow
- **Content:** 21 pages across Home, About, Getting Started, How-To (7 pages), Reference (5 pages), Contributing (3 pages)
- **Audience focus:** Adopter cities get a clear path — Home → Prerequisites → Quickstart → Configuration — with no dead ends
- **Auto-deploy:** Pushing to `main` triggers `docs.yml` → `mkdocs gh-deploy --force` → GitHub Pages

The only manual step needed before the live site is available is enabling GitHub Pages in the repository settings.
