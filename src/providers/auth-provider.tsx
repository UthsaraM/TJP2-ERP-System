import React, { createContext, useContext, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function HerculesAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default mock to true
  const [user, setUser] = useState<User | null>({
    id: "hrc_12345",
    name: "Admin User",
    email: "admin@textileplant.local",
    role: "Production Manager",
  });

  const login = () => {
    setIsAuthenticated(true);
    setUser({
      id: "hrc_12345",
      name: "Admin User",
      email: "admin@textileplant.local",
      role: "Production Manager",
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within HerculesAuthProvider");
  }
  return context;
};
