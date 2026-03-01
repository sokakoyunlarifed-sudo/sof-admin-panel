import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: "Yönetici şifre sıfırlama şu an için devre dışıdır." }, { status: 400 });
}