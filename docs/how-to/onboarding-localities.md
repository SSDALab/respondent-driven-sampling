# Onboarding Localities

"Localities" or "locations" in the RDS App represent the physical survey sites where participants come to complete surveys. This page covers how to manage locations throughout the lifecycle of a campaign.

## Before you start

Locations must be created before:
- Generating seeds (seeds are tied to a location)
- Creating users (users are associated with a location)
- Running surveys (survey forms show a location selector)

## Adding a single location

```bash
cd server
npm run location -- create "<hubName>" <hubType> <locationType> "<address>"
```

**Example:**

```bash
npm run location -- create "Central Library" ESTABLISHMENT ROOFTOP "1000 4th Ave, Seattle, WA 98104"
```

**Field values:**

| Field | Options | Notes |
|---|---|---|
| `hubType` | `ESTABLISHMENT`, `PREMISE` | Use `ESTABLISHMENT` for most sites |
| `locationType` | `ROOFTOP`, `RANGE` | Use `ROOFTOP` for a specific address |

## Bulk-importing locations from YAML

For a new campaign with multiple sites, it is more efficient to create a YAML file and import it all at once.

**Format of `locations.yaml`:**

```yaml
- hubName: "Burien Community Center"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "14700 6th Ave SW, Burien, WA 98166"

- hubName: "Kent Senior Activity Center"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "600 E Smith St, Kent, WA 98030"

- hubName: "Renton Community Center"
  hubType: ESTABLISHMENT
  locationType: ROOFTOP
  address: "1715 Maple Valley Hwy, Renton, WA 98057"
```

**Import:**

```bash
cd server
npm run location -- import path/to/locations.yaml
```

**Verify:**

```bash
npm run location -- list
```

## Viewing a location

```bash
npm run location -- get "Central Library"
# or by address:
npm run location -- get "1000 4th Ave, Seattle, WA 98104"
# or by MongoDB ObjectId:
npm run location -- get 507f1f77bcf86cd799439011
```

## Updating a location

```bash
npm run location -- update "Central Library" --hubName "Seattle Central Library" --address "1000 4th Ave, Seattle, WA 98104"
```

Any combination of `--hubName`, `--hubType`, `--locationType`, and `--address` flags can be specified.

## Removing a location

```bash
npm run location -- delete "Central Library"
```

!!! warning "Cascading effects"
    Deleting a location does not automatically remove seeds or users associated with it. Remove those first, or verify they are no longer needed. Seeds that reference a deleted location will fail to load in the app.

## How locations appear in the app

- **Survey form:** The location name appears as a dropdown or pre-selected field when a volunteer scans a seed QR code at a site.
- **Admin dashboard:** Surveys, users, and seeds can be filtered by location.
- **Seeds:** Each seed is tied to a specific location; generating seeds for a location populates that site's referral starting point.
- **Auth middleware:** User permissions are scoped by location in the CASL permission model.

## Customizing survey content per locality

The survey questionnaire (defined in `client/src/pages/Survey/utils/survey.json`) is currently shared across all locations. Per-location survey customization is not yet a built-in feature.

To run different surveys at different sites, the current approach is to maintain separate deployments or feature-flag logic in the survey JSON. See [Configuration](../getting-started/configuration.md#survey-json) for how to edit the survey.
