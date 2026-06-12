import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Nalar Etam" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Password Nalar Etam",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset Password</h2>
        <p>Klik tombol di bawah untuk reset password kamu. Link berlaku selama 1 jam.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:12px;">Jika kamu tidak merasa meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: `"Nalar Etam" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Selamat Datang di Nalar Etam!",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Halo, ${name}! 👋</h2>
        <p>Pembayaranmu berhasil! Kamu sekarang punya akses penuh ke semua modul Nalar Etam.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;font-weight:bold;">
          Mulai Belajar
        </a>
      </div>
    `,
  });
}
