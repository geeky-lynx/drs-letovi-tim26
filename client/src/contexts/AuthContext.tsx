import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode, FC } from "react";
import { storage } from "../helpers/Storage";
import { authHelpers } from "../helpers/Auth";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  role: any;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(storage.getUser());

  useEffect(() => {
    if (!user && storage.getToken()) {
      authHelpers.getProfile()
        .then((res) => {
          setUser(res.data);
          storage.setUser(res.data);
        })
        .catch((error) => {
          console.error('Invalid token:', error);
          storage.removeToken();
          storage.removeUser();
        });
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const res = await authHelpers.login({ email, password });
      storage.setToken(res.data.token);
      storage.setUser(res.data.user);
      setUser(res.data.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Greška pri prijavljivanju';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await authHelpers.register(userData);
      storage.setToken(res.data.token);
      storage.setUser(res.data.user);
      setUser(res.data.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Greška pri registraciji';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authHelpers.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storage.removeToken();
      storage.removeUser();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        role: user?.role,
        login, 
        register,
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
};




