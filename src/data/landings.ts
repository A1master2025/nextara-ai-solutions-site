// src/data/landings.ts
// Landing pages are conversion-first offer pages.
// Governance:
// - Default SEO posture: noindex,follow (set seo.indexable=true only when explicitly intended)
// - Routes live under: /landing/<slug>/
// - Content must be deterministic, structured, and renderer-friendly (no ad hoc HTML strings)

export type RiskLevel = "RED" | "AMBER" | "GREEN";

export type LandingCta = {
  label: string;
  href: string;
  description?: string;
  gtmEvent?: string;
};

export type LandingSeo = {
  indexable: boolean; // landing pages default false
  canonicalPath: string; // e.g. "/landing/suppression-screen/"
  metaTitle: string;
  metaDescription: string;
  ogImage?: string; // path under /public (e.g. "/og/suppression-screen.png")
};

export type LandingHero = {
  headline: string;
  subheadline: string;
  bullets: string[]; // 3–5 bullets; outcome-oriented
  primaryCta: LandingCta;
  secondaryCta?: LandingCta;
  disclaimer?: string; // optional, for Tier 1 / public-only claims
};

export type LandingProof = {
  title: string;
  bullets: string[];
  note?: string; // short, conservative; avoid overpromising
};

export type LandingHowItWorksStep = {
  title: string;
  description: string;
};

export type LandingHowItWorks = {
  title: string;
  steps: LandingHowItWorksStep[]; // 3 steps max recommended
};

export type LandingDeliverables = {
  title: string;
  items: string[];
  note?: string;
};

export type LandingFit = {
  title: string;
  goodFit: string[];
  notAfit: string[];
};

export type LandingFaqItem = {
  q: string;
  a: string; // 2–4 sentences, first sentence definitional
};

export type LandingTracking = {
  pageType: "landing";
  offerKey:
    | "suppression_screen"
    | "growth_blocker_audit"
    | "dcs_core"
    | "module_paid_search"
    | "module_authority_content"
    | "module_cro"
    | "module_local_seo"
    | "module_follow_up";
  primaryCtaEvent?: string;
  secondaryCtaEvent?: string;
};

export type Landing = {
  slug: string;
  name: string;
  seo: LandingSeo;
  hero: LandingHero;
  proof?: LandingProof;
  howItWorks?: LandingHowItWorks;
  deliverables?: LandingDeliverables;
  fit?: LandingFit;
  faq?: LandingFaqItem[];
  finalCta?: {
    title: string;
    primaryCta: LandingCta;
    secondaryCta?: LandingCta;
    note?: string;
  };
  tracking: LandingTracking;
};

export const LANDING_SLUGS = [
  "suppression-screen",
  "growth-blocker-audit",
  "dcs-core",
] as const;

export type LandingSlug = (typeof LANDING_SLUGS)[number];

const base = {
  siteName: "NexTara AI Solutions",
} as const;

/**
 * Canonical landings (initial set)
 * - suppression-screen (Tier 1 / public signals)
 * - growth-blocker-audit (paid diagnostic)
 * - dcs-core (ongoing measurement system)
 */
