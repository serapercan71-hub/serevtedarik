import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext.jsx';

export default function Toast() {
  const { toast } = useCart();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
