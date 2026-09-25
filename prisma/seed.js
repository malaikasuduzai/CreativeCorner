const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Default admin login for local development — change the password after
// first login in a real deployment. Email/password can be overridden via
// env vars if you don't want this pair hardcoded.
const DEFAULT_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@creativecorner.com',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin@123',
};

const services = [
  {
    name: 'Wedding Planning',
    description: 'Complete wedding design and coordination from engagement to reception.',
    price: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1641996250159-9d2bbfb483fa?q=80&w=800&auto=format&fit=crop',
    features: 'Venue selection, Theme & decor design, Vendor coordination, Day-of management',
  },
  {
    name: 'Birthday Events',
    description: 'Themed birthday celebrations for kids, milestones and everything between.',
    price: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1643175816971-a463dee6ae61?q=80&w=800&auto=format&fit=crop',
    features: 'Custom theming, Entertainment, Cake & catering, Party favors',
  },
  {
    name: 'Corporate Events',
    description: 'Product launches, team events and company functions, done professionally.',
    price: 90000,
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=800&auto=format&fit=crop',
    features: 'Venue & logistics, AV & branding, Guest management, On-site coordination',
  },
  {
    name: 'Engagement Events',
    description: 'Elegant engagement ceremonies styled to match your love story.',
    price: 70000,
    imageUrl: 'https://images.unsplash.com/photo-1598993947191-58e49166849e?q=80&w=800&auto=format&fit=crop',
    features: 'Ring ceremony setup, Floral styling, Photography coordination, Guest hospitality',
  },
  {
    name: 'Conference Management',
    description: 'End-to-end planning for conferences, from registration to closing.',
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1637665662134-db459c1bbb46?q=80&w=800&auto=format&fit=crop',
    features: 'Speaker coordination, Registration desk, AV & staging, Delegate management',
  },
  {
    name: 'Seminar Management',
    description: 'Smooth, well-organized seminars and workshops for any audience size.',
    price: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1503423571797-2d2bb372094a?q=80&w=800&auto=format&fit=crop',
    features: 'Venue setup, Materials & signage, Attendee check-in, Session timing',
  },
  {
    name: 'Private Parties',
    description: 'Intimate gatherings and celebrations, styled to your exact taste.',
    price: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1745573673583-a51f665ae48e?q=80&w=800&auto=format&fit=crop',
    features: 'Custom decor, Menu curation, Music & ambience, Guest coordination',
  },
  {
    name: 'Bridal Events',
    description: 'Mehndi, Baraat and Walima styling with cohesive theming across events.',
    price: 110000,
    imageUrl: 'https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?q=80&w=800&auto=format&fit=crop',
    features: 'Multi-day theming, Stage design, Coordination team, Family hospitality',
  },
  {
    name: 'Decoration Services',
    description: 'Floral, lighting and stage decoration for any venue or occasion.',
    price: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=800&auto=format&fit=crop',
    features: 'Floral design, Backdrop & stage art, Table styling, Entrance design',
  },
  {
    name: 'Catering',
    description: 'Curated menus and professional service for every guest count.',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop',
    features: 'Custom menus, Live counters, Waitstaff, Dietary accommodations',
  },
  {
    name: 'Photography',
    description: 'Candid and traditional photography and cinematography coverage.',
    price: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop',
    features: 'Full-day coverage, Edited albums, Highlight reel, Drone shots (optional)',
  },
  {
    name: 'Stage & Lighting',
    description: 'Custom stage builds and lighting design that set the mood.',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=800&auto=format&fit=crop',
    features: 'Stage construction, Ambient lighting, Spotlighting, Special effects',
  },
  {
    name: 'Sound Management',
    description: 'Professional audio setup for speeches, performances and music.',
    price: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop',
    features: 'PA systems, Wireless mics, DJ & live sound, On-site sound engineer',
  },
];

