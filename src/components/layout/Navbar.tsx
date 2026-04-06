import { Link, useNavigate } from 'react-router-dom';
import { Heart, Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { useState } from 'react';
import { useVendorId } from '@/hooks/useVendor';

const Navbar = () => {
  const { isAuthenticated } = useAuthStore();
  const { openCart, totalItems } = useCartStore();
  const navigate = useNavigate();
  const vendorId = useVendorId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const count = totalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${vendorId}/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleProtectedNav = (path: string) => {
    setMobileOpen(false);
    if (!isAuthenticated) {
      navigate(`/${vendorId}/login?redirect=${encodeURIComponent('/' + vendorId + path)}`);
    } else {
      navigate(`/${vendorId}${path}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to={`/${vendorId}`} className="font-heading text-xl lg:text-2xl font-semibold tracking-wide text-foreground">
              GOLDEN ERA<span className="text-gold">.</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to={`/${vendorId}/shop`} className="text-sm font-body font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </Link>
              <Link to={`/${vendorId}/shop?filter=new`} className="text-sm font-body font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
                New Arrivals
              </Link>
              <Link to={`/${vendorId}/shop?filter=bestsellers`} className="text-sm font-body font-medium tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors">
                Bestsellers
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search size={20} />
              </button>
              <button onClick={() => handleProtectedNav('/account?tab=wishlist')} className="hidden sm:block p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Wishlist">
                <Heart size={20} />
              </button>
              <button onClick={() => isAuthenticated ? navigate(`/${vendorId}/account`) : navigate(`/${vendorId}/login`)} className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Account">
                <User size={20} />
              </button>
              <button onClick={openCart} className="relative p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Cart">
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-gold text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-background py-3 px-4 animate-fade-in">
            <form onSubmit={handleSearch} className="container mx-auto flex items-center gap-3">
              <Search size={18} className="text-muted-foreground" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jewelry, rings, necklaces..."
                className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 pt-20 flex flex-col gap-6 animate-slide-in-right">
            <Link to={`/${vendorId}/shop`} onClick={() => setMobileOpen(false)} className="text-lg font-heading font-medium">Shop All</Link>
            <Link to={`/${vendorId}/shop?filter=new`} onClick={() => setMobileOpen(false)} className="text-lg font-heading font-medium">New Arrivals</Link>
            <Link to={`/${vendorId}/shop?filter=bestsellers`} onClick={() => setMobileOpen(false)} className="text-lg font-heading font-medium">Bestsellers</Link>
            <hr className="border-border" />
            <button onClick={() => handleProtectedNav('/account')} className="text-left text-lg font-heading font-medium">My Account</button>
            <button onClick={() => handleProtectedNav('/account?tab=wishlist')} className="text-left text-lg font-heading font-medium">Wishlist</button>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
