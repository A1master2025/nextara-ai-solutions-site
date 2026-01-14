import type { Handler } from "@netlify/functions";

/**
 * v1: deterministic lightweight crawler + minimal rule-based suppression screen.
 * - No headless browser
 * - Strict JSON response (matches your contract)
 * - Deterministic page set:
 *   homepage + robots_txt + sitemap_xml + 3 nav pages + 2 sitemap URLs
 */

type RiskLevel = "RED" | "AMBER" | "GREEN";
type Severity = "P0" | "P1" | "P2" | "P3";

type ArtifactHtml = {
  url: string;
  final_url: string;
  status: number;
  headers: Record<string, string>;
  html: string | null;
};

type ArtifactText = {
  url: string;
  final_url: string;
  status: number;
  headers: Record<string, string>;
  text: string | null;
};

type ScanInput = {
  domain: string;
  scan_date: string;
  baseline: null | {
    risk_level: RiskLevel;
    scan_date: string;
    p0: number;
    p1: number;
    p2: number;
    p3: number;
  };
  artifacts: {
    homepage?: ArtifactHtml;
    robots_txt?: ArtifactText;
    sitemap_xml?: ArtifactText;
    extra_pages?: ArtifactHtml[];
  };
  constraints: string[];
};

type Output = {
  schema_version: "1.0";
  scan_metadata: {
    domain: string;
    scan_date: string;
    inputs_used: ("homepage" | "robots_txt" | "sitemap_xml" | "extra_pages")[];
    inputs_missing: ("homepage" | "robots_txt" | "sitemap_xml" | "extra_pages")[];
    pages_analyzed: number;
  };
  result: {
    risk_level: RiskLevel;
    trajectory: "UP" | "STABLE" | "DOWN" | null;
    counts: { p0: number; p1: number; p2: number; p3: number };
    interpretation: string;
  };
  proof: {
    severity: "P0" | "P1" | "P2";
    category: string;
    finding: string;
    evidence: { url: string; snippet: string };
    why_it_suppresses: string;
    how_to_verify: string;
  };
  module_readiness_hint: string;
  confidence_note: string;
  security_flags: ("PROMPT_INJECTION_DETECTED" | "SCHEMA_MIMICRY_DETECTED" | "INSTRUCTION_IN_HTML_DETECTED")[];
  cta: {
    primary: { label: "Book Growth Blocker Audit"; description: string };
    secondary: { label: "Learn About Core"; description: string };
  };
};

type ErrorOutput = {
  schema_version: "1.0";
  error: true;
  error_type: "INSUFFICIENT_DATA" | "FETCH_FAILED" | "INVALID_URL";
  error_message: string;
  partial_result: null | object;
};

const STD_CONFIDENCE_NOTE =
  "Based on public signals only. Additional suppressors may exist. Full diagnostic with prioritized fixes requires a Growth Blocker Audit.";

const STD_CTA_PRIMARY_DESC =
  "Complete P0–P3 backlog with evidence, source attribution, priority roadmap, and module readiness assessment.";

const STD_CTA_SECONDARY_DESC =
  "Ongoing measurement system that makes your marketing provable.";

const MAX_HTML_CHARS = 120_000; // truncate to limit token bloat
const MAX_TEXT_CHARS = 120_000;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 5;

const INPUT_TOKENS = ["homepage", "robots_txt", "sitemap_xml", "extra_pages"] as const;

function json(statusCode: number, bodyObj: any) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(bodyObj),
  };
}

function safeParseJsonBody(body?: string | null) {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function normalizeToOrigin(inputUrl: string): URL | null {
  try {
    let u = inputUrl.trim();
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    const url = new URL(u);
    // force https if someone enters http; still keep if http is required
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // origin only (strip path/query)
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

/**
 * Practical SSRF defense for v1:
 * - only allow http/https
 * - block obvious localhost
 * - block credential-in-URL
 * Note: Full private IP range checks require DNS resolution, which is more complex.
 * This is still materially better than nothing for a public tool.
 */
function basicSsrfGuards(url: URL): string | null {
  if (url.username || url.password) return "INVALID_URL: credentials in URL not allowed";
  const host = url.hostname.toLowerCase();

  const blockedHosts = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
  ]);

  if (blockedHosts.has(host)) return "INVALID_URL: localhost is not allowed";

  // Block obvious internal TLDs often used in corp networks
  if (host.endsWith(".local") || host.endsWith(".internal")) {
    return "INVALID_URL: internal hostnames are not allowed";
  }

  return null;
}

function lowerHeaders(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((v, k) => {
    out[k.toLowerCase()] = v;
  });
  return out;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      // basic headers for predictable content
      headers: {
        "user-agent": "NexTaraSuppressionScreen/1.0 (+https://nextara-ai-solutions.com)",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.1",
      },
    });
  } finally {
    clearTimeout(t);
  }
}

