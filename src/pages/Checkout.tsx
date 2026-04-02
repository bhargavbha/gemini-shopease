import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCartStore } from '@/stores/cart-store';
import { addressApi, cartApi, couponApi, paymentApi } from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/CartDrawer';
import { toast } from 'sonner';

const Checkout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { items, totalPrice, cartId } = useCartStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = user?.id || localStorage.getItem('user_id') || '';

  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressType, setAddressType] = useState<'shipping' | 'billing'>('shipping');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Address form
  const [addr, setAddr] = useState({ street: '', city: '', state: '', zip: '', country: '' });

  useEffect(() => {
    if (!isAuthenticated) navigate('/login?redirect=/checkout');
  }, [isAuthenticated, navigate]);

  const { data: addresses } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => addressApi.getAll(userId).then(r => r.data),
    enabled: !!userId,
  });

  const { data: coupons } = useQuery({
    queryKey: ['coupons', cartId],
    queryFn: () => couponApi.getApplicable(cartId!).then(r => r.data),
    enabled: !!cartId,
  });

  const addressList = Array.isArray(addresses) ? addresses : addresses?.addresses || [];
  const couponList = Array.isArray(coupons) ? coupons : coupons?.coupons || [];

  useEffect(() => {
    const def = addressList.find((a: any) => a.isDefault);
    if (def && !selectedShipping) setSelectedShipping(def._id || def.id);
    if (def && !selectedBilling) setSelectedBilling(def._id || def.id);
  }, [addressList]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...addr, user_id: userId };
      if (addressType === 'shipping') await addressApi.addShipping(payload);
      else await addressApi.addBilling(payload);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setShowAddAddress(false);
      setAddr({ street: '', city: '', state: '', zip: '', country: '' });
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handleApplyCoupon = () => {
    const found = couponList.find((c: any) => c.code === couponCode);
    if (found) {
      setAppliedCoupon(found);
      toast.success('Coupon applied!');
    } else {
      toast.error('Invalid coupon code');
    }
  };

  const subtotal = totalPrice();
  const discount = appliedCoupon ? (appliedCoupon.discount_percent ? subtotal * appliedCoupon.discount_percent / 100 : appliedCoupon.discount_amount || 0) : 0;
  const total = subtotal - discount;

  const handlePlaceOrder = async () => {
    if (!selectedShipping) {
      toast.error('Please select a shipping address');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await paymentApi.createCheckoutSession({
        user_id: userId,
        cart_id: cartId,
        shipping_address_id: selectedShipping,
        billing_address_id: selectedBilling || selectedShipping,
        coupon_id: appliedCoupon?._id || appliedCoupon?.id,
      });
      const url = res.data?.url || res.data?.checkout_url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch {
      toast.error('Payment initialization failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar /><CartDrawer />
      <main className="container mx-auto px-4 py-8 lg:py-12">
        <h1 className="font-heading text-3xl font-semibold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Addresses */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold">Shipping Address</h2>
                <button onClick={() => { setShowAddAddress(true); setAddressType('shipping'); }}
                  className="flex items-center gap-1 text-sm font-body text-gold hover:underline">
                  <Plus size={14} /> Add New
                </button>
              </div>
              {addressList.length === 0 ? (
                <p className="text-sm font-body text-muted-foreground">No saved addresses. Add one to continue.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addressList.map((a: any) => {
                    const aid = a._id || a.id;
                    return (
                      <button key={aid} onClick={() => setSelectedShipping(aid)}
                        className={`text-left p-4 border rounded-sm transition-colors ${selectedShipping === aid ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/30'}`}>
                        <div className="flex items-start justify-between">
                          <MapPin size={16} className="text-muted-foreground mt-0.5" />
                          {selectedShipping === aid && <Check size={16} className="text-gold" />}
                        </div>
                        <p className="font-body text-sm mt-2">{a.street}</p>
                        <p className="font-body text-xs text-muted-foreground">{a.city}, {a.state} {a.zip}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Billing */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-lg font-semibold">Billing Address</h2>
                <button onClick={() => { setShowAddAddress(true); setAddressType('billing'); }}
                  className="flex items-center gap-1 text-sm font-body text-gold hover:underline">
                  <Plus size={14} /> Add New
                </button>
              </div>
              <label className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={selectedBilling === selectedShipping}
                  onChange={() => setSelectedBilling(selectedBilling === selectedShipping ? null : selectedShipping)}
                  className="accent-gold" />
                <span className="text-sm font-body text-muted-foreground">Same as shipping address</span>
              </label>
              {selectedBilling !== selectedShipping && addressList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addressList.map((a: any) => {
                    const aid = a._id || a.id;
                    return (
                      <button key={aid} onClick={() => setSelectedBilling(aid)}
                        className={`text-left p-4 border rounded-sm transition-colors ${selectedBilling === aid ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/30'}`}>
                        <p className="font-body text-sm">{a.street}</p>
                        <p className="font-body text-xs text-muted-foreground">{a.city}, {a.state} {a.zip}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Add Address Modal */}
            {showAddAddress && (
              <div className="border border-border rounded-sm p-6">
                <h3 className="font-heading text-sm font-semibold mb-4 uppercase tracking-wider">New {addressType} Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <input value={addr.street} onChange={e => setAddr({ ...addr, street: e.target.value })} placeholder="Street address"
                    className="w-full px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} placeholder="City"
                      className="px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors" required />
                    <input value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} placeholder="State"
                      className="px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={addr.zip} onChange={e => setAddr({ ...addr, zip: e.target.value })} placeholder="ZIP code"
                      className="px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors" required />
                    <input value={addr.country} onChange={e => setAddr({ ...addr, country: e.target.value })} placeholder="Country"
                      className="px-4 py-3 bg-transparent border border-border rounded-sm text-sm font-body outline-none focus:border-gold transition-colors" required />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-body font-medium uppercase tracking-widest">Save</button>
                    <button type="button" onClick={() => setShowAddAddress(false)} className="px-6 py-2.5 border border-border text-sm font-body">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-border rounded-sm p-6 space-y-5">
              <h2 className="font-heading text-lg font-semibold">Order Summary</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs truncate">{item.name}</p>
                      <p className="font-body text-xs text-muted-foreground">×{item.quantity}</p>
                    </div>
                    <p className="font-body text-xs font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <hr className="border-border" />

              {/* Coupon */}
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code"
                  className="flex-1 px-3 py-2 text-sm font-body border border-border rounded-sm bg-transparent outline-none focus:border-gold" />
                <button onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-secondary text-sm font-body font-medium hover:bg-border transition-colors rounded-sm">
                  Apply
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-xs font-body text-green-600">Coupon "{appliedCoupon.code}" applied: -${discount.toFixed(2)}</p>
              )}

              <hr className="border-border" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-body text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-heading text-lg font-semibold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={isProcessing || items.length === 0}
                className="w-full py-3.5 bg-primary text-primary-foreground font-body text-sm font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors disabled:opacity-50">
                {isProcessing ? 'Processing...' : 'Pay with Stripe'}
              </button>

              <p className="text-[10px] font-body text-muted-foreground text-center">
                You will be redirected to Stripe's secure checkout
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
