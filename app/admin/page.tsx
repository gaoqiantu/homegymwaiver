import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from './dashboard'
import { Waiver } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/admin/login')
  }

  // Fetch all waivers
  const { data: waivers, error } = await supabase
    .from('waivers')
    .select('*')
    .order('agreed_at', { ascending: false })

  if (error) {
    console.error('Error fetching waivers:', error)
  }

  return <AdminDashboard waivers={(waivers as Waiver[]) || []} userEmail={user.email || ''} />
}