function truncate(s: string, maxChars: number) {
  if (s.length <= maxChars) return s;
  return s.slice(0, maxChars) + "...";
}

function stripScriptsStylesComments(html: string) {
  // lightweight sanitation (not a full HTML sanitizer)
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
}

function isProbablyHtml(contentType?: string) {
  if (!contentType) return false;
  return contentType.includes("text/html") || contentType.includes("application/xhtml+xml");
}

function makeAbsoluteUrl(candidate: string, base: URL): URL | null {
  try {
    const u = new URL(candidate, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    return u;
  } catch {
    return null;
  }
}

function sameOrigin(a: URL, b: URL) {
  return a.origin === b.origin;
}

function extractHomepageLinks(html: string, base: URL): URL[] {
  // Simple href extraction. Deterministic: regex order in HTML.
  const urls: URL[] = [];
  const re = /<a\b[^>]*?\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1]?.trim();
    if (!href) continue;
    if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;

    const abs = makeAbsoluteUrl(href, base);
    if (!abs) continue;
    if (!sameOrigin(abs, base)) continue;

    // drop obvious non-pages
    const p = abs.pathname.toLowerCase();
    if (/\.(pdf|jpg|jpeg|png|gif|webp|svg|zip)$/i.test(p)) continue;

    urls.push(abs);
  }

  // De-dupe preserving order
  const seen = new Set<string>();
  const out: URL[] = [];
  for (const u of urls) {
    const key = u.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out;
}

function pickPriorityNavPages(links: URL[], limit: number): URL[] {
  // deterministic: priority keywords then shortest path
  const priorityKeywords = [
    "contact",
    "about",
    "services",
    "service",
    "pricing",
    "book",
    "audit",
    "diagnostic",
  ];

  const scored = links.map((u) => {
    const path = u.pathname.toLowerCase();
    let score = 999;
    for (let i = 0; i < priorityKeywords.length; i++) {
      if (path.includes(priorityKeywords[i])) {
        score = i;
        break;
      }
    }
    // tie-breakers: shorter path, then lexicographic
    return { u, score, len: path.length, path };
  });

  scored.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    if (a.len !== b.len) return a.len - b.len;
    return a.path.localeCompare(b.path);
  });

  const picked: URL[] = [];
  const seen = new Set<string>();
  for (const s of scored) {
    const key = s.u.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    // exclude homepage root
    if (s.u.pathname === "/") continue;
    picked.push(s.u);
    if (picked.length >= limit) break;
  }
  return picked;
}

function extractSitemapLocs(xmlText: string, base: URL): URL[] {
  // Supports sitemapindex + urlset in a basic way
  const locs: URL[] = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xmlText))) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    const abs = makeAbsoluteUrl(raw, base);
    if (!abs) continue;
    if (!sameOrigin(abs, base)) continue;
    locs.push(abs);
  }
  // de-dupe
  const seen = new Set<string>();
  const out: URL[] = [];
  for (const u of locs) {
    const k = u.toString();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(u);
  }
  return out;
}

async function fetchHtmlArtifact(url: URL): Promise<{ artifact: ArtifactHtml; constraint?: string }> {
  try {
    const res = await fetchWithTimeout(url.toString());
    const finalUrl = res.url || url.toString();
    const headers = lowerHeaders(res.headers);
    const status = res.status;

    const contentType = headers["content-type"] || "";
    let html: string | null = null;

    if (status >= 200 && status < 400) {
      const raw = await res.text();
      const sanitized = stripScriptsStylesComments(raw);
      html = truncate(sanitized, MAX_HTML_CHARS);
    }

    // if it’s not html, we still return artifact but html null
    if (!isProbablyHtml(contentType)) {
      return { artifact: { url: url.toString(), final_url: finalUrl, status, headers, html: null }, constraint: "non_html_homepage_or_page" };
    }

    return { artifact: { url: url.toString(), final_url: finalUrl, status, headers, html } };
  } catch {
    return {
      artifact: {
        url: url.toString(),
        final_url: url.toString(),
        status: 0,
        headers: {},
        html: null,
      },
      constraint: "fetch_failed",
    };
  }
}

