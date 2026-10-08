const clamp=(n,min=0,max=10)=>Math.max(min,Math.min(max,n));
const statusFor=score=>score>=9?'green':score>=6?'orange':'red';
const round1=n=>Math.round(n*10)/10;
export const projectIssueNumbers=[445,446,447,448,449,450,454,455,456,457,458,470,495,496,497,498,540,545];

function stateOf(snapshot,states,number){
 const known=states[number]?.state;if(known)return known;
 return snapshot?.issues?.some(i=>i.number===number)?'open':'unknown';
}
const isClosed=(snapshot,states,n)=>stateOf(snapshot,states,n)==='closed';
const isOpen=(snapshot,states,n)=>stateOf(snapshot,states,n)==='open';
const issueRef=(states,n)=>states[n]?{type:'issue',number:n,title:states[n].title,url:states[n].html_url??states[n].url??null,state:states[n].state}:null;
const prRef=p=>({type:'pr',number:p.number,title:p.title,url:p.html_url??p.url??null,state:p.state,draft:!!p.draft});
const refsFor=(snapshot,states,issues=[],prPattern=null)=>{
 const refs=issues.filter(n=>isOpen(snapshot,states,n)).map(n=>issueRef(states,n)).filter(Boolean);
 if(prPattern)refs.push(...(snapshot?.prs??[]).filter(p=>prPattern.test(String(p.title??''))).map(prRef));
 return refs;
};
const lane=(id,name,score,truth,complete,remains,refs,ownerAction='Nothing')=>({id,name,score:round1(clamp(score)),status:statusFor(score),truth,complete:complete.filter(Boolean),remains:remains.filter(Boolean),refs,owner_action:ownerAction,needs_owner_attention:ownerAction!=='Nothing'});

export function unknownProjectLanes({controller=null,workers=[]}={}){
 const names=[['workbook','Student Workbook'],['flipchart','Teacher / Flip Chart'],['artwork','Artwork / Assets'],['motion','Motion / Gretel'],['qa','Final QA / Proof'],['controller','Controller / Workers'],['release','Final Release']];
 return {stale:true,last_verified:null,main:null,scores:{product:null,controller:null},lanes:names.map(([id,name])=>({id,name,score:null,status:'unknown',truth:'Current verified data is unavailable.',complete:[],remains:['Refresh when GitHub/controller reads are available.'],refs:[],owner_action:'Unknown',needs_owner_attention:false})),buckets:{built:[],finish:[],prove:[],orchestration:[]},workbook_status:'UNKNOWN / STALE',flipchart_status:'UNKNOWN / STALE',ignore:['Do not infer project completion from stale controller history.'],open_now:{issues:[],prs:[]},controller,workers};
}

