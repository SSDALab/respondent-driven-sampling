# Adding Survey Locations

Locations represent the physical survey sites where participants complete surveys. They must be created before seeds, users, or surveys can reference them.

## Adding a Single Location

```bash
cd server
npm run location -- create "<hubName>" <hubType> <locationType> "<address>"
```

**Example:**

```bash
npm run location -- create "Central Library" ESTABLISHMENT ROOFTOP "1000 4th Ave, Seattle, WA 98104"
```

| Field | Options | Notes |
|---|---|---|
| `hubType` | `ESTABLISHMENT`, `STREET_ADDRESS`, `PREMISE`, `CHURCH`, `LOCALITY` | Use `ESTABLISHMENT` for most sites |
| `locationType` | `ROOFTOP`, `APPROXIMATE` | Use `ROOFTOP` for a specific address |

## Bulk Import from YAML

```bash
cd server
npm run location -- import path/to/locations.yaml
```

**YAML format:**

```yaml
- hubName: "Burien Community Center"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "14700 6th Ave SW, Burien, WA 98166"

- hubName: "Kent Senior Activity Center"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "600 E Smith St, Kent, WA 98030"
```

Each entry requires `hubName`, `hubType`, `locationType`, and `address`.

**Verify:**

```bash
npm run location -- list
```

## Viewing a Location

```bash
npm run location -- get "Central Library"
# or by address:
npm run location -- get "1000 4th Ave, Seattle, WA 98104"
# or by MongoDB ObjectId:
npm run location -- get 507f1f77bcf86cd799439011
```

## Updating a Location

```bash
npm run location -- update "Central Library" --hubName "Seattle Central Library" --address "1000 4th Ave, Seattle, WA 98104"
```

Any combination of `--hubName`, `--hubType`, `--locationType`, and `--address` flags may be specified.

## Removing a Location

```bash
npm run location -- delete "Central Library"
```

!!! warning "Cascading effects"
    Deleting a location does not automatically remove associated seeds or users. Remove those first, or verify they are no longer needed. Seeds referencing a deleted location will fail to load in the app.

## How Locations Appear in the App

- **Survey form:** The location name is displayed as a dropdown or pre-selected field when a volunteer scans a seed QR code.
- **Admin dashboard:** Surveys, users, and seeds can be filtered by location.
- **Seeds:** Each seed is tied to a specific location; seeds generated for a location define that site's referral starting point.
- **Auth middleware:** User permissions are scoped by location in the CASL permission model.

## Per-Locality Survey Customization

The survey questionnaire (`client/src/pages/Survey/utils/survey.json`) is shared across all locations. Per-location survey customization is not a built-in feature. To run different surveys at different sites, the current approach is to maintain separate deployments or implement feature-flag logic within the survey JSON. See [Getting Started](../getting-started/getting-started.md#7-customise) for how to edit the survey.
