import React from "react";
import {
  // LayoutDashboard,
  Package,
  // ShoppingCart,
  // Users as UsersIcon,
  // BarChart3,
  // Search,
  // Bell,
  // Settings,
  LogOut,
  // MessageSquare,
  LogIn,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
  onLogin?: () => void;
  isAuthenticated?: boolean;
}

type View = "login" | "dashboard" | "products" | "orders" | "after-service";

export default function Layout({
  children,
  // activeView,
  // onViewChange,
  onLogout,
  onLogin,
  isAuthenticated = false,
}: LayoutProps) {
  // const navItems = [
  //   { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  //   { id: 'products', label: 'Products', icon: Package },
  //   { id: 'orders', label: 'Orders', icon: ShoppingCart },
  //   { id: 'after-service', label: 'After Service', icon: MessageSquare },
  //   { id: 'users', label: 'Customers', icon: UsersIcon },
  //   { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  // ];

  const navigate = useNavigate();
  const backToHome = () => navigate("/");

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-[#21c45d]" onClick={backToHome} style={{ cursor: "pointer" }}>
            <Package size={32} />
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
              Admin
            </h2>
          </div>
          {/* {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
              <Search className="text-slate-500" size={20} />
              <input 
                type="text" 
                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-slate-500"
                placeholder="Global Search..."
              />
            </div>
          )} */}
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>

              {/* <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white bg-emerald-500"></span>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                <Settings size={20} />
              </button> */}

              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  {/* <p className="text-xs font-bold">Alex Rivera</p>
                  <p className="text-[10px] text-slate-500">Store Manager</p> */}
                  <p className="text-xs font-bold">Welcome, admin!</p>
                </div>
                {/* <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 overflow-hidden bg-emerald-100 border-emerald-200">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7WSlVQDgZMRyvkuV24Sn2q5x35sAw3jTgSUZA_wNtcosdZ2eEZIv2EtYi8p7VRc0NoPinIaSX8b3IviUxl609Qgv4KGp_cTMHVNnLd8LPq7R6zuZtL9BzvjOqRGaOsKCjMmBJUuhhhwoBPl-dtpa5ESE7n2RHtp95HfIZ6G7XOaLdZ3xh3oWz6O5fiKcBomNNCdG34M65jZNsYQZt6NT0CwLU1eioV2QGPzhb_07HqjiKeUWWakSF2LT0_ocjDgPAyCgmO35jQyx2" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div> */}
                <button
                  onClick={onLogout}
                  className="ml-2 p-2 hover:bg-slate-100 rounded-lg text-red-600 transition"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 bg-[#21c45d] text-white rounded-lg hover:bg-[#1aa84a] transition"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation - Only show when authenticated
        {isAuthenticated && (
          <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col p-4 gap-6">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id as View)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    activeView === item.id 
                      ? "text-[#21c45d] bg-emerald-50 font-semibold" 
                      : "text-slate-600 hover:bg-slate-100 font-medium"
                  )}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mb-2">
                <div className="bg-[#21c45d] h-full w-[72%] rounded-full"></div>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">72% of 500GB used</p>
            </div>
          </aside>
        )} */}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
