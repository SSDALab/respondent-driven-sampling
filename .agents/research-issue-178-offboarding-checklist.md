# Research: Best way to take on issue 178 (Offboarding Checklist)

---
**Date:** 2026-02-20
**Author:** AI Assistant
**Status:** Active
**Related Documents:** [GitHub Issue #178](https://github.com/uw-ssec/respondent-driven-sampling/issues/178)

---

## Research Question

What is the best way to take on GitHub issue 178 (“[Docs]: Offboarding Checklist”) in this repository—what already exists for each checklist category, where it lives, and what’s missing so the issue can be tackled in a logical order.

## Executive Summary

Issue 178 is an open documentation/offboarding checklist (label: documentation, assignee: atambay37) with items in six categories: Docs Changes, Supplementary Docs/Debugging, Experimental Design Documentation, Repo level, Analysis Scripts, and Misc. The codebase already has several of these in place: LICENSE (BSD 3-Clause), CODE_OF_CONDUCT.md (Contributor Covenant 2.0), issue templates (bug, feature, documentation, performance), a PR template, quality and deployment workflows, Terraform for Azure, and docs for deployment and database migration. Gaps include: README accuracy (directory and setup are outdated vs. current TypeScript layout), no CONTRIBUTING.md (but issue templates reference it), no Read the Docs or citation/release/DOI tooling, no dedicated debugging or experimental-design docs, no post-survey analysis scripts, and issue template config that points to another repo’s discussions. The best way to take on the issue is to work through categories in order of dependency: fix README and add CONTRIBUTING first, then clean up issue templates and add any missing repo-level assets (e.g. CITATION.cff), then add supplementary and experimental-design docs, then decide on GH Actions and Terraform with the team.

## Scope

**What This Research Covers:**
- Mapping each issue-178 checklist item to current repo state (exists vs. missing).
- Where existing docs, templates, workflows, and repo-level files live.
- Recommended order and approach to implement or update each item.

**What This Research Does NOT Cover:**
- Writing the actual content for new docs (only where to add it and what to cover).
- Deciding org policy (e.g. Azure permissions, which workflows to keep).

## Key Findings

### 1. Issue 178 checklist (summary)

| Category | Items |
|----------|--------|
| **Docs Changes** | README validity, automated doc builder (Read the Docs), cleaning issue template, contribution guidelines, Code of Conduct, design docs |
| **Supplementary/Debugging** | Debugging workflow for field enumerators; database/security; debugging for developers/maintainers; reducing reliance on singular developer |
| **Experimental Design** | Scripts for defining users and experimental setup; onboarding new surveys/localities |
| **Repo level** | License, citation .cff, release, DOI, Zenodo, GH Actions cleanup, Terraform/IaC review |
| **Analysis Scripts** | Functions to assist with post-survey analysis |
| **Misc** | Org-wide permissions for Azure integration |

### 2. What already exists

**Docs Changes**

| Item | Exists | Location / notes |
|------|--------|------------------|
| README validity | Partial | `README.md` — Overview, tech stack, setup steps exist; “Directory (old)” and server layout are outdated (e.g. references `auth.js`, `surveys.js`, `routes/` with .js; actual code is TypeScript under `server/src/` with `routes/*.ts`, `database/`, etc.). Setup says “npm start” and “npm run dev” in client but client uses Vite. |
| Automated doc builder (Read the Docs) | No | No `readthedocs.yml`, no Sphinx/MkDocs config in repo. |
| Issue template cleanup | Partial | Templates exist; config points to wrong repo. `.github/ISSUE_TEMPLATE/config.yml` has `url: https://github.com/uw-ssec/project-template/discussions` — should be this repo or disabled. Bug template (`.github/ISSUE_TEMPLATE/bug_report.yml`) requires “I have read the contributing guidelines” but there is no CONTRIBUTING file. |
| Contribution guidelines | No | No `CONTRIBUTING.md`. Referenced in bug_report.yml. |
| Code of Conduct | Yes | `CODE_OF_CONDUCT.md` — Contributor Covenant 2.0, enforcement link, full text. |
| Design docs | No | No dedicated design/architecture doc; `.github/copilot-instructions.md` has some architecture/context for AI. |

**Supplementary / Debugging**

| Item | Exists | Location / notes |
|------|--------|------------------|
| Debugging workflow (field enumerators) | No | Not in docs. |
| Database, security | Partial | `docs/database-migration.md` has mongoexport/mongoimport only. No security/debugging doc. |
| Debugging workflow (developers/maintainers) | No | Not in docs. |
| Reducing reliance on singular developer | N/A | Process/org; could be addressed in CONTRIBUTING or a maintainer doc. |

**Experimental Design**

| Item | Exists | Location / notes |
|------|--------|------------------|
| Scripts for users/experimental setup | Partial | Server has scripts: `server/src/scripts/superAdminCRUD.ts`, `locationCRUD.ts`, `generateSeeds.ts`, `generateCoupons.ts`; documented in-file. No single “experimental setup” doc that ties them together. |
| Onboarding new surveys/localities | Partial | `locationCRUD.ts` and YAML import; seeds/coupons. No step-by-step “onboarding” doc. |

**Repo level**

| Item | Exists | Location / notes |
|------|--------|------------------|
| License | Yes | `LICENSE` — BSD 3-Clause, UW eScience Institute, SSEC, 2024. |
| Citation .cff | No | No `CITATION.cff` (or similar). |
| Release | Partial | `.github/release.yml` exists (changelog config, e.g. release-drafter). No clear release process doc. |
| DOI / Zenodo | No | No badge or docs; would require Zenodo/GitHub integration. |
| GH Actions | Yes | Workflows present; “which to keep / nuke” is a decision. |
| Terraform/IaC | Yes | `terraform/` with README, variables, Azure App Service; issue asks to “consider removing.” |

**Analysis Scripts**

| Item | Exists | Location / notes |
|------|--------|------------------|
| Post-survey analysis functions | No | No dedicated analysis scripts or package; survey data lives in MongoDB and is exposed via API. |

**Relevant files**

- `README.md` — Main project readme; directory “(old)” and server layout outdated; setup in 158–175.
- `docs/deployment.md` — Azure deploy (GitHub Actions + manual VSCode).
- `docs/database-migration.md` — mongoexport/mongoimport commands.
- `CODE_OF_CONDUCT.md` — Full CoC.
- `LICENSE` — BSD 3-Clause.
- `.github/ISSUE_TEMPLATE/config.yml` — Issue template picker; contact_links point to project-template.
- `.github/ISSUE_TEMPLATE/bug_report.yml` — References contributing guidelines (none exist).
- `.github/pull_request_template.md` — PR description/checklist.
- `.github/copilot-instructions.md` — Internal context for AI; some architecture.
- `.github/workflows/quality-checks.yml` — Lint + TypeScript on client & server (main/PR).
- `.github/workflows/pre-commit-simple.yml` — Runs `pre-commit run --all-files` on main/PR.
- `.github/workflows/azure-webapp-deploy-rds-app-kc-test.yml` — Deploy kc-pit-2026-test to test slot.
- `.github/workflows/azure-webapp-deploy-rds-app-kc-prod.yml` — Production deploy (similar pattern).
- `.github/release.yml` — Changelog config (excludes dependabot, pre-commit-ci).
- `.github/dependabot.yml` — Dependabot config.
- `.pre-commit-config.yaml` — Pre-commit hooks (prettier, eslint, codespell, TS build, etc.).
- `terraform/` — README, main.tf, variables.tf, tfvars.example.

### 3. Recommended order to tackle issue 178

1. **README validity** — Update “Directory (old)” to match current layout (`server/src/`, TypeScript routes, client structure); align setup steps with actual commands (e.g. client `npm run dev`, server `npm run dev` from `server/`). This unblocks “easily running on local machine.”
2. **CONTRIBUTING.md** — Add a short contributing guide (how to run, test, open issues/PRs, link to CoC). Then fix or relax the bug_report checkbox that says “I have read the contributing guidelines.”
3. **Issue template cleanup** — Update `.github/ISSUE_TEMPLATE/config.yml` contact_links to this repo’s discussions or remove/disable; optionally add a “blank” issue option if desired.
4. **Repo-level citation/release** — Add `CITATION.cff` if the project should be citable; document or automate release in README or `docs/` if needed; DOI/Zenodo is optional and can follow later.
5. **Design docs** — Add `docs/architecture.md` (or similar) summarizing app, auth, database, and deployment; can reuse/adapt content from copilot-instructions where appropriate.
6. **Read the Docs** — Optional: add `readthedocs.yml` and a simple docs source (e.g. MkDocs/Sphinx in `docs/`) and link from README.
7. **Supplementary docs** — Add `docs/debugging-enumerators.md` and `docs/debugging-developers.md` (or one doc with sections); add `docs/database-and-security.md` (or expand database-migration.md) for DB/security.
8. **Experimental design / onboarding** — Add `docs/experimental-setup.md` (or similar) that references `npm run super-admin`, `location`, `generate-seeds`, `generate-coupons`, and env/setup; add `docs/onboarding-surveys-localities.md` (or a section) for new surveys/locations.
9. **Analysis scripts** — Either add a small `analysis/` or `scripts/analysis/` with documented scripts/notebooks for post-survey steps, or document in a doc that “post-survey analysis is currently done externally” and where data/APIs live.
10. **GH Actions** — Audit workflows with the team: keep quality-checks and pre-commit; decide whether to keep both Azure deploy workflows or consolidate; document in README or `docs/ci.md`.
11. **Terraform** — Per issue: “consider removing”; if kept, ensure `terraform/README.md` and any deploy docs stay in sync.
12. **Misc (Azure permissions)** — Document in a maintainer or operations doc, or in CONTRIBUTING; no code change.

## Architecture Overview

Documentation and repo structure today:

```
Repository root
├── README.md              # Main entry; needs directory + setup update
├── LICENSE                # Present (BSD 3-Clause)
├── CODE_OF_CONDUCT.md     # Present
├── CONTRIBUTING.md        # Missing (referenced by issue template)
├── CITATION.cff           # Missing (optional)
├── docs/
│   ├── deployment.md      # Present
│   ├── database-migration.md  # Present
│   └── [architecture, debugging, experimental, etc.]  # To add
├── .github/
│   ├── ISSUE_TEMPLATE/    # Present; config points to wrong repo
│   ├── workflows/         # quality-checks, pre-commit, 2× Azure deploy
│   ├── release.yml       # Changelog config
│   └── dependabot.yml    # Present
├── .pre-commit-config.yaml  # Present
└── terraform/            # Present; issue suggests review/removal
```

## Component Interactions

- New contributors follow README → setup; outdated layout/setup causes confusion.
- Issue templates reference CONTRIBUTING and point to project-template discussions; fixing both improves onboarding.
- Workflows run on push/PR to main (and branch-specific for Azure); documenting which are required helps “cleaning up GH Actions.”
- Terraform is separate from GitHub Actions deploy; deployment doc describes both; any change to Terraform should be reflected in docs.

## Technical Decisions

- **Issue templates:** Central config in `config.yml`; individual templates in YAML; bug report assumes CONTRIBUTING exists.
- **Pre-commit:** Single config at repo root; runs in CI via `pre-commit-simple.yml`; hooks include lint, format, and TS build for client and server.
- **Docs:** Flat `docs/` with deployment and database-migration; no automated doc build in repo.

## Dependencies and Integrations

- **GitHub:** Issue/PR templates, Actions, Dependabot, release config.
- **Azure:** Deployment (Actions + optional Terraform); org permissions are policy.
- **Read the Docs (if added):** Would need config and optionally Sphinx/MkDocs.

## Edge Cases and Constraints

- README “Directory (old)” may be intentionally high-level; updating it to match current tree avoids misleading new devs.
- Changing issue template “required” checkboxes (e.g. contributing guidelines) can be done after CONTRIBUTING exists, or made optional until then.
- Terraform “consider removing” is a product/ops decision; research only notes it exists and where it’s documented.

## Open Questions

1. Whether “design docs” should live in `docs/` or in `.github/` (e.g. ADRs).
2. Preferred automated doc builder (Read the Docs + Sphinx/MkDocs vs. GitHub Pages vs. none).
3. Which GH Actions are required for this repo vs. legacy.
4. Whether to add analysis scripts in-repo or only document how to export/use data elsewhere.

## References

- Issue 178: [Docs: Offboarding Checklist](https://github.com/uw-ssec/respondent-driven-sampling/issues/178)
- Files analyzed: README.md, CODE_OF_CONDUCT.md, LICENSE, docs/deployment.md, docs/database-migration.md, .github/ISSUE_TEMPLATE/config.yml, .github/ISSUE_TEMPLATE/bug_report.yml, .github/pull_request_template.md, .github/copilot-instructions.md, .github/workflows/*.yml, .github/release.yml, .github/dependabot.yml, .pre-commit-config.yaml, terraform/README.md

---

## Best way to take on issue 178 (concise)

1. **Start with README + CONTRIBUTING** — Update README directory and setup for current codebase; add CONTRIBUTING.md and fix issue template references.
2. **Then repo-level** — Add CITATION.cff if desired; document or automate release; leave DOI/Zenodo for later.
3. **Then issue template cleanup** — Fix config.yml contact_links and optional “contributing” checkbox.
4. **Then new docs** — Design/architecture, debugging (enumerators + developers), database/security, experimental setup, onboarding surveys/localities.
5. **Then optional** — Read the Docs (or similar), analysis scripts or analysis doc.
6. **With the team** — GH Actions audit, Terraform keep/remove, Azure org permissions.

Working on branch `anshul-oss-docs` is appropriate for all documentation and repo-level file changes; use a single PR or several small PRs per category.
