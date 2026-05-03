import { Shell } from "@frontend/components/shell";
import { TaskManagementPageClient } from "@frontend/components/task-management-page-client";

export default function TaskManagementPage() {
  return (
    <Shell>
      <TaskManagementPageClient />
    </Shell>
  );
}
