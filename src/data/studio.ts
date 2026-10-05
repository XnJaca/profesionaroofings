// Catalog for the 3D exterior studio. Hex values approximate the
// manufacturers' published colors on screen; they are previews, not samples.

export type LayerKey = 'siding' | 'shingle' | 'gutters' | 'tpo';

export type Swatch = { name: string; hex: string };

export type StudioLayer = {
  key: LayerKey;
  /** Tab label. */
  short: string;
  title: string;
  body: string;
  facts: string[];
  swatchLabel: string;
  swatches: Swatch[];
  /** Matching option in the estimate form's service select. */
  service: string;
  /** Service detail page. */
  slug: string;
};

export const studioLayers: StudioLayer[] = [
  {
    key: 'siding',
    short: 'Siding',
    title: 'James Hardie® fiber cement siding',
    body: 'HardiePlank® lap siding over Tyvek HomeWrap, cut around every window and door and finished with crisp trim and corner boards.',
    facts: ['ColorPlus® factory finish', 'Non-combustible, rot resistant', '30-year manufacturer warranty'],
    swatchLabel: 'Siding colors',
    swatches: [
      { name: 'Aged Pewter', hex: '#7d7c74' },
      { name: 'Arctic White', hex: '#eeede6' },
      { name: 'Light Mist', hex: '#d6d8cf' },
      { name: 'Pearl Gray', hex: '#c3c4bd' },
      { name: 'Navajo Beige', hex: '#c8b898' },
      { name: 'Monterey Taupe', hex: '#a19583' },
      { name: 'Khaki Brown', hex: '#8a7a60' },
      { name: 'Mountain Sage', hex: '#8b9680' },
      { name: 'Boothbay Blue', hex: '#6f8a9c' },
      { name: 'Evening Blue', hex: '#33414f' },
      { name: 'Iron Gray', hex: '#525558' },
      { name: 'Night Gray', hex: '#40454a' },
      { name: 'Countrylane Red', hex: '#7a3b33' },
    ],
    service: 'James Hardie Siding',
    slug: 'siding',
  },
  {
    key: 'shingle',
    short: 'Roof',
    title: 'Architectural asphalt shingles',
    body: 'Dimensional shingles over synthetic underlayment, laid course by course from the eaves to the ridge, with ridge caps and flashing.',
    facts: ['Full tear-off and re-roof', 'Ridge vents and attic ventilation', '10-year workmanship warranty'],
    swatchLabel: 'Shingle colors',
    swatches: [
      { name: 'Charcoal', hex: '#4a4b4d' },
      { name: 'Pewter Gray', hex: '#5e6064' },
      { name: 'Estate Gray', hex: '#6b6c6c' },
      { name: 'Onyx Black', hex: '#2f3133' },
      { name: 'Weathered Wood', hex: '#6d6a60' },
      { name: 'Driftwood', hex: '#5d5951' },
      { name: 'Barkwood', hex: '#5a4a3e' },
      { name: 'Hickory', hex: '#6a5442' },
      { name: 'Shakewood', hex: '#8a6a4c' },
      { name: 'Slate', hex: '#55606a' },
      { name: 'Hunter Green', hex: '#3e4c40' },
    ],
    service: 'Asphalt Shingles Roofing',
    slug: 'asphalt-shingles',
  },
  {
    key: 'gutters',
    short: 'Gutters',
    title: 'Seamless aluminum gutters',
    body: 'K-style gutters formed on site in one piece per run, with downspouts that carry the water away from your foundation. Try the storm test.',
    facts: ['Seamless 5" and 6" gutters', 'Custom fabrication on site', 'Gutter guards available'],
    swatchLabel: 'Gutter colors',
    swatches: [
      { name: 'White', hex: '#f4f4f2' },
      { name: 'Almond', hex: '#e3d9c6' },
      { name: 'Clay', hex: '#b5a487' },
      { name: 'Musket Brown', hex: '#5a4a3a' },
      { name: 'Royal Brown', hex: '#46342a' },
      { name: 'Bronze', hex: '#6b5640' },
      { name: 'Gray', hex: '#8e9193' },
      { name: 'Black', hex: '#232527' },
    ],
    service: 'Gutters & Gutter Guards',
    slug: 'gutters',
  },
  {
    key: 'tpo',
    short: 'Flat roof',
    title: 'TPO flat roofing',
    body: 'Single-ply TPO membrane rolled out across low-slope roofs like garages, porches and additions, with heat-welded seams.',
    facts: ['Heat-welded seams', 'Reflective, energy efficient', 'Commercial and residential'],
    swatchLabel: 'Membrane colors',
    swatches: [
      { name: 'White', hex: '#f1f2f0' },
      { name: 'Light Gray', hex: '#c7c9c8' },
      { name: 'Tan', hex: '#cbb999' },
    ],
    service: 'TPO Roofing (Commercial/Residential)',
    slug: 'tpo-roofing',
  },
];
