import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { CartProvider } from './lib/CartContext';
import Layout from './components/Layout';
import Storefront from './pages/Storefront';
import CustomerOrders from './pages/CustomerOrders';
import AdminDashboard from './pages/AdminDashboard';
import { Coffee } from 'lucide-react';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Coffee className="w-8 h-8 animate-pulse text-green-700" /></div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Storefront />} />
              <Route path="orders" element={<CustomerOrders />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
