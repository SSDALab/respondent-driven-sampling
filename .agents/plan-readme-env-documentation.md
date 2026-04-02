# Implementation Plan: `.env` documentation improvements

---
**Date:** 2026-03-24
**Author:** AI Assistant
**Status:** Draft

---

## Overview

Tester feedback: reached `npm run dev` without a `.env`, didn't know where it goes or what it needs, and asked maintainers to "send keys." The info exists in `docs/getting-started/getting-started.md` and `docs/reference/environment-variables.md`, but the **README** — where most people start — buries the env step and never shows the shape of the file.

**Goal:** From the README alone, a new user knows (1) file lives at `server/.env`, (2) how to create it from the template, (3) what keys to fill and where to get values, (4) credentials are self-service, not repo-distributed.

## What We're NOT Doing

- Shipping real credentials or a shared dev `.env`.
- Rewriting the full getting-started guide or environment-variables reference.

## Changes

Three files, all small edits:

### 1. `README.md` — fix numbering and expand env step

**Problem:** Steps all say `1.`; env step is one sentence easily missed before `npm run dev`.

**Edit:** Replace `## Setup Instructions` → `## Local Development` section (lines 13–51) with properly numbered steps and an expanded env block. Specifically:

- Fix markdown numbering: 1 Clone, 2 Set environment variables, 3 Install, 4 Start backend, 5 Start frontend, 6 Visit.
- Under step 2, add:
  - The `cp` command
  - A fenced `.env` outline with placeholder values (mirrors `server/.env.example` but with `your_...` style placeholders)
  - A note that credentials come from your own MongoDB Atlas and Twilio accounts (with link to the full [Environment Variables](https://uw-ssec.github.io/respondent-driven-sampling/reference/environment-variables/) reference)
  - Files: `README.md:13-51`

### 2. `docs/getting-started/getting-started.md` — clarify path

**Edit:** Add one sentence after the `cp` command at line 47:

> The file must live at `server/.env` (next to `package.json`), not inside `server/src/`.

- Files: `docs/getting-started/getting-started.md:47`

### 3. `server/.env.example` — self-documenting header

**Edit:** Add a two-line comment header at the top:

```bash
# Copy this file to server/.env (same directory as package.json)
# then fill in values from your MongoDB Atlas and Twilio accounts.
```

- Files: `server/.env.example:1`

## Success Criteria

### Automated

- [ ] `grep -c "server/\.env" README.md` returns ≥ 2 (path + cp command)
- [ ] `grep "\.env\.example" README.md` confirms template reference
- [ ] No real secrets in tracked files

### Manual

- [ ] Cold-read README: `.env` location and copy command are visible before the `npm run dev` step
- [ ] It's clear that credentials are obtained from Atlas/Twilio, not from the repo maintainers

## References

**Files analyzed:** `README.md`, `server/.env.example`, `server/package.json`, `docs/getting-started/getting-started.md`, `docs/reference/environment-variables.md`

---

### Version 1.0 — 2026-03-24
- Initial plan created.

### Version 1.1 — 2026-03-24
- Trimmed plan to match scope: removed Migration, Risk, Performance, Edge Case, and Testing Strategy sections (docs-only change). Folded three phases into one flat change list. Dropped `tsx --env-file` loader detail as unnecessary for the target audience.
