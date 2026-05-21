// Contact form endpoint — receives the in-app contact modal submission and
// sends a real email to support@hallha.com via Cloudflare Email Service.
// The recipient address is configured via Cloudflare Email Routing to forward
// to the personal Gmail, so messages land in the regular inbox.
//
// Why Cloudflare Email Service instead of Resend?
//   - Everything stays on Cloudflare (one bill, one dashboard, no API keys)
//   - DNS records are added automatically (no manual copy-paste)
//   - 3,000 emails/month included in the Workers Paid plan ($5/mo)
//
// SETUP REQUIRED (one-time, from the dashboard):
//   1. Enable Workers Paid plan: dash.cloudflare.com → Workers & Pages → Plans
//   2. Onboard hallha.com for sending: dash.cloudflare.com → Email →
//      Email Sending → Onboard Domain → pick hallha.com → "Add DNS records
//      automatically". Wait ~5 min for propagation.
//   3. Once the domain shows green ✅ "Verified", this endpoint will start
//      sending real emails. No API key, no secret to set.
//
// Until the EMAIL binding is wired and the domain is verified, this endpoint
// returns a 503 so the frontend falls back to the legacy mailto: flow — no
// users get stranded mid-rollout.

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

  // EMAIL binding not yet wired → graceful 503 so frontend falls back to
  // mailto: (and the user isn't stranded mid-rollout).
  if (!env.EMAIL || typeof env.EMAIL.send !== 'function') {
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
    // Native Cloudflare Email Service binding. No API key, no fetch — the
    // binding (configured in wrangler.toml as [[send_email]] name = "EMAIL")
    // routes the message through Cloudflare's own SMTP infrastructure.
    //
    // 'from' must be on a domain you've onboarded for sending in the
    // Cloudflare dashboard (hallha.com in our case). The 'to' address can
    // be any verified destination configured in Email Routing — we send to
    // support@hallha.com which Email Routing then forwards to the personal
    // Gmail inbox. Setting replyTo to the student's email means hitting
    // "Reply" in Gmail goes straight back to the student.
    await env.EMAIL.send({
      from: { email: 'noreply@hallha.com', name: 'Hallha Contact' },
      to: 'support@hallha.com',
      replyTo: email,
      subject,
      text: textBody,
      html: htmlBody,
    });

    return Response.json({ ok: true });
  } catch (err) {
    // Common failure modes worth distinguishing:
    //   - Domain not yet verified on the sending side
    //   - 'to' address not a verified destination in Email Routing
    //   - Workers Paid plan not active
    //   - Rate limit / quota exceeded
    // We log details for debugging but show a generic message to users so
    // attackers can't probe for misconfiguration.
    console.error('Cloudflare Email send failed:', err?.code, err?.message);
    return Response.json({ error: 'send_failed' }, { status: 502 });
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
