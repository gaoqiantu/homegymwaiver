'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SignaturePad, SignaturePadRef } from '@/components/signature-pad'
import { LegalText } from '@/components/legal-text'
import { useTranslation } from '@/hooks/use-translation'
import { waiverSchema, WaiverFormValues } from '@/lib/validations'
import { submitWaiver } from '@/lib/actions'

interface WaiverFormProps {
  onSuccess: () => void
}

export function WaiverForm({ onSuccess }: WaiverFormProps) {
  const { t, language } = useTranslation()
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const signaturePadRef = useRef<SignaturePadRef>(null)

  const form = useForm<WaiverFormValues>({
    resolver: zodResolver(waiverSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      signature: '',
      agreed: false,
      language: language,
    },
  })

  const onSubmit = async (data: WaiverFormValues) => {
    if (!hasScrolledToBottom) {
      toast.error(t('scrollRequired'))
      return
    }

    const signature = signaturePadRef.current?.getDataURL()
    if (!signature) {
      toast.error(t('signatureRequired'))
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await submitWaiver({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        signature,
        agreed: true,
        language,
      })

      if (result.success) {
        toast.success(t('successTitle'), {
          description: t('successMessage'),
        })
        onSuccess()
      } else {
        toast.error(t('errorTitle'), {
          description: result.error || t('errorMessage'),
        })
      }
    } catch {
      toast.error(t('errorTitle'), {
        description: t('errorMessage'),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('fullNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder={t('phonePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
          <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            {t('emergencyContact')}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="emergencyContactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emergencyContactName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('emergencyContactNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emergencyContactPhone')}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder={t('emergencyContactPhonePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Legal Text */}
        <LegalText
          onScrolledToBottom={() => setHasScrolledToBottom(true)}
          hasScrolledToBottom={hasScrolledToBottom}
        />

        {/* Agreement Checkbox */}
        <FormField
          control={form.control}
          name="agreed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={!hasScrolledToBottom}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className={!hasScrolledToBottom ? 'text-muted-foreground' : ''}>
                  {t('agreeCheckbox')}
                </FormLabel>
                {!hasScrolledToBottom && (
                  <p className="text-xs text-muted-foreground">{t('scrollRequired')}</p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Signature */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{t('signatureTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('signatureInstructions')}</p>
          <SignaturePad
            ref={signaturePadRef}
            onSignatureChange={setHasSignature}
          />
          {!hasSignature && form.formState.isSubmitted && (
            <p className="text-sm font-medium text-destructive">{t('signatureRequired')}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || !hasScrolledToBottom || !hasSignature}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('submitting')}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {t('submit')}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
