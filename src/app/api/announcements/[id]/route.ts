import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { triggerSync } from '@/lib/utils/deploy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await getSupabaseServerClient();
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await getSupabaseServerClient();
        const body = await req.json();
        const { title, date, location, description, image } = body;

        const { data, error } = await supabase
            .from('announcements')
            .update({ title, date, location, description, image })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        // Auto-sync website content
        await triggerSync();
        
        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const supabase = await getSupabaseServerClient();
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        // Auto-sync website content
        await triggerSync();
        
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
