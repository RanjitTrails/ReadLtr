# ReadLtr Deployment Guide

This guide will walk you through deploying the ReadLtr application using GitHub Actions, Netlify, and Supabase.

## Prerequisites

1. GitHub account
2. Netlify account
3. Supabase account
4. Git installed on your local machine

## Step 1: Setting Up Supabase

1. Log in to your Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project, give it a name (e.g., "ReadLtr")
3. Make note of your Supabase project URL and anon key from the Project Settings > API section
4. In the SQL Editor, run the database migration scripts located in the `supabase/migrations` folder

## Step 2: Setting Up Netlify

1. Log in to your Netlify account at [https://netlify.com](https://netlify.com)
2. Create a new site from Git
3. Connect your GitHub repository
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add the following environment variables in the Netlify site settings:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Get your Netlify API token from User Settings > Applications > Personal access tokens
7. Note your Netlify site ID from Site Settings > General > Site details > API ID

## Step 3: Setting Up GitHub Repository

1. Create a new GitHub repository
2. Push your local code to the GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/readltr.git
git push -u origin main
```

## Step 4: Configure GitHub Actions Secrets

1. Go to your GitHub repository > Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `NETLIFY_AUTH_TOKEN`: Your Netlify API token
   - `NETLIFY_SITE_ID`: Your Netlify site ID

## Step 5: Install Dependencies and Build Locally (Optional)

1. Install missing dependencies:

```bash
# For Windows PowerShell
PowerShell -ExecutionPolicy Bypass -File .\install-deps.ps1

# For Unix/Linux/macOS
chmod +x ./install-deps.sh
./install-deps.sh
```

2. Build the project locally:

```bash
# For Windows PowerShell
PowerShell -ExecutionPolicy Bypass -File .\build-local.ps1

# For Unix/Linux/macOS
chmod +x ./build-local.sh
./build-local.sh
```

## Step 6: Deploy with GitHub Actions

1. Push your changes to the main branch:

```bash
git add .
git commit -m "Update codebase for deployment"
git push
```

2. GitHub Actions will automatically deploy your application to Netlify
3. You can check the status of the deployment in the Actions tab of your GitHub repository

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. Ensure all required dependencies are installed:
   - Run the `install-deps.ps1` script (Windows) or `install-deps.sh` script (Unix/Linux/macOS)
   
2. Check for TypeScript errors:
   - Run `npx tsc --noEmit` to check for TypeScript errors without generating output files

3. Check GitHub Actions logs:
   - Go to your GitHub repository > Actions tab to view detailed logs of the deployment process

4. Verify Netlify build settings:
   - Ensure the build command and publish directory are correctly configured
   - Check that all required environment variables are set

5. Verify Supabase configuration:
   - Check that your database schema matches the expected structure
   - Ensure your Supabase URL and anon key are correctly set as environment variables

## Next Steps

Once your application is deployed:

1. Set up a custom domain (optional) in Netlify site settings
2. Configure SSL/TLS certificates for your domain
3. Set up monitoring and analytics
4. Implement a regular backup schedule for your Supabase database

Congratulations on deploying ReadLtr! 🎉 