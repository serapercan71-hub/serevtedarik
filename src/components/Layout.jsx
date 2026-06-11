import CartDrawer from './CartDrawer.jsx';
import Toast from './Toast.jsx';

// Tüm sayfalarda kalıcı olan öğeler: sepet çekmecesi ve bildirim.
export default function Layout({ children }) {
  return (
    <>
      {children}
      <CartDrawer />
      <Toast />
    </>
  );
}
