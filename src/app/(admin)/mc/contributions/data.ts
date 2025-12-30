import type { Transaction, DonorProfile } from './types'

function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

const FUNDS = ['General Fund', 'Water Initiative', 'The Miller Family', 'Dr. Sarah Smith', 'Emergency Relief', 'Operations']
const NAMES = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Evans', 'Evan Wright', 'Fiona Green', 'George Hall', 'Hannah Lee', 'Ian Clark']

export const DONOR_PROFILES: Record<string, DonorProfile> = {
  'Alice Johnson': {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 (555) 234-5678',
    address: '123 Maple Avenue',
    city: 'Denver',
    state: 'CO',
    zip: '80203',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice Johnson',
    jobTitle: 'Software Engineer',
    company: 'Tech Corp',
    lifetimeValue: 15000,
    giftCount: 24,
    firstGiftDate: '2022-03-15T00:00:00.000Z',
    lastGiftDate: '2025-12-01T00:00:00.000Z',
    fundsSupported: ['General Fund', 'Water Initiative'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Bob Smith': {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    phone: '+1 (555) 345-6789',
    address: '456 Oak Street',
    city: 'Seattle',
    state: 'WA',
    zip: '98101',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob Smith',
    jobTitle: 'Product Manager',
    company: 'Global Solutions',
    lifetimeValue: 8500,
    giftCount: 12,
    firstGiftDate: '2023-01-20T00:00:00.000Z',
    lastGiftDate: '2025-11-15T00:00:00.000Z',
    fundsSupported: ['The Miller Family', 'Emergency Relief'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Charlie Davis': {
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    phone: '+1 (555) 456-7890',
    address: '789 Pine Road',
    city: 'Austin',
    state: 'TX',
    zip: '73301',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie Davis',
    jobTitle: 'Teacher',
    company: 'Local School',
    lifetimeValue: 3200,
    giftCount: 8,
    firstGiftDate: '2024-02-10T00:00:00.000Z',
    lastGiftDate: '2025-10-20T00:00:00.000Z',
    fundsSupported: ['Dr. Sarah Smith', 'Operations'],
    status: 'New',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Diana Evans': {
    name: 'Diana Evans',
    email: 'diana.evans@example.com',
    phone: '+1 (555) 567-8901',
    address: '321 Elm Lane',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana Evans',
    jobTitle: 'Director',
    company: 'Creative Agency',
    lifetimeValue: 42000,
    giftCount: 36,
    firstGiftDate: '2021-06-01T00:00:00.000Z',
    lastGiftDate: '2025-12-10T00:00:00.000Z',
    fundsSupported: ['General Fund', 'Emergency Relief'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Evan Wright': {
    name: 'Evan Wright',
    email: 'evan.wright@example.com',
    phone: '+1 (555) 678-9012',
    address: '654 Birch Court',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Evan Wright',
    jobTitle: 'Consultant',
    company: 'Tech Corp',
    lifetimeValue: 5600,
    giftCount: 15,
    firstGiftDate: '2023-09-05T00:00:00.000Z',
    lastGiftDate: '2025-09-30T00:00:00.000Z',
    fundsSupported: ['Water Initiative', 'The Miller Family'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Fiona Green': {
    name: 'Fiona Green',
    email: 'fiona.green@example.com',
    phone: '+1 (555) 789-0123',
    address: '987 Cedar Drive',
    city: 'Denver',
    state: 'CO',
    zip: '80204',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fiona Green',
    jobTitle: 'Software Engineer',
    company: 'Global Solutions',
    lifetimeValue: 1200,
    giftCount: 3,
    firstGiftDate: '2025-01-15T00:00:00.000Z',
    lastGiftDate: '2025-08-20T00:00:00.000Z',
    fundsSupported: ['General Fund'],
    status: 'Lapsed',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'George Hall': {
    name: 'George Hall',
    email: 'george.hall@example.com',
    phone: '+1 (555) 890-1234',
    address: '159 Willow Way',
    city: 'Seattle',
    state: 'WA',
    zip: '98102',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George Hall',
    jobTitle: 'Product Manager',
    company: 'Local School',
    lifetimeValue: 22000,
    giftCount: 28,
    firstGiftDate: '2022-07-20T00:00:00.000Z',
    lastGiftDate: '2025-11-25T00:00:00.000Z',
    fundsSupported: ['Dr. Sarah Smith', 'Operations', 'General Fund'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Hannah Lee': {
    name: 'Hannah Lee',
    email: 'hannah.lee@example.com',
    phone: '+1 (555) 901-2345',
    address: '753 Spruce Street',
    city: 'Austin',
    state: 'TX',
    zip: '73302',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hannah Lee',
    jobTitle: 'Teacher',
    company: 'Creative Agency',
    lifetimeValue: 9800,
    giftCount: 18,
    firstGiftDate: '2023-04-10T00:00:00.000Z',
    lastGiftDate: '2025-12-05T00:00:00.000Z',
    fundsSupported: ['Emergency Relief', 'Water Initiative'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  },
  'Ian Clark': {
    name: 'Ian Clark',
    email: 'ian.clark@example.com',
    phone: '+1 (555) 012-3456',
    address: '246 Aspen Avenue',
    city: 'New York',
    state: 'NY',
    zip: '10002',
    country: 'USA',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ian Clark',
    jobTitle: 'Director',
    company: 'Tech Corp',
    lifetimeValue: 35000,
    giftCount: 42,
    firstGiftDate: '2021-11-30T00:00:00.000Z',
    lastGiftDate: '2025-12-15T00:00:00.000Z',
    fundsSupported: ['The Miller Family', 'General Fund', 'Operations'],
    status: 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  }
}

export function generateData(count: number): Transaction[] {
  return Array.from({ length: count }).map((_, i) => {
    const seed = i * 7
    const gross = Math.floor(seededRandom(seed) * 500) + 10
    const fee = Math.round((gross * 0.029 + 0.30) * 100) / 100
    const statusRand = seededRandom(seed + 1)
    const status = statusRand > 0.95 ? 'Failed' : statusRand > 0.9 ? 'Refunded' : statusRand > 0.85 ? 'Pending' : 'Succeeded'
    const name = NAMES[Math.floor(seededRandom(seed + 2) * NAMES.length)]
    const methodRand = seededRandom(seed + 3)
    const method = methodRand > 0.6 ? 'Card' : methodRand > 0.3 ? 'ACH' : 'Check'
    const baseDate = new Date('2025-12-30T00:00:00.000Z').getTime()
    
    return {
      id: `txn_${(seed * 12345).toString(36).toUpperCase().slice(0, 9)}`,
      date: new Date(baseDate - Math.floor(seededRandom(seed + 4) * 10000000000)).toISOString(),
      donorName: name,
      donorEmail: DONOR_PROFILES[name].email,
      designation: FUNDS[Math.floor(seededRandom(seed + 5) * FUNDS.length)],
      method: method as Transaction['method'],
      brand: method === 'Card' ? (seededRandom(seed + 6) > 0.5 ? 'Visa' : 'Mastercard') : method === 'ACH' ? 'Bank' : undefined,
      last4: (1000 + Math.floor(seededRandom(seed + 7) * 9000)).toString(),
      status: status as Transaction['status'],
      amountGross: gross,
      fee: fee,
      amountNet: gross - fee,
      frequency: seededRandom(seed + 8) > 0.6 ? 'Monthly' : 'One-Time',
      source: seededRandom(seed + 9) > 0.8 ? 'Admin Entry' : seededRandom(seed + 10) > 0.4 ? 'Mobile App' : 'Web'
    } as Transaction
  })
}

export const TRANSACTIONS_DATA = generateData(300)
