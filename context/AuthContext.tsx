import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export type ViewMode = 'WORKER' | 'ADVERTISER';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  isAdmin: boolean;
  viewMode: ViewMode;
  toggleViewMode: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('WORKER');

  useEffect(() => {
    const storedUser = localStorage.getItem('tr_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const storedMode = localStorage.getItem('tr_view_mode');
    if (storedMode === 'ADVERTISER') {
        setViewMode('ADVERTISER');
    }
    setIsLoading(false);
  }, []);

  // REAL-TIME BAN CHECK POLLING
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
        const storedUserStr = localStorage.getItem('tr_current_user');
        if (storedUserStr) {
            const currentUser = JSON.parse(storedUserStr);
            const allUsers = JSON.parse(localStorage.getItem('tr_users') || '[]');
            const freshUser = allUsers.find((u: any) => u.id === currentUser.id);
            
            if (freshUser) {
                // Check if user got BANNED in the background
                if (freshUser.status === 'BANNED') {
                    logout();
                    alert('Your account has been banned. Contact support.');
                } 
                // Sync other updates (like balance)
                else if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
                    setUser(freshUser);
                    localStorage.setItem('tr_current_user', JSON.stringify(freshUser));
                }
            }
        }
    }, 1000); // 1 second poll for instant feedback

    return () => clearInterval(interval);
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tr_current_user');
    setViewMode('WORKER');
    localStorage.removeItem('tr_view_mode');
    window.location.hash = '#/login';
  };

  const handleSetUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('tr_current_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('tr_current_user');
    }
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'WORKER' ? 'ADVERTISER' : 'WORKER';
    setViewMode(newMode);
    localStorage.setItem('tr_view_mode', newMode);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser: handleSetUser,
      isAuthenticated: !!user,
      isLoading,
      logout,
      isAdmin: user?.role === UserRole.ADMIN,
      viewMode,
      toggleViewMode
    }}>
      {children}
    </AuthContext.Provider>
  );
};