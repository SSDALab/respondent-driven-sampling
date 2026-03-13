# Release Process

See [Contributing → Release Process](contributing/release-process.md) for the full release guide.

## Summary

1. Merge all changes to `main`.
2. Create and push a version tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
3. On GitHub: Releases → Draft a new release → select tag → Generate release notes → Publish.

Changelog categories are configured in `.github/release.yml`. The MkDocs docs site auto-deploys on push to `main` via `.github/workflows/docs.yml`.
