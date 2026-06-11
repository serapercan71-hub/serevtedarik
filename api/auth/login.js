import bcrypt from 'bcryptjs';
import { sql, signToken, setAuthCookie, publicUser } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  const mail = String(email || '').toLowerCase().trim();

  try {
    const r = await sql`select * from users where email = ${mail}`;
    const u = r.rows[0];
    if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const token = signToken({ id: u.id });
    setAuthCookie(res, token);
    return res.json({ ok: true, user: publicUser(u) });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
