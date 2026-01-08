import { z } from 'zod'

export const waiverSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  emergencyContactName: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
  emergencyContactPhone: z.string().min(10, 'Please enter a valid phone number'),
  signature: z.string().min(1, 'Please provide your signature'),
  agreed: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
  language: z.enum(['en', 'zh']),
})

export type WaiverFormValues = z.infer<typeof waiverSchema>

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
