# Cloudflare editorial storage findings

- Cloudflare D1 limits a maximum string, BLOB, or table row size of 2,000,000 bytes (2 MB): https://developers.cloudflare.com/d1/platform/limits/
- Cloudflare R2 public access is disabled by default. Production media should use a custom domain; the managed `r2.dev` URL is intended for development and is rate-limited: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Worker R2 bindings expose an object bucket for read/list/write/delete operations and are declared in Wrangler: https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
- The connected Cloudflare account currently returns HTTP 403 with `Please enable R2 through the Cloudflare Dashboard.` for R2 bucket operations. The current implementation therefore uses bounded small image data URLs in D1 for immediate functionality and keeps R2 as the next storage upgrade after the account enables it.
