export interface UserSummary {
  id: string;
  name: string;
}

export interface AppOutletContext {
  currentUser: UserSummary;
}
