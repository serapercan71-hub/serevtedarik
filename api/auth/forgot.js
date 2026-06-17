import jwt from 'jsonwebtoken';
import { sql, sendMail } from '../_lib.js';

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Şifre sıfırlama bağlantısı iste: kayıtlı e-postaya 1 saatlik link gönderir.
// Güvenlik için e-postanın kayıtlı olup olmadığını sızdırmaz (her zaman ok).
export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const email = String(req.body?.email || '').toLowerCase().trim();
  try {
    if (email) {
      const r = await sql`select id, full_name, password_hash from users where email = ${email}`;
      const u = r.rows[0];
      if (u) {
        // Token, mevcut şifre hash'iyle imzalanır → şifre değişince tek kullanımlık olur
        const token = jwt.sign({ id: u.id, t: 'reset' }, SECRET + u.password_hash, {
          expiresIn: '1h',
        });
        const base = process.env.SITE_URL || `https://${req.headers.host}`;
        const link = `${base}/sifre-sifirla?token=${encodeURIComponent(token)}`;
        await sendMail({
          to: email,
          subject: 'Şifre Sıfırlama Bağlantısı',
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1a2230">
              <h2 style="color:#1a2230">Şifre Sıfırlama</h2>
              <p>Merhaba ${u.full_name || ''},</p>
              <p>Şifreni sıfırlamak için aşağıdaki butona tıkla. Bağlantı <b>1 saat</b> geçerlidir.</p>
              <p style="margin:24px 0">
                <a href="${link}" style="background:#567c8d;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Şifremi Sıfırla</a>
              </p>
              <p style="font-size:13px;color:#667">Buton çalışmazsa bu bağlantıyı tarayıcına yapıştır:<br>${link}</p>
              <p style="font-size:13px;color:#667">Bu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.</p>
            </div>`,
        });
      }
    }
  } catch {
    // Sessiz geç — yine de ok dön (e-posta varlığını sızdırma)
  }
  return res.json({ ok: true });
}
