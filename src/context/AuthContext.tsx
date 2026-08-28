import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { loginRequest, registerRequest } from '../api/authApi';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean; // true while restoring session from storage
  error: string | null;
}

type Action =
  | { type: 'RESTORE'; payload: { user: User | null; token: string | null } }
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'LOGOUT' };


const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, ...action.payload, isLoading: false };
    case 'AUTH_START':
      return { ...state, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'AUTH_ERROR':
      return { ...state, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isLoading: false };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On app launch, try to restore a previously saved session
  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('authUser'),
        ]);
        dispatch({
          type: 'RESTORE',
          payload: {
            token,
            user: userJson ? JSON.parse(userJson) : null,
          },
        });
      } catch {
        dispatch({ type: 'RESTORE', payload: { user: null, token: null } });
      }
    })();

    const sub = DeviceEventEmitter.addListener('onUnauthorized', () => {
      dispatch({ type: 'LOGOUT' });
    });

    return () => sub.remove();
  }, []);

  const persistSession = async (user: User, token: string) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('authUser', JSON.stringify(user));
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await loginRequest(email, password);
      await persistSession(user, token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (err: any) {
      dispatch({ type: 'AUTH_ERROR', payload: err.message });
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const { user, token } = await registerRequest(name, email, password);
      await persistSession(user, token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    } catch (err: any) {
      dispatch({ type: 'AUTH_ERROR', payload: err.message });
      throw err;
    }
  };

  const updateUser = async (user: User) => {
    await AsyncStorage.setItem('authUser', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'authUser']);
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => dispatch({ type: 'AUTH_ERROR', payload: '' });

  const value = useMemo(
    () => ({ ...state, login, register, updateUser, logout, clearError }),
    [state]
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
