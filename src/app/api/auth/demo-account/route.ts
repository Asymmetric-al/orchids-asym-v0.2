import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(request: Request) {
  // Security check: Only allow demo accounts in development or if explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_ACCOUNTS !== 'true') {
     return NextResponse.json({ error: 'Demo accounts are disabled in this environment' }, { status: 403 })
  }

  try {
    const { role } = await request.json()

    if (!role || !['admin', 'missionary', 'donor'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const timestamp = Date.now()
    const email = `demo-${role}-${timestamp}@asymmetric.al`
    const password = 'demo1234'
    const demoData: Record<string, { firstName: string; lastName: string }> = {
      admin: { firstName: 'Admin', lastName: 'Demo' },
      missionary: { firstName: 'Missionary', lastName: 'Demo' },
      donor: { firstName: 'Donor', lastName: 'Demo' }
    }

    const { firstName, lastName } = demoData[role]

    // Create user with email confirmed and metadata set
    // The handle_new_user trigger will automatically create the profile
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        tenant_id: DEFAULT_TENANT_ID
      },
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role
      }
    })

    if (userError) {
      console.error('Error creating demo user:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    if (!userData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ 
      email, 
      password,
      role 
    })

  } catch (error) {
    console.error('Internal server error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}