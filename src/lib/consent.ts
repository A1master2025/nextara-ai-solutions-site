// src/lib/consent.ts
// Consent foundation (verify + persist + broadcast)
// Version: CG0-B1-v1.0

declare global {
  interface Window {
    nt_consent_granted?: boolean;
    nt_show_consent_banner?: boolean;
    dataLayer?: any[];
  }
}

const KEY = "nt_consent_analytics";
const TS_KEY = "nt_consent_timestamp";

function pushDL(event: Record<string, any>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function initConsentFoundation() {
  const stored = localStorage.getItem(KEY); // "granted" | "denied" | null

  // Default state: treat as denied until proven granted
  window.nt_consent_granted = stored === "granted";
  window.nt_show_consent_banner = stored === null;

  // Baseline event (pre-consent system event)
  pushDL({
    event: "nt_consent_default",
    consent_state: window.nt_consent_granted ? "granted" : (stored === "denied" ? "denied" : "unknown"),
    consent_source: stored ? "localStorage" : "default",
  });

  // If stored exists, broadcast readiness
  if (stored === "granted" || stored === "denied") {
    pushDL({
      event: "nt_consent_ready",
      consent_state: stored,
      consent_source: "localStorage",
    });
  }
}

export function setConsent(state: "granted" | "denied", source: "user_action" | "system" = "user_action") {
  localStorage.setItem(KEY, state);
  localStorage.setItem(TS_KEY, new Date().toISOString());

  window.nt_consent_granted = state === "granted";
  window.nt_show_consent_banner = false;

  pushDL({
    event: "nt_consent_update",
    consent_state: state,
    consent_source: source,
  });

  pushDL({
    event: "nt_consent_ready",
    consent_state: state,
    consent_source: source,
  });
}