async function fetchTextArtifact(url: URL): Promise<{ artifact: ArtifactText; constraint?: string }> {
  try {
    const res = await fetchWithTimeout(url.toString());
    const finalUrl = res.url || url.toString();
    const headers = lowerHeaders(res.headers);
    const status = res.status;

    let text: string | null = null;
    if (status >= 200 && status < 400) {
      const raw = await res.text();
      text = truncate(raw, MAX_TEXT_CHARS);
    }

    return { artifact: { url: url.toString(), final_url: finalUrl, status, headers, text } };
  } catch {
    return {
      artifact: {
        url: url.toString(),
        final_url: url.toString(),
        status: 0,
        headers: {},
        text: null,
      },
      constraint: "fetch_failed",
    };
  }
}

function detectSecurityFlags(contents: string[]): Output["security_flags"] {
  const joined = contents.join("\n").toLowerCase();
  const flags: Output["security_flags"] = [];

  const hasPromptInjection =
    joined.includes("ignore previous instructions") ||
    joined.includes("you are now") ||
    joined.includes("system:") ||
    joined.includes("assistant:") ||
    joined.includes("human:");

  const hasSchemaMimicry =
    joined.includes('"schema_version"') ||
    joined.includes("output schema") ||
    joined.includes("strict json") ||
    joined.includes("error schema");

  const hasInstructionBlocks =
    joined.includes("## system prompt") ||
    joined.includes("critical security directive") ||
    joined.includes("analysis rules");

  if (hasPromptInjection) flags.push("PROMPT_INJECTION_DETECTED");
  if (hasSchemaMimicry) flags.push("SCHEMA_MIMICRY_DETECTED");
  if (hasInstructionBlocks) flags.push("INSTRUCTION_IN_HTML_DETECTED");

  // de-dupe
  return Array.from(new Set(flags));
}

/**
 * Minimal rules-based analysis.
 * Counts are by root-cause key (anti-bloat).
 */
