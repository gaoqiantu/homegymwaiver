export interface Waiver {
  id: string
  full_name: string
  email: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  signature_url: string
  ip_address: string
  user_agent: string
  agreed_at: string
  language_used: 'en' | 'zh'
}

export interface WaiverFormData {
  fullName: string
  email: string
  phone: string
  emergencyContactName: string
  emergencyContactPhone: string
  signature: string
  agreed: boolean
  language: 'en' | 'zh'
}

export interface SubmitWaiverResult {
  success: boolean
  error?: string
}
