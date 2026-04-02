import { ShoppingBag, Heart, Package } from 'lucide-react';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'orders';
  title?: string;
  description?: string;
}

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: Package,
};

const defaults = {
  cart: { title: 'Your cart is empty', description: 'Discover our curated collection and find something you love.' },
  wishlist: { title: 'Your wishlist is empty', description: 'Save your favorite pieces for later by tapping the heart icon.' },
  orders: { title: 'No orders yet', description: 'Your order history will appear here once you make a purchase.' },
};

const EmptyState = ({ type, title, description }: EmptyStateProps) => {
  const Icon = icons[type];
  const d = defaults[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{title || d.title}</h3>
      <p className="text-sm font-body text-muted-foreground max-w-sm">{description || d.description}</p>
    </div>
  );
};

export default EmptyState;
