# Final Release QA — Viewport Checklist (PREP)

**Status:** checklist only — no pass/fail claimed in prep phase.  
**Aligned with:** `scripts/release-browser-qa.mjs` and `scripts/final-release-qa.mjs`.

---

## Required viewports

| Name | Width | Height | Device class | Primary users |
|---|---:|---:|---|---|
| **mobile** | **390** | **844** | Phone (iPhone 12/13-class logical) | Students |
| **desktop** | **1440** | **900** | Laptop / classroom display | Teachers + students |

Optional later (not required for this release gate):

| Name | Width | Height | Notes |
|---|---:|---:|---|
| tablet | 768 | 1024 | Nice-to-have |
| large-desktop | 1920 | 1080 | Projection only |

---

## Per-viewport visual checks

Apply to each route in the smoke minimum (`ROUTE-CHECKLIST.md`).

### Mobile 390×844

| Check | Criteria | Status |
|---|---|---|
| V-M1 | No horizontal page overflow / clipped primary CTA | [ ] |
| V-M2 | Primary nav / lesson controls reachable without hover-only | [ ] |
| V-M3 | Workbook / libro content readable (not tiny unreadable text) | [ ] |
| V-M4 | Gretel (if present) does **not** cover exercise content | [ ] |
| V-M5 | No stuck native scrollbars from fixed-height `.faithful-page` wrappers | [ ] |
| V-M6 | Tap targets usable for grid cells / chips | [ ] |
| V-M7 | Teacher CRM usable or honest “use desktop” — document actual UX | [ ] |

### Desktop 1440×900

| Check | Criteria | Status |
|---|---|---|
| V-D1 | Layout uses width without huge empty broken regions | [ ] |
| V-D2 | Flipchart `/cartilla/presentar/1` presentation-ready | [ ] |
| V-D3 | CRM tiles / sidebar / drill-down readable | [ ] |
| V-D4 | Gretel corner placement never overlaps workbook | [ ] |
| V-D5 | Activities / games strip aligned with lesson content | [ ] |
| V-D6 | Reportes + CSV control visible when class data present | [ ] |
| V-D7 | Family reporte print/read layout acceptable | [ ] |

---

## Screenshot naming convention (post-integration)

Write under `generated/final-release-qa/results/screenshots/`:

```
{viewport}-{routeId}.png
```

Examples:

- `mobile-splash.png` → `/cartilla`
- `desktop-leccion-1.png` → `/cartilla/leccion/1`
- `mobile-teacher-crm.png` → `/cartilla/teacher/crm`
- `desktop-flipchart-1.png` → `/cartilla/presentar/1`

---

## Browser launch notes (Windows validation host)

Preferred order used by existing QA scripts:

1. Microsoft Edge system binary  
2. Playwright Chromium under `%USERPROFILE%\AppData\Local\ms-playwright\`  
3. `channel: "msedge"` fallback  

Set `PLAYWRIGHT_CHROMIUM_PATH` if needed.
