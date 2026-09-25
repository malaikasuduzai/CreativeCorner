import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent to that email address.";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return NextResponse.json({ message: GENERIC_MESSAGE });
    }

    const { rawToken, tokenHash, expiresAt } = generateResetToken();
    const configuredOrigin = process.env.APP_URL?.replace(/\/$/, "");
    const origin = configuredOrigin || request.headers.get("origin") || new URL(request.url).origin;
    const resetUrl = `${origin}/admin/reset-password?token=${rawToken}&email=${encodeURIComponent(
      admin.email
    )}`;

    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetTokenHash: tokenHash, resetTokenExpires: expiresAt },
    });

    try {
      await sendPasswordResetEmail({ to: admin.email, resetUrl });
    } catch (mailError) {
      // Do not leave a usable reset token behind when the email could not be sent.
      await prisma.admin.update({
        where: { id: admin.id },
        data: { resetTokenHash: null, resetTokenExpires: null },
      });
      console.error("[forgot-password] Gmail send failed:", mailError);
      return NextResponse.json(
        { message: "We could not send the reset email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (err) {
    console.error("[forgot-password] Request failed:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
