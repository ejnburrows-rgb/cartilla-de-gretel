import {readFile} from 'node:fs/promises';
import {database} from '../src/db.mjs';
const db=database();
try{await db.query(await readFile(new URL('../migrations/001-ledger.sql',import.meta.url),'utf8'));console.log(JSON.stringify({migration:1,applied:true}));}finally{await db.end();}
