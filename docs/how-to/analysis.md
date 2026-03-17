# Post-Survey Analysis

## Current State

The RDS App collects and stores survey data. **Population estimation and statistical analysis are performed outside the app** using external tools. The app is responsible for:

- Collecting survey responses
- Maintaining referral chain relationships
- Storing raw data in MongoDB

Analysis (RDS estimators, network visualization, population projections) is a separate post-collection step.

## Exporting Data

Survey data can be exported via `mongoexport` (JSON or CSV). See [Database I/O](../reference/database-io.md) for full export commands and examples.

## Survey Data Structure

Each document in the `surveys` collection has the following key fields:


| Field              | Type          | Description                                                |
| ------------------ | ------------- | ---------------------------------------------------------- |
| `surveyCode`       | string        | Unique code used to start this survey                      |
| `parentSurveyCode` | string | null | The code that referred this participant (`null` for seeds) |
| `childSurveyCodes` | string[]      | The 3 referral codes generated after this survey           |
| `responses`        | object        | The full survey response object (question IDs and answers) |
| `locationObjectId` | ObjectId      | Reference to the survey site                               |
| `createdAt`        | Date          | Timestamp of survey submission                             |


The referral chain is reconstructed from `parentSurveyCode` and `childSurveyCodes`. Seeds (initial recruits) have `parentSurveyCode: null`.

## Future Plans

A dedicated analysis module (in-repo scripts or Jupyter notebook) for King County data is planned for a future release. Contributions are welcome — see [CONTRIBUTING.md](https://github.com/uw-ssec/respondent-driven-sampling/blob/main/CONTRIBUTING.md).