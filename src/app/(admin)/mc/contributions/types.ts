export interface Transaction {
  id: string
  date: string
  donorName: string
  donorEmail: string
  designation: string
  method: 'Card' | 'ACH' | 'Check' | 'Manual'
  brand?: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Bank'
  last4?: string
  status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded'
  amountGross: number
  fee: number
  amountNet: number
  frequency: 'One-Time' | 'Monthly' | 'Annual'
  source: 'Web' | 'Mobile App' | 'Admin Entry'
}

export interface DonorProfile {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  avatar: string
  jobTitle: string
  company: string
  lifetimeValue: number
  giftCount: number
  firstGiftDate: string
  lastGiftDate: string
  fundsSupported: string[]
  status: 'Active' | 'Lapsed' | 'New'
  bio: string
}
