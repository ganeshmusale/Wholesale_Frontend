import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('wholesale_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wholesale_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity) => {
    const minQty = parseFloat(product.min_bulk_qty || product.default_bulk_min_qty || 50);
    const qty = Math.max(parseFloat(quantity || minQty), minQty);
    const price = parseFloat(product.wholesale_price || product.unit_price || 0);

    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => item.product_id === product.product_id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total_price: newQty * price
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: product.product_id,
            vegetable_name: product.vegetable_name || product.name,
            unit_id: product.unit_id || 1,
            unit_symbol: product.unit_symbol || 'kg',
            unit_name: product.unit_name || 'Kilogram',
            unit_price: price,
            min_bulk_qty: minQty,
            quantity: qty,
            total_price: qty * price,
            image_url: product.image_url
          }
        ];
      }
    });
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item.product_id === productId) {
          const qty = Math.max(parseFloat(quantity) || item.min_bulk_qty, item.min_bulk_qty);
          return {
            ...item,
            quantity: qty,
            total_price: qty * item.unit_price
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
  const itemCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
