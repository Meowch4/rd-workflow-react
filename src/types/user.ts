export type UserRole =
  | "PROJECT_MANAGER"
  | "DESIGNER"
  | "MECHANICAL_ENGINEER"
  | "ELECTRICAL_ENGINEER"
  | "QA";

export interface UserSummary {
  id: string;
  name: string;
  role: UserRole;
}
