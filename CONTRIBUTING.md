# Contributing to RDS App

Thank you for your interest in contributing. This document explains how to run the app, run tests, open issues, and submit pull requests.

## How to run the app

Follow the [Setup Instructions](README.md#setup-instructions) in the main README. You will need:

- Node.js (see repo or CI for version)
- MongoDB connection string and Twilio credentials in `server/.env`

## How to run tests

- **Server:** From the repo root, run `cd server && npm test`. For coverage: `cd server && npm run test:coverage`.
- **Client:** Run lint with `cd client && npm run lint`. The client does not currently define a test script in package.json.
- **Lint:** Run `npm run lint` in both `client/` and `server/` before pushing.

## Pre-commit

We use [pre-commit](https://pre-commit.com/) for consistent formatting and checks. Before pushing, run:

```bash
pre-commit run --all-files
```

CI also runs these hooks on push/PR to `main`.

## How to open issues

Use the [issue templates](.github/ISSUE_TEMPLATE/) when opening a new issue (bug report, feature request, documentation gap, or performance issue). Search existing issues first to avoid duplicates.

## How to submit pull requests

1. Open a new issue or comment on an existing one to discuss the change if it’s substantial.
2. Create a branch from `main` (or the target branch).
3. Make your changes and run tests and pre-commit locally.
4. Open a pull request using the [PR template](.github/pull_request_template.md). Link any related issue in the description.

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
