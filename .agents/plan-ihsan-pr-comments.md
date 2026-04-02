# Implementation Plan: Address Ihsan's PR #196 Review Comments

---
**Date:** 2026-03-31
**Author:** AI Assistant
**Status:** Complete (Phase 4 blocked on external input)
**Related Documents:**
- [Plan: .env documentation improvements](plan-readme-env-documentation.md)

---

## Overview

Ihsan left 20 inline comments + a "Changes Requested" review on PR #196. The changes span factual corrections (participant counts, affiliations), content updates (remove snowball sampling reference, reword descriptions, add tool mentions), structural restructuring (split CLI scripts doc, move architecture section), and several items that are **blocked on input from Ihsan or Zack**.

**Goal:** All actionable comments resolved; blocked items documented with a clear owner.

---

## What We're NOT Doing

- Resolving author order in `CITATION.cff` — **blocked, needs Zack's input**
- Adding Ihsan's LA fork to `CONTRIBUTING.md` — **blocked, needs Ihsan to share the fork URL**
- Linking to Ihsan's R functions in `database-io.md` — **blocked, needs Ihsan to share the link**
- Creating a data schema doc referenced in `analysis.md` — **blocked, Ihsan says he has it**

---

## Implementation Phases

### Phase 1 — Factual Corrections (all independent, low-risk)

**Objective:** Fix wrong numbers and wording that misrepresent the project.

- [x] **`docs/index.md:13`** — Change "3,700" → "2183"
  - Files: `docs/index.md:13`
  - Change: `approximately 3,700 unsheltered individuals` → `approximately 2,183 unsheltered individuals`

- [x] **`docs/about/project-overview.md:11`** — Change "3,700" → "2,183"
  - Files: `docs/about/project-overview.md:11`
  - Change: `approximately 3,700 individuals` → `approximately 2,183 individuals`

- [x] **`docs/about/project-overview.md:7`** — Separate Sociology and iSchool affiliations
  - Files: `docs/about/project-overview.md:7`
  - Change: Split the single bullet "University of Washington Department of Sociology and Information School (iSchool)" into two:
    - `**University of Washington, Department of Sociology** — Zack Almquist, June Yang, and Ihsan Kahveci`
    - `**University of Washington, Information School (iSchool)** — Emily Porter and capstone students`

- [x] **`README.md:81`** — Fix GPS → last survey entry
  - Files: `README.md:81`
  - Change: `Auto-populate location using GPS coordinates` → `Auto-populate location from last survey entry`

**Verification:** `git diff` shows only the above lines changed.

---

### Phase 2 — Content Corrections

**Objective:** Fix misleading descriptions, add accurate context for tooling and CI.