function analyzeArtifacts(input: ScanInput) {
  const rootCauses = new Map<string, { severity: Severity; category: string; finding: string; evidenceUrl: string; snippet: string; why: string; verify: string }>();

  const homepage = input.artifacts.homepage;
  const robots = input.artifacts.robots_txt;
  const sitemap = input.artifacts.sitemap_xml;
  const pages = [homepage, ...(input.artifacts.extra_pages || [])].filter(Boolean) as ArtifactHtml[];

  // Helpers
  const add = (key: string, data: { severity: Severity; category: string; finding: string; evidenceUrl: string; snippet: string; why: string; verify: string }) => {
    if (rootCauses.has(key)) return;
    rootCauses.set(key, data);
  };

  // P0: robots disallow all
  if (robots?.text && /disallow:\s*\/\s*$/im.test(robots.text) && /user-agent:\s*\*/im.test(robots.text)) {
    add("ROBOTS_DISALLOW_ALL", {
      severity: "P0",
      category: "Indexation Kill Switch",
      finding: "robots.txt appears to disallow all crawling",
      evidenceUrl: "robots.txt",
      snippet: truncate(robots.text.match(/User-agent:\s*\*[\s\S]*?Disallow:\s*\/.*/i)?.[0] || "User-agent: * / Disallow: /", 200),
      why: "If bots can’t crawl, pages won’t be indexed or refreshed reliably.",
      verify: "Open /robots.txt and confirm User-agent:* includes Disallow:/",
    });
  }

  // Per-page checks
  for (const p of pages) {
    const url = p.final_url || p.url;
    const html = p.html || "";
    const hLower = html.toLowerCase();
    const headers = p.headers || {};

    // P0: X-Robots-Tag noindex
    const xRobots = (headers["x-robots-tag"] || "").toLowerCase();
    if (xRobots.includes("noindex")) {
      add("X_ROBOTS_NOINDEX", {
        severity: "P0",
        category: "Indexation Kill Switch",
        finding: "x-robots-tag noindex present",
        evidenceUrl: url,
        snippet: truncate(`x-robots-tag: ${headers["x-robots-tag"]}`, 200),
        why: "noindex prevents the page from being indexed.",
        verify: "Check response headers for x-robots-tag containing noindex.",
      });
    }

    // P0: meta robots noindex
    if (hLower.includes('name="robots"') && hLower.includes("noindex")) {
      const m = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || "<meta name='robots' ...>";
      add("META_ROBOTS_NOINDEX", {
        severity: "P0",
        category: "Indexation Kill Switch",
        finding: "meta robots noindex present",
        evidenceUrl: url,
        snippet: truncate(m, 200),
        why: "noindex prevents indexing for the page.",
        verify: "View page source and locate meta name='robots' containing noindex.",
      });
    }

    // P1: canonical off-domain
    const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+>/i)?.[0] || null;
    const canonHref = canon?.match(/href=["']([^"']+)["']/i)?.[1] || null;
    if (canonHref) {
      try {
        const canonUrl = new URL(canonHref, url);
        const pageUrl = new URL(url);
        if (canonUrl.hostname && pageUrl.hostname && canonUrl.hostname !== pageUrl.hostname) {
          add("CANONICAL_OFFDOMAIN", {
            severity: "P0",
            category: "Indexation Kill Switch",
            finding: "canonical points to a different domain",
            evidenceUrl: url,
            snippet: truncate(canon, 200),
            why: "Off-domain canonicals can transfer indexing signals away from your site.",
            verify: "View source and confirm canonical hostname matches the page hostname.",
          });
        }
      } catch {
        // ignore malformed canonical
      }
    }

    // P2: missing title
    if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
      add("MISSING_TITLE", {
        severity: "P2",
        category: "Moderate Drag",
        finding: "missing <title> tag",
        evidenceUrl: url,
        snippet: "No <title> found in HTML.",
        why: "Titles are a primary relevance + CTR signal; missing titles reduce clarity.",
        verify: "View source and confirm whether a <title> exists in <head>.",
      });
    }
  }

  // P2: title duplication (root-cause level)
  const titles = new Map<string, string[]>(); // title -> urls
  for (const p of pages) {
    if (!p.html) continue;
    const title = p.html.match(/<title>\s*([\s\S]*?)\s*<\/title>/i)?.[1]?.trim();
    if (!title) continue;
    const list = titles.get(title) || [];
    list.push(p.final_url || p.url);
    titles.set(title, list);
  }
  for (const [title, urls] of titles) {
    if (urls.length >= 2) {
      add("DUP_TITLES", {
        severity: "P2",
        category: "Moderate Drag",
        finding: "duplicate <title> across multiple pages",
        evidenceUrl: urls[0],
        snippet: truncate(`<title>${title}</title>`, 200),
        why: "Duplicate titles dilute intent targeting and reduce snippet differentiation.",
        verify: "Check page sources and compare <title> across affected URLs.",
      });
      break; // root-cause counted once
    }
  }

  // Count severities
  let p0 = 0, p1 = 0, p2 = 0, p3 = 0;
  for (const [, v] of rootCauses) {
    if (v.severity === "P0") p0++;
    else if (v.severity === "P1") p1++;
    else if (v.severity === "P2") p2++;
    else p3++;
  }

  // risk level thresholds
  let risk: RiskLevel = "GREEN";
  if (p0 >= 1 || p1 >= 3) risk = "RED";
  else if (p0 === 0 && ((p1 >= 1 && p1 <= 2) || p2 >= 5)) risk = "AMBER";

  // select ONE proof: prefer P0, else P1, else P2
  const ordered = Array.from(rootCauses.values()).sort((a, b) => {
    const rank = (s: Severity) => (s === "P0" ? 0 : s === "P1" ? 1 : s === "P2" ? 2 : 3);
    return rank(a.severity) - rank(b.severity);
  });

  const proofPick = ordered.find((x) => x.severity === "P0") ||
    ordered.find((x) => x.severity === "P1") ||
    ordered.find((x) => x.severity === "P2");

  const proof = proofPick
    ? {
        severity: (proofPick.severity === "P3" ? "P2" : proofPick.severity) as "P0" | "P1" | "P2",
        category: proofPick.category,
        finding: truncate(proofPick.finding, 100),
        evidence: { url: proofPick.evidenceUrl, snippet: truncate(proofPick.snippet, 200) },
        why_it_suppresses: truncate(proofPick.why, 150),
        how_to_verify: truncate(proofPick.verify, 150),
      }
    : {
        severity: "P2" as const,
        category: "Moderate Drag",
        finding: "No clear suppressors detected in limited public signals",
        evidence: { url: input.domain, snippet: "No P0/P1 signals found in fetched artifacts." },
        why_it_suppresses: "With limited pages, some suppressors may be hidden or non-public.",
        how_to_verify: "Confirm robots/canonicals/noindex via source + headers, or run paid audit.",
      };

  // trajectory (risk-level change only)
  let trajectory: Output["result"]["trajectory"] = null;
  if (input.baseline?.risk_level) {
    const from = input.baseline.risk_level;
    const to = risk;
    if (from === to) trajectory = "STABLE";
    else if (from === "RED" && to === "AMBER") trajectory = "DOWN";
    else if (from === "AMBER" && to === "GREEN") trajectory = "DOWN";
    else if (from === "GREEN" && to === "AMBER") trajectory = "UP";
    else if (from === "AMBER" && to === "RED") trajectory = "UP";
    else if (from === "GREEN" && to === "RED") trajectory = "UP";
    else trajectory = "STABLE";
  }

  const interpretation =
    risk === "RED"
      ? "High suppression risk detected from public crawl/index signals."
      : risk === "AMBER"
      ? "Some suppression signals detected; investigate before scaling content/ads."
      : "No major kill-switch signals detected in limited public signals.";

  return {
    risk_level: risk,
    trajectory,
    counts: { p0, p1, p2, p3 },
    interpretation: truncate(interpretation, 150),
    proof,
  };
}

