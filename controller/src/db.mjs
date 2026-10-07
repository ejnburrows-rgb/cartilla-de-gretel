import pg from 'pg';
let singleton;
export function database() {
 if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL_REQUIRED');
 return singleton ??= new pg.Pool({connectionString:process.env.DATABASE_URL,max:3,connectionTimeoutMillis:10000,options:'-c search_path=cartilla_controller,public'});
}
export async function transaction(db,fn) {
 const c=await db.connect();
 try {await c.query('BEGIN');const value=await fn(c);await c.query('COMMIT');return value;}
 catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
