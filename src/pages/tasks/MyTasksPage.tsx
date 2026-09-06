import { useOutletContext } from "react-router";
import type { AppOutletContext } from "../../types/user";

export default function MyTasksPage() {
  const { currentUser } = useOutletContext<AppOutletContext>();

  return (
    <section>
      <h1>My Tasks</h1>
      <p>查看和管理 {currentUser.name} 的任务。</p>
    </section>
  )
}
