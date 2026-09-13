import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function useAuth() {
  // useContext(AuthContext) 用于访问 AuthContext 中的值
  const context = useContext(AuthContext);

  // 如果读不到说明没被AuthContext包裹
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
