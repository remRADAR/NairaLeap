# NairaLeap × Article Intelligence & Discussion

## Status

**Read-only availability disclosure only; the plugin is not loaded as a runtime dependency.** The article detail route continues to show migrated editorial content and its existing original-source link. It adds an informational panel stating that evidence and discussion are not enabled. There are no evidence forms, comments, community surveys, automated verdicts, publication actions, or new API calls.

## Frontend adaptation

- Route: `src/routes/articles.$slug.tsx`.
- The panel uses NairaLeap's purple editorial palette, responsive spacing, heading semantics, and a visible “Not enabled” state.
- The panel explains that safe retrieval and authenticated, revision-bound editorial review are not connected.
- Existing WordPress/migrated article content and the original-source link are unchanged. The plugin is not used to fetch arbitrary URLs.

## Security and governance gates

The package currently supplies a `SourceRetriever` interface and syntactic URL validation, not a live safe network worker. It does not establish DNS answer validation, connection pinning, or redirect revalidation. Keep arbitrary URL retrieval unavailable until a transport validates each IPv4/IPv6 resolution, connects only to a validated address while preserving TLS hostname verification, revalidates each redirect, and enforces strict time/size/content-type/port/concurrency limits. Test rebinding, special-use ranges, blocked redirects, and bounded failures in an isolated harness.

The package's editorial gate is in-memory and keyed by item ID; a non-empty caller-supplied approver string is not host authorization, and approval is not bound to the exact immutable content revision. Before publication integration, require a canonical revision/hash, invalidation on content changes, server-side authentication/role checks, exact-revision approval, and durable audit history.

Public evidence/discussion additionally requires explicit identity/anonymity, moderation, abuse, idempotency/duplicate, persistence, and privacy rules. Do not expose user submissions until the host boundary is defined and tested. Automated scores must never be rendered as truth verdicts.

## Fallback and configuration

The existing article/source experience remains the fallback. No new environment variables, credentials, provider configuration, database changes, or external requests are introduced by the status panel. No comments or evidence are stored.

## Verification target

`cypress/e2e/plugin-integration-status.cy.ts` verifies that the status panel appears on an article detail route and contains no submission controls. SSRF-safe retrieval, moderation, authorization, persistence, editorial approval, and full plugin integration remain unimplemented and unverified.
