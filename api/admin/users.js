import { sql, getCurrentUser, publicUser } from '../_lib.js';

export default async function handler(req, res) {
  try {
    const admin = await getCurrentUser(req);
    if (!admin?.isAdmin) return res.status(403).json({ error: 'Yetkisiz.' });

    // TÜM ÜYELER / BAŞVURULAR
    if (req.method === 'GET') {
      const r = await sql`select * from users order by
        case status when 'pending' then 0 when 'approved' then 1 else 2 end,
        created_at desc`;
      return res.json({ users: r.rows.map(publicUser) });
    }

    // ONAYLA / REDDET / SEVİYE ATA
    if (req.method === 'PUT') {
      const { id, action, tier } = req.body || {};
      if (!id || !action) return res.status(400).json({ error: 'Eksik parametre.' });

      if (action === 'approve') {
        const t = tier === 'temsilci' ? 'temsilci' : 'perakende';
        await sql`update users set status = 'approved', tier = ${t} where id = ${id} and is_admin = false`;
      } else if (action === 'reject') {
        await sql`update users set status = 'rejected', tier = null where id = ${id} and is_admin = false`;
      } else if (action === 'setTier') {
        const t = tier === 'temsilci' ? 'temsilci' : 'perakende';
        await sql`update users set tier = ${t} where id = ${id} and is_admin = false`;
      } else if (action === 'suspend') {
        await sql`update users set status = 'suspended' where id = ${id} and is_admin = false`;
      } else if (action === 'setNote') {
        await sql`update users set note = ${req.body.note || ''} where id = ${id} and is_admin = false`;
      } else {
        return res.status(400).json({ error: 'Geçersiz işlem.' });
      }
      return res.json({ ok: true });
    }

    // ÜYE SİL
    if (req.method === 'DELETE') {
      const id = (req.body && req.body.id) || req.query.id;
      if (!id) return res.status(400).json({ error: 'id gerekli' });
      await sql`delete from users where id = ${id} and is_admin = false`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
