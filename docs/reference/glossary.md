# Glossary

Technical terms specific to the RDS App codebase and documentation.

---

**CASL** — A JavaScript authorization library used for role and attribute-based access control. Defines what each user role can read, create, update, or delete. See [Architecture](architecture.md#permissions-casl).

**Coupon** — A physical card with a space for a QR code sticker. Generated as blank PDF templates via `npm run generate-coupons`. Not connected to the database.

**CSP** — Content Security Policy. An HTTP header restricting which sources browsers can load scripts, styles, and other resources from. Enforced by Helmet.js in the server.

**JWT** — JSON Web Token. A signed token issued by the server after OTP verification, stored in the client and sent with every authenticated API request.

**OTP** — One-Time Password. A short-lived numeric code sent via SMS through Twilio Verify that volunteers enter to authenticate.

**Seed** — The initial survey code (and its corresponding QR code) distributed to start a referral chain. Seeds have no `parentSurveyCode`. See [CLI Scripts](cli-scripts.md#npm-run-generate-seeds).

**SID** — Service Identifier. A Twilio-specific string identifying an account (`TWILIO_ACCOUNT_SID`, starts with `AC`) or a Verify service (`TWILIO_VERIFY_SID`, starts with `VA`).

**Survey code** — An 8-character hex string that uniquely identifies a survey entry point. Encoded in QR codes and used to link parent and child surveys in the referral chain.

**SWR** — Stale-While-Revalidate. A React data-fetching strategy used in the admin dashboard. Returns cached data immediately, then revalidates in the background.

**Twilio Verify** — A Twilio service for phone number verification via SMS OTP. Used for all volunteer logins.