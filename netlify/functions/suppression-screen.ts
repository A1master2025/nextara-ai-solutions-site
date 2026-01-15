// netlify/functions/suppression-screen.ts
import type { Handler } from "@netlify/functions";

type RiskLevel = "RED" | "AMBER" | "GREEN";

type Output = {
  schema_version: "1.0";
  scan_metadata: {
    domain: string;
    scan_date: string; // YYYY-MM-DD
    inputs_used: string[];
    inputs_missing: string[];
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
  security_flags: string[];
  cta: {
    primary: { label: string; description: string };
    secondary: { label: string; description: string };
  };
};

type ErrorOutput = {
  schema_version: "1.0";
  error: true;
  error_type: string;
  error_message: string;
  partial_result: null | object;
};

function isoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function json(statusCode: number, bodyObj: Output | ErrorOutput) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(bodyObj),
  };
}

function safeParseJson(body: string | null): any | null {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export const handler: Handler = async (event) => {
  // Accept either:
  // 1) query string: ?url=https://example.com
  // 2) JSON body: { "url": "https://example.com" }
  const qsUrl = event.queryStringParameters?.url ?? null;
  const bodyObj = safeParseJson(event.body ?? null);
  const bodyUrl = (bodyObj && typeof bodyObj.url === "string") ? bodyObj.url : null;

  const urlInput = String(qsUrl ?? bodyUrl ?? "").trim();

  if (!urlInput) {
    return json(400, {
      schema_version: "1.0",
      error: true,
      error_type: "INVALID_URL",
      error_message: "Missing ?url= parameter (or JSON body with { url }).",
      partial_result: null,
    });
  }

  // Stub response for wiring verification (not a real scan yet)
  const out: Output = {
    schema_version: "1.0",
    scan_metadata: {
      domain: urlInput,
      scan_date: isoDate(),
      inputs_used: ["homepage", "robots_txt", "sitemap_xml", "extra_pages"],
      inputs_missing: [],
      pages_analyzed: 1,
    },
    result: {
      risk_level: "GREEN",
      trajectory: null,
      counts: { p0: 0, p1: 0, p2: 0, p3: 0 },
      interpretation:
        "No major kill-switch signals detected in limited public signals.",
    },
    proof: {
      severity: "P2",
      category: "Moderate Drag",
      finding: "No clear suppressors detected in limited public signals",
      evidence: {
        url: urlInput,
        snippet: "No P0/P1 signals found in fetched artifacts.",
      },
      why_it_suppresses:
        "With limited pages, some suppressors may be hidden or non-public.",
      how_to_verify:
        "Confirm robots/canonicals/noindex via source + headers, or run paid audit.",
    },
    module_readiness_hint:
      "This is a public-signals screen. If RED/AMBER, fix indexation/canonical/robots before scaling content or paid traffic.",
    confidence_note:
      "Based on public signals only. Additional suppressors may exist. Full diagnostic with prioritized fixes requires a Growth Blocker Audit.",
    security_flags: [],
    cta: {
      primary: {
        label: "Book Growth Blocker Audit",
        description:
          "Complete P0–P3 backlog with evidence, source attribution, priority roadmap, and module readiness assessment.",
      },
      secondary: {
        label: "Learn About Core",
        description:
          "Ongoing measurement system that makes your marketing provable.",
      },
    },
  };

  return json(200, out);
};
