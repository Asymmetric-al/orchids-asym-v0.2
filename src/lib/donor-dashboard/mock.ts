export const WORKER_FEEDS = [
  {
    id: 'miller',
    workerName: 'The Miller Family',
    location: 'Chiang Mai, Thailand',
    activity: 'Education & Development',
    impact: '50 children received uniforms and books this week.',
    status: 'Active',
    lastUpdate: '2 hours ago'
  },
  {
    id: 'smith',
    workerName: 'Dr. Sarah Smith',
    location: 'Nairobi, Kenya',
    activity: 'Medical Mission',
    impact: 'Customs delay on medical supplies. Pray for breakthrough.',
    status: 'Urgent',
    lastUpdate: 'Yesterday'
  }
];

export const RECENT_UPDATES = [
  {
    id: 1,
    author: 'The Miller Family',
    title: 'The school year begins in Chiang Mai.',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop',
    avatar: 'MF'
  },
  {
    id: 2,
    author: 'Dr. Sarah Smith',
    title: 'Urgent: Customs Delay',
    time: '1d ago',
    avatar: 'SS'
  },
  {
    id: 3,
    author: 'Michael Chen',
    title: 'New Community Center Opening',
    time: '3d ago',
    avatar: 'MC'
  }
];

export const MOCK_TRANSACTIONS = [
  { 
    id: 'TX-10492', 
    date: '2024-12-20T10:30:00', 
    amount: 100.00, 
    recipient: 'The Miller Family', 
    recipientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80',
    category: 'Missionary', 
    type: 'Recurring', 
    method: 'Visa', 
    last4: '4242', 
    status: 'Succeeded', 
    receiptUrl: '#' 
  },
  { 
    id: 'TX-10491', 
    date: '2024-11-20T10:30:00', 
    amount: 100.00, 
    recipient: 'The Miller Family', 
    recipientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80',
    category: 'Missionary', 
    type: 'Recurring', 
    method: 'Visa', 
    last4: '4242', 
    status: 'Succeeded', 
    receiptUrl: '#' 
  },
  { 
    id: 'TX-10355', 
    date: '2024-11-12T14:15:00', 
    amount: 500.00, 
    recipient: 'Clean Water Initiative', 
    recipientAvatar: 'https://images.unsplash.com/photo-1538300342682-cf57afb97285?fit=crop&w=256&h=256&q=80',
    category: 'Project', 
    type: 'One-Time', 
    method: 'Mastercard', 
    last4: '8821', 
    status: 'Succeeded', 
    receiptUrl: '#' 
  }
];

export const MOCK_PLEDGES = [
  {
    id: 'p1',
    recipientName: 'The Miller Family',
    recipientCategory: 'Missionary',
    recipientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80',
    amount: 100,
    frequency: 'Monthly',
    nextChargeDate: '2025-01-01',
    status: 'Active',
    paymentMethodId: 'pm1'
  },
  {
    id: 'p2',
    recipientName: 'Clean Water Initiative',
    recipientCategory: 'Project',
    recipientAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?fit=crop&w=256&h=256&q=80',
    amount: 50,
    frequency: 'Monthly',
    nextChargeDate: '2025-01-15',
    status: 'Active',
    paymentMethodId: 'pm2'
  }
];
