import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/s3";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let prefix = searchParams.get("prefix") || "";
        if (prefix && !prefix.endsWith("/")) {
            prefix += "/";
        }

        const bucket = process.env.S3_BUCKET || "sof-media";

        const command = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix || undefined,
        });

        const response = await s3.send(command);

        const items = (response.Contents || []).map((item) => ({
            id: item.Key,
            name: item.Key?.split("/").pop() || "",
            path: item.Key,
            url: `${process.env.S3_ENDPOINT}/${bucket}/${item.Key}`,
            updated_at: item.LastModified ? item.LastModified.toISOString() : null,
            size: item.Size || 0,
        }));

        return NextResponse.json({ items });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { paths } = body;

        if (!paths || paths.length === 0) {
            return NextResponse.json({ success: true });
        }

        const bucket = process.env.S3_BUCKET || "sof-media";

        const command = new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: {
                Objects: paths.map((path: string) => ({ Key: path })),
            }
        });

        await s3.send(command);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
