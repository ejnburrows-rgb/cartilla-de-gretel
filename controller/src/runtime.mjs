import {Inngest} from 'inngest';
import {database} from './db.mjs';
import {Ledger} from './ledger.mjs';
import {GitHub} from './github.mjs';
import {OpenHands} from './openhands.mjs';
import {Runner} from './runner.mjs';
import {OpenHandsReleaseExecutor} from './release-executor.mjs';
import {ReleaseLoop} from './release-loop.mjs';
export function configureWorkerKey(env=process.env){
 if(!env.OPENHANDS_API_KEY&&env.Myne)env.OPENHANDS_API_KEY=env.Myne;
 return Boolean(env.OPENHANDS_API_KEY);
}
configureWorkerKey();
export function configureGitHubKey(env=process.env){
 if(!env.GITHUB_TOKEN&&env.Ejn)env.GITHUB_TOKEN=env.Ejn;
 return Boolean(env.GITHUB_TOKEN);
}
configureGitHubKey();
export const inngest=new Inngest({id:'cartilla-controller',eventKey:process.env.INNGEST_EVENT_KEY});
export function runtime(){
 const ledger=new Ledger(database());const github=new GitHub({repo:process.env.GITHUB_REPO,token:process.env.GITHUB_TOKEN,ledger});const worker=new OpenHands({key:process.env.OPENHANDS_API_KEY});
 const send=event=>{if(!process.env.INNGEST_EVENT_KEY)throw new Error('INNGEST_EVENT_KEY_REQUIRED');return inngest.send(event);};
 const releaseExecutor=new OpenHandsReleaseExecutor({key:process.env.OPENHANDS_API_KEY});
 const releaseLoop=new ReleaseLoop({ledger,github,executor:releaseExecutor,send});
 return {ledger,github,worker,send,releaseExecutor,releaseLoop,runner:new Runner({ledger,github,worker,send,releaseLoop})};
}
