import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await getSupabaseServerClient();
        const formData = await req.formData();
        const current = formData.get('current') as string;
        const next = formData.get('next') as string;
        const confirm = formData.get('confirm') as string;

        if (next !== confirm) {
            return NextResponse.json({ error: 'Yeni şifreler eşleşmiyor' }, { status: 400 });
        }

        // Supabase update password requires user to be logged in
        const { error } = await supabase.auth.updateUser({
            password: next
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
