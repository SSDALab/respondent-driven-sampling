# Implementation Plan: DOI and Zenodo Registration

---

**Date:** 2026-03-16
**Author:** AI Assistant
**Status:** Draft
**Related Documents:**
- [Research: Issue 178 Offboarding Checklist](research-issue-178-offboarding-checklist.md)
- [Plan: MkDocs Documentation Site](plan-mkdocs-docs-site.md)

---

## Overview

This plan describes everything required to obtain a persistent DOI for the RDS App via Zenodo and to surface that DOI throughout the repository. Zenodo is a free, CERN-hosted software archive that integrates with GitHub: once enabled, every GitHub Release is automatically archived and assigned a citable DOI (e.g., `10.5281/zenodo.XXXXXXX`).

The work splits cleanly into **programmatic changes** (file edits that code can make) and a **single, irreducible human action** (enabling the Zenodo–GitHub integration via the Zenodo web UI and creating the first release). There is no way to register a DOI via code alone — Zenodo registration requires a logged-in human to flip a toggle on zenodo.org. This plan is honest about that boundary.

**Goal:** The RDS App has a registered, persistent Zenodo DOI that appears in `CITATION.cff`, the README badge row, `docs/about/citation.md`, and the release process documentation.

**Motivation:** Issue #178 lists DOI and Zenodo as explicit repo-level requirements. A DOI makes the software formally citable in academic work (Point-in-Time count reports, RDS methodology papers), reduces reliance on a GitHub URL that can change, and aligns with Scientific Python community best practices for open research software.

## Current State Analysis

**Existing files relevant to this plan:**

- `CITATION.cff` (repo root) — CFF 1.2.0 file with authors, license, abstract, and keywords. Has **no `version`**, **no `date-released`**, and **no `doi` field**. Zenodo reads this natively (since 2022) to populate archive metadata.
- `docs/about/citation.md` — Human-readable citation page added in the MkDocs phase. References `CITATION.cff` but contains no DOI or Zenodo badge because no DOI exists yet.
- `README.md` — Has a documentation link at the top but no badge row. No Zenodo badge.
- `.github/release.yml` — Changelog exclusion config (dependabot, pre-commit). No Zenodo-related steps.
- `docs/about/operations.md` — Covers maintainer infrastructure and access. No mention of Zenodo archiving or the release process.
- `.zenodo.json` — **Does not exist.** This optional file at the repo root lets maintainers add Zenodo-specific metadata (communities, grants, related identifiers) that `CITATION.cff` does not support.

**Current Limitations:**
- The software is not archived anywhere outside GitHub; if the repo moves or is deleted, all citation URLs break.
- `CITATION.cff` is incomplete (missing `version` and `date-released`) — Zenodo will still ingest it, but the record will lack version metadata.
- No one on the team has a documented, repeatable process to publish a new Zenodo version on each release.
- The release process documentation does not mention Zenodo.

## Desired End State

**New Behavior:**
1. Every time a maintainer publishes a GitHub Release, Zenodo automatically archives it and updates the DOI record.
2. The concept DOI (stable across all versions) is embedded in `CITATION.cff`, the README, and `docs/about/citation.md`.
3. `docs/about/operations.md` documents the one-time Zenodo setup and per-release verification steps for maintainers.
4. `CITATION.cff` has complete version metadata so each Zenodo archive record is well-formed.

**Success Looks Like:**
- `https://zenodo.org/records/XXXXXXX` resolves to the RDS App record with correct authors, license, and description.
- `CITATION.cff` contains `doi: 10.5281/zenodo.XXXXXXX` and a valid `date-released`.
- README displays a Zenodo DOI badge linking to the Zenodo record.
- `docs/about/citation.md` includes the DOI in the BibTeX block and a badge.
- `docs/about/operations.md` includes the Zenodo setup and release verification steps.

## What We're NOT Doing

- **Not automating DOI registration itself** — There is no GitHub Actions workflow or API call that can register a new Zenodo repository. This requires a human to authenticate at zenodo.org. Any plan that claims otherwise is wrong.
- **Not creating a Zenodo community** — Creating or requesting membership in a Zenodo community (e.g., `uw-ssec`) requires Zenodo community admin access. This plan documents the hook point (`.zenodo.json`) but does not create the community.
- **Not adding DOI minting to the release workflow** — Zenodo triggers automatically on a GitHub Release publish; we do not need a custom workflow step. We will document this behavior but not automate it redundantly.
- **Not versioning `CITATION.cff` automatically** — Keeping `version` and `date-released` in sync with releases is a manual maintainer step; this plan documents where to update them, not a bot to do it.

