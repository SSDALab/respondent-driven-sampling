# `npm run generate-seeds`

**Source:** `server/src/scripts/generateSeeds.ts`

Generates seed records in MongoDB and outputs a PDF of printable QR code pages.

Run from the `server/` directory:

```bash
cd server
```

## Usage

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

## Output

- Creates `<count>` seed records in MongoDB, each with a unique 8-character survey code
- Generates a PDF at `server/src/scripts/seeds/seeds-<location>-<timestamp>.pdf`
- Each page of the PDF contains one QR code and participant-facing instructions

## PDF Contents

The generated PDF pages include:

- Campaign title (currently hardcoded for King County; customize in the script)
- Participant instructions
- QR code encoding the survey code
- Human-readable coupon code (for manual entry if QR scanning fails)
- Survey site locations and dates (hardcoded; customize in the script before your campaign)

!!! note "Customize the PDF template"
    The PDF content in `generateSeeds.ts` includes King County-specific text (site addresses, dates, contact number). Edit the `addQRCodePage` function in the script to match your campaign before generating seeds for production.
