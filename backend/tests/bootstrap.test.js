import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createPool,one } from '../src/config/database.js';
import { migrate } from '../scripts/migrate.js';
test('CLI bootstraps first superadmin from private stdin and refuses duplicate bootstrap',async()=>{
  const url=new URL(process.env.TEST_DATABASE_URL);if(!url.pathname.endsWith('_test'))throw new Error('Database test wajib.');
  const base=new URL(url);base.pathname='/postgres';const admin=createPool(base.toString()),name=`langkahku_bootstrap_${randomBytes(5).toString('hex')}_test`;url.pathname=`/${name}`;let pool;
  try{
    await admin.query(`CREATE DATABASE ${name}`);pool=createPool(url.toString());await migrate(pool);
    const secret=randomBytes(24).toString('hex'),input=JSON.stringify({schoolName:'Sekolah Bootstrap Fiktif',username:'bootstrap.fiktif',password:secret});
    const run=()=>spawnSync(process.execPath,['scripts/bootstrap-superadmin.js'],{env:{...process.env,DATABASE_URL:url.toString(),NODE_ENV:'test'},input,encoding:'utf8',windowsHide:true});
    const first=run();assert.equal(first.status,0);assert.equal(first.stdout.includes(secret),false);const user=await one(pool,"SELECT role,status,password_hash FROM users WHERE username='bootstrap.fiktif'");assert.equal(user.role,'superadmin');assert.equal(user.status,'approved');assert.match(user.password_hash,/^\$argon2id\$/);assert.notEqual(run().status,0);assert.equal(Number((await one(pool,'SELECT count(*) n FROM users')).n),1);
  }finally{await pool?.end();await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);await admin.end();}
});
