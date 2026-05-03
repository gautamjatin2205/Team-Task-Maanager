import { Shell } from "../../frontend/components/shell";
import { MyTasksClient } from "../../frontend/components/my-tasks-client";

export default function TaskManagementPage() {
  return (
    <Shell>
      <MyTasksClient />
    </Shell>
  );
}