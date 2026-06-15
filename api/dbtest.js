// GEÇİCİ TEŞHİS — DB bağlantısını test eder. Sorun çözülünce SİLİNECEK.
import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const present = {
    MYSQL_HOST: process.env.MYSQL_HOST || null,
    MYSQL_PORT: process.env.MYSQL_PORT || '(yok → 3306)',
    MYSQL_USER: process.env.MYSQL_USER ? 'var' : 'YOK',
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD ? 'var' : 'YOK',
    MYSQL_DATABASE: process.env.MYSQL_DATABASE || null,
    MYSQL_SSL: process.env.MYSQL_SSL || '(yok)',
  };
  try {
    const conn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      connectTimeout: 8000,
      ssl:
        process.env.MYSQL_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    });
    const [rows] = await conn.query('select 1 as ok');
    await conn.end();
    return res.json({ ok: true, rows, present });
  } catch (e) {
    return res
      .status(500)
      .json({ ok: false, code: e.code, errno: e.errno, message: e.message, present });
  }
}
