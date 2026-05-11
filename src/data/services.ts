import type { ImageMetadata } from 'astro';

// asphalt-shingles
import asph01 from '../assets/services/asphalt-shingles/01.jpg';
import asph02 from '../assets/services/asphalt-shingles/02.jpg';
import asph03 from '../assets/services/asphalt-shingles/03.jpg';
import asph04 from '../assets/services/asphalt-shingles/04.jpg';
import asph05 from '../assets/services/asphalt-shingles/05.jpg';
import asph06 from '../assets/services/asphalt-shingles/06.jpg';
import asph07 from '../assets/services/asphalt-shingles/07.jpg';

// tpo-roofing
import tpo01 from '../assets/services/tpo-roofing/01.jpg';
import tpo02 from '../assets/services/tpo-roofing/02.jpg';
import tpo03 from '../assets/services/tpo-roofing/03.jpg';
import tpo04 from '../assets/services/tpo-roofing/04.jpg';

// siding
import sid01 from '../assets/services/siding/01.jpg';
import sid02 from '../assets/services/siding/02.jpg';
import sid03 from '../assets/services/siding/03.jpg';
import sid04 from '../assets/services/siding/04.jpg';
import sid05 from '../assets/services/siding/05.jpg';

// drywall
import dry01 from '../assets/services/drywall/01.jpg';

// gutters
import gut01 from '../assets/services/gutters/01.jpg';
import gut02 from '../assets/services/gutters/02.jpg';

// kitchen
import kit01 from '../assets/services/kitchen/01.jpg';
import kit02 from '../assets/services/kitchen/02.jpg';

// bathroom
import bath01 from '../assets/services/bathroom/01.jpg';

// interior
import int01 from '../assets/services/interior/01.jpg';
import int02 from '../assets/services/interior/02.jpg';
import int03 from '../assets/services/interior/03.jpg';
import int04 from '../assets/services/interior/04.jpg';
import int05 from '../assets/services/interior/05.jpg';

// decks
import dck01 from '../assets/services/decks/01.jpg';
import dck02 from '../assets/services/decks/02.jpg';
import dck03 from '../assets/services/decks/03.jpg';
import dck04 from '../assets/services/decks/04.jpg';

// additions
import add01 from '../assets/services/additions/01.jpg';
import add02 from '../assets/services/additions/02.jpg';
import add03 from '../assets/services/additions/03.jpg';
import add04 from '../assets/services/additions/04.jpg';

export type ServiceImage = {
  src: ImageMetadata;
  alt: string;
};

export type Service = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  description: string[];
  features: string[];
  cover: ImageMetadata;
  coverAlt: string;
  gallery: ServiceImage[];
  icon: string;
};

