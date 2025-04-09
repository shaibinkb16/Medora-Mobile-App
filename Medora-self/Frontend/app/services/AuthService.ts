import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_URL = 'http://192.168.162.200:5000/api';

// Interfaces for Type Safety
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
}

// Create Axios Instance
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AuthService with Enhanced Functionality
const AuthService = {
  // Login Method
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await authAxios.post('/auth/login', credentials);
      
      // Store token and user data
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Register Method
  register: async (userData: RegisterCredentials) => {
    try {
      const response = await authAxios.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Google Sign-In Method
  googleSignIn: async (idToken: string) => {
    try {
      const response = await authAxios.post('/auth/google-auth', { idToken });
      
      // Store token and user data
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

      return response.data;
    } catch (error: any) {
      console.error('Google Sign-In error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout Method
  logout: async () => {
    try {
      // Clear stored data
      await AsyncStorage.multiRemove(['userToken', 'userData']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Get Current User Profile
  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await authAxios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update User Profile
  updateProfile: async (profileData: Partial<UserProfile>) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await authAxios.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update stored user data
      await AsyncStorage.setItem('userData', JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      console.error('Profile update error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Check Authentication Status
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await authAxios.post('/auth/refresh-token', 
        { token },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update stored token
      await AsyncStorage.setItem('userToken', response.data.token);

      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Password Reset
  forgotPassword: async (email: string) => {
    try {
      const response = await authAxios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await authAxios.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default AuthService;