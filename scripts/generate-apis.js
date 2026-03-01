const fs = require('fs');
const path = require('path');

const TABLES = ['projects', 'events'];

TABLES.forEach(table => {
    const dir = path.join(__dirname, '../src/app/api', table);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const idDir = path.join(dir, '[id]');
    if (!fs.existsSync(idDir)) fs.mkdirSync(idDir, { recursive: true });

    const isEvent = table === 'events';

    const routeContent = `import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(
      \`SELECT * FROM public.${table} ORDER BY created_at DESC\`
    );
    return NextResponse.json(result.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    ${isEvent ?
            `const { title, date, location, description, image } = body;
       const result = await pool.query(
        'INSERT INTO public.events (title, date, location, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [title || '', date || null, location || '', description || '', image || '']
       );`
            :
            `const { title, date, content, image } = body;
       const result = await pool.query(
        'INSERT INTO public.projects (title, date, content, image) VALUES ($1, $2, $3, $4) RETURNING id',
        [title || '', date || null, content || '', image || '']
       );`
        }
    return NextResponse.json(result.rows[0]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;

    fs.writeFileSync(path.join(dir, 'route.ts'), routeContent);

    const idRouteContent = `import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await pool.query(
      \`SELECT * FROM public.${table} WHERE id = $1\`,
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
    ${isEvent ?
            `const { title, date, location, description, image } = body;
      await pool.query(
        'UPDATE public.events SET title = $1, date = $2, location = $3, description = $4, image = $5 WHERE id = $6',
        [title || '', date || null, location || '', description || '', image || '', id]
      );`
            :
            `const { title, date, content, image } = body;
      await pool.query(
        'UPDATE public.projects SET title = $1, date = $2, content = $3, image = $4 WHERE id = $5',
        [title || '', date || null, content || '', image || '', id]
      );`
        }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query(\`DELETE FROM public.${table} WHERE id = $1\`, [id]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
    fs.writeFileSync(path.join(idDir, 'route.ts'), idRouteContent);
});

console.log("Done generating API routes for projects and events");
