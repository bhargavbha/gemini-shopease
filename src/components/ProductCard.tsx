import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
}

const ProductCard = ({ id, name, price, image, category, onAddToCart, onToggleWishlist, isWishlisted }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative"
    >
      <Link to={`/product/${id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="font-heading text-lg">No Image</span>
            </div>
          )}
          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300" />
          {onAddToCart && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(); }}
              className="absolute bottom-3 left-3 right-3 py-2.5 bg-primary text-primary-foreground text-xs font-body font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 text-center"
            >
              Add to Cart
            </button>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      {onToggleWishlist && (
        <button
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          aria-label="Toggle wishlist"
        >
          <Heart size={16} className={isWishlisted ? 'fill-gold text-gold' : 'text-muted-foreground'} />
        </button>
      )}

      <div className="mt-3 space-y-1">
        {category && <p className="text-[11px] font-body uppercase tracking-widest text-muted-foreground">{category}</p>}
        <h3 className="font-heading text-sm font-medium text-foreground line-clamp-1">{name}</h3>
        <p className="text-sm font-body font-semibold text-foreground">${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
