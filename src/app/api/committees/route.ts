import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const result = await pool.query(
            `SELECT id, name, role, image FROM public.committees ORDER BY name ASC`
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, role, image } = body;

        const result = await pool.query(
            `INSERT INTO public.committees (name, role, image) VALUES ($1, $2, $3) RETURNING id`,
            [name || '', role || '', image || '']
        );

        return NextResponse.json(result.rows[0]);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
