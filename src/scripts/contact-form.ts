const RECAPTCHA_SITE_KEY = '6LeLuxwrAAAAACS4SwjIa4pBGqOty0K_qNOrtHtI';
const DEFAULT_ACTION = 'contact';

interface ContactFormMessages {
  success: string;
  error: string;
  offline: string;
  sending: string;
  recaptcha?: string;
}

interface SubmitResult {
  ok: boolean;
  status: number;
  body: { success?: boolean; message?: string; requestId?: string };
}

interface FormMeta {
  form: HTMLFormElement;
  id: string;
  messages: ContactFormMessages;
  statusElement: HTMLElement | null;
  submitButton: HTMLButtonElement | HTMLInputElement | null;
}

interface PendingSubmission {
  formId: string;
  payload: Record<string, unknown>;
}

type Grecaptcha = typeof window.grecaptcha;

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const formsRegistry = new Map<string, FormMeta>();
const pendingSubmissions: PendingSubmission[] = [];
let isProcessingPending = false;
let onlineListenerAttached = false;

function getLocaleMessages(): ContactFormMessages {
  const htmlLang = document.documentElement.lang?.toLowerCase();

  if (htmlLang && htmlLang.startsWith('cs')) {
    return {
      success: 'Tvoje zpráva byla odeslána. Dám vědět hned, jak se k mailu dostanu. 🙂',
      error: 'Došlo k chybě při odesílání. Zkus to prosím znovu.',
      offline: 'Právě nejsi online. Nech otevřené okno – jakmile se připojení vrátí, zprávu zkusíme odeslat znovu.',
      sending: 'Odesílám…',
      recaptcha: 'Bezpečnostní ověření se nepodařilo. Zkuste to prosím znovu.',
    };
  }

  return {
    success: "Your message has been sent. I'll get back to you as soon as possible. 🙂",
    error: 'Something went wrong while sending your message. Please try again.',
    offline: 'You appear to be offline. Keep this tab open and we will retry once the connection is back.',
    sending: 'Sending…',
    recaptcha: 'Security verification failed. Please try again.',
  };
}

function resolveMessages(form: HTMLFormElement): ContactFormMessages {
  const defaults = getLocaleMessages();

  return {
    success: form.dataset.successMessage ?? defaults.success,
    error: form.dataset.errorMessage ?? defaults.error,
    offline: form.dataset.offlineMessage ?? defaults.offline,
    sending: form.dataset.sendingMessage ?? defaults.sending,
    recaptcha: form.dataset.recaptchaMessage ?? defaults.recaptcha,
  };
}

type FormState = 'idle' | 'sending' | 'success' | 'error' | 'offline';

function setStatus(meta: FormMeta, state: FormState, message?: string) {
  const { form, statusElement, submitButton } = meta;
  form.dataset.state = state;

  if (submitButton) {
    submitButton.disabled = state === 'sending';
  }

  if (!statusElement) {
    return;
  }

  statusElement.textContent = message ?? '';
  statusElement.setAttribute('data-state', state);
  if (message) {
    const liveMode = state === 'error' || state === 'offline' ? 'assertive' : 'polite';
    statusElement.setAttribute('aria-live', liveMode);
  }
}

function getFormMeta(form: HTMLFormElement): FormMeta {
  let id = form.dataset.formId;
  if (!id) {
    const fallbackId = `contact-${Math.random().toString(36).slice(2, 10)}`;
    const uuid = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : fallbackId;
    id = uuid;
    form.dataset.formId = id;
  }

  let meta = formsRegistry.get(id);
  if (meta) {
    return meta;
  }

  const statusElement = form.querySelector<HTMLElement>('.messages');
  const submitButton = form.querySelector<HTMLButtonElement | HTMLInputElement>('button[type="submit"], input[type="submit"]');

  meta = {
    form,
    id,
    messages: resolveMessages(form),
    statusElement,
    submitButton,
  };

  if (statusElement && !statusElement.hasAttribute('role')) {
    statusElement.setAttribute('role', 'status');
    statusElement.setAttribute('aria-live', 'polite');
  }

  formsRegistry.set(id, meta);
  return meta;
}

async function ensureRecaptcha(): Promise<Grecaptcha | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = window.grecaptcha;
  if (existing) {
    return new Promise((resolve) => {
      existing.ready(() => resolve(existing));
    });
  }

  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 50; // ~10 seconds
    const interval = window.setInterval(() => {
      attempts += 1;
      if (window.grecaptcha) {
        window.clearInterval(interval);
        window.grecaptcha.ready(() => resolve(window.grecaptcha!));
      } else if (attempts >= maxAttempts) {
        window.clearInterval(interval);
        resolve(null);
      }
    }, 200);
  });
}

function extractPayload(form: HTMLFormElement) {
  const formData = new FormData(form);
  const firstName = (formData.get('fname') ?? formData.get('firstName') ?? formData.get('name') ?? '').toString().trim();
  const lastName = (formData.get('lname') ?? formData.get('lastName') ?? '').toString().trim();
  const email = (formData.get('email') ?? '').toString().trim();
  const message = (formData.get('message') ?? '').toString().trim();
  const locale = document.documentElement.lang?.toLowerCase();
  const pageUrl = window.location.href;

  return {
    firstName,
    lastName,
    email,
    message,
    source: form.dataset.source ?? undefined,
    pageUrl,
    locale,
  };
}

