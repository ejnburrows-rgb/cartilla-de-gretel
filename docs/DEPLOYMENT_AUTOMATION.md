# Deployment Automation

This repo now has a production automation workflow:

```text
.github/workflows/production-deploy.yml
```

## What it does

On every push to `main`, it:

1. Installs dependencies.
2. Runs typecheck.
3. Runs lint.
4. Builds the app.
5. Applies Supabase migrations if Supabase secrets are present.
6. Deploys the production site to Vercel if Vercel secrets are present.

## Required GitHub Actions secrets

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
SUPABASE_DB_PASSWORD
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

## Required Vercel environment variables

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

## Safety rule

Never paste secret values into chat or docs. Put them directly into GitHub Actions secrets or Vercel environment variables.

## How to run manually

Go to:

```text
GitHub → Actions → Production Deploy → Run workflow
```

## Expected result

- Supabase migrations are applied.
- Vercel production deploys from the latest `main` commit.
- The live website uses Supabase when the Vercel environment variables are configured.
