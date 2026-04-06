import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Package, Heart, LogOut, ChevronRight, Star } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { orderApi, wishlistApi, cartApi, authApi, invoiceApi } from '@/services/api';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import { SkeletonRow } from '@/components/SkeletonLoader';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import { toast } from 'sonner';
import { useVendorId } from '@/hooks/useVendor';

const Account = () => {
  const vendorId = useVendorId();
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate(`/${vendorId}/login?redirect=/${vendorId}/account`);
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone((user.phone as string) || '');
    }
  }, [user]);

  const userId = user?.id || localStorage.getItem('user_id') || '';

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', userId],
    queryFn: () => orderApi.getAll(userId).then(r => r.data),
    enabled: !!userId && activeTab === 'orders',
  });

  const { data: orderDetail } = useQuery({
    queryKey: ['order-detail', userId, selectedOrder],
    queryFn: () => orderApi.getDetails(userId, selectedOrder!).then(r => r.data),
    enabled: !!selectedOrder && !!userId,
  });

  const { data: wishlist, isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => wishlistApi.get(userId).then(r => r.data),
    enabled: !!userId && activeTab === 'wishlist',
  });

  const ordersList = Array.isArray(orders) ? orders : orders?.orders || [];
  const wishlistItems = Array.isArray(wishlist) ? wishlist : wishlist?.items || wishlist?.wishlist || [];

  const handleUpdateProfile = async () => {
    try {
      await authApi.updateProfile({ name: editName, phone: editPhone });
      fetchProfile();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    try {
      await wishlistApi.remove(userId, { product_id: productId });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Removed from wishlist');
    } catch {}
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      await cartApi.add({ user_id: userId, product_id: productId, quantity: 1 });
      await wishlistApi.remove(userId, { product_id: productId });
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'cart'] });
      toast.success('Moved to cart');
    } catch {}
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  if (!isAuthenticated) return null;

  return (
    <>
      <Navbar /><CartDrawer />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <h1 className="font-heading text-3xl font-semibold mb-8">My Account</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="flex lg:flex-col gap-1">
              {tabs.map(t => (
                <button key={t.key} onClick={() => { setActiveTab(t.key); setSelectedOrder(null); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body transition-colors ${activeTab === t.key ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}>
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
              <button onClick={() => { logout(); navigate(`/${vendorId}/`); }}
                className="flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-body text-destructive hover:bg-destructive/10 transition-colors mt-4">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="max-w-lg space-y-6">
                <h2 className="font-heading text-xl font-semibold">Personal Information</h2>
                <div>
                  <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Full Name</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Email</label>
                  <input value={user?.email || ''} disabled
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-sm text-sm font-body text-muted-foreground" />
                </div>
                <div>
                  <label className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1.5">Phone</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors"
                    placeholder="+1 (555) 000-0000" />
                </div>
                <button onClick={handleUpdateProfile}
                  className="px-8 py-3 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors">
                  Save Changes
                </button>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-heading text-xl font-semibold mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-sm" />)}</div>
                ) : ordersList.length === 0 ? (
                  <EmptyState type="orders" />
                ) : selectedOrder && orderDetail ? (
                  <div>
                    <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-1 text-sm font-body text-gold mb-6 hover:underline">
                      ← Back to orders
                    </button>
                    <div className="border border-border rounded-sm p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-heading text-lg font-semibold">Order #{(orderDetail.order?._id || orderDetail._id || selectedOrder).slice(-8)}</p>
                          <p className="text-xs font-body text-muted-foreground mt-1">
                            {new Date(orderDetail.order?.createdAt || orderDetail.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-secondary text-xs font-body font-medium rounded-full uppercase">
                            {orderDetail.order?.status || orderDetail.status || 'Processing'}
                          </span>
                          <button onClick={async () => {
                            try {
                              const res = await invoiceApi.getInvoice(orderDetail.order?._id || orderDetail._id || selectedOrder!);
                              const blob = new Blob([res.data], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `Invoice-${(orderDetail.order?._id || orderDetail._id || selectedOrder!).slice(-8)}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              window.URL.revokeObjectURL(url);
                            } catch {
                              toast.error('Failed to download invoice');
                            }
                          }} className="text-xs font-body text-gold hover:underline">
                            Download Invoice
                          </button>
                        </div>
                      </div>
                      <hr className="border-border" />
                      <div className="space-y-3">
                        {(orderDetail.order?.items || orderDetail.items || []).map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-secondary rounded-sm overflow-hidden">
                              {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-body text-sm font-medium">{item.name || item.product?.name}</p>
                              <p className="text-xs font-body text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-body text-sm font-semibold">${item.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ordersList.map((order: any) => (
                      <button key={order._id || order.id} onClick={() => setSelectedOrder(order._id || order.id)}
                        className="w-full flex items-center justify-between p-5 border border-border rounded-sm hover:border-gold/50 transition-colors text-left">
                        <div>
                          <p className="font-heading text-sm font-semibold">Order #{(order._id || order.id).slice(-8)}</p>
                          <p className="text-xs font-body text-muted-foreground mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-secondary text-xs font-body font-medium rounded-full uppercase">{order.status || 'Processing'}</span>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="font-heading text-xl font-semibold mb-6">My Wishlist</h2>
                {wishlistLoading ? <SkeletonRow /> : wishlistItems.length === 0 ? (
                  <EmptyState type="wishlist" />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistItems.map((item: any) => {
                      const product = item.product || item;
                      const pId = product._id || product.id;
                      return (
                        <div key={pId} className="relative">
                          <ProductCard
                            id={pId}
                            name={product.name}
                            price={product.price}
                            image={product.images?.[0] || product.image}
                            onAddToCart={() => handleMoveToCart(pId)}
                          />
                          <button onClick={() => handleRemoveWishlist(pId)}
                            className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full text-destructive hover:bg-background text-xs font-body">
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;
