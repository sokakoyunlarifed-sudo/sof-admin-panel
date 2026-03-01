const fs = require('fs');
const path = require('path');

const TABLES = ['projects', 'events'];

TABLES.forEach(table => {
    const dir = path.join(__dirname, '../src/app/content', table);
    const isEvent = table === 'events';

    // [ListClient].tsx
    const listPath = path.join(dir, isEvent ? 'EventsListClient.tsx' : 'ProjectsListClient.tsx');
    if (fs.existsSync(listPath)) {
        let content = fs.readFileSync(listPath, 'utf8');
        content = content.replace(/import \{ getSupabaseBrowserClient \} from "@\/lib\/supabase\/client";\n/g, '');
        content = content.replace(/const supabase = useMemo\(\(\) => getSupabaseBrowserClient\(\), \[\]\);\n/g, '');
        content = content.replace(/let query = supabase\n.*\.from\(.*\)\n.*\.select\(.*\)\n.*\.order\(.*\);\n(.*)\n(.*)\n(.*)\n.*const \{ data \} = await query;\n.*setRows\(\(data \|\| \[\]\) as any\);/m,
            `      const res = await fetch('/api/${table}');
      let data = await res.json();
      if (search) {
        data = data.filter((n: any) => n.title.toLowerCase().includes(search.toLowerCase()));
      }
      if (status === "published") data = data.filter((n: any) => n.published_at !== null);
      if (status === "draft") data = data.filter((n: any) => n.published_at === null);
      setRows(data);`);

        content = content.replace(/const \{ error \} = await supabase\n.*\.from\(.*\)\n.*\.update\(\{ published_at.*\n.*\.eq\(.*\);/m,
            `const res = await fetch(\`/api/${table}/\${id}\`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ togglePublish: true, published_at: publish ? new Date().toISOString() : null }) });
      if (res.ok) await load();`);

        content = content.replace(/const \{ error \} = await supabase\.from\(.*\)\.delete\(\)\.eq\(.*\);/m,
            `const res = await fetch(\`/api/${table}/\${id}\`, { method: "DELETE" });
      if (res.ok) setRows((r) => r.filter((x) => x.id !== id));`);

        fs.writeFileSync(listPath, content);
    }

    // [FormClient].tsx
    const formPath = path.join(dir, isEvent ? 'EventFormClient.tsx' : 'ProjectFormClient.tsx');
    if (fs.existsSync(formPath)) {
        let content = fs.readFileSync(formPath, 'utf8');
        content = content.replace(/import \{ getSupabaseBrowserClient \} from "@\/lib\/supabase\/client";\n/g, '');
        content = content.replace(/const supabase = useMemo\(\(\) => getSupabaseBrowserClient\(\), \[\]\);\n/g, '');

        // Replace upsertAz and upsertAzWithSlug functions entirely by extracting the function block
        content = content.replace(/async function upsertAz[^{]*{([\s\S]*?)}(\s*)async function audit/m, 'async function audit');

        // Replace handleSave
        content = content.replace(/async function handleSave[^{]*{([\s\S]*?)}[\s\S]*?async function handleDelete/m,
            `async function handleSave(publish: boolean) {
    setSaving(true);
    setError(null);
    try {
      const published_at = publish ? new Date().toISOString() : null;
      const created_at_iso = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
      
      const payload = {
        en, az, published_at, created_at_iso
      };

      const url = mode === "new" ? "/api/${table}" : \`/api/${table}/\${id}\`;
      const method = mode === "new" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Kaydetme başarısız");

      await audit(publish ? "${table}_published" : "${table}_draft", { published: !!published_at });
      router.replace("/content/${table}");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete`);

        // Replace handleDelete
        content = content.replace(/async function handleDelete[^{]*{([\s\S]*?)}[\s\S]*?return \(/m,
            `async function handleDelete() {
    if (!id) return;
    if (!confirm("Bu öğeyi silmek istiyor musunuz? Bu işlem geri alınamaz.")) return;
    setSaving(true);
    try {
      const res = await fetch(\`/api/${table}/\${id}\`, { method: "DELETE" });
      if (res.ok) {
        await audit("${table}_deleted", {});
        router.replace("/content/${table}");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (`);

        fs.writeFileSync(formPath, content);
    }
});
console.log("Clients modified.");