export function buildProjectLanes({snapshot,issueStates={},controller=null,workers=[]}){
 if(!snapshot)return unknownProjectLanes({controller,workers});
 const core=[445,446,447,448,449],coreClosed=core.filter(n=>isClosed(snapshot,issueStates,n)).length;
 const pageTurnClosed=isClosed(snapshot,issueStates,470),livingClosed=isClosed(snapshot,issueStates,497),cleanClosed=isClosed(snapshot,issueStates,498);
 const workbookRegressionOpen=isOpen(snapshot,issueStates,450),goldenOpen=isOpen(snapshot,issueStates,496),realignmentOpen=isOpen(snapshot,issueStates,495);
 let workbookScore=4+(coreClosed/5)*3+(pageTurnClosed?1:0)+(livingClosed?.5:0)+(cleanClosed?.5:0)+(isClosed(snapshot,issueStates,450)?1:0);
 if(goldenOpen)workbookScore-=.5;
 workbookScore=clamp(workbookScore);

 const artOpen=isOpen(snapshot,issueStates,454),teacherClosed=isClosed(snapshot,issueStates,457),welcomeClosed=isClosed(snapshot,issueStates,456);
 const flipScore=clamp(4+(teacherClosed?3:0)+(pageTurnClosed?1:0)+(artOpen?0:1)+(welcomeClosed?1:0));
 const artScore=artOpen?6:(isClosed(snapshot,issueStates,454)?10:5);
 const motionCore=isClosed(snapshot,issueStates,455)&&livingClosed;
 const motionScore=motionCore?(artOpen?9:10):6;
 const qaScore=isClosed(snapshot,issueStates,450)&&teacherClosed?10:teacherClosed&&!workbookRegressionOpen?9:teacherClosed?7:5;
 const releaseOpen=isOpen(snapshot,issueStates,458),releaseScore=releaseOpen?4:(isClosed(snapshot,issueStates,458)?10:3);

 const systemProblems=Number(controller?.categories?.controller_system_problem??0);
 const activeWorkers=workers.reduce((n,r)=>n+Number(r.count??0),0);
 let controllerScore=systemProblems>=20?3:systemProblems>=10?4:systemProblems>=5?5:systemProblems>0?7:10;
 const controllerOpen=isOpen(snapshot,issueStates,545)||(snapshot.prs??[]).some(p=>p.number===552);
 if(controllerOpen)controllerScore=Math.min(controllerScore,6);

 const ownerGate=(snapshot.prs??[]).find(p=>/do not merge.*owner|owner.*approval|owner yes/i.test(String(p.title??'')+' '+String(p.body??'')));
 const workbookOwner=ownerGate&&/workbook|pencil|page 1/i.test(String(ownerGate.title??''))?`Owner approval is required before PR #${ownerGate.number} can merge.`:'Nothing';

 const lanes=[
  lane('workbook','Student Workbook',workbookScore,
   workbookRegressionOpen||goldenOpen?'Core student mechanics are largely in place; final Workbook regression and remaining visual reconciliation are still open.':'No canonical Workbook completion gap is currently open.',
   [coreClosed===5?'Workbook activity implementation #445–#449':null,pageTurnClosed?'Page-turn system #470':null,livingClosed?'Living-art motion #497':null,cleanClosed?'Clean archetype rollout #498':null],
   [workbookRegressionOpen?'Final assembled Workbook regression #450':null,goldenOpen?'Golden Workbook page 1 #496':null,realignmentOpen?'Workbook clean-canvas parent #495':null],
   refsFor(snapshot,issueStates,[450,496,495,540],/Workbook|pencil|reading page|page 1/i),workbookOwner),
  lane('flipchart','Teacher / Flip Chart',flipScore,
   teacherClosed?'Dedicated teacher / Flip Chart validation is closed; final artwork and assembled-product proof remain the meaningful dependencies.':'Teacher / Flip Chart validation is still open.',
   [teacherClosed?'Teacher / Flip Chart validation #457':null,pageTurnClosed?'Physical top-bound page-turn #470':null],
   [artOpen?'Final production artwork #454':null,releaseOpen?'Final assembled-product proof #458':null],
   refsFor(snapshot,issueStates,[457,470],/Flip Chart|teacher/i)),
  lane('artwork','Artwork / Assets',artScore,
   artOpen?'Production foreground artwork/master remediation remains an active product gap.':'The canonical production artwork issue is closed.',
   [],[artOpen?'Production foreground artwork and verified color transfer #454':null],
   refsFor(snapshot,issueStates,[454],/artwork|color|asset/i)),
  lane('motion','Motion / Gretel',motionScore,
   motionCore?'Gretel/living-art motion implementation is in place; final art replacements may still need geometry-sensitive spot checks.':'Canonical Gretel or living-art motion work is still open.',
   [isClosed(snapshot,issueStates,455)?'Gretel behavior/motion #455':null,livingClosed?'Living-art runtime #497':null],
   [!motionCore?'Finish remaining canonical motion issue(s)':null,artOpen?'Re-check part-rig alignment after final art replacement':null],
   refsFor(snapshot,issueStates,[455,497],/Gretel|motion/i)),
  lane('qa','Final QA / Proof',qaScore,
   workbookRegressionOpen?'Teacher validation is closed, but the final assembled Workbook regression is still open.':'Canonical Workbook and teacher regression gates are not both open.',
   [teacherClosed?'Teacher / Flip Chart validation #457':null],
   [workbookRegressionOpen?'Workbook final regression #450':null,releaseOpen?'Final assembled-product proof #458':null],
   refsFor(snapshot,issueStates,[450,457,540],/regression|fidelity/i)),
  lane('controller','Controller / Workers',controllerScore,
   systemProblems?`${systemProblems} controller/system records are currently in retrying, blocked, failed, or dead-letter states; ${activeWorkers} worker attempt(s) are active.`:`No controller/system problem state is currently counted; ${activeWorkers} worker attempt(s) are active.`,
   [],[controllerOpen?'Canonical controller repair #545 / PR #552 remains open':null,systemProblems?`${systemProblems} controller/system problem records need reconciliation`:null],
   refsFor(snapshot,issueStates,[545],/controller/i),
   Number(controller?.categories?.needs_emilio??0)>0?`${controller.categories.needs_emilio} controller job(s) explicitly record an Emilio action.`:'Nothing'),
  lane('release','Final Release',releaseScore,
   releaseOpen?'Final assembled-product proof and authorized release have not completed.':'The canonical final-release issue is closed.',
   [],[releaseOpen?'Final assembled-product proof / release #458':null],
   refsFor(snapshot,issueStates,[458],/welcome|release/i))
 ];

 const product=round1(workbookScore*.30+flipScore*.15+artScore*.20+motionScore*.10+qaScore*.15+releaseScore*.10);
 const openIssues=(snapshot.issues??[]).map(i=>({number:i.number,title:i.title,url:i.html_url??i.url??null,deferred:[387,388,390].includes(i.number),controller:i.number===545}));
 const openPrs=(snapshot.prs??[]).map(prRef);
 const built=[coreClosed===5?'Workbook activity families #445–#449':null,pageTurnClosed?'Workbook + Flip Chart page-turn system #470':null,motionCore?'Gretel + living-art motion #455/#497':null,teacherClosed?'Teacher / Flip Chart validation #457':null,cleanClosed?'Clean Workbook archetype rollout #498':null].filter(Boolean);
 const finish=[artOpen?'Artwork/master remediation #454':null,goldenOpen?'Golden Workbook page 1 #496':null,realignmentOpen?'Workbook clean-canvas parent #495':null].filter(Boolean);
 const prove=[workbookRegressionOpen?'Final Workbook regression #450':null,releaseOpen?'Final assembled-product proof #458':null].filter(Boolean);
 const orchestration=[controllerOpen?'Controller repair #545 / PR #552':null,systemProblems?`${systemProblems} controller/system problem records`:null].filter(Boolean);

 return {
  stale:false,last_verified:snapshot.fetched_at??new Date().toISOString(),main:snapshot.main??null,
  scores:{product,controller:round1(controllerScore)},lanes,
  buckets:{built,finish,prove,orchestration},
  workbook_status:workbookRegressionOpen?'Core implementation largely built; final visuals/art and assembled Workbook proof remain.':'No canonical final Workbook regression issue is open.',
  flipchart_status:teacherClosed?'Functionally validated; final art replacement and whole-product release proof remain.':'Teacher / Flip Chart validation remains open.',
  ignore:['Branches by themselves are not active work lanes.','Controller technical history does not count as Cartilla feature completion.','Open PRs are persisted candidates, not proof that a worker is currently running.',...(openIssues.some(i=>i.deferred)?['Deferred live-auth/Supabase issues #387/#388/#390 are outside the current demo/non-real-data completion path.']:[])],
  open_now:{issues:openIssues,prs:openPrs},
  controller:{system_history:controller?.system_history??null,categories:controller?.categories??null},
  workers
 };
}
