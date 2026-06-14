import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

// ============================================================
//  MySQL bağlantısı (Alastyr cPanel)
//  Ortam değişkenleri: MYSQL_HOST, MYSQL_PORT, MYSQL_USER,
//  MYSQL_PASSWORD, MYSQL_DATABASE, (opsiyonel) MYSQL_SSL=true
// ============================================================
let _pool;
function getPool() {
  if (!_pool) {
    _pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_POOL) || 3, // paylaşımlı hosting'i yormamak için düşük
      enableKeepAlive: true,
      // Bazı cPanel sunucuları uzak bağlantıda SSL ister; gerekirse MYSQL_SSL=true yap
      ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }
  return _pool;
}

// ------------------------------------------------------------
//  sql`...` — Postgres ile aynı arayüz, MySQL üzerinde çalışır.
//  Dönüş: { rows, rowCount } (eski @vercel/postgres ile uyumlu)
//  Not: Postgres'e özel "returning id" otomatik olarak insertId'ye çevrilir.
// ------------------------------------------------------------
export async function sql(strings, ...values) {
  let text = '';
  const params = [];
  strings.forEach((part, i) => {
    text += part;
    if (i < values.length) {
      text += '?';
      params.push(values[i]);
    }
  });

  // MySQL "returning" desteklemez — varsa kırp, sonucu insertId'den üret
  const wantsReturning = /\sreturning\s+[\w,\s]+$/i.test(text);
  const query = wantsReturning
    ? text.replace(/\sreturning\s+[\w,\s]+$/i, '')
    : text;

  const [result] = await getPool().query(query, params);

  if (Array.isArray(result)) {
    // SELECT → satırlar
    return { rows: result, rowCount: result.length };
  }
  // INSERT / UPDATE / DELETE → ResultSetHeader
  const rows =
    wantsReturning && result.insertId ? [{ id: result.insertId }] : [];
  return { rows, rowCount: result.affectedRows ?? 0 };
}

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
    isAdmin: !!u.is_admin, // MySQL 0/1 → boolean
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
    inStock: !!p.in_stock, // MySQL 0/1 → boolean
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
