# Deploying eResource to Vercel

Vercel auto-deploys from GitHub on every push to the connected branch.

## First Deploy

1. **Push this repo to GitHub** (if not already done).

2. **Vercel Dashboard → Add New → Project**
   - Import the `eresource` GitHub repository
   - Framework preset will auto-detect as **Next.js** — leave all build settings as defaults

3. **Set environment variables** in the Vercel project settings before deploying:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Neon connection string |
   | `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste the output |
   | `NEXTAUTH_URL` | Your Vercel URL, e.g. `https://eresource.vercel.app` |
   | `R2_ACCOUNT_ID` | Cloudflare account ID |
   | `R2_ACCESS_KEY_ID` | R2 API access key |
   | `R2_SECRET_ACCESS_KEY` | R2 API secret key |
   | `R2_BUCKET_NAME` | R2 bucket name |
   | `R2_PUBLIC_URL` | Public CDN URL, e.g. `https://pub-xxx.r2.dev` |

4. **Click Deploy** — Vercel will run `npm run build` and deploy automatically.

5. **Seed the first admin account** via the Vercel CLI or your local terminal
   (with `DATABASE_URL` set in your environment):
   ```
   npm run seed:admin
   ```

6. **Verify** — visit `https://<your-project>.vercel.app/admin/login` and log in.

## Subsequent Deploys

Push to the connected GitHub branch. Vercel auto-deploys within ~1 minute.

## Rollback

Vercel Dashboard → your project → Deployments tab → click any previous deployment → **Promote to Production**.
