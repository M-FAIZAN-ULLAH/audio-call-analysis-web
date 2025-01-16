// import React, { createContext, useState, useContext } from "react";

// // Create the context
// const UserContext = createContext();

// // Create a provider component
// export const UserProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const isAuthenticated = !!currentUser;

//   return (
//     <UserContext.Provider
//       value={{ currentUser, setCurrentUser, isAuthenticated }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// };

// // Custom hook to use the UserContext
// export const useUser = () => {
//   return useContext(UserContext);
// };

import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Check if we are in a browser environment
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("currentUser");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null; // Default to null if not in the browser
  });

  const isAuthenticated = !!currentUser;

  useEffect(() => {
    // Only interact with localStorage on the client side
    if (typeof window !== "undefined") {
      if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("currentUser");
      }
    }
  }, [currentUser]);

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
