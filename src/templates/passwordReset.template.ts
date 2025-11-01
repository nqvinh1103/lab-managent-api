export const getPasswordResetEmailTemplate = (
  userName: string,
  resetToken: string,
  systemName: string = 'Lab Management System'
): string => {
  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  const expiryHours = parseInt(process.env.RESET_TOKEN_EXPIRY_HOURS || '1', 10);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt lại mật khẩu</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #333;
          margin-bottom: 20px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 14px 40px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 20px;
          margin: 25px 0;
          border-radius: 6px;
        }
        .warning strong {
          display: block;
          margin-bottom: 10px;
          color: #856404;
        }
        .warning ul {
          margin: 10px 0 0;
          padding-left: 20px;
        }
        .warning li {
          margin: 8px 0;
          color: #856404;
        }
        .token-info {
          background: #f8f9ff;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
          margin: 20px 0;
          font-size: 14px;
          color: #666;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        .footer p {
          margin: 8px 0;
          color: #6c757d;
          font-size: 14px;
        }
        .footer a {
          color: #667eea;
          text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 30px 20px;
          }
          .header {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 ${systemName}</h1>
          <p>Yêu cầu đặt lại mật khẩu</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            <strong>Xin chào ${userName},</strong>
          </div>
          
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấp vào nút bên dưới để đặt lại mật khẩu:</p>
          
          <div class="button-container">
            <a href="${resetUrl}" class="button">
              Đặt lại mật khẩu →
            </a>
          </div>

          <div class="token-info">
            <strong>⚠️ Liên kết này sẽ hết hạn sau ${expiryHours} giờ.</strong>
            <p style="margin: 10px 0 0;">Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
            <p style="margin: 10px 0; word-break: break-all; color: #667eea;">${resetUrl}</p>
          </div>

          <div class="warning">
            <strong>⚠️ Lưu ý về bảo mật:</strong>
            <ul>
              <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</li>
              <li>Liên kết đặt lại mật khẩu chỉ có hiệu lực trong ${expiryHours} giờ.</li>
              <li>Liên kết chỉ có thể sử dụng một lần.</li>
              <li>Không chia sẻ liên kết này với bất kỳ ai.</li>
            </ul>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Nếu bạn gặp vấn đề, vui lòng liên hệ với bộ phận hỗ trợ.
          </p>
        </div>

        <div class="footer">
          <p><strong>Cần hỗ trợ?</strong></p>
          <p>Email: <a href="mailto:${process.env.EMAIL_SUPPORT || process.env.EMAIL_USER}">${process.env.EMAIL_SUPPORT || process.env.EMAIL_USER}</a></p>
          <p style="margin-top: 20px;">© 2024 ${systemName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

