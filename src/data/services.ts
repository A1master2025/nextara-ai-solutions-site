/**
 * Service Page Content Contract
 * src/data/services.ts
 * 
 * Phase 4 — Authority + Conversion Hardening
 * Every service page must satisfy this interface.
 * 
 * Registry validates at import time — build fails loudly on contract violations.
 */

// ============================================================
// SLUG TYPES (Compile-time safety for cross-references)
// ============================================================

export const SERVICE_SLUGS = [
  "growth-blocker-audit",
  "dcs-audits",
  "tracking-governance",
  "seo-indexing",
  "conversion-architecture",
  "paid-media-systems",
  "automation-ecc",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface Deliverable {
  title: string;
  description: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface ProofChecklistItem {
  label: string;
  detail: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CTA {
  label: string;
  href: string;
}

export interface ServicePage {
  // === Identity ===
  slug: ServiceSlug;
  order: number;                   // Deterministic hub/nav sorting
  name: string;                    // UI label (breadcrumbs, cards, nav)
  seoTitle: string;                // Full <title> tag with brand suffix
  metaDescription: string;         // SEO meta (max 160 chars)
  
  // === Hero Section ===
  outcomeHeadline: string;         // H1: outcome promise
  postureSubhead: string;          // Verification-oriented governance statement
  
  // === Audience Fit ===
  audienceFit: string[];           // "Who it's for" (3-5 items)
  audienceNotFit: string[];        // "Not for" (2-4 items)
  
  // === Deliverables Section ===
  deliverables: Deliverable[];     // "What you get" (3-6 items)
  
  // === Process Section ===
  processSteps: ProcessStep[];     // "How it works" (3-6 steps)
  
  // === Proof/Validation Section ===
  proofChecklist: ProofChecklistItem[];  // "What we verify" (3-6 items)
  
  // === FAQ Section ===
  faq: FAQ[];                      // Minimum 6 (objections + logistics + expectations)
  
  // === CTAs (locked defaults, can override) ===
  primaryCta?: CTA;
  secondaryCta?: CTA;
  
  // === Cross-linking ===
  relatedServices: ServiceSlug[];  // Slugs of 2-3 related services (type-safe)
}

// ============================================================
// CONVERSION SYSTEM DEFAULTS (Locked per governance spec)
// ============================================================

export const CTA_DEFAULTS = {
  primary: (slug: ServiceSlug): CTA => ({
    label: "Request a Consultation",
    href: `/contact/?service=${encodeURIComponent(slug)}`,
  }),
  secondary: (): CTA => ({
    label: "Run the DCS Diagnostic",
    href: "/dcs-diagnostic/",
  }),
  microTrust: "Response within 1 business day. You'll receive a scoped plan and clear next-step options.",
} as const;

// ============================================================
// SERVICE REGISTRY
// ============================================================

export const SERVICES: Record<ServiceSlug, ServicePage> = {
  "growth-blocker-audit": {
    slug: "growth-blocker-audit",
    order: 0,
    name: "Growth Blocker Audit",
    seoTitle: "Growth Blocker Audit — NexTara AI Solutions",
    metaDescription: "A 30-minute audit that shows where your website, SEO, and tracking are leaking leads and money—plus the top 3 fixes to prioritize.",
    outcomeHeadline: "Find out what's blocking your leads—in one short call.",
    postureSubhead: "A fast, focused audit that shows exactly where you're leaking leads and money.",
    audienceFit: [
      "You're getting traffic but not enough calls or form fills",
      "You're spending on ads or SEO but can't tell if it's working",
      "You suspect your website isn't pulling its weight—but you're not sure why",
      "You want an outside set of eyes before committing to anything big",
    ],
    audienceNotFit: [
      "Anyone looking for a full technical SEO crawl or deep keyword research",
      "Businesses not ready to act on findings within 30–60 days",
    ],
    deliverables: [
      { title: "Live Screen-Share Audit", description: "30 minutes together (or recorded) reviewing your digital presence" },
      { title: "Video Walkthrough", description: "8–12 minute recording of exactly what we found, in plain English" },
      { title: "1-Page Summary", description: "What's Working / What's Broken / Top 3 Fixes" },
      { title: "Clear Next Step", description: "Full audit, engagement, or fix-it-yourself guidance" },
    ],
    processSteps: [
      { step: 1, title: "Book", description: "Schedule your 30-minute audit slot." },
      { step: 2, title: "Quick Intake", description: "Share your site URL, top concerns, and what success looks like." },
      { step: 3, title: "Live Audit", description: "We review your search presence, site, tracking, and one competitor—together or recorded." },
      { step: 4, title: "Delivery", description: "Receive your video walkthrough and 1-page summary within 48 hours." },
      { step: 5, title: "Decision", description: "Choose your next step: go deeper, engage, or DIY with what you learned." },
    ],
    proofChecklist: [
      { label: "Search Presence", detail: "Are you showing up in Google—and for what?" },
      { label: "First Impression", detail: "Is it obvious what you do and what to do next in 5 seconds?" },
      { label: "Top Pages", detail: "Are your landing pages converting or leaking leads?" },
      { label: "Tracking Health", detail: "Is GA/GTM firing correctly? Are conversions counted?" },
      { label: "Google Business Profile", detail: "Claimed, accurate, complete, and credible?" },
      { label: "Quick Win", detail: "One fix you can act on this week" },
    ],
    faq: [
      { question: "How long does it take?", answer: "30 minutes of your time. You'll receive the video and 1-page summary within 48 hours." },
      { question: "Is this a sales call?", answer: "No. It's a real audit. We show you what's broken. If you want help fixing it, we'll talk options. If not, you keep everything." },
      { question: "What if I already know what's wrong?", answer: "Then skip this and go straight to our DCS Audit for the full diagnostic and prioritized fix plan." },
      { question: "What happens after?", answer: "You get a 1-page summary plus video. If you want to go deeper, the next step is typically a DCS Audit or monthly engagement. Your $297 is credited either way." },
      { question: "What if we're not a fit?", answer: "We'll tell you directly. You still get actionable findings and a clear picture of what's broken." },
      { question: "How is this different from a free audit tool?", answer: "Free tools check surface metrics. We look at your actual lead flow, trust signals, and conversion gaps—things tools can't see." },
    ],
    primaryCta: {
      label: "Book Your Growth Blocker Audit — $297",
      href: "/contact/?service=growth-blocker-audit",
    },
    secondaryCta: {
      label: "See the Full DCS Audit",
      href: "/services/dcs-audits/",
    },
    relatedServices: ["dcs-audits", "tracking-governance", "seo-indexing"],
  },
  "dcs-audits": {
    slug: "dcs-audits",
    order: 1,
    name: "DCS Audits",
    seoTitle: "DCS Audits — NexTara AI Solutions",
    metaDescription: "Comprehensive Digital Credibility System audits that identify gaps in trust signals, technical SEO, and conversion architecture.",
    outcomeHeadline: "Know exactly where your digital credibility breaks down—and what to fix first.",
    postureSubhead: "A structured audit that shows what's blocking leads and trust—backed by evidence, not opinions.",
    audienceFit: [
      "Business owners who suspect their digital presence is underperforming but can't pinpoint why",
      "Teams preparing for a rebrand, site migration, or major campaign",
      "Operators who've been burned by agencies and want evidence before action",
    ],
    audienceNotFit: [
      "Those looking for quick SEO hacks or vanity metrics",
      "Businesses not ready to act on findings",
    ],
    deliverables: [
      { title: "DCS Score Report", description: "Quantified credibility score across 7 dimensions with benchmark comparisons" },
      { title: "Gap Analysis Document", description: "Prioritized list of credibility gaps with severity ratings" },
      { title: "Fix Roadmap", description: "Sequenced action plan with effort estimates and dependencies" },
      { title: "Evidence Pack", description: "Screenshots, tool outputs, and data supporting every finding" },
    ],
    processSteps: [
      { step: 1, title: "Intake", description: "We collect access credentials, business context, and priority questions." },
      { step: 2, title: "Automated Scan", description: "Tooling runs technical audits across SEO, performance, accessibility, and schema." },
      { step: 3, title: "Manual Review", description: "Human analysis of trust signals, messaging clarity, and conversion architecture." },
      { step: 4, title: "Scoring & Benchmarking", description: "Your results compared against industry baselines and competitors." },
      { step: 5, title: "Delivery & Walkthrough", description: "Report delivered with a live session to answer questions and prioritize." },
    ],
    proofChecklist: [
      { label: "Crawl Coverage", detail: "Every indexable URL scanned and cataloged" },
      { label: "Schema Validation", detail: "Structured data tested against Google's Rich Results requirements" },
      { label: "Core Web Vitals", detail: "LCP, CLS, INP measured from real field data where available" },
      { label: "Trust Signal Inventory", detail: "Reviews, credentials, certifications, and proof points cataloged" },
      { label: "Conversion Path Mapping", detail: "Every CTA traced from impression to thank-you endpoint" },
    ],
    faq: [
      { question: "How long does an audit take?", answer: "Typically 5-7 business days from intake to delivery, depending on site complexity." },
      { question: "What access do you need?", answer: "Read-only access to Google Analytics, Search Console, and your CMS. We never request write access." },
      { question: "Will this break anything on my site?", answer: "No. Audits are read-only. We observe and measure; we don't modify." },
      { question: "What if I disagree with the findings?", answer: "Every finding includes evidence. We'll walk through any contested items in the delivery session." },
      { question: "Do you fix what you find?", answer: "Audits are diagnostic. Remediation is available as a separate engagement if you want us to execute." },
      { question: "How is this different from a free SEO audit tool?", answer: "Free tools check surface metrics. We evaluate credibility architecture, trust signals, and conversion systems—things tools can't see." },
    ],
    relatedServices: ["tracking-governance", "seo-indexing", "conversion-architecture"],
  },

  "tracking-governance": {
    slug: "tracking-governance",
    order: 2,
    name: "Tracking Governance",
    seoTitle: "Tracking Governance — NexTara AI Solutions",
    metaDescription: "GTM-only instrumentation, clean analytics, event hygiene, and proof-based reporting to govern performance with confidence.",
    outcomeHeadline: "Trust your numbers. Know they're right.",
    postureSubhead: "Tracking built on clean rules and proof—so you can trust every lead and dollar.",
    audienceFit: [
      "Businesses with analytics they don't trust or can't explain",
      "Teams preparing for paid media scale who need clean conversion data",
      "Operators who've inherited messy GTM containers or duplicate tags",
    ],
    audienceNotFit: [
      "Those who want vanity dashboards without data integrity",
      "Businesses not ready to enforce tagging discipline",
    ],
    deliverables: [
      { title: "GTM Container Audit", description: "Full inventory of tags, triggers, and variables with health assessment" },
      { title: "Measurement Plan", description: "Documented event taxonomy aligned to business KPIs" },
      { title: "Clean Container", description: "Rebuilt GTM container with proper naming, versioning, and clear ownership rules" },
      { title: "Validation Report", description: "Evidence that every configured event fires correctly" },
    ],
    processSteps: [
      { step: 1, title: "Discovery", description: "Understand your business goals and current measurement state." },
      { step: 2, title: "Container Audit", description: "Inventory and assess existing GTM/GA4 implementation." },
      { step: 3, title: "Measurement Design", description: "Define event taxonomy and data layer requirements." },
      { step: 4, title: "Implementation", description: "Build or rebuild GTM container with clean, documented standards." },
      { step: 5, title: "Validation", description: "Test every event, document proof, deliver with walkthrough." },
    ],
    proofChecklist: [
      { label: "Tag Inventory", detail: "Every tag cataloged with purpose and owner" },
      { label: "Duplicate Detection", detail: "No duplicate pageviews, events, or conversion tags" },
      { label: "Data Layer Validation", detail: "All required variables present and correctly typed" },
      { label: "Cross-Domain Accuracy", detail: "Session continuity verified across domains if applicable" },
      { label: "Consent Compliance", detail: "Tags respect consent state where required" },
    ],
    faq: [
      { question: "What's wrong with my current tracking?", answer: "Most implementations have duplicate tags, missing events, or broken data layers. We audit first to find out." },
      { question: "Do you work with GA4 and GTM only?", answer: "Primarily yes. We can advise on other platforms but specialize in the Google stack." },
      { question: "Will this affect my historical data?", answer: "No. We build forward; we don't modify historical data. New tracking improves future accuracy." },
      { question: "How do I know the new tracking is correct?", answer: "We provide validation reports with screenshots and test evidence for every event." },
      { question: "What if my developers push changes that break tracking?", answer: "We document clear rules and can set up monitoring alerts for drift detection." },
      { question: "Can you train my team?", answer: "Yes. Handoff includes documentation and optional training sessions." },
    ],
    relatedServices: ["dcs-audits", "conversion-architecture", "paid-media-systems"],
  },

  "seo-indexing": {
    slug: "seo-indexing",
    order: 3,
    name: "SEO + Indexing Systems",
    seoTitle: "SEO + Indexing Systems — NexTara AI Solutions",
    metaDescription: "Sitemaps, internal linking, crawl policy, structured data, and indexing controls that govern discoverability in search and AI answers.",
    outcomeHeadline: "Get found by search engines and AI systems—on your terms.",
    postureSubhead: "SEO foundations that help Google find, understand, and rank you—without wasting effort on the wrong pages.",
    audienceFit: [
      "Businesses with pages that should rank but don't appear in search",
      "Teams launching new sites or migrating domains",
      "Operators who need to control what gets indexed and what doesn't",
    ],
    audienceNotFit: [
      "Those expecting overnight ranking jumps from keyword stuffing",
      "Businesses not willing to invest in technical foundations",
    ],
    deliverables: [
      { title: "Indexing Audit", description: "Current state assessment of crawlability, indexation, and coverage gaps" },
      { title: "Sitemap Architecture", description: "Properly segmented XML sitemaps submitted to Search Console" },
      { title: "Internal Linking Map", description: "Link equity flow analysis with recommended structural improvements" },
      { title: "Schema Implementation", description: "Structured data for Organization, WebSite, WebPage, and content types" },
    ],
    processSteps: [
      { step: 1, title: "Crawl Analysis", description: "Run site-wide crawl to identify indexing blockers and orphan pages." },
      { step: 2, title: "Coverage Review", description: "Cross-reference crawl data with Search Console coverage reports." },
      { step: 3, title: "Architecture Design", description: "Plan sitemap segmentation, robots directives, and canonical strategy." },
      { step: 4, title: "Implementation", description: "Deploy sitemaps, fix technical blockers, implement schema." },
      { step: 5, title: "Verification", description: "Confirm indexation improvements in Search Console over 2-4 weeks." },
    ],
    proofChecklist: [
      { label: "Crawl Budget Efficiency", detail: "No wasted crawls on low-value or blocked pages" },
      { label: "Sitemap Accuracy", detail: "Only indexable, canonical URLs in sitemaps" },
      { label: "Robots.txt Validation", detail: "Directives tested and confirmed" },
      { label: "Schema Testing", detail: "All structured data passes Google Rich Results Test" },
      { label: "Canonical Consistency", detail: "No conflicting canonical signals across pages" },
    ],
    faq: [
      { question: "Why aren't my pages showing up in Google?", answer: "Common causes: crawl blocks, noindex tags, canonical issues, or thin content. We diagnose the specific cause." },
      { question: "How long until I see ranking improvements?", answer: "Indexation fixes show in Search Console within days. Ranking impact varies by competition and content quality." },
      { question: "Do you write content?", answer: "No. We build the technical systems that make your content discoverable. Content strategy is a separate engagement." },
      { question: "What about AI search (SGE, Perplexity)?", answer: "Our schema and semantic structure work optimizes for both traditional search and AI answer extraction." },
      { question: "Will you submit my site to search engines?", answer: "We submit sitemaps to Search Console and Bing Webmaster Tools. Beyond that, submission services are unnecessary." },
      { question: "What if Google still doesn't index my pages?", answer: "We investigate further—sometimes the issue is content quality, site reputation, or penalties. We'll tell you what we find." },
    ],
    relatedServices: ["dcs-audits", "tracking-governance", "conversion-architecture"],
  },

  "conversion-architecture": {
    slug: "conversion-architecture",
    order: 4,
    name: "Conversion Architecture",
    seoTitle: "Conversion Architecture — NexTara AI Solutions",
    metaDescription: "Funnels, forms, thank-you endpoints, and measurable actions tied directly to business outcomes—not vanity metrics.",
    outcomeHeadline: "Turn traffic into measurable business outcomes.",
    postureSubhead: "Conversion paths engineered for measurement and optimization.",
    audienceFit: [
      "Businesses with traffic but poor lead quality or conversion rates",
      "Teams running paid media who need clean conversion data",
      "Operators who can't trace a lead back to its source",
    ],
    audienceNotFit: [
      "Those not ready to change their forms or landing pages",
      "Businesses without traffic to convert",
    ],
    deliverables: [
      { title: "Conversion Audit", description: "Current funnel assessment with drop-off analysis" },
      { title: "Funnel Architecture", description: "Designed conversion paths with clear stage definitions" },
      { title: "Form Optimization", description: "Forms built for completion rate and data capture" },
      { title: "Thank-You System", description: "Confirmation pages instrumented for conversion tracking" },
    ],
    processSteps: [
      { step: 1, title: "Funnel Mapping", description: "Document all current paths from entry to conversion." },
      { step: 2, title: "Drop-Off Analysis", description: "Identify where prospects abandon and why." },
      { step: 3, title: "Architecture Design", description: "Design optimized funnels with measurement points." },
      { step: 4, title: "Implementation", description: "Build forms, landing pages, and thank-you flows." },
      { step: 5, title: "Instrumentation", description: "Configure conversion tracking in GTM/GA4." },
      { step: 6, title: "Optimization Loop", description: "Monitor, test, and iterate based on data." },
    ],
    proofChecklist: [
      { label: "Funnel Continuity", detail: "No broken paths from ad click to conversion" },
      { label: "Form Submission Tracking", detail: "Every form submit captured with source attribution" },
      { label: "Thank-You Page Firing", detail: "Conversion events fire only on confirmed submissions" },
      { label: "Lead Quality Scoring", detail: "Form fields designed to qualify leads at capture" },
      { label: "Attribution Accuracy", detail: "UTM parameters preserved through entire funnel" },
    ],
    faq: [
      { question: "Why aren't my forms converting?", answer: "Common issues: too many fields, unclear value prop, broken mobile experience, or missing trust signals. We diagnose and fix." },
      { question: "What's a good conversion rate?", answer: "Depends on traffic source and offer. We benchmark against your industry and set realistic targets." },
      { question: "Do you build landing pages?", answer: "We architect the conversion system. Page design/build can be included or handled by your team to our specs." },
      { question: "How do you track conversions?", answer: "GTM-based event tracking with proper thank-you page triggers. No duplicate firing, no missed conversions." },
      { question: "What about phone calls and offline conversions?", answer: "We can integrate call tracking and offline import workflows where needed." },
      { question: "Will this work with my CRM?", answer: "We design forms to capture the data your CRM needs. Integration specifics depend on your stack." },
    ],
    relatedServices: ["tracking-governance", "paid-media-systems", "dcs-audits"],
  },

  "paid-media-systems": {
    slug: "paid-media-systems",
    order: 5,
    name: "Paid Media Systems",
    seoTitle: "Paid Media Systems — NexTara AI Solutions",
    metaDescription: "Campaign structure + measurement discipline so spend is proven, not guessed—built to scale without losing control.",
    outcomeHeadline: "Scale paid media with confidence, not guesswork.",
    postureSubhead: "Campaign systems built on clean data and proof.",
    audienceFit: [
      "Businesses spending on ads but unsure if it's working",
      "Teams ready to scale but worried about wasting budget",
      "Operators who've been burned by agencies with no transparency",
    ],
    audienceNotFit: [
      "Businesses with ad spend below ~$2k/month (we'll usually start with SEO + tracking first).",
      "Businesses not ready to trust data over gut feelings",
    ],
    deliverables: [
      { title: "Campaign Audit", description: "Assessment of current account structure, targeting, and performance" },
      { title: "Measurement Framework", description: "Conversion tracking, attribution model, and reporting structure" },
      { title: "Campaign Architecture", description: "Account structure designed for scale and control" },
      { title: "Tracking & Reporting Playbook", description: "Rules for budget allocation, bid management, and optimization cadence" },
    ],
    processSteps: [
      { step: 1, title: "Account Audit", description: "Review current campaigns, structure, and historical performance." },
      { step: 2, title: "Measurement Setup", description: "Ensure conversion tracking is accurate before any optimization." },
      { step: 3, title: "Structure Design", description: "Architect campaigns for your goals, budget, and scale targets." },
      { step: 4, title: "Launch & Monitor", description: "Deploy campaigns with daily monitoring during ramp." },
      { step: 5, title: "Optimize & Scale", description: "Data-driven adjustments with documented rationale." },
    ],
    proofChecklist: [
      { label: "Conversion Tracking Verified", detail: "Every conversion action tested before spend begins" },
      { label: "Attribution Model Documented", detail: "Clear rules for how credit is assigned" },
      { label: "Budget Pacing Accurate", detail: "Spend matches plan within 5% tolerance" },
      { label: "ROAS/CPA Tracked", detail: "Core metrics updated and reviewed weekly" },
      { label: "Waste Identified", detail: "Non-performing segments flagged and addressed" },
    ],
    faq: [
      { question: "Which platforms do you work with?", answer: "Google Ads and Meta (Facebook/Instagram) primarily. LinkedIn and others on request." },
      { question: "What's the minimum budget?", answer: "We recommend at least $5k/month to generate enough data for meaningful optimization." },
      { question: "Do you guarantee results?", answer: "No. Anyone who does is lying. We guarantee disciplined process and transparent reporting." },
      { question: "How do I know my budget isn't being wasted?", answer: "Weekly reports show exactly where spend went and what it produced. No black boxes." },
      { question: "Can you take over from my current agency?", answer: "Yes. We audit first, then transition with documented handoff." },
      { question: "What's your fee structure?", answer: "Typically a management fee plus percentage of spend. Details depend on scope and budget." },
    ],
    relatedServices: ["tracking-governance", "conversion-architecture", "dcs-audits"],
  },

  "automation-ecc": {
    slug: "automation-ecc",
    order: 6,
    name: "Automation (ECC)",
    seoTitle: "Automation (ECC) — NexTara AI Solutions",
    metaDescription: "Operational automations that reduce manual work, eliminate reporting ambiguity, and connect systems into one reliable workflow with clear ownership.",
    outcomeHeadline: "Eliminate manual work. Connect your systems. Keep it reliable.",
    postureSubhead: "Automation built for reliability and clear ownership—not fragile 'set and forget' workflows.",
    audienceFit: [
      "Businesses drowning in manual reporting and data entry",
      "Teams with disconnected tools that don't talk to each other",
      "Operators who need alerts when something breaks",
    ],
    audienceNotFit: [
      "Those looking for AI chatbots or customer-facing automation",
      "Businesses without clear processes to automate",
    ],
    deliverables: [
      { title: "Process Audit", description: "Map current workflows and identify automation candidates" },
      { title: "Automation Design", description: "Specifications for each automated workflow" },
      { title: "Integration Build", description: "Working automations connecting your systems" },
      { title: "Monitoring Setup", description: "Alerts and logging so you know when things fail" },
    ],
    processSteps: [
      { step: 1, title: "Process Discovery", description: "Document current manual workflows and pain points." },
      { step: 2, title: "Opportunity Assessment", description: "Prioritize automations by ROI and complexity." },
      { step: 3, title: "Design & Spec", description: "Detailed specifications for each automation." },
      { step: 4, title: "Build & Test", description: "Implement automations with thorough testing." },
      { step: 5, title: "Deploy & Monitor", description: "Launch with logging, alerts, and documentation." },
    ],
    proofChecklist: [
      { label: "Error Handling", detail: "Every automation has defined failure modes and alerts" },
      { label: "Audit Trail", detail: "All automated actions logged with timestamps" },
      { label: "Rollback Capability", detail: "Ability to undo or pause automations if needed" },
      { label: "Data Integrity", detail: "Validation checks before data is written to systems" },
      { label: "Documentation", detail: "Every automation documented with triggers, actions, and owners" },
    ],
    faq: [
      { question: "What tools do you integrate?", answer: "Common: Google Workspace, HubSpot, Slack, Airtable, Zapier/Make, custom APIs. We assess fit during discovery." },
      { question: "Is this AI?", answer: "Some automations use AI (like classification or summarization), but most are deterministic workflows. We choose the right tool for each job." },
      { question: "What if an automation breaks?", answer: "Every automation includes monitoring and alerts. You'll know immediately, and we document how to respond." },
      { question: "How long do these take to build?", answer: "Simple automations: days. Complex integrations: weeks. We scope before committing." },
      { question: "Can my team maintain these?", answer: "We build for handoff. Documentation and training included so your team can manage and extend." },
      { question: "What about security?", answer: "We follow least-privilege access principles. Credentials stored securely. Audit logs for everything." },
    ],
    relatedServices: ["tracking-governance", "conversion-architecture", "paid-media-systems"],
  },
};

// ============================================================
// REGISTRY VALIDATOR (Runs at import time — build fails on violations)
// ============================================================

function invariant(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`[services] ${msg}`);
}

export function validateServiceRegistry(): void {
  const orders = new Set<number>();
  
  // Iterate over canonical slug set to guarantee completeness
  for (const slug of SERVICE_SLUGS) {
    const s = SERVICES[slug];
    
    // Identity checks
    invariant(s.slug === slug, `Registry key "${slug}" must match service slug "${s.slug}"`);
    invariant(s.name.length > 0, `${slug}: name is required`);
    invariant(s.seoTitle.length > 0, `${slug}: seoTitle is required`);
    invariant(s.metaDescription.length > 0, `${slug}: metaDescription is required`);
    invariant(s.metaDescription.length <= 170, `${slug}: metaDescription exceeds 170 chars`);
    
    // Content section checks
    invariant(s.faq.length >= 6, `${slug}: faq must be >= 6 (has ${s.faq.length})`);
    invariant(
      s.relatedServices.length >= 2 && s.relatedServices.length <= 3,
      `${slug}: relatedServices must be 2-3 (has ${s.relatedServices.length})`
    );
    invariant(s.deliverables.length >= 3 && s.deliverables.length <= 6, `${slug}: deliverables should be 3-6`);
    invariant(s.processSteps.length >= 3 && s.processSteps.length <= 6, `${slug}: processSteps should be 3-6`);
    invariant(s.proofChecklist.length >= 3, `${slug}: proofChecklist should be >= 3`);
    invariant(s.audienceFit.length >= 2, `${slug}: audienceFit should be >= 2`);
    invariant(s.audienceNotFit.length >= 1, `${slug}: audienceNotFit should be >= 1`);
    
    // Order uniqueness
    invariant(!orders.has(s.order), `${slug}: duplicate order ${s.order}`);
    orders.add(s.order);
    
    // Process step numbering
    s.processSteps.forEach((st, i) =>
      invariant(st.step === i + 1, `${slug}: process step numbering mismatch at index ${i} (expected ${i + 1}, got ${st.step})`)
    );
    
    // RelatedServices validity (defense in depth)
    s.relatedServices.forEach(rel =>
      invariant(SERVICE_SLUGS.includes(rel), `${slug}: relatedServices contains invalid slug "${rel}"`)
    );
    
    // No self-reference
    invariant(!s.relatedServices.includes(slug), `${slug}: relatedServices cannot include self`);
    
    // No duplicates in relatedServices
    invariant(
      new Set(s.relatedServices).size === s.relatedServices.length,
      `${slug}: relatedServices contains duplicates`
    );
  }
}

// Run validation at import time — build fails loudly if contract violated
validateServiceRegistry();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getService(slug: ServiceSlug): ServicePage {
  return SERVICES[slug];
}

export function getAllServices(): ServicePage[] {
  return Object.values(SERVICES).sort((a, b) => a.order - b.order);
}

export function getServiceSlugs(): ServiceSlug[] {
  return [...SERVICE_SLUGS];
}

export function getRelatedServicesData(slugs: ServiceSlug[]): ServicePage[] {
  return slugs.map(slug => SERVICES[slug]);
}

// Resolve CTAs with defaults
export function resolveCTAs(service: ServicePage): { primary: CTA; secondary: CTA } {
  return {
    primary: service.primaryCta ?? CTA_DEFAULTS.primary(service.slug),
    secondary: service.secondaryCta ?? CTA_DEFAULTS.secondary(),
  };
}

// Get micro-trust copy
export function getMicroTrust(): string {
  return CTA_DEFAULTS.microTrust;
}