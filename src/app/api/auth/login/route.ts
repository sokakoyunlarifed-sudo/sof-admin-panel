import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // Since there's only one admin gmail as requested
        const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "admin@sof.web.tr";
        const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_DEMO_USER_PASS || "@L1y3V$8mQ!zR";

        if (email === adminEmail && password === adminPassword) {
            const token = process.env.ADMIN_SESSION_SECRET || "fallback_secret_token_123!";

            const res = NextResponse.json({ success: true });
            res.cookies.set("sof_admin_session", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return res;
        }

        return NextResponse.json({ error: "E-posta veya şifre hatalı" }, { status: 401 });
    } catch (err: any) {
        return NextResponse.json({ error: "Bir hata oluştu" }, { status: 500 });
    }
}
