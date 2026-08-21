import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db/storage';
import { Customer, User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  activeCustomer: Customer | null;
  isAuthenticated: boolean;
  login: (username: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  loginAsDemo: (role: UserRole, username?: string) => void;
  refreshData: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAndroidFrame: boolean;
  toggleAndroidFrame: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('tz_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('tz_dark_mode') === 'true';
  });
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem('tz_android_frame');
    return saved !== null ? saved === 'true' : true; // default enabled for mobile preview
  });

  const refreshData = () => {
    if (currentUser) {
      const users = db.getUsers();
      const updated = users.find((u) => u.id === currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem('tz_current_user', JSON.stringify(updated));
        if (updated.role === 'customer' && updated.customerId) {
          const cust = db.getCustomerById(updated.customerId);
          setActiveCustomer(cust || null);
        }
      }
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'customer' && currentUser.customerId) {
      const cust = db.getCustomerById(currentUser.customerId);
      setActiveCustomer(cust || null);
    } else {
      setActiveCustomer(null);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tz_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tz_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleAndroidFrame = () => {
    setIsAndroidFrame((prev) => {
      const next = !prev;
      localStorage.setItem('tz_android_frame', String(next));
      return next;
    });
  };

  const login = (username: string, password?: string): { success: boolean; error?: string } => {
    const trimmed = username.trim().toLowerCase();
    const users = db.getUsers();

    // Check by username, customerId, or mobile number
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === trimmed ||
        u.mobile === trimmed ||
        (u.customerId && u.customerId.toLowerCase() === trimmed)
    );

    if (!user) {
      return { success: false, error: 'User not found with matching username or ID.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'This account has been deactivated. Please contact Trade Zone Admin.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Invalid password. Please try again.' };
    }

    user.lastLogin = new Date().toISOString();
    db.saveUser(user);
    db.logAudit({
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      performedBy: user.username,
      details: `${user.role.toUpperCase()} user ${user.name} logged in successfully`,
    });

    setCurrentUser(user);
    localStorage.setItem('tz_current_user', JSON.stringify(user));

    if (user.role === 'customer' && user.customerId) {
      const cust = db.getCustomerById(user.customerId);
      setActiveCustomer(cust || null);
    }

    return { success: true };
  };

  const loginAsDemo = (role: UserRole, targetUsername?: string) => {
    if (role === 'admin') {
      login('admin', 'password123');
    } else {
      const username = targetUsername || 'rajesh';
      login(username, 'password123');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveCustomer(null);
    localStorage.removeItem('tz_current_user');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeCustomer,
        isAuthenticated: !!currentUser,
        login,
        logout,
        loginAsDemo,
        refreshData,
        isDarkMode,
        toggleDarkMode,
        isAndroidFrame,
        toggleAndroidFrame,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
