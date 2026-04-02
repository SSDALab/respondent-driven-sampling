# `npm run generate-coupons`

**Source:** `server/src/scripts/generateCoupons.ts`

Generates a blank coupon PDF template with a placeholder box for a QR code sticker. Does **not** connect to the database or create any records — it is purely a print-ready template.

Run from the `server/` directory:

```bash
cd server
```

## Usage

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

## Output

Generates a PDF at `server/src/scripts/coupons/coupons-<count>-<timestamp>.pdf`. Each page has a dashed box labeled "Place QR Code Sticker Here" where staff can affix a sticker printed from the seed PDF.

!!! note "When to use this vs. generate-seeds"
    Use `generate-seeds` to create both the database records and the QR-printed pages for distribution. Use `generate-coupons` only when you need blank physical templates that staff will label manually.
