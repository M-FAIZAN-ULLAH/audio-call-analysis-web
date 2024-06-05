import React, { createContext, useState, useContext } from "react";

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const isAuthenticated = !!currentUser;

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, isAuthenticated }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
