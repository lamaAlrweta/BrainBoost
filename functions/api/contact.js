// Contact form endpoint — receives the in-app contact modal submission and
// sends a real email to support@hallha.com via Resend (https://resend.com).
// The recipient address is configured via Cloudflare Email Routing to forward
// to the personal Gmail, so messages land in the regular inbox.
//
// SETUP REQUIRED (one-time, from the dashboard):
//   1. Sign up at https://resend.com (free tier covers 3,000 emails/mo)
//   2. Verify the hallha.com domain (Resend gives you DNS records — since
//      hallha.com is on Cloudflare, paste them into the Cloudflare DNS
//      panel and they propagate in seconds).
//   3. Create an API key (Settings → API Keys → Create).
//   4. Set it as a Cloudflare Pages secret:
//        npx wrangler pages secret put RESEND_API_KEY --project-name=hallha-ai
//      (paste the re_... key when prompted)
//
// Until RESEND_API_KEY is set, this endpoint returns a 503 so the frontend
// falls back to the legacy mailto: flow — no users get stranded.

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

  // No Resend key configured yet → graceful 503 so frontend falls back to mailto
  if (!env.RESEND_API_KEY) {
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
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // 'from' must be on a verified domain. noreply@hallha.com is the
        // standard pattern for transactional sends — no inbox needed for it.
        from: 'Hallha Contact <noreply@hallha.com>',
        to: 'support@hallha.com',
        reply_to: email,        // Hit "Reply" in Gmail → goes straight to student
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error('Resend send failed:', r.status, errText.slice(0, 300));
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
