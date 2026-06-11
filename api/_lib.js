import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

export { sql };

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const COOKIE = 'se_token';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res, token) {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  );
}

export function clearAuthCookie(res) {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
  );
}

// Token'ı doğrula (sadece id'yi taşır)
export function tokenUserId(req) {
  try {
    const c = parse(req.headers.cookie || '');
    if (!c[COOKIE]) return null;
    const data = jwt.verify(c[COOKIE], SECRET);
    return data.id;
  } catch {
    return null;
  }
}

// Veritabanından GÜNCEL kullanıcıyı getir (status/tier admin onayıyla değişebilir)
export async function getCurrentUser(req) {
  const id = tokenUserId(req);
  if (!id) return null;
  const r = await sql`select * from users where id = ${id}`;
  return r.rows[0] ? publicUser(r.rows[0]) : null;
}

// Şifre hash'ini gizleyerek kullanıcıyı döndür
export function publicUser(u) {
  return {
    id: u.id,
    companyName: u.company_name,
    taxNo: u.tax_no,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone,
    requestedType: u.requested_type,
    status: u.status,
    tier: u.tier,
    isAdmin: u.is_admin,
    role: u.is_admin ? 'admin' : 'member',
    createdAt: u.created_at,
  };
}

// Ürünü, isteyen kullanıcının yetkisine göre fiyatlı/fiyatsız döndür
export function shapeProduct(p, viewer) {
  const base = {
    id: p.id,
    title: p.title,
    desc: p.description,
    img: p.image_url,
    category: p.category,
    badge: p.badge,
    inStock: p.in_stock,
    rating: Number(p.rating),
    reviewCount: p.review_count,
  };
  if (viewer?.isAdmin) {
    return {
      ...base,
      pricePerakende: Number(p.price_perakende),
      priceTemsilci: Number(p.price_temsilci),
    };
  }
  if (viewer?.status === 'approved' && viewer?.tier) {
    return {
      ...base,
      price:
        viewer.tier === 'temsilci'
          ? Number(p.price_temsilci)
          : Number(p.price_perakende),
    };
  }
  // misafir / onaysız: fiyat YOK
  return { ...base, price: null };
}
