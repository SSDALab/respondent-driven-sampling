# CLI Scripts

The `server/` package includes several management scripts accessible via `npm run`. Run all commands from the `server/` directory unless noted.

```bash
cd server
```

## Available Scripts

| Script | Description |
|---|---|
| [`npm run super-admin`](cli-super-admin.md) | Create, list, update, delete, and restore super-admin accounts |
| [`npm run location`](cli-location.md) | Create, import, list, update, and delete survey site records |
| [`npm run generate-seeds`](cli-generate-seeds.md) | Generate seed QR codes in MongoDB and export a printable PDF |
| [`npm run generate-coupons`](cli-generate-coupons.md) | Generate blank coupon PDF templates (no database connection) |
