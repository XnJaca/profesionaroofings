import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const TO = import.meta.env.CONTACT_TO_EMAIL ?? 'Proroofingdmv@gmail.com';
const FROM =
  import.meta.env.CONTACT_FROM_EMAIL ?? 'Professional Construction <noreply@pcdmv.com>';

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c]!,
  );
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderEmail(input: {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}) {
  const { name, email, phone, service, message } = input;
  const firstName = name.split(/\s+/)[0] || name;
  const preheader = `${name} requested ${service} — ${phone}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New estimate request</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#111827;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:transparent;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f7fb;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 28px rgba(18,37,73,0.10);">

          <tr>
            <td style="background:#1e3a6e;background-image:linear-gradient(135deg,#1e3a6e 0%,#2a4d8f 100%);padding:28px 32px;">
              <div style="color:#7BB539;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;margin-bottom:8px;">New estimate request</div>
              <div style="color:#ffffff;font-size:22px;font-weight:700;line-height:1.2;letter-spacing:-0.01em;">Professional Construction <span style="color:#7BB539;">LLC</span></div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 4px;">
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.14em;font-weight:600;margin-bottom:10px;">Service requested</div>
              <div style="font-size:17px;color:#1e3a6e;font-weight:600;padding:14px 16px;background:#eef2f9;border-left:4px solid #2563eb;border-radius:6px;">${escapeHtml(service)}</div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 4px;">
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.14em;font-weight:600;margin-bottom:10px;">Contact information</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e1e6ef;width:90px;color:#6b7280;font-size:13px;vertical-align:top;">Name</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e1e6ef;color:#111827;font-size:15px;font-weight:600;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e1e6ef;color:#6b7280;font-size:13px;vertical-align:top;">Phone</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e1e6ef;font-size:15px;font-weight:600;"><a href="tel:${escapeHtml(phone)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(phone)}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 0;color:#6b7280;font-size:13px;vertical-align:top;">Email</td>
                  <td style="padding:12px 0;font-size:15px;font-weight:600;"><a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a></td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            message
              ? `<tr>
            <td style="padding:20px 32px 4px;">
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.14em;font-weight:600;margin-bottom:10px;">Project details</div>
              <div style="font-size:14.5px;color:#374151;line-height:1.65;padding:14px 16px;background:#f5f7fb;border-radius:6px;white-space:pre-wrap;">${escapeHtml(message)}</div>
            </td>
          </tr>`
              : ''
          }

          <tr>
            <td style="padding:24px 32px 28px;">
              <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:600;font-size:14px;letter-spacing:0.02em;">Reply to ${escapeHtml(firstName)}</a>
              <a href="tel:${escapeHtml(phone)}" style="display:inline-block;color:#1e3a6e;text-decoration:none;padding:11px 22px;border-radius:6px;font-weight:600;font-size:14px;border:1px solid #c4cbdb;margin-left:6px;">Call ${escapeHtml(phone)}</a>
            </td>
          </tr>

          <tr>
            <td style="background:#f5f7fb;padding:22px 32px;border-top:1px solid #e1e6ef;">
              <div style="font-size:11px;color:#2563eb;text-transform:uppercase;letter-spacing:0.18em;font-weight:700;margin-bottom:6px;">Licensed · Bonded · Insured</div>
              <div style="font-size:12.5px;color:#6b7280;line-height:1.6;">DC License # 410526000160 &nbsp;·&nbsp; MD License # 152249 &nbsp;·&nbsp; PLBG # 119140</div>
              <div style="font-size:11px;color:#9ca3af;margin-top:14px;">Submitted via <a href="https://pcdmv.com" style="color:#9ca3af;text-decoration:underline;">pcdmv.com</a> — reply to this email to respond directly to the customer.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `NEW ESTIMATE REQUEST — Professional Construction LLC`,
    ``,
    `Service: ${service}`,
    ``,
    `Name:  ${name}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    message ? `\nProject details:\n${message}` : '',
    ``,
    `———`,
    `Submitted via pcdmv.com`,
    `Licensed: DC #410526000160 · MD #152249 · PLBG #119140`,
  ]
    .filter(Boolean)
    .join('\n');

  return { html, text };
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return json({ error: 'Email service not configured' }, 500);
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return json({ error: 'Invalid form data' }, 400);
  }

  const name = String(data.get('name') ?? '').trim();
  const email = String(data.get('email') ?? '').trim();
  const phone = String(data.get('phone') ?? '').trim();
  const service = String(data.get('service') ?? '').trim();
  const message = String(data.get('message') ?? '').trim();
  const honeypot = String(data.get('website') ?? '').trim();

  // Bots fill the hidden honeypot — silently accept and drop.
  if (honeypot) return json({ ok: true });

  if (!name || !email || !phone || !service) {
    return json({ error: 'Missing required fields' }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Invalid email' }, 400);
  }

  const subject = `New estimate · ${service} · ${name}`;
  const { html, text } = renderEmail({ name, email, phone, service, message });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error('Resend error:', error);
    return json({ error: 'Email send failed' }, 502);
  }

  return json({ ok: true });
};
