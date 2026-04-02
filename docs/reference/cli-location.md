# `npm run location`

**Source:** `server/src/scripts/locationCRUD.ts`

Manages survey site (location) records.

Run all commands from the `server/` directory:

```bash
cd server
```

## Operations

### `create` — Create a location

```bash
npm run location -- create "<hubName>" <hubType> <locationType> "<address>"
```

| Argument | Options | Example |
|---|---|---|
| `hubName` | any string (unique) | `"Downtown Hub"` |
| `hubType` | `ESTABLISHMENT`, `STREET_ADDRESS`, `PREMISE`, `CHURCH`, `LOCALITY` | `ESTABLISHMENT` |
| `locationType` | `ROOFTOP`, `APPROXIMATE` | `ROOFTOP` |
| `address` | full street address | `"123 Main St, City, ST 12345"` |

**Example:**

```bash
npm run location -- create "Burien Community Center" ESTABLISHMENT ROOFTOP "14700 6th Ave SW, Burien, WA 98166"
```

---

### `import` — Bulk import from YAML

```bash
npm run location -- import path/to/locations.yaml
```

See [Adding Survey Locations](../how-to/adding-survey-locations.md) for the YAML schema.

---

### `list` — List all locations

```bash
npm run location -- list
```

---

### `get` — Get a specific location

```bash
npm run location -- get "Downtown Hub"
npm run location -- get "123 Main St, City, ST 12345"
npm run location -- get 507f1f77bcf86cd799439011
```

Accepts hub name, address, or MongoDB ObjectId.

---

### `update` — Update a location

```bash
npm run location -- update <identifier> [--hubName <name>] [--hubType <type>] [--locationType <type>] [--address <address>]
```

**Examples:**

```bash
npm run location -- update "Downtown Hub" --hubName "Central Hub" --address "456 New St, City, ST 12345"
npm run location -- update 507f1f77bcf86cd799439011 --hubType PREMISE
```

---

### `delete` — Delete a location

```bash
npm run location -- delete "Downtown Hub"
npm run location -- delete 507f1f77bcf86cd799439011
```

!!! warning
    Deleting a location that has associated seeds or users will not automatically clean up those records. Verify no active seeds or users reference the location before deleting.
