const sendPasswordResetEmail = async (email, resetLink) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('\n========== PASSWORD RESET EMAIL (dev mode) ==========');
    console.log(`To: ${email}`);
    console.log(`Reset link: ${resetLink}`);
    console.log('=====================================================\n');
    return { sent: false, devMode: true, resetLink };
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: smtpUser, pass: smtpPass }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to: email,
      subject: 'Wardrobe Manager - Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `
    });
    return { sent: true };
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send reset email. Try OTP method instead.');
  }
};

module.exports = { sendPasswordResetEmail };
