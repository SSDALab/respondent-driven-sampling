# Configuration

This page covers how to customize the RDS App for your city after completing the [Quickstart](quickstart.md).

## Environment variables

All runtime configuration is done through `server/.env`. Copy the example and edit it:

```bash
cp server/.env.example server/.env
```

See [Environment Variables reference](../reference/environment-variables.md) for the full list of variables, their types, and where to get each value.

## Survey JSON

The survey questionnaire is defined in:

```
client/src/pages/Survey/utils/survey.json
```

This JSON file defines the survey pages, questions, input types, and validation rules. Each page is an object in the top-level array; each question has at minimum a `name`, `title`, and `type`.

**To edit the survey:**

1. Open `client/src/pages/Survey/utils/survey.json`.
2. Modify, add, or remove question objects as needed.
3. Rebuild and redeploy the client:

```bash
cd client && npm run build
```

Then follow [Deployment](../how-to/deployment.md) to push the new client to production.

!!! note "Survey changes require a client redeploy"
    The survey JSON is bundled into the client at build time, not loaded dynamically. Any change to the survey requires rebuilding and redeploying the frontend.

## Branding and theming

### App theme (MUI)

The application uses [Material UI (MUI)](https://mui.com/). The theme is configured at:

```
client/src/theme/muiTheme.ts
```

Edit this file to change colors, typography, and component defaults. MUI's `createTheme` accepts a full theme spec; see [MUI Theming docs](https://mui.com/material-ui/customization/theming/).

### App title and meta

The HTML title, favicon, and other page-level meta are set in:

```
client/index.html
```

Edit `<title>` and any `<meta>` tags there to reflect your city's branding.

## Locations YAML format

Locations are the survey sites where participants come to complete surveys. You can create them one-by-one with the CLI, or bulk-import them from a YAML file.

**Example `locations.yaml`:**

```yaml
- hubName: "Downtown Community Center"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "123 Main St, Your City, ST 12345"

- hubName: "Eastside Library"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "456 Oak Ave, Your City, ST 12345"
```

**Field descriptions:**

| Field | Type | Description |
|---|---|---|
| `hubName` | string | Unique display name for the location |
| `hubType` | enum | `ESTABLISHMENT` or `PREMISE` |
| `locationType` | enum | `ROOFTOP` or `RANGE` |
| `address` | string | Full street address |

**Import:**

```bash
cd server
npm run location -- import path/to/locations.yaml
```

See [Onboarding Localities](../how-to/onboarding-localities.md) for ongoing location management and [CLI Scripts reference](../reference/cli-scripts.md) for all `npm run location` options.
