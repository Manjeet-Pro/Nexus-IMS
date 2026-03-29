import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the Context
const AuthContext = createContext();

// Custom hook to use the AuthContext easily across the app
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session when the app loads
    const authData = localStorage.getItem('nexus_auth_user');
    if (authData) {
      try {
        const data = JSON.parse(authData);
        setUser(data);
      } catch (e) {
        console.error("Auth context load error", e);
      }
    }
    setLoading(false);
  }, []);

  // Function to save user data upon successful login
  const login = (userData) => {
    localStorage.setItem('nexus_auth_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Function to clear session data upon logout
  const logout = () => {
    localStorage.removeItem('nexus_auth_user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