**Rationale:** Keeping scope narrow ensures the programmatic work ships now without blocking on Zenodo account setup. The human-gate step is clearly called out so it doesn't get lost.

## Implementation Approach

**Technical Strategy:**

Zenodo reads `CITATION.cff` natively for author, title, license, and abstract metadata. The `.zenodo.json` file (if present) is read alongside and can add fields that CFF does not support — specifically `communities` and `related_identifiers`. We use both files:

1. Make `CITATION.cff` complete (add `version`, `date-released`).
2. Add `.zenodo.json` for community membership and the NSF grant identifier.
3. Update documentation (citation page, release process, README badge placeholder).
4. Gate on human action: enable Zenodo + publish first release.
5. After DOI is issued: fill in the actual DOI everywhere.

**Key Architectural Decisions:**

1. **Use `CITATION.cff` as the primary metadata source, `.zenodo.json` as an extension**
   - **Rationale:** `CITATION.cff` is already present, is the GitHub-native citation standard, and is what Zenodo reads first. Duplicating all metadata in `.zenodo.json` creates drift risk.
   - **Trade-offs:** `.zenodo.json` overrides `CITATION.cff` for any field it defines — so we only put Zenodo-specific fields (communities, grants) in `.zenodo.json`, not title/authors.
   - **Alternatives considered:** `.zenodo.json` only — rejected because it requires maintaining two author lists.

2. **README badge uses a concept DOI, not a version DOI**
   - **Rationale:** The concept DOI (e.g., `10.5281/zenodo.XXXXXXX`) always resolves to the latest version on Zenodo, so it stays valid across releases without README updates.
   - **Trade-offs:** Clicking the badge takes users to latest; for citing a specific version, they use the version-specific DOI from `CITATION.cff`.

3. **Phase 4 is a human + programmatic gate**
   - Phases 1–3 are fully programmatic (file changes only, no external accounts needed).
   - Phase 4 (the actual DOI registration) requires a human to take action on zenodo.org.
   - Phase 5 (filling in the DOI) is programmatic again, but depends on Phase 4 completing.

**Patterns to Follow:**
- Existing `.github/release.yml` pattern for release configuration — see `.github/release.yml:1-4`
- Existing `CITATION.cff` author list format — see `CITATION.cff:13-51`
- Existing docs badge pattern — see `docs/about/citation.md:17-18` (GitHub cite button reference, equivalent pattern for Zenodo)

## Implementation Phases

### Phase 1: Complete `CITATION.cff` metadata

**Objective:** Make `CITATION.cff` fully valid and Zenodo-ready by adding the required `version` and `date-released` fields.

**Tasks:**

