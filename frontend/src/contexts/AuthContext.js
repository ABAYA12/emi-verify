import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  requiresVerification: false,
  verificationEmail: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        requiresVerification: false,
        verificationEmail: null,
      };
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'REQUIRE_VERIFICATION':
      return {
        ...state,
        requiresVerification: true,
        verificationEmail: action.payload.email,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'VERIFICATION_COMPLETE':
      return {
        ...state,
        requiresVerification: false,
        verificationEmail: null,
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const tokens = JSON.parse(localStorage.getItem('auth_tokens'));
        if (tokens?.accessToken) {
          // Set authorization header
          setAuthHeader(tokens.accessToken);
          
          // Try to get user profile
          const response = await apiService.auth.getProfile();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.data.user,
              tokens: tokens,
            },
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('auth_tokens');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  const setAuthHeader = (token) => {
    if (token) {
      apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiService.defaults.headers.common['Authorization'];
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiService.auth.signup(userData);
      
      if (response.data.success) {
        dispatch({
          type: 'REQUIRE_VERIFICATION',
          payload: { email: userData.email },
        });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed' };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await apiService.auth.verifyEmail({ email, code });
      
      if (response.data.success) {
        dispatch({ type: 'VERIFICATION_COMPLETE' });
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Verification failed' };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await apiService.auth.resendVerification({ email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend code' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiService.auth.login({ email, password });
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        
        // Store tokens
        localStorage.setItem('auth_tokens', JSON.stringify(tokens));
        setAuthHeader(tokens.accessToken);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, tokens },
        });
      }
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.requiresVerification) {
        dispatch({
          type: 'REQUIRE_VERIFICATION',
          payload: { email: errorData.email },
        });
      }
      
      throw errorData || { message: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_tokens');
      setAuthHeader(null);
      dispatch({ type: 'LOGOUT' });
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await apiService.auth.forgotPassword({ email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await apiService.auth.resetPassword({ token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  };

  const value = {
    ...state,
    signup,
    verifyEmail,
    resendVerification,
    login,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
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

export default AuthContext;
