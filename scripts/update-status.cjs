const fs = require('fs');
const path = require('path');

const statusPath = path.join(__dirname, '../docs/status.html');
let html = fs.readFileSync(statusPath, 'utf8');

// The HTML likely has a table with L17, L18, L19, L20
// Let's replace the status tags inside these rows.

// For L17-L20, they should be "Verified" or "Teacher"
// The prompt says: "all lessons should now show verified or teacher"
// I will just use a generic replace for all Pending and Needs Review in the file
// because all lessons from 1-24 are now verified or teacher.

html = html.replace(/<span class="[^"]*">Pending<\/span>/gi, '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Verified</span>');
html = html.replace(/<span class="[^"]*">Needs Review<\/span>/gi, '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Verified</span>');

// Specifically for L21-L24, if they are "Solo docente", they might already be marked correctly,
// but just in case, if they were "Pending", they are now "Verified" or "Teacher".
html = html.replace(/<td class="[^"]*">Pending<\/td>/gi, '<td class="px-4 py-2"><span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Verified</span></td>');

fs.writeFileSync(statusPath, html, 'utf8');
