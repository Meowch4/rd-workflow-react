import type { UserSummary } from "../types/user";

export const usersData: UserSummary[] = [
  { id: "user-alice", name: "Alice Johnson", role: "PROJECT_MANAGER" },
  { id: "user-summer", name: "Summer Smith", role: "DESIGNER" },
  { id: "user-rick", name: "Rick Sanchez", role: "MECHANICAL_ENGINEER" },
  { id: "user-beth", name: "Beth Smith", role: "ELECTRICAL_ENGINEER" },
  { id: "user-jerry", name: "Jerry Smith", role: "QA" },
  { id: "user-morty", name: "Morty Smith", role: "DESIGNER" },
];

export const defaultCurrentUserId = "user-rick";
