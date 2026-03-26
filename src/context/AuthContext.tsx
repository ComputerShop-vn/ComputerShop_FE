import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services/authService';
import { UserInfo } from '../api/types/auth';

interface User {
  email: string;
  role: 'admin' | 'staff' | 'user';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userInfo = await authService.getCurrentUser();
          if (userInfo) {
            setUser({
              email: userInfo.email,
              role: (userInfo.role?.toLowerCase() as 'admin' | 'staff' | 'user') || 'user',
              name: userInfo.name || userInfo.email.split('@')[0],
            });
          } else {
            // getCurrentUser trả null = token invalid, clear luôn
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error: any) {
        console.error('Failed to load user:', error);
        // Chỉ clear token nếu là lỗi 401/403 (token thực sự invalid)
        // Không clear nếu là lỗi network (500, timeout...)
        const code = error?.code;
        if (code === 401 || code === 403 || code === 1006 || code === 1005) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
        // Nếu lỗi network, giữ token để user không bị đăng xuất
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      console.log('AuthContext - login response:', response);
      
      // Nếu có token thì coi như thành công
      if (response.token) {
        // Lấy role thực từ introspect trước khi set user
        const userInfo = await authService.getCurrentUser();
        console.log('AuthContext - user info from introspect:', userInfo);
        
        if (userInfo) {
          // Map backend roles to frontend roles
          let mappedRole: 'admin' | 'staff' | 'user' = 'user';
          const backendRole = userInfo.role?.toUpperCase();
          
          if (backendRole === 'ADMIN') {
            mappedRole = 'admin';
          } else if (backendRole === 'STAFF') {
            mappedRole = 'staff';
          } else {
            mappedRole = 'user'; // MEMBER or any other role
          }
          
          const newUser: User = {
            email: userInfo.email,
            role: mappedRole,
            name: userInfo.name || userInfo.email.split('@')[0],
          };
          setUser(newUser);
          console.log('AuthContext - user set with real role:', newUser);
          return; // Success
        }
        
        throw new Error('Failed to get user info from token');
      }
      throw new Error('Authentication failed - no token');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      const response = await authService.googleLogin(idToken);
      if (response.token) {
        const userInfo = await authService.getCurrentUser();
        if (userInfo) {
          let mappedRole: 'admin' | 'staff' | 'user' = 'user';
          const backendRole = userInfo.role?.toUpperCase();
          if (backendRole === 'ADMIN') mappedRole = 'admin';
          else if (backendRole === 'STAFF') mappedRole = 'staff';
          setUser({
            email: userInfo.email,
            role: mappedRole,
            name: userInfo.name || userInfo.email.split('@')[0],
          });
          return;
        }
      }
      throw new Error('Google login failed');
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
