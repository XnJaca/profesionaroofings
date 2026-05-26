export type License = {
  label: string;
  jurisdiction: string;
  number: string;
};

export const licenses: License[] = [
  { label: 'License #', jurisdiction: 'DC', number: '410526000160' },
  { label: 'License #', jurisdiction: 'MD', number: '152249' },
  { label: 'PLBG #', jurisdiction: '', number: '119140' },
];

export const site = {
  name: 'Professional Construction LLC',
  serviceLine: 'Professional Roofing',
  tagline: 'Quality Services · Since 2012',
  phone: '(703) 881-2291',
  phoneRaw: '+17038812291',
  whatsapp: 'https://wa.me/17038812291',
  email: 'Proroofingdmv@gmail.com',
  licenses,
  licenseShort: 'DC · MD · PLBG Licensed',
  serviceArea: 'Maryland · Virginia · Washington DC',
  city: 'Lanham, MD',
  hours: 'Mon – Sat · 8AM – 6PM',
  founded: 2012,
  social: {
    facebook: '#',
    instagram: '#',
  },
} as const;

export type Contact = {
  name: string;
  role: string;
  phone: string;
  phoneRaw: string;
  whatsapp: string;
  whatsappMessage?: string;
};

export const contacts: Contact[] = [
  {
    name: 'William Ferman',
    role: 'Owner',
    phone: '(703) 881-2291',
    phoneRaw: '+17038812291',
    whatsapp: 'https://wa.me/17038812291',
    whatsappMessage:
      "Hi William, I'd like a free estimate from Professional Construction.",
  },
  {
    name: 'Marlin Shields',
    role: 'Manager',
    phone: '(202) 826-4027',
    phoneRaw: '+12028264027',
    whatsapp: 'https://wa.me/12028264027',
    whatsappMessage:
      "Hi Marlin, I'd like a free estimate from Professional Construction.",
  },
];
