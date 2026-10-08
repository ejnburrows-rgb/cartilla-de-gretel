import test from 'node:test';
import assert from 'node:assert/strict';
import {OpenHands} from '../src/openhands.mjs';

test('poll scopes reused-session telemetry to the current attempt and reads a bounded event window',async()=>{
 const urls=[];
 const fetcher=async(url)=>{
  urls.push(url);
  if(url.includes('/api/v1/app-conversations?ids='))return {ok:true,json:async()=>[{execution_status:'finished',sandbox_status:'RUNNING',updated_at:'2026-10-08T11:00:00Z'}]};
  if(url.endsWith('/events/count'))return {ok:true,json:async()=>120};
  if(url.includes('/events/search'))return {ok:true,json:async()=>({items:[
   {kind:'ObservationEvent',source:'environment',timestamp:'2026-10-08T11:00:03Z'},
   {kind:'ActionEvent',source:'agent',timestamp:'2026-10-08T10:45:00Z'}
  ]})};
  throw Error('unexpected '+url);
 };
 const client=new OpenHands({key:'test',fetcher});
 const result=await client.poll({external_id:'conv-1',dispatched_at:'2026-10-08T10:30:00.000Z'});
 const search=urls.find(url=>url.includes('/events/search'));
 assert.ok(search);
 assert.match(search,/limit=100/);
 assert.match(search,/timestamp__gte=2026-10-08T10%3A30%3A00\.000Z/);
 assert.equal(result.progress.latest_events.some(event=>event.source==='agent'),true);
});
