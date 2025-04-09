/* // store/authContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { useRouter } from 'expo-router';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  token: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // Handle non-JSON response or error status
        const errorText = await response.text();
        console.error('Login error:', errorText);
        alert('Login failed. Please check your credentials.');
        return;
      }

      const data = await response.json();
      setToken(data.token);
      setIsAuthenticated(true);
      router.replace('/(tabs)'); // Navigate to the home page
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login.');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Please log in.');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const signOut = () => {
    setToken(null);
    setIsAuthenticated(false);
    router.replace('/(auth)/login'); // Navigate back to login on sign out
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; */
import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender?: 'Male' | 'Female' | 'Other';
  profileImageUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: { name: string; email: string; password: string; phoneNumber?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const API_URL = 'http://192.168.162.200:5000/api';

const authAxios = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  googleSignIn: async () => {},
  updateProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [request] = Google.useAuthRequest({
    clientId: '960591176297-kjpvuu63b7un26rf13uqknronh95hi2l.apps.googleusercontent.com',
  });

  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: UserProfile | null;
    token: string | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, user] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData'),
        ]);

        if (token && user) {
          const isValid = await verifyToken(token);
          if (isValid) {
            authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setState({
              isAuthenticated: true,
              user: JSON.parse(user),
              token,
              isLoading: false,
            });
            return;
          }
        }

        await handleCleanup();
      } catch (error) {
        console.error('Auth initialization error:', error);
        await handleCleanup();
      }
    };

    initializeAuth();
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const res = await authAxios.get('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status === 200;
    } catch {
      return false;
    }
  };

  const handleCleanup = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    delete authAxios.defaults.headers.common['Authorization'];
    setState({ isAuthenticated: false, user: null, token: null, isLoading: false });
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await authAxios.post('/auth/login', { email, password });

      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

      authAxios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      setState({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });

      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      await handleCleanup();
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'An error occurred',
      });
    }
  };

  const signUp = async (userData: { name: string; email: string; password: string; phoneNumber?: string }) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await authAxios.post('/auth/register', userData);
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Please verify your email',
      });
      router.push('/(auth)/login');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'An error occurred',
      });
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    try {
      await handleCleanup();
      Toast.show({
        type: 'info',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully',
      });
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const googleSignIn = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const result = await WebBrowser.openAuthSessionAsync(
        request?.url || '',
        'your-redirect-uri' // Replace with actual redirect URI
      );

      if (result.type === 'success') {
        const code = new URLSearchParams(result.url?.split('?')[1]).get('code');

        const response = await authAxios.post('/auth/google-auth', { code });

        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

        authAxios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        setState({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
        });

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome via Google!',
        });

        router.replace('/(tabs)');
      }
    } catch (error: any) {
      await handleCleanup();
      Toast.show({
        type: 'error',
        text1: 'Google Sign-In Failed',
        text2: error.response?.data?.message || 'An error occurred',
      });
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await authAxios.put('/auth/profile', profileData);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      setState((prev) => ({ ...prev, user: response.data, isLoading: false }));

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || 'An error occurred',
      });
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        googleSignIn,
        updateProfile,
      }}
    >
      {children}
      <Toast />
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

export default AuthProvider;
