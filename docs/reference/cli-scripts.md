# CLI Scripts

The `server/` package includes several management scripts accessible via `npm run`. Run all commands from the `server/` directory unless noted.

```bash
cd server
```

---

## `npm run super-admin`

**Source:** `server/src/scripts/superAdminCRUD.ts`

Manages super-admin user accounts. Super admins have full access to the admin dashboard and can approve volunteer accounts.

### Operations

#### `create` — Create a super admin

```bash
npm run super-admin -- create <firstName> <lastName> <email> <phone> <locationId>
```

| Argument | Format | Example |
|---|---|---|
| `firstName` | string | `John` |
| `lastName` | string | `Doe` |
| `email` | email address | `john@example.com` |
| `phone` | `+1XXXXXXXXXX` or `XXXXXXXXXX` | `+12065551234` |
| `locationId` | MongoDB ObjectId | `507f1f77bcf86cd799439011` |

Get the `locationId` from `npm run location -- list` or `npm run location -- get "Hub Name"`.

**Example:**

```bash
npm run super-admin -- create Jane Smith jane@kcrha.org +12065551234 507f1f77bcf86cd799439011
```

---

#### `list` — List super admin accounts

```bash
npm run super-admin -- list          # Active accounts only
npm run super-admin -- list --all    # Include soft-deleted
```

---

#### `get` — Get a specific super admin

```bash
npm run super-admin -- get john@example.com
npm run super-admin -- get +12065551234
npm run super-admin -- get 507f1f77bcf86cd799439011
```

Accepts email, phone number, or MongoDB ObjectId.

---

#### `update` — Update a super admin

```bash
npm run super-admin -- update <identifier> [--firstName <name>] [--lastName <name>] [--email <email>] [--phone <phone>] [--location <locationId>] [--status <PENDING|APPROVED|REJECTED>]
```

**Examples:**

```bash
# Update email
npm run super-admin -- update john@example.com --email jane@example.com

# Change location
npm run super-admin -- update john@example.com --location 507f1f77bcf86cd799439022

# Reactivate a pending account
npm run super-admin -- update john@example.com --status APPROVED
```

---

#### `delete` — Delete a super admin

```bash
npm run super-admin -- delete john@example.com          # Soft delete (recoverable)
npm run super-admin -- delete john@example.com --hard   # Permanent delete
```

Soft-deleted accounts are hidden from `list` but remain in the database. Use `list --all` to see them. Use `restore` to recover a soft-deleted account.

---

#### `restore` — Restore a soft-deleted super admin

```bash
npm run super-admin -- restore john@example.com
npm run super-admin -- restore +12065551234
```

---

## `npm run location`

**Source:** `server/src/scripts/locationCRUD.ts`

Manages survey site (location) records.

### Operations

#### `create` — Create a location

```bash
npm run location -- create "<hubName>" <hubType> <locationType> "<address>"
```

| Argument | Options | Example |
|---|---|---|
| `hubName` | any string (unique) | `"Downtown Hub"` |
| `hubType` | `ESTABLISHMENT`, `PREMISE` | `ESTABLISHMENT` |
| `locationType` | `ROOFTOP`, `RANGE` | `ROOFTOP` |
| `address` | full street address | `"123 Main St, City, ST 12345"` |

**Example:**

```bash
npm run location -- create "Burien Community Center" ESTABLISHMENT ROOFTOP "14700 6th Ave SW, Burien, WA 98166"
```

---

#### `import` — Bulk import from YAML

```bash
npm run location -- import path/to/locations.yaml
```

See [Adding Survey Locations](../how-to/adding-survey-locations.md) for the YAML schema.

---

#### `list` — List all locations

```bash
npm run location -- list
```

---

#### `get` — Get a specific location

```bash
npm run location -- get "Downtown Hub"
npm run location -- get "123 Main St, City, ST 12345"
npm run location -- get 507f1f77bcf86cd799439011
```

Accepts hub name, address, or MongoDB ObjectId.

---

#### `update` — Update a location

```bash
npm run location -- update <identifier> [--hubName <name>] [--hubType <type>] [--locationType <type>] [--address <address>]
```

**Examples:**

```bash
npm run location -- update "Downtown Hub" --hubName "Central Hub" --address "456 New St, City, ST 12345"
npm run location -- update 507f1f77bcf86cd799439011 --hubType PREMISE
```

---

#### `delete` — Delete a location

```bash
npm run location -- delete "Downtown Hub"
npm run location -- delete 507f1f77bcf86cd799439011
```

!!! warning
    Deleting a location that has associated seeds or users will not automatically clean up those records. Verify no active seeds or users reference the location before deleting.

---

## `npm run generate-seeds`

**Source:** `server/src/scripts/generateSeeds.ts`

Generates seed records in MongoDB and outputs a PDF of printable QR code pages.

### Usage

```bash
npm run generate-seeds -- "<hubName|objectId>" <count>
```

| Argument | Description |
|---|---|
| `hubName` or `objectId` | The location to generate seeds for |
| `count` | Number of seeds to generate (positive integer) |

**Examples:**

```bash
npm run generate-seeds -- "Downtown Hub" 10
npm run generate-seeds -- 507f1f77bcf86cd799439011 25
```

### Output

- Creates `<count>` seed records in MongoDB, each with a unique 8-character survey code
- Generates a PDF at `server/src/scripts/seeds/seeds-<location>-<timestamp>.pdf`
- Each page of the PDF contains one QR code and participant-facing instructions

### PDF Contents

The generated PDF pages include:
- Campaign title (currently hardcoded for King County; customize in the script)
- Participant instructions
- QR code encoding the survey code
- Human-readable coupon code (for manual entry if QR scanning fails)
- Survey site locations and dates (hardcoded; customize in the script before your campaign)

!!! note "Customize the PDF template"
    The PDF content in `generateSeeds.ts` includes King County-specific text (site addresses, dates, contact number). Edit the `addQRCodePage` function in the script to match your campaign before generating seeds for production.

---

## `npm run generate-coupons`

**Source:** `server/src/scripts/generateCoupons.ts`

Generates a blank coupon PDF template with a placeholder box for a QR code sticker. Does **not** connect to the database or create any records — it is purely a print-ready template.

### Usage

```bash
npm run generate-coupons -- [count]
```

| Argument | Default | Description |
|---|---|---|
| `count` | 1 | Number of blank coupon pages to generate |

**Examples:**

```bash
npm run generate-coupons            # 1 coupon
npm run generate-coupons -- 50      # 50 coupons
```

### Output

Generates a PDF at `server/src/scripts/coupons/coupons-<count>-<timestamp>.pdf`. Each page has a dashed box labeled "Place QR Code Sticker Here" where staff can affix a sticker printed from the seed PDF.

!!! note "When to use this vs. generate-seeds"
    Use `generate-seeds` to create both the database records and the QR-printed pages for distribution. Use `generate-coupons` only when you need blank physical templates that staff will label manually.
