import { runReconciliationLoop } from '../src/controller/reconcile';

export default async function handler(req: any, res: any) {
  // Authorization check for cron or bearer secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  try {
    const result = await runReconciliationLoop();
    return res.status(200).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
}
