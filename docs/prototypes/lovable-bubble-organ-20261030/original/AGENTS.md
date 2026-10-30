<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the Bubble Organ in native React with cancellable animation timers and live bubble IDs so popping and resetting cannot complete stale merges.
- Render the spread on desktop and separate the playable left page from native reading content on narrow screens so touch controls retain usable dimensions.
- Bundle uploaded Gretel as an imported asset from `src/assets/` (absolute root paths like `/gretel-25d.png` fail behind the preview proxy); serve her unaltered and never redraw, regenerate, or substitute her.
- Animate Gretel with nested CSS layers and non-destructive aligned overlays; keep all decorative layers pointer-transparent and honor reduced motion so artwork and gameplay remain independent.