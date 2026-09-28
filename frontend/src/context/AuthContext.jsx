import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const DEFAULT_ACCOUNTS = [
  {
    name: 'Sarah Connor',
    email: 'commander@rescueflow.ai',
    password: 'admin',
    role: 'Operations Commander',
    department: 'Disaster Operations Command (HQ)',
    callsign: 'COMMAND-1',
    badge: 'EOC-7701',
  },
  {
    name: 'Alex Miller',
    email: 'supervisor@rescueflow.ai',
    password: 'admin',
    role: 'Tactical Supervisor',
    department: 'Metropolitan Fire & Rescue',
    callsign: 'ALPHA-2',
    badge: 'TAC-4520',
  },
  {
    name: 'Maya Lin',
    email: 'dispatcher@rescueflow.ai',
    password: 'admin',
    role: 'Field Dispatch Officer',
    department: 'Emergency Medical Services (EMS)',
    callsign: 'BRAVO-9',
    badge: 'DISP-8831',
  },
];

export function AuthProvider({ children }) {
  // Registered accounts stored in localStorage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('rescueflow_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed parsing registered users from storage');
      }
    }
    return DEFAULT_ACCOUNTS;
  });

  // Current logged in user
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rescueflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed parsing current user from storage');
      }
    }
    // Default to Sarah Connor for immediate ready state
    return DEFAULT_ACCOUNTS[0];
  });

  // Sync registered users to localStorage
  useEffect(() => {
    localStorage.setItem('rescueflow_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Login handler
  const login = useCallback((credentials) => {
    // 1. Direct object login (e.g. 1-click access)
    if (credentials.name && credentials.role && !credentials.email) {
      const userData = {
        name: credentials.name,
        role: credentials.role,
        department: credentials.department || 'Disaster Operations Command',
        callsign: credentials.callsign || 'COMMAND-1',
        badge: credentials.badge || `EOC-${Math.floor(1000 + Math.random() * 9000)}`,
        email: credentials.email || 'commander@rescueflow.ai'
      };
      setUser(userData);
      localStorage.setItem('rescueflow_user', JSON.stringify(userData));
      return { success: true, user: userData };
    }

    // 2. Email & Password credentials lookup
    const cleanEmail = (credentials.email || '').trim().toLowerCase();
    const cleanPass = (credentials.password || '').trim();

    const matched = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail || u.name.toLowerCase() === cleanEmail
    );

    if (!matched) {
      return { success: false, error: 'Tactical identifier or email not recognized in registry.' };
    }

    // Check password (allow 'admin' or match)
    if (matched.password && cleanPass !== matched.password && cleanPass !== 'admin') {
      return { success: false, error: 'Invalid security passcode for this operator.' };
    }

    const userData = {
      name: matched.name,
      role: credentials.overrideRole || matched.role,
      department: matched.department || 'Disaster Operations Command',
      callsign: matched.callsign || 'COMMAND-1',
      badge: matched.badge || `EOC-${Math.floor(1000 + Math.random() * 9000)}`,
      email: matched.email
    };

    setUser(userData);
    localStorage.setItem('rescueflow_user', JSON.stringify(userData));
    return { success: true, user: userData };
  }, [registeredUsers]);

  // Signup handler
  const signup = useCallback((payload) => {
    const cleanEmail = (payload.email || '').trim().toLowerCase();
    const cleanName = (payload.name || '').trim();
    const cleanPass = (payload.password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      return { success: false, error: 'Full name, email, and password are required.' };
    }

    // Check duplicate email
    const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An operator with this tactical email is already registered.' };
    }

    const newBadge = `EOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const callsignPrefix = payload.role?.includes('Commander') ? 'COMMAND' : payload.role?.includes('Supervisor') ? 'ALPHA' : 'BRAVO';
    const newCallsign = `${callsignPrefix}-${Math.floor(1 + Math.random() * 9)}`;

    const newUser = {
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: payload.role || 'Operations Commander',
      department: payload.department || 'National Disaster Response Force',
      callsign: newCallsign,
      badge: newBadge,
    };

    setRegisteredUsers(prev => [newUser, ...prev]);

    // Automatically sign in the newly registered user
    setUser(newUser);
    localStorage.setItem('rescueflow_user', JSON.stringify(newUser));

    return { success: true, user: newUser };
  }, [registeredUsers]);

  // Role switch handler
  const switchRole = useCallback((newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('rescueflow_user', JSON.stringify(updated));
  }, [user]);

  // Logout handler
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('rescueflow_user');
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      registeredUsers,
      login,
      signup,
      logout,
      switchRole,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
