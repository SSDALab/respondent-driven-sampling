# CI / Workflows

The RDS App uses GitHub Actions for continuous integration and deployment. Workflow files are in `.github/workflows/`.

## Workflow Overview


| Workflow file                             | Trigger                    | Purpose                                                         |
| ----------------------------------------- | -------------------------- | --------------------------------------------------------------- |
| `quality-checks.yml`                      | Push / PR to `main`        | ESLint + TypeScript type check for client and server            |
| `pre-commit-simple.yml`                   | Push / PR to `main`        | Runs all pre-commit hooks                                       |
| `azure-webapp-deploy-rds-app-kc-test.yml` | Push to `kc-pit-2026-test` (**test**)   | Deploys to the Azure test slot (`rds-app-kc`, test slot)        |
| `azure-webapp-deploy-rds-app-kc-prod.yml` | Push to `kc-pit-2026` (**prod**)        | Deploys to the Azure production slot (`rds-app-kc`, Production) |
| `docs.yml`                                | Push to `main`, manual     | Deploys MkDocs documentation to GitHub Pages                    |


## Required Checks

The `quality-checks` and `pre-commit-simple` workflows must pass before a PR can be merged to `main`.

!!! note
    Quality checks are not currently enforced on the deployment branches (`kc-pit-2026`, `kc-pit-2026-test`) — deploys can proceed even if they fail. The goal is to clear existing lint errors and enforce these checks on all branches going forward.

### `quality-checks.yml`

Runs ESLint and TypeScript type checking (`tsc --noEmit`) for both client and server. Fix lint or type errors locally before pushing:

```bash
cd client && npm run lint
cd server && npm run lint
```

### `pre-commit-simple.yml`

Runs all hooks defined in `.pre-commit-config.yaml` (trailing whitespace, end-of-file fixes, YAML/JSON validity, and any project-specific hooks). To run the same checks locally, see [CONTRIBUTING.md](https://github.com/SSDALab/respondent-driven-sampling/blob/main/CONTRIBUTING.md).

## Deployment Workflows

Both deployment workflows follow the same steps: check out the code, install client and server dependencies, build the React client, copy `client/dist` into `server/dist`, build the server, and deploy the `server/` folder to Azure App Service using `azure/webapps-deploy`.

- **Test:** pushing to `kc-pit-2026-test` deploys to the `test` slot of the `rds-app-kc` App Service. Uses the `AZURE_PUBLISH_PROFILE_rds_app_kc_test` GitHub secret.
- **Production:** pushing to `kc-pit-2026` deploys to the `Production` slot of the `rds-app-kc` App Service. Uses the `AZURE_PUBLISH_PROFILE_rds_app_kc` GitHub secret.

See [Deployment](deployment.md) for manual deployment instructions.

## Documentation Workflow

`docs.yml` deploys the MkDocs documentation site to GitHub Pages on every push to `main` via `mkdocs gh-deploy --force`. It can also be triggered manually from the GitHub Actions tab (`workflow_dispatch`).