import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const body = await req.json();
        const { title, date, short_text, full_text, image, video_url, images } = body;

        const { data, error } = await supabase
            .from('news')
            .insert([{ title, date, short_text, full_text, image, video_url, images }])
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
