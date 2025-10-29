import { createEmailTransporter, EMAIL_CONFIG } from '../config/email';
import { getPatientCredentialsEmailTemplate } from '../templates/patientCredentials.template';

export interface EmailResult {
  success: boolean;
  error?: string;
}

export class EmailService {
  /**
   * Send patient credentials via email
   * Returns success/failure status without throwing errors
   * This ensures patient creation is not blocked by email failures
   */
  async sendPatientCredentials(
    patientEmail: string,
    patientName: string,
    temporaryPassword: string
  ): Promise<EmailResult> {
    try {
      // Validate email configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email configuration is missing (EMAIL_USER or EMAIL_PASS). Skipping email send.');
        return {
          success: false,
          error: 'Email configuration not set. Please configure EMAIL_USER and EMAIL_PASS environment variables.'
        };
      }

      // Validate recipient email
      if (!patientEmail || !this.isValidEmail(patientEmail)) {
        console.error('❌ Invalid recipient email:', patientEmail);
        return {
          success: false,
          error: 'Invalid recipient email address'
        };
      }

      // Create transporter
      const transporter = createEmailTransporter();

      // Generate HTML email content
      const htmlContent = getPatientCredentialsEmailTemplate(
        patientName,
        patientEmail,
        temporaryPassword,
        EMAIL_CONFIG.systemName
      );

      // Email options
      const mailOptions = {
        from: `"${EMAIL_CONFIG.systemName}" <${EMAIL_CONFIG.from}>`,
        to: patientEmail,
        subject: `Thông tin đăng nhập - ${EMAIL_CONFIG.systemName}`,
        html: htmlContent,
        // Plain text fallback
        text: `
        Xin chào ${patientName},

        Tài khoản của bạn đã được tạo thành công.

        Thông tin đăng nhập:
        - Email: ${patientEmail}
        - Mật khẩu tạm thời: ${temporaryPassword}

        Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.

        Trân trọng,
${EMAIL_CONFIG.systemName}
        `.trim()
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully to', patientEmail);
      console.log('📧 Message ID:', info.messageId);
      
      return { 
        success: true 
      };

    } catch (error) {
      console.error('❌ Failed to send email:', error);
      
      // Get detailed error message
      let errorMessage = 'Unknown error occurred while sending email';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide helpful error messages
        if (errorMessage.includes('auth')) {
          errorMessage = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASS credentials.';
        } else if (errorMessage.includes('ECONNREFUSED')) {
          errorMessage = 'Cannot connect to email server. Please check EMAIL_HOST and EMAIL_PORT.';
        } else if (errorMessage.includes('Invalid login')) {
          errorMessage = 'Invalid email credentials. For Gmail, use App Password instead of regular password.';
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}