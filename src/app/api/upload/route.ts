import { NextRequest, NextResponse } from 'next/server';
import { s3, BUCKET_NAME } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const folder = formData.get('folder') as string || 'misc';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, '').toLowerCase();
        const ext = extname(file.name) || '.bin';
        const uniqueName = `${Date.now()}-${uuidv4()}${ext}`;
        const key = `${safeFolder}/${uniqueName}`;

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type || 'application/octet-stream',
            // MinIO specific standard ACL or policy if needed. Assuming bucket is public.
        }));

        // Generate public URL based on endpoint
        const url = new URL(s3.config.endpoint as any);
        const publicUrl = `${url.origin}/${BUCKET_NAME}/${key}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
