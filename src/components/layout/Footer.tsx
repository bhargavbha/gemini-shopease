import { Link } from 'react-router-dom';
import { useVendorId } from '@/hooks/useVendor';

const Footer = () => {
  const vendorId = useVendorId();
  return (
  <footer className="bg-primary text-primary-foreground mt-20">
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <h3 className="font-heading text-xl font-semibold mb-4">GOLDEN ERA<span className="text-gold">.</span></h3>
          <p className="text-sm text-primary-foreground/70 leading-relaxed font-body">
            Curated luxury jewelry for the discerning collector. Every piece tells a story.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
          <ul className="space-y-2.5">
            <li><Link to={`/${vendorId}/shop`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors font-body">All Products</Link></li>
            <li><Link to={`/${vendorId}/shop?filter=new`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors font-body">New Arrivals</Link></li>
            <li><Link to={`/${vendorId}/shop?filter=bestsellers`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors font-body">Bestsellers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4">Account</h4>
          <ul className="space-y-2.5">
            <li><Link to={`/${vendorId}/account`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors font-body">My Profile</Link></li>
            <li><Link to={`/${vendorId}/account?tab=orders`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors font-body">Order History</Link></li>
            <li><Link to={`/${vendorId}/account?tab=wishlist`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors font-body">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
          <ul className="space-y-2.5">
            <li><span className="text-sm text-primary-foreground/70 font-body">contact@goldenera.com</span></li>
            <li><span className="text-sm text-primary-foreground/70 font-body">+1 (800) 555-0199</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-6 text-center">
        <p className="text-xs text-primary-foreground/50 font-body">© {new Date().getFullYear()} bhargav and team. All rights reserved.</p>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
