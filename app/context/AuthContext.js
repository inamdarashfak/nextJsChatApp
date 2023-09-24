import { createContext, useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});
  const [currentUserDetails, setCurrentUserDetails] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        getDoc(doc(db, "users", user?.uid))
          .then((res) => {
            setCurrentUserDetails(res.data());
            localStorage.setItem("fireUserDetails", JSON.stringify(res.data()));
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    });

    return () => {
      unsub();
    };
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, currentUserDetails }}>
      {children}
    </AuthContext.Provider>
  );
};
