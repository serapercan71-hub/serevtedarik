import { sql, getCurrentUser, publicUser, sendMail } from '../_lib.js';

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
        // Üyeye onay e-postası (best-effort)
        const r = await sql`select email, full_name from users where id = ${id}`;
        const m = r.rows[0];
        if (m?.email) {
          const base = process.env.SITE_URL || `https://${req.headers.host}`;
          sendMail({
            to: m.email,
            subject: 'Üyeliğiniz Onaylandı — Serev Tedarik',
            html: `
              <div style="font-family:Arial,sans-serif;color:#1a2230">
                <h2>Üyeliğiniz Onaylandı 🎉</h2>
                <p>Merhaba ${m.full_name || ''},</p>
                <p>Başvurunuz onaylandı. Artık giriş yaparak özel fiyatlarınızı görebilir ve sipariş oluşturabilirsiniz.</p>
                <p style="margin:22px 0">
                  <a href="${base}/giris" style="background:#567c8d;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Giriş Yap</a>
                </p>
              </div>`,
          }).catch(() => {});
        }
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
