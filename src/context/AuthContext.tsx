import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendLoginOtp: (email: string, password: string) => Promise<{ success: boolean; message: string; demoOtp: string }>;
  verifyLoginOtp: (email: string, otp: string) => Promise<void>;
  sendRegisterOtp: (data: { name: string; email: string; password: string; department: string; batch?: string; section?: string }) => Promise<{ success: boolean; message: string; demoOtp: string }>;
  verifyRegisterOtp: (data: { name: string; email: string; password: string; department: string; studentId?: string; batch?: string; section?: string; otp: string }) => Promise<void>;
  sendForgotOtp: (email: string) => Promise<{ success: boolean; message: string; demoOtp: string }>;
  resetPassword: (email: string, otp: string, newPass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; department: string; studentId?: string; batch?: string; section?: string; role?: string }) => Promise<void>;
  logout: () => void;
  loginAsDemoStudent: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('campusos_token');
    if (savedToken) {
      setToken(savedToken);
      api.getMe()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('campusos_token');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('campusos_token');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.success) {
      localStorage.setItem('campusos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
  };

  const sendLoginOtp = async (email: string, password: string) => {
    return await api.sendLoginOtp(email, password);
  };

  const verifyLoginOtp = async (email: string, otp: string) => {
    const res = await api.verifyLoginOtp(email, otp);
    if (res.success) {
      localStorage.setItem('campusos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
  };

  const sendRegisterOtp = async (data: { name: string; email: string; password: string; department: string; batch?: string; section?: string }) => {
    return await api.sendRegisterOtp(data);
  };

  const verifyRegisterOtp = async (data: { name: string; email: string; password: string; department: string; studentId?: string; batch?: string; section?: string; otp: string }) => {
    const res = await api.verifyRegisterOtp(data);
    if (res.success) {
      localStorage.setItem('campusos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
  };

  const sendForgotOtp = async (email: string) => {
    return await api.sendForgotOtp(email);
  };

  const resetPassword = async (email: string, otp: string, newPass: string) => {
    await api.resetPassword(email, otp, newPass);
  };

  const register = async (data: { name: string; email: string; password: string; department: string; studentId?: string; batch?: string; section?: string; role?: string }) => {
    const res = await api.register(data);
    if (res.success) {
      localStorage.setItem('campusos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campusos_token');
    setToken(null);
    setUser(null);
  };

  const loginAsDemoStudent = async () => {
    try {
      await login('student@cityuniversity.ac.bd', 'password123');
    } catch {
      try {
        await login('sahincontest@gmail.com', 'password123');
      } catch {
        // Fallback local mock user if offline
        const mock: User = {
          id: 'usr_student',
          name: 'City University Student',
          email: 'student@cityuniversity.ac.bd',
          role: 'STUDENT',
          department: 'Computer Science & Engineering',
          studentId: '213-15-4921',
          batch: '65',
          section: 'B',
          savedNotices: ['not_1', 'not_2'],
          savedExams: ['ex_1', 'ex_2'],
          savedResources: ['res_1'],
          rsvps: ['evt_1'],
        };
        setUser(mock);
      }
    }
  };

  const loginAsDemoAdmin = async () => {
    try {
      await login('admin@cityuniversity.ac.bd', 'admin123');
    } catch {
      try {
        await login('sahinfdr89@gmail.com', 'admin123');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success) setUser(res.user);
    } catch {
      // ignore
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin: user?.role === 'ADMIN',
        login,
        sendLoginOtp,
        verifyLoginOtp,
        sendRegisterOtp,
        verifyRegisterOtp,
        sendForgotOtp,
        resetPassword,
        register,
        logout,
        loginAsDemoStudent,
        loginAsDemoAdmin,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
