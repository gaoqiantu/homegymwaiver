'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Waiver } from '@/types'
import { 
  User, 
  Mail, 
  Phone, 
  UserPlus, 
  Globe, 
  Monitor, 
  Calendar,
  FileSignature
} from 'lucide-react'

interface WaiverDetailsModalProps {
  waiver: Waiver | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WaiverDetailsModal({ waiver, open, onOpenChange }: WaiverDetailsModalProps) {
  if (!waiver) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Waiver Details
          </DialogTitle>
          <DialogDescription>
            Signed on {formatDate(waiver.agreed_at)}
          </DialogDescription>
        </DialogHeader>

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
