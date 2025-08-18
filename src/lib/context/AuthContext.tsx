'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback } from 'react';
import { AuthUser as User } from '@/types/auth';
import { UserType } from '@prisma/client';
import { useHydration } from '@/lib/hooks/useHydration';
import { useSession, getSession, signOut, signIn } from 'next-auth/react';

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
  const { data: session, update } = useSession();

  const checkAuthStatus = useCallback(async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Get both NextAuth session and user data
      const [sessionResponse, userResponse] = await Promise.all([
        fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
        }),
        fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })
      ]);

      const sessionData = await sessionResponse.json();
      const userData = await userResponse.json();
      
      console.log('Auth check - session:', sessionData?.user?.selectedRole);
      console.log('Auth check - user data:', { 
        success: userData.success, 
        hasData: !!userData.data
      });
      
      if (sessionData?.user && userData.success && userData.data) {
        const userRoles = userData.data.roles?.map((r: any) => r.role) || [];
        
        // Use NextAuth session selectedRole if available, otherwise fall back to localStorage/default
        let selectedRole = sessionData.user.selectedRole;
        if (!selectedRole || !userRoles.includes(selectedRole)) {
          const savedRole = hasHydrated ? localStorage.getItem('selectedRole') as UserType : null;
          selectedRole = (savedRole && userRoles.includes(savedRole)) ? savedRole : userRoles[0] || UserType.CLIENT;
        }
        
        console.log('Auth success - setting user:', { 
          userId: userData.data.id, 
          selectedRole, 
          sessionRole: sessionData.user.selectedRole,
          availableRoles: userRoles 
        });
        
        dispatch({ type: 'AUTH_SUCCESS', payload: userData.data, selectedRole });
      } else {
        console.log('Auth check failed - logging out user');
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, [hasHydrated]); // Add hasHydrated as dependency

  // Check authentication status on mount only once
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Include checkAuthStatus in dependencies

  // Sync with NextAuth session changes
  useEffect(() => {
    if (session?.user && state.user) {
      // If the session has a different selectedRole than our state, update it
      if (session.user.selectedRole && session.user.selectedRole !== state.selectedRole) {
        console.log('🔄 Syncing selectedRole from NextAuth session:', session.user.selectedRole);
        dispatch({ type: 'SET_SELECTED_ROLE', payload: session.user.selectedRole });
      }
    } else if (!session?.user && state.isAuthenticated) {
      // NextAuth session is gone but our state still shows authenticated
      // This can happen during logout - clear our state
      console.log('🔄 NextAuth session cleared, clearing local state...');
      dispatch({ type: 'LOGOUT' });
      if (hasHydrated) {
        localStorage.removeItem('selectedRole');
      }
    }
  }, [session?.user, state.isAuthenticated, state.selectedRole, state.user, hasHydrated]);

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('🔐 Starting login process for:', email);

      // Use NextAuth credentials provider for login
      const result = await signIn('credentials', {
        email,
        password,
        selectedRole: UserType.CLIENT,
        redirect: false, // Handle redirect manually
      });

      console.log('🔐 NextAuth signIn result:', result);

      if (result?.error) {
        console.error('❌ Login failed:', result.error);
        dispatch({ type: 'AUTH_ERROR', payload: result.error || 'Login failed' });
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log('✅ Login successful, fetching session data...');
        
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the updated session and user data
        const [sessionData, userResponse] = await Promise.all([
          getSession(),
          fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          })
        ]);

        const userData = await userResponse.json();
        
        if (sessionData?.user && userData.success && userData.data) {
          const userRoles = userData.data.roles?.map((r: any) => r.role) || [];
          const selectedRole = sessionData.user.selectedRole || userRoles[0] || UserType.CLIENT;
          
          console.log('✅ Setting user data:', { 
            userId: userData.data.id, 
            selectedRole,
            sessionRole: sessionData.user.selectedRole,
            availableRoles: userRoles 
          });
          
          if (hasHydrated) {
            localStorage.setItem('selectedRole', selectedRole);
          }
          
          dispatch({ type: 'AUTH_SUCCESS', payload: userData.data, selectedRole });
          
          // Redirect based on selected role
          redirectToDashboard(selectedRole);
        } else {
          console.error('❌ Failed to fetch user data after successful login');
          dispatch({ type: 'AUTH_ERROR', payload: 'Failed to load user data. Please try again.' });
        }
      } else {
        console.error('❌ Login failed: Unknown error');
        dispatch({ type: 'AUTH_ERROR', payload: 'Login failed. Please check your credentials.' });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Network error. Please try again.' });
      throw error; // Re-throw so LoginForm can handle it
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      console.log('📝 Starting registration process for:', userData.email);

      // First create the account via the registration endpoint
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
        console.log('✅ Registration successful, logging in...');
        
        // After successful registration, log the user in via NextAuth
        const loginResult = await signIn('credentials', {
          email: userData.email,
          password: userData.password,
          selectedRole: UserType.CLIENT,
          redirect: false,
        });

        if (loginResult?.ok) {
          // Wait for session establishment
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Get session and user data
          const [sessionData, userResponse] = await Promise.all([
            getSession(),
            fetch('/api/auth/me', {
              method: 'GET',
              credentials: 'include',
            })
          ]);

          const updatedUserData = await userResponse.json();
          
          if (sessionData?.user && updatedUserData.success && updatedUserData.data) {
            const userRoles = updatedUserData.data.roles?.map((r: any) => r.role) || [];
            const selectedRole = sessionData.user.selectedRole || userRoles[0] || UserType.CLIENT;
            
            if (hasHydrated) {
              localStorage.setItem('selectedRole', selectedRole);
            }
            
            dispatch({ type: 'AUTH_SUCCESS', payload: updatedUserData.data, selectedRole });
            
            // Redirect based on selected role
            redirectToDashboard(selectedRole);
          } else {
            dispatch({ type: 'AUTH_ERROR', payload: 'Registration successful but login failed. Please log in manually.' });
          }
        } else {
          dispatch({ type: 'AUTH_ERROR', payload: 'Registration successful but login failed. Please log in manually.' });
        }
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
      console.log('🚪 Starting logout process...');
      
      // Step 1: Clear local state first
      dispatch({ type: 'LOGOUT' });
      
      // Step 2: Clear localStorage
      if (hasHydrated) {
        localStorage.removeItem('selectedRole');
        console.log('💾 Cleared localStorage');
      }
      
      // Step 3: Call NextAuth signOut to clear session cookies
      console.log('🔐 Calling NextAuth signOut...');
      await signOut({ 
        redirect: false,  // We'll handle redirect manually
        callbackUrl: '/' 
      });
      console.log('✅ NextAuth signOut completed');
      
      // Step 4: Call custom logout endpoint for any additional cleanup
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('🧹 Custom logout endpoint called');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, clear local state
      dispatch({ type: 'LOGOUT' });
      if (hasHydrated) {
        localStorage.removeItem('selectedRole');
      }
    } finally {
      // Step 5: Redirect to home page
      if (hasHydrated) {
        console.log('🏠 Redirecting to home page...');
        window.location.href = '/';
      }
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
      console.log('🔄 Starting role switch to:', role);
      
      // Save selected role to localStorage (client-side only)
      if (hasHydrated) {
        localStorage.setItem('selectedRole', role);
        console.log('💾 Saved role to localStorage:', role);
      }
      
      // Update the selected role in state
      dispatch({ type: 'SET_SELECTED_ROLE', payload: role });
      console.log('📝 Updated local state with role:', role);
      
      // Update NextAuth session with new role
      if (update) {
        console.log('🔐 Updating NextAuth session with role:', role);
        await update({ selectedRole: role });
        console.log('✅ NextAuth session updated successfully');
        
        // Force a re-check of auth status to get the updated session
        await new Promise(resolve => setTimeout(resolve, 100));
        await checkAuthStatus();
        
        // Redirect to appropriate dashboard
        console.log('🚀 Redirecting to dashboard for role:', role);
        redirectToDashboard(role);
      } else {
        console.warn('⚠️ NextAuth update function not available');
        // Fallback: just redirect based on the role
        redirectToDashboard(role);
      }
    } catch (error) {
      console.error('❌ Role switch failed:', error);
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
      
      const targetRoute = routes[userType] || '/dashboard/client';
      console.log('🧭 Redirecting to:', targetRoute);
      
      // Use a full page reload to ensure middleware processes the new session
      window.location.href = targetRoute;
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
        
        // If authenticated but doesn't have required role, redirect to appropriate dashboard
        if (allowedUserTypes && user) {
          const userRoles = user.roles?.map(r => r.role) || [];
          const hasAllowedRole = allowedUserTypes.some(allowedType => 
            userRoles.includes(allowedType)
          );
          
          if (!hasAllowedRole && hasHydrated) {
            // Redirect to the appropriate dashboard for user's current selected role
            const routes: Record<UserType, string> = {
              [UserType.CLIENT]: '/dashboard/client',
              [UserType.DRIVER]: '/dashboard/driver', 
              [UserType.BLOG_EDITOR]: '/dashboard/editor',
              [UserType.ADMIN]: '/dashboard/admin',
            };
            
            // Get the user's current selected role, fallback to first available role
            const currentSelectedRole = user.selectedRole || userRoles[0] || UserType.CLIENT;
            const targetRoute = routes[currentSelectedRole] || '/dashboard/client';
            
            console.log('🚫 Unauthorized access attempt.');
            console.log('🧭 User roles:', userRoles);
            console.log('🔒 Required roles:', allowedUserTypes);
            console.log('👤 Current selected role:', currentSelectedRole);
            console.log('🔄 Redirecting to:', targetRoute);
            
            window.location.href = targetRoute;
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