export const services: Service[] = [
  {
    slug: 'asphalt-shingles',
    name: 'Asphalt Shingles Roofing',
    shortName: 'Asphalt Shingles',
    tagline: 'Residential roof installation and replacement',
    summary:
      'Premium asphalt shingle roofing installed by certified crews. Durable, beautiful, and built to weather every season in the DMV.',
    description: [
      'Asphalt shingles remain the #1 roofing choice for homeowners across Maryland, Virginia, and DC — combining cost-effectiveness, durability, and a wide range of architectural styles.',
      'Our crews install architectural and 3-tab shingles with manufacturer-grade underlayment, proper ventilation, and meticulous flashing. Every roof we deliver is backed by a 10-year workmanship warranty on top of the manufacturer’s material warranty.',
    ],
    features: [
      'Full tear-off and re-roof',
      'Storm and hail damage repair',
      'Ridge vents and proper attic ventilation',
      'Flashing, valleys, and chimney waterproofing',
      'Insurance claim assistance',
    ],
    cover: asph01,
    coverAlt: 'New asphalt shingle roof installed on a brick home',
    gallery: [
      { src: asph01, alt: 'Newly installed asphalt shingle roof on brick home' },
      { src: asph02, alt: 'Asphalt shingle roof aerial view with proper ridge alignment' },
      { src: asph03, alt: 'Dramatic ridge of asphalt shingle roof at sunset' },
      { src: asph04, alt: 'Top-down view of asphalt shingle installation' },
      { src: asph05, alt: 'Asphalt shingles meeting brick chimney with flashing' },
      { src: asph06, alt: 'Ridge of asphalt shingle roof with ventilation' },
      { src: asph07, alt: 'Asphalt shingle roof edge with seamless gutter' },
    ],
    icon: 'roof',
  },
  {
    slug: 'tpo-roofing',
    name: 'TPO Roofing — Commercial & Residential',
    shortName: 'TPO Roofing',
    tagline: 'Flat roof systems for commercial and residential buildings',
    summary:
      'Energy-efficient TPO membrane roofing for low-slope buildings. Welded seams, white reflective surface, and decades of proven durability.',
    description: [
      'TPO (Thermoplastic Polyolefin) is the leading single-ply membrane for flat and low-slope roofs. Its heat-welded seams create a watertight barrier that outperforms older EPDM rubber systems, while the reflective white surface lowers cooling costs significantly.',
      'We install TPO on commercial buildings, warehouses, and modern residential additions. Every project is sealed with mechanically-fastened or fully-adhered systems matched to the building’s structure and warranty needs.',
    ],
    features: [
      'Mechanically-fastened and fully-adhered systems',
      'Heat-welded seams for total watertightness',
      'Energy Star reflective membrane',
      'Drain, vent, and HVAC curb flashing',
      'Up to 25-year manufacturer warranty',
    ],
    cover: tpo01,
    coverAlt: 'White TPO membrane installed on a commercial building',
    gallery: [
      { src: tpo01, alt: 'Commercial TPO roof installation with vents' },
      { src: tpo02, alt: 'Large white TPO membrane on industrial building' },
      { src: tpo03, alt: 'TPO roof on a residential addition' },
      { src: tpo04, alt: 'TPO flat section transitioning into shingle roof' },
    ],
    icon: 'tpo',
  },
  {
    slug: 'siding',
    name: 'James Hardie Siding Installation',
    shortName: 'James Hardie Siding',
    tagline: 'Fiber cement siding that lasts a generation',
    summary:
      'Certified installation of James Hardie® fiber cement siding — the industry’s most trusted system for curb appeal, weather resistance, and fire safety.',
    description: [
      'James Hardie® fiber cement siding combines the warmth of natural wood with the strength of engineered fiber cement. It’s non-combustible, resistant to rot and pests, and comes with a 30-year limited warranty.',
      'We handle full exterior re-cladding — including weather barrier installation (Tyvek HomeWrap), trim, soffits, and color-matched touch-ups. The result is a transformation that boosts both energy efficiency and resale value.',
    ],
    features: [
      'HardiePlank®, HardieShingle® and HardiePanel® systems',
      'ColorPlus® Technology factory finishes',
      'Tyvek HomeWrap weather barrier',
      'Trim, soffit, and fascia replacement',
      '30-year manufacturer warranty',
    ],
    cover: sid01,
    coverAlt: 'Two-story home with new James Hardie fiber cement siding',
    gallery: [
      { src: sid01, alt: 'Two-story home with James Hardie siding and garage' },
      { src: sid02, alt: 'Front elevation of home with new gray siding' },
      { src: sid03, alt: 'White fiber cement siding on country-style home' },
      { src: sid04, alt: 'Home wrapped in Tyvek HomeWrap before siding install' },
      { src: sid05, alt: 'Completed blue siding home with covered porch' },
    ],
    icon: 'siding',
  },
  {
    slug: 'drywall',
    name: 'Drywall Work',
    shortName: 'Drywall',
    tagline: 'Smooth, professional drywall installation and finishing',
    summary:
      'From new construction to repairs, we deliver flawless drywall hanging, taping, mudding, and texturing — ready for paint.',
    description: [
      'Quality drywall is the foundation of every great interior. Our finishers hang, tape, and mud to Level 5 finish standards — perfectly smooth, ready for primer and paint.',
      'We also handle patches and water-damage repairs, blending seamlessly into existing walls. Whether it’s a single bedroom or an entire home, the results are clean, square, and built to last.',
    ],
    features: [
      'New construction drywall hanging',
      'Level 5 smooth finishing',
      'Water and impact damage repair',
      'Texture matching (knockdown, orange peel, popcorn)',
      'Ceiling installation and resurfacing',
    ],
    cover: dry01,
    coverAlt: 'Freshly mudded drywall in a residential interior',
    gallery: [
      { src: dry01, alt: 'Drywall installation with primer-ready joint compound' },
    ],
    icon: 'drywall',
  },
  {
    slug: 'gutters',
    name: 'Gutters & Gutter Guards',
    shortName: 'Gutters',
    tagline: 'Seamless gutters and leaf protection systems',
    summary:
      'Seamless aluminum gutters and high-grade gutter guards that protect your home from water damage year-round.',
    description: [
      'Properly designed gutters direct thousands of gallons of water away from your foundation each year. We fabricate seamless aluminum gutters on-site in custom lengths and colors to match your home perfectly.',
      'Add gutter guards to keep leaves and debris out for good — eliminating clogs, ice dams, and the annual cleaning chore.',
    ],
    features: [
      'Seamless 5" and 6" aluminum gutters',
      'On-site custom fabrication',
      'Micro-mesh and reverse-curve gutter guards',
      'Downspout extensions and underground drains',
      'Repair and re-pitching of existing systems',
    ],
    cover: gut01,
    coverAlt: 'Newly installed gutter guards on residential roof',
    gallery: [
      { src: gut01, alt: 'Close-up of micro-mesh gutter guards installed' },
      { src: gut02, alt: 'Asphalt shingle roof edge with seamless gutter' },
    ],
    icon: 'gutter',
  },
  {
    slug: 'kitchen-remodeling',
    name: 'Kitchen Remodeling',
    shortName: 'Kitchens',
    tagline: 'Modern, functional kitchens designed around your life',
    summary:
      'Full kitchen renovations — cabinets, countertops, lighting, and finishes — delivered turn-key by one trusted team.',
    description: [
      'The kitchen is the heart of every home. We design and build complete kitchen renovations, from custom cabinetry and quartz countertops to lighting design and appliance integration.',
      'One contractor manages every trade — demo, plumbing, electrical, tile, and finish carpentry — so your project stays on schedule and on budget.',
    ],
    features: [
      'Custom and semi-custom cabinetry',
      'Quartz, granite, and butcher-block countertops',
      'Tile and natural-stone backsplashes',
      'Recessed and pendant lighting design',
      'Appliance integration and venting',
    ],
    cover: kit01,
    coverAlt: 'Modern kitchen with wood paneling and pendant lights',
    gallery: [
      { src: kit01, alt: 'Modern kitchen with wood paneled ceiling and pendant lights' },
      { src: kit02, alt: 'White shaker cabinets with quartz countertops' },
    ],
    icon: 'kitchen',
  },
  {
    slug: 'bathroom-remodeling',
    name: 'Bathroom Remodeling',
    shortName: 'Bathrooms',
    tagline: 'Spa-quality bathrooms, built right',
    summary:
      'Complete bathroom renovations with custom tile work, premium fixtures, and waterproof construction that stands the test of time.',
    description: [
      'A great bathroom blends style with function. We handle full bathroom remodels — walk-in showers, soaking tubs, double vanities, and luxury tile — using proper waterproofing systems (Schluter, Wedi) that prevent leaks for decades.',
      'From half-baths to primary suites, we deliver projects that feel custom-tailored to your home.',
    ],
    features: [
      'Custom tiled showers with waterproof membranes',
      'Vanity, sink, and fixture installation',
      'Soaking tubs and shower conversions',
      'Heated floors and recessed lighting',
      'Plumbing relocation and venting',
    ],
    cover: bath01,
    coverAlt: 'Modern bathroom with tiled walk-in shower and gold fixtures',
    gallery: [
      { src: bath01, alt: 'Tiled walk-in shower with gold fixtures and niche' },
    ],
    icon: 'bath',
  },
  {
    slug: 'interior-remodeling',
    name: 'Interior Remodeling',
    shortName: 'Interior Remodels',
    tagline: 'Whole-home renovations, basements, and finish carpentry',
    summary:
      'Transform any room with our full-service interior team — drywall, flooring, trim, paint, and structural work under one roof.',
    description: [
      'From basement build-outs to formal dining rooms, we handle every layer of interior renovation. Our team specializes in clean transitions between rooms, custom trim and millwork, and the structural work that makes layouts feel intentional.',
      'You get a single point of contact, one schedule, and one team that owns the result from demo to final punch-list.',
    ],
    features: [
      'Hardwood, engineered, and LVP flooring',
      'Custom trim, wainscoting, and crown molding',
      'Stair refinishing and railing replacement',
      'Basement finishing with proper egress',
      'Framing, plumbing, and electrical rough-ins',
    ],
    cover: int01,
    coverAlt: 'Refinished hardwood staircase and landing',
    gallery: [
      { src: int01, alt: 'Refinished hardwood staircase with custom railings' },
      { src: int02, alt: 'Formal dining room with columns and dark hardwood floors' },
      { src: int03, alt: 'Finished basement with carpet and recessed lighting' },
      { src: int04, alt: 'Insulation and plumbing rough-in during interior remodel' },
      { src: int05, alt: 'Framing and plumbing rough-in for interior addition' },
    ],
    icon: 'interior',
  },
  {
    slug: 'decks-porches',
    name: 'Decks & Porches',
    shortName: 'Decks',
    tagline: 'Custom outdoor living spaces built to last',
    summary:
      'Pressure-treated, composite, and rooftop decks designed for your lifestyle and engineered for the long haul.',
    description: [
      'A well-built deck extends your living space outdoors. We design and build pressure-treated, cedar, and composite decks — from ground-level patios to multi-level rooftop entertainment spaces.',
      'Every deck we deliver is permitted, inspected, and built to current code, with proper footings, joist hangers, and ledger flashing that protects against water intrusion.',
    ],
    features: [
      'Pressure-treated lumber and composite decking',
      'Rooftop decks with sleeper-system framing',
      'Custom railings, stairs, and pergolas',
      'Resurfacing and waterproof porch coatings',
      'Permits and structural engineering included',
    ],
    cover: dck02,
    coverAlt: 'New pressure-treated wood deck with stairs',
    gallery: [
      { src: dck01, alt: 'Refinished gray painted covered porch floor' },
      { src: dck02, alt: 'Two-story pressure-treated wood deck addition' },
      { src: dck03, alt: 'Red-painted rooftop deck with seating and grill' },
      { src: dck04, alt: 'Red rooftop deck walkway with city view' },
    ],
    icon: 'deck',
  },
  {
    slug: 'additions',
    name: 'Home Additions & New Construction',
    shortName: 'Additions',
    tagline: 'Build the space you’ve been dreaming of',
    summary:
      'Room additions, second-story expansions, and full new builds — managed by a contractor who handles every trade.',
    description: [
      'When your home no longer fits your life, we build the addition that does. From mudrooms and primary suites to detached garages and second-story expansions, our team manages design, permits, structural engineering, and construction.',
      'We coordinate every trade and inspection so you don’t have to. The result is an addition that looks like it was always part of the home.',
    ],
    features: [
      'Room additions and second-story expansions',
      'Detached garages and ADUs',
      'Structural engineering and permits',
      'Foundation, framing, and roof tie-ins',
      'Mechanical, electrical, and plumbing rough-ins',
    ],
    cover: add04,
    coverAlt: 'Premium brick home with custom roofing and exterior',
    gallery: [
      { src: add01, alt: 'Home addition framed and wrapped in Tyvek HomeWrap' },
      { src: add02, alt: 'Detached garage under construction with Tyvek wrap' },
      { src: add03, alt: 'Mechanical room with custom copper plumbing' },
      { src: add04, alt: 'Premium brick mansion with new roof system' },
    ],
    icon: 'addition',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
