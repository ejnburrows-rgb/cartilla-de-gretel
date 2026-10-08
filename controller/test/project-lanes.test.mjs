import test from 'node:test';
import assert from 'node:assert/strict';
import {buildProjectLanes,projectIssueNumbers} from '../src/project-lanes.mjs';
import {api} from '../src/api.mjs';
import {fixture} from './helpers.mjs';

const closed=new Set([445,446,447,448,449,455,456,457,470,497,498]);
const issueStates=Object.fromEntries(projectIssueNumbers.map(n=>[n,{number:n,title:'Issue '+n,state:closed.has(n)?'closed':'open',html_url:'https://github.test/issues/'+n}]));
const snapshot={main:{sha:'a'.repeat(40),url:'https://github.test/commit/a'},fetched_at:'2026-10-08T12:00:00Z',instructions:{},issues:Object.values(issueStates).filter(i=>i.state==='open'),prs:[{number:552,title:'fix(controller): canonical durable controller',state:'open',draft:false,html_url:'https://github.test/pull/552'},{number:553,title:'Page 1 pencil — DO NOT MERGE without owner Yes',state:'open',draft:true,html_url:'https://github.test/pull/553'}]};

test('project lanes separate product completion from controller health',()=>{
 const view=buildProjectLanes({snapshot,issueStates,controller:{categories:{controller_system_problem:63,needs_emilio:0},system_history:{dead_letter:42,blocked:21}},workers:[{worker:'openhands',state:'running',count:1}]});
 assert.equal(view.lanes.find(l=>l.id==='workbook').status,'orange');
 assert.equal(view.lanes.find(l=>l.id==='flipchart').status,'green');
 assert.equal(view.lanes.find(l=>l.id==='controller').status,'red');
 assert.equal(view.scores.product,7.5);
 assert.equal(view.scores.controller,3);
 assert.match(view.workbook_status,/largely built/i);
});

test('project-lanes API is read-only and creates no controller jobs',async()=>{
 const f=await fixture();
 const fake={snapshot:async()=>snapshot,request:async path=>issueStates[Number(path.split('/').pop())]};
 const env={CONTROLLER_READ_TOKEN:'r'.repeat(40),CONTROLLER_ADMIN_TOKEN:'a'.repeat(40),GITHUB_REPO:'owner/repo'};
 const before=await f.ledger.countJobs({scope:'all'});
 const result=await api({url:'/api/project-lanes',method:'GET',headers:{authorization:'Bearer '+env.CONTROLLER_READ_TOKEN}},{ledger:f.ledger,readonlyGithub:fake},env);
 assert.equal(result.status,200);
 assert.equal(result.body.main.sha,'a'.repeat(40));
 assert.equal(await f.ledger.countJobs({scope:'all'}),before);
 await f.p.close();
});
