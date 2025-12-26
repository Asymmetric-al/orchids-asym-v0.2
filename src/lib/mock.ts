import { formatCurrency } from './utils';

export interface FieldWorker {
  id: string;
  title: string;
  location: string;
  category: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
}

export const MOCK_WORKERS: FieldWorker[] = [
  {
    id: '1',
    title: 'Clean Water Initiative',
    location: 'Ghana, West Africa',
    category: 'Infrastructure',
    description: 'We are committed to providing sustainable clean water solutions to rural communities in Ghana. By building wells and implementing filtration systems, we ensure that every family has access to safe drinking water.',
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000',
    raised: 26700,
    goal: 30000,
  },
  {
    id: '2',
    title: 'Refugee Crisis Response',
    location: 'Lesbos, Greece',
    category: 'Humanitarian',
    description: 'Our team is on the ground in Lesbos, providing essential medical supplies, food, and shelter to refugees arriving on the shores. We work directly with local leaders to identify the most urgent needs.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000',
    raised: 19200,
    goal: 30000,
  },
  {
    id: '3',
    title: 'Rural Education Access',
    location: 'Chiang Mai, Thailand',
    category: 'Education',
    description: 'We believe that education is the key to breaking the cycle of poverty. Our projects in northern Thailand focus on building schools and providing resources for children in remote mountain villages.',
    image: 'https://images.unsplash.com/photo-1595053826286-2e59efd9ff18?q=80&w=2000',
    raised: 27600,
    goal: 30000,
  },
  {
    id: '4',
    title: 'Medical Clinic Support',
    location: 'Nairobi, Kenya',
    category: 'Healthcare',
    description: 'Supporting local medical clinics with equipment and training for healthcare workers. We focus on maternal health and preventable disease treatment in underserved urban areas.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000',
    raised: 15000,
    goal: 25000,
  }
];

export function getFieldWorkers() {
  return MOCK_WORKERS;
}

export function getFieldWorkerById(id: string) {
  return MOCK_WORKERS.find(w => w.id === id);
}
