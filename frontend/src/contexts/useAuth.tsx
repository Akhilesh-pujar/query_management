import React, { createContext, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { authAtom } from '../recoil/authAtom';

interface AuthContextType {
  email: string | null;
  token: string | null;
  userType: string;
  login: (email: string, token: string, userType: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>('');
  const setAuthState = useSetRecoilState(authAtom);

  const login = (newEmail: string, newToken: string, newUserType: string) => {
    const formattedUserType = newUserType.toLowerCase();

    // Update local state
    setEmail(newEmail);
    setToken(newToken);
    setUserType(formattedUserType);

    // Update localStorage
    localStorage.setItem('email', newEmail);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userType', formattedUserType);

    // Update Recoil state
    setAuthState({
      isAuthenticated: true,
      userType: formattedUserType,
      token: newToken,
      email: newEmail,
    });
  };

  const logout = () => {
    // Clear local state
    setToken(null);
    setUserType('');
    setEmail(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('email');

    // Reset Recoil state
    setAuthState({
      isAuthenticated: false,
      userType: '',
      token: '',
      email: null,
    });
  };

  useEffect(() => {
    // Get stored values from localStorage
    const storedEmail = localStorage.getItem('email');
    const storedToken = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');

    if (storedEmail && storedToken && storedUserType) {
      // Update local state
      setEmail(storedEmail);
      setToken(storedToken);
      setUserType(storedUserType);

      // Update Recoil state
      setAuthState({
        isAuthenticated: true,
        userType: storedUserType,
        token: storedToken,
        email: storedEmail,
      });
    }
  }, [setAuthState]);

  return (
    <AuthContext.Provider value={{ email, token, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
