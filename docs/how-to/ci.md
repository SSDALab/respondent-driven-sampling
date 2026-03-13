# CI / Workflows

The RDS App uses GitHub Actions for continuous integration and deployment. Workflow files live in `.github/workflows/`.

## Workflow overview

| Workflow file | Trigger | Purpose |
|---|---|---|
| `quality-checks.yml` | Push / PR to `main` | ESLint + TypeScript type check for client and server |
| `pre-commit-simple.yml` | Push / PR to `main` | Runs all pre-commit hooks |
| `azure-webapp-deploy-rds-app-kc-test.yml` | Push to `kc-pit-2026-test` | Deploys to Azure test slot (King County specific) |
| `azure-webapp-deploy-rds-app-kc-prod.yml` | Push to production branch | Deploys to Azure production slot (King County specific) |
| `docs.yml` | Push to `main`, manual | Deploys MkDocs documentation to GitHub Pages |

## Required checks

The `quality-checks` and `pre-commit-simple` workflows are required to pass before a PR can be merged to `main`. These run on every push and pull request targeting `main`.

### `quality-checks.yml`

Runs:
1. `cd client && npm run lint` — ESLint for the React frontend
2. `cd server && npm run lint` — ESLint for the Express backend
3. TypeScript type checking for both client and server (`tsc --noEmit`)

If this workflow fails, fix lint or type errors locally before pushing again:

```bash
cd client && npm run lint
cd server && npm run lint
```

### `pre-commit-simple.yml`

Runs all hooks defined in `.pre-commit-config.yaml`. This typically includes:

- Trailing whitespace, end-of-file fixes
- YAML, JSON validity checks
- Any project-specific hooks

To run the same checks locally:

```bash
pre-commit run --all-files
```

If pre-commit is not installed:

```bash
pip install pre-commit
pre-commit install
```

## Deployment workflows (King County specific)

The Azure deployment workflows are tailored to King County's Azure infrastructure. They are provided as reference implementations — other cities should adapt them to their own hosting environment and secret names.

**What they do:**

1. Check out the code
2. Set up Node.js
3. Build the React client (`cd client && npm run build`)
4. Copy `client/dist` → `server/dist`
5. Install server dependencies
6. Deploy `server/` to Azure App Service using `azure/webapps-deploy`

**Required GitHub secrets for the Azure workflows:**

| Secret name | Where to get it |
|---|---|
| `AZURE_PUBLISH_PROFILE` | Azure Portal → App Service → Download publish profile |

See [Deployment](deployment.md) for full Azure setup instructions.

## Documentation workflow

`docs.yml` deploys the MkDocs documentation site to GitHub Pages on every push to `main`. It runs `mkdocs gh-deploy --force`, which builds the site and pushes to the `gh-pages` branch.

The workflow can also be triggered manually from the GitHub Actions tab ("workflow_dispatch") for testing.

## Adding a new city's deployment workflow

To set up CI/CD for your city's deployment:

1. Copy `azure-webapp-deploy-rds-app-kc-test.yml` to a new file named for your city (e.g. `azure-webapp-deploy-your-city-prod.yml`).
2. Update the trigger branch, `app-name`, and any city-specific environment variables.
3. Add your Azure publish profile as a GitHub secret in your fork's repo settings.
4. Push the workflow file and trigger a first deployment.
