// import React from 'react';
import {
  Users as UsersIcon,
  Package,
  ShoppingCart,
  // TrendingUp,
  // CreditCard,
  // Clock,
  // AlertTriangle,
  // Plus,
  ArrowRight,
  // ExternalLink,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";

export type View = "login" | "dashboard" | "products" | "orders";

interface DashboardProps {
  onViewChange: (view: View) => void;
}

export default function Dashboard({ onViewChange }: DashboardProps) {
  // const stats = [
  //   { label: 'Active Users', value: '12,482', change: '+14% from last month', icon: TrendingUp, color: 'text-emerald-500', trend: 'up' },
  //   { label: 'Daily Revenue', value: '$4,250', change: '+8% from yesterday', icon: CreditCard, color: 'text-emerald-500', trend: 'up' },
  //   { label: 'Pending Orders', value: '48', change: '12 high priority', icon: Clock, color: 'text-amber-500', trend: 'neutral' },
  //   { label: 'Stock Alerts', value: '3', change: 'Critical stock levels', icon: AlertTriangle, color: 'text-red-500', trend: 'down' },
  // ];

  const modules = [
    {
      id: "after-service",
      label: "After Service",
      desc: "Process refund requirements and claims.",
      action: "Refund and claim",
    },
    {
      id: "products",
      label: "Products",
      desc: "Manage inventory, pricing, and variants.",
      action: "Manage Catalog",
    },
    {
      id: "orders",
      label: "Orders",
      desc: "Process shipments and review transactions.",
      action: "View Pipeline",
    },
    {
      id: "users",
      label: "Users",
      desc: "Customer accounts and permissions.",
      icon: UsersIcon,
      badge: "Redirects to Logto",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto w-full">
      {/* <div className="mb-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
        >
          Welcome back, <span className="text-[#21c45d]">Admin</span>
        </motion.h1>
        <p className="mt-4 text-lg text-slate-600">
          Select a module below to start managing your e-commerce ecosystem.
        </p>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod, idx) => (
          <motion.button
            key={mod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onViewChange(mod.id as View)}
            className="group relative flex flex-col items-center justify-center p-8 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#21c45d]/50 transition-all duration-300"
          >
            <div className="mb-6 flex w-20 h-20 items-center justify-center rounded-2xl bg-[#21c45d]/10 text-[#21c45d] group-hover:bg-[#21c45d] group-hover:text-white transition-all duration-300">
              {mod.id === "users" && <UsersIcon size={36} />}
              {mod.id === "products" && <Package size={36} />}
              {mod.id === "orders" && <ShoppingCart size={36} />}
              {mod.id === "after-service" && <MessageSquare size={36} />}
            </div>
            <h3 className="text-xl font-bold mb-2">{mod.label}</h3>
            <p className="text-center text-sm text-slate-500">{mod.desc}</p>
            {mod.badge && (
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-100 text-[12px] font-bold uppercase tracking-widest text-slate-500">
                {mod.badge}
              </div>
            )}
            {mod.action && (
              <div className="mt-4 flex items-center gap-1 text-[#21c45d] text-sm font-semibold">
                {mod.action} <ArrowRight size={14} />
              </div>
            )}
            {/* <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="text-[#21c45d]" size={18} />
            </div> */}
          </motion.button>
        ))}
      </div>

      {/* <div className="mt-16 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <div className="bg-[#21c45d]/10 rounded-lg p-1.5 text-[#21c45d]">
                <stat.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className={cn("text-xs mt-2 font-medium", stat.color)}>{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button className="flex items-center gap-2 px-6 py-3 bg-[#21c45d] text-white rounded-lg font-semibold hover:bg-[#21c45d]/90 transition-colors shadow-lg shadow-[#21c45d]/20">
          <Plus size={20} />
          Create Quick Report
        </button>
      </div> */}
    </div>
  );
}
