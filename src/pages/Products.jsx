import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import WhatsAppFloat from '../components/WhatsAppFloat.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';

const sortOptions = [
  { value: 'default', label: 'Önerilen' },
  { value: 'price-asc', label: 'Fiyat (Artan)' },
  { value: 'price-desc', label: 'Fiyat (Azalan)' },
  { value: 'rating', label: 'En Çok Beğenilen' },
];

export default function Products() {
  const { products, categories } = useCatalog();
  // Kataloğun kategorileri + "Tümü"
  const allCategories = ['Tümü', ...categories];
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('kategori') || 'Tümü';
  const sort = params.get('sirala') || 'default';

  // Tek bir parametreyi güncelle, diğerlerini koru
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'Tümü' && value !== 'default') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLocaleLowerCase('tr');
      list = list.filter(
        (p) =>
          p.title.toLocaleLowerCase('tr').includes(q) ||
          p.category.toLocaleLowerCase('tr').includes(q)
      );
    }

    if (category !== 'Tümü') {
      list = list.filter((p) => p.category === category);
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating')
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [products, query, category, sort]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Header />

      <div className="container">
        <div className="catalog-head">
          <h1 className="catalog-title">
            {query
              ? `"${query}" için sonuçlar`
              : category !== 'Tümü'
              ? category
              : 'Tüm Ürünler'}
          </h1>
          <p className="catalog-count">{filtered.length} ürün listeleniyor</p>
        </div>

        {/* Arama kutusu */}
        <div className="catalog-search">
          <input
            type="text"
            placeholder="Ürünlerde ara..."
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
          />
          {query && (
            <button className="clear-search" onClick={() => setParam('q', '')}>
              ×
            </button>
          )}
        </div>

        {/* Filtre çubuğu */}
        <div className="catalog-toolbar">
          <div className="filter-chips">
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`chip${category === cat ? ' active' : ''}`}
                onClick={() => setParam('kategori', cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="sort-box">
            <label>Sırala:</label>
            <select value={sort} onChange={(e) => setParam('sirala', e.target.value)}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ürünler */}
        {filtered.length > 0 ? (
          <motion.div layout className="products-grid catalog-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Sonuç bulunamadı</h3>
            <p>
              "{query}" aramanıza uygun ürün yok. Farklı bir kelime deneyin veya
              filtreleri temizleyin.
            </p>
            <button
              className="hero-btn"
              onClick={() => setParams({}, { replace: true })}
            >
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      <Footer />
      <WhatsAppFloat />
    </motion.div>
  );
}
