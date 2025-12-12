import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  userId: string;
  email: string;
  givenName: string;
  familyName: string;
  planCount: number;
  subscriptionTier: string;
  preferences: {
    theme: 'light' | 'dark';
    currency: string;
    notifications: {
      email: boolean;
      milestones: boolean;
      reminders: boolean;
    };
  };
  stats: {
    totalPlans: number;
    completedPlans: number;
    totalSaved: number;
    totalTarget: number;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, givenName: string, familyName: string) => Promise<void>;
  confirmSignUp: (email: string, confirmationCode: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, confirmationCode: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check for existing session on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const tokens = getStoredTokens();
      if (tokens.accessToken && !isTokenExpired(tokens.accessToken)) {
        await loadUserProfile();
      } else {
        clearStoredTokens();
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
      clearStoredTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.getProfile`, {
        headers: {
          'Authorization': `Bearer ${getStoredTokens().accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.result?.data || data);
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      clearStoredTokens();
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.signIn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.result?.data?.success) {
        const tokens = data.result.data;
        storeTokens(tokens);
        await loadUserProfile();
      } else {
        throw new Error(data.error?.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, givenName: string, familyName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.signUp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, givenName, familyName }),
      });

      const data = await response.json();
      
      if (!data.result?.data?.success) {
        throw new Error(data.error?.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (email: string, confirmationCode: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.confirmSignUp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationCode }),
      });

      const data = await response.json();
      
      if (!data.result?.data?.success) {
        throw new Error(data.error?.message || 'Confirmation failed');
      }
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const tokens = getStoredTokens();
      
      if (tokens.accessToken) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.signOut`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      clearStoredTokens();
      setUser(null);
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.forgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.result?.data?.success) {
        throw new Error(data.error?.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const confirmForgotPassword = async (email: string, confirmationCode: string, newPassword: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.confirmForgotPassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationCode, newPassword }),
      });

      const data = await response.json();
      
      if (!data.result?.data?.success) {
        throw new Error(data.error?.message || 'Password reset confirmation failed');
      }
    } catch (error) {
      console.error('Confirm forgot password error:', error);
      throw error;
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.resendConfirmationCode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!data.result?.data?.success) {
        throw new Error(data.error?.message || 'Resend confirmation failed');
      }
    } catch (error) {
      console.error('Resend confirmation code error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/trpc/auth.updateProfile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getStoredTokens().accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (data.result?.data?.success) {
        await loadUserProfile(); // Refresh user data
      } else {
        throw new Error(data.error?.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (isAuthenticated) {
      await loadUserProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        forgotPassword,
        confirmForgotPassword,
        resendConfirmationCode,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Token management utilities
interface Tokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

function storeTokens(tokens: Tokens) {
  localStorage.setItem('auth_tokens', JSON.stringify({
    ...tokens,
    timestamp: Date.now(),
  }));
}

function getStoredTokens(): Partial<Tokens> {
  try {
    const stored = localStorage.getItem('auth_tokens');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function clearStoredTokens() {
  localStorage.removeItem('auth_tokens');
}

function isTokenExpired(token: string): boolean {
  try {
    let payload;
    
    // Check if it's a JWT (has dots) or demo token (base64 encoded JSON)
    if (token.includes('.')) {
      // JWT format
      payload = JSON.parse(atob(token.split('.')[1]));
    } else {
      // Demo token format (base64 encoded JSON)
      payload = JSON.parse(atob(token));
    }
    
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}