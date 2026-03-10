/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLogto } from "@logto/react";
import Login from './pages/login/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductInventory from './pages/product/Product';
import OrderManagement from './pages/orderlist/Orderlist';
import AfterService from './pages/after-service/AfterService';

type View = 'login' | 'dashboard' | 'products' | 'orders' | 'after-service';

export default function App() {
  const { isAuthenticated, getIdTokenClaims, signOut, signIn } = useLogto();
  const [view, setView] = useState<View>('dashboard');
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          if (claims) {
            // Check if token expired
            if (claims.exp * 1000 < Date.now()) {
              signOut(window.location.origin);
              // toast would be added if we have it
              alert("Session expired. Please log in again.");
              return;
            }
            // Fetch user role from backend
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
            const res = await fetch(`${BACKEND_URL}/auth/me?logto_id=${claims.sub}`);
            if (res.ok) {
              const user = await res.json();
              setUserRole(user.role);
              if (user.role !== 'admin' && user.role !== 'staff') {
                signOut(window.location.origin);
                alert("Access denied. Admin or staff access required.");
              }
            }
          }
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, getIdTokenClaims, signOut]);

  const handleLogout = () => {
    signOut(window.location.origin);
  };

  if (!isAuthenticated || userRole !== 'admin' && userRole !== 'staff') {
    return <Login onLogin={() => signIn(window.location.origin + "/callback")} />;
  }

  return (
    <Layout 
      activeView={view} 
      onViewChange={setView} 
      onLogout={handleLogout}
    >
      {view === 'dashboard' && <Dashboard onViewChange={setView} />}
      {view === 'products' && <ProductInventory />}
      {view === 'orders' && <OrderManagement />}
      {view === 'after-service' && <AfterService />}
    </Layout>
  );
}
