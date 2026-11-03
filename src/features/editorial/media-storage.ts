/**
 * Editorial media storage seam.
 *
 * All editorial artwork is addressed with stable local paths (for example
 * `/editorial/cms/4042.jpg`). This module is the single place that maps those
 * paths to served URLs, so a future durable media store (a Cloudflare R2
 * bucket or a CDN in front of it) can be adopted by setting one environment
 * variable — `VITE_EDITORIAL_MEDIA_BASE_URL` — without touching routes,
 * components, or data files.
 *
 * See `docs/editorial-media/STORAGE-ARCHITECTURE.md` for the full storage plan.
 */

const RAW_MEDIA_BASE_URL = (import.meta.env?.VITE_EDITORIAL_MEDIA_BASE_URL ?? "").trim();
const MEDIA_BASE_URL = RAW_MEDIA_BASE_URL.replace(/\/+$/, "");

/**
 * Join a configured media base URL with a local editorial media path.
 * Absolute, protocol-relative, and data URLs pass through untouched.
 */
export const joinMediaBaseUrl = (baseUrl: string, path: string): string => {
  const trimmedBase = baseUrl.replace(/\/+$/, "");
  if (!trimmedBase || !path) return path;
  if (/^(?:https?:)?\//i.test(path) || path.startsWith("data:")) return path;
  return `${trimmedBase}/${path.replace(/^\/+/, "")}`;
};

/**
 * Resolve an editorial media path to the URL the browser should request.
 * With no configured base URL, local paths are served from the deployment.
 */
export const editorialMediaUrl = (path: string): string =>
  joinMediaBaseUrl(MEDIA_BASE_URL, path);
