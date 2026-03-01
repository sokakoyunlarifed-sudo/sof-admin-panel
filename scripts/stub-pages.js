const fs = require('fs');
const path = require('path');

const stubCode = `export default function Page() { return <div className="p-8 text-center text-dark-6">This page has been disabled during the Supabase migration.</div>; }`;

const dirsToStub = [
    'src/app/logs/page.tsx',
    'src/app/users/page.tsx',
    'src/app/profiles/page.tsx',
    'src/app/settings/page.tsx',
    'src/app/content/news/[id]/edit/page.tsx', // wait, news edit page? let's check it separately, I shouldn't stub that.
];

dirsToStub.forEach(p => {
    if (p.includes('news')) return; // skip
    const full = path.join(__dirname, '..', p);
    if (fs.existsSync(full)) {
        fs.writeFileSync(full, stubCode);
    }
});
console.log("Stubbed unused pages.");
