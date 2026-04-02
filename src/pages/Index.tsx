import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerApi, categoryApi, productApi, reviewApi } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { SkeletonRow, SkeletonBanner } from '@/components/SkeletonLoader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import { useRef } from 'react';

const HeroSection = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerApi.getActive().then(r => r.data),
  });

  if (isLoading) return <div className="container mx-auto px-4 pt-6"><SkeletonBanner /></div>;

  const banners = Array.isArray(data) ? data : data?.banners || [];

  if (banners.length === 0) {
    return (
      <section className="relative bg-[#3B0F6F] text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-24 lg:py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-heading text-4xl lg:text-6xl font-semibold mb-6 leading-tight"
          >
            Timeless Elegance,<br />
            <span className="text-gold">Crafted for You</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-body text-primary-foreground/70 text-lg max-w-md mx-auto mb-8"
          >
            Discover our curated collection of fine jewelry, handpicked for the modern connoisseur.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-gold-dark transition-colors"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  const banner = banners[0];
  return (
    <section className="relative bg-[#3B0F6F] text-primary-foreground overflow-hidden">
      {banner.image && (
        <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      )}
      <div className="relative container mx-auto px-4 py-24 lg:py-32 text-center">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="font-heading text-4xl lg:text-6xl font-semibold mb-6 leading-tight">
          {banner.title || 'Timeless Elegance'}
        </motion.h1>
        {banner.subtitle && (
          <p className="font-body text-primary-foreground/70 text-lg max-w-md mx-auto mb-8">{banner.subtitle}</p>
        )}
        <Link to={banner.link || '/shop'}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-gold-dark transition-colors shadow-gold">
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

const CategoryGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data),
  });

  const categories = Array.isArray(data) ? data : data?.categories || [];

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="aspect-square rounded-sm shimmer" />)}
      </div>
    </div>
  );

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-center mb-10">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.slice(0, 8).map((cat: any) => (
          <Link key={cat._id || cat.id} to={`/category/${cat._id || cat.id}`}
            className="group relative aspect-square overflow-hidden rounded-sm bg-secondary">
            {cat.image && <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
            <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-lg font-semibold text-background tracking-wide">{cat.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const ProductSlider = ({ title, queryKey, queryFn }: { title: string; queryKey: string; queryFn: () => Promise<any> }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn,
  });

  const products = Array.isArray(data) ? data : data?.products || [];

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-2xl lg:text-3xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="p-2 border border-border rounded-full hover:bg-secondary transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="p-2 border border-border rounded-full hover:bg-secondary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      {isLoading ? <SkeletonRow /> : (
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x">
          {products.slice(0, 10).map((p: any) => (
            <div key={p._id || p.id} className="min-w-[220px] max-w-[220px] snap-start">
              <ProductCard id={p._id || p.id} name={p.name} price={p.price} image={p.images?.[0] || p.image} category={p.category?.name} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const Testimonials = () => {
  const { data } = useQuery({
    queryKey: ['website-reviews'],
    queryFn: () => reviewApi.getWebsiteReviews().then(r => r.data),
  });

  const reviews = Array.isArray(data) ? data : data?.reviews || [];
  if (reviews.length === 0) return null;

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-center mb-10">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((r: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-background p-6 rounded-sm shadow-soft">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.rating || 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-gold text-gold" />
                ))}
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">"{r.comment || r.text || r.review}"</p>
              <p className="font-heading text-sm font-semibold">{r.name || r.user?.name || 'Customer'}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Homepage = () => (
  <>
    <Navbar />
    <CartDrawer />
    <main>
      <HeroSection />
      <CategoryGrid />
      <ProductSlider title="Trending Now" queryKey="trending" queryFn={() => productApi.trending().then(r => r.data)} />
      <ProductSlider title="Bestsellers" queryKey="bestsellers" queryFn={() => productApi.bestsellers().then(r => r.data)} />
      <Testimonials />
    </main>
    <Footer />
  </>
);

export default Homepage;
