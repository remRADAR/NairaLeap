# Features

Feature-based organization. Each business capability owns its own folder:

```
src/features/
  service-discovery/    # helping visitors find the right NairaLeap service
  onboarding/           # guided intake flow
  service-requests/     # structured request submission
  admin-submissions/    # forwarding requests to administrators
```

## Rules

- A feature folder is self-contained: `components/`, `hooks/`, `lib/`, `types.ts`.
- Cross-feature primitives (buttons, cards, layout) live in `src/components/`, not here.
- Routes in `src/routes/` should be thin — they compose feature modules.
- No feature is implemented yet. This is scaffolding for future prompts.
