import { MyTasksClient } from "@frontend/components/my-tasks-client";
import { Shell } from "@frontend/components/shell";

export default function TasksPage() {
  return (
    <Shell>
      <MyTasksClient />
    </Shell>
  );
}
