# GA4 Specification — Tier-2 DCS Diagnostic

> **Status:** LOCKED  
> **Last Updated:** Phase C Implementation  
> **Canonical GTM Container:** GTM-N6HDR6L7  
> **Canonical GA4 Property:** G-49KJHVBX3Q

---

## Overview

This document defines the deterministic mapping between DIOS dataLayer events and GA4 event configuration for the Tier-2 DCS Diagnostic flow.

All GTM tags must be configured exactly as specified. No additional parameters or events may be added without explicit authorization.

---

## Event Specification

### Event 1: Diagnostic Page View

| Attribute | Value |
|-----------|-------|
| **DIOS dataLayer Event** | `nt_dcs_diag_view` |
| **GA4 Event Name** | `dcs_diagnostic_view` |
| **GTM Trigger** | `CE - nt_dcs_diag_view` |
| **GTM Tag** | `GA4 Event - dcs_diagnostic_view` |

#### dataLayer Push (Source)
```javascript