- [x] Add `version` and `date-released` fields to `CITATION.cff`
  - Files: `CITATION.cff`
  - Changes: Insert after the `keywords` block:
    ```yaml
    version: "1.0.0"
    date-released: "2026-03-16"
    ```
  - Note: `version` should reflect the intended first tagged release. `date-released` is the ISO 8601 date of the most recent release (or today's date if no formal release has been published yet). Both fields are required by Zenodo for a well-formed software record.

**Dependencies:** None.

**Verification:**
- [ ] Run `cff-validator` locally or via the [CFF validator](https://github.com/citation-file-format/cff-validator): `pip install cffconvert && cffconvert --validate`
- [ ] `cffconvert` exits 0 with no validation errors.

---

### Phase 2: Add `.zenodo.json` for community and grant metadata

**Objective:** Create the `.zenodo.json` file at repo root so Zenodo can associate the archive with the UW-SSEC community and the NSF grant.

**Tasks:**

- [x] Create `.zenodo.json` at the repository root
  - Files: `.zenodo.json` (new file)
  - Changes: Create with the following content. This file adds only Zenodo-specific fields; all author/title/abstract metadata is already handled by `CITATION.cff`.
    ```json
    {
      "upload_type": "software",
      "communities": [
        { "identifier": "uw-ssec" }
      ],
      "grants": [
        { "id": "10.13039/100000001::2142964" }
      ],
      "related_identifiers": [
        {
          "identifier": "https://uw-ssec.github.io/respondent-driven-sampling/",
          "relation": "isDocumentedBy",
          "resource_type": "publication-softwaredocumentation"
        }
      ]
    }
    ```
  - **`communities`:** The identifier `uw-ssec` assumes this community exists on Zenodo. If it does not yet exist, the `communities` field can be left empty (`[]`) for the first upload — a Zenodo community can be linked to a record after the fact through the Zenodo web UI. Leave as `[]` if the community is unconfirmed.
  - **`grants`:** The `id` format for NSF awards on Zenodo is `{funder-doi}::{award-number}`. NSF's funder DOI is `10.13039/100000001`; award number is `2142964` (from README). This links the Zenodo record to the NSF grant index.
  - **`related_identifiers`:** Links the archived software to its documentation site, following [Zenodo metadata guidelines](https://developers.zenodo.org/#representation).

**Dependencies:** None (independent of Phase 1).

**Verification:**
- [ ] File `.zenodo.json` exists at repo root.
- [ ] JSON is valid: `python -m json.tool .zenodo.json` exits 0.
- [ ] Fields `upload_type`, `communities`, `grants`, `related_identifiers` are present.

---

### Phase 3: Update documentation to describe the Zenodo workflow

**Objective:** Ensure all documentation references to citation and DOI are accurate and include instructions for the one-time human-required Zenodo setup step.

**Tasks:**

- [x] Update `docs/about/operations.md` — add Zenodo section
  - Files: `docs/about/operations.md`
  - Changes: Append a new `## Zenodo Archiving` section at the end of the file:
    ```markdown
    ## Zenodo Archiving

    ### First-Time Setup (One-Time, Human-Required)

    Zenodo registration cannot be automated — it requires a repository maintainer with admin access to perform the following steps once:

    1. Go to [zenodo.org](https://zenodo.org) and sign in with GitHub.
    2. Navigate to **Account → Settings → GitHub**.
    3. Find `uw-ssec/respondent-driven-sampling` in the repository list and toggle it **On**.
    4. Publish a GitHub Release (tag: `v1.0.0` or appropriate).
    5. Zenodo archives the release and issues a DOI within 1–2 minutes.
    6. Copy the concept DOI (stable across all versions) from the Zenodo record page.
    7. Update `CITATION.cff` with `doi: 10.5281/zenodo.XXXXXXX`, `version`, and `date-released`.
    8. Update `docs/about/citation.md` with the DOI badge and BibTeX `doi` field.
    9. Update `README.md` to replace the `TODO_ZENODO_DOI` placeholder with the real DOI.
    10. Commit and push these updates to `main`.

    After first-time setup, future GitHub Releases are archived automatically.

    ### Per-Release Verification

    After publishing each subsequent GitHub Release:

    1. Wait 1–2 minutes.
    2. Check [zenodo.org/account/settings/github](https://zenodo.org/account/settings/github) to confirm the release was archived.
    3. Update `CITATION.cff` with the new `version` and `date-released`.
    4. Commit the update directly to `main`.
    ```

- [x] Update `docs/about/citation.md` — add DOI placeholder section
  - Files: `docs/about/citation.md`
  - Changes: After the `## BibTeX` section, add:
    ```markdown
    ## DOI

    A persistent DOI will be available via [Zenodo](https://zenodo.org) after the first versioned release is published.

    <!-- After Zenodo registration, replace this block with:
    [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)

    And update the BibTeX block above to include:
      doi       = {10.5281/zenodo.XXXXXXX},
    -->
    ```

- [x] Update `README.md` — add badge placeholder
  - Files: `README.md:1` (top of file, before `## Overview`)
  - Changes: Insert a badge row before the first heading:
    ```markdown
    <!-- Zenodo DOI badge — replace TODO_ZENODO_DOI with actual DOI after registration -->
    [![DOI](https://zenodo.org/badge/DOI/TODO_ZENODO_DOI.svg)](https://doi.org/TODO_ZENODO_DOI)
    [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
    ```
  - Note: The comment makes it obvious to the next person what needs replacing. The license badge is added at the same time since it requires no human action.

**Dependencies:** Phases 1 and 2 should complete first, but this phase is independent.

**Verification:**
- [ ] `docs/about/operations.md` contains the `## Zenodo Archiving` section.
- [ ] `docs/about/citation.md` contains the `## DOI` section.
- [ ] `README.md` contains the `TODO_ZENODO_DOI` badge placeholder.
- [ ] `mkdocs build` exits 0 with no warnings.

---

### Phase 4: Human gate — Enable Zenodo and publish first release

**Objective:** A repository maintainer (with GitHub admin access to `uw-ssec/respondent-driven-sampling`) performs the one-time Zenodo setup. This phase cannot be done by code.

**Required human actions:**

1. Go to [zenodo.org](https://zenodo.org), sign in with the `uw-ssec` GitHub account (or any account with push/admin rights to the repo).
2. Navigate to **Account → Settings → GitHub**.
3. Sync repositories and toggle **On** for `uw-ssec/respondent-driven-sampling`.
4. Ensure all Phase 1–3 changes are merged to `main`.
5. Create and publish a GitHub Release (tag: `v1.0.0` or appropriate).
6. Wait ~2 minutes. Zenodo archives the release and issues two DOIs:
   - **Concept DOI** (use this in README and CITATION.cff — it resolves to the latest version always): `10.5281/zenodo.XXXXXXX`
   - **Version DOI** (version-specific, for citing exact releases): also shown on the record
7. Copy the concept DOI for use in Phase 5.

**Dependencies:** Phases 1–3 must be merged to `main` before the release is published, so the archived zip includes the correct `CITATION.cff` and `.zenodo.json`.

**Verification:**
- [ ] `https://zenodo.org/records/XXXXXXX` resolves and shows the RDS App record.
- [ ] Record shows correct title, authors, license (BSD-3-Clause), and the NSF grant (if communities/grants in `.zenodo.json` are valid).
- [ ] DOI resolves: `https://doi.org/10.5281/zenodo.XXXXXXX` redirects to the Zenodo record.

---

### Phase 5: Fill in the actual DOI across all files

**Objective:** Replace all placeholders with the real concept DOI obtained in Phase 4.

**Tasks:**

- [ ] Update `CITATION.cff` with the concept DOI
  - Files: `CITATION.cff`
  - Changes: Add after `date-released`:
    ```yaml
    doi: 10.5281/zenodo.XXXXXXX
    ```
  - Replace `XXXXXXX` with the actual numeric ID from Phase 4.

- [ ] Update `README.md` — replace `TODO_ZENODO_DOI` with real DOI
  - Files: `README.md:1-3`
  - Changes: Replace both occurrences of `TODO_ZENODO_DOI` with the actual DOI (e.g., `10.5281/zenodo.1234567`). Remove the HTML comment line.

- [ ] Update `docs/about/citation.md` — replace placeholder with real badge and update BibTeX
  - Files: `docs/about/citation.md`
  - Changes:
    1. Replace the `## DOI` placeholder block with:
       ```markdown
       ## DOI

       [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
       ```
    2. Add `doi` field to the BibTeX block:
       ```bibtex
       doi       = {10.5281/zenodo.XXXXXXX},
       ```

- [ ] Update `docs/about/citation.md` — update the preferred plain-text citation with the DOI
  - Files: `docs/about/citation.md`
  - Changes: Append to the plain-text citation block: `https://doi.org/10.5281/zenodo.XXXXXXX`

**Dependencies:** Phase 4 (must have actual DOI).

**Verification:**
- [ ] `CITATION.cff` contains `doi: 10.5281/zenodo.XXXXXXX` with the real number.
- [ ] `README.md` badge links resolve (click to confirm Zenodo record loads).
- [ ] `docs/about/citation.md` BibTeX block includes `doi` field.
- [ ] `cffconvert --validate` still exits 0 after adding the `doi` field.
- [ ] `mkdocs build` exits 0.

---

## Success Criteria

### Automated Verification

These can be run without human intervention after Phases 1–3 are complete:

- [ ] `cffconvert --validate` exits 0 (`pip install cffconvert`)
- [x] `python -m json.tool .zenodo.json` exits 0 (valid JSON)
- [x] File `.zenodo.json` exists at repo root
- [x] `CITATION.cff` contains `version:` field
- [x] `CITATION.cff` contains `date-released:` field
- [x] `docs/about/operations.md` contains the string "Zenodo Archiving"
- [x] `docs/about/citation.md` contains the string "DOI"
- [ ] `mkdocs build` exits 0

After Phase 5 (DOI known):

- [ ] `CITATION.cff` contains `doi: 10.5281/zenodo.`
- [ ] `README.md` does not contain `TODO_ZENODO_DOI`
- [ ] `docs/about/citation.md` contains `zenodo.org/badge`

### Manual Verification

- [ ] `https://zenodo.org/records/XXXXXXX` loads and shows the correct record (title, authors match `CITATION.cff`)
- [ ] Clicking the DOI badge in the README navigates to the correct Zenodo record
- [ ] The Zenodo record shows license as BSD-3-Clause
- [ ] The Zenodo record lists the NSF grant (if `.zenodo.json` `grants` field was accepted)
- [ ] A second GitHub Release (after Phase 5) triggers a new version record on Zenodo automatically (confirms the integration is live, not one-time)

## Testing Strategy

**No unit or integration tests apply** — this plan is entirely configuration and documentation files.

**Manual Testing:**
- [ ] Validate `CITATION.cff` with `cffconvert --validate` locally before merging Phase 1.
- [ ] Validate `.zenodo.json` with `python -m json.tool .zenodo.json` before merging Phase 2.
- [ ] After Phase 4: check the Zenodo record manually for metadata correctness.
- [ ] After Phase 5: run `mkdocs build` to confirm no broken links.

**Test Data Requirements:**
- None — no database or application state is involved.

## Risk Assessment

1. **Risk:** The `uw-ssec` Zenodo community does not exist.
   - **Likelihood:** Medium
   - **Impact:** Low — Zenodo silently ignores unknown community identifiers and still issues the DOI. The record just won't appear in the community.
   - **Mitigation:** Use `"communities": []` in `.zenodo.json` until the community is confirmed. Zenodo community membership can be added to an existing record via the web UI at any time.

2. **Risk:** NSF grant ID format in `.zenodo.json` is incorrect and Zenodo rejects it.
   - **Likelihood:** Medium (Zenodo grant IDs are finicky)
   - **Impact:** Low — the DOI is still issued; the grant link just doesn't appear on the record.
   - **Mitigation:** If the grant field causes a validation error during upload, remove the `grants` field from `.zenodo.json`. Grant info can be added via the Zenodo web UI later.

3. **Risk:** The human Phase 4 action is deferred indefinitely.
   - **Likelihood:** Medium (requires active maintainer coordination)
   - **Impact:** Medium — the programmatic work is complete but the DOI is never issued.
   - **Mitigation:** The Phase 3 docs are explicit and self-contained so any future maintainer can follow them without additional context. The `TODO_ZENODO_DOI` placeholder in the README makes the pending work visible on every repo visit.

4. **Risk:** `CITATION.cff` version number is out of sync with the actual release tag.
   - **Likelihood:** Low (easily caught in review)
   - **Impact:** Low — Zenodo will still archive; the version label on the record will just be wrong.
   - **Mitigation:** Phase 3 release-process docs include an explicit step to update `CITATION.cff` version/date on every release.

## Edge Cases

1. **No GitHub Release has ever been published** — Zenodo only triggers on published Releases, not tags. If the repo has never published a Release (only tags), the first DOI will be for the first release published after enabling Zenodo. This is fine; the plan documents this clearly in Phase 4.

2. **Repo is private** — Zenodo requires repos to be public to archive and issue a free DOI. `uw-ssec/respondent-driven-sampling` is public, so this is not a concern.

3. **Concept DOI vs. version DOI confusion** — The concept DOI always resolves to the latest version, which can confuse users trying to cite a specific version for reproducibility. Phase 3 docs differentiate these in `docs/about/citation.md`.

## Documentation Updates

All documentation updates are the content of this plan itself:

- [ ] `CITATION.cff` — add `version`, `date-released`, and (Phase 5) `doi`
- [ ] `.zenodo.json` — new file, Zenodo-specific metadata
- [ ] `docs/about/operations.md` — add `## Zenodo Archiving` section with first-time setup and per-release steps
- [ ] `docs/about/citation.md` — add DOI section and (Phase 5) badge and BibTeX `doi` field
- [ ] `README.md` — add badge placeholder (Phase 3) and real badge (Phase 5)

---

## References

**Research Documents:**
- [Research: Issue 178 Offboarding Checklist](research-issue-178-offboarding-checklist.md)

**Files Analyzed:**
- `CITATION.cff`
- `README.md`
- `docs/about/citation.md`
- `docs/about/operations.md`
- `.github/release.yml`
- `.github/workflows/docs.yml`

**External Documentation:**
- [Zenodo GitHub Integration Guide](https://help.zenodo.org/docs/profile/linking-accounts/)
- [Zenodo Metadata Reference](https://developers.zenodo.org/#representation)
- [CFF Specification v1.2.0](https://github.com/citation-file-format/citation-file-format/blob/main/schema-guide.md)
- [cffconvert validator](https://github.com/citation-file-format/cffconvert)
- [Scientific Python: Software Citation](https://learn.scientific-python.org/development/guides/repo-review/)

---

## Review History

### Version 1.0 — 2026-03-16
- Initial plan created.

### Version 1.1 — 2026-02-20
- `docs/contributing/release-process.md` was deleted during the MkDocs documentation refactor; all references redirected to `docs/about/operations.md`.
- Phase 3 tasks rewritten to append a `## Zenodo Archiving` section (first-time setup + per-release verification) to `docs/about/operations.md`.
- Updated Desired End State, Success Criteria, Documentation Updates, and References accordingly.
