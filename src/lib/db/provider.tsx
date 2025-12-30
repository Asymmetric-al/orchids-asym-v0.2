'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode } from 'react'
import { getQueryClient, setQueryClient } from './client-db'

interface TanStackDBProviderProps {
  children: ReactNode
}

export function TanStackDBProvider({ children }: TanStackDBProviderProps) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
