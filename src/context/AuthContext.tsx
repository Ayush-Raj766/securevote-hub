import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "admin" | "subadmin" | "voter";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  walletAddress: string;
  aadhaarId: string;
  isApproved: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  aadhaarId: string;
  role: "admin" | "voter";
  walletAddress: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "admin-1",
    fullName: "Admin User",
    email: "admin@blockvote.io",
    role: "admin",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    aadhaarId: "1234-5678-9012",
    isApproved: true,
    password: "Admin@123",
  },
  {
    id: "voter-1",
    fullName: "Voter User",
    email: "voter@blockvote.io",
    role: "voter",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    aadhaarId: "9876-5432-1098",
    isApproved: true,
    password: "Voter@123",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("bv_token");
    const savedUser = localStorage.getItem("bv_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");
    const mockToken = `jwt_${found.id}_${Date.now()}`;
    const { password: _, ...userData } = found;
    setUser(userData);
    setToken(mockToken);
    localStorage.setItem("bv_token", mockToken);
    localStorage.setItem("bv_user", JSON.stringify(userData));
    setIsLoading(false);
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (MOCK_USERS.find((u) => u.email === data.email)) {
      setIsLoading(false);
      throw new Error("Email already registered");
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      walletAddress: data.walletAddress,
      aadhaarId: data.aadhaarId,
      isApproved: data.role === "admin",
    };
    MOCK_USERS.push({ ...newUser, password: data.password });
    const mockToken = `jwt_${newUser.id}_${Date.now()}`;
    setUser(newUser);
    setToken(mockToken);
    localStorage.setItem("bv_token", mockToken);
    localStorage.setItem("bv_user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bv_token");
    localStorage.removeItem("bv_user");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
