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

## SmartPark architecture
- Keep parking data models and pure mock commands in `src/features/parking`, with a shared provider around the application shell; this isolates browser persistence and rules from UI for later Java REST integration.
- Use distinct TanStack leaf routes for each workspace view with page-specific metadata; navigation and direct page access must resolve consistently.
- Route all demo mutations through the command service and capture bounded pre-action snapshots for undo; this keeps sessions, slots, vehicles, activities and queue synchronized.
- Load browser persistence only after hydration and never import or execute the uploaded Java project in the frontend; the existing Java implementation remains a separate future integration target.
