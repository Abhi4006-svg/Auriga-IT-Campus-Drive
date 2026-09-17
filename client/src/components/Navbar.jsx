import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Coffee, Users, Gift, LayoutDashboard, LogOut, LogIn, Home } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Subtitle */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold text-amber-500 tracking-tight block leading-none">BeanLedger</span>
            <span className="text-xs text-stone-400 block mt-0.5 font-medium">Café Rewards System</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isActive('/') ? 'bg-amber-500/10 text-amber-400' : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/dashboard') ? 'bg-amber-500/10 text-amber-400' : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Counter Dashboard
              </Link>

              <Link
                to="/members"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/members') || location.pathname.startsWith('/members/')
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                Members Directory
              </Link>

              <Link
                to="/rewards"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  isActive('/rewards') ? 'bg-amber-500/10 text-amber-400' : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Gift className="w-4 h-4" />
                Rewards Catalog
              </Link>
            </>
          )}
        </nav>

        {/* Auth Actions & Staff Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-medium text-stone-200">{user?.name}</span>
                <span className="text-[10px] text-amber-400/90 font-mono capitalize">{user?.role || 'Staff'} Counter</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-stone-800/80 hover:bg-red-500/20 text-stone-300 hover:text-red-400 border border-stone-700/60 transition-colors flex items-center gap-1.5 text-xs font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 transition-colors flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                Staff Login
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-950 bg-amber-500 hover:bg-amber-400 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
