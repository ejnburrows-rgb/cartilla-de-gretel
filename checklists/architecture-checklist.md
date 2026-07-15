<!-- Architecture checklist — run during /plan, before Task 1 -->

DATABASE
[ ] Core entities identified with clear relationships
[ ] Primary keys and indexes planned
[ ] Validation rules defined at the model level
[ ] Supabase RLS policy planned per table (who sees what)
[ ] Backup/recovery noted (Supabase dashboard export cadence)

BACKEND / API
[ ] Auth strategy chosen (Supabase Auth; magic link vs password)
[ ] Error handling and logging approach defined (Sentry)
[ ] Rate limiting / abuse basics considered on public forms
[ ] Folder structure and naming conventions decided

FRONTEND
[ ] Component hierarchy and state approach chosen
[ ] Design system picked (Tailwind + shadcn/ui)
[ ] Responsive (375px) and accessibility requirements listed

CROSS-CUTTING
[ ] .env + .env.example strategy; secrets never in code
[ ] Error tracking configured (Sentry)
[ ] Performance target set (page load under ~2s on 4G)
[ ] Security basics: input validation, XSS, auth flows

DOCS
[ ] Major decisions recorded in architecture.md with one-line WHY
[ ] README states the stack and how to run it
