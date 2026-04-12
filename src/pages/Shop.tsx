import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productApi, categoryApi, cartApi, wishlistApi, bannerApi } from '@/services/api';
import { useAuthStore } from '@/stores/auth-store';
import ProductCard from '@/components/ProductCard';
import { SkeletonRow } from '@/components/SkeletonLoader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import { useQueryClient } from '@tanstack/react-query';
import { useVendorId } from '@/hooks/useVendor';
import { toast } from 'sonner';

const ShopPage = () => {
  const vendorId = useVendorId();
  const { category_id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('search') || '';
  const filterType = searchParams.get('filter') || '';
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPriceRange(priceRange), 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  const isFiltering = debouncedPriceRange[0] > 0 || debouncedPriceRange[1] < 100000;

  const getQueryKey = () => {
    if (isFiltering) return ['products', 'filter', debouncedPriceRange, category_id, searchQuery];
    if (category_id) return ['products', 'category', category_id];
    if (searchQuery) return ['products', 'search', searchQuery];
    if (filterType === 'bestsellers') return ['products', 'bestsellers'];
    if (filterType === 'new') return ['products', 'recent'];
    return ['products', 'all'];
  };

  const getQueryFn = () => {
    if (isFiltering) return () => productApi.filter({ minPrice: debouncedPriceRange[0], maxPrice: debouncedPriceRange[1], category: category_id, search: searchQuery }).then(r => r.data);
    if (category_id) return () => productApi.byCategory(category_id).then(r => r.data);
    if (searchQuery) return () => productApi.search(searchQuery).then(r => r.data);
    if (filterType === 'bestsellers') return () => productApi.bestsellers().then(r => r.data);
    if (filterType === 'new') return () => productApi.recent().then(r => r.data);
    return () => productApi.byVendor(vendorId).then(r => r.data);
  };

  const { data, isLoading } = useQuery({ queryKey: getQueryKey(), queryFn: getQueryFn() });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll().then(r => r.data) });
  
  const { data: categoryBanner } = useQuery({
    queryKey: ['banner', category_id],
    queryFn: () => bannerApi.getByCategory(category_id!).then(r => r.data),
    enabled: !!category_id,
  });

  const bannerImages = Array.isArray(categoryBanner) ? categoryBanner : categoryBanner?.banners || [];
  const activeBanner = bannerImages[0];

  const products = Array.isArray(data) ? data : data?.products || [];
  const cats = Array.isArray(categories) ? categories : categories?.categories || [];

  const getTitle = () => {
    if (searchQuery) return `Results for "${searchQuery}"`;
    if (filterType === 'bestsellers') return 'Bestsellers';
    if (filterType === 'new') return 'New Arrivals';
    if (category_id) {
      const cat = cats.find((c: any) => String(c.category_id) === category_id);
      return cat?.category_name || 'Category';
    }
    return 'Shop all new arrivals';
  };

  const handleBuyNow = async (productId: string) => {
    const userId = user?.id || useAuthStore.getState().guestId;
    if (!userId) {
      toast.error('Please login to continue');
      return;
    }
    try {
      await cartApi.add({ user_id: userId, product_id: productId, quantity: 1 });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate(`/${vendorId}/checkout`);
    } catch {
      toast.error('Failed to process request');
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!isAuthenticated || !user?.id) return;
    try {
      await wishlistApi.add(user.id, { product_id: productId });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch {}
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">Search</h3>
                <div className="flex items-center border border-border rounded-sm overflow-hidden">
                  <input
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search..."
                    className="flex-1 px-3 py-2 text-sm font-body bg-transparent outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && localSearch.trim()) {
                        window.location.href = `/${vendorId}/shop?search=${encodeURIComponent(localSearch.trim())}`;
                      }
                    }}
                  />
                  <Search size={16} className="mr-3 text-muted-foreground" />
                </div>
              </div>

              {/* Categories */}
              {cats.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">Categories</h3>
                  <ul className="space-y-2">
                    {cats.map((cat: any) => (
                      <li key={cat.category_id}>
                        <Link to={`/${vendorId}/category/${cat.category_id}`}
                          className={`text-sm font-body transition-colors ${category_id === String(cat.category_id) ? 'text-gold font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                          {cat.category_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price */}
              <div>
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-full px-2 py-1.5 text-sm font-body border border-border rounded-sm bg-transparent"
                    placeholder="Min"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-full px-2 py-1.5 text-sm font-body border border-border rounded-sm bg-transparent"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {activeBanner && (
              <div className="mb-8 w-full h-48 lg:h-64 rounded-sm overflow-hidden relative bg-secondary">
                {activeBanner.image && <img src={activeBanner.image} alt={activeBanner.title || ''} className="w-full h-full object-cover" />}
                <div className="absolute inset-0 bg-foreground/20 flex flex-col items-center justify-center p-6 text-center">
                  <h2 className="font-heading text-3xl font-bold text-background tracking-wide mb-2">{activeBanner.title}</h2>
                  {activeBanner.subtitle && <p className="font-body text-background/90 max-w-lg">{activeBanner.subtitle}</p>}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading text-2xl lg:text-3xl font-semibold">{getTitle()}</h1>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 text-sm font-body text-muted-foreground">
                {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />}
                Filters
              </button>
            </div>
            <p className="text-sm font-body text-muted-foreground mb-6">{products.length} product{products.length !== 1 ? 's' : ''}</p>

            {isLoading ? <SkeletonRow count={8} /> : products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-heading text-lg text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {products.map((p: any) => (
                  <ProductCard
                    key={p.product_id || p._id || p.id}
                    id={p.product_id || p._id || p.id}
                    name={p.product_name || p.name}
                    price={p.selling_price || p.price}
                    image={p.p_images?.[0] || p.images?.[0] || p.image}
                    category={p.category?.name}
                    onAddToCart={() => handleBuyNow(p.product_id || p._id || p.id)}
                    onToggleWishlist={() => handleToggleWishlist(p.product_id || p._id || p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ShopPage;
