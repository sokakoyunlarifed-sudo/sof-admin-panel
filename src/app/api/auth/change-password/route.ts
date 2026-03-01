import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: "Şifre değiştirme şu an için devre dışıdır." }, { status: 400 });
}