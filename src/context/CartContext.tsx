import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, CartItem } from '../types/index';
import { useAuth } from './AuthContext';
import { cartService } from '../api/services/cartService';
import { CartResponse } from '../api/types/cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variantId?: number) => Promise<void>;
  removeFromCart: (productId: string, cartItemId?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, cartItemId?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Convert API CartResponse to local CartItem format
  const convertApiCartToLocal = (apiCart: CartResponse): CartItem[] => {
    return apiCart.items.map(item => {
      const effectivePrice = item.discountedPrice ?? item.price;
      return {
        id: item.variantId.toString(),
        cartItemId: item.cartItemId,
        name: item.productName || item.variantName || 'Unknown Product',
        price: effectivePrice,
        discountedPrice: item.discountedPrice,
        quantity: item.quantity,
        image: item.thumbnailUrl || item.imageUrl || '/placeholder.png',
        brand: '',
        category: '',
        description: '',
        rating: 0,
        reviews: 0,
        inStock: true,
      };
    });
  };

  // Fetch cart from API if authenticated
  const refreshCart = async () => {
    if (!isAuthenticated) {
      // Load from localStorage if not authenticated
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }
      return;
    }

    try {
      setLoading(true);
      const apiCart = await cartService.getMyCart();
      const localCart = convertApiCartToLocal(apiCart);
      setCart(localCart);
      // Clear localStorage cart when synced with API
      localStorage.removeItem('cart');
    } catch (error: any) {
      console.error('Failed to fetch cart:', error);
      // Fallback to localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount and when auth changes
  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear cart when logged out
      setCart([]);
      localStorage.removeItem('cart');
    }
  }, [isAuthenticated]);

  // Save cart to localStorage only if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const addToCart = async (product: Product, variantId?: number) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      // Determine variantId
      let finalVariantId = variantId;
      
      // If no variantId provided, try to get from product variants
      if (!finalVariantId) {
        const apiProduct = product as any;
        
        // If product has variants array, use the first variant
        if (apiProduct.variants && Array.isArray(apiProduct.variants) && apiProduct.variants.length > 0) {
          finalVariantId = apiProduct.variants[0].variantId;
          console.log('Using first variant:', finalVariantId, 'from product:', apiProduct.name);
        } else {
          // Fallback: try to use product.id or productId (may not work)
          const productIdStr = apiProduct.id || apiProduct.productId;
          if (productIdStr) {
            finalVariantId = typeof productIdStr === 'string' ? parseInt(productIdStr) : productIdStr;
            console.warn('No variants found, using productId as variantId:', finalVariantId);
          }
        }
      }
      
      if (!finalVariantId) {
        throw new Error('Không thể xác định variant của sản phẩm. Vui lòng vào trang chi tiết sản phẩm.');
      }
      
      console.log('Adding to cart - variantId:', finalVariantId);
      
      // Call API to add to cart
      const apiCart = await cartService.addToCart({
        variantId: finalVariantId,
        quantity: 1,
      });
      
      // Update local state
      const localCart = convertApiCartToLocal(apiCart);
      setCart(localCart);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      
      // Show more detailed error message
      let errorMessage = 'Không thể thêm vào giỏ hàng.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.toLowerCase().includes('stock') || error.message?.toLowerCase().includes('tồn kho') || error.code === 1008) {
        errorMessage = 'Sản phẩm đã hết hàng hoặc không đủ số lượng.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 9999) {
        errorMessage = 'Lỗi hệ thống. Sản phẩm có thể không tồn tại hoặc hết hàng.';
      }
      
      alert(errorMessage);
      throw error; // Re-throw to let caller handle it
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string, cartItemId?: number) => {
    if (!isAuthenticated || !cartItemId) {
      // Local cart removal
      setCart(prev => prev.filter(item => item.id !== productId));
      return;
    }

    try {
      setLoading(true);
      const apiCart = await cartService.removeCartItem(cartItemId);
      const localCart = convertApiCartToLocal(apiCart);
      setCart(localCart);
    } catch (error: any) {
      console.error('Failed to remove from cart:', error);
      alert(error.message || 'Không thể xóa khỏi giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number, cartItemId?: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, cartItemId);
      return;
    }

    if (!isAuthenticated || !cartItemId) {
      // Local cart update
      setCart(prev => prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      ));
      return;
    }

    try {
      setLoading(true);
      const apiCart = await cartService.updateCartItem(cartItemId, { quantity });
      const localCart = convertApiCartToLocal(apiCart);
      setCart(localCart);
    } catch (error: any) {
      console.error('Failed to update cart:', error);
      alert(error.message || 'Không thể cập nhật giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      setCart([]);
      return;
    }

    try {
      setLoading(true);
      // Delete each cart item individually since backend doesn't support DELETE /cart
      const deletePromises = cart.map(item => 
        item.cartItemId ? cartService.removeCartItem(item.cartItemId) : Promise.resolve()
      );
      await Promise.all(deletePromises);
      setCart([]);
    } catch (error: any) {
      console.error('Failed to clear cart:', error);
      // Don't show alert, just log error and clear local state
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart.length; // Số lượng sản phẩm khác nhau
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalPrice,
      loading,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
