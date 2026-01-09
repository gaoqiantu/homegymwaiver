'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LogOut, 
  Download, 
  Eye, 
  FileText,
  Users,
  Calendar,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { WaiverDetailsModal } from '@/components/waiver-details-modal'
import { createClient } from '@/lib/supabase/client'
import { deleteWaiver } from '@/lib/actions'
import { Waiver } from '@/types'
import { toast } from 'sonner'

interface AdminDashboardProps {
  waivers: Waiver[]
  userEmail: string
}

export function AdminDashboard({ waivers: initialWaivers, userEmail }: AdminDashboardProps) {
  const router = useRouter()
  const [waivers, setWaivers] = useState<Waiver[]>(initialWaivers)
  const [selectedWaiver, setSelectedWaiver] = useState<Waiver | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmWaiver, setDeleteConfirmWaiver] = useState<Waiver | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const handleViewDetails = (waiver: Waiver) => {
    setSelectedWaiver(waiver)
    setIsModalOpen(true)
  }

  const handleDeleteFromTable = async () => {
    if (!deleteConfirmWaiver) return
    
    setIsDeleting(true)
    try {
      const result = await deleteWaiver(deleteConfirmWaiver.id)
      if (result.success) {
        toast.success('Waiver deleted successfully')
        setWaivers(prev => prev.filter(w => w.id !== deleteConfirmWaiver.id))
        setDeleteConfirmWaiver(null)
      } else {
        toast.error(result.error || 'Failed to delete waiver')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeletedFromModal = () => {
    if (selectedWaiver) {
      setWaivers(prev => prev.filter(w => w.id !== selectedWaiver.id))
      setSelectedWaiver(null)
    }
  }

  const handleExportCSV = () => {
    if (waivers.length === 0) return

    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'Emergency Contact Name',
      'Emergency Contact Phone',
      'IP Address',
      'User Agent',
      'Language',
      'Waiver Version',
      'Signed At',
      'Signature URL'
    ]

    const csvContent = [
      headers.join(','),
      ...waivers.map(w => [
        w.id,
        `"${w.full_name}"`,
        w.email,
        w.phone,
        `"${w.emergency_contact_name}"`,
        w.emergency_contact_phone,
        w.ip_address,
        `"${w.user_agent.replace(/"/g, '""')}"`,
        w.language_used,
        w.waiver_version || '',
        w.agreed_at,
        w.signature_url
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `waivers_export_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate stats
  const totalWaivers = waivers.length
  const todayWaivers = waivers.filter(w => {
    const today = new Date().toDateString()
    return new Date(w.agreed_at).toDateString() === today
  }).length
  const thisMonthWaivers = waivers.filter(w => {
    const now = new Date()
    const waiverDate = new Date(w.agreed_at)
    return waiverDate.getMonth() === now.getMonth() && waiverDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5YzkyYWMiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Waivers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalWaivers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{todayWaivers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{thisMonthWaivers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Waivers Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Signed Waivers</CardTitle>
                  <CardDescription>
                    View and manage all submitted waivers
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV}
                  disabled={waivers.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {waivers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No waivers found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Language</TableHead>
                        <TableHead>Signed Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waivers.map((waiver) => (
                        <TableRow key={waiver.id}>
                          <TableCell className="font-medium">
                            {waiver.full_name}
                          </TableCell>
                          <TableCell>{waiver.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
                              {waiver.language_used === 'zh' ? '中文' : 'EN'}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(waiver.agreed_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(waiver)}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteConfirmWaiver(waiver)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Details Modal */}
      <WaiverDetailsModal
        waiver={selectedWaiver}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDeleted={handleDeletedFromModal}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmWaiver} onOpenChange={(open) => !open && setDeleteConfirmWaiver(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Waiver
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the waiver for <strong>{deleteConfirmWaiver?.full_name}</strong>? 
              This action cannot be undone and will also delete the signature file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmWaiver(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFromTable}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
