const fs = require('node:fs');
const path = require('node:path');
// Local export of table data already observed through the authorized browser session.
const session = process.argv[2];
const names = { 'Top consultas': 'consultas', 'Páginas principais': 'paginas', 'Dia': 'dias' };
const tables = {};
for (const line of fs.readFileSync(session, 'utf8').split('\n')) {
  let record;
  try { record = JSON.parse(line); } catch { continue; }
  if (record.type !== 'response_item' || record.payload.type !== 'function_call_output') continue;
  for (const block of Array.isArray(record.payload.output) ? record.payload.output : []) {
    if (!block.text?.startsWith('[[')) continue;
    let rows;
    try { rows = JSON.parse(block.text); } catch { continue; }
    const name = names[rows[0]?.[0]];
    if (name && rows.length > (tables[name]?.length ?? 0)) tables[name] = rows;
  }
}
for (const [name, rows] of Object.entries(tables)) {
  const csv = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\r\n');
  fs.writeFileSync(path.join(__dirname, `gsc-${name}-2026-08-30_2026-09-05.csv`), '\uFEFF' + csv + '\r\n');
  console.log(`${name}: ${rows.length - 1} rows`);
}
