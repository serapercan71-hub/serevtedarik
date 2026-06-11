import { sql, getCurrentUser, shapeProduct } from '../_lib.js';

export default async function handler(req, res) {
  try {
    const viewer = await getCurrentUser(req);

    // LİSTELE (herkes görebilir; fiyat yalnız onaylı üyeye/şekillenir)
    if (req.method === 'GET') {
      const r = await sql`select * from products order by id asc`;
      return res.json({ products: r.rows.map((p) => shapeProduct(p, viewer)) });
    }

    // Bundan sonrası yalnız admin
    if (!viewer?.isAdmin) return res.status(403).json({ error: 'Yetkisiz.' });

    if (req.method === 'POST') {
      const p = req.body || {};
      const r = await sql`
        insert into products (title, description, image_url, category, badge, price_perakende, price_temsilci, in_stock, rating, review_count)
        values (${p.title}, ${p.desc || ''}, ${p.img || ''}, ${p.category || ''}, ${p.badge || ''},
                ${Number(p.pricePerakende) || 0}, ${Number(p.priceTemsilci) || 0},
                ${p.inStock !== false}, ${Number(p.rating) || 0}, ${Number(p.reviewCount) || 0})
        returning id`;
      return res.status(201).json({ ok: true, id: r.rows[0].id });
    }

    if (req.method === 'PUT') {
      const p = req.body || {};
      if (!p.id) return res.status(400).json({ error: 'id gerekli' });
      await sql`
        update products set
          title = ${p.title},
          description = ${p.desc || ''},
          image_url = ${p.img || ''},
          category = ${p.category || ''},
          badge = ${p.badge || ''},
          price_perakende = ${Number(p.pricePerakende) || 0},
          price_temsilci = ${Number(p.priceTemsilci) || 0},
          in_stock = ${p.inStock !== false}
        where id = ${p.id}`;
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'id gerekli' });
      await sql`delete from products where id = ${id}`;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası.' });
  }
}
