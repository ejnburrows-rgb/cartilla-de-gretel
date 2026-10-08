import { DurableLedger, defaultLedger } from '../db/ledger';

/**
 * Node / Web standard crypto HMAC verification for GitHub Webhook signatures
 */
export function verifyGitHubSignature(
  rawBody: string,
  signatureHeader: string | undefined | null,
  secret: string | undefined
): boolean {
  if (!secret) {
    // If webhook secret is not configured in environment, allow in dev/test if explicit flag set
    return process.env.NODE_ENV === 'test' || process.env.SKIP_WEBHOOK_VERIFY === '1';
  }
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  try {
    // Node crypto or standard Web Crypto API
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

export interface WebhookHandlerOptions {
  ledger?: DurableLedger;
  inngestDispatcher?: (jobId: string, idempotencyKey: string) => Promise<void>;
}

export async function handleGitHubWebhookRequest(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>,
  options: WebhookHandlerOptions = {}
): Promise<{ statusCode: number; body: Record<string, unknown> }> {
  const ledger = options.ledger || defaultLedger;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const signature = headers['x-hub-signature-256'] as string | undefined;

  if (!verifyGitHubSignature(rawBody, signature, secret)) {
    return {
      statusCode: 401,
      body: { ok: false, error: 'invalid_signature' },
    };
  }

  const deliveryId = (headers['x-github-delivery'] as string) || '';
  const eventName = (headers['x-github-event'] as string) || 'unknown';

  if (!deliveryId) {
    return {
      statusCode: 400,
      body: { ok: false, error: 'missing_x_github_delivery_header' },
    };
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody || '{}');
  } catch {
    return {
      statusCode: 400,
      body: { ok: false, error: 'invalid_json_payload' },
    };
  }

  // 1. Persist raw webhook event with permanent duplicate protection
  const { duplicate } = await ledger.persistWebhookEvent(
    deliveryId,
    eventName,
    payload
  );

  if (duplicate) {
    return {
      statusCode: 200,
      body: {
        ok: true,
        duplicate: true,
        deliveryId,
        message: 'Event delivery already stored and processed.',
      },
    };
  }

  // 2. Create durable job from stored event
  const { job } = await ledger.createJob(deliveryId, eventName, payload);

  // 3. Attempt Inngest queue dispatch
  let queued = false;
  let queueError: string | undefined = undefined;

  try {
    if (options.inngestDispatcher) {
      await options.inngestDispatcher(job.id, job.idempotency_key);
      queued = true;
    } else {
      // Default Inngest client send if inngest configured
      const { inngest } = await import('../inngest/client');
      await inngest.send({
        name: 'cartilla/job.created',
        data: {
          jobId: job.id,
          idempotencyKey: job.idempotency_key,
          deliveryId,
          eventType: eventName,
        },
      });
      queued = true;
    }

    // Mark job as queued
    await ledger.updateJobStatus(job.id, { status: 'queued' });
  } catch (err: unknown) {
    queueError = err instanceof Error ? err.message : String(err);
    // Queue send failure leaves job stored in 'received' state for recovery by reconciliation
    await ledger.updateJobStatus(job.id, {
      status: 'received',
      failure_reason: `Queue dispatch failure: ${queueError}`,
    });
  }

  return {
    statusCode: 200,
    body: {
      ok: true,
      jobId: job.id,
      idempotencyKey: job.idempotency_key,
      queued,
      queueError,
    },
  };
}
