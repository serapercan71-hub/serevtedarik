import { IconImage } from './icons.jsx';

// Görsel varsa <img>, yoksa temiz bir placeholder kutu gösterir.
// className görsel/kutu boyutunu belirleyen mevcut sınıftır (ör. product-img).
export default function Thumb({ src, alt = '', className = '' }) {
  if (src) {
    return <img src={src} alt={alt} className={className} loading="lazy" />;
  }
  return (
    <div className={`${className} img-ph`} role="img" aria-label={alt}>
      <IconImage />
    </div>
  );
}
