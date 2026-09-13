import { useState, type ReactNode } from "react";
import { usersData } from "../mocks/currentUser";
import { AuthContext } from "./AuthContext";

const CURRENT_USER_STORAGE_KEY = "rd-workflow-current-user-id";

// 先从LocalStorgae中获取用户ID
// 如果没获取到就是null
function getStoredUserId() {
  const storedUserId = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  return usersData.some((user) => user.id === storedUserId)
    ? storedUserId
    : null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    getStoredUserId,
  );
  const currentUser =
    usersData.find((user) => user.id === currentUserId) ?? null;

  function updateCurrentUser(userId: string) {
    const userExists = usersData.some((user) => user.id === userId);
    if (!userExists) return false;

    localStorage.setItem(CURRENT_USER_STORAGE_KEY, userId);
    setCurrentUserId(userId);
    return true;
  }

  function switchUser(userId: string) {
    updateCurrentUser(userId);
  }

  function signOut() {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    setCurrentUserId(null);
  }

  return (
    <AuthContext
      value={{
        currentUser,
        signIn: updateCurrentUser,
        switchUser,
        signOut,
      }}
    >
      {children}
    </AuthContext>
  );
}
