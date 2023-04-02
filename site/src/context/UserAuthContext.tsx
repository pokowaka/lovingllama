import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  User,
  UserCredential,
  inMemoryPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../config/firebase";

interface UserAuthContextValue {
  user: User | null;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  forgot: (email: string) => Promise<void>;
  googleSignIn: () => Promise<UserCredential>;
}

// This should enable us to use simple login..
const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');


const userAuthContext = createContext<UserAuthContextValue | undefined>(
  undefined
);


export function UserAuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  async function  logIn(email: string, password: string) {
    await setPersistence(auth, browserSessionPersistence)
    return signInWithEmailAndPassword(auth, email, password);
  }
  function signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  function logOut() {
    return signOut(auth);
  }

  async function googleSignIn() {
    await setPersistence(auth, browserSessionPersistence)
    return signInWithPopup(auth, provider);
  }

  function forgot(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth: ", currentUser);
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);



  const value: UserAuthContextValue = {
    user,
    logIn,
    signUp,
    logOut,
    forgot,
    googleSignIn,
  };

  return (
    <userAuthContext.Provider value={value}>
      {children}
    </userAuthContext.Provider>
  );
}

export function   useUserAuth() {
  const context = useContext(userAuthContext);
  if (context === undefined) {
    throw new Error(
      "useUserAuth must be used within a UserAuthContextProvider"
    );
  }
  return context;
}