const packages = [
  {
    name: 'Basic Package',
    description: 'A clean, well-managed setup for smaller gatherings that still need to look their best.',
    price: 80000,
    imageUrl: null,
    features: 'Event Decoration, Basic Lighting, Seating Arrangement, Basic Event Management',
  },
  {
    name: 'Premium Package',
    description: 'A fuller production with professional lighting and dedicated coordination for a polished event day.',
    price: 180000,
    imageUrl: null,
    features: 'Premium Decoration, Professional Lighting, Stage Setup, Seating Arrangement, Dedicated Event Coordination',
  },
  {
    name: 'Luxury Package',
    description: 'End-to-end planning and premium production for weddings and flagship events, handled from A to Z.',
    price: 350000,
    imageUrl: null,
    features: 'Complete Event Planning, Premium Decoration, Stage & Lighting, Catering Coordination, Photography, Professional Event Management',
  },
];

const galleryItems = [
  { eventName: 'Royal Wedding Stage', category: 'Weddings', imageUrl: 'https://images.unsplash.com/photo-1738225734899-30852be7e396?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Bridal Mehndi Setup', category: 'Weddings', imageUrl: 'https://images.unsplash.com/photo-1745573673583-a51f665ae48e?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Kids Birthday Theme', category: 'Birthdays', imageUrl: 'https://images.unsplash.com/photo-1741969494307-55394e3e4071?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Milestone Birthday Bash', category: 'Birthdays', imageUrl: 'https://images.unsplash.com/photo-1560128411-79892dd93bf8?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Product Launch Night', category: 'Corporate Events', imageUrl: 'https://images.unsplash.com/photo-1637665662134-db459c1bbb46?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Annual Company Gala', category: 'Corporate Events', imageUrl: 'https://images.unsplash.com/photo-1641996250159-9d2bbfb483fa?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Ring Ceremony Decor', category: 'Engagements', imageUrl: 'https://images.unsplash.com/photo-1598993947191-58e49166849e?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Garden Engagement Setup', category: 'Engagements', imageUrl: 'https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Tech Conference Stage', category: 'Conferences', imageUrl: 'https://images.unsplash.com/photo-1618506487216-4e8c60a64c73?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Delegate Registration Desk', category: 'Conferences', imageUrl: 'https://images.unsplash.com/photo-1605797491749-0c6989a44356?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Floral Entrance Design', category: 'Decorations', imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Table Centerpiece Styling', category: 'Decorations', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Custom Stage Build', category: 'Stage Designs', imageUrl: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Backdrop & Stage Art', category: 'Stage Designs', imageUrl: 'https://images.unsplash.com/photo-1737682599438-319b61711b5f?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Ambient Fairy Lighting', category: 'Lighting', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Spotlight Stage Design', category: 'Lighting', imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Intimate Rooftop Dinner', category: 'Private Events', imageUrl: 'https://images.unsplash.com/photo-1601482441062-b9f13131f33a?q=80&w=900&auto=format&fit=crop' },
  { eventName: 'Private Garden Celebration', category: 'Private Events', imageUrl: 'https://images.unsplash.com/photo-1707333514312-39cf7658479c?q=80&w=900&auto=format&fit=crop' },
];

// Dated in the past and marked completed so they show up on the public
// Portfolio page, which only lists events where completed = true.
const events = [
  {
    name: "Luxury Wedding – Islamabad",
    eventType: 'Wedding',
    date: new Date('2025-03-14'),
    location: 'Islamabad',
    description: 'Complete wedding planning, decoration, stage setup, lighting and event coordination for a 500-guest reception.',
    services: 'Wedding Planning, Decoration, Stage & Lighting, Catering Coordination',
    imageUrl: 'https://images.unsplash.com/photo-1738225734899-30852be7e396?q=80&w=1200&auto=format&fit=crop',
    // At least 5 images total (imageUrl above + 4 more here) for the event gallery.
    images: [
      'https://images.unsplash.com/photo-1738225734899-30852be7e396?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1745573673583-a51f665ae48e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1641996250159-9d2bbfb483fa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=1200&auto=format&fit=crop',
    ].join(', '),
    completed: true,
  },
  {
    name: 'Tech Summit 2025 – Lahore',
    eventType: 'Conference',
    date: new Date('2025-02-08'),
    location: 'Lahore',
    description: 'Two-day technology conference with speaker coordination, registration desk and full AV production.',
    services: 'Conference Management, Stage & Lighting, Sound Management',
    imageUrl: 'https://images.unsplash.com/photo-1637665662134-db459c1bbb46?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1637665662134-db459c1bbb46?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618506487216-4e8c60a64c73?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605797491749-0c6989a44356?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503423571797-2d2bb372094a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
    ].join(', '),
    completed: true,
  },
  {
    name: "Zara's 5th Birthday – Karachi",
    eventType: 'Birthday',
    date: new Date('2025-01-22'),
    location: 'Karachi',
    description: 'A whimsical, fully-themed birthday party with entertainment, custom decor and catering for 80 guests.',
    services: 'Birthday Events, Decoration, Catering',
    imageUrl: 'https://images.unsplash.com/photo-1741969494307-55394e3e4071?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1741969494307-55394e3e4071?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560128411-79892dd93bf8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1643175816971-a463dee6ae61?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=1200&auto=format&fit=crop',
    ].join(', '),
    completed: true,
  },
  {
    name: 'Alpha Textiles Product Launch',
    eventType: 'Corporate',
    date: new Date('2024-12-05'),
    location: 'Faisalabad',
    description: 'Corporate product launch with branded staging, guest management and on-site event coordination.',
    services: 'Corporate Events, Stage & Lighting, Photography',
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1641996250159-9d2bbfb483fa?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1637665662134-db459c1bbb46?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
    ].join(', '),
    completed: true,
  },
  {
    name: "Ahmed & Sana's Engagement",
    eventType: 'Engagement',
    date: new Date('2024-11-18'),
    location: 'Rawalpindi',
    description: 'An elegant garden engagement ceremony with floral styling and coordinated photography.',
    services: 'Engagement Events, Decoration, Photography',
    imageUrl: 'https://images.unsplash.com/photo-1598993947191-58e49166849e?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1598993947191-58e49166849e?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1769812343890-4e406a33cfbe?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1745573673583-a51f665ae48e?q=80&w=1200&auto=format&fit=crop',
    ].join(', '),
    completed: true,
  },
  {
    name: 'Design Forward Seminar',
    eventType: 'Conference',
    date: new Date('2024-10-02'),
    location: 'Islamabad',
    description: 'A one-day design seminar with attendee check-in, session timing and full venue setup.',
    services: 'Seminar Management, Sound Management',
    imageUrl: 'https://images.unsplash.com/photo-1503423571797-2d2bb372094a?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1503423571797-2d2bb372094a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605797491749-0c6989a44356?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618506487216-4e8c60a64c73?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?q=80&w=1200&auto=format&fit=crop',
    ].join(', '),
    completed: true,
  },
];

async function main() {
  // None of these models have a @unique text field to upsert on, so each
  // one is seeded only if its table is empty. That keeps this script safe
  // to re-run without creating duplicates, while avoiding any schema changes.
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({ data: services });
  }

  const packageCount = await prisma.package.count();
  if (packageCount === 0) {
    await prisma.package.createMany({ data: packages });
  }

  const galleryCount = await prisma.galleryItem.count();
  if (galleryCount === 0) {
    await prisma.galleryItem.createMany({ data: galleryItems });
  }

  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    await prisma.event.createMany({ data: events });
  }

  const adminCount = await prisma.admin.count();
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    await prisma.admin.create({
      data: { email: DEFAULT_ADMIN.email, password: hashedPassword },
    });
  }

  console.log('Seed complete:', {
    services: serviceCount === 0 ? services.length : 'already seeded, skipped',
    packages: packageCount === 0 ? packages.length : 'already seeded, skipped',
    galleryItems: galleryCount === 0 ? galleryItems.length : 'already seeded, skipped',
    events: eventCount === 0 ? events.length : 'already seeded, skipped',
    admin: adminCount === 0 ? `created (${DEFAULT_ADMIN.email})` : 'already seeded, skipped',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
