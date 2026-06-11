import bcrypt from 'bcryptjs';
import { sql } from '../_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { companyName, taxNo, fullName, email, phone, password, requestedType } =
    req.body || {};

  if (!email || !password || !fullName)
    return res.status(400).json({ error: 'Zorunlu alanlar eksik.' });

  const mail = String(email).toLowerCase().trim();
  try {
    const exists = await sql`select 1 from users where email = ${mail}`;
    if (exists.rowCount > 0)
      return res.status(409).json({ error: 'Bu e-posta ile zaten bir başvuru var.' });

    const hash = await bcrypt.hash(password, 10);
    await sql`
      insert into users (company_name, tax_no, full_name, email, phone, password_hash, requested_type, status)
      values (${companyName || ''}, ${taxNo || ''}, ${fullName}, ${mail}, ${phone || ''}, ${hash}, ${requestedType || 'perakende'}, 'pending')
    `;
    return res.status(201).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
