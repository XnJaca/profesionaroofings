export type Testimonial = {
  quote: string;
  author: string;
  location: string;
  service: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      'William and his crew were professional from day one. They replaced our entire roof in two days and cleaned up like they were never here. The price was fair and the work is exceptional.',
    author: 'Sarah M.',
    location: 'Bethesda, MD',
    service: 'Asphalt Shingles Roof Replacement',
  },
  {
    quote:
      'We hired Professional Roofing for a full James Hardie siding job. The team was on time every single day, communicated clearly, and the finished house looks better than we imagined.',
    author: 'Michael R.',
    location: 'Alexandria, VA',
    service: 'James Hardie Siding',
  },
  {
    quote:
      'They handled our commercial TPO roof and stayed within budget. Crew was respectful of our tenants and the new membrane has performed flawlessly through two winters.',
    author: 'Patricia L.',
    location: 'Silver Spring, MD',
    service: 'TPO Commercial Roofing',
  },
];
