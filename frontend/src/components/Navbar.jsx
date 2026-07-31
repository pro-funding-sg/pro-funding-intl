import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Rules', href: '/rules' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  const handleNavClick = (href) => {
    if (href.startsWith('/#')) {
      if (!isHome) {
        navigate('/');
        setTimeout(() => {
          const id = href.replace('/#', '');
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      } else {
        const id = href.replace('/#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-800/80 backdrop-blur-md border-b border-navy-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold font-poppins gradient-text">
              PRO FUNDING
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              link.href.startsWith('/#') ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="nav-link px-3 py-2 text-sm font-medium text-gray-300 hover:text-gold-400 transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="nav-link px-3 py-2 text-sm font-medium text-gray-300 hover:text-gold-400 transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="btn-outline text-sm px-4 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/login"
                  className="btn-outline text-sm px-4 py-2"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-gold-400 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-800/95 backdrop-blur-md border-t border-navy-600/50">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              link.href.startsWith('/#') ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left nav-link px-3 py-2 text-base font-medium text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-navy-700/50"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block nav-link px-3 py-2 text-base font-medium text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-navy-700/50"
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="pt-3 space-y-2 border-t border-navy-600/50">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block btn-primary text-center py-2"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="block w-full btn-outline text-center py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block btn-primary text-center py-2"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block btn-outline text-center py-2"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
