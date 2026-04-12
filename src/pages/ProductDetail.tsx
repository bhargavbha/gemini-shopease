import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorId } from '@/hooks/useVendor';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Minus, Plus } from 'lucide-react';
import { productApi, reviewApi, cartApi, wishlistApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import ProductCard from '@/components/ProductCard';
import { SkeletonRow } from '@/components/SkeletonLoader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { product_id } = useParams<{ product_id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const vendorId = useVendorId();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', product_id],
    queryFn: () => productApi.details(product_id!).then(r => r.data?.product || r.data),
    enabled: !!product_id,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product_id],
    queryFn: () => reviewApi.getProductReviews(product_id!).then(r => r.data),
    enabled: !!product_id,
  });

  const { data: related, isLoading: relatedLoading } = useQuery({
    queryKey: ['related', product_id],
    queryFn: () => productApi.sameCategory(product_id!).then(r => r.data),
    enabled: !!product_id,
  });

  const { data: vendorRelated, isLoading: vendorRelatedLoading } = useQuery({
    queryKey: ['vendor-related', product_id],
    queryFn: () => productApi.sameVendor(product_id!).then(r => r.data),
    enabled: !!product_id,
  });

  const reviewsList = Array.isArray(reviews) ? reviews : reviews?.reviews || [];
  const relatedProducts = Array.isArray(related) ? related : related?.products || [];
  const vendorProducts = Array.isArray(vendorRelated) ? vendorRelated : vendorRelated?.products || [];
  const images = product?.images || (product?.image ? [product.image] : []);

  const handleBuyNow = async () => {
    const userId = user?.id || useAuthStore.getState().guestId;
    if (!userId) {
      toast.error('Please login to continue');
      return;
    }
    try {
      await cartApi.add({ user_id: userId, product_id: product_id!, quantity });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/${vendorId}/checkout`);
      toast.success('Redirecting to checkout...');
    } catch {
      toast.error('Failed to process request');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to save to wishlist');
      return;
    }
    try {
      await wishlistApi.add(user.id, { product_id: product_id! });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Added to wishlist');
    } catch {
      toast.error('Failed to add to wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user?.id) {
      toast.error('Please login to leave a review');
      return;
    }
    if (!reviewText.trim()) return;
    setIsSubmittingReview(true);
    try {
      await reviewApi.addReview({ product_id: product_id, user_id: user.id, rating: reviewRating, comment: reviewText });
      toast.success('Review submitted successfully');
      setReviewText('');
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar /><CartDrawer />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square shimmer rounded-sm" />
            <div className="space-y-4">
              <div className="h-6 w-32 shimmer rounded" />
              <div className="h-8 w-3/4 shimmer rounded" />
              <div className="h-6 w-24 shimmer rounded" />
              <div className="h-20 w-full shimmer rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <><Navbar /><CartDrawer />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading text-2xl">Product not found</h1>
        </div>
        <Footer />
      </>
    );
  }

  const avgRating = reviewsList.length > 0
    ? reviewsList.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsList.length
    : 0;

  return (
    <>
      <Navbar /><CartDrawer />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="aspect-square bg-secondary rounded-sm overflow-hidden">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.data?.product_name || product.product_name || product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground font-heading">No Image</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-sm overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-gold' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            {product.category?.category_name && (
              <p className="text-xs font-body uppercase tracking-widest text-muted-foreground">{product.category.category_name}</p>
            )}
            <h1 className="font-heading text-3xl lg:text-4xl font-semibold leading-tight">{product.data.product_name}</h1>

            {reviewsList.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'fill-gold text-gold' : 'text-border'} />
                  ))}
                </div>
                <span className="text-xs font-body text-muted-foreground">({reviewsList.length} reviews)</span>
              </div>
            )}

            <p className="font-heading text-2xl font-semibold">₹ {product.data.selling_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>

            {product.data.main_description && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{product.data.main_description}</p>
            )}

            <p className="text-sm font-body">
              <span className="text-muted-foreground">Availability: </span>
              <span className={(product.original_stock || product.stock) > 0 ? 'text-green-600' : 'text-destructive'}>
                {(product.original_stock || product.stock) > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </p>

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-border rounded-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-muted-foreground hover:text-foreground"><Minus size={16} /></button>
                <span className="px-4 font-body text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-muted-foreground hover:text-foreground"><Plus size={16} /></button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors flex items-center justify-center gap-2"
                disabled={product.stock <= 0}>
                <ShoppingBag size={16} /> Buy Now
              </button>
              <button onClick={handleAddToWishlist}
                className="px-4 py-3.5 border border-border text-foreground hover:border-gold hover:text-gold transition-colors">
                <Heart size={18} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <section className="mt-16 lg:mt-24">
          <h2 className="font-heading text-2xl font-semibold mb-8">Customer Reviews</h2>

          {isAuthenticated && (
            <div className="mb-10 bg-secondary/30 p-6 rounded-sm border border-border">
              <h3 className="font-heading text-lg font-semibold mb-4">Leave a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-body text-muted-foreground mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button type="button" key={s} onClick={() => setReviewRating(s)} className="p-1">
                        <Star size={20} className={s <= reviewRating ? 'fill-gold text-gold' : 'text-border'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-body text-muted-foreground mb-2">Your Review</label>
                  <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
                    className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                    placeholder="Tell us what you think..." required />
                </div>
                <button type="submit" disabled={isSubmittingReview}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-body font-medium uppercase tracking-widest disabled:opacity-50">
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {reviewsList.length > 0 ? (
            <div className="space-y-6">
              {reviewsList.map((r: any, i: number) => (
                <div key={i} className="border-b border-border pb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} className={s <= (r.rating || 0) ? 'fill-gold text-gold' : 'text-border'} />
                      ))}
                    </div>
                    <span className="text-xs font-body text-muted-foreground">{r.user?.name || r.name || 'Anonymous'}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{r.comment || r.text || r.review}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-body text-muted-foreground">No reviews yet. Be the first to review!</p>
          )}
        </section>

        {/* Related */}
        <section className="mt-16 lg:mt-24">
          <h2 className="font-heading text-2xl font-semibold mb-8">You May Also Like</h2>
          {relatedLoading ? <SkeletonRow /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((p: any) => (
                <ProductCard key={p._id || p.id} id={p._id || p.id} name={p.data?.product_name || p.product_name || p.name} price={p.selling_price || p.price} image={p.images?.[0] || p.image} category={p.category?.category_name || p.category?.name} />
              ))}
            </div>
          )}
        </section>

        {/* Same Vendor */}
        {vendorProducts.length > 0 && (
          <section className="mt-12 lg:mt-20">
            <h2 className="font-heading text-2xl font-semibold mb-8">More from this Vendor</h2>
            {vendorRelatedLoading ? <SkeletonRow /> : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {vendorProducts.slice(0, 4).map((p: any) => (
                  <ProductCard key={p._id || p.id} id={p._id || p.id} name={p.data?.product_name || p.product_name || p.name} price={p.selling_price || p.price} image={p.images?.[0] || p.image} category={p.category?.category_name || p.category?.name} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default ProductDetail;
