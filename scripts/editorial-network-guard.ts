import { isIP } from "node:net";
import { lookup as nodeLookup } from "node:dns/promises";

/**
 * SSRF destination guard for every network path in the editorial media
 * pipeline (Openverse discovery, reconciliation probing, and approved image
 * downloads).
 *
 * Only public http(s) destinations are allowed:
 *   - literal IPv4 and IPv6 addresses are parsed and checked against every
 *     loopback, private, shared, link-local, multicast, and reserved range,
 *     including IPv4-mapped IPv6, NAT64 (64:ff9b::/96), and 6to4 (2002::/16)
 *     representations that embed an IPv4 address;
 *   - hostnames are resolved and EVERY resolved address must be public — a
 *     hostname with any prohibited address (of either family) is rejected;
 *   - manual, bounded redirect handling revalidates every hop before the
 *     connection is opened, so redirects cannot bypass validation.
 *
 * Documented limitation: the runtime fetch implementation does not expose a
 * way to pin the connection to a validated address or to supply a custom
 * resolver at connection time. A DNS rebinding attack that returns a public
 * address during validation and a prohibited address at connection time
 * therefore cannot be made impossible with this runtime alone. To narrow
 * that window, callers revalidate the destination immediately after the
 * response arrives (before the body is read) and abort if the DNS answer
 * changed. That is detection, not prevention: complete connection-time SSRF
 * protection is NOT claimed.
 */

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export type AddressInfo = { address: string; family: number };

export type LookupLike = (host: string) => Promise<AddressInfo[]>;

export class UnsafeDestinationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafeDestinationError";
  }
}

const parseIPv4ToBigInt = (value: string): bigint | null => {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return null;
  let result = 0n;
  for (const part of value.split(".")) {
    const octet = Number(part);
    if (octet > 255) return null;
    result = (result << 8n) | BigInt(octet);
  }
  return result;
};

const IPV4_BLOCKED: Array<[bigint, number]> = [
  [0x00000000n, 8], // "this network" / unspecified
  [0x0a000000n, 8], // 10.0.0.0/8 private
  [0x64400000n, 10], // 100.64.0.0/10 shared (CGNAT)
  [0x7f000000n, 8], // 127.0.0.0/8 loopback
  [0xa9fe0000n, 16], // 169.254.0.0/16 link-local (incl. cloud metadata)
  [0xac100000n, 12], // 172.16.0.0/12 private
  [0xc0000000n, 24], // 192.0.0.0/24 IETF protocol assignments
  [0xc0000200n, 24], // 192.0.2.0/24 TEST-NET-1
  [0xc0586300n, 24], // 192.88.99.0/24 6to4 relay (retired)
  [0xc0a80000n, 16], // 192.168.0.0/16 private
  [0xc6120000n, 15], // 198.18.0.0/15 benchmarking
  [0xc6336400n, 24], // 198.51.100.0/24 TEST-NET-2
  [0xcb007100n, 24], // 203.0.113.0/24 TEST-NET-3
  [0xe0000000n, 4], // 224.0.0.0/4 multicast
  [0xf0000000n, 4], // 240.0.0.0/4 reserved (incl. broadcast)
];

const inIPv4Range = (value: bigint, base: bigint, bits: number): boolean =>
  value >= base && value < base + (1n << BigInt(32 - bits));

const isDisallowedIPv4Value = (value: bigint): boolean =>
  IPV4_BLOCKED.some(([base, bits]) => inIPv4Range(value, base, bits));

const parseIPv6Side = (
  side: string,
): { groups: number[]; v4: bigint | null } | null => {
  if (side === "") return { groups: [], v4: null };
  const parts = side.split(":");
  const groups: number[] = [];
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (index === parts.length - 1 && part.includes(".")) {
      const v4 = parseIPv4ToBigInt(part);
      if (v4 === null) return null;
      return { groups, v4 };
    }
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return null;
    groups.push(parseInt(part, 16));
  }
  return { groups, v4: null };
};

