import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import { NotificationBell } from '../notifications/NotificationBell';
import logoImg from '../../assets/logo.png';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { household } = useHousehold();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-700 text-white'
        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
    }`;

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <img
                src={logoImg}
                alt="MealShare Logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <span className="text-xl sm:text-2xl font-bold text-primary-700">
                MealShare
              </span>
            </Link>
            {household && (
              <div className="hidden md:block text-sm text-gray-600">
                <span className="font-medium">{household.name}</span>
              </div>
            )}

            <div className="hidden md:flex space-x-1">
              <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link
                to="/meal-planner"
                className={navLinkClass('/meal-planner')}
              >
                Meal Planner
              </Link>
              <Link
                to="/shopping-list"
                className={navLinkClass('/shopping-list')}
              >
                Shopping List
              </Link>
              <Link to="/costs" className={navLinkClass('/costs')}>
                Costs
              </Link>
              <Link to="/household" className={navLinkClass('/household')}>
                Household
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationBell />

            {/* User Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 hover:text-primary-700 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-gray-700 font-medium">
                  {user?.name}
                </span>
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20 border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-200 pb-3 px-4">
          <div className="flex flex-col space-y-2 pt-3">
            <Link
              to="/dashboard"
              className={navLinkClass('/dashboard')}
              onClick={handleMobileNavClick}
            >
              Dashboard
            </Link>
            <Link
              to="/meal-planner"
              className={navLinkClass('/meal-planner')}
              onClick={handleMobileNavClick}
            >
              Meal Planner
            </Link>
            <Link
              to="/shopping-list"
              className={navLinkClass('/shopping-list')}
              onClick={handleMobileNavClick}
            >
              Shopping List
            </Link>
            <Link
              to="/costs"
              className={navLinkClass('/costs')}
              onClick={handleMobileNavClick}
            >
              Costs
            </Link>
            <Link
              to="/household"
              className={navLinkClass('/household')}
              onClick={handleMobileNavClick}
            >
              Household
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
