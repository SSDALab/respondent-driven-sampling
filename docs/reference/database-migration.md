# Database Migration

This page covers exporting and importing MongoDB data using the `mongoexport` and `mongoimport` tools. These commands are useful for:

- Migrating data from a test cluster to production
- Backing up survey data at the end of a campaign
- Transferring data between cities or deployments

## Prerequisites

Install [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/) on your local machine. These tools are separate from the MongoDB server.

```bash
# macOS (Homebrew)
brew install mongodb-database-tools

# Ubuntu/Debian
sudo apt install mongodb-database-tools
```

## Exporting data

### Export the surveys collection

```bash
mongoexport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=surveys \
  --out <filepath>/<host>-surveys.json
```

### Export the users collection

```bash
mongoexport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=users \
  --out <filepath>/<host>-users.json
```

### Export all collections (example script)

```bash
#!/bin/bash
URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rds-your-city"
OUTPUT_DIR="./backup-$(date +%Y%m%d)"
mkdir -p "$OUTPUT_DIR"

for collection in surveys users seeds locations; do
  mongoexport --uri "$URI" --collection="$collection" --out "$OUTPUT_DIR/$collection.json"
  echo "Exported $collection"
done
```

### Export as CSV (for analysis)

```bash
mongoexport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=surveys \
  --type=csv \
  --fields=surveyCode,parentSurveyCode,childSurveyCodes,createdAt \
  --out surveys-export.csv
```

See [Post-Survey Analysis](../how-to/analysis.md) for how to use the exported CSV for RDS population estimation.

## Importing data

### Import the surveys collection

```bash
mongoimport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=surveys \
  --file <filepath>-surveys.json
```

### Import the users collection

```bash
mongoimport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=users \
  --file <filepath>-users.json
```

### Import with upsert (avoid duplicates)

If importing into a database that may already have some records, use `--mode=upsert` with `--upsertFields=_id`:

```bash
mongoimport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=surveys \
  --mode=upsert \
  --upsertFields=_id \
  --file surveys.json
```

## Notes

!!! warning "Sensitive data"
    Exported files contain survey responses and user phone numbers. Handle them as PII and delete them when no longer needed. Do not commit export files to the repository.

- The `users` collection includes phone numbers. Ensure exports are stored securely and deleted after use.
- The `surveys` collection includes all survey responses. Depending on your jurisdiction, this may be subject to data privacy regulations.
- When migrating to a new cluster, ensure `MONGO_URI` and `MONGO_DB_NAME` in `.env` are updated before restarting the app.
