import React, { createContext, useState, useEffect, useContext } from 'react';
import { signInUser, signUpUser, getUserProfile } from '../data/services/authService';

const AuthContext = createContext();

const mapUserProfile = (profile) => {
  const email = profile.email;
  const localAvatar = localStorage.getItem(`pq_avatar_${email}`);
  return {
    email: profile.email,
    name: profile.name || profile.full_name || profile.email,
    role: profile.role || 'member',
    avatar: localAvatar || (profile.name || profile.full_name || profile.email)[0]?.toUpperCase() || 'U',
  };
};

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('pq_admin_session');
    if (savedUser) {
      setAdminUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const saveSession = (user) => {
    setAdminUser(user);
    localStorage.setItem('pq_admin_session', JSON.stringify(user));
  };

  const login = async (email, password) => {
    const { data, error } = await signInUser(email, password);
    if (error) {
      return { success: false, message: error.message || 'Erreur de connexion.' };
    }

    const emailToFetch = data?.user?.email || email;
    const profileRes = await getUserProfile(emailToFetch);
    if (profileRes.error) {
      return { success: false, message: 'Impossible de charger le profil.' };
    }

    const user = mapUserProfile(profileRes.data);
    saveSession(user);
    
    return { success: true, role: user.role }; 
  };

  const register = async (name, email, password) => {
    const { data, error } = await signUpUser(name, email, password);
    if (error) {
      return { success: false, message: error.message || 'Erreur d’inscription.' };
    }

    const profileRes = await getUserProfile(email);
    const user = mapUserProfile(profileRes.data);
    saveSession(user);
    
    return { success: true, role: user.role };
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('pq_admin_session');
  };

  return (
    <AuthContext.Provider value={{ adminUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);