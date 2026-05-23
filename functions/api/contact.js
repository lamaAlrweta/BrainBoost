// Contact form endpoint — receives the in-app contact modal submission and
// sends a real email to support@hallha.app via Cloudflare Email Service's
// REST API. The recipient address is configured via Cloudflare Email
// Routing to forward to the personal Gmail.
//
// Why REST API instead of the native env.EMAIL.send() binding?
//   Pages Functions don't support the [[send_email]] binding — that's
//   Workers-only. So we call Cloudflare's REST endpoint with fetch() and a
//   short-lived API token. Still entirely on Cloudflare; no third party.
//
// SETUP REQUIRED (one-time, from the dashboard):
//   1. Enable Workers Paid plan: dash.cloudflare.com → Workers & Pages → Plans
//      (required for outbound sending; 3,000 emails/month included for $5)
//   2. Onboard hallha.app for sending: dash.cloudflare.com → Email →
//      Email Sending → Onboard Domain → pick hallha.app → "Add DNS records
//      automatically". Wait ~5 min for propagation.
//   3. Create an API token: dash.cloudflare.com → My Profile → API Tokens →
//      Create Token → custom token with permission
//        "Account → Email Sending → Edit"
//      Scope it to the hallha-ai account only. Copy the token.
//   4. Set the token as a Pages secret:
//        npx wrangler pages secret put CLOUDFLARE_EMAIL_API_TOKEN \
//          --project-name=hallha-ai
//      Paste the token when prompted.
//
// Until CLOUDFLARE_EMAIL_API_TOKEN is set, this endpoint returns 503 so the
// frontend falls back to the legacy mailto: flow.

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 });
  }

  const name = String(payload.name || '').trim().slice(0, 100);
  const email = String(payload.email || '').trim().slice(0, 150);
  const type = String(payload.type || 'other').trim().slice(0, 30);
  const message = String(payload.message || '').trim().slice(0, 2000);
  const lang = String(payload.lang || 'en').slice(0, 4);
  const page = String(payload.page || '').slice(0, 300);
  const userAgent = String(payload.userAgent || '').slice(0, 250);

  // Basic validation — both are required
  if (!email || !message) {
    return Response.json({ error: 'missing_fields' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 });
  }

  // API token / account ID not configured yet → graceful 503 so frontend
  // falls back to mailto: (and the user isn't stranded mid-rollout).
  if (!env.CLOUDFLARE_EMAIL_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    return Response.json({ error: 'service_unconfigured' }, { status: 503 });
  }

  const safeName = name || '(no name)';
  const subject = `[Hallha · ${type}] from ${safeName}`;

  // Plain-text body — easier to read in mobile email previews
  const textBody = [
    `Type: ${type}`,
    `From: ${safeName} <${email}>`,
    `Language: ${lang}`,
    page ? `Page: ${page}` : null,
    userAgent ? `Device: ${userAgent}` : null,
    '',
    '--- Message ---',
    message,
  ].filter(Boolean).join('\n');

  // Light HTML version for clients that prefer it
  const htmlBody = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; line-height: 1.55;">
      <p style="margin: 0 0 10px;"><strong>Type:</strong> ${escapeHtml(type)}</p>
      <p style="margin: 0 0 10px;"><strong>From:</strong> ${escapeHtml(safeName)} &lt;<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>&gt;</p>
      <p style="margin: 0 0 10px;"><strong>Language:</strong> ${escapeHtml(lang)}</p>
      ${page ? `<p style="margin: 0 0 10px;"><strong>Page:</strong> ${escapeHtml(page)}</p>` : ''}
      ${userAgent ? `<p style="margin: 0 0 18px; color: #666; font-size: 12px;"><strong>Device:</strong> ${escapeHtml(userAgent)}</p>` : ''}
      <hr style="border: 0; border-top: 1px solid #eee; margin: 18px 0;">
      <div style="white-space: pre-wrap; background: #fafafa; padding: 14px; border-radius: 8px;">${escapeHtml(message)}</div>
      <p style="margin: 20px 0 0; font-size: 12px; color: #888;">Reply directly to this email to respond to the student.</p>
    </div>
  `;

  try {
    // Cloudflare Email Service REST API — same service as the env.EMAIL
    // binding on Workers, just authenticated with a Bearer API token because
    // Pages Functions don't support the [[send_email]] binding.
    //
    // 'from' must be on a domain you've onboarded for sending in the
    // Cloudflare dashboard (hallha.app in our case). The 'to' address can
    // be any verified destination configured in Email Routing — we send to
    // support@hallha.app which Email Routing then forwards to the personal
    // Gmail inbox. reply_to is the student's email so hitting "Reply" in
    // Gmail goes straight back to the student.
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`;

    const r = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CLOUDFLARE_EMAIL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: 'noreply@hallha.app', name: 'Hallha Contact' },
        to: 'support@hallha.app',
        reply_to: email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Cloudflare Email send failed:', r.status, errText.slice(0, 400));
      return Response.json({ error: 'send_failed' }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact endpoint exception:', err?.message);
    return Response.json({ error: 'send_failed' }, { status: 500 });
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
