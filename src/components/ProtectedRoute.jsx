import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Erişim koruması.
// - admin: yalnızca admin girebilir
// - onaysız üye / misafir: girişe ya da hesabım'a yönlendirilir
export default function ProtectedRoute({ children, admin = false }) {
  const { user, isAdmin, isApproved, loading } = useAuth();

  if (loading) return null; // oturum yükleniyor — yönlendirme yapma

  if (admin) {
    return isAdmin ? children : <Navigate to="/giris" replace />;
  }

  if (!user) return <Navigate to="/giris" replace />;
  if (!isApproved) return <Navigate to="/hesabim" replace />;
  return children;
}
