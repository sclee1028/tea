import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import { ShoppingCart, LogIn, LogOut, ClipboardList, Shield } from 'lucide-react';

export default function Layout() {
  const { user, isAdmin, signIn, logOut } = useAuth();
  const { totalItems } = useCart();

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <header className="sticky top-0 z-50 bg-green-900 text-stone-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-wider flex items-center gap-2">
            <span className="bg-stone-50 text-green-900 rounded-full w-8 h-8 flex items-center justify-center text-sm">港</span>
            周港茶 Chougangcha
          </Link>
          
          <nav className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin" className="flex items-center gap-1 hover:text-green-200 transition-colors">
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline">後台</span>
              </Link>
            )}
            
            {user ? (
              <>
                <Link to="/orders" className="flex items-center gap-1 hover:text-green-200 transition-colors">
                  <ClipboardList className="w-5 h-5" />
                  <span className="hidden sm:inline">訂單</span>
                </Link>
                <div className="relative group">
                   {/* We will handle cart open state from Storefront, but showing cart button here is nice */}
                   {/* For simplicity we let Storefront render the Cart drawer */}
                </div>
                <button onClick={logOut} className="flex items-center gap-1 hover:text-green-200 transition-colors" title="登出">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={signIn} className="flex items-center gap-1 hover:text-green-200 transition-colors">
                <LogIn className="w-5 h-5" />
                <span>登入點單</span>
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="pb-24">
        <Outlet />
      </main>
    </div>
  );
}