const parseIPv6ToBigInt = (host: string): bigint | null => {
  let text = host;
  if (text.startsWith("[") && text.endsWith("]")) text = text.slice(1, -1);
  if (!text.includes(":")) return null;
  const sides = text.split("::");
  if (sides.length > 2) return null;
  const compressed = sides.length === 2;
  const head = compressed ? parseIPv6Side(sides[0]) : { groups: [], v4: null };
  const tail = parseIPv6Side(compressed ? sides[1] : sides[0]);
  if (head === null || tail === null) return null;
  const v4 = tail.v4;
  const total = head.groups.length + tail.groups.length + (v4 !== null ? 2 : 0);
  if (total > 8) return null;
  if (!compressed && total !== 8) return null;
  const missing = 8 - total;
  let value = 0n;
  for (const group of head.groups) value = (value << 16n) | BigInt(group);
  for (let index = 0; index < missing; index += 1) value <<= 16n;
  for (const group of tail.groups) value = (value << 16n) | BigInt(group);
  if (v4 !== null) value = (value << 32n) | v4;
  return value;
};

const IPV6_BLOCKED: Array<[bigint, number]> = [
  [0x0100n << 64n, 64], // 100::/64 discard-only
  [0x20010db8n << 96n, 32], // 2001:db8::/32 documentation
  [0x64ff9b0001n << 80n, 48], // 64:ff9b:1::/48 local-use NAT64
  [0xfc00n << 112n, 7], // fc00::/7 unique local
  [0xfec0n << 112n, 10], // fec0::/10 site-local (deprecated)
  [0xfe80n << 112n, 10], // fe80::/10 link-local
  [0xff00n << 112n, 8], // ff00::/8 multicast
];

const inIPv6Range = (value: bigint, base: bigint, bits: number): boolean =>
  value >= base && value < base + (1n << BigInt(128 - bits));

const isDisallowedIPv6Value = (value: bigint): boolean => {
  if (inIPv6Range(value, 0xffffn << 32n, 96)) {
    // IPv4-mapped: validate the embedded IPv4 address.
    return isDisallowedIPv4Value(value & 0xffffffffn);
  }
  if (value < 1n << 32n) return true; // ::/96: unspecified, loopback, v4-compatible
  if (inIPv6Range(value, 0x64ff9bn << 96n, 96)) {
    // NAT64 well-known prefix: validate the embedded IPv4 address.
    return isDisallowedIPv4Value(value & 0xffffffffn);
  }
  if (inIPv6Range(value, 0x2002n << 112n, 16)) {
    // 6to4: validate the embedded IPv4 address.
    return isDisallowedIPv4Value((value >> 80n) & 0xffffffffn);
  }
  return IPV6_BLOCKED.some(([base, bits]) => inIPv6Range(value, base, bits));
};

/**
 * Whether an IP literal is a prohibited (non-public) destination. Anything
 * that cannot be parsed as an IP literal is treated as prohibited: callers
 * handle hostnames separately via resolution.
 */
export const isDisallowedIp = (address: string): boolean => {
  const stripped = address.replace(/^\[/, "").replace(/\]$/, "");
  const v4 = parseIPv4ToBigInt(stripped);
  if (v4 !== null) return isDisallowedIPv4Value(v4);
  const v6 = parseIPv6ToBigInt(stripped);
  if (v6 !== null) return isDisallowedIPv6Value(v6);
  return true;
};

const defaultLookup: LookupLike = async (host) => {
  const results = await nodeLookup(host, { all: true, verbatim: true });
  return results.map((result) => ({ address: result.address, family: result.family }));
};

/**
 * Validate that a destination is a public http(s) endpoint. Literal IPs are
 * checked directly; hostnames are resolved and every resolved address must be
 * public (fail closed on any prohibited address, empty answers, or resolution
 * failures). Throws UnsafeDestinationError for prohibited destinations.
 */
export const assertPublicDestination = async (
  url: URL,
  lookup?: LookupLike,
): Promise<AddressInfo[]> => {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UnsafeDestinationError("Destination must use http or https: " + url.protocol);
  }
  const host = url.hostname.replace(/^\[/, "").replace(/\]$/, "");
  const family = isIP(host);
  if (family === 4 || family === 6) {
    if (isDisallowedIp(host)) {
      throw new UnsafeDestinationError("Refusing non-public network destination: " + host);
    }
    return [{ address: host, family }];
  }
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9-]+)*$/.test(host)) {
    throw new UnsafeDestinationError("Destination host is not a valid hostname: " + host);
  }
  let addresses: AddressInfo[];
  try {
    addresses = await (lookup ?? defaultLookup)(host);
  } catch {
    throw new Error("Could not resolve destination host: " + host);
  }
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error("Destination host resolved to no addresses: " + host);
  }
  for (const info of addresses) {
    if (isDisallowedIp(info.address)) {
      throw new UnsafeDestinationError(
        "Refusing non-public network destination: " + host + " resolves to " + info.address,
      );
    }
  }
  return addresses;
};

