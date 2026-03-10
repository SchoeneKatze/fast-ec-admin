/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
// import { View } from './types';
import Login from './pages/login/Login';
import Layout from './pages/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import ProductInventory from './pages/product/Product';
import OrderManagement from './pages/orderlist/Orderlist';

type View = 'login' | 'dashboard' | 'products' | 'orders';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('login');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
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
      {view === 'users' && (
        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-emerald-100 text-[#21c45d] rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold">U</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">User Management</h2>
          <p className="text-slate-500 max-w-md">
            This module is currently being redirected to Logto for secure identity management.
          </p>
        </div>
      )}
      {view === 'analytics' && (
        <div className="p-8 flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-emerald-100 text-[#21c45d] rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl font-bold">A</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
          <p className="text-slate-500 max-w-md">
            Detailed analytics and reporting tools are loading...
          </p>
        </div>
      )}
    </Layout>
  );
}
