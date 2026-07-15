<!-- Deployment checklist — run inside /handoff -->

PRE-DEPLOY
[ ] /qa PASS on all criteria; /security-audit SAFE
[ ] .env.example complete; secrets in platform env vars only
[ ] Production build tested (npm run build clean)
[ ] Error tracking receiving events (throw a test error, see it land)

PLATFORM
[ ] Host chosen per ruling 8.2.1 (commercial => Netlify or paid Vercel)
[ ] HTTPS on (automatic); custom domain if client provides one
[ ] Uptime monitor pointed at the live URL (Better Stack)

POST-DEPLOY
[ ] Core flows clicked through IN PRODUCTION, phone and desktop
[ ] Auth works end-to-end on the live site
[ ] Stripe live-mode test purchase + refund (where payments exist)
[ ] Rollback ready: previous deploy restorable in one click
[ ] README updated with live URL; known issues + next priorities listed
