import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Code2, Menu, X, LogOut, User, MessageSquare, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg' 
          : 'bg-transparent border-b border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold tracking-tight">SayrxAI</span>
                <span className="text-[10px] text-white/40 -mt-1">v1.0</span>
              </div>
            </button>

            {/* Desktop Navigation */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate('/chat')}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    isActive('/chat')
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Chat
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{user.username}</span>
                    <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 border-b border-white/10">
                        <div className="text-sm font-semibold text-white">{user.username}</div>
                        <div className="text-xs text-white/40 mt-0.5">{user.email}</div>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => navigate('/chat')}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                        >
                          <MessageSquare className="w-4 h-4 text-white/60" />
                          <span className="text-sm">My Chats</span>
                        </button>
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-left"
                        >
                          <Settings className="w-4 h-4 text-white/60" />
                          <span className="text-sm">Settings</span>
                        </button>
                      </div>
                      <div className="p-2 border-t border-white/10">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-5 py-2 text-sm bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl animate-in slide-in-from-top duration-200">
            <div className="px-6 py-4 space-y-2">
              {user ? (
                <>
                  <div className="pb-3 mb-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{user.username}</div>
                        <div className="text-xs text-white/40">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/chat')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive('/chat')
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">Chat</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-4 py-3 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-all text-left"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full px-4 py-3 text-sm bg-white text-black rounded-lg hover:bg-white/90 transition-all font-medium"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}

export default Navbar;