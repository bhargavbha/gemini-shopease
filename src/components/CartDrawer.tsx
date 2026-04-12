import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore } from '@/stores/auth-store';
import { cartApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useVendorId } from '@/hooks/useVendor';
import EmptyState from '@/components/EmptyState';

const CartDrawer = () => {
  const vendorId = useVendorId();
  const { isOpen, closeCart, items, totalPrice } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRemove = async (productId: string) => {
    const userId = user?.user_id || useAuthStore.getState().guestId;
    if (!userId) return;
    try {
      await cartApi.remove({ user_id: userId, product_id: productId });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch { /* handled by interceptor */ }
  };

  const handleCheckout = () => {
    closeCart();
    navigate(`/${vendorId}/checkout`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={closeCart} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-elevated animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-heading text-lg font-semibold">Shopping Bag</h2>
          <button onClick={closeCart} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <EmptyState type="cart" />
          ) : (
            <div className="space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-sm font-body font-semibold text-foreground mt-1">
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border rounded-sm">
                        <button className="p-1 text-muted-foreground hover:text-foreground"><Minus size={14} /></button>
                        <span className="px-2 text-xs font-body">{item.quantity}</span>
                        <button className="p-1 text-muted-foreground hover:text-foreground"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => handleRemove(item.product_id)} className="text-xs text-muted-foreground underline hover:text-destructive font-body">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-muted-foreground">Subtotal</span>
              <span className="font-heading text-lg font-semibold">${totalPrice().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-primary text-primary-foreground text-sm font-body font-medium uppercase tracking-widest hover:bg-charcoal-light transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