async function sendPayload(payload: Record<string, unknown>): Promise<SubmitResult> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  let body: SubmitResult['body'] = {};
  try {
    body = (await response.json()) as SubmitResult['body'];
  } catch (error) {
    body = {};
  }

  return { ok: response.ok, status: response.status, body };
}

function schedulePendingProcessing() {
  if (onlineListenerAttached) {
    return;
  }

  window.addEventListener('online', processPendingSubmissions, { once: true });
  onlineListenerAttached = true;
}

async function processPendingSubmissions() {
  onlineListenerAttached = false;

  if (isProcessingPending || pendingSubmissions.length === 0) {
    return;
  }

  if (!navigator.onLine) {
    schedulePendingProcessing();
    return;
  }

  const recaptcha = await ensureRecaptcha();
  if (!recaptcha) {
    schedulePendingProcessing();
    return;
  }

  isProcessingPending = true;

  while (pendingSubmissions.length > 0) {
    const entry = pendingSubmissions.shift();
    if (!entry) {
      break;
    }

    const meta = formsRegistry.get(entry.formId);
    try {
      const token = await recaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact_offline_retry' });
      if (!token) {
        throw new Error('Missing reCAPTCHA token for queued submission');
      }

      const result = await sendPayload({ ...entry.payload, recaptchaToken: token, queueRetry: true });
      if (result.ok) {
        if (meta) {
          meta.form.reset();
          const recaptchaInput = meta.form.querySelector<HTMLInputElement>('[name="recaptcha_response"], [name="recaptchaToken"]');
          if (recaptchaInput) {
            recaptchaInput.value = '';
          }
          setStatus(meta, 'success', meta.messages.success);
        }
        continue;
      }

      if (meta) {
        setStatus(meta, 'error', result.body.message ?? meta.messages.error);
      }
    } catch (error) {
      if (meta) {
        console.warn('Retrying contact form submission later', error);
        setStatus(meta, 'error', meta.messages.error);
      }
      // push back and try later
      pendingSubmissions.unshift(entry);
      schedulePendingProcessing();
      break;
    }
  }

  isProcessingPending = false;
}

function queueSubmission(meta: FormMeta, payload: Record<string, unknown>) {
  pendingSubmissions.push({ formId: meta.id, payload });
  setStatus(meta, 'offline', meta.messages.offline);
  schedulePendingProcessing();
}

async function handleSubmit(event: Event) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const meta = getFormMeta(form);

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const basePayload = extractPayload(form);
  if (!basePayload.email || !basePayload.firstName || !basePayload.message) {
    setStatus(meta, 'error', meta.messages.error);
    return;
  }

  if (!navigator.onLine) {
    queueSubmission(meta, basePayload);
    return;
  }

  setStatus(meta, 'sending', meta.messages.sending);

  const recaptcha = await ensureRecaptcha();
  if (!recaptcha) {
    setStatus(meta, 'error', meta.messages.recaptcha ?? meta.messages.error);
    return;
  }

  try {
    const action = form.dataset.recaptchaAction ?? DEFAULT_ACTION;
    const token = await recaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    if (!token) {
      setStatus(meta, 'error', meta.messages.recaptcha ?? meta.messages.error);
      return;
    }

    const recaptchaInput = form.querySelector<HTMLInputElement>('[name="recaptcha_response"], [name="recaptchaToken"]');
    if (recaptchaInput) {
      recaptchaInput.value = token;
    }

    const payload = { ...basePayload, recaptchaToken: token };
    const result = await sendPayload(payload);

    if (result.ok) {
      form.reset();
      if (recaptchaInput) {
        recaptchaInput.value = '';
      }
      setStatus(meta, 'success', result.body.message ?? meta.messages.success);
      return;
    }

    if (result.status === 429) {
      setStatus(meta, 'error', result.body.message ?? meta.messages.error);
      return;
    }

    if (result.status >= 500) {
      setStatus(meta, 'error', result.body.message ?? meta.messages.error);
      return;
    }

    setStatus(meta, 'error', result.body.message ?? meta.messages.error);
  } catch (error) {
    console.error('Failed to submit contact form', error);
    if (!navigator.onLine) {
      queueSubmission(meta, basePayload);
      return;
    }
    setStatus(meta, 'error', meta.messages.error);
  }
}

export function initContactForms() {
  const forms = document.querySelectorAll<HTMLFormElement>('form[data-contact-form]');

  forms.forEach((form) => {
    const meta = getFormMeta(form);
    if (meta.form.dataset.initialized === 'true') {
      return;
    }

    meta.form.dataset.initialized = 'true';
    meta.form.addEventListener('submit', handleSubmit);
    setStatus(meta, 'idle');
  });

  if (pendingSubmissions.length > 0) {
    processPendingSubmissions().catch((error) => {
      console.warn('Failed to process pending contact submissions on init', error);
    });
  }
}

export default initContactForms;
