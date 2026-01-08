'use server'

import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'
import { waiverSchema } from '@/lib/validations'
import { SubmitWaiverResult, WaiverFormData } from '@/types'

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
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return { success: false, error: 'Failed to save waiver' }
    }

    // Send confirmation email to user
    const userEmailContent = validatedData.language === 'zh' 
      ? `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">K&K Studio 免责声明已提交</h1>
          <p>亲爱的 ${validatedData.fullName}，</p>
          <p>感谢您签署 K&K Studio 风险承担、责任免除及放弃权利协议。以下是您的提交详情：</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>姓名：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.fullName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>电子邮件：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>电话：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>紧急联系人：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.emergencyContactName} (${validatedData.emergencyContactPhone})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>签署时间：</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString('zh-CN')}</td></tr>
          </table>
          <p><strong>您的签名：</strong></p>
          <img src="${signatureUrl}" alt="签名" style="max-width: 300px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; background: #fff;" />
          <p style="margin-top: 20px; color: #666;">请保存此邮件作为您的记录。</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">K&K Studio</p>
        </div>
      `
      : `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">K&K Studio Waiver Submitted</h1>
          <p>Dear ${validatedData.fullName},</p>
          <p>Thank you for signing the K&K Studio Assumption of Risk, Release of Liability & Waiver Agreement. Here are your submission details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.fullName}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.email}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.phone}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Emergency Contact:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.emergencyContactName} (${validatedData.emergencyContactPhone})</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Signed At:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString('en-US')}</td></tr>
          </table>
          <p><strong>Your Signature:</strong></p>
          <img src="${signatureUrl}" alt="Signature" style="max-width: 300px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; background: #fff;" />
          <p style="margin-top: 20px; color: #666;">Please keep this email for your records.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">K&K Studio</p>
        </div>
      `

    try {
      await resend.emails.send({
        from: 'K&K Studio <onboarding@resend.dev>',
        to: validatedData.email,
        subject: validatedData.language === 'zh' 
          ? 'K&K Studio 免责声明副本' 
          : 'Your K&K Studio Waiver Copy',
        html: userEmailContent,
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
          from: 'K&K Studio <onboarding@resend.dev>',
          to: adminEmails,
          subject: `[K&K Studio] New Waiver Signed by ${validatedData.fullName}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1a1a1a; border-bottom: 2px solid #10b981; padding-bottom: 10px;">New Waiver Submission</h1>
              <p>A new waiver has been signed at K&K Studio:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.fullName}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.email}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.phone}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Emergency Contact:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.emergencyContactName} (${validatedData.emergencyContactPhone})</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>IP Address:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; font-family: monospace;">${ipAddress}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Language:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${validatedData.language === 'zh' ? 'Chinese (中文)' : 'English'}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Signed At:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td></tr>
              </table>
              <p><strong>Signature:</strong></p>
              <img src="${signatureUrl}" alt="Signature" style="max-width: 300px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; background: #fff;" />
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 11px; color: #999;">User Agent: ${userAgent}</p>
            </div>
          `,
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
