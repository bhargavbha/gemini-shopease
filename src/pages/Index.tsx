import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { bannerApi, categoryApi, productApi, reviewApi, websiteReviewApi } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import { SkeletonRow, SkeletonBanner } from '@/components/SkeletonLoader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import { useRef, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { useVendorId } from '@/hooks/useVendor';

const HeroSection = () => {
  const vendorId = useVendorId();
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
              to={`/${vendorId}/shop`}
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
        <Link to={banner.link ? `/${vendorId}${banner.link.startsWith('/') ? '' : '/'}${banner.link}` : `/${vendorId}/shop`}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-accent-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-gold-dark transition-colors shadow-gold">
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

const CategoryGrid = () => {
  const vendorId = useVendorId();
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
          <Link key={cat.category_id} to={`/${vendorId}/category/${cat.category_id}`}
            className="group relative aspect-square overflow-hidden rounded-sm bg-secondary">
            {cat.category_image && <img src={cat.category_image} alt={cat.category_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
            <div className="absolute inset-0 bg-foreground/30 group-hover:bg-foreground/40 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading text-lg font-semibold text-background tracking-wide">{cat.category_name}</span>
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
            <div key={p.product_id || p._id || p.id} className="min-w-[220px] max-w-[220px] snap-start">
              <ProductCard id={p.product_id || p._id || p.id} name={p.product_name || p.name} price={p.selling_price || p.price} image={p.p_images?.[0] || p.images?.[0] || p.image} category={p.category?.name} />
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
  
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast.error('Please log in to submit a review');
      return;
    }
    if (!reviewText.trim()) return;
    setIsSubmitting(true);
    try {
      await websiteReviewApi.add({ user_id: user.user_id, rating, comment: reviewText });
      toast.success('Thank you for your feedback!');
      setReviewText('');
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ['website-reviews'] });
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviews = Array.isArray(data) ? data : data?.reviews || [];

  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl lg:text-3xl font-semibold text-center mb-10">What Our Customers Say</h2>
        
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
        ) : (
          <p className="text-center text-muted-foreground text-sm font-body mb-12">No reviews yet. Be the first to share your experience!</p>
        )}

        {isAuthenticated ? (
          <div className="max-w-xl mx-auto bg-background p-8 rounded-sm shadow-soft">
            <h3 className="font-heading text-lg font-semibold mb-4 text-center">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-body text-muted-foreground mb-2 text-center">Rating</label>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s} onClick={() => setRating(s)} className="p-1">
                      <Star size={24} className={s <= rating ? 'fill-gold text-gold' : 'text-border'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                  placeholder="How was your shopping experience?" required />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full py-3 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-body text-muted-foreground">Log in to share your experience with Golden Era.</p>
          </div>
        )}
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
