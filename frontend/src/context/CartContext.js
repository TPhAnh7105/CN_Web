import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user, isLoggedIn } = useAuth();

  // A deterministic key uniquely bound to the user ID
  const cartKey = user?.id ? `luxe_cart_${user.id}` : null;

  // 1. Sync state FROM LocalStorage whenever the logged in user changes
  useEffect(() => {
    if (isLoggedIn && cartKey) {
      const localData = localStorage.getItem(cartKey);
      setCartItems(localData ? JSON.parse(localData) : []);
    } else {
      // Clear memory if user logs out, so next user doesn't inherit items
      setCartItems([]);
    }
  }, [isLoggedIn, cartKey]);

  // 2. Sync state TO LocalStorage whenever items change (only if logged in)
  useEffect(() => {
    if (isLoggedIn && cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, cartKey, isLoggedIn]);

  const addToCart = (product) => {
    // Guard against adding items when not logged in if interface permits it
    if (!isLoggedIn) return;
    setCartItems(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedColor === product.selectedColor && 
        item.selectedSize === product.selectedSize
      );
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedColor === product.selectedColor && item.selectedSize === product.selectedSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, color, size) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedColor === color && item.selectedSize === size)));
  };

  const updateQuantity = (productId, color, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.id === productId && item.selectedColor === color && item.selectedSize === size) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.discountPrice || item.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