export const handler: Handler = async (event) => {
  const qsUrl = event.queryStringParameters?.url || null;
  const bodyObj = safeParseJsonBody(event.body);
  const bodyUrl = bodyObj?.url || null;
  const urlInput = (qsUrl || bodyUrl || "").toString().trim();

  if (!urlInput) {
    const err: ErrorOutput = {
      schema_version: "1.0",
      error: true,
      error_type: "INVALID_URL",
      error_message: "Missing ?url= parameter (or JSON body with { url }).",
      partial_result: null,
    };
    return json(400, err);
  }

  const originUrl = normalizeToOrigin(urlInput);
  if (!originUrl) {
    const err: ErrorOutput = {
      schema_version: "1.0",
      error: true,
      error_type: "INVALID_URL",
      error_message: "Invalid URL. Provide a domain or absolute http(s) URL.",
      partial_result: null,
    };
    return json(400, err);
  }

  const ssrfError = basicSsrfGuards(originUrl);
  if (ssrfError) {
    const err: ErrorOutput = {
      schema_version: "1.0",
      error: true,
      error_type: "INVALID_URL",
      error_message: ssrfError,
      partial_result: null,
    };
    return json(400, err);
  }

  const scanDate = new Date().toISOString().slice(0, 10);
  const constraints: string[] = [];

  // 1) homepage
  const homepageFetch = await fetchHtmlArtifact(originUrl);
  if (homepageFetch.constraint) constraints.push(homepageFetch.constraint);

  const homepage = homepageFetch.artifact;

  // If we can’t analyze any HTML pages at all, hard fail (per your rules)
  const hasHomepageHtml = homepage.status >= 200 && homepage.status < 400 && !!homepage.html;
  if (!hasHomepageHtml) {
    const err: ErrorOutput = {
      schema_version: "1.0",
      error: true,
      error_type: "INSUFFICIENT_DATA",
      error_message:
        "Homepage HTML unavailable (non-200, fetch failed, or non-HTML). Cannot run suppression screen.",
      partial_result: null,
    };
    return json(400, err);
  }

  const base = new URL(homepage.final_url || homepage.url);

  // 2) robots + sitemap (standard locations)
  const robotsUrl = new URL("/robots.txt", base);
  const sitemapUrl = new URL("/sitemap.xml", base);

  const robotsFetch = await fetchTextArtifact(robotsUrl);
  if (robotsFetch.constraint) constraints.push(robotsFetch.constraint);

  const sitemapFetch = await fetchTextArtifact(sitemapUrl);
  if (sitemapFetch.constraint) constraints.push(sitemapFetch.constraint);

  const robots_txt = robotsFetch.artifact;
  const sitemap_xml = sitemapFetch.artifact;

  if (robots_txt.status === 404 || robots_txt.status === 0) constraints.push("robots_unavailable");
  if (sitemap_xml.status === 404 || sitemap_xml.status === 0) constraints.push("sitemap_unavailable");

  // 3) deterministic extra pages:
  // - 3 priority nav pages from homepage links
  // - 2 urls from sitemap (if available)
  const homepageLinks = extractHomepageLinks(homepage.html || "", base);
  const navPicks = pickPriorityNavPages(homepageLinks, 3);

  let sitemapPicks: URL[] = [];
  if (sitemap_xml.text && sitemap_xml.status >= 200 && sitemap_xml.status < 400) {
    const locs = extractSitemapLocs(sitemap_xml.text, base);
    sitemapPicks = locs
      .filter((u) => u.pathname !== "/")
      .slice(0, 2);
  }

  // Merge deterministic, de-dupe, keep order: nav first, then sitemap
  const extraUrls: URL[] = [];
  const seen = new Set<string>();
  const pushUnique = (u: URL) => {
    const k = u.toString();
    if (seen.has(k)) return;
    seen.add(k);
    extraUrls.push(u);
  };
  navPicks.forEach(pushUnique);
  sitemapPicks.forEach(pushUnique);

  // Fetch extra pages
  const extra_pages: ArtifactHtml[] = [];
  for (const u of extraUrls) {
    const f = await fetchHtmlArtifact(u);
    if (f.constraint) constraints.push(f.constraint);
    extra_pages.push(f.artifact);
  }

  // constraint: truncation indicator (we don’t know exact raw length, but we can infer if ends with ...)
  if ((homepage.html || "").endsWith("...")) constraints.push("truncated_due_to_limits");
  if (extra_pages.some((p) => (p.html || "").endsWith("..."))) constraints.push("truncated_due_to_limits");

  // Assemble scan input (this is the object your Claude prompt expects)
  const scanInput: ScanInput = {
    domain: base.origin,
    scan_date: scanDate,
    baseline: bodyObj?.baseline || null,
    artifacts: {
      homepage,
      robots_txt,
      sitemap_xml,
      extra_pages,
    },
    constraints: Array.from(new Set(constraints)),
  };

  // Security flags (based on fetched artifacts; treat as untrusted)
  const security_flags = detectSecurityFlags([
    homepage.html || "",
    robots_txt.text || "",
    sitemap_xml.text || "",
    ...extra_pages.map((p) => p.html || ""),
  ]);

  // Minimal real analysis (replace later with Claude call if desired)
  const analysis = analyzeArtifacts(scanInput);

  // inputs_used / inputs_missing use ONLY these tokens
  const inputs_used: Output["scan_metadata"]["inputs_used"] = [];
  const inputs_missing: Output["scan_metadata"]["inputs_missing"] = [];

  const hasHomepage = !!scanInput.artifacts.homepage;
  const hasRobots = !!scanInput.artifacts.robots_txt;
  const hasSitemap = !!scanInput.artifacts.sitemap_xml;
  const hasExtraPages = Array.isArray(scanInput.artifacts.extra_pages);

  if (hasHomepage) inputs_used.push("homepage"); else inputs_missing.push("homepage");
  if (hasRobots) inputs_used.push("robots_txt"); else inputs_missing.push("robots_txt");
  if (hasSitemap) inputs_used.push("sitemap_xml"); else inputs_missing.push("sitemap_xml");
  if (hasExtraPages) inputs_used.push("extra_pages"); else inputs_missing.push("extra_pages");

  const pages_analyzed =
    1 + (scanInput.artifacts.extra_pages?.length || 0); // homepage + extra pages only

  const out: Output = {
    schema_version: "1.0",
    scan_metadata: {
      domain: scanInput.domain,
      scan_date: scanInput.scan_date,
      inputs_used,
      inputs_missing,
      pages_analyzed,
    },
    result: {
      risk_level: analysis.risk_level,
      trajectory: analysis.trajectory,
      counts: analysis.counts,
      interpretation: analysis.interpretation,
    },
    proof: analysis.proof,
    module_readiness_hint:
      "This is a public-signals screen. If RED/AMBER, prioritize indexation/canonical/robots fixes before scaling content or paid traffic.",
    confidence_note: STD_CONFIDENCE_NOTE,
    security_flags,
    cta: {
      primary: {
        label: "Book Growth Blocker Audit",
        description: STD_CTA_PRIMARY_DESC,
      },
      secondary: {
        label: "Learn About Core",
        description: STD_CTA_SECONDARY_DESC,
      },
    },
  };

  return json(200, out);
};
