import { DashboardClient } from "@frontend/components/dashboard-client";
import { Shell } from "@frontend/components/shell";

export default function DashboardPage() {
  return (
    <Shell>
      <DashboardClient />
    </Shell>
  );
}
