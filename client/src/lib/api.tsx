import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase, Profile } from './supabase';
import { Session, User } from '@supabase/supabase-js';

// Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Token refresh function
  const refreshToken = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Token refresh error:', error);
        // Force logout if refresh fails
        await logout();
        return false;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session ? convertUserData(data.session.user) : null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh exception:', error);
      return false;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session ? convertUserData(session.user) : null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session ? convertUserData(session.user) : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Set up auto refresh before token expiration
  useEffect(() => {
    if (!session) return;

    // Calculate when to refresh (5 minutes before expiration)
    const expiresAt = new Date(session.expires_at * 1000);
    const refreshTime = expiresAt.getTime() - (5 * 60 * 1000);
    const timeUntilRefresh = refreshTime - Date.now();

    if (timeUntilRefresh <= 0) {
      // Refresh immediately if token is about to expire
      refreshToken();
      return;
    }

    // Set up timer to refresh token
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [session]);

  // Convert Supabase user to app user format
  const convertUserData = async (supabaseUser: User): Promise<AuthUser> => {
    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
      avatar: profile?.avatar_url
    };
  };

  // Create or update user profile
  const upsertProfile = async (userId: string, name: string) => {
    // Create avatar URL from name
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    // Insert or update profile
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name,
        avatar_url: avatar
      });

    if (error) throw error;
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        setUser(await convertUserData(data.user));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        await upsertProfile(data.user.id, name);

        // Set user data
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Create context value
  const value = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// API Base URL for non-Supabase endpoints
const API_BASE_URL = '/api';

// API client for making requests to custom endpoints
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  // Get session token for auth
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    (config.headers as any).Authorization = `Bearer ${data.session.access_token}`;
  }

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
}