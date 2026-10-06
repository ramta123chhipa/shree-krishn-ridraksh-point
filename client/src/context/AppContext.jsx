import { AuthProvider } from './AuthContext';
import { WishlistProvider } from './WishlistContext';
import { CartProvider } from './CartContext';

// Order matters: cart and wishlist read the logged-in user.
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
