import { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ComparisonBar from './components/ui/ComparisonBar';
import { CartProvider } from './contexts/CartContext';
import { ProductProvider } from './contexts/ProductContext';
import { useAdminAuth, initializeAdminAuth } from './hooks/useAdminAuth';
import { initializeAuth } from './hooks/useAuth';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
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
  const { admin, loading, initialized } = useAdminAuth();
  const location = useLocation();
  
  // Show loading only if not initialized yet
  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }
  
  // Show loading if we're still checking auth and don't have admin data
  if (loading && !admin) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  return children;
};

function App() {
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in development with React StrictMode
    if (initRef.current) {
      console.log('🔧 App: Initialization already done, skipping');
      return;
    }
    
    initRef.current = true;
    
    // Initialize both auth systems once
    console.log('🚀 App: Initializing auth systems...');
    
    // Initialize user auth first
    initializeAuth();
    
    // Initialize admin auth after a small delay to prevent conflicts
    setTimeout(() => {
      initializeAdminAuth();
    }, 100);

    // Register service worker with improved error handling
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ SW registered:', registration);
            
            // Handle service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker is available
                    console.log('🔄 New service worker available');
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.log('❌ SW registration failed:', registrationError);
          });
      });
    }

    // Cleanup function
    return () => {
      console.log('🧹 App: Cleanup on unmount');
    };
  }, []); // Empty dependency array - run only once

  return (
    <ProductProvider>
      <CartProvider>
        <Layout>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/*" 
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
              <Route path="/orders/:orderNumber" element={<OrderTracking />} />
              <Route path="/orders" element={<MyOrders />} />
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