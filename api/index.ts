// Single Vercel serverless function that dispatches all /api/* routes.
// Uses static imports so Vercel bundles everything into ONE function (stays under Hobby 12-function limit).

import sendEmailVerification from './_handlers/send-email-verification.js';
import verifyEmail           from './_handlers/verify-email.js';
import sendWelcomeImmediate  from './_handlers/send-welcome-immediate.js';
import getBanks              from './_handlers/get-banks.js';
import startWithdrawal       from './_handlers/start-withdrawal.js';
import verifyAccount         from './_handlers/verify-account.js';
import verifyHcaptcha        from './_handlers/verify-hcaptcha.js';
import verifyTurnstile       from './_handlers/verify-turnstile.js';
import forgotPassword        from './_handlers/forgot-password.js';
import resetPassword         from './_handlers/reset-password.js';
import startTask             from './_handlers/start-task.js';
import verifyTask            from './_handlers/verify-task.js';
import notifyWithdrawalEligible from './_handlers/notify-withdrawal-eligible.js';
import processEmailNotifications from './process-email-notifications.js';

type Handler = (req: any, res: any) => any;

const ROUTES: Record<string, Handler> = {
  'send-email-verification': sendEmailVerification,
  'verify-email':            verifyEmail,
  'send-welcome-immediate':  sendWelcomeImmediate,
  'get-banks':               getBanks,
  'start-withdrawal':        startWithdrawal,
  'verify-account':          verifyAccount,
  'verify-hcaptcha':         verifyHcaptcha,
  'verify-turnstile':        verifyTurnstile,
  'forgot-password':         forgotPassword,
  'reset-password':          resetPassword,
  'start-task':              startTask,
  'verify-task':             verifyTask,
  'notify-withdrawal-eligible': notifyWithdrawalEligible,
  'process-email-notifications': processEmailNotifications,
};

export default async function handler(req: any, res: any) {
  try {
    // Add CORS headers for all API responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();

    // Extract the route name from the URL path: /api/<route>
    const url = req.url || '/';
    const host = (req.headers?.host as string) || 'localhost';
    const u = new URL(url, `http://${host}`);
    const path = u.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');

    if (!path) {
      return res.status(200).json({ ok: true, message: 'Nairox9ja API' });
    }

    const [route] = path.split('/');
    const routeHandler = ROUTES[route];

    if (!routeHandler) {
      return res.status(404).json({ error: 'Unknown endpoint', route });
    }

    return await routeHandler(req, res);
  } catch (err) {
    console.error('api/index dispatcher error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
