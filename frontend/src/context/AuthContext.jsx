import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rescueflow_user');
    return saved ? JSON.parse(saved) : {
      name: 'Sarah Connor',
      role: 'Operations Commander',
      callsign: 'COMMAND-1',
      badge: 'EOC-7701'
    };
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('rescueflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rescueflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
