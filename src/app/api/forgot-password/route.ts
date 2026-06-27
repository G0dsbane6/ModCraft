import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetLink = `${req.nextUrl.origin}/reset-password?token=${token}`;

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: email,
        subject: "ModCraft - Password Reset",
        text: `Reset your password here: ${resetLink}`,
        html: `<p>Reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
    } else {
      console.log(`[FORGOT PASSWORD] Token for ${email}: ${token}`);
      console.log(`[FORGOT PASSWORD] Reset link: ${resetLink}`);
    }

    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
      sent: !!smtpHost,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  }
}
