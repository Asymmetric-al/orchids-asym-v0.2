import { createCollection, liveQueryCollectionOptions } from '@tanstack/react-db'
import { z } from 'zod'

const peopleSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  type: z.string(),
  church: z.string().optional(),
  totalGiven: z.number(),
  status: z.string(),
  lastGift: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const giftsSchema = z.object({
  id: z.string(),
  donorId: z.string(),
  donorName: z.string(),
  donorEmail: z.string(),
  amount: z.number(),
  date: z.string(),
  method: z.string(),
  fund: z.string(),
  status: z.string(),
  missionaryId: z.string().optional(),
  missionaryName: z.string().optional(),
  createdAt: z.string(),
})

export const peopleCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'people',
    schema: peopleSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('people'),
  })
)

export const giftsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'gifts',
    schema: giftsSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('gifts'),
  })
)

export type Person = z.infer<typeof peopleSchema>
export type Gift = z.infer<typeof giftsSchema>
