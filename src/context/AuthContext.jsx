import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wholesale_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('wholesale_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify and fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.data);
          localStorage.setItem('wholesale_user', JSON.stringify(res.data.data));
        }
      } catch (err) {
        console.error('Session expired or error fetching profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (identifier, password) => {
    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  const loginWithMobile = async (phone) => {
    try {
      const res = await api.post('/auth/login-mobile', { phone });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Mobile login failed. Please check your phone number.';
      return { success: false, message: msg };
    }
  };

  const loginByRole = async (role) => {
    try {
      const res = await api.post('/auth/login-role', { role });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to login as ${role}.`;
      return { success: false, message: msg };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  // Dedicated Admin Login
  const loginAdmin = async (identifier, password) => {
    try {
      const res = await api.post('/auth/admin/login', { identifier, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed.';
      return { success: false, message: msg };
    }
  };

  // Dedicated Shop Owner Login (Mobile Number only)
  const loginShopOwner = async (phone) => {
    try {
      const res = await api.post('/auth/shop/login', { phone });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Shop owner login failed. Please verify your mobile number.';
      return { success: false, message: msg };
    }
  };

  // Dedicated Shop Owner Registration
  const registerShopOwner = async (shopData) => {
    try {
      const res = await api.post('/auth/shop/register', { ...shopData, role: 'business_man' });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Shop registration failed.';
      return { success: false, message: msg };
    }
  };

  // Dedicated Delivery Partner Login
  const loginDelivery = async (identifier, password) => {
    try {
      const res = await api.post('/auth/delivery/login', { identifier, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Delivery login failed.';
      return { success: false, message: msg };
    }
  };

  // Dedicated Delivery Partner Registration
  const registerDelivery = async (deliveryData) => {
    try {
      const res = await api.post('/auth/delivery/register', { ...deliveryData, role: 'delivery' });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('wholesale_token', newToken);
        localStorage.setItem('wholesale_user', JSON.stringify(newUser));
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Delivery registration failed.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('wholesale_token');
    localStorage.removeItem('wholesale_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('wholesale_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithMobile,
        loginByRole,
        register,
        loginAdmin,
        loginShopOwner,
        registerShopOwner,
        loginDelivery,
        registerDelivery,
        logout,
        refreshUser,
        isSuperAdmin: user?.role === 'super_admin',
        isDelivery: user?.role === 'delivery',
        isBusinessMan: user?.role === 'business_man'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
