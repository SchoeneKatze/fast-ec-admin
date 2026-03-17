import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, ShoppingBag, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[440px]">
        {/* Brand Identity */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-12 h-12 bg-[#21c45d] flex items-center justify-center rounded-xl text-white mb-4 shadow-lg shadow-[#21c45d]/20">
            <ShoppingBag size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">E-Commerce Admin</h1>
          <p className="text-slate-500 mt-1">Manage your store efficiently</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="h-1.5 bg-[#21c45d] w-full"></div>
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">Admin Login</h2>
              <p className="text-sm text-slate-500">Enter your credentials to access the dashboard</p>
            </div>

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="email" 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-[#f6f6f8] text-slate-900 focus:ring-2 focus:ring-[#21c45d]/20 focus:border-[#21c45d] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-medium text-[#21c45d] hover:underline">Forgot password?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-slate-200 bg-[#f6f6f8] text-slate-900 focus:ring-2 focus:ring-[#21c45d]/20 focus:border-[#21c45d] outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded border-slate-300 text-[#21c45d] focus:ring-[#21c45d]"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-600 cursor-pointer">Remember me for 30 days</label>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                className="w-full py-3 bg-[#21c45d] hover:bg-[#21c45d]/90 text-white font-bold rounded-lg shadow-lg shadow-[#21c45d]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <LogIn size={18} />
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-center gap-2">
            <Shield className="text-slate-400" size={18} />
            <span className="text-xs text-slate-500">Secure AES-256 encrypted connection</span>
          </div>
        </motion.div>

        {/* Platform Status */}
        <div className="mt-8 rounded-xl overflow-hidden h-40 relative group shadow-md">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
          <div className="absolute bottom-4 left-4 z-20 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Platform Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-sm font-medium">All systems operational</p>
            </div>
          </div>
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvuWL9OACTMeeKoWurfknMjQprYYAsIb9SD7UXbRk4s8PC7MDYXbkLrAa63__RP20odhi9K87aqvxVu-ddZT3-RiUPyq4mno7ZK_BTb5guI3NSFTnbuXHkqsFI9hF-A9e6yEg2_aMz6MEcgHsgxPCgIM6n6V_43LjMN7mR7r70Ya1axkFQJn7rhfR651aMEWdGbVqeQ8YF9gZ3Wx08E9mtgV6s8-END5jd35hdgeyRihmW0Y95hzT-D7bQ5zhGKpcUEaoKya0Xkijx" 
            alt="Platform Status"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Help Links */}
        <footer className="mt-8 flex justify-center gap-6 text-xs font-medium text-slate-400">
          <a href="#" className="hover:text-[#21c45d] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#21c45d] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#21c45d] transition-colors">Support Center</a>
        </footer>
      </div>
    </div>
  );
}
