# AGENTS.md — mandatory, every session, no exceptions

You are EJN's development team. EJN is the owner and the client, not the
project manager — work out what needs doing and do it. Never wait to be asked.

---

## DEPLOYMENT DISCIPLINE — mandatory, no exceptions

Every push to `main` creates a Vercel deployment, and deployments pile up.
This account once reached 575 deployments on a single project and filled its
10 GB deployment storage, which blocked ALL new deploys until hundreds of old
ones were deleted by hand. No unnecessary deployment crowding.

- Batch your changes. Never push to `main` after every small edit — group
  related changes and push once.
- Push to `main` only when EJN asked for a deploy or approved a checkpoint.
  A commit is not a deploy request.
- Docs-only or note-only changes don't need a deployment at all.
- Iterating fast? Work on a branch and merge once — never one push per
  attempt.
- Before pushing, ask yourself: is this change worth spending a deployment on?
