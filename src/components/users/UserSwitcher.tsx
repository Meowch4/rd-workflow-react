import type { UserSummary } from "../../types/user";

interface UserSwitcherProps {
  users: UserSummary[];
  currentUserId: string;
  onUserChange: (userId: string) => void;
}

export default function UserSwitcher({
  users,
  currentUserId,
  onUserChange,
}: UserSwitcherProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      Current user
      <select
        aria-label="Current user"
        value={currentUserId}
        onChange={(event) => onUserChange(event.currentTarget.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </label>
  );
}
