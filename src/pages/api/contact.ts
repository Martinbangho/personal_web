import type { APIContext } from 'astro';

export const prerender = false;

const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RECAPTCHA_MIN_SCORE = 0.5;
const RECAPTCHA_VERIFY_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify';

const rateLimitState = new Map<string, { windowStart: number; count: number }>();

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
};

function getSecret(key: string) {
  const value = process.env[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

type LogLevel = 'info' | 'warn' | 'error';

interface ContactPayload {
  firstName: string;
  lastName?: string;
  email: string;
  message: string;
  source?: string;
  recaptchaToken?: string;
  pageUrl?: string;
  locale?: string;
  queueRetry?: boolean;
}

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

interface MonitoringEvent {
  event: string;
  level: LogLevel;
  requestId: string;
  message: string;
  context?: Record<string, unknown>;
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }
}

async function reportMonitoringEvent(event: MonitoringEvent, webhookUrl?: string) {
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    log('warn', 'Failed to forward monitoring event', {
      error: error instanceof Error ? error.message : String(error),
      event: event.event,
      requestId: event.requestId,
    });
  }
}

function jsonResponse(status: number, body: Record<string, unknown>, extraHeaders: Record<string, string> = {}) {
  const headers = { ...DEFAULT_HEADERS, ...extraHeaders };
  return new Response(JSON.stringify(body), { status, headers });
}

function sanitizeLine(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[\r\n]+/g, ' ').trim();
}

function sanitizeMultiline(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[\r]+/g, '\n').replace(/[\u0000-\u001F\u007F]+/g, '').trim();
}

function isValidEmail(email: string) {
  if (!email) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function parseRequestBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  const raw = await request.text();

  if (!raw) {
    return {};
  }

  if (contentType.includes('application/json')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, unknown>;
      }
    } catch (error) {
      throw new Error('invalid-json');
    }
    return {};
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch (error) {
    // Ignore and fall back to URLSearchParams parsing below.
  }

  const params = new URLSearchParams(raw);
  if (Array.from(params.keys()).length > 0) {
    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }

  return {};
}

function getClientIdentifier(context: APIContext) {
  const forwardedFor = context.request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]!.trim();
  }

  const realIp = context.request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  if ('clientAddress' in context && context.clientAddress) {
    return context.clientAddress;
  }

  return 'unknown';
}

function applyRateLimit(identifier: string) {
  const now = Date.now();
  const existing = rateLimitState.get(identifier);

  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(identifier, { windowStart: now, count: 1 });
    return { allowed: true };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterMs = existing.windowStart + RATE_LIMIT_WINDOW_MS - now;
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true };
}

async function verifyRecaptcha(token: string, secret: string, remoteIp: string | undefined, requestId: string) {
  const params = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp && remoteIp !== 'unknown') {
    params.set('remoteip', remoteIp);
  }

  const response = await fetch(RECAPTCHA_VERIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = (await response.json()) as RecaptchaResponse;
  log('info', 'reCAPTCHA verification result', {
    requestId,
    success: data.success,
    score: data.score,
    action: data.action,
    hasErrorCodes: Array.isArray(data['error-codes']) && data['error-codes'].length > 0,
  });
  return data;
}

