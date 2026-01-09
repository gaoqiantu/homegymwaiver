'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Waiver } from '@/types'
import { WAIVER_SECTIONS } from '@/lib/constants'
import { deleteWaiver } from '@/lib/actions'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Phone, 
  UserPlus, 
  Globe, 
  Monitor, 
  Calendar,
  FileSignature,
  FileText,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react'

interface WaiverDetailsModalProps {
  waiver: Waiver | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function WaiverDetailsModal({ waiver, open, onOpenChange, onDeleted }: WaiverDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!waiver) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteWaiver(waiver.id)
      if (result.success) {
        toast.success('Waiver deleted successfully')
        onOpenChange(false)
        setShowDeleteConfirm(false)
        onDeleted?.()
      } else {
        toast.error(result.error || 'Failed to delete waiver')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Waiver Details
          </DialogTitle>
          <DialogDescription>
            Signed on {formatDate(waiver.agreed_at)}
            {waiver.waiver_version && ` • Version ${waiver.waiver_version}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 mt-4">
            {/* Contact Information */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Contact Information
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-medium">{waiver.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{waiver.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{waiver.phone}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Emergency Contact
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{waiver.emergency_contact_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{waiver.emergency_contact_phone}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Waiver Agreement Text */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Waiver Agreement Text
              </h3>
              <div className="rounded-lg border bg-muted/30 p-4 max-h-80 overflow-y-auto">
                <div className="space-y-4">
                  {WAIVER_SECTIONS.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <h4 className="font-semibold text-sm text-primary">
                        {section.titleEn} / {section.titleZh}
                      </h4>
                      <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">
                        {section.contentEn}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                        {section.contentZh}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Signature */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Signature
              </h3>
              <div className="rounded-lg border bg-white p-4">
                <Image
                  src={waiver.signature_url}
                  alt={`Signature of ${waiver.full_name}`}
                  width={400}
                  height={160}
                  className="mx-auto h-auto max-h-40 w-auto"
                  unoptimized
                />
              </div>
            </section>

            {/* Audit Information */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Audit Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">IP Address</p>
                    <p className="font-mono text-sm">{waiver.ip_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Monitor className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">User Agent</p>
                    <p className="font-mono text-xs break-all">{waiver.user_agent}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Signed At</p>
                      <p className="text-sm">{formatDate(waiver.agreed_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Language Used</p>
                      <p className="font-medium">
                        {waiver.language_used === 'zh' ? 'Chinese (中文)' : 'English'}
                      </p>
                    </div>
                  </div>
                </div>
                {waiver.waiver_version && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Waiver Version</p>
                      <p className="font-mono text-sm">{waiver.waiver_version}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-destructive text-sm flex-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Are you sure? This cannot be undone.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </Button>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Waiver
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
