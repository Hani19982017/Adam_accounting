# MySQL → PostgreSQL conversion (for Render)

This project was converted from MySQL to PostgreSQL so the database can be hosted
on Render (Render only offers managed PostgreSQL, not MySQL).

## What changed
- `package.json` — removed `mysql2`, added `pg` + `@types/pg`
- `drizzle.config.ts` — `dialect: "mysql"` → `"postgresql"`
- `drizzle/schema.ts` — `mysql-core` → `pg-core`:
  - `mysqlTable`→`pgTable`, `int().autoincrement()`→`serial()`,
    `mysqlEnum`→`pgEnum` (declared as `roleEnum` / `txTypeEnum`),
    `decimal`→`numeric`, `onUpdateNow()`→ app-level `.$onUpdate()`
- `server/db.ts` — driver `drizzle-orm/mysql2` → `drizzle-orm/node-postgres`;
  `onDuplicateKeyUpdate` → `onConflictDoUpdate({ target: users.openId, ... })`
- `drizzle/` — regenerated migration (`0000_clumsy_frog_thor.sql`) for Postgres;
  old MySQL migration removed

## Deploy on Render
1. Create a Postgres DB on Render (New + → Postgres). Copy its Internal & External URLs.
2. Run the migration from your machine using the **External** URL:
   ```bash
   export DATABASE_URL="<External URL>?sslmode=require"
   pnpm install
   pnpm drizzle-kit migrate
   ```
3. In the Render Web Service, set DATABASE_URL to the **Internal** URL (no sslmode),
   plus the other env vars (JWT_SECRET, VITE_APP_ID, OAUTH_SERVER_URL, etc.).
4. Build: `pnpm install && pnpm build`  ·  Start: `pnpm start`

Note: `numeric` columns are returned as strings by the `pg` driver (same as MySQL
`decimal` was), so the existing `parseFloat(t.amount)` on the frontend is unchanged.
