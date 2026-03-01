import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const result = await pool.query(
            `SELECT n.id, n.title, n.date, n.short_text, n.full_text, n.image, n.video_url,
       (SELECT json_agg(image_url) FROM news_images ni WHERE ni.news_id = n.id) as images
       FROM public.news n
       ORDER BY n.date DESC`
        );
        return NextResponse.json(result.rows);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, date, short_text, full_text, image, video_url, images } = body;

        const result = await pool.query(
            `INSERT INTO public.news (title, date, short_text, full_text, image, video_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [title || '', date || null, short_text || '', full_text || '', image || '', video_url || null]
        );

        const newId = result.rows[0].id;

        if (images && images.length > 0) {
            for (const imgUrl of images) {
                await pool.query(
                    `INSERT INTO public.news_images (news_id, image_url) VALUES ($1, $2)`,
                    [newId, imgUrl]
                );
            }
        }

        return NextResponse.json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
