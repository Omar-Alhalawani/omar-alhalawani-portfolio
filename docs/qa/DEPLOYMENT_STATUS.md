> Historical checkpoint before the October 10 Amber + Steel upgrade. Current repository, deployment, and final measurements are documented in `docs/upgrade/FINAL_REPORT.md`. Version names and old hosts below are archival.

# Vercel staging checkpoint

Status on 2026-10-10: **implementation pushed and local production QA passed; Vercel deployment is waiting for user sign-in/authorization.** There is no verified staging URL and no live-site acceptance result yet.

Opened Vercel's New Project flow at `https://vercel.com/new` and entered `https://github.com/Omar-Alhalawani/omar-portfolio-v2`. The rendered page offers Login, Sign Up, and Continue with GitHub/GitLab/Bitbucket. It also states that continuing without an existing Vercel account creates an account subject to its Terms of Service.

Stopped before **Continue with GitHub**, as Omar's specification requires: “If Vercel needs … login … GitHub authorization … MFA … account consent … stop at that exact point and tell me what I need to click or approve.” No credentials, MFA codes, tokens, account consent, paid plan, domain, or DNS action was requested or performed by the agent.

## User step

Use the prepared browser import page. Click **Login** and sign in to your existing Vercel account personally. If that account uses GitHub sign-in, choose **Continue with GitHub**. Complete any repository authorization personally and select the V2 repository if Vercel asks for access. No paid plan or infrastructure is needed for this static portfolio.

The [captured sign-in checkpoint](vercel-signin.jpg) shows the actual import page with the V2 repository URL entered. No project has been deployed from that page yet.

## Resume after authentication

1. Import `Omar-Alhalawani/omar-portfolio-v2` as a separate Vercel project.
2. Confirm Astro, root `./`, Node 24 or later, `npm install`, `npm run build`, and `dist`, using automatic defaults where correct. No secrets or environment variables are needed.
3. Deploy, inspect actual logs, and fix/commit/redeploy any build or delivery issue.
4. Record the actual `.vercel.app` URL and run browser/network/Lighthouse checks against it. Preserve all three staging indexing restrictions.
5. Inspect the live hero, every required route, invalid route, responsive layouts, keyboard, graphics fallback/lifecycle, resume, and mocked form states. Do not send test email.
6. Call staging stable only after the live site passes. V1 remains unchanged.

The fallback hostname in `astro.config.mjs` is a build-time staging origin, not evidence of an existing deployment. A successful local build and local Lighthouse scores must not be represented as live Vercel results.