- [x] **`docs/about/project-overview.md:15`** — Reword "What the App Does" intro
  - Files: `docs/about/project-overview.md:15`
  - Change: Replace the current one-liner with:
    > The RDS App streamlines the implementation of respondent-driven sampling (RDS) for unsheltered point-in-time counts of people experiencing homelessness. The details of this method are described [here](https://academic.oup.com/aje/article/194/6/1524/7749332?login=true).
  - Insert this as a paragraph before the capability table.

- [x] **`docs/about/rds-methodology.md:18`** — Remove snowball sampling mention
  - **Verified:** `grep -r "snowball" docs/` returns no results. This file is already clean. No change needed.

- [x] **`docs/getting-started/getting-started.md:54`** — Update inline `.env` code block
  - Files: `docs/getting-started/getting-started.md:53-62`
  - Change: Replace the current dotenv example block with the updated format matching `server/.env.example` (already updated per prior plan), including `TWILIO_PHONE_NUMBER` and the inline comments for each variable.

- [x] **`server/.env.example`** — Add `TWILIO_PHONE_NUMBER` with documentation comments
  - Files: `server/.env.example`
  - Change: After `TWILIO_VERIFY_SID`, add:
    ```
    # TWILIO_PHONE_NUMBER
    ## Purpose: The "from" phone number for sending SMS messages. Must be a Twilio-purchased number.
    ## Format: E.164 format, e.g., "+12065551234"
    ## Location: Found in the Twilio Console under Phone Numbers > Manage > Active Numbers
    TWILIO_PHONE_NUMBER=""
    ```

- [x] **`docs/how-to/analysis.md:10`** — Add real-time dashboard mention
  - Files: `docs/how-to/analysis.md:5-11`
  - Change: Under "Current State", add a bullet or note: "An admin dashboard for tracking data collection in real time is available during the survey campaign."

- [x] **`docs/how-to/analysis.md:14`** — Add mongolite / PyMongo mention
  - Files: `docs/how-to/analysis.md:14-16`
  - Change: Under "Exporting Data", add a note: "Alternatively, the `mongolite` (R) and `PyMongo` (Python) packages can connect directly to MongoDB via the API and query data without exporting."

- [ ] **`docs/how-to/analysis.md:17`** — *(no change — see Phase 4)*
  - `docs/reference/data-schema.md` does not exist; a link would break `mkdocs build`. Blocked on Ihsan providing the schema doc.

- [x] **`docs/how-to/ci.md:12`** — Clarify "prod"/"test" labels in the workflow table
  - Files: `docs/how-to/ci.md:12-13`
  - Context: Ihsan says "we should probably rename them to 'prod' and 'test'". This is a docs PR — we are **not** renaming the git branches themselves (`kc-pit-2026`, `kc-pit-2026-test`). The change is to update the table's Purpose column to consistently say "**prod**" / "**test**" as shorthand so readers can easily identify which is which.
  - Current line 12: `| `azure-webapp-deploy-rds-app-kc-test.yml` | Push to `kc-pit-2026-test` | Deploys to the Azure test slot (`rds-app-kc`, test slot) |`
  - Current line 13: `| `azure-webapp-deploy-rds-app-kc-prod.yml` | Push to `kc-pit-2026`      | Deploys to the Azure production slot (`rds-app-kc`, Production) |`
  - Change: Add **(test)** and **(prod)** labels to the Trigger column next to the branch names for fast scanning.

- [x] **`docs/how-to/ci.md:19`** — Add note that quality checks are not currently enforced on deployment
  - Files: `docs/how-to/ci.md:17-19`
  - Change: Under "Required Checks", add a note: "**Note:** Quality checks are currently not blocking on the deployment branches (`kc-pit-2026`, `kc-pit-2026-test`). The goal is to clear existing lint errors and enforce these checks going forward."

- [ ] **`docs/how-to/analysis.md:17`** — Add placeholder text for data schema
  - Files: `docs/how-to/analysis.md:17`
  - **Note:** `docs/reference/data-schema.md` does not exist. Adding a Markdown link to it would break `mkdocs build`. This change is **moved to Phase 4** (blocked on Ihsan sharing his schema doc). No file edit here.

- [x] **`docs/reference/glossary.md:5`** — Add RDS entry
  - Files: `docs/reference/glossary.md`
  - Change: Add at the top (alphabetically): `**RDS** — Respondent-Driven Sampling. A network-based sampling method for reaching hidden populations. See [RDS Methodology](../about/rds-methodology.md).`

**Verification:** All prose changes reviewed for accuracy; links resolve.

---

### Phase 3 — Structural Changes

**Objective:** Improve doc organization per Ihsan's architectural feedback.

- [x] **`docs/how-to/setting-up-a-survey.md:82`** — Add "## 5. Update Survey Module" section
  - Files: `docs/how-to/setting-up-a-survey.md:80-81`
  - Change: Before the Pre-Campaign Checklist, insert a new section:
    ```markdown
    ## 5. Update Survey Module

    Customise the survey questionnaire for your campaign by editing `client/src/pages/Survey/utils/survey.json`. After any changes, rebuild and redeploy the client:

    ```bash
    cd client && npm run build
    ```

    See [Getting Started — Customise](../getting-started/getting-started.md#7-customise) for full customisation options.
    ```

- [x] **`docs/reference/architecture.md:134-164`** — Remove "Survey Referral Chain" section
  - Files: `docs/reference/architecture.md:134-164`
  - Change: Remove the entire "## Survey Referral Chain" section (the ASCII diagram and table at lines 134–164). This content is already covered more appropriately in `docs/about/rds-methodology.md`. Update any internal links that pointed to `architecture.md#survey-referral-chain`.

- [x] **`docs/reference/cli-scripts.md`** — Split into per-script pages, make this the index
  - Files: `docs/reference/cli-scripts.md`, `mkdocs.yml`
  - Strategy:
    1. Create four new files:
       - `docs/reference/cli-super-admin.md` — content from current `## npm run super-admin` section
       - `docs/reference/cli-location.md` — content from current `## npm run location` section
       - `docs/reference/cli-generate-seeds.md` — content from current `## npm run generate-seeds` section
       - `docs/reference/cli-generate-coupons.md` — content from current `## npm run generate-coupons` section
    2. Replace `docs/reference/cli-scripts.md` with a short index page listing all four scripts with one-line descriptions and links.
    3. Update `mkdocs.yml` nav to add the four new pages under Reference.
    4. Update any inbound links in other docs (e.g., `setting-up-a-survey.md`, `database-and-security.md`) that point to specific `cli-scripts.md#anchor` targets.

**Verification:**
- [ ] `mkdocs build` (or `mkdocs serve`) produces no broken links
- [ ] All four new CLI script pages render correctly
- [ ] Architecture page no longer has the Survey Referral Chain section

---

### Phase 4 — Blocked Items (owner action required)

These cannot be completed without external input. Track as open issues.

| Comment | File | Blocker | Owner |
|---|---|---|---|
| Author order question | `CITATION.cff:13` | Needs Zack Almquist's decision | @zalmquist |
| Add LA fork as community-solutions | `CONTRIBUTING.md:3` | Needs Ihsan's fork URL | @ihsankahveci |
| Link to R functions | `docs/reference/database-io.md:1` | Needs Ihsan to share the link | @ihsankahveci |
| Data schema doc + links | `docs/how-to/analysis.md:17`, `docs/how-to/database-and-security.md:8` | `docs/reference/data-schema.md` doesn't exist; adding a link would break `mkdocs build`. Blocked on Ihsan sharing the doc. | @ihsankahveci |

---

## Success Criteria

### Automated Verification

- [ ] `mkdocs build` completes with no warnings or broken links
- [ ] `grep -r "3,700\|3700" docs/` returns no results
- [ ] `grep -r "snowball" docs/` returns no results
- [ ] Four new CLI script files exist: `docs/reference/cli-super-admin.md`, `docs/reference/cli-location.md`, `docs/reference/cli-generate-seeds.md`, `docs/reference/cli-generate-coupons.md`
- [ ] `grep "Survey Referral Chain" docs/reference/architecture.md` returns no results

### Manual Verification

- [ ] `docs/about/project-overview.md` — participant count is 2,183; affiliations correctly separate Sociology and iSchool
- [ ] `docs/about/rds-methodology.md` — no snowball sampling references
- [ ] `docs/how-to/ci.md` — prod/test environment labels are clear; quality check enforcement note present
- [ ] `docs/reference/cli-scripts.md` — acts as a brief index linking to the four sub-pages
- [ ] `docs/reference/glossary.md` — RDS entry present and links correctly
- [ ] `README.md` — GPS reference corrected to "last survey entry"
- [ ] `server/.env.example` — `TWILIO_PHONE_NUMBER` documented

---

## References

**Files Analyzed:**
- `docs/about/project-overview.md`
- `docs/about/rds-methodology.md`
- `docs/getting-started/getting-started.md`
- `docs/how-to/analysis.md`
- `docs/how-to/ci.md`
- `docs/how-to/database-and-security.md`
- `docs/how-to/setting-up-a-survey.md`
- `docs/reference/architecture.md`
- `docs/reference/cli-scripts.md`
- `docs/reference/database-io.md`
- `docs/reference/glossary.md`
- `docs/index.md`
- `CITATION.cff`
- `CONTRIBUTING.md`
- `README.md`
- `server/.env.example`

**PR:** [#196 — Add MkDocs documentation site](https://github.com/SSDALab/respondent-driven-sampling/pull/196)

---

### Version 1.0 — 2026-03-31
- Initial plan created from Ihsan's 20 inline comments on PR #196.
