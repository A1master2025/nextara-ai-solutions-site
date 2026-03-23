/**
 * Schema Node Builders
 * src/lib/schema/nodes.ts
 *
 * Phase 5 — Structured Data + Indexing Maturity
 * Type-safe builders for JSON-LD schema nodes.
 *
 * Supported types (no others permitted):
 *   - Organization
 *   - WebSite
 *   - WebPage
 *   - BreadcrumbList
 *   - Service
 *   - ItemList
 */

import {
  organizationId,
  webSiteId,
  webPageId,
  serviceId,
  itemListId,
  pageUrl,
  serviceUrl,
  servicesHubUrl,
  homeUrl,
} from './core';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SchemaNode {
  '@type': string;
  '@id': string;
  [key: string]: unknown;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ServiceData {
  slug: string;
  name: string;
  description: string;
}

// ============================================================
// ORGANIZATION NODE
// ============================================================

export function buildOrganization(origin: string): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': organizationId(origin),
    name: 'NexTara AI Solutions',
    url: homeUrl(origin),
    logo: {
      '@type': 'ImageObject',
      url: `${origin}/images/nextara-logo.png`,
      width: 512,
      height: 512,
    },
    description:
      'NexTara AI Solutions helps small and mid-sized businesses improve lead generation, measurement, website performance, and practical AI-enabled marketing execution.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${origin}/contact/`,
    },
  };
}

// ============================================================
// WEBSITE NODE
// ============================================================

export function buildWebSite(origin: string): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': webSiteId(origin),
    url: homeUrl(origin),
    name: 'NexTara AI Solutions',
    publisher: { '@id': organizationId(origin) },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${origin}/services/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// ============================================================
// WEBPAGE NODE
// ============================================================

export interface WebPageParams {
  origin: string;
  path: string;
  title: string;
  description: string;
}

export function buildWebPage(params: WebPageParams): SchemaNode {
  const { origin, path, title, description } = params;
  return {
    '@type': 'WebPage',
    '@id': webPageId(origin, path),
    url: pageUrl(origin, path),
    name: title,
    description,
    isPartOf: { '@id': webSiteId(origin) },
    publisher: { '@id': organizationId(origin) },
  };
}

// ============================================================
// BREADCRUMBLIST NODE
// ============================================================

export function buildBreadcrumbList(
  origin: string,
  items: BreadcrumbItem[]
): SchemaNode {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(origin, items[items.length - 1]?.url || '/')}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pageUrl(origin, item.url),
    })),
  };
}

// ============================================================
// SERVICE NODE
// ============================================================

export function buildService(origin: string, data: ServiceData): SchemaNode {
  return {
    '@type': 'Service',
    '@id': serviceId(origin, data.slug),
    name: data.name,
    description: data.description,
    url: serviceUrl(origin, data.slug),
    provider: { '@id': organizationId(origin) },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
  };
}

// ============================================================
// ITEMLIST NODE (Services Hub)
// ============================================================

export function buildItemList(
  origin: string,
  services: ServiceData[]
): SchemaNode {
  return {
    '@type': 'ItemList',
    '@id': itemListId(origin),
    name: 'NexTara AI Solutions Services',
    description:
      'SMB-focused website strategy, analytics setup, conversion tracking, SEO foundations, and practical growth systems designed to improve visibility, lead flow, and operational clarity.',
    numberOfItems: services.length,
    itemListElement: services.map((svc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: svc.name,
      url: serviceUrl(origin, svc.slug),
      item: { '@id': serviceId(origin, svc.slug) },
    })),
  };
}