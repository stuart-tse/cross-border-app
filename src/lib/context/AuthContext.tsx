'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback } from 'react';
import { AuthUser as User } from '@/types/auth';
import { UserType } from '@prisma/client';
import { useHydration } from '@/lib/hooks/useHydration';

// Auth State Types
interface AuthState {
  user: User | null;
  selectedRole: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User; selectedRole?: UserType }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_SELECTED_ROLE'; payload: UserType };

// Auth Context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  switchRole: (role: UserType) => Promise<void>;
  getAvailableRoles: () => UserType[];
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  selectedRole: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      const userRoles = action.payload.roles?.map(r => r.role) || [];
      const selectedRole = action.selectedRole || userRoles[0] || UserType.CLIENT;
      return {
        ...state,
        user: action.payload,
        selectedRole,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        selectedRole: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_SELECTED_ROLE':
      return {
        ...state,
        selectedRole: action.payload,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hasHydrated = useHydration();

  const checkAuthStatus = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      // Always try to parse the response as JSON, regardless of status
      const data = await response.json();
      console.log('Auth check response:', { 
        status: response.status, 
        ok: response.ok,
        success: data.success, 
        hasData: !!data.data,
        error: data.error
      });
      
      if (response.ok && data.success && data.data) {
        const userRoles = data.data.roles?.map((r: any) => r.role) || [];
        // Use hydration-safe localStorage access
        const savedRole = hasHydrated ? localStorage.getItem('selectedRole') as UserType : null;
        const selectedRole = (savedRole && userRoles.includes(savedRole)) ? savedRole : userRoles[0] || UserType.CLIENT;
        
        console.log('Auth success - setting user:', { 
          userId: data.data.id, 
          selectedRole, 
          availableRoles: userRoles 
        });
        
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data, selectedRole });
      } else {
        console.log('Auth check failed - logging out user:', {
          responseOk: response.ok,
          dataSuccess: data.success,
          hasData: !!data.data,
          errorCode: data.error?.code
        });
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, []); // No dependencies needed

  // Check authentication status on mount only once
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Include checkAuthStatus in dependencies

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, selectedRole: UserType.CLIENT }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userRoles = data.data.user.roles?.map((r: any) => r.role) || [];
        const selectedRole = userRoles[0] || UserType.CLIENT;
        if (hasHydrated) {
          localStorage.setItem('selectedRole', selectedRole);
        }
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user, selectedRole });
        
        // Redirect based on selected role
        redirectToDashboard(selectedRole);
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: data.error?.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error. Please try again.' });
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userRoles = data.data.user.roles?.map((r: any) => r.role) || [];
        const selectedRole = userRoles[0] || UserType.CLIENT;
        if (hasHydrated) {
          localStorage.setItem('selectedRole', selectedRole);
        }
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data.user, selectedRole });
        
        // Redirect based on selected role
        redirectToDashboard(selectedRole);
      } else {
        dispatch({ type: 'AUTH_ERROR', payload: data.error?.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error. Please try again.' });
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (hasHydrated) {
        localStorage.removeItem('selectedRole');
        window.location.href = '/';
      }
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const switchRole = async (role: UserType) => {
    if (!state.user) {
      throw new Error('User not authenticated');
    }

    const userRoles = state.user.roles?.map(r => r.role) || [];
    if (!userRoles.includes(role)) {
      throw new Error('User does not have this role');
    }

    try {
      // Save selected role to localStorage (client-side only)
      if (hasHydrated) {
        localStorage.setItem('selectedRole', role);
      }
      
      // Update the selected role in state
      dispatch({ type: 'SET_SELECTED_ROLE', payload: role });
      
      // Redirect to appropriate dashboard
      redirectToDashboard(role);
    } catch (error) {
      console.error('Role switch failed:', error);
      throw error;
    }
  };

  const getAvailableRoles = (): UserType[] => {
    if (!state.user) return [];
    return state.user.roles?.map(r => r.role) || [];
  };

  const redirectToDashboard = (userType: UserType) => {
    if (hasHydrated) {
      const routes: Record<UserType, string> = {
        [UserType.CLIENT]: '/dashboard/client',
        [UserType.DRIVER]: '/dashboard/driver', 
        [UserType.BLOG_EDITOR]: '/dashboard/editor',
        [UserType.ADMIN]: '/dashboard/admin',
      };
      
      window.location.href = routes[userType] || '/dashboard/client';
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    switchRole,
    getAvailableRoles,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route HOC
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedUserTypes?: UserType[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [hasInitialized, setHasInitialized] = useState(false);
    const hasHydrated = useHydration();

    // Handle initialization and redirects in useEffect with proper dependencies
    useEffect(() => {
      if (isLoading) {
        return; // Still loading, don't do anything
      }

      if (!hasInitialized) {
        setHasInitialized(true);
        
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          if (hasHydrated) {
            window.location.href = '/login';
          }
          return;
        }
        
        // If authenticated but doesn't have required role, show access denied
        if (allowedUserTypes && user) {
          const userRoles = user.roles?.map(r => r.role) || [];
          const hasAllowedRole = allowedUserTypes.some(allowedType => 
            userRoles.includes(allowedType)
          );
          
          if (!hasAllowedRole) {
            // For unauthorized users, we'll show the access denied message
            // rather than redirecting to avoid infinite loops
            return;
          }
        }
      }
    }, [isLoading, isAuthenticated, user?.id, allowedUserTypes, hasInitialized]);

    // Show loading spinner while checking authentication or initializing
    if (isLoading || !hasInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-hot-pink"></div>
        </div>
      );
    }

    // If not authenticated, show nothing (redirect will happen in useEffect)
    if (!isAuthenticated) {
      return null;
    }

    // Check role authorization if user is authenticated
    if (allowedUserTypes && user) {
      const userRoles = user.roles?.map(r => r.role) || [];
      const hasAllowedRole = allowedUserTypes.some(allowedType => 
        userRoles.includes(allowedType)
      );
      
      if (!hasAllowedRole) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-charcoal mb-4">Access Denied</h1>
              <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
            </div>
          </div>
        );
      }
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };
}