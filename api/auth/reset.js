import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../_lib.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Sıfırlama bağlantısındaki token ile yeni şifre belirle.
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { token, newPassword } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Geçersiz bağlantı.' });
  if (!newPassword || String(newPassword).length < 4)
    return res.status(400).json({ error: 'Yeni şifre en az 4 karakter olmalı.' });

  try {
    const decoded = jwt.decode(token);
    if (!decoded?.id) return res.status(400).json({ error: 'Geçersiz bağlantı.' });

    const r = await sql`select id, password_hash from users where id = ${decoded.id}`;
    const u = r.rows[0];
    if (!u) return res.status(400).json({ error: 'Geçersiz bağlantı.' });

    // Token, kullanıcının O ANKİ hash'iyle imzalanmıştı → şifre değiştiyse geçersiz
    try {
      jwt.verify(token, SECRET + u.password_hash);
    } catch {
      return res
        .status(400)
        .json({ error: 'Bağlantının süresi dolmuş veya daha önce kullanılmış.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await sql`update users set password_hash = ${hash} where id = ${u.id}`;
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
