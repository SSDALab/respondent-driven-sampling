# Release Process

This page describes how versioned releases of the RDS App are created and published.

## Overview

Releases follow [semantic versioning](https://semver.org/) (`vMAJOR.MINOR.PATCH`). Each release is a GitHub Release with an auto-generated changelog.

## Creating a release

1. **Merge all changes to `main`** — only release from `main` (or the current deployment branch).

2. **Create and push a version tag:**

   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

3. **Publish on GitHub:**
   - Go to [Releases](https://github.com/uw-ssec/respondent-driven-sampling/releases) → **Draft a new release**
   - Select the tag you just pushed
   - Click **Generate release notes** — GitHub uses `.github/release.yml` to categorize changes
   - Review the notes, then click **Publish release**

## Changelog configuration

Changelog categories are configured in `.github/release.yml`. Pull requests are grouped by label:

- **New Features** — PRs labeled `enhancement`
- **Bug Fixes** — PRs labeled `bug`
- **Documentation** — PRs labeled `documentation`
- **Chores** — PRs labeled `chore`

Dependabot and pre-commit auto-update PRs are excluded from the changelog.

## Versioning guidelines

| Change type | Version bump |
|---|---|
| Breaking change (API or data model) | MAJOR (`v2.0.0`) |
| New feature (backward-compatible) | MINOR (`v1.3.0`) |
| Bug fix or patch | PATCH (`v1.2.1`) |
| Documentation only | PATCH or no release needed |
