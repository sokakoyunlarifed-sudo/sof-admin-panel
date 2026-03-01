import { PUBLIC_ENDPOINT } from "../s3";

export function getPublicUrl(path: string | null | undefined): string {
    if (!path) return "/images/placeholder.svg"; // placeholder if needed

    // If it's already a full URL (http or https), return it.
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // If it starts with /storage/v1, it's a Supabase relative path.
    if (path.startsWith("/storage/v1")) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://caywfilmqzttjbrfplmv.supabase.co";
        return `${supabaseUrl}${path}`;
    }

    // Otherwise, assume it's a MinIO relative key (e.g., "news/filename.png")
    // Or just a filename (e.g., "filename.png" - but we'll try to prepend PUBLIC_ENDPOINT)
    return `${PUBLIC_ENDPOINT}/${path}`;
}
