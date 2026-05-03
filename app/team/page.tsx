"use client";

import { Shell } from "../../frontend/components/shell";
import { useEffect, useState } from "react";

type TeamMember = {
id: string;
name: string;
email: string;
role?: string;
projectCount?: number;
taskCount?: number;
};

type TeamData = {
members: TeamMember[];
totalMembers: number;
totalProjects: number;
totalTasks: number;
};

export function TeamPageClient() {
const [data, setData] = useState<TeamData | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [searchTerm, setSearchTerm] = useState("");

async function loadData() {
try {
setLoading(true);

```
  const res = await fetch("/api/dashboard");
  if (!res.ok) throw new Error("Failed to load data");

  const json = await res.json();

  const membersMap = new Map<string, TeamMember>();

  if (json.tasksPerUser) {
    json.tasksPerUser.forEach(
      (user: { userId: string; name: string; count: number }) => {
        membersMap.set(user.userId, {
          id: user.userId,
          name: user.name,
          email: "",
          taskCount: user.count,
          projectCount: 0,
        });
      }
    );
  }

  setData({
    members: Array.from(membersMap.values()),
    totalMembers: membersMap.size,
    totalProjects: json.projects?.length || 0,
    totalTasks: json.stats?.totalTasks || 0,
  });
} catch (err: unknown) {
  setError(err instanceof Error ? err.message : String(err));
} finally {
  setLoading(false);
}
```

}

useEffect(() => {
loadData();
}, []);

if (error) return <div className="p-6 text-red-600">{error}</div>;
if (loading) return <div className="p-6">Loading...</div>;
if (!data) return <div className="p-6">No data</div>;

return ( <div className="p-6"> <h1 className="text-2xl font-bold">Team</h1> <p>Total Members: {data.totalMembers}</p> </div>
);
}

export default function TeamPage() {
return ( <Shell> <TeamPageClient /> </Shell>
);
}