/**
 * Bounded, SSRF-guarded fetch with manual redirect handling. Every hop is
 * revalidated before the connection is opened; redirects can never bypass
 * validation. Redirect-count overflow and malformed redirect targets throw
 * ordinary Errors; prohibited destinations throw UnsafeDestinationError.
 */
export const fetchWithPublicGuard = async (
  rawUrl: string,
  options: {
    method?: "GET" | "HEAD";
    headers?: Record<string, string>;
    timeoutMs: number;
    maxRedirects?: number;
    lookup?: LookupLike;
    fetchImpl?: FetchLike;
  },
): Promise<{ response: Response; finalUrl: string }> => {
  const fetchImpl = options.fetchImpl ?? (fetch as FetchLike);
  const maxRedirects = options.maxRedirects ?? 5;
  const method = options.method ?? "GET";
  let current: URL;
  try {
    current = new URL(rawUrl);
  } catch {
    throw new UnsafeDestinationError("Destination is not a valid URL: " + rawUrl);
  }
  for (let hop = 0; hop <= maxRedirects; hop += 1) {
    await assertPublicDestination(current, options.lookup);
    const response = await fetchImpl(current.toString(), {
      method,
      redirect: "manual",
      headers: options.headers ?? {},
      signal: AbortSignal.timeout(options.timeoutMs),
    });
    if (response.status < 300 || response.status >= 400) {
      return { response, finalUrl: current.toString() };
    }
    if (hop === maxRedirects) {
      throw new Error("Exceeded the maximum of " + maxRedirects + " redirects.");
    }
    const location = response.headers.get("location");
    if (!location) {
      throw new Error("Redirect response without a Location header.");
    }
    let next: URL;
    try {
      next = new URL(location, current);
    } catch {
      throw new Error("Redirect target is not a valid URL: " + location);
    }
    current = next;
  }
  throw new Error("Exceeded the maximum of " + maxRedirects + " redirects.");
};

export type ProbeOutcome = "ok" | "unavailable" | "forbidden" | "timeout" | "unknown" | "unsafe";

const classifyProbeStatus = (status: number): ProbeOutcome | null => {
  if (status >= 200 && status < 300) return "ok";
  if (status === 401 || status === 403) return "forbidden";
  if (status >= 400) return "unavailable";
  return null;
};

/**
 * Bounded, SSRF-guarded reachability probe for external content images:
 * HEAD first, with a byte-range GET fallback when HEAD is unsupported.
 * Prohibited destinations are reported as "unsafe" and are never fetched.
 */
export const probeExternalUrl = async (
  rawUrl: string,
  options: {
    userAgent: string;
    timeoutMs: number;
    maxRedirects?: number;
    lookup?: LookupLike;
    fetchImpl?: FetchLike;
  },
): Promise<ProbeOutcome> => {
  const headers = { "User-Agent": options.userAgent };
  const shared = {
    timeoutMs: options.timeoutMs,
    maxRedirects: options.maxRedirects,
    lookup: options.lookup,
    fetchImpl: options.fetchImpl,
  };
  try {
    const head = await fetchWithPublicGuard(rawUrl, {
      method: "HEAD",
      headers,
      ...shared,
    });
    const headOutcome = classifyProbeStatus(head.response.status);
    if (headOutcome && head.response.status !== 405 && head.response.status !== 501) {
      return headOutcome;
    }
    const get = await fetchWithPublicGuard(rawUrl, {
      method: "GET",
      headers: { ...headers, Range: "bytes=0-255" },
      ...shared,
    });
    await get.response.body?.cancel();
    return classifyProbeStatus(get.response.status) ?? "unavailable";
  } catch (error) {
    if (error instanceof UnsafeDestinationError) return "unsafe";
    const name = (error as Error)?.name ?? "";
    if (name === "TimeoutError" || name === "AbortError") return "timeout";
    return "unknown";
  }
};
