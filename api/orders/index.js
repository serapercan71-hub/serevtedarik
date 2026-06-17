import { sql, getCurrentUser, shapeOrder, sendMail } from '../_lib.js';

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

      // Admin'e yeni sipariş bildirimi (best-effort; SMTP yoksa sessiz)
      const notify = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;
      const lines = (o.items || [])
        .map((i) => `• ${i.title} × ${i.qty}`)
        .join('<br>');
      sendMail({
        to: notify,
        subject: `Yeni Sipariş Talebi — ${o.code}`,
        html: `
          <div style="font-family:Arial,sans-serif;color:#1a2230">
            <h2>Yeni Sipariş Talebi</h2>
            <p><b>Kod:</b> ${o.code}</p>
            <p><b>Müşteri:</b> ${o.customerName || ''} — ${o.phone || ''}</p>
            <p><b>E-posta:</b> ${o.email || ''}</p>
            <p><b>Adres:</b> ${o.address || ''}</p>
            <p><b>Ürünler:</b><br>${lines}</p>
            <p><b>Toplam:</b> ${Number(o.total) || 0} ₺</p>
            ${o.note ? `<p><b>Not:</b> ${o.note}</p>` : ''}
            <p>Yönetici panelinden görüntüleyebilirsin.</p>
          </div>`,
      }).catch(() => {});

      return res.status(201).json({ ok: true });
    }

    // LİSTELE — admin tümünü, üye kendi taleplerini
    if (req.method === 'GET') {
      const r = user.isAdmin
        ? await sql`select * from orders order by created_at desc`
        : await sql`select * from orders where user_id = ${user.id} order by created_at desc`;
      return res.json({ orders: r.rows.map(shapeOrder) });
    }

    // DURUM GÜNCELLE — yalnız admin
    if (req.method === 'PUT') {
      if (!user.isAdmin) return res.status(403).json({ error: 'Yetkisiz.' });
      const { code, status } = req.body || {};
      if (!code || !status)
        return res.status(400).json({ error: 'Eksik parametre.' });
      await sql`update orders set status = ${status} where code = ${code}`;
      return res.json({ ok: true });
    }

    // SİPARİŞ SİL — yalnız admin
    if (req.method === 'DELETE') {
      if (!user.isAdmin) return res.status(403).json({ error: 'Yetkisiz.' });
      const code = (req.body && req.body.code) || req.query.code;
      if (!code) return res.status(400).json({ error: 'code gerekli' });
      await sql`delete from orders where code = ${code}`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
