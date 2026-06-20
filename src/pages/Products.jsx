import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const category = params.get('kategori') || 'Tümü';
  const sort = params.get('sirala') || 'default';
  const filter = params.get('filter') || ''; // kampanya | cok-satan

  // Kategori arama (çok kategori olunca filtrelemek için)
  const [catSearch, setCatSearch] = useState('');
  const shownCategories = useMemo(() => {
    const q = catSearch.trim().toLocaleLowerCase('tr');
    const list = q
      ? categories.filter((c) => c.toLocaleLowerCase('tr').includes(q))
      : categories;
    return ['Tümü', ...list];
  }, [categories, catSearch]);

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

    // Menü filtreleri
    if (filter === 'kampanya') {
      list = list.filter(
        (p) => p.badgeType === 'discount' || p.badge === 'İndirim'
      );
    } else if (filter === 'cok-satan') {
      list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating')
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [products, query, category, sort, filter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="catalog-head">
          <h1 className="catalog-title">
            {query
              ? `"${query}" için sonuçlar`
              : filter === 'kampanya'
              ? 'Kampanyalı Ürünler'
              : filter === 'cok-satan'
              ? 'Çok Satanlar'
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
          <div className="filter-col">
            {/* Kategori arama — çok kategori olunca hızlı bulmak için */}
            <div className="cat-search">
              <input
                type="text"
                placeholder="Kategori ara..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
              />
              {catSearch && (
                <button className="cat-search-clear" onClick={() => setCatSearch('')}>
                  ×
                </button>
              )}
            </div>
            <div className="filter-chips">
              {shownCategories.map((cat) => (
                <button
                  key={cat}
                  className={`chip${category === cat ? ' active' : ''}`}
                  onClick={() => setParam('kategori', cat)}
                >
                  {cat}
                </button>
              ))}
              {shownCategories.length === 1 && (
                <span className="cat-no-match">Eşleşen kategori yok</span>
              )}
            </div>
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
            <div className="no-results-icon">{products.length === 0 ? '🛍️' : '🔍'}</div>
            {products.length === 0 ? (
              <>
                <h3>Henüz ürün eklenmedi</h3>
                <p>
                  Ürünler en kısa sürede eklenecek. Sorularınız için bize
                  WhatsApp'tan ulaşabilirsiniz.
                </p>
              </>
            ) : (
              <>
                <h3>Sonuç bulunamadı</h3>
                <p>
                  Aramanıza uygun ürün yok. Farklı bir kelime deneyin veya
                  filtreleri temizleyin.
                </p>
                <button
                  className="hero-btn"
                  onClick={() => setParams({}, { replace: true })}
                >
                  Filtreleri Temizle
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
