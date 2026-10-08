import { serve } from 'inngest/koa'; // or inngest standard serve
import { serve as inngestServe } from 'inngest/node';
import { inngest } from '../src/controller/inngest/client';
import { cartillaJobWorkerFunction } from '../src/controller/inngest/worker';

export default inngestServe({
  client: inngest,
  functions: [cartillaJobWorkerFunction],
});
