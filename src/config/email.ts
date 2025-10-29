import nodemailer from 'nodemailer'

export const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587"),
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  })
}

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_USER || '',
  systemName: 'Lab Management System',
}
