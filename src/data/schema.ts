import { site, licenses } from './site';
import type { Service } from './services';

// Structured data (schema.org JSON-LD) shared by every page.
// The business is a service-area business based in Lanham, MD, so the
// address only carries locality/region/zip — no public street address.

export const SITE_URL = 'https://pcdmv.com';
export const BUSINESS_ID = `${SITE_URL}/#business`;

export const areasServed = [
  { '@type': 'City', name: 'Lanham, MD' },
  { '@type': 'City', name: 'Bowie, MD' },
  { '@type': 'City', name: 'Greenbelt, MD' },
  { '@type': 'City', name: 'Hyattsville, MD' },
  { '@type': 'City', name: 'College Park, MD' },
  { '@type': 'City', name: 'Upper Marlboro, MD' },
  { '@type': 'AdministrativeArea', name: "Prince George's County, MD" },
  { '@type': 'AdministrativeArea', name: 'Montgomery County, MD' },
  { '@type': 'State', name: 'Maryland' },
  { '@type': 'City', name: 'Washington, DC' },
  { '@type': 'State', name: 'Virginia' },
];

export const businessSchema = {
  '@type': ['RoofingContractor', 'HomeAndConstructionBusiness'],
  '@id': BUSINESS_ID,
  name: site.name,
  alternateName: site.serviceLine,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/og.jpg`,
  description:
    'Roofing, siding, gutters and remodeling contractor based in Lanham, Maryland. Licensed in MD and DC, serving Prince George’s County and the DMV since 2012.',
  telephone: site.phoneRaw,
  email: site.email,
  foundingDate: String(site.founded),
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Lanham',
    addressRegion: 'MD',
    postalCode: '20706',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.9687,
    longitude: -76.8636,
  },
  areaServed: areasServed,
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phoneRaw,
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: ['English', 'Spanish'],
  },
  hasCredential: licenses.map((l) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'license',
    name: l.jurisdiction
      ? `${l.jurisdiction} Home Improvement License #${l.number}`
      : `Plumbing License #${l.number}`,
    recognizedBy: l.jurisdiction
      ? {
          '@type': 'GovernmentOrganization',
          name: l.jurisdiction === 'MD' ? 'Maryland Home Improvement Commission' : 'DC Department of Licensing and Consumer Protection',
        }
      : undefined,
  })),
};

export function serviceSchema(service: Service) {
  const url = `${SITE_URL}/services/${service.slug}/`;
  return [
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.name,
      serviceType: service.shortName,
      description: service.summary,
      url,
      provider: { '@id': BUSINESS_ID },
      areaServed: areasServed,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: service.shortName,
        itemListElement: service.features.map((f) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: f },
        })),
      },
    },
    breadcrumbSchema([
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Services', url: `${SITE_URL}/#services` },
      { name: service.shortName, url },
    ]),
  ];
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
