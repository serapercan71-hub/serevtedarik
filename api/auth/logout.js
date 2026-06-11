import { clearAuthCookie } from '../_lib.js';

export default async function handler(req, res) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}
