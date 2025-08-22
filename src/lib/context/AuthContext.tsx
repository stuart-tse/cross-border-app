'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState, useCallback, useRef } from 'react';
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
      const userRoles = action.payload.roles?.map(r => typeof r === 'string' ? r : r.role) || [];
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
      
      // Get NextAuth session directly (no need for API calls)
      const sessionData = await getSession();
      
      console.log('Auth check - NextAuth session:', {
        hasUser: !!sessionData?.user,
        selectedRole: sessionData?.user?.selectedRole
      });
      
      if (sessionData?.user) {
        const userRoles = sessionData.user.roles || [];
        
        // Use NextAuth session selectedRole if available, otherwise fall back to localStorage/default
        let selectedRole = sessionData.user.selectedRole;
        if (!selectedRole || !userRoles.includes(selectedRole)) {
          const savedRole = localStorage.getItem('selectedRole') as UserType;
          selectedRole = (savedRole && userRoles.includes(savedRole)) ? savedRole : userRoles[0] || UserType.CLIENT;
        }
        
        console.log('Auth success - setting user from NextAuth:', { 
          userId: sessionData.user.id, 
          selectedRole, 
          sessionRole: sessionData.user.selectedRole,
          availableRoles: userRoles 
        });
        
        // Create AuthUser object from NextAuth session
        const authUser: User = {
          id: sessionData.user.id,
          email: sessionData.user.email,
          name: sessionData.user.name,
          avatar: sessionData.user.image,
          isVerified: sessionData.user.isVerified,
          isActive: true, // Assume active if authenticated
          roles: userRoles.map(role => ({
            id: `role-${role}`,
            role,
            isActive: true,
            assignedAt: new Date(),
          })),
          userType: selectedRole,
          selectedRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        dispatch({ type: 'AUTH_SUCCESS', payload: authUser, selectedRole });
      } else {
        console.log('Auth check failed - no NextAuth session');
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'LOGOUT' });
    }
  }, []); // Remove all dependencies to prevent infinite loop

  // Check authentication status on mount only once
  useEffect(() => {
    if (hasHydrated) {
      checkAuthStatus();
    }
  }, [hasHydrated]); // Only run when hydrated to prevent SSR issues

  // Sync with NextAuth session changes - Use useRef to avoid infinite loops
  const lastSyncRef = useRef({ sessionUserId: '', selectedRole: '', isAuthenticated: false });
  
  const syncWithSession = useCallback(() => {
    if (!hasHydrated || !session) return; // Prevent SSR and empty session issues
    
    const currentSessionUserId = session?.user?.id || '';
    const currentSelectedRole = session?.user?.selectedRole || '';
    const currentIsAuthenticated = state.isAuthenticated;
    
    // Only sync if something actually changed
    const hasChanges = 
      lastSyncRef.current.sessionUserId !== currentSessionUserId ||
      lastSyncRef.current.selectedRole !== currentSelectedRole ||
      lastSyncRef.current.isAuthenticated !== currentIsAuthenticated;
    
    if (!hasChanges) return;
    
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
    
    // Update ref to prevent future unnecessary syncs
    lastSyncRef.current = {
      sessionUserId: currentSessionUserId,
      selectedRole: currentSelectedRole,
      isAuthenticated: currentIsAuthenticated,
    };
  }, [session?.user?.id, session?.user?.selectedRole, state.isAuthenticated, state.selectedRole, state.user?.id, hasHydrated]);

  useEffect(() => {
    syncWithSession();
  }, [syncWithSession]);

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
        
        // Get the updated session from NextAuth
        const sessionData = await getSession();
        
        if (sessionData?.user) {
          const userRoles = sessionData.user.roles || [];
          const selectedRole = sessionData.user.selectedRole || userRoles[0] || UserType.CLIENT;
          
          console.log('✅ Setting user data from NextAuth session:', { 
            userId: sessionData.user.id, 
            selectedRole,
            availableRoles: userRoles 
          });
          
          if (hasHydrated) {
            localStorage.setItem('selectedRole', selectedRole);
          }
          
          // Create AuthUser object from NextAuth session
          const authUser: User = {
            id: sessionData.user.id,
            email: sessionData.user.email,
            name: sessionData.user.name,
            avatar: sessionData.user.image,
            isVerified: sessionData.user.isVerified,
            isActive: true, // Assume active if authenticated
            roles: userRoles.map(role => ({
              id: `role-${role}`,
              role,
              isActive: true,
              assignedAt: new Date(),
            })),
            userType: selectedRole,
            selectedRole,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          dispatch({ type: 'AUTH_SUCCESS', payload: authUser, selectedRole });
          
          // Redirect based on selected role
          redirectToDashboard(selectedRole);
        } else {
          console.error('❌ Failed to get NextAuth session after login');
          dispatch({ type: 'AUTH_ERROR', payload: 'Failed to establish session. Please try again.' });
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
      console.log('📝 Starting NextAuth v5 registration process for:', userData.email);

      // TODO: Implement proper user registration through NextAuth v5
      // For now, show error message to use proper registration flow
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: 'Registration functionality needs to be implemented with NextAuth v5. Please contact support.' 
      });
      
      console.warn('⚠️ Registration endpoint needs to be reimplemented for NextAuth v5');
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: 'Registration system is being updated. Please try again later.' });
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

    const userRoles = state.user.roles?.map(r => typeof r === 'string' ? r : r.role) || [];
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
        
        // Wait longer and verify session is actually updated before redirecting
        console.log('⏳ Waiting for session to fully propagate...');
        let attempts = 0;
        const maxAttempts = 10; // Maximum 5 seconds
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms each attempt
          
          // Check if the session has been updated
          const currentSession = await getSession();
          if (currentSession?.user?.selectedRole === role) {
            console.log('✅ Session verification successful, proceeding with redirect');
            break;
          }
          
          attempts++;
          console.log(`🔄 Session not yet updated (attempt ${attempts}/${maxAttempts}), waiting...`);
        }
        
        if (attempts >= maxAttempts) {
          console.warn('⚠️ Session update verification timed out, proceeding with redirect anyway');
        }
        
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
    return state.user.roles?.map(r => typeof r === 'string' ? r : r.role) || [];
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
      if (isLoading || hasInitialized) {
        return; // Still loading or already initialized, don't do anything
      }

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
        const userRoles = user.roles?.map(r => typeof r === 'string' ? r : r.role) || [];
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
    }, [isLoading, isAuthenticated, user?.id, hasInitialized, hasHydrated]); // Removed allowedUserTypes to prevent re-running on prop changes

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
      const userRoles = user.roles?.map(r => typeof r === 'string' ? r : r.role) || [];
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