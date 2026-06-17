// Yüklenen herhangi bir formattaki görseli (jpg, png, jfif, gif...) WebP'ye çevirir.
// Boyutu makul bir genişliğe küçültür ve base64 data URL döndürür (localStorage'a yazılabilir).
export function fileToWebp(file, { maxWidth = 800, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Geçerli bir görsel dosyası seçin.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Görsel yüklenemedi.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // Şeffaf olmayan zemin (WebP şeffaflığı destekler ama beyaz zemin daha güvenli)
        ctx.drawImage(img, 0, 0, w, h);
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          // Tarayıcı webp desteklemezse png'ye düşer; yine de çalışır
          resolve(dataUrl);
        } catch (e) {
          reject(new Error('Dönüştürme başarısız.'));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
