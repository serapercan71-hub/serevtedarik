import { sql, getCurrentUser } from '../_lib.js';

export default async function handler(req, res) {
  try {
    const user = await getCurrentUser(req);
    if (!user) return res.status(401).json({ error: 'Giriş gerekli.' });

    // SİPARİŞ TALEBİ OLUŞTUR (yalnız onaylı üye)
    if (req.method === 'POST') {
      if (user.status !== 'approved')
        return res.status(403).json({ error: 'Üyeliğiniz onaylı değil.' });
      const o = req.body || {};
      await sql`
        insert into orders (code, user_id, items, total, status, customer_name, phone, email, address, note)
        values (${o.code}, ${user.id}, ${JSON.stringify(o.items || [])}, ${Number(o.total) || 0},
                'Onay bekliyor', ${o.customerName || ''}, ${o.phone || ''}, ${o.email || ''},
                ${o.address || ''}, ${o.note || ''})`;
      return res.status(201).json({ ok: true });
    }

    // LİSTELE — admin tümünü, üye kendi taleplerini
    if (req.method === 'GET') {
      const r = user.isAdmin
        ? await sql`select * from orders order by created_at desc`
        : await sql`select * from orders where user_id = ${user.id} order by created_at desc`;
      return res.json({ orders: r.rows });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
