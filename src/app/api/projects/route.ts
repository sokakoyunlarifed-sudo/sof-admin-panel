import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(
      `SELECT * FROM public.projects ORDER BY created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { en, az, published_at, created_at_iso } = body;

    const result = await pool.query(
      'INSERT INTO public.projects (title, summary, content, slug, image_url, published_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [en.title, en.summary, en.content, en.slug, en.image_url, published_at, created_at_iso, new Date().toISOString()]
    );
    const newId = result.rows[0].id;

    await pool.query(
      'INSERT INTO public.projects_az (title, summary, content, slug, image_url, published_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [az.title, az.summary, az.content, az.slug, az.image_url, published_at, created_at_iso, new Date().toISOString()]
    );

    return NextResponse.json({ id: newId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
