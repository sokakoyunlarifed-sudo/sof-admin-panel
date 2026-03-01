import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT * FROM public.events WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.togglePublish !== undefined) {
      await pool.query(
        `UPDATE public.events SET published_at = $1 WHERE id = $2`,
        [body.published_at, id]
      );
      return NextResponse.json({ success: true });
    }

    const { en, az, published_at, created_at_iso } = body;

    await pool.query(
      'UPDATE public.events SET title = $1, description = $2, location = $3, event_date = $4, image_url = $5, published_at = $6, created_at = $7, updated_at = $8 WHERE id = $9',
      [en.title, en.description, en.location, en.event_date, en.image_url, published_at, created_at_iso, new Date().toISOString(), id]
    );

    const exists = await pool.query('SELECT id FROM public.events_az WHERE title = $1 AND event_date = $2', [az.title || en.title, az.event_date]);
    if (exists.rows.length > 0) {
      await pool.query(
        'UPDATE public.events_az SET description = $1, location = $2, image_url = $3, published_at = $4, updated_at = $5 WHERE id = $6',
        [az.description, az.location, az.image_url, published_at, new Date().toISOString(), exists.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO public.events_az (title, description, location, event_date, image_url, published_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [az.title, az.description, az.location, az.event_date, az.image_url, published_at, created_at_iso, new Date().toISOString()]
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query(`DELETE FROM public.events WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
