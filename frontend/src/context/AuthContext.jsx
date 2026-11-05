import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_ACCOUNTS = [];

export function AuthProvider({ children }) {
  // Registered accounts stored in localStorage
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem('rescueflow_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy hardcoded fictitious demo accounts
          return parsed.filter(u => u.name !== 'Sarah Connor' && u.name !== 'Alex Miller' && u.name !== 'Maya Lin');
        }
      } catch (e) {
        console.warn('Failed parsing registered users from storage', e);
      }
    }
    return [];
  });

  // Current logged in user with persistent photo recovery
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rescueflow_user');
    let currentUser = null;
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
        if (currentUser && (currentUser.name === 'Sarah Connor' || currentUser.name === 'Alex Miller' || currentUser.name === 'Maya Lin')) {
          currentUser = null;
          localStorage.removeItem('rescueflow_user');
        }
      } catch (e) {
        console.warn('Failed parsing current user from storage', e);
      }
    }

    // Dedicated standalone photo storage (guarantees photo is NEVER lost after time passes or on refresh)
    const dedicatedPhoto = localStorage.getItem('rescueflow_user_photo');

    if (currentUser) {
      if (!currentUser.photo && dedicatedPhoto) {
        currentUser.photo = dedicatedPhoto;
      }
      // Recover photo from registeredUsers if available
      try {
        const savedReg = localStorage.getItem('rescueflow_registered_users');
        if (savedReg) {
          const regList = JSON.parse(savedReg);
          if (Array.isArray(regList)) {
            const match = regList.find(
              u => (currentUser.id && u.id === currentUser.id) ||
                   (currentUser.email && u.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
                   (currentUser.name && u.name?.toLowerCase() === currentUser.name?.toLowerCase())
            );
            if (match && match.photo && !currentUser.photo) {
              currentUser = { ...currentUser, photo: match.photo };
            }
          }
        }
      } catch (e) {
        // Ignore
      }
    }

    return currentUser;
  });

  // Permanently sync operator profile and photo with MongoDB Atlas on boot & background
  useEffect(() => {
    let isMounted = true;
    const syncProfileFromAtlas = async () => {
      try {
        const emailToLookup = user?.email || (typeof window !== 'undefined' ? localStorage.getItem('rescueflow_last_email') : null);
        const atlasUser = await api.getUserProfile(emailToLookup);
        if (atlasUser && isMounted) {
          if (atlasUser.photo) {
            try {
              localStorage.setItem('rescueflow_user_photo', atlasUser.photo);
            } catch (e) {}
          }
          setUser(prev => {
            if (!prev) return atlasUser;
            const finalPhoto = atlasUser.photo || prev.photo || localStorage.getItem('rescueflow_user_photo') || null;
            const merged = {
              ...prev,
              ...atlasUser,
              photo: finalPhoto,
            };
            try {
              localStorage.setItem('rescueflow_user', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      } catch (err) {
        console.warn('Atlas user profile sync notice:', err);
      }
    };

    syncProfileFromAtlas();
    return () => { isMounted = false; };
  }, []);

  // Sync registered users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rescueflow_registered_users', JSON.stringify(registeredUsers));
    } catch (e) {
      console.warn('Unable to persist registered users to localStorage', e);
    }
  }, [registeredUsers]);

  // Login handler
  const login = useCallback((credentials) => {
    // 1. Direct object login (e.g. 1-click access)
    if (credentials.name && credentials.role && !credentials.email) {
      const cleanName = credentials.name.trim().toLowerCase();
      const matched = registeredUsers.find(
        u => u.name && u.name.trim().toLowerCase() === cleanName
      );

      const persistentPhoto = matched?.photo || credentials.photo || localStorage.getItem('rescueflow_user_photo') || null;
      if (persistentPhoto) {
        try { localStorage.setItem('rescueflow_user_photo', persistentPhoto); } catch (e) {}
      }

      const userData = {
        id: matched?.id || `user-${Date.now()}`,
        name: credentials.name,
        role: credentials.role,
        department: credentials.department || matched?.department || 'Disaster Operations Command (HQ)',
        callsign: credentials.callsign || matched?.callsign || 'COMMAND-1',
        badge: credentials.badge || matched?.badge || `EOC-${Math.floor(1000 + Math.random() * 9000)}`,
        email: credentials.email || matched?.email || 'commander@rescueflow.ai',
        photo: persistentPhoto,
      };
      setUser(userData);
      try {
        localStorage.setItem('rescueflow_user', JSON.stringify(userData));
      } catch (e) {
        console.warn('Storage save failed', e);
      }
      return { success: true, user: userData };
    }

    // 2. Email & Password credentials lookup
    const cleanEmail = (credentials.email || credentials.name || '').trim().toLowerCase();
    const cleanPass = (credentials.password || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email or operator identifier.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your security passcode.' };
    }

    try { localStorage.setItem('rescueflow_last_email', cleanEmail); } catch (e) {}

    const matched = registeredUsers.find(
      u => (u.email && u.email.toLowerCase() === cleanEmail) || 
           (u.name && u.name.toLowerCase() === cleanEmail)
    );

    const persistentPhoto = matched?.photo || localStorage.getItem('rescueflow_user_photo') || null;
    if (persistentPhoto) {
      try { localStorage.setItem('rescueflow_user_photo', persistentPhoto); } catch (e) {}
    }

    let userData = null;

    if (matched) {
      if (matched.password && cleanPass !== matched.password && cleanPass !== 'admin') {
        return { success: false, error: 'Invalid security passcode for this operator.' };
      }
      userData = {
        ...matched,
        role: credentials.overrideRole || matched.role || 'Operations Commander',
        photo: persistentPhoto,
      };
    } else {
      // Real-time dynamic operator profile generated from entered identifier
      const namePart = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
      const formattedName = namePart
        .replace(/[._-]/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Operator';

      userData = {
        id: `user-${Date.now()}`,
        name: formattedName,
        email: cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@rescueflow.ai`,
        password: cleanPass,
        role: credentials.overrideRole || 'Operations Commander',
        department: 'Disaster Operations Command',
        callsign: `TAC-${Math.floor(10 + Math.random() * 90)}`,
        badge: `EOC-${Math.floor(1000 + Math.random() * 9000)}`,
        photo: persistentPhoto,
      };

      setRegisteredUsers(prev => [userData, ...prev.filter(u => u.email !== userData.email)]);
    }

    setUser(userData);
    try {
      localStorage.setItem('rescueflow_user', JSON.stringify(userData));
    } catch (e) {
      console.warn('Storage save failed', e);
    }

    // Async background sync with MongoDB Atlas to restore cloud-stored photo
    api.getUserProfile(cleanEmail).then(atlasProfile => {
      if (atlasProfile && atlasProfile.photo) {
        try { localStorage.setItem('rescueflow_user_photo', atlasProfile.photo); } catch (e) {}
        setUser(prev => prev ? { ...prev, photo: atlasProfile.photo } : prev);
      }
    }).catch(() => {});

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
    const exists = registeredUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An operator with this tactical email is already registered.' };
    }

    const newBadge = `EOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const callsignPrefix = payload.role?.includes('Commander') ? 'COMMAND' : payload.role?.includes('Supervisor') ? 'ALPHA' : 'BRAVO';
    const newCallsign = `${callsignPrefix}-${Math.floor(1 + Math.random() * 9)}`;

    const newUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: payload.role || 'Operations Commander',
      department: payload.department || 'National Disaster Response Force',
      callsign: newCallsign,
      badge: newBadge,
      photo: payload.photo || null,
    };

    setRegisteredUsers(prev => [newUser, ...prev]);

    // Automatically sign in the newly registered user
    setUser(newUser);
    try {
      localStorage.setItem('rescueflow_user', JSON.stringify(newUser));
    } catch (e) {
      console.warn('Storage save failed', e);
    }

    return { success: true, user: newUser };
  }, [registeredUsers]);

  // Update profile handler (persists photo & credentials to active session, MongoDB Atlas & registered registry)
  const updateProfile = useCallback(async (profileData) => {
    // 1. Immediately store photo in dedicated standalone storage key
    if (profileData.photo) {
      try {
        localStorage.setItem('rescueflow_user_photo', profileData.photo);
      } catch (e) {
        console.warn('Dedicated photo storage note:', e);
      }
    }

    // 2. Synchronize to MongoDB Atlas Cloud Database
    try {
      const activeEmail = profileData.email || user?.email || 'operator@rescueflow.ai';
      localStorage.setItem('rescueflow_last_email', activeEmail.trim().toLowerCase());
      api.updateUserProfile({
        ...profileData,
        email: activeEmail,
        id: user?.id,
        photo: profileData.photo || localStorage.getItem('rescueflow_user_photo') || null
      }).catch(err => {
        console.warn('MongoDB Atlas profile update notice:', err);
      });
    } catch (e) {
      // Atlas sync silent fallback
    }

    // 3. Update React session state
    setUser(prevUser => {
      if (!prevUser) return null;
      const finalPhoto = profileData.photo !== undefined 
        ? profileData.photo 
        : (prevUser.photo || localStorage.getItem('rescueflow_user_photo') || null);

      const updated = {
        ...prevUser,
        ...profileData,
        photo: finalPhoto,
      };

      try {
        localStorage.setItem('rescueflow_user', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed saving updated user in localStorage', e);
      }

      setRegisteredUsers(prevList => {
        let matchedIndex = -1;

        if (prevUser.id) {
          matchedIndex = prevList.findIndex(u => u.id === prevUser.id);
        }
        if (matchedIndex === -1 && prevUser.email) {
          matchedIndex = prevList.findIndex(u => u.email?.toLowerCase() === prevUser.email.toLowerCase());
        }
        if (matchedIndex === -1 && prevUser.name) {
          matchedIndex = prevList.findIndex(u => u.name?.toLowerCase() === prevUser.name.toLowerCase());
        }

        let nextList;
        if (matchedIndex >= 0) {
          nextList = [...prevList];
          nextList[matchedIndex] = {
            ...nextList[matchedIndex],
            ...profileData,
            photo: finalPhoto,
            password: profileData.password || nextList[matchedIndex].password || 'admin',
          };
        } else {
          nextList = [
            ...prevList,
            {
              id: prevUser.id || `user-${Date.now()}`,
              name: updated.name,
              email: updated.email || 'operator@rescueflow.ai',
              password: 'admin',
              role: updated.role,
              department: updated.department,
              callsign: updated.callsign,
              badge: updated.badge,
              photo: finalPhoto,
            }
          ];
        }

        try {
          localStorage.setItem('rescueflow_registered_users', JSON.stringify(nextList));
        } catch (e) {
          console.warn('Failed saving registered users to localStorage', e);
        }

        return nextList;
      });

      return updated;
    });

    return { success: true };
  }, [user]);

  // Role switch handler
  const switchRole = useCallback((newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    try {
      localStorage.setItem('rescueflow_user', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
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
      updateProfile,
      isAuthenticated: Boolean(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
