import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Create a context to expose the current authenticated user throughout
// the component tree.
const AuthContext = createContext();

/**
 * Custom hook to access the AuthContext.
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Provides authentication state to its children.  It listens for changes
 * in Firebase authentication and updates the context accordingly.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};