import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {Ledger} from '../src/ledger.mjs';
export async function fixture(path){
 const p=new PGlite(path);await p.exec(await readFile(new URL('../migrations/001-ledger.sql',import.meta.url),'utf8'));await p.exec('SET search_path TO cartilla_controller,public');
 // Tests exercise real PostgreSQL SQL; transactions are serialized like a checked-out pg connection.
 let chain=Promise.resolve();
 const db={query:(sql,args)=>p.query(sql,args),connect:async()=>{let release;const prior=chain;chain=new Promise(r=>release=r);await prior;return {query:db.query,release};}};
 return {p,db,ledger:new Ledger(db)};
}