export const LANDINGS: Landing[] = [
  {
    slug: "suppression-screen",
    name: "SERP Suppression Screen",
    seo: {
      indexable: false,
      canonicalPath: "/landing/suppression-screen/",
      metaTitle: `SERP Suppression Screen | Know if Google is ignoring your site — fast | ${base.siteName}`,
      metaDescription:
        "Run a public-signals scan to detect indexation and suppression risk. Get a RED/AMBER/GREEN risk level, severity counts, and one proof finding—then book the Growth Blocker Audit to resolve it.",
      ogImage: "/og/suppression-screen.png",
    },
    hero: {
      headline: "Find out if Google is suppressing your site.",
      subheadline:
        "A public-signals-only scan that flags suppression risk without logins—so you can stop guessing and start acting with proof.",
      bullets: [
        "Suppression Risk Level: RED / AMBER / GREEN",
        "P0–P3 severity counts (root-cause, not noise)",
        "One proof finding with public evidence you can verify",
      ],
      primaryCta: {
        label: "Run the Suppression Screen",
        href: "/landing/suppression-screen/#run",
        description: "Enter your domain to generate a public-signals report.",
        gtmEvent: "nt_suppression_screen_run_click",
      },
      secondaryCta: {
        label: "Book the Growth Blocker Audit",
        href: "/landing/growth-blocker-audit/",
        description:
          "Unlock the full backlog with prioritized fixes and verification protocol.",
        gtmEvent: "nt_suppression_screen_to_audit_click",
      },
      disclaimer:
        "This screen uses public signals only. It does not include Search Console or analytics data.",
    },
    proof: {
      title: "What you get (and what you don’t)",
      bullets: [
        "You get a risk level, severity counts, and one evidence-backed proof finding.",
        "You do not get the complete suppressor backlog or step-by-step remediation plan on this screen.",
        "The paid Growth Blocker Audit provides the full prioritized backlog, verification steps, and module readiness gating.",
      ],
      note:
        "We keep the screen constrained by design: it proves competence without giving away the full playbook.",
    },
    howItWorks: {
      title: "How it works",
      steps: [
        {
          title: "Enter your domain",
          description:
            "We fetch public artifacts (homepage HTML, robots.txt, sitemap, and key pages) using deterministic rules.",
        },
        {
          title: "We analyze suppression signals",
          description:
            "The screen flags crawl/index blockers, canonical miswiring, thin/duplicate patterns, and other negative signals—evidence first.",
        },
        {
          title: "You get a proof-backed result",
          description:
            "You receive RED/AMBER/GREEN, P0–P3 counts, and one proof finding you can validate publicly.",
        },
      ],
    },
    deliverables: {
      title: "Outputs (Tier 1 / public signals)",
      items: [
        "Suppression Risk Level (RED/AMBER/GREEN)",
        "Counts of findings by severity (P0–P3)",
        "One proof finding (evidence + why it suppresses + how to verify)",
        "Confidence note that clarifies the limits of public signals",
      ],
      note:
        "For confirmed causes and priorities based on Google’s own data, use the Growth Blocker Audit (Tier 2).",
    },
    fit: {
      title: "Who this is for",
      goodFit: [
        "You have content but low impressions/clicks",
        "New pages aren’t indexing or rankings are flat",
        "You suspect a migration, canonical, or noindex issue",
        "You want proof before investing in ads or more content",
      ],
      notAfit: [
        "You want a full remediation plan without a paid audit",
        "Your site is behind authentication (public signals unavailable)",
        "You’re looking for competitor research or backlink strategy (out of scope here)",
      ],
    },
    faq: [
      {
        q: "Is this a free audit?",
        a: "This is a free suppression screen based on public signals only. It’s designed to show whether suppression risk is present and provide one proof finding you can verify. The full Growth Blocker Audit is the paid deliverable that includes the complete backlog and priorities.",
      },
      {
        q: "What does RED/AMBER/GREEN mean?",
        a: "It’s a mechanical roll-up of severity counts. RED means there is at least one visibility kill switch (P0) or multiple strong suppressors (P1). AMBER means no P0 exists but meaningful suppressors remain, and GREEN means only moderate or hygiene issues were detected in public signals.",
      },
      {
        q: "Will this tell me exactly how to fix everything?",
        a: "No. The screen is intentionally constrained and will not list the full suppressor backlog or remediation steps. If you want the complete plan with verification steps and priorities, book the Growth Blocker Audit.",
      },
      {
        q: "Does noindex affect tracking or analytics?",
        a: "Noindex only affects search visibility. You can still measure events and conversions through GTM/GA4 regardless of whether a page is indexed.",
      },
    ],
    finalCta: {
      title: "Ready to stop guessing?",
      primaryCta: {
        label: "Run the Suppression Screen",
        href: "/landing/suppression-screen/#run",
        description: "Get your risk level and proof finding in minutes.",
        gtmEvent: "nt_suppression_screen_run_click_bottom",
      },
      secondaryCta: {
        label: "Book the Growth Blocker Audit",
        href: "/landing/growth-blocker-audit/",
        description: "Get the full backlog with priorities and verification.",
        gtmEvent: "nt_suppression_screen_to_audit_click_bottom",
      },
      note:
        "If your risk level is RED or AMBER, the fastest path to recovery is the Growth Blocker Audit.",
    },
    tracking: {
      pageType: "landing",
      offerKey: "suppression_screen",
      primaryCtaEvent: "nt_suppression_screen_run_click",
      secondaryCtaEvent: "nt_suppression_screen_to_audit_click",
    },
  },

  {
    slug: "growth-blocker-audit",
    name: "Growth Blocker Audit",
    seo: {
      indexable: false,
      canonicalPath: "/landing/growth-blocker-audit/",
      metaTitle: `Growth Blocker Audit | Find what’s suppressing leads and visibility | ${base.siteName}`,
      metaDescription:
        "A deterministic diagnostic that identifies what’s breaking tracking, suppressing visibility, and causing leads to get lost. Get evidence, priorities, and a verification protocol—then decide on Core + Modules.",
      ogImage: "/og/growth-blocker-audit.png",
    },
    hero: {
      headline: "Find what’s blocking growth—and get a prioritized plan.",
      subheadline:
        "The Growth Blocker Audit is a paid diagnostic that turns guesswork into a clear, evidence-backed roadmap.",
      bullets: [
        "Complete P0–P3 backlog with evidence",
        "Prioritized roadmap (48 hours / 2 weeks / 60 days)",
        "Verification protocol to confirm fixes and recovery",
      ],
      primaryCta: {
        label: "Book the Growth Blocker Audit",
        href: "/contact/?intent=growth-blocker-audit",
        description:
          "Get the full backlog, priorities, and verification protocol.",
        gtmEvent: "nt_gba_book_click",
      },
      secondaryCta: {
        label: "Learn how NexTara works",
        href: "/resources/how-nextara-works/",
        description: "Core first, then modules—everything stays provable.",
        gtmEvent: "nt_gba_how_it_works_click",
      },
    },
    proof: {
      title: "Why this audit exists",
      bullets: [
        "Most teams add tactics before measurement is trustworthy, so nobody can prove what worked.",
        "This audit identifies what’s suppressing visibility, breaking attribution, and losing leads—based on evidence, not opinions.",
        "If we’re a fit, Core (DCS) maintains measurement integrity so improvements stay provable.",
      ],
    },
    howItWorks: {
      title: "How the audit works",
      steps: [
        {
          title: "We diagnose suppression and leakage",
          description:
            "We analyze crawl/indexation, quality/trust signals, and conversion paths to find what’s actively holding performance back.",
        },
        {
          title: "We deliver the prioritized backlog",
          description:
            "You receive P0–P3 findings with evidence and a timeline-based roadmap to sequence fixes correctly.",
        },
        {
          title: "We define verification",
          description:
            "We specify how to confirm each fix and what to watch for as Google recrawls and performance stabilizes.",
        },
      ],
    },
    deliverables: {
      title: "Deliverables",
      items: [
        "Full P0–P3 findings backlog with evidence",
        "Suppression Risk Level roll-up and rationale",
        "Source attribution (how each issue likely entered the stack)",
        "Priority roadmap (48 hours / 2 weeks / 60 days)",
        "Verification protocol (what to check and when)",
        "Module readiness gating (Core first, then modules based on reality)",
      ],
    },
    fit: {
      title: "Who it’s for",
      goodFit: [
        "You want clarity on what’s suppressing leads and visibility",
        "You’ve had a migration, redesign, or tracking changes recently",
        "You’re spending on ads/content but can’t prove ROI",
        "You want a clean sequence for fixes and next investments",
      ],
      notAfit: [
        "You only want tactics without fixing measurement integrity",
        "You want backlink purchasing or competitor teardown (not included here)",
        "You want a full build/dev project without a diagnostic step",
      ],
    },
    faq: [
      {
        q: "How long does the Growth Blocker Audit take?",
        a: "It’s a fixed-scope diagnostic delivered on a defined timeline. The exact turnaround depends on site size and access, but the output is always a prioritized backlog with verification steps. If you need a faster turnaround, that is scoped explicitly at booking.",
      },
      {
        q: "What happens first?",
        a: "We start by confirming what inputs are available and what symptoms you’re seeing. Then we diagnose suppression signals and lead-flow breaks using evidence from the site and, if applicable, platform data. Finally, we deliver the backlog and roadmap in a format you can execute against.",
      },
      {
        q: "How do we measure success?",
        a: "Success is measured by resolving P0/P1 items, validating fixes, and restoring stable crawl/index behavior and lead attribution. The verification protocol ensures you can confirm resolution rather than assume it. If you proceed with Core (DCS), ongoing monitoring prevents regression.",
      },
      {
        q: "Is this the same as the free suppression screen?",
        a: "No. The screen is a constrained public-signals snapshot with one proof finding. The Growth Blocker Audit is the paid deliverable that includes the full backlog, priorities, verification protocol, and module readiness gating.",
      },
    ],
    finalCta: {
      title: "Get the plan you can execute.",
      primaryCta: {
        label: "Book the Growth Blocker Audit",
        href: "/contact/?intent=growth-blocker-audit",
        description:
          "Full backlog with evidence, priorities, and verification steps.",
        gtmEvent: "nt_gba_book_click_bottom",
      },
      secondaryCta: {
        label: "Learn About Core (DCS)",
        href: "/services/dcs/",
        description: "Ongoing measurement system that makes outcomes provable.",
        gtmEvent: "nt_gba_to_dcs_click_bottom",
      },
    },
    tracking: {
      pageType: "landing",
      offerKey: "growth_blocker_audit",
      primaryCtaEvent: "nt_gba_book_click",
      secondaryCtaEvent: "nt_gba_how_it_works_click",
    },
  },

  {
    slug: "dcs-core",
    name: "Digital Control System (Core)",
    seo: {
      indexable: false,
      canonicalPath: "/landing/dcs-core/",
      metaTitle: `Digital Control System (Core) | Make your marketing provable | ${base.siteName}`,
      metaDescription:
        "The Digital Control System is the ongoing tracking and measurement layer that keeps reporting provable. It defines leads, prevents double counting, and fixes drift so Core + Modules can be accountable.",
      ogImage: "/og/dcs-core.png",
    },
    hero: {
      headline: "Make your marketing provable—then scale what works.",
      subheadline:
        "Core (DCS) owns and maintains the tracking layer so leads are counted once, attributed correctly, and reported consistently month to month.",
      bullets: [
        "Calls, forms, and bookings tracked correctly (GA4/GTM)",
        "Lead definitions aligned to your business (no double counting)",
        "Ongoing monitoring so reporting stays stable as the site changes",
      ],
      primaryCta: {
        label: "Talk to us about Core (DCS)",
        href: "/contact/?intent=dcs-core",
        description: "Confirm fit and scope Core for your stack.",
        gtmEvent: "nt_dcs_core_contact_click",
      },
      secondaryCta: {
        label: "Start with the Growth Blocker Audit",
        href: "/landing/growth-blocker-audit/",
        description:
          "If you need diagnosis first, we’ll map blockers and priorities.",
        gtmEvent: "nt_dcs_core_to_gba_click",
      },
    },
    proof: {
      title: "Why Core is required",
      bullets: [
        "If tracking isn’t trustworthy, performance claims are opinions—not proof.",
        "Core prevents regression by detecting drift and fixing measurement breaks as they happen.",
        "Modules work best when measurement is stable, so optimization is real and repeatable.",
      ],
    },
    howItWorks: {
      title: "How Core (DCS) works",
      steps: [
        {
          title: "Define what counts as a lead",
          description:
            "Calls, forms, and bookings are defined clearly so reporting is consistent and comparable month to month.",
        },
        {
          title: "Implement and validate tracking",
          description:
            "We configure GA4/GTM and validate event integrity so leads are attributed correctly without duplication.",
        },
        {
          title: "Monitor, fix drift, and maintain proof",
          description:
            "As your site, forms, and campaigns change, Core detects breakage and keeps reporting reliable.",
        },
      ],
    },
    deliverables: {
      title: "What Core includes",
      items: [
        "GTM container governance and event integrity",
        "GA4 configuration and QA",
        "Lead definitions (calls/forms/bookings) and deduplication",
        "Leak detection: where leads are getting lost in the flow",
        "Ongoing drift monitoring and regression fixes",
        "Monthly performance clarity tied to lead actions",
      ],
      note:
        "Core is the foundation. Modules are added after Core proves what’s working and where the bottlenecks are.",
    },
    fit: {
      title: "Fit check",
      goodFit: [
        "You want accountability tied to leads, not vanity metrics",
        "You have multiple lead sources (calls/forms/bookings) and need clean attribution",
        "You’re investing in growth and want optimization to be real",
      ],
      notAfit: [
        "You want tactics without measurement integrity",
        "You do not want GTM/GA4 governed as a system",
        "You want a one-time setup and no ongoing monitoring",
      ],
    },
    faq: [
      {
        q: "Is Core a one-time setup?",
        a: "No. Core is an ongoing system that maintains measurement integrity over time. Websites and campaigns change, and tracking drifts unless it’s actively governed. Core exists to keep your reporting provable month after month.",
      },
      {
        q: "Can I buy modules without Core?",
        a: "No. Modules depend on measurement integrity to prove ROI and optimize correctly. Without Core, both sides are guessing and accountability breaks down. If you’re not ready for Core, start with the Growth Blocker Audit to diagnose what’s blocking you first.",
      },
      {
        q: "What does “provable” mean in practice?",
        a: "Provable means every call, form, and booking is counted once, attributed to a source, and reported consistently with stable definitions. When outcomes change, you can explain why using evidence rather than assumptions. That’s the foundation for scaling any module.",
      },
    ],
    finalCta: {
      title: "If you want proof, start with Core.",
      primaryCta: {
        label: "Talk to us about Core (DCS)",
        href: "/contact/?intent=dcs-core",
        description: "We’ll confirm fit and map the right next step.",
        gtmEvent: "nt_dcs_core_contact_click_bottom",
      },
      secondaryCta: {
        label: "Book the Growth Blocker Audit",
        href: "/landing/growth-blocker-audit/",
        description: "Diagnose blockers first, then implement Core cleanly.",
        gtmEvent: "nt_dcs_core_to_gba_click_bottom",
      },
    },
    tracking: {
      pageType: "landing",
      offerKey: "dcs_core",
      primaryCtaEvent: "nt_dcs_core_contact_click",
      secondaryCtaEvent: "nt_dcs_core_to_gba_click",
    },
  },
];

/**
 * Convenience helpers
 */
export const LANDINGS_BY_SLUG: Record<string, Landing> = LANDINGS.reduce(
  (acc, landing) => {
    acc[landing.slug] = landing;
    return acc;
  },
  {} as Record<string, Landing>,
);

export function getLanding(slug: string): Landing | null {
  return LANDINGS_BY_SLUG[slug] ?? null;
}
