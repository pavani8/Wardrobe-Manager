import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiGrid, FiPlus, FiLogOut, FiMenu, FiUpload, FiMessageSquare, FiShield } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/categories', icon: FiGrid, label: 'Categories' },
    { path: '/dresses', icon: FiGrid, label: 'My Dresses' },
    { path: '/add-dress', icon: FiPlus, label: 'Add Dress' },
    { path: '/bulk-upload', icon: FiUpload, label: 'Bulk Upload' },
    { path: '/comments', icon: FiMessageSquare, label: 'Comments' }
  ];

  if (user?.isAdmin) {
    navItems.push({ path: '/admin', icon: FiShield, label: 'Admin' });
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                👗 Wardrobe
              </Link>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-1.5 h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden lg:flex lg:items-center gap-4">
            <span className="text-sm text-gray-600">
              Hi, <span className="font-medium text-gray-900">{user?.username}</span>
              {user?.isAdmin && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="mr-1.5 h-4 w-4" />
              Logout
            </button>
          </div>
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <FiMenu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white h-full w-72 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b">
              <p className="font-semibold">{user?.username}</p>
              {user?.isAdmin && <span className="text-xs text-purple-600">Administrator</span>}
            </div>
            <div className="py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 text-base ${
                      isActive(item.path) ? 'bg-purple-50 text-purple-700' : 'text-gray-600'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-red-600"
              >
                <FiLogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
