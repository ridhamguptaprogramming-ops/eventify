import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, FirebaseUser } from '../lib/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  isVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: user.email === 'ridham.gupta.programming@gmail.com' ? 'admin' : 'user',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      try {
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile({
            ...fallbackProfile,
            ...(userDoc.data() as Partial<UserProfile>),
          });
        } else {
          await setDoc(userDocRef, fallbackProfile);
          setProfile(fallbackProfile);
        }
      } catch (error) {
        console.error('Failed to load user profile from Firestore:', error);
        // Keep auth usable even when Firestore rules/config fail.
        setProfile(fallbackProfile);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin: profile?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};
