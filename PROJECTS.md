# NairaLeap repository projects

| Project | Location | Responsibility | Production writes |
| --- | --- | --- | --- |
| NairaLeap portal | Repository root (`src/`, `supabase/`) | Customer-facing service portal, authentication boundary, guided intake, and request tracking | Existing application behavior only; unchanged by the migration project |
| WordPress / Blogsy migration | `wordpress/` | Read local WordPress WXR exports and produce normalized staging artifacts for review | None; importer is dry-run/staging-only |

The two projects are intentionally separated by directory and trust boundary. The migration project does not import portal code, Supabase credentials, or production connection settings.
