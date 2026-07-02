// Sends a withdrawal eligibility notification email when a user's balance reaches ₦200,000.
// Required env: BREVO_API_KEY, EMAIL_SENDER
// Optional env: SUPABASE_URL, SUPABASE_SERVICE_ROLE (for server-side invocations)

export function buildWithdrawalEligibleHtml(userName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>You Can Now Withdraw – Nairox9ja</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d1a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:linear-gradient(145deg,#0f1f0f,#0a1a14);border-radius:16px;overflow:hidden;border:1px solid #1a4d2e;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 32px 24px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">💰</div>
              <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:1px;">Nairox9ja</div>
              <div style="font-size:13px;color:#bbf7d0;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">Withdrawal Milestone Reached!</div>
            </td>
          </tr>

          <!-- Congratulations Banner -->
          <tr>
            <td style="padding:0;">
              <div style="background:linear-gradient(135deg,#052e16,#064e3b);border-left:4px solid #22c55e;margin:0;padding:20px 32px;">
                <p style="margin:0;font-size:13px;color:#86efac;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Account Milestone</p>
                <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#4ade80;">₦200,000 Balance Achieved 🎉</p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:28px 32px 0;">
              <h1 style="margin:0;font-size:20px;color:#f0fdf4;line-height:1.4;">
                Congratulations, <span style="color:#4ade80;">${userName}</span>!
              </h1>
              <p style="margin:16px 0 0;font-size:15px;color:#86efac;line-height:1.8;">
                Great news — your Nairox9ja account balance has officially reached the <strong style="color:#4ade80;">minimum withdrawal threshold of ₦200,000</strong>.
              </p>
              <p style="margin:14px 0 0;font-size:15px;color:#86efac;line-height:1.8;">
                This means you are now fully eligible to initiate a withdrawal request and transfer your earnings directly to your bank account.
              </p>
            </td>
          </tr>

          <!-- Steps -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 14px;font-size:15px;font-weight:700;color:#f0fdf4;">To withdraw successfully, follow these steps:</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:8px 0;">
                    <div style="background:#052e16;border:1px solid #166534;border-radius:8px;padding:12px 16px;display:flex;">
                      <span style="font-size:16px;font-weight:800;color:#4ade80;margin-right:12px;">1.</span>
                      <span style="font-size:14px;color:#bbf7d0;line-height:1.6;">Log in to your Nairox9ja account</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0 0;">
                    <div style="background:#052e16;border:1px solid #166534;border-radius:8px;padding:12px 16px;">
                      <span style="font-size:16px;font-weight:800;color:#4ade80;margin-right:12px;">2.</span>
                      <span style="font-size:14px;color:#bbf7d0;line-height:1.6;">Navigate to the <strong style="color:#4ade80;">Withdraw</strong> section from your dashboard</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0 0;">
                    <div style="background:#052e16;border:1px solid #166534;border-radius:8px;padding:12px 16px;">
                      <span style="font-size:16px;font-weight:800;color:#4ade80;margin-right:12px;">3.</span>
                      <span style="font-size:14px;color:#bbf7d0;line-height:1.6;">Complete all required withdrawal requirements</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0 0;">
                    <div style="background:#052e16;border:1px solid #166534;border-radius:8px;padding:12px 16px;">
                      <span style="font-size:16px;font-weight:800;color:#4ade80;margin-right:12px;">4.</span>
                      <span style="font-size:14px;color:#bbf7d0;line-height:1.6;">Submit your bank account details and confirm your withdrawal</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note -->
          <tr>
            <td style="padding:20px 32px 0;">
              <div style="background:#1a2e1a;border-left:3px solid #fbbf24;border-radius:6px;padding:14px 16px;">
                <p style="margin:0;font-size:13px;color:#fcd34d;font-weight:600;">⚠️ Important Reminder</p>
                <p style="margin:6px 0 0;font-size:13px;color:#d1d5db;line-height:1.6;">
                  Ensure all withdrawal requirements are fully completed before submitting. Incomplete submissions may result in processing delays.
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:28px 32px 0;text-align:center;">
              <a href="https://nairoxx9ja.online"
                 style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 42px;border-radius:50px;letter-spacing:0.5px;box-shadow:0 4px 15px rgba(22,163,74,0.4);">
                Proceed to Withdraw &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 32px;">
              <div style="border-top:1px solid #1a4d2e;padding-top:20px;text-align:center;">
                <p style="margin:0;font-size:15px;font-weight:700;color:#4ade80;">
                  💚 Stay Active. Keep Earning. Keep Growing.
                </p>
                <p style="margin:8px 0 0;font-size:13px;color:#4b5563;">The Nairox9ja Team</p>
                <p style="margin:10px 0 0;">
                  <a href="https://nairoxx9ja.online" style="font-size:12px;color:#22c55e;text-decoration:none;">nairoxx9ja.online</a>
                </p>
                <p style="margin:10px 0 0;font-size:11px;color:#374151;">
                  You received this because your account balance reached the withdrawal threshold on Nairox9ja.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, username, full_name } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Missing email' });

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const EMAIL_SENDER = process.env.EMAIL_SENDER || 'no-reply@nairox9ja.com';

  if (!BREVO_API_KEY) return res.status(500).json({ error: 'BREVO_API_KEY not configured' });

  // Priority: username → full_name → email prefix
  const userName: string =
    (typeof username === 'string' && username.trim())
      ? username.trim()
      : (typeof full_name === 'string' && full_name.trim())
        ? full_name.trim()
        : email.split('@')[0];

  try {
    const sendRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
      body: JSON.stringify({
        sender: { email: EMAIL_SENDER, name: 'Nairox9ja' },
        to: [{ email }],
        subject: `💰 Congratulations ${userName}! You Can Now Withdraw from Nairox9ja`,
        htmlContent: buildWithdrawalEligibleHtml(userName),
      }),
    });

    if (!sendRes.ok) {
      const txt = await sendRes.text().catch(() => '');
      console.error('Brevo withdrawal notify failed', sendRes.status, txt);
      return res.status(502).json({ error: 'Failed to send email', brevo_status: sendRes.status, details: txt });
    }

    return res.status(200).json({ success: true, sent_to: email, name: userName });
  } catch (err) {
    console.error('notify-withdrawal-eligible error', err);
    return res.status(500).json({ error: String(err) });
  }
}
