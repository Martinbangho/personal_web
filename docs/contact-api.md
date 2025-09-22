# Contact API

The legacy `public/assets/mail.php` endpoint has been replaced with a serverless Astro API route. All contact forms now send JSON
requests to `/api/contact` and receive structured responses without redirecting the user.

## Endpoint

```
POST /api/contact
```

### Request body

The endpoint accepts JSON requests (preferred) and falls back to `application/x-www-form-urlencoded` payloads when JavaScript is not
available. Supported fields:

| Field            | Type     | Required | Notes                                                      |
| ---------------- | -------- | -------- | ---------------------------------------------------------- |
| `firstName` / `fname` | string | ✅       | Trimmed. Empty values are rejected.                        |
| `lastName` / `lname`  | string | ❌       | Optional. Included in the e-mail if present.               |
| `email`          | string   | ✅       | Must be a valid email address.                             |
| `message`        | string   | ✅       | Max length 5 000 characters.                               |
| `recaptchaToken` / `recaptcha_response` | string | ✅ | Token returned by reCAPTCHA v3/v3 Enterprise.              |
| `source`         | string   | ❌       | Optional context (e.g. form name).                         |
| `pageUrl`        | string   | ❌       | Defaults to the request URL.                               |
| `locale`         | string   | ❌       | Helps with localisation and logging.                       |

Unknown fields are ignored. The API responds with JSON in all cases:

```
{
  "success": true,
  "message": "Tvoje zpráva byla odeslána…",
  "requestId": "uuid"
}
```

On validation errors the status code is `422` and the `message` describes the problem. Missing or invalid reCAPTCHA tokens yield
`400`, rate limiting returns `429` with a `Retry-After` header and infrastructure issues bubble up as `502`.

## Environment variables

Secrets are read directly from the runtime environment so they can be stored in hosting configuration. Configure the following variables:

- `RECAPTCHA_SECRET` – private key paired with the site key used on the front end.
- `MAIL_FROM` / `MAIL_FROM_ADDRESS` – sender address recognised by your e-mail provider.
- `MAIL_TO` / `MAIL_TO_ADDRESS` – destination inbox.
- `MAIL_API_KEY` (or `RESEND_API_KEY`, `MAIL_CHANNELS_API_KEY`) – bearer token for the transactional e-mail service.
- `MAIL_API_URL` (optional) – override for non-Resend providers. Defaults to `https://api.resend.com/emails`.
- `ERROR_MONITORING_WEBHOOK` (optional) – URL that receives JSON error notifications (e.g. Sentry, Slack, Zapier). `SENTRY_WEBHOOK`
  is also supported for backwards compatibility.

Rate limiting is performed in-memory (5 requests per 10 minutes per client) to prevent bursts. All requests emit structured log
entries and, when configured, significant failures are forwarded to the monitoring webhook together with a deterministic
`requestId`.

## Front-end integration

Any form decorated with `data-contact-form` is automatically enhanced by `src/scripts/contact-form.ts` once it appears in the DOM:

- The module serialises form values to JSON, calls `/api/contact` and renders status updates inside `.messages` containers.
- reCAPTCHA tokens are generated just-in-time via `grecaptcha.execute`. When the token cannot be obtained, a descriptive error is
  shown to the visitor.
- Network failures are queued in-memory and retried once the browser regains connectivity, so the forms remain usable in the PWA
  offline fallback.

If JavaScript is disabled the form still posts to `/api/contact` using classic form semantics. The API will respond with JSON; ensure
progressive enhancement displays useful messaging or provide a `noscript` fallback when necessary.
