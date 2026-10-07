import {Inngest} from 'inngest';
import {database} from './db.mjs';
import {Ledger} from './ledger.mjs';
import {GitHub} from './github.mjs';
import {OpenHands} from './openhands.mjs';
import {Runner} from './runner.mjs';
export const inngest=new Inngest({id:'cartilla-controller',eventKey:process.env.INNGEST_EVENT_KEY});
export function runtime(){
 const ledger=new Ledger(database());const github=new GitHub({repo:process.env.GITHUB_REPO,token:process.env.GITHUB_TOKEN});const worker=new OpenHands({key:process.env.OPENHANDS_API_KEY});
 const send=event=>{if(!process.env.INNGEST_EVENT_KEY)throw new Error('INNGEST_EVENT_KEY_REQUIRED');return inngest.send(event);};
 return {ledger,github,worker,send,runner:new Runner({ledger,github,worker,send})};
}
