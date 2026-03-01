import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const result = await pool.query(
            `SELECT n.id, n.title, n.date, n.short_text, n.full_text, n.image, n.video_url,
       (SELECT json_agg(ni.image_url) FROM news_images ni WHERE ni.news_id = n.id) as images
       FROM public.news n WHERE n.id = $1`,
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
        const { title, date, short_text, full_text, image, video_url, images } = body;

        await pool.query(
            `UPDATE public.news SET title = $1, date = $2, short_text = $3, full_text = $4, image = $5, video_url = $6 WHERE id = $7`,
            [title || '', date || null, short_text || '', full_text || '', image || '', video_url || null, id]
        );

        // Update images - simpler way: delete all existing and insert new ones
        await pool.query(`DELETE FROM public.news_images WHERE news_id = $1`, [id]);

        if (images && images.length > 0) {
            for (const imgUrl of images) {
                // imgUrl could be object or string based on GET response mapping
                const url = typeof imgUrl === 'string' ? imgUrl : imgUrl.image_url;
                await pool.query(
                    `INSERT INTO public.news_images (news_id, image_url) VALUES ($1, $2)`,
                    [id, url]
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.query(`DELETE FROM public.news WHERE id = $1`, [id]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
