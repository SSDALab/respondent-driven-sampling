# Post-Survey Analysis

## Current state

The RDS App collects and stores survey data, but **population estimation and statistical analysis are done outside the app** using external tools. The app is responsible for:

- Collecting survey responses
- Maintaining referral chain relationships
- Storing raw data in MongoDB

Analysis (RDS estimators, network visualization, population projections) happens in a separate analysis step.

## Exporting data

### From MongoDB Atlas (recommended)

Use `mongoexport` to extract the `surveys` collection:

```bash
mongoexport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=surveys \
  --out surveys-export.json
```

For a CSV export compatible with most analysis tools:

```bash
mongoexport \
  --uri "mongodb+srv://<username>:<password>@<host>/<dbname>" \
  --collection=surveys \
  --type=csv \
  --fields=surveyCode,parentSurveyCode,childSurveyCodes,responses,createdAt \
  --out surveys-export.csv
```

See [Database Migration](../reference/database-migration.md) for the full export/import reference.

### From the admin dashboard

The admin dashboard has a download/export button for survey data. This exports a filtered view of surveys as CSV.

## Survey data structure

Each document in the `surveys` collection has the following key fields:

| Field | Type | Description |
|---|---|---|
| `surveyCode` | string | Unique code used to start this survey |
| `parentSurveyCode` | string \| null | The code that referred this participant (`null` for seeds) |
| `childSurveyCodes` | string[] | The 3 referral codes generated after this survey |
| `responses` | object | The full survey response object (question IDs and answers) |
| `locationObjectId` | ObjectId | Reference to the survey site |
| `createdAt` | Date | Timestamp of survey submission |

The referral chain is reconstructed from `parentSurveyCode` and `childSurveyCodes`. Seeds (initial recruits) have `parentSurveyCode: null`.

## RDS analysis tools

Once data is exported, use one of these tools for population estimation:

### RDS Analyst

[RDS Analyst](http://www.hpmrg.org/rds_analyst/) is a free desktop application developed by the original RDS research group. It accepts CSV data and outputs:

- Volz-Heckathorn (VH) population estimates
- Bottleneck plots
- Convergence diagnostics
- Network visualizations

**To use with this app's data:** Export surveys to CSV, then reshape the data so each row has `id`, `recruiter.id`, and `network.size` columns as required by RDS Analyst.

### RDS R package

The [`RDS` package on CRAN](https://cran.r-project.org/package=RDS) provides the same estimators in R, with more flexibility for custom analyses.

```r
install.packages("RDS")
library(RDS)
```

The package includes vignettes with worked examples for loading and analyzing RDS data.

### Python

For custom analysis, you can work directly with the exported JSON or CSV in Python using Pandas, NetworkX (for network graph construction), and igraph.

```python
import pandas as pd

surveys = pd.read_json("surveys-export.json", lines=True)
# Reconstruct referral graph: parentSurveyCode → surveyCode edges
```

## Future plans

A dedicated analysis module (in-repo scripts or a Jupyter notebook) for King County data is planned for a future release. Contributions welcome — see [Contributing](../contributing/index.md).
