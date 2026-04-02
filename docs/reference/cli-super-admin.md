# `npm run super-admin`

**Source:** `server/src/scripts/superAdminCRUD.ts`

Manages super-admin user accounts. Super admins have full access to the admin dashboard and can approve volunteer accounts.

Run all commands from the `server/` directory:

```bash
cd server
```

## Operations

### `create` — Create a super admin

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

### `list` — List super admin accounts

```bash
npm run super-admin -- list          # Active accounts only
npm run super-admin -- list --all    # Include soft-deleted
```

---

### `get` — Get a specific super admin

```bash
npm run super-admin -- get john@example.com
npm run super-admin -- get +12065551234
npm run super-admin -- get 507f1f77bcf86cd799439011
```

Accepts email, phone number, or MongoDB ObjectId.

---

### `update` — Update a super admin

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

### `delete` — Delete a super admin

```bash
npm run super-admin -- delete john@example.com          # Soft delete (recoverable)
npm run super-admin -- delete john@example.com --hard   # Permanent delete
```

Soft-deleted accounts are hidden from `list` but remain in the database. Use `list --all` to see them. Use `restore` to recover a soft-deleted account.

---

### `restore` — Restore a soft-deleted super admin

```bash
npm run super-admin -- restore john@example.com
npm run super-admin -- restore +12065551234
```
