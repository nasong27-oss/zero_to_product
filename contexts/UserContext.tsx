"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserInfo {
  name: string;
  isParticipant: boolean;
  teamNumber: number | null;
}

interface UserContextType {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hackathon_user");
    if (stored) {
      try {
        setUserState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("hackathon_user");
      }
    }
  }, []);

  const setUser = (u: UserInfo | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("hackathon_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("hackathon_user");
    }
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
