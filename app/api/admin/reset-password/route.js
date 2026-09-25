import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const { email, token, password } = await request.json();

    if (!email || !token || !password) {
      return NextResponse.json(
        { message: "Email, token and new password are required" },
        { status: 400 }
      );
    }
    if (String(password).length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    const tokenHash = hashResetToken(token);
    const isValid =
      admin &&
      admin.resetTokenHash &&
      admin.resetTokenExpires &&
      admin.resetTokenHash === tokenHash &&
      admin.resetTokenExpires > new Date();

    if (!isValid) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({ message: "Password updated. You can now sign in." });
  } catch (err) {
    return NextResponse.json(
      { message: "Something went wrong. Please try again.", error: err.message },
      { status: 500 }
    );
  }
}
