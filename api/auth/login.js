import bcrypt from 'bcryptjs';
import { sql, signToken, setAuthCookie, publicUser } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, phone, password } = req.body || {};

  try {
    let u;
    if (phone) {
      // Telefonla giriş — kayıtla aynı tek biçime getir (0XXXXXXXXXX)
      const core = String(phone)
        .replace(/\D/g, '')
        .replace(/^0+/, '')
        .replace(/^90/, '');
      const canon = core.length === 10 ? '0' + core : '';
      if (canon) {
        const r = await sql`select * from users where phone = ${canon}`;
        u = r.rows[0];
      }
    } else {
      const mail = String(email || '').toLowerCase().trim();
      const r = await sql`select * from users where email = ${mail}`;
      u = r.rows[0];
    }

    if (!u || !(await bcrypt.compare(password || '', u.password_hash)))
      return res
        .status(401)
        .json({ error: phone ? 'Telefon veya şifre hatalı.' : 'E-posta veya şifre hatalı.' });

    const token = signToken({ id: u.id });
    setAuthCookie(res, token);
    return res.json({ ok: true, user: publicUser(u) });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
