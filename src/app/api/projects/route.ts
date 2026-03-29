import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { triggerSync } from '@/lib/utils/deploy';

export async function GET(req: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

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
        const { title, description, image_url, status, start_date, end_date } = body;

        const { data, error } = await supabase
            .from('projects')
            .insert([{ title, description, image_url, status, start_date, end_date }])
            .select()
            .single();

        if (error) throw error;
        
        await triggerSync();
        
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
