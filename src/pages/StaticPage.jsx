import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STATIC_PAGES } from '../data/pages.js';

export default function StaticPage() {
  const { slug } = useParams();
  const page = STATIC_PAGES[slug];

  if (!page) {
    return (
      <motion.div
        className="container static-page"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <h1 className="static-title">Sayfa bulunamadı</h1>
        <p className="static-intro">
          Aradığınız bilgi sayfası mevcut değil.{' '}
          <Link to="/">Ana sayfaya dön</Link>
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container static-page"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <h1 className="static-title">{page.title}</h1>
      {page.intro && <p className="static-intro">{page.intro}</p>}

      {page.sections?.map((s, i) => (
        <div className="static-section" key={i}>
          {s.h && <h2 className="static-h2">{s.h}</h2>}
          {s.p && <p>{s.p}</p>}
        </div>
      ))}
    </motion.div>
  );
}