async function sendMail(payload: ContactPayload, requestId: string) {
  const mailFrom = getSecret('MAIL_FROM') ?? getSecret('MAIL_FROM_ADDRESS');
  const mailTo = getSecret('MAIL_TO') ?? getSecret('MAIL_TO_ADDRESS');
  const mailApiKey =
    getSecret('MAIL_API_KEY') ?? getSecret('RESEND_API_KEY') ?? getSecret('MAIL_CHANNELS_API_KEY');
  const mailApiUrl =
    getSecret('MAIL_API_URL') ?? getSecret('RESEND_API_URL') ?? 'https://api.resend.com/emails';

  if (!mailFrom || !mailTo || !mailApiKey) {
    throw new Error('Mail configuration is missing. Please set MAIL_FROM, MAIL_TO and MAIL_API_KEY.');
  }

  const emailLines = [
    'Nová zpráva z kontaktního formuláře - WEB',
    '',
    `Jméno: ${[payload.firstName, payload.lastName].filter(Boolean).join(' ')}`.trim(),
    `E-mail: ${payload.email}`,
    payload.source ? `Zdroj: ${payload.source}` : null,
    payload.pageUrl ? `URL: ${payload.pageUrl}` : null,
    payload.locale ? `Jazyk: ${payload.locale}` : null,
    '',
    'Zpráva:',
    payload.message,
  ].filter(Boolean);

  const emailText = emailLines.join('\n');

  const response = await fetch(mailApiUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mailApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [mailTo],
      reply_to: payload.email,
      subject: 'Kontaktní formulář - WEB',
      text: emailText,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Mail provider responded with ${response.status}: ${bodyText}`);
  }

  log('info', 'Mail successfully dispatched', { requestId });
}

export async function OPTIONS() {
  return jsonResponse(204, {}, {
    Allow: 'POST, OPTIONS',
  });
}

export async function POST(context: APIContext) {
  const requestId = crypto.randomUUID();
  const clientIdentifier = getClientIdentifier(context);
  const monitoringWebhook = getSecret('ERROR_MONITORING_WEBHOOK') ?? getSecret('SENTRY_WEBHOOK');

  if (context.request.method !== 'POST') {
    return jsonResponse(405, {
      success: false,
      message: 'Method Not Allowed',
    }, {
      Allow: 'POST, OPTIONS',
    });
  }

  const rateLimit = applyRateLimit(clientIdentifier);
  if (!rateLimit.allowed) {
    const retryAfter = rateLimit.retryAfter ?? RATE_LIMIT_WINDOW_MS / 1000;
    const response = jsonResponse(
      429,
      {
        success: false,
        message: 'Dosáhli jste limitu požadavků. Zkuste to prosím znovu později.',
        requestId,
      },
      {
        'Retry-After': retryAfter.toString(),
      },
    );
    await reportMonitoringEvent(
      {
        event: 'contact.rate_limit',
        level: 'warn',
        requestId,
        message: 'Rate limit exceeded',
        context: { clientIdentifier, retryAfter },
      },
      monitoringWebhook,
    );
    return response;
  }

  let payload: ContactPayload;

  try {
    const raw = await parseRequestBody(context.request);
    const firstName = sanitizeLine(raw.fname ?? raw.firstName ?? raw.name ?? '');
    const lastName = sanitizeLine(raw.lname ?? raw.lastName ?? '');
    const email = sanitizeLine(raw.email ?? '');
    const message = sanitizeMultiline(raw.message ?? '');
    const source = sanitizeLine(raw.source ?? raw.context ?? '');
    const pageUrl = sanitizeLine(raw.pageUrl ?? raw.page ?? context.request.headers.get('referer') ?? '');
    const locale = sanitizeLine(raw.locale ?? raw.lang ?? '');
    const recaptchaToken = sanitizeLine(
      raw.recaptchaToken ??
        raw.recaptcha_token ??
        raw.recaptcha_response ??
        raw['g-recaptcha-response'] ??
        '',
    );

    payload = {
      firstName,
      lastName,
      email,
      message,
      source: source || undefined,
      pageUrl: pageUrl || context.request.url,
      locale: locale || undefined,
      recaptchaToken,
    };
  } catch (error) {
    log('warn', 'Failed to parse request body', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    await reportMonitoringEvent(
      {
        event: 'contact.invalid_payload',
        level: 'warn',
        requestId,
        message: 'Request body parsing failed',
      },
      monitoringWebhook,
    );
    return jsonResponse(400, {
      success: false,
      message: 'Data formuláře se nepodařilo načíst. Zkuste to prosím znovu.',
      requestId,
    });
  }

  if (!payload.firstName || !payload.email || !payload.message) {
    return jsonResponse(422, {
      success: false,
      message: 'Vyplňte prosím všechna povinná pole.',
      requestId,
    });
  }

  if (!isValidEmail(payload.email)) {
    return jsonResponse(422, {
      success: false,
      message: 'E-mailová adresa nemá správný formát.',
      requestId,
    });
  }

  if (!payload.recaptchaToken) {
    await reportMonitoringEvent(
      {
        event: 'contact.recaptcha_missing',
        level: 'warn',
        requestId,
        message: 'Missing reCAPTCHA token',
        context: { clientIdentifier },
      },
      monitoringWebhook,
    );
    return jsonResponse(400, {
      success: false,
      message: 'Bezpečnostní ověření selhalo. Zkuste to prosím znovu.',
      requestId,
    });
  }

  if (payload.message.length > 5000) {
    return jsonResponse(413, {
      success: false,
      message: 'Zpráva je příliš dlouhá. Zkraťte ji prosím a zkuste to znovu.',
      requestId,
    });
  }

  const recaptchaSecret = getSecret('RECAPTCHA_SECRET');
  if (!recaptchaSecret) {
    await reportMonitoringEvent(
      {
        event: 'contact.configuration_error',
        level: 'error',
        requestId,
        message: 'Missing RECAPTCHA_SECRET',
      },
      monitoringWebhook,
    );
    log('error', 'reCAPTCHA secret is not configured', { requestId });
    return jsonResponse(500, {
      success: false,
      message: 'Služba není dostupná. Zkuste to prosím později.',
      requestId,
    });
  }

  try {
    const recaptcha = await verifyRecaptcha(payload.recaptchaToken, recaptchaSecret, clientIdentifier, requestId);
    if (!recaptcha.success || (typeof recaptcha.score === 'number' && recaptcha.score < RECAPTCHA_MIN_SCORE)) {
      await reportMonitoringEvent(
        {
          event: 'contact.recaptcha_failed',
          level: 'warn',
          requestId,
          message: 'reCAPTCHA verification failed',
          context: {
            success: recaptcha.success,
            score: recaptcha.score,
            clientIdentifier,
          },
        },
        monitoringWebhook,
      );
      return jsonResponse(400, {
        success: false,
        message: 'Bezpečnostní kontrola neuspěla. Zkuste to prosím znovu.',
        requestId,
      });
    }
  } catch (error) {
    log('error', 'Failed to verify reCAPTCHA token', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    await reportMonitoringEvent(
      {
        event: 'contact.recaptcha_error',
        level: 'error',
        requestId,
        message: 'reCAPTCHA verification threw an error',
        context: { clientIdentifier },
      },
      monitoringWebhook,
    );
    return jsonResponse(502, {
      success: false,
      message: 'Ověření bezpečnostního tokenu se nezdařilo. Zkuste to prosím později.',
      requestId,
    });
  }

  try {
    await sendMail(payload, requestId);
  } catch (error) {
    log('error', 'Failed to dispatch e-mail', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    await reportMonitoringEvent(
      {
        event: 'contact.mail_error',
        level: 'error',
        requestId,
        message: 'Mail sending failed',
        context: { clientIdentifier },
      },
      monitoringWebhook,
    );
    return jsonResponse(502, {
      success: false,
      message: 'Zprávu se nepodařilo odeslat. Zkuste to prosím později.',
      requestId,
    });
  }

  log('info', 'Contact form submission handled', {
    requestId,
    clientIdentifier,
    hasLastName: Boolean(payload.lastName),
    messageLength: payload.message.length,
    pageUrl: payload.pageUrl,
  });

  return jsonResponse(200, {
    success: true,
    message: 'Tvoje zpráva byla odeslána. Dám vědět hned, jak se k mailu dostanu. :)',
    requestId,
  });
}
