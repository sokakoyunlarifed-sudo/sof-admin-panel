const fs = require('fs');
const path = require('path');

const TABLES = ['projects', 'events'];

TABLES.forEach(table => {
    const dir = path.join(__dirname, '../src/app/content', table);

    // page.tsx
    const pagePath = path.join(dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
        let content = fs.readFileSync(pagePath, 'utf8');
        content = content.replace(/import \{ getSupabaseServerClient \} from "@\/lib\/supabase\/server";/g, 'import { pool } from "@/lib/db";');
        content = content.replace(/const supabase = await getSupabaseServerClient\(\);\n.*const \{ data \} = await supabase\n.*\.from\(.*\)\n.*\.select\(.*\)\n.*\.order\(.*\);/m,
            `  let data: any[] = [];
  try {
    const result = await pool.query(
      "SELECT * FROM public.${table} ORDER BY created_at DESC"
    );
    data = result.rows.map((row: any) => ({
      ...row,
      date: row.date ? new Date(row.date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    }));
  } catch (err) {
    console.error(err);
  }`);
        fs.writeFileSync(pagePath, content);
    }

    // [id]/edit/page.tsx
    const editPagePath = path.join(dir, '[id]/edit/page.tsx');
    if (fs.existsSync(editPagePath)) {
        let content = fs.readFileSync(editPagePath, 'utf8');
        content = content.replace(/import \{ getSupabaseServerClient \} from "@\/lib\/supabase\/server";/g, 'import { pool } from "@/lib/db";');
        content = content.replace(/const supabase = await getSupabaseServerClient\(\);\n.*const \{ data \} = await supabase\n.*\.from\(.*\)\n.*\.select\(.*\)\n.*\.eq\(.*\)\n.*\.single\(\);/m,
            `  let data: any = null;
  try {
    const result = await pool.query(
      "SELECT * FROM public.${table} WHERE id = $1",
      [id]
    );
    if (result.rows.length > 0) {
      data = result.rows[0];
      if (data.date) data.date = new Date(data.date).toISOString();
      if (data.created_at) data.created_at = new Date(data.created_at).toISOString();
    }
  } catch (err) {
    console.error(err);
  }`);
        fs.writeFileSync(editPagePath, content);
    }
});
console.log("Pages modified.");
