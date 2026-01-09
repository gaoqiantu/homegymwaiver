'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { waiverSchema } from '@/lib/validations'
import { SubmitWaiverResult, WaiverFormData, DeleteWaiverResult } from '@/types'
import { WAIVER_VERSION, generateWaiverHtml } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitWaiver(data: WaiverFormData): Promise<SubmitWaiverResult> {
  try {
    // Validate the data
    const validatedData = waiverSchema.parse(data)

    // Get request metadata
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Initialize Supabase client with service role
    const supabase = await createServiceClient()

    // Ensure signature is provided
    if (!validatedData.signature) {
      return { success: false, error: 'Signature is required' }
    }

    // Decode base64 signature and upload to storage
    const base64Data = validatedData.signature.replace(/^data:image\/png;base64,/, '')
    const signatureBuffer = Buffer.from(base64Data, 'base64')
    const fileName = `signature_${Date.now()}_${Math.random().toString(36).substring(7)}.png`

    const { error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(fileName, signatureBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { success: false, error: 'Failed to upload signature' }
    }

    // Get the public URL for the signature
    const { data: urlData } = supabase.storage
      .from('signatures')
      .getPublicUrl(fileName)

    const signatureUrl = urlData.publicUrl
    const signedAt = new Date().toISOString()

    // Insert waiver record into database
    const { error: insertError } = await supabase
      .from('waivers')
      .insert({
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        emergency_contact_name: validatedData.emergencyContactName,
        emergency_contact_phone: validatedData.emergencyContactPhone,
        signature_url: signatureUrl,
        ip_address: ipAddress,
        user_agent: userAgent,
        language_used: validatedData.language,
        waiver_version: WAIVER_VERSION,
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return { success: false, error: 'Failed to save waiver' }
    }

    // Generate waiver HTML for email
    const waiverTextHtml = generateWaiverHtml()

    // Build complete email template with full waiver text
    const buildEmailHtml = (isAdmin: boolean = false) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0; color: #1a1a1a; font-size: 24px;">K&K STUDIO</h1>
          <h2 style="margin: 10px 0 0 0; color: #374151; font-size: 18px; font-weight: normal;">
            ${validatedData.language === 'zh' ? '免责声明副本' : 'Waiver Agreement Copy'}
          </h2>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">
            Assumption of Risk, Release of Liability & Waiver Agreement<br/>
            风险承担、责任免除及放弃权利协议
          </p>
        </div>

        <!-- Waiver Text Document Box -->
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">
            ${validatedData.language === 'zh' ? '协议条款 / Agreement Terms' : 'Agreement Terms / 协议条款'}
          </h3>
          ${waiverTextHtml}
        </div>

        <!-- Signed By Section -->
        <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 20px 0; color: #166534; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
            ✓ ${validatedData.language === 'zh' ? '签署确认 / Signed By' : 'Signed By / 签署确认'}
          </h3>
          
          <!-- Signature Image -->
          <div style="text-align: center; background-color: #ffffff; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <img src="${signatureUrl}" alt="Signature" style="max-width: 300px; height: auto;" />
          </div>
          
          <!-- Signer Details -->
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; width: 40%;">Name / 姓名:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px; font-weight: 600;">${validatedData.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Email / 电子邮件:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px;">${validatedData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Phone / 电话:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px;">${validatedData.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-size: 13px;">Emergency Contact / 紧急联系人:</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-size: 13px;">${validatedData.emergencyContactName} (${validatedData.emergencyContactPhone})</td>
            </tr>
          </table>
        </div>

        <!-- Audit Trail -->
        <div style="background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
            Audit Trail / 审计记录
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <tr>
              <td style="padding: 4px 0; color: #9ca3af;">Signed At / 签署时间:</td>
              <td style="padding: 4px 0; color: #6b7280; font-family: monospace;">${signedAt}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #9ca3af;">IP Address / IP地址:</td>
              <td style="padding: 4px 0; color: #6b7280; font-family: monospace;">${ipAddress}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #9ca3af;">Waiver Version / 版本:</td>
              <td style="padding: 4px 0; color: #6b7280; font-family: monospace;">${WAIVER_VERSION}</td>
            </tr>
            ${isAdmin ? `
            <tr>
              <td style="padding: 4px 0; color: #9ca3af;">Language Used / 使用语言:</td>
              <td style="padding: 4px 0; color: #6b7280;">${validatedData.language === 'zh' ? 'Chinese (中文)' : 'English'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; color: #9ca3af; vertical-align: top;">User Agent:</td>
              <td style="padding: 4px 0; color: #6b7280; font-family: monospace; font-size: 10px; word-break: break-all;">${userAgent}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 11px;">
            ${validatedData.language === 'zh' 
              ? '请保存此邮件作为您签署协议的记录。' 
              : 'Please keep this email as your record of the signed agreement.'}
          </p>
          <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 11px;">
            K&K Studio · Atlanta, GA
          </p>
        </div>
      </div>
    `

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: 'K&K Studio <noreply@kkstudioatl.serviceless.ai>',
        to: validatedData.email,
        subject: validatedData.language === 'zh' 
          ? 'K&K Studio 免责声明副本' 
          : 'Your K&K Studio Waiver Copy',
        html: buildEmailHtml(false),
      })
    } catch (emailError) {
      console.error('User email error:', emailError)
      // Continue even if email fails - waiver is saved
    }

    // Send notification email to admin(s) - supports multiple emails separated by comma
    const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(email => email.trim()).filter(Boolean)
    if (adminEmails && adminEmails.length > 0) {
      try {
        await resend.emails.send({
          from: 'K&K Studio <noreply@kkstudioatl.serviceless.ai>',
          to: adminEmails,
          subject: `[K&K Studio] New Waiver Signed by ${validatedData.fullName}`,
          html: buildEmailHtml(true),
        })
      } catch (adminEmailError) {
        console.error('Admin email error:', adminEmailError)
        // Continue even if admin email fails
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Submit waiver error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteWaiver(waiverId: string): Promise<DeleteWaiverResult> {
  try {
    const supabase = await createServiceClient()

    // First, get the waiver to find the signature URL
    const { data: waiver, error: fetchError } = await supabase
      .from('waivers')
      .select('signature_url')
      .eq('id', waiverId)
      .single()

    if (fetchError) {
      console.error('Fetch waiver error:', fetchError)
      return { success: false, error: 'Failed to find waiver' }
    }

    // Extract filename from signature URL and delete from storage
    if (waiver?.signature_url) {
      const urlParts = waiver.signature_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      
      const { error: storageError } = await supabase.storage
        .from('signatures')
        .remove([fileName])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue with database deletion even if storage fails
      }
    }

    // Delete the waiver record
    const { error: deleteError } = await supabase
      .from('waivers')
      .delete()
      .eq('id', waiverId)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return { success: false, error: 'Failed to delete waiver' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete waiver error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}
