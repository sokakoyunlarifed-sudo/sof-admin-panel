import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const result = await pool.query(
            `SELECT id, title, date, location, description, image FROM public.announcements ORDER BY date DESC`
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, date, location, description, image } = body;

        const result = await pool.query(
            `INSERT INTO public.announcements (title, date, location, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [title || '', date || null, location || '', description || '', image || '']
        );

        return NextResponse.json(result.rows[0]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
