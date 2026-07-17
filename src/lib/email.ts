import nodemailer from 'nodemailer'

type EmailMessage = {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'HireTrack AI <noreply@hiretrack.ai>'

  const isDevelopment = process.env.NODE_ENV !== 'production'

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your-api-key')) {
    if (isDevelopment) {
      console.log(`[DEV EMAIL] To: ${message.to}`)
      console.log(`[DEV EMAIL] Subject: ${message.subject}`)
      console.log(message.text)
    } else {
      console.warn('RESEND_API_KEY is not configured; email was not sent.')
    }
    return
  }

  // If the key is a Gmail App Password or SMTP key (doesn't start with re_)
  const isResend = apiKey.startsWith('re_')

  if (!isResend) {
    try {
      const emailMatch = from.match(/<(.+)>/)
      const rawEmail = emailMatch ? emailMatch[1] : from

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: rawEmail,
          pass: apiKey.trim(),
        },
      })

      await transporter.sendMail({
        from: from.includes('<') ? from : `HireTrack AI <${from}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      })

      console.log(`[EMAIL] Sent successfully via Gmail SMTP to: ${message.to}`)
      return
    } catch (error) {
      console.error('Nodemailer SMTP error:', error)
      if (!isDevelopment) {
        throw new Error('Failed to send email via SMTP.')
      } else {
        console.warn('[DEV] Failed to send email via SMTP. Falling back to console log:')
        console.log(`[DEV EMAIL] To: ${message.to}`)
        console.log(message.text)
      }
      return
    }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.error(`Resend API error: ${response.status} ${response.statusText} - ${errText}`)
      if (!isDevelopment) {
        throw new Error('Failed to send email.')
      } else {
        console.warn('[DEV] Failed to send email via Resend. Falling back to console log:')
        console.log(`[DEV EMAIL] To: ${message.to}`)
        console.log(message.text)
      }
    }
  } catch (error) {
    console.error('Error sending email:', error)
    if (!isDevelopment) {
      throw error
    } else {
      console.warn('[DEV] Error sending email. Falling back to console log:')
      console.log(`[DEV EMAIL] To: ${message.to}`)
      console.log(message.text)
    }
  }
}
