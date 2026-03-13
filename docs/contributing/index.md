# How to Contribute

Thank you for your interest in contributing to the RDS App. This page covers how to run the app, run tests, open issues, and submit pull requests.

The canonical version of this guide is also available at [CONTRIBUTING.md](https://github.com/uw-ssec/respondent-driven-sampling/blob/main/CONTRIBUTING.md) in the repository root.

## How to run the app

Follow the [Setup Instructions](../getting-started/quickstart.md) in the Quickstart guide. You will need:

- Node.js (see repo or CI for version — currently 22.x)
- MongoDB connection string and Twilio credentials in `server/.env`

## How to run tests

- **Server:** From the `server/` directory, run `npm test`. For coverage: `npm run test:coverage`.
- **Client:** Run lint with `cd client && npm run lint`. The client does not currently define a test script in `package.json`.
- **Lint:** Run `npm run lint` in both `client/` and `server/` before pushing.

## Pre-commit

We use [pre-commit](https://pre-commit.com/) for consistent formatting and checks. Before pushing, run:

```bash
pre-commit run --all-files
```

If pre-commit is not installed:

```bash
pip install pre-commit
pre-commit install
```

CI also runs these hooks on push/PR to `main`.

## How to open issues

Use the [issue templates](https://github.com/uw-ssec/respondent-driven-sampling/issues/new/choose) when opening a new issue (bug report, feature request, documentation gap, or performance issue). Search existing issues first to avoid duplicates.

## How to submit pull requests

1. Open a new issue or comment on an existing one to discuss the change if it's substantial.
2. Create a branch from `main` (or the target branch).
3. Make your changes and run tests and pre-commit locally.
4. Open a pull request using the [PR template](https://github.com/uw-ssec/respondent-driven-sampling/blob/main/.github/pull_request_template.md). Link any related issue in the description.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](https://github.com/uw-ssec/respondent-driven-sampling/blob/main/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
