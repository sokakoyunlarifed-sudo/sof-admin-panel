const fs = require('fs');
const path = require('path');

const TABLES = ['projects', 'events'];

TABLES.forEach(table => {
    const isEvent = table === 'events';

    const routeTsPath = path.join(__dirname, '../src/app/api', table, 'route.ts');
    const idRouteTsPath = path.join(__dirname, '../src/app/api', table, '[id]/route.ts');

    [routeTsPath, idRouteTsPath].forEach(p => {
        if (fs.existsSync(p)) {
            let content = fs.readFileSync(p, 'utf8');

            if (isEvent) {
                // remove the if check but keep the true block
                content = content.replace(/if \('events' === 'events'\) \{/g, '');
                // remove the else block
                content = content.replace(/\} else \{[\s\S]*?(?=return NextResponse)/, '');
            } else {
                // remove the if block and keep the else block
                content = content.replace(/if \('projects' === 'events'\) \{[\s\S]*?\} else \{/, '');
                content = content.replace(/\}[\s]*?(?=return NextResponse)/, '');
            }
            fs.writeFileSync(p, content);
        }
    });
});
console.log("TS static errors fixed.");
