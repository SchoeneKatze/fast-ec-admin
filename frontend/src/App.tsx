import { useState, useEffect } from 'react';
import { useLogto, useHandleSignInCallback } from "@logto/react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

// 导入你的页面组件
import Layout from './pages/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductInventory from './pages/product/Product';
import OrderManagement from './pages/orderlist/OrderManagement';
import AfterService from './pages/after-service/AfterService';

type ViewType = 'dashboard' | 'products' | 'orders' | 'after-service';

const AppRoutes = ({ 
  isAuthorized, 
  loading, 
  onLogout, 
  onLogin 
}: { 
  isAuthorized: boolean, 
  loading: boolean, 
  onLogout: () => void, 
  onLogin: () => void 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 2. 提取路径并设置默认值
  const path = location.pathname.split('/')[1];
  
  // 3. 简单的类型保护逻辑
  const validViews: ViewType[] = ['dashboard', 'products', 'orders', 'after-service'];
  const currentView: ViewType = validViews.includes(path as ViewType) 
    ? (path as ViewType) 
    : 'dashboard';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21c45d]"></div>
      </div>
    );
  }

  return (
    <Layout 
      activeView={currentView} 
      onViewChange={(view) => navigate(`/${view}`)}
      onLogout={onLogout}
      onLogin={onLogin}
      isAuthenticated={isAuthorized}
    >
      <Routes>
        {/* 如果未授权，所有路径都显示登录页面 */}
        {!isAuthorized ? (
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome</h1>
                <button
                  onClick={onLogin}
                  className="px-6 py-2 bg-[#21c45d] text-white rounded-lg hover:bg-[#1aa84a]"
                >
                  Sign In
                </button>
              </div>
            </div>
          } />
        ) : (
          <>
            {/* 已授权后的路由配置 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard onViewChange={(v) => navigate(`/${v}`)} />} />
            <Route path="/products" element={<ProductInventory />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/after-service" element={<AfterService />} />
            {/* 404 处理 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
};

export default function App() {
  const { isAuthenticated, getIdTokenClaims, signOut, signIn } = useLogto();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 处理登录回调
  const { isLoading: isCallbackProcessing } = useHandleSignInCallback(() => {
    window.history.replaceState({}, "", "/");
  });

  // 权限检查逻辑
  useEffect(() => {
    const checkAuth = async () => {
      if (isCallbackProcessing) return;
      try {
        setLoading(true);
        if (isAuthenticated) {
          const claims = await getIdTokenClaims();
          if (claims) {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8002';
            const res = await fetch(`${BACKEND_URL}/auth/me?logto_id=${claims.sub}`);
            if (res.ok) {
              const user = await res.json();
              setUserRole(user.role);
              if (user.role !== 'admin' && user.role !== 'staff') {
                signOut(window.location.origin);
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated, isCallbackProcessing, getIdTokenClaims, signOut]);

  const handleLogin = () => signIn(`${window.location.origin}/callback`);
  const handleLogout = () => signOut(window.location.origin);

  if (isCallbackProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>loading...</p>
      </div>
    );
  }

  const isAuthorized = isAuthenticated && (userRole === 'admin' || userRole === 'staff');

  return (
    <Router>
      <AppRoutes 
        isAuthorized={isAuthorized} 
        loading={loading} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
      />
    </Router>
  );
}