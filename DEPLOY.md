# Deploying eResource to Render.com

Render auto-deploys from GitHub on every push to the connected branch.

## First Deploy

1. **Push this repo to GitHub** (if not already done).

2. **Render Dashboard → New → Blueprint**
   - Connect your GitHub repo
   - Point Render at `render.yaml` (it should auto-detect)
   - Render will provision: one Web Service + one PostgreSQL database

3. **Set the 6 manual environment variables** in the Render dashboard
   (Environment tab of the Web Service):

   | Variable | Value |
   |----------|-------|
   | `NEXTAUTH_URL` | Your Render URL, e.g. `https://eresource.onrender.com` |
   | `R2_ACCOUNT_ID` | Cloudflare account ID |
   | `R2_ACCESS_KEY_ID` | R2 API access key |
   | `R2_SECRET_ACCESS_KEY` | R2 API secret key |
   | `R2_BUCKET_NAME` | R2 bucket name |
   | `R2_PUBLIC_URL` | Public CDN URL, e.g. `https://pub-xxx.r2.dev` |

   `DATABASE_URL` and `NEXTAUTH_SECRET` are set automatically by Render via `render.yaml`.

4. **Trigger the first deploy** — Render will:
   - Run `npm ci`
   - Generate the Prisma client
   - Run database migrations (`prisma migrate deploy`)
   - Build Next.js (`npm run build`)
   - Copy static files into the standalone bundle
   - Start the server (`node .next/standalone/server.js`)

5. **Seed the first admin account** via the Render Shell tab:
   ```
   npm run seed:admin
   ```

6. **Verify** — visit `https://<your-service>.onrender.com/admin/login`, log in, upload a test resource.

## Subsequent Deploys

Push to your connected GitHub branch. Render auto-deploys within ~2 minutes.

## Rollback

In the Render dashboard → Deploys tab → click any previous deploy → "Rollback to this deploy".
