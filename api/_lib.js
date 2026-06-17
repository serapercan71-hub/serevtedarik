import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { serialize, parse } from 'cookie';

// Ortak e-posta gönderici. SMTP env'leri yoksa sessizce false döner
// (bildirimler ana akışı bozmamalı). Best-effort.
export async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !to) return false;
  try {
    const port = Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { rejectUnauthorized: false },
    });
    await transporter.sendMail({
      from: `"Serev Tedarik" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

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
    note: u.note || '',
    isAdmin: !!u.is_admin, // MySQL 0/1 → boolean
    role: u.is_admin ? 'admin' : 'member',
    createdAt: u.created_at,
  };
}

// Ürünü, isteyen kullanıcının yetkisine göre fiyatlı/fiyatsız döndür.
// Admin ve onaylı üye: perakende (price) + temsilci fiyatını görür; gösterim
// kullanıcının seviyesine göre frontend'de seçilir. Misafir/onaysız: fiyat YOK.
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
  const canSeePrice =
    viewer?.isAdmin || (viewer?.status === 'approved' && viewer?.tier);
  if (canSeePrice) {
    return {
      ...base,
      price: Number(p.price_perakende),
      priceTemsilci: Number(p.price_temsilci),
    };
  }
  return { ...base, price: null };
}

// Siparişi frontend'in beklediği camelCase yapıya çevir
export function shapeOrder(o) {
  let items = o.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }
  return {
    id: o.id,
    code: o.code,
    userId: o.user_id,
    items: items || [],
    total: Number(o.total),
    status: o.status,
    customerName: o.customer_name,
    phone: o.phone,
    email: o.email,
    address: o.address,
    note: o.note,
    createdAt: o.created_at,
  };
}
