import { CarePersonnel, ActivityLogEntry } from './types';

export const MOCK_PERSONNEL: CarePersonnel[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    location: 'Bangkok, Thailand',
    timezone: 'Asia/Bangkok',
    status: 'Healthy',
    lastCheckIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    initials: 'SM',
    role: 'Church Planter',
    region: 'SE Asia',
    healthSignals: { emotional: 85, spiritual: 90, physical: 75, financial: 95 },
    careGaps: []
  },
  {
    id: '2',
    name: 'Jackson Lee',
    location: 'Nairobi, Kenya',
    timezone: 'Africa/Nairobi',
    status: 'Healthy',
    lastCheckIn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    initials: 'JL',
    role: 'Medical Missionary',
    region: 'Africa',
    healthSignals: { emotional: 70, spiritual: 80, physical: 65, financial: 85 },
    careGaps: []
  },
  {
    id: '3',
    name: 'Olivia Martin',
    location: 'Lima, Peru',
    timezone: 'America/Lima',
    status: 'At Risk',
    lastCheckIn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    initials: 'OM',
    role: 'Education Specialist',
    region: 'Latin America',
    healthSignals: { emotional: 45, spiritual: 50, physical: 60, financial: 40 },
    careGaps: ['Financial Gap', 'Support Flagged']
  },
  {
    id: '4',
    name: 'William Kim',
    location: 'Seoul, South Korea',
    timezone: 'Asia/Seoul',
    status: 'Healthy',
    lastCheckIn: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    initials: 'WK',
    role: 'Tech Support',
    region: 'SE Asia',
    healthSignals: { emotional: 90, spiritual: 85, physical: 95, financial: 90 },
    careGaps: []
  }
];

export const MOCK_ACTIVITY: ActivityLogEntry[] = [
  {
    id: 'a1',
    personnelId: '3',
    type: 'Video Call',
    content: 'Discussed financial stress due to rising inflation in Lima. Olivia is feeling overwhelmed.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'admin-1',
    authorName: 'Care Lead',
    isPrivate: false
  },
  {
    id: 'a2',
    personnelId: '3',
    type: 'Pastoral Note',
    content: 'Olivia mentioned she hasn\'t had a day off in 3 weeks. Needs rest.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'admin-1',
    authorName: 'Care Lead',
    isPrivate: true
  }
];
