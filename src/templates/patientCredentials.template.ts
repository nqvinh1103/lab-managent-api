export const getPatientCredentialsEmailTemplate = (
    patientName: string,
    email: string,
    password: string,
    systemName: string = 'Lab Management System'
  ): string => {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thông tin đăng nhập</title>
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
          .credentials-box {
            background: #f8f9ff;
            padding: 25px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            margin: 25px 0;
          }
          .credential-item {
            margin: 20px 0;
          }
          .credential-item:last-child {
            margin-bottom: 0;
          }
          .label {
            font-weight: 600;
            color: #555;
            font-size: 14px;
            margin-bottom: 8px;
            display: block;
          }
          .value {
            font-size: 16px;
            color: #333;
            background: white;
            padding: 12px 16px;
            border-radius: 6px;
            display: block;
            border: 1px solid #e0e0e0;
            word-break: break-all;
          }
          .password {
            font-family: 'Courier New', Courier, monospace;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: 2px;
            color: #667eea;
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
            <h1>🏥 ${systemName}</h1>
            <p>Chào mừng bạn đến với hệ thống quản lý xét nghiệm</p>
          </div>
          
          <div class="content">
            <div class="greeting">
              <strong>Xin chào ${patientName},</strong>
            </div>
            
            <p>Tài khoản của bạn đã được tạo thành công trong hệ thống. Dưới đây là thông tin đăng nhập của bạn:</p>
            
            <div class="credentials-box">
              <div class="credential-item">
                <span class="label">📧 Email đăng nhập:</span>
                <span class="value">${email}</span>
              </div>
              <div class="credential-item">
                <span class="label">🔑 Mật khẩu tạm thời:</span>
                <span class="value password">${password}</span>
              </div>
            </div>
  
            <div class="warning">
              <strong>⚠️ Lưu ý quan trọng về bảo mật:</strong>
              <ul>
                <li>Đây là mật khẩu tạm thời. Vui lòng <strong>đổi mật khẩu ngay</strong> sau khi đăng nhập lần đầu tiên.</li>
                <li>Không chia sẻ thông tin đăng nhập này với bất kỳ ai, kể cả nhân viên y tế.</li>
                <li>Nếu bạn không yêu cầu tạo tài khoản này, vui lòng liên hệ ngay với chúng tôi.</li>
                <li>Email này chứa thông tin nhạy cảm, vui lòng xóa sau khi đã lưu mật khẩu an toàn.</li>
              </ul>
            </div>
  
            <div class="button-container">
              <a href="${process.env.PATIENT_PORTAL_URL || 'http://localhost:5173/login'}" class="button">
                Đăng nhập ngay →
              </a>
            </div>
  
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Sau khi đăng nhập, bạn có thể:
            </p>
            <ul style="color: #666; font-size: 14px;">
              <li>Xem kết quả xét nghiệm của bạn</li>
              <li>Theo dõi lịch sử khám bệnh</li>
              <li>Cập nhật thông tin cá nhân</li>
              <li>Thay đổi mật khẩu</li>
            </ul>
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