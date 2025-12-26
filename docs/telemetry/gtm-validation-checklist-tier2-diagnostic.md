# GTM Validation Checklist — Tier-2 DCS Diagnostic

> **Status:** Active  
> **Canonical GTM Container:** GTM-N6HDR6L7  
> **Canonical GA4 Property:** G-49KJHVBX3Q

---

## Purpose

This checklist must be completed with 100% pass rate before GTM publish authorization is granted.

Do not skip steps. Do not assume behavior. Verify explicitly.

---

## Pre-Validation Setup

- [ ] GTM Preview mode is active
- [ ] Browser devtools console is open
- [ ] GA4 DebugView is open in separate tab
- [ ] Session storage is cleared: `sessionStorage.clear()`
- [ ] Hard refresh performed: `Ctrl+Shift+R` / `Cmd+Shift+R`

---

## Sequencing Checks

- [ ] GA4 Configuration tag fires on `Container Loaded`
- [ ] GA4 Configuration tag fires BEFORE any event tags
- [ ] No tag firing errors visible in GTM Preview summary

---

## Event 1: `nt_dcs_diag_view`

### Positive Tests

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.1 | Navigate to `/dcs-diagnostic/` | Page loads successfully | |
| 1.2 | Check dataLayer for `nt_dcs_diag_view` | Event present | |
| 1.3 | Verify `nt_event_source` in dataLayer | Value is `tier2` | |
| 1.4 | Check GTM Preview: Trigger | `CE - nt_dcs_diag_view` fired | |
| 1.5 | Check GTM Preview: Tag | `GA4 Event - dcs_diagnostic_view` fired | |
| 1.6 | Check GA4 DebugView | `dcs_diagnostic_view` event received | |
| 1.7 | Verify `nt_event_source` param in GA4 | Value is `tier2` | |
| 1.8 | Verify `page_location` param in GA4 | Contains `/dcs-diagnostic/` | |

### Dedupe Tests

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.9 | Refresh page (F5) | Event does NOT fire again | |
| 1.10 | Check sessionStorage | Key `nt_dcs_diag_view_fired` exists | |
| 1.11 | Check GTM Preview after refresh | No new `nt_dcs_diag_view` trigger | |

### Scope Isolation Tests

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 1.12 | Navigate to homepage `/` | `nt_dcs_diag_view` does NOT fire | |
| 1.13 | Navigate to `/services/` | `nt_dcs_diag_view` does NOT fire | |
| 1.14 | Navigate to `/contact/` | `nt_dcs_diag_view` does NOT fire | |

---

## Event 2: `nt_dcs_diag_submit_success`

### Setup

- [ ] Clear sessionStorage: `sessionStorage.clear()`
- [ ] Navigate to `/dcs-diagnostic/`
- [ ] Fill form with valid test data

### Positive Tests

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.1 | Submit form | Redirect to `/dcs-diagnostic/thank-you/` | |
| 2.2 | Check dataLayer for `nt_dcs_diag_submit_success` | Event present | |
| 2.3 | Verify `nt_event_source` in dataLayer | Value is `tier2` | |
| 2.4 | Verify `nt_form_name` in dataLayer | Value is `dcs_diagnostic` | |
| 2.5 | Check GTM Preview: Trigger | `CE - nt_dcs_diag_submit_success` fired | |
| 2.6 | Check GTM Preview: Tag | `GA4 Event - lead_form_submit` fired | |
| 2.7 | Check GA4 DebugView | `lead_form_submit` event received | |
| 2.8 | Verify `nt_event_source` param in GA4 | Value is `tier2` | |
| 2.9 | Verify `nt_form_name` param in GA4 | Value is `dcs_diagnostic` | |
| 2.10 | Verify `page_location` param in GA4 | Contains `/thank-you/` | |

### Dedupe Tests

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.11 | Refresh thank-you page | Event does NOT fire again | |
| 2.12 | Check sessionStorage | Key `nt_dcs_diag_submit_success_fired` exists | |

### Edge Case Test

| # | Test | Expected Result | Pass/Fail |
|---|------|-----------------|-----------|
| 2.13 | Direct navigate to `/dcs-diagnostic/thank-you/` (no form submit, fresh session) | Event fires (expected behavior — page-based trigger) | |

---

## Console Verification

- [ ] No JavaScript errors in console
- [ ] On simulated timeout: `[DIOS]` warning appears (debug builds only)
- [ ] No unexpected dataLayer events

---

## Final Parameter Summary

| Event | Parameter | Expected | Verified |
|-------|-----------|----------|----------|
| `dcs_diagnostic_view` | `nt_event_source` | `tier2` | |
| `dcs_diagnostic_view` | `page_location` | Full URL with `/dcs-diagnostic/` | |
| `lead_form_submit` | `nt_event_source` | `tier2` | |
| `lead_form_submit` | `nt_form_name` | `dcs_diagnostic` | |
| `lead_form_submit` | `page_location` | Full URL with `/thank-you/` | |

---

## Sign-Off

| Field | Value |
|-------|-------|
| **All tests pass** | Yes / No |
| **Unexpected events fired** | Yes / No |
| **Console errors** | Yes / No |
| **Completed by** | |
| **Date** | |
| **GTM Publish Authorized** | Pending Lexi approval |

---

## Post-Publish Verification

After GTM publish, repeat tests 1.1–1.8 and 2.1–2.10 in production environment.

- [ ] Production verification complete
- [ ] GA4 Realtime confirms events
- [ ] Date: _______________