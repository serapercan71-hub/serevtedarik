import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Thumb from './Thumb.jsx';
import { useCart, formatPrice } from '../context/CartContext.jsx';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    changeQty,
    totalItems,
    totalAmount,
  } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    closeCart();
    navigate('/odeme');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="cart-overlay"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="cart-header">
              <h2>SEPETİM ({totalItems})</h2>
              <button className="close-cart" onClick={closeCart}>
                ×
              </button>
            </div>

            <div className="cart-items-container">
              {items.length === 0 ? (
                <div className="empty-cart">Sepetiniz henüz boş.</div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="cart-item"
                      layout
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Thumb
                        src={item.img}
                        alt={item.title}
                        className="cart-item-img"
                      />
                      <div className="cart-item-info">
                        <div className="cart-item-title">{item.title}</div>
                        <div className="cart-item-qty">
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.id, -1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => changeQty(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="cart-item-price">
                          {formatPrice(item.price * item.qty)}
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        title="Ürünü Sil"
                        onClick={() => removeItem(item.id)}
                      >
                        🗑️
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Ara Toplam</span>
                <span style={{ color: 'var(--teal)' }}>
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <button
                className="cart-checkout-btn"
                onClick={goCheckout}
                disabled={items.length === 0}
              >
                SİPARİŞ TALEBİ OLUŞTUR
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
