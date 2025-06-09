import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ComparisonBar from './components/ui/ComparisonBar';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { useAdminAuth } from './hooks/useAdminAuth';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const StoreLocator = lazy(() => import('./pages/StoreLocator'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

// Admin auth guard component
const AdminProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { admin, loading } = useAdminAuth();
  
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!admin) {
    return <Navigate to="/admin/login\" replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <ProductProvider>
      <CartProvider>
        <Layout>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="cms" element={<AdminCMS />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>
              
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:category" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/store-locator" element={<StoreLocator />} />
              <Route path="/wishlist" element={<Wishlist />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          
          {/* Global Components */}
          <ComparisonBar />
        </Layout>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;