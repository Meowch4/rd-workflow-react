import { createContext } from "react";
import type { UserSummary } from "../types/user";

export interface AuthContextValue {
  currentUser: UserSummary | null;
  signIn: (userId: string) => boolean;
  switchUser: (userId: string) => void;
  signOut: () => void;
}

// 创建一个 AuthContext，初始值为 undefined
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
