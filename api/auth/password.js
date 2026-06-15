import bcrypt from 'bcryptjs';
import { sql, tokenUserId } from '../_lib.js';

// Giriş yapmış kullanıcının kendi şifresini değiştirmesi.
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const id = tokenUserId(req);
  if (!id) return res.status(401).json({ error: 'Giriş gerekli.' });

  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 4)
    return res
      .status(400)
      .json({ error: 'Yeni şifre en az 4 karakter olmalı.' });

  try {
    const r = await sql`select password_hash from users where id = ${id}`;
    const u = r.rows[0];
    if (!u || !(await bcrypt.compare(currentPassword || '', u.password_hash)))
      return res.status(401).json({ error: 'Mevcut şifre hatalı.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await sql`update users set password_hash = ${hash} where id = ${id}`;